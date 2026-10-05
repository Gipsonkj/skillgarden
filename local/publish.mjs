// Publish approved skill changes from the app's data to GitHub.
//
// The app keeps each super skill in topics/<id> (content = SKILL.md, files = its other text files).
// The plugin and the connector read superskills/<id>/ on GitHub main. Both sides change: Review adds
// to the app, and hand edits land in superskills/. So publishing merges three ways, file by file:
// base = the version the app last took from disk (topic.publishedVersion, or the newest "superskill"
// version from the import), mine = the app now, theirs = the folder now. Then it regenerates the
// planner's craft map, runs the repo checks, commits only superskills/ and planner/ and pushes main,
// and finally takes the merged folder back into the app so both sides match.
// The person starts it from the app (that click is their approval); nothing here runs on a schedule.
// The same click carries the plugin's skill list: the skills switched off in the app (settings/main.pluginOff)
// leave the "skills" list in .claude-plugin/marketplace.json, which is all Claude Code lists to the model.
//
// Only SKILL.md, CREDITS.md and references/**.md are written: the same files the scout may change.
// topic.json only gets Review's source changes (repos, searches, feeds) and tool-list changes (tools),
// each replayed once.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "superskills");
const PATHS = ["superskills", "planner"];
const WRITABLE = (p) => (p === "SKILL.md" || p === "CREDITS.md" || /^references\/[\w./-]+\.md$/.test(p)) && !p.split("/").includes("..");
const REPO_OK = /^[\w.-]+\/[\w.-]+$/;
const MARKET = path.join(ROOT, ".claude-plugin", "marketplace.json");
const SKILL_ROOTS = ["superskills", "chains", "planner", "tools"];

const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null);
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const run = (cmd, a) => execFileSync(cmd, a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 180000 });
const errText = (e) => String((e.stderr || "") + (e.stdout || "") || e.message).trim().split("\n").slice(-6).join("\n");

