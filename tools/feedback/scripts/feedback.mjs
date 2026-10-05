#!/usr/bin/env node
// Skill Garden feedback: notes about how a super skill did, and an opt-in usage log.
// Everything is kept in ~/.claude/skillgarden/ on this computer. A note leaves it only through
// `send`, which the feedback skill runs after the user has seen the note and said yes.
// Node 18 or newer; no packages.
//
//   node feedback.mjs session         what this session used (skills fired, guides read, tokens)
//   node feedback.mjs save            save a note (JSON on stdin) and print it
//   node feedback.mjs send <id>       send a saved note to Skill Garden
//   node feedback.mjs usage on|off    switch the usage log (the plugin's SessionEnd hook) on or off
//   node feedback.mjs usage stats     what the usage log shows, per craft
//   node feedback.mjs status          switches and counts
//   node feedback.mjs hook            the plugin's Stop/SessionEnd hook (hook JSON on stdin)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HOME = path.join(os.homedir(), ".claude", "skillgarden");
const NOTES = path.join(HOME, "feedback.jsonl");
const USAGE = path.join(HOME, "usage");            // one <sessionId>.json per session that used Skill Garden
const USAGE_ON = path.join(HOME, "usage-on");       // the hook only runs while this file exists
const LOCAL = path.join(HOME, "local-garden");      // the owner's Mac: the local app reads the notes itself
const URL_ = process.env.SKILLGARDEN_FEEDBACK_URL || "https://skillgarden.gipsonkj.workers.dev/feedback";
const HERE = path.dirname(fileURLToPath(import.meta.url));
// The installed plugin lives in .../plugins/cache/skillgarden/skillgarden/<version>/.
const PLUGIN = (HERE.match(/cache\/skillgarden\/skillgarden\/([^/]+)/) || [])[1] || "dev";
export const PROBLEMS = ["worked-well", "wrong-craft", "wrong-guide", "guide-missing", "guide-wrong", "too-slow", "other"];

/* ---------- what a session used, from its transcript ---------- */
function transcriptOf(sessionId) {
  const projects = path.join(os.homedir(), ".claude", "projects");
  if (sessionId) {
    for (const d of fs.existsSync(projects) ? fs.readdirSync(projects) : []) {
      const f = path.join(projects, d, `${sessionId}.jsonl`);
      if (fs.existsSync(f)) return f;
    }
  }
  // No id: the newest transcript of this folder's project is the session running this command.
  const dir = path.join(projects, process.cwd().replace(/[^a-zA-Z0-9]/g, "-"));
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".jsonl")).map((f) => path.join(dir, f)) : [];
  return files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0] || null;
}

const GUIDE = /\/(superskills|planner|chains)\/([a-z0-9][a-z0-9-]*)\/(references\/[^/]+\.md|SKILL\.md)$/;
export function summarize(file) {
  const crafts = new Map(), seen = new Set();
  const tokens = { input: 0, cacheRead: 0, cacheWrite: 0, output: 0 };
  let prompts = 0, first = null, last = null, model = null, sessionId = null;
  const craft = (id) => crafts.get(id) || crafts.set(id, { id, fired: 0, guides: new Set() }).get(id);
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    let o; try { o = JSON.parse(line); } catch { continue; }
    if (o.isSidechain) continue;
    sessionId ||= o.sessionId;
    if (o.timestamp) { first ||= o.timestamp; last = o.timestamp; }
    const m = o.message || {};
    if (o.type === "user" && !o.isMeta) {
      const c = m.content;
      if (typeof c === "string" ? c.trim() : Array.isArray(c) && c.some((b) => b.type === "text") && !c.some((b) => b.type === "tool_result")) prompts++;
    }
    if (o.type !== "assistant") continue;
    if (m.model && m.model !== "<synthetic>") model = m.model;
    // One reply is written as several lines that repeat its usage; count each reply once.
    if (m.usage && !seen.has(m.id)) {
      seen.add(m.id);
      tokens.input += m.usage.input_tokens || 0; tokens.output += m.usage.output_tokens || 0;
      tokens.cacheRead += m.usage.cache_read_input_tokens || 0; tokens.cacheWrite += m.usage.cache_creation_input_tokens || 0;
    }
    // Working on the Skill Garden repo itself: reading its files is development, not use.
    const dev = /(^|\/)skillgarden-app(\/|$)/i.test(o.cwd || "");
    for (const b of Array.isArray(m.content) ? m.content : []) {
      if (b.type !== "tool_use") continue;
      const i = b.input || {};
      if (b.name === "Skill" && /^skillgarden:/.test(i.skill || "")) craft(i.skill.slice(12)).fired++;
      else if (dev && (b.name === "Read" || b.name === "Bash")) continue;
      else if (b.name === "Read" && /skillgarden/i.test(i.file_path || "")) {
        const g = GUIDE.exec(i.file_path);
        if (g && g[3] === "SKILL.md") craft(g[2]);
        else if (g) craft(g[2]).guides.add(g[3].slice(11));
      } else if (b.name === "Bash" && /skillgarden/i.test(i.command || "")) {
        // Guides read from the shell count too, when the command reads them (cat, sed -n, head …).
        for (const part of String(i.command).split(/;|&&|\|\||\|/))
          if (/^\s*(cat|sed|head|tail|less|bat)\b/.test(part))
            for (const g of part.matchAll(/\/(?:superskills|planner|chains)\/([a-z0-9][a-z0-9-]*)\/references\/([\w.-]+\.md)/g)) craft(g[1]).guides.add(g[2]);
      } else if (/__get_super_skill$/.test(b.name) && i.craft) craft(i.craft === "garden" ? "superseed" : i.craft).fired++;
      else if (/__get_guide$/.test(b.name) && i.craft && /^references\//.test(i.path || "")) craft(i.craft === "garden" ? "superseed" : i.craft).guides.add(i.path.slice(11));
    }
  }
  return {
    sessionId, model, prompts, tokens,
    minutes: first && last ? Math.round((Date.parse(last) - Date.parse(first)) / 6e4) : 0,
    crafts: [...crafts.values()].filter((c) => c.id !== "feedback").map((c) => ({ id: c.id, fired: c.fired, guides: [...c.guides].sort() })),
  };
}

/* ---------- notes ---------- */
const readLines = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : []);
const append = (f, o) => { fs.mkdirSync(HOME, { recursive: true }); fs.appendFileSync(f, JSON.stringify(o) + "\n"); };
const clip = (v, n) => String(v ?? "").replace(/\s+\n/g, "\n").trim().slice(0, n);
const SLUG = /^[a-z0-9][a-z0-9-]{0,60}$/;

// The part of a note that may leave this computer: no session id, no paths, no transcript.
export function payload(n) {
  return {
    v: 1, id: n.id, at: n.at, plugin: n.plugin, problem: n.problem, rating: n.rating,
    task: n.task, detail: n.detail, words: n.words,
    crafts: n.crafts.map((c) => ({ id: c.id, fired: c.fired, guides: c.guides })),
    prompts: n.prompts, minutes: n.minutes, tokens: n.tokens, model: n.model,
  };
}

function save(input) {
  const s = (() => { const f = transcriptOf(process.env.CLAUDE_CODE_SESSION_ID); return f ? summarize(f) : null; })();
  // input.crafts (ids) narrows the note to the crafts it is about; their counts still come from the session.
  const crafts = (Array.isArray(input.crafts) ? input.crafts : s?.crafts || [])
    .map((c) => (typeof c === "string" ? s?.crafts.find((x) => x.id === c) || { id: c, fired: 0, guides: [] } : c))
    .filter((c) => SLUG.test(String(c.id || "")))
    .slice(0, 12)
    .map((c) => ({ id: c.id, fired: Number(c.fired) || 0, guides: (c.guides || []).map(String).filter((g) => /^[\w.-]{1,80}\.md$/.test(g)).slice(0, 30) }));
  const rating = Number(input.rating);
  const note = {
    id: crypto.randomUUID(), at: new Date().toISOString(), plugin: PLUGIN, sessionId: s?.sessionId || null,
    problem: PROBLEMS.includes(input.problem) ? input.problem : "other",
    rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
    task: clip(input.task, 200), detail: clip(input.detail, 1500), words: clip(input.words, 1500),
    crafts, prompts: s?.prompts ?? null, minutes: s?.minutes ?? null, tokens: s?.tokens ?? null, model: s?.model ?? null,
    sent: false,
  };
  if (!note.detail && !note.words) throw new Error("A note needs the user's words or a detail of what went wrong.");
  append(NOTES, note);
  return { saved: note, wouldSend: payload(note), askToSend: !fs.existsSync(LOCAL), to: URL_ };
}

async function send(id) {
  const notes = readLines(NOTES), n = notes.find((x) => x.id === id);
  if (!n) throw new Error(`No saved note ${id}.`);
  if (n.sent) return { ok: true, already: true };
  const r = await fetch(URL_, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload(n)) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || `Skill Garden answered ${r.status}.`);
  n.sent = true; n.sentAt = new Date().toISOString();
  fs.writeFileSync(NOTES + ".tmp", notes.map((x) => JSON.stringify(x)).join("\n") + "\n");
  fs.renameSync(NOTES + ".tmp", NOTES);
  return { ok: true };
}