// Line-level three-way merge with git. Returns the merged text, or null when both sides edited the same lines.
function merge3(theirs, base, mine) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sg-merge-"));
  const f = (n, s) => { const p = path.join(tmp, n); fs.writeFileSync(p, s); return p; };
  try { return execFileSync("git", ["merge-file", "-p", f("theirs", theirs), f("base", base), f("mine", mine)], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { return null; }
  finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

// The skill as the app last took it from disk: SKILL.md plus files (a version without files kept the ones before it).
function baseOf(store, t) {
  const vs = Object.values(store.versions).filter((v) => v.topicId === t.id && Number.isInteger(Number(v.version))).sort((a, b) => a.version - b.version);
  const at = t.publishedVersion != null ? vs.findIndex((v) => Number(v.version) === Number(t.publishedVersion)) : vs.map((v) => v.source).lastIndexOf("superskill");
  if (at < 0) return null;
  let files = null;
  for (let k = at; k >= 0 && !files; k--) files = vs[k].files || null;
  return { content: vs[at].content || "", files: files || {} };
}

// Review's source and tool-list changes not yet in topic.json (and revoked ones that were), applied to
// its repos/searches/feeds and tools.
function sourcesFor(store, t, meta) {
  const cands = Object.entries(store.candidates).filter(([, c]) => c.topicId === t.id && (c.kind === "sources" || c.kind === "toollist") &&
    (c.status === "merged" && !c.published || c.status === "revoked" && c.published && !c.revokePublished));
  if (!cands.length) return null;
  const out = { repos: [...(meta.repos || [])], searches: [...(meta.searches || [])], feeds: [...(meta.feeds || [])], tools: (meta.tools || []).map((x) => ({ ...x })) };
  const lower = (x) => String(x).toLowerCase();
  for (const [, c] of cands) {
    if (c.kind === "toollist") { out.tools = toolsEdit(out.tools, c.toolsPatch || {}, c.status === "revoked"); continue; }
    const p = c.sourcesPatch || {}, undo = c.status === "revoked";
    const arr = (k) => (Array.isArray(p[k]) ? p[k] : []).map((x) => String(x).trim()).filter(Boolean);
    for (const [k, list] of [["Repos", "repos"], ["Searches", "searches"], ["Feeds", "feeds"]]) {
      const add = arr((undo ? "drop" : "add") + k).filter((x) => list !== "repos" || REPO_OK.test(x)), drop = new Set(arr((undo ? "add" : "drop") + k).map(lower));
      out[list] = out[list].filter((x) => !drop.has(lower(x)));
      for (const x of add) if (!out[list].some((y) => lower(y) === lower(x))) out[list].push(x);
    }
  }
  if (!meta.tools && !out.tools.length) delete out.tools;
  return { ids: cands.map(([id]) => id), text: JSON.stringify({ ...meta, ...out }, null, 2) + "\n" };
}
// Same rules as toolsEdit in skill-garden.html: add new tools (name, tier, https docs), change tiers;
// undo takes the added tools out and puts each changed tier back to `from`.
function toolsEdit(list, p, undo) {
  const key = (x) => String(x || "").trim().toLowerCase(), https = (u) => /^https:\/\//.test(String(u || ""));
  const add = (Array.isArray(p.add) ? p.add : []).filter((x) => x && x.name && ["major", "minor"].includes(x.tier) && https(x.docs));
  const retier = (Array.isArray(p.retier) ? p.retier : []).filter((x) => x && x.name && ["major", "minor"].includes(x.tier));
  let tools = list;
  if (undo) {
    const gone = new Set(add.map((x) => key(x.name)));
    tools = tools.filter((x) => !gone.has(key(x.name)));
    for (const r of retier) for (const x of tools) if (key(x.name) === key(r.name) && r.from) x.tier = r.from;
  } else {
    for (const a of add) if (!tools.some((x) => key(x.name) === key(a.name))) tools.push({ name: a.name, aliases: Array.isArray(a.aliases) ? a.aliases : [], tier: a.tier, kind: a.kind || null, docs: a.docs, why: a.why || "" });
    for (const r of retier) for (const x of tools) if (key(x.name) === key(r.name)) x.tier = r.tier;
  }
  return tools;
}

// What publishing a topic would do. writes/removes come from the app; takeIn means the folder has edits the app lacks.
function planTopic(store, t) {
  const dir = path.join(DIR, t.id);
  if (!fs.existsSync(path.join(dir, "SKILL.md"))) return null;
  const base = baseOf(store, t);
  if (!base) return { id: t.id, name: t.name || t.id, version: t.version, writes: [], removes: [], conflicts: ["(no imported version to compare with)"], takeIn: false };
  const mineAll = { "SKILL.md": t.content || "", ...(t.files || {}) }, baseAll = { "SKILL.md": base.content, ...base.files };
  const writes = [], removes = [], conflicts = [];
  let takeIn = false;
  for (const p of new Set([...Object.keys(mineAll), ...Object.keys(baseAll)])) {
    if (!WRITABLE(p)) continue;
    const norm = (s) => (s == null || s === "" ? null : s); // "" in the app means removed
    const mine = norm(mineAll[p]), b = norm(baseAll[p]), theirs = read(path.join(dir, p));
    if (mine === theirs) continue;
    if (mine === b) { takeIn = true; continue; } // only the folder changed
    if (theirs === b) { if (mine === null) removes.push(p); else writes.push([p, mine]); continue; }
    const merged = mine !== null && theirs !== null && b !== null ? merge3(theirs, b, mine) : null;
    if (merged === null) conflicts.push(p);
    else { writes.push([p, merged]); if (merged !== mine) takeIn = true; }
  }
  const metaFile = path.join(dir, "topic.json");
  const src = sourcesFor(store, t, JSON.parse(read(metaFile) || "{}"));
  if (src && src.text !== read(metaFile)) writes.push(["topic.json", src.text]);
  return { id: t.id, name: t.name || t.id, version: t.version, writes, removes, conflicts, takeIn, sourceIds: src ? src.ids : [] };
}

// Every skill the plugin can list, and the "skills" list it should have: whole folders while every skill is on
// (as before), each switched-on skill's own folder once any is off. Switched-off folders still ship with the
// plugin, so superseed and the chains can read them; Claude Code just doesn't list them.
export function pluginEntries() {
  return SKILL_ROOTS.flatMap((g) => {
    const d = path.join(ROOT, g);
    return fs.existsSync(d) ? fs.readdirSync(d).filter((id) => fs.existsSync(path.join(d, id, "SKILL.md"))).sort().map((id) => ({ id, group: g })) : [];
  });
}
export function pluginPlan(store) {
  const off = new Set(((store.settings || {}).main || {}).pluginOff || []);
  const entries = pluginEntries();
  const want = entries.some((e) => off.has(e.id)) ? entries.filter((e) => !off.has(e.id)).map((e) => `./${e.group}/${e.id}/`) : SKILL_ROOTS.map((g) => `./${g}/`);
  const now = read(MARKET) || "";
  const text = now.replace(/"skills": \[[^\]]*\]/, `"skills": [${want.map((s) => JSON.stringify(s)).join(", ")}]`);
  return { entries, off: entries.filter((e) => off.has(e.id)).map((e) => e.id), changed: text !== now, text };
}

export function plan(store) {
  return Object.entries(store.topics).filter(([id]) => /^[a-z0-9-]+$/.test(id)).map(([id, t]) => planTopic(store, { ...t, id })).filter(Boolean);
}
// The short form the app shows (saved in settings/main.publish so the online admin page sees it too).
export function summary(list, store) {
  const pl = store ? pluginPlan(store) : null;
  const files = (c) => [...c.writes.map(([p]) => p), ...c.removes.map((p) => p + " (removed)")];
  return {
    skills: list.filter((c) => !c.conflicts.length && (c.writes.length || c.removes.length)).map((c) => ({ id: c.id, name: c.name, version: c.version, files: files(c) })),
    conflicts: list.filter((c) => c.conflicts.length).map((c) => ({ id: c.id, name: c.name, files: c.conflicts })),
    takeIn: list.filter((c) => !c.conflicts.length && c.takeIn).map((c) => c.id),
    unpushed: unpushed(),
    plugin: pl && { entries: pl.entries, off: pl.off, changed: pl.changed },
  };
}
function unpushed() {
  try { return Number(git("rev-list", "--count", "origin/main..main")) || 0; } catch { return 0; }
}

// Put the folder's SKILL.md and guides into the app as a new version where they differ, and remember it as the new base.
function takeIntoApp(store, write, c, now) {
  const t = store.topics[c.id], dir = path.join(DIR, c.id);
  const content = read(path.join(dir, "SKILL.md")) || t.content || "";
  const files = { ...(t.files || {}) };
  for (const p of new Set([...Object.keys(files), ...listGuides(dir)])) if (WRITABLE(p) && p !== "SKILL.md") files[p] = read(path.join(dir, p)) ?? "";
  let version = Number(t.version) || 0;
  if (content !== t.content || JSON.stringify(files) !== JSON.stringify(t.files || {})) {
    version += 1;
    write("set", "versions", `${c.id}--v${version}`, { topicId: c.id, version, content, files, summary: "Took in edits made in superskills/ on disk", source: "superskill", createdAt: now });
    write("update", "topics", c.id, { version, content, files, updatedAt: now, publishedVersion: version });
  } else write("update", "topics", c.id, { publishedVersion: version });
  for (const id of c.sourceIds || []) write("update", "candidates", id, store.candidates[id].status === "revoked" ? { revokePublished: true } : { published: true });
}
function listGuides(dir) {
  const out = ["CREDITS.md"].filter((p) => fs.existsSync(path.join(dir, p)));
  const walk = (d, rel) => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const r = `${rel}/${e.name}`; if (e.isDirectory()) walk(path.join(d, e.name), r); else if (r.endsWith(".md")) out.push(r); } };
  walk(path.join(dir, "references"), "references");
  return out;
}