/* ---------- usage log ---------- */
// Runs after every reply (Stop) and at SessionEnd, which Claude Code doesn't always reach: each run
// rewrites this session's own file, so a session is counted once however often it runs.
export const usageRows = () => (fs.existsSync(USAGE) ? fs.readdirSync(USAGE).filter((f) => f.endsWith(".json")).map((f) => { try { return JSON.parse(fs.readFileSync(path.join(USAGE, f), "utf8")); } catch { return null; } }).filter(Boolean) : []);
function hook(input) {
  if (!fs.existsSync(USAGE_ON)) return;
  const f = input.transcript_path && fs.existsSync(input.transcript_path) ? input.transcript_path : transcriptOf(input.session_id);
  if (!f || !fs.readFileSync(f, "utf8").includes("skillgarden")) return;
  const s = summarize(f);
  if (!s.crafts.length || !/^[\w-]{1,80}$/.test(String(s.sessionId))) return;   // sessions that never used Skill Garden leave no trace
  const out = path.join(USAGE, `${s.sessionId}.json`);
  const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};
  fs.mkdirSync(USAGE, { recursive: true });
  fs.writeFileSync(out + ".tmp", JSON.stringify({ at: new Date().toISOString(), ended: input.hook_event_name === "SessionEnd" || !!prev.ended, endReason: input.reason || prev.endReason || null, plugin: PLUGIN, ...s }));
  fs.renameSync(out + ".tmp", out);
}

function stats() {
  const by = new Map();
  const rows = usageRows();
  for (const u of rows) for (const c of u.crafts || []) {
    const t = by.get(c.id) || by.set(c.id, { id: c.id, sessions: 0, fired: 0, ignored: 0, guides: {}, tokens: [] }).get(c.id);
    t.sessions++; t.fired += c.fired ? 1 : 0; if (c.fired && !c.guides.length) t.ignored++;
    for (const g of c.guides) t.guides[g] = (t.guides[g] || 0) + 1;
    // New tokens only: cache reads are cheap and would drown everything else.
    if (u.tokens) t.tokens.push(u.tokens.input + u.tokens.cacheWrite + u.tokens.output);
  }
  const median = (a) => (a.length ? a.sort((x, y) => x - y)[a.length >> 1] : 0);
  return { sessions: rows.length, crafts: [...by.values()].sort((a, b) => b.sessions - a.sessions).map((t) => ({ ...t, tokens: undefined, medianNewTokens: median(t.tokens) })) };
}

/* ---------- command line ---------- */
async function stdinJson() {
  let s = "";
  for await (const chunk of process.stdin) s += chunk;
  try { return s.trim() ? JSON.parse(s) : {}; } catch (e) { throw new Error(`That isn't valid JSON: ${e.message}`); }
}
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, arg] = process.argv.slice(2);
  try {
    let out;
    if (cmd === "session") { const f = transcriptOf(process.env.CLAUDE_CODE_SESSION_ID); out = f ? summarize(f) : { error: "Couldn't find this session's transcript." }; }
    else if (cmd === "save") out = save(await stdinJson());
    else if (cmd === "send") out = await send(arg);
    else if (cmd === "usage" && arg === "on") { fs.mkdirSync(HOME, { recursive: true }); fs.writeFileSync(USAGE_ON, ""); out = { usageLog: true, file: USAGE }; }
    else if (cmd === "usage" && arg === "off") { fs.rmSync(USAGE_ON, { force: true }); out = { usageLog: false }; }
    else if (cmd === "usage" && arg === "stats") out = stats();
    else if (cmd === "status") { const n = readLines(NOTES); out = { usageLog: fs.existsSync(USAGE_ON), localGarden: fs.existsSync(LOCAL), notes: n.length, unsent: n.filter((x) => !x.sent).length, usageSessions: usageRows().length, folder: HOME }; }
    else if (cmd === "hook") { hook(await stdinJson()); process.exit(0); }
    else throw new Error("Commands: session, save, send <id>, usage on|off|stats, status, hook.");
    console.log(JSON.stringify(out, null, 1));
  } catch (e) {
    if (cmd === "hook") process.exit(0);   // a hook never gets in the user's way
    console.error(`feedback: ${e.cause?.code === "ENOTFOUND" ? "couldn't reach Skill Garden (offline?)." : e.message}`);
    process.exit(1);
  }
}