export function publish(store, write) {
  const branch = git("rev-parse", "--abbrev-ref", "HEAD");
  if (branch !== "main") return { ok: false, error: `The repo is on "${branch}", not main. Switch to main first.` };
  // chains/ feeds the planner's craft map, so unfinished chains would leak into planner/ on commit.
  const dirty = git("status", "--porcelain", "--", ...PATHS, "chains", ".claude-plugin");
  if (dirty) return { ok: false, error: `superskills/, planner/, chains/ or .claude-plugin/ has edits that aren't committed yet:\n${dirty.split("\n").slice(0, 6).join("\n")}\nCommit or discard them first, so publishing only carries the app's changes.` };
  const all = plan(store), ready = all.filter((c) => !c.conflicts.length);
  const list = ready.filter((c) => c.writes.length || c.removes.length);
  const plug = pluginPlan(store), paths = [...PATHS, ".claude-plugin"];
  const now = new Date().toISOString();
  const conflicts = all.filter((c) => c.conflicts.length).map((c) => `${c.name}: ${c.conflicts.join(", ")}`);
  const finish = (res) => {
    for (const c of ready) takeIntoApp(store, write, c, now);
    return { ...res, conflicts };
  };
  if (!list.length && !plug.changed) {
    if (!unpushed()) return finish({ ok: true, nothing: true });
    try { git("push", "-q", "origin", "main"); return finish({ ok: true, commit: git("rev-parse", "--short", "HEAD"), skills: [] }); }
    catch (e) { return { ok: false, error: `The push to GitHub failed:\n${errText(e)}` }; }
  }

  for (const c of list) {
    const dir = path.join(DIR, c.id);
    for (const [p, txt] of c.writes) { fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true }); fs.writeFileSync(path.join(dir, p), txt); }
    for (const p of c.removes) fs.rmSync(path.join(dir, p), { force: true });
  }
  if (plug.changed) fs.writeFileSync(MARKET, plug.text);
  const undo = () => { try { git("checkout", "--", ...paths); git("clean", "-fdq", "--", ...PATHS); } catch {} };
  try {
    run("node", ["local/craft-map.mjs", "--write"]);
    run("python3", ["_tools/check_superskills.py"]);
    JSON.parse(read(MARKET));
  } catch (e) {
    undo();
    return { ok: false, error: `The skill checks failed, so nothing was published:\n${errText(e)}`, conflicts };
  }
  const names = list.map((c) => `${c.name} v${c.version}`);
  const plugLine = plug.changed ? (plug.off.length ? `Plugin skill list: ${plug.off.length} switched off (${plug.off.join(", ")})` : "Plugin skill list: every skill switched back on") : "";
  const title = names.length ? `Publish approved skill changes: ${names.length > 4 ? `${names.slice(0, 4).join(", ")} and ${names.length - 4} more` : names.join(", ")}` : plugLine;
  const msg = `${title}\n\n` +
    [...list.map((c) => `- ${c.name} v${c.version}: ${[...c.writes.map(([p]) => p), ...c.removes.map((p) => p + " (removed)")].join(", ")}`), ...(names.length && plugLine ? [`- ${plugLine}`] : [])].join("\n") +
    `${list.length ? "\n\n" : ""}Written from the Skill Garden app${list.length ? " after the changes were approved in Review" : ", where the skills were switched on and off"}.\n`;
  try {
    git("add", "-A", "--", ...paths);
    git("commit", "-q", "-m", msg, "--", ...paths);
  } catch (e) {
    undo();
    return { ok: false, error: `Couldn't commit:\n${errText(e)}`, conflicts };
  }
  const commit = git("rev-parse", "--short", "HEAD");
  try { git("push", "-q", "origin", "main"); }
  catch (e) {
    return finish({ ok: false, commit, error: `Committed as ${commit} on this Mac, but the push to GitHub failed:\n${errText(e)}\nPull, then press Publish again to push it.` });
  }
  return finish({ ok: true, commit, skills: plug.changed ? [...names, "plugin skill list"] : names });
}

// node publish.mjs   lists what publishing would do, without writing anything.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const load = (c) => JSON.parse(fs.readFileSync(path.join(ROOT, "local", "data", `${c}.json`), "utf8"));
  const list = plan({ topics: load("topics"), versions: load("versions"), candidates: load("candidates") });
  for (const c of list) {
    const bits = [c.writes.length && `write ${c.writes.map(([p]) => p).join(", ")}`, c.removes.length && `remove ${c.removes.join(", ")}`, c.conflicts.length && `CONFLICT ${c.conflicts.join(", ")}`, c.takeIn && "app takes in disk edits"].filter(Boolean);
    if (bits.length) console.log(`${c.id} v${c.version}: ${bits.join("; ")}`);
  }
}
