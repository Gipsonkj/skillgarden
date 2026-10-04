#!/usr/bin/env node
// Skill Garden on your own computer. Needs Node 18 or newer and nothing else.
//
//   node server.mjs                 start on http://localhost:4747
//   node server.mjs --no-schedule   start without the morning scout
//
// Data lives in ./data as one JSON file per collection. The page is
// ../skill-garden.html, the same file published to claude.ai; runtime.js
// stands in for the claude.ai capabilities it uses.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { MAX_VIDEO, VIDEO_TYPES, tools as mediaTools, processVideo } from "./media.mjs";
import { buildCredits } from "./credits.mjs";
import { loadChains } from "./chains.mjs";
import { takeRadar, radarFor, RADAR_KEEP } from "./radar.mjs";
import * as cloud from "./cloud.mjs";
import * as publisher from "./publish.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PORT = Number(process.env.PORT || 4747);
const DATA = path.join(HERE, "data");
const LOGS = path.join(HERE, "logs");
const MEDIA = path.join(HERE, "media");
const COLLECTIONS = ["settings", "topics", "versions", "inbox", "candidates", "runs", "radar"];
const ID_RE = /^(?!\.\.?$)[A-Za-z0-9_\-.~:@+]{1,200}$/;
const SCHEDULE = !process.argv.includes("--no-schedule");
// The SkillGarden library (skills/ and zips/ folders made by _tools/build.py). Sub-skills are
// served read-only from here so the catalog can preview and zip them.
const LIB = path.resolve(process.env.SKILLGARDEN_LIBRARY || path.join(ROOT, ".."));

/* ---------- library (read-only) ---------- */
// Skills the user wrote: authored/ holds the cleaned public copies the library is built from;
// authored-private/ (git-ignored, this Mac only) holds the full originals, served here instead.
const PRIVATE = path.join(ROOT, "authored-private");
function privateCopy(full) {
  const rel = path.relative(path.join(LIB, "skills"), full).split(path.sep);
  const name = (rel[1] || "").replace(/^\d+_/, "");
  const dir = path.join(PRIVATE, name);
  if (!name || !ID_RE.test(name) || !fs.existsSync(path.join(ROOT, "authored", name)) || !fs.existsSync(dir)) return full;
  const alt = path.resolve(dir, ...rel.slice(2));
  return alt === dir || alt.startsWith(dir + path.sep) ? alt : full;
}
function libPath(rel) {
  const p = String(rel || "");
  if (!/^(skills|zips)\//.test(p) || p.includes("\0")) throw httpErr(400, "Bad path.");
  let full = path.resolve(LIB, p);
  if (!full.startsWith(path.join(LIB, p.split("/")[0]) + path.sep)) throw httpErr(400, "Bad path.");
  if (p.startsWith("skills/")) full = privateCopy(full);
  if (!fs.existsSync(full)) throw httpErr(404, "Not in the library.");
  return full;
}
function listFiles(dir) {
  const out = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.isSymbolicLink()) continue;
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f); else out.push({ path: path.relative(dir, f).split(path.sep).join("/"), size: fs.statSync(f).size });
  } };
  walk(dir);
  return out;
}

/* ---------- store ---------- */
fs.mkdirSync(DATA, { recursive: true });
fs.mkdirSync(LOGS, { recursive: true });
fs.mkdirSync(MEDIA, { recursive: true });
const store = {};
for (const c of COLLECTIONS) {
  const file = path.join(DATA, c + ".json");
  if (!fs.existsSync(file)) {
    const seed = path.join(HERE, "seed-data", c + ".json");
    fs.writeFileSync(file, fs.existsSync(seed) ? fs.readFileSync(seed) : "{}");
  }
  store[c] = JSON.parse(fs.readFileSync(file, "utf8"));
}
function save(c) {
  const file = path.join(DATA, c + ".json");
  fs.writeFileSync(file + ".tmp", JSON.stringify(store[c], null, 1));
  fs.renameSync(file + ".tmp", file);
}
// The imported settings name the cloud routine; locally the server is the scheduler.
store.settings.main = { scoutTime: "06:51", scoutDay: "Sun", paused: false, scoutModel: "claude-sonnet-5-5", scoutEffort: "medium", libraries: [], lists: [], ...(store.settings.main || {}), triggerId: "local", host: "local" };
save("settings");

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
function merge(target, patch) {
  const out = { ...target };
  for (const [k, v] of Object.entries(patch)) {
    if (isObj(v) && v.__delete__ === true) delete out[k];
    else if (isObj(v) && isObj(out[k])) out[k] = merge(out[k], v);
    else out[k] = v;
  }
  return out;
}
function write(op, c, id, data) {
  if (!COLLECTIONS.includes(c)) throw httpErr(400, `Unknown collection "${c}".`);
  if (!ID_RE.test(String(id))) throw httpErr(400, `Bad document id "${id}".`);
  if (op === "delete") delete store[c][id];
  else {
    if (!isObj(data)) throw httpErr(400, "The document must be a JSON object.");
    if (op === "set") store[c][id] = data;
    else if (op === "update") {
      if (!store[c][id]) throw httpErr(404, `${c}/${id} does not exist; use set to create it.`);
      store[c][id] = merge(store[c][id], data);
    } else throw httpErr(400, `Unknown op "${op}".`);
  }
  save(c);
  broadcast(c);
  cloud.changed(c, id);
  if (c === "topics" || c === "candidates") refreshPublish();
}

/* ---------- publishing approved changes to GitHub (local/publish.mjs) ---------- */
// settings/main.publish tells the app (here and on the admin page) what's waiting to go to GitHub.
let publishTimer = null, publishing = false;
function refreshPublish(last) {
  clearTimeout(publishTimer);
  publishTimer = setTimeout(() => {
    try {
      const prev = (store.settings.main || {}).publish || {};
      const next = { ...publisher.summary(publisher.plan(store)), running: publishing, last: last || prev.last || null };
      if (JSON.stringify(next) !== JSON.stringify(prev)) write("update", "settings", "main", { publish: next });
    } catch (e) { console.error(`[publish] couldn't check: ${e.message}`); }
  }, last ? 0 : 2000);
  publishTimer.unref?.();
}
function startPublish() {
  if (publishing) return { ok: false, error: "Already publishing." };
  if (scout.running) return { ok: false, error: "The scout is running. Publish when it finishes, so its changes don't land half-way." };
  publishing = true;
  let r;
  try { r = publisher.publish(store, write); } catch (e) { r = { ok: false, error: e.message }; }
  publishing = false;
  const last = { at: new Date().toISOString(), ok: r.ok, commit: r.commit || null, skills: r.skills || [], error: r.error || "", conflicts: r.conflicts || [], nothing: !!r.nothing };
  console.log(`[publish] ${r.ok ? (r.nothing ? "nothing to publish" : `pushed ${r.commit}`) : `failed: ${r.error}`}`);
  refreshPublish(last);
  return r;
}
const httpErr = (status, message) => Object.assign(new Error(message), { status });

/* ---------- live updates ---------- */
const listeners = new Set();
function broadcast(c) { for (const res of listeners) res.write(`data: ${JSON.stringify({ col: c })}\n\n`); }
setInterval(() => { for (const res of listeners) res.write(": keep-alive\n\n"); }, 25000).unref();

/* ---------- time ---------- */
function indiaNow() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  const weekday = new Date(Date.UTC(+p.year, +p.month - 1, +p.day)).getUTCDay();
  return { date: `${p.year}-${p.month}-${p.day}`, minutes: +p.hour * 60 + +p.minute, weekday };
}

/* ---------- reel videos (read on this computer) ---------- */
let mediaQueue = Promise.resolve();
function mediaDir(id) { return path.join(MEDIA, id); }
function videoIn(dir) { return fs.existsSync(dir) ? fs.readdirSync(dir).find((f) => /^video\.\w+$/.test(f)) : null; }
function readVideo(id) {
  write("update", "inbox", id, { media: { status: "processing", at: new Date().toISOString() } });
  mediaQueue = mediaQueue.then(async () => {
    const dir = mediaDir(id), v = videoIn(dir);
    if (!store.inbox[id]) return;
    if (!v) return write("update", "inbox", id, { media: { status: "failed", error: "The video file is gone. Drop it again." } });
    try {
      const { transcript, frames, seconds } = await processVideo(path.join(dir, v), dir, `media/${id}`);
      fs.rmSync(path.join(dir, v), { force: true }); // keep only the text and the stills
      const r = store.inbox[id];
      if (!r) return;
      write("update", "inbox", id, { transcript, frames, media: { status: "done", seconds, at: new Date().toISOString() }, ...(r.status === "needs-note" || r.status === "read" ? { status: "new" } : {}) });
    } catch (e) {
      console.error(`[media] ${id}: ${e.message}`);
      if (store.inbox[id]) write("update", "inbox", id, { media: { status: "failed", error: String(e.message || e).split("\n")[0].slice(0, 300) } });
    }
  });
}
function saveUpload(req, id) {
  const ext = VIDEO_TYPES[String(req.headers["content-type"] || "").split(";")[0].trim()];
  if (!ext) throw httpErr(415, "Drop an .mp4, .mov, .m4v or .webm video.");
  if (Number(req.headers["content-length"]) > MAX_VIDEO) throw httpErr(413, "That video is over 300 MB.");
  const dir = mediaDir(id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `video.${ext}`);
  return new Promise((resolve, reject) => {
    let size = 0;
    const out = fs.createWriteStream(file);
    req.on("data", (c) => { size += c.length; if (size > MAX_VIDEO) { req.destroy(); out.destroy(); fs.rmSync(dir, { recursive: true, force: true }); reject(httpErr(413, "That video is over 300 MB.")); } });
    req.pipe(out);
    out.on("finish", () => resolve(size));
    out.on("error", reject);
    req.on("error", reject);
  });
}

/* ---------- the scout ---------- */
const scout = { running: false, startedAt: null, log: null, lastExit: null };
// What the Scout tab can pick. Anything else in settings falls back to the default.
const SCOUT_MODELS = ["claude-sonnet-5-5", "claude-opus-5-5", "claude-fable-5-1", "claude-haiku-4-5-20251001"];
const SCOUT_EFFORTS = ["low", "medium", "high", "xhigh", "max"];
function scoutModelArgs() {
  const s = store.settings.main || {};
  const model = SCOUT_MODELS.includes(s.scoutModel) ? s.scoutModel : SCOUT_MODELS[0];
  const effort = SCOUT_EFFORTS.includes(s.scoutEffort) ? s.scoutEffort : "medium";
  // Haiku 4.5 has no effort setting.
  return model.startsWith("claude-haiku") ? ["--model", model] : ["--model", model, "--effort", effort];
}
function latestRun() {
  return Object.entries(store.runs).map(([id, r]) => ({ id, ...r })).sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))[0];
}
function failRun(summary) {
  const now = new Date().toISOString();
  const last = latestRun();
  if (last && last.status === "running") write("update", "runs", last.id, { status: "failed", finishedAt: now, summary });
  else write("set", "runs", `${indiaNow().date}-local-${Date.now().toString(36)}`, { status: "failed", startedAt: scout.startedAt || now, finishedAt: now, trigger: "manual", summary });
}
// One Claude Code session per active topic, one after another, so each run has room to
// research its topic properly. A run started by hand or by the weekly schedule covers them all.
async function startScout(kind) {
  if (scout.running) return false;
  const topics = Object.entries(store.topics).filter(([, t]) => t.active !== false).sort((a, b) => (Number(a[1].order) || 0) - (Number(b[1].order) || 0)).map(([id]) => id);
  if (!topics.length) { failRun("No topic has \"Scout this topic\" switched on."); return false; }
  scout.running = true; scout.queue = topics.slice(1);
  scout.kind = kind;
  scout.radarId = await radarStep();
  const ok = await startSession(kind, topics[0]);
  if (!ok) { scout.running = false; scout.queue = []; }
  return ok;
}
// One look at GitHub, Hacker News and Reddit for the whole run (see radar.mjs). Never blocks the scout.
async function radarStep() {
  const id = indiaNow().date;
  try {
    const prevId = Object.keys(store.radar).filter((k) => k !== id).sort().pop();
    const doc = await takeRadar(store, prevId ? store.radar[prevId] : null);
    write("set", "radar", id, doc);
    for (const old of Object.keys(store.radar).sort().reverse().slice(RADAR_KEEP)) write("delete", "radar", old);
    console.log(`[radar] ${Object.keys(doc.repos).length} repos, ${doc.rising.length} rising, ${doc.newRepos.length} new, ${doc.community.length} posts${doc.errors.length ? `; ${doc.errors.join("; ")}` : ""}`);
    return id;
  } catch (e) {
    console.error(`[radar] skipped: ${e.message}`);
    return store.radar[id] ? id : null;
  }
}
function nextSession() {
  const id = scout.queue && scout.queue.shift();
  if (!id || store.settings.main?.paused && scout.kind === "schedule") { scout.running = false; scout.topic = null; console.log("[scout] all topics done"); return; }
  startSession(scout.kind, id).then((ok) => { if (!ok) nextSession(); });
}
function startSession(kind, topicId) {
  const preamble = fs.readFileSync(path.join(HERE, "scout-local.md"), "utf8");
  const runbook = fs.readFileSync(path.join(ROOT, "runbook.md"), "utf8");
  const scope = `**Scope of this session:** work only on the topic \`${topicId}\`, even if other topics are active. Use runId \`<India date>-${topicId}\` (add -2, -3 if taken). Skip step 7 for other topics.${scout.radarId ? ` Radar command: \`node sg.mjs radar ${topicId}\`.` : ""}`;
  const prompt = `${preamble}\n\n${scope}\n\n---\n\n${runbook}\n\n---\n\nStart now. This run was started ${kind === "manual" ? "by hand" : "by the weekly schedule"}. ${scope}`;
  scout.topic = topicId;
  const env = { ...process.env, SKILL_GARDEN_PORT: String(PORT) };
  // Use the Claude subscription you're signed in to Claude Code with, not a
  // pay-as-you-go API key that happens to be set in this shell.
  if (!process.env.SKILL_GARDEN_USE_API_KEY) delete env.ANTHROPIC_API_KEY;
  // The scout writes JSON here for `node sg.mjs … --file`; start each run empty.
  const outbox = path.join(HERE, "outbox");
  fs.rmSync(outbox, { recursive: true, force: true });
  fs.mkdirSync(outbox);
  scout.startedAt = new Date().toISOString();
  scout.log = path.join(LOGS, `scout-${scout.startedAt.replace(/[:.]/g, "-")}.log`);
  const out = fs.openSync(scout.log, "a");
  let closed = false;
  const closeLog = () => { if (!closed) { closed = true; fs.closeSync(out); } };
  const args = ["-p", prompt, ...scoutModelArgs(), "--permission-mode", "dontAsk", "--allowedTools", "Bash(node sg.mjs *)", "Edit(./outbox/**)", "Read(./media/**)", "WebSearch", "WebFetch", "Agent"];
  let child;
  try { child = spawn(process.env.CLAUDE_BIN || "claude", args, { cwd: HERE, env, stdio: ["ignore", out, out] }); }
  catch (e) { closeLog(); failRun(`Couldn't start the scout: ${e.message}`); return Promise.resolve(false); }
  const started = new Promise((resolve) => { child.once("spawn", () => resolve(true)); child.once("error", () => resolve(false)); });
  console.log(`[scout] starting ${topicId} (${kind}, ${scoutModelArgs().filter((a) => !a.startsWith("--")).join(" ")}) — log: ${path.relative(HERE, scout.log)}`);
  child.on("error", (e) => {
    closeLog();
    scout.running = false; scout.queue = [];
    failRun(e.code === "ENOENT" ? "Couldn't start the scout because Claude Code isn't installed on this computer. Install it (see README) and sign in, then try again." : `Couldn't start the scout: ${e.message}`);
  });
  child.on("exit", (code) => {
    closeLog();
    scout.lastExit = code;
    console.log(`[scout] ${topicId} finished with code ${code}`);
    const last = latestRun();
    if (last && last.status === "running") failRun(`The scout stopped before finishing ${topicId} (exit code ${code}). Details are in local/logs/${path.basename(scout.log)}.`);
    nextSession();
  });
  return started;
}
/* ---------- Instagram reader (optional, off by default) ---------- */
// Reads the dedicated Instagram account's saves, comments on its own posts and, if switched on,
// DMs through Claude in Chrome, and adds what it finds to the Reel inbox as new items. Nothing
// else. Safeguards, enforced here rather than trusted to the prompt:
//   - runs only when switched on in the Reel inbox and an account handle is set;
//   - the session's only write is `node ig-inbox.mjs`, which reaches only /api/ig-reader/*;
//   - nothing is added until the session reports the signed-in handle and it matches the
//     dedicated account; a mismatch ends the run;
//   - it can only create new inbox items (never edit, delete, or touch skills or settings),
//     at most READER_MAX per run, with fields cut to size and marked as read by the reader;
//   - DM items are flagged fromDm and never appear in public credits or on the website.
const READER_MAX = 40;
const READER_TIMEOUT = 30 * 60e3;
const HANDLE_RE = /^[A-Za-z0-9_.]{1,30}$/;
const reader = { running: false, accountOk: false, added: 0, startedAt: null, log: null, child: null };
const readerCfg = () => ({ enabled: false, account: "", saves: true, comments: true, dms: false, ...(store.settings.main?.igReader || {}) });
const normHandle = (h) => String(h || "").trim().replace(/^@/, "").toLowerCase();
function readerNote(patch) { write("update", "settings", "main", { igReaderRun: { ...(store.settings.main?.igReaderRun || {}), ...patch } }); }
function startReader(kind) {
  const cfg = readerCfg();
  if (!cfg.enabled) return Promise.resolve({ ok: false, error: "The Instagram reader is switched off." });
  if (!HANDLE_RE.test(normHandle(cfg.account))) return Promise.resolve({ ok: false, error: "Set the dedicated account's handle first." });
  if (reader.running) return Promise.resolve({ ok: false, error: "The reader is already running." });
  if (scout.running) return Promise.resolve({ ok: false, error: "Wait for the scout to finish." });
  const read = [cfg.saves && "saved posts", cfg.comments && "comments on the account's own posts", cfg.dms && "direct messages"].filter(Boolean);
  if (!read.length) return Promise.resolve({ ok: false, error: "Pick at least one thing to read." });
  const brief = fs.readFileSync(path.join(HERE, "ig-reader.md"), "utf8");
  const topics = Object.entries(store.topics).filter(([, t]) => t.active !== false).map(([id, t]) => `- ${id}: ${t.name}${(t.collections || []).length ? ` (collections: ${t.collections.join(", ")})` : ""}`).join("\n");
  const prompt = `${brief}\n\n---\n\nDedicated account: @${normHandle(cfg.account)}\nRead this run: ${read.join(", ")}.\nAt most ${READER_MAX} new items.\nTopics:\n${topics}\n\nStart now (${kind === "manual" ? "started by hand" : "before the weekly scout"}).`;
  const env = { ...process.env, SKILL_GARDEN_PORT: String(PORT) };
  if (!process.env.SKILL_GARDEN_USE_API_KEY) delete env.ANTHROPIC_API_KEY;
  const outbox = path.join(HERE, "outbox");
  fs.rmSync(outbox, { recursive: true, force: true });
  fs.mkdirSync(outbox);
  const C = "mcp__claude-in-chrome__";
  const allowed = ["Bash(node ig-inbox.mjs *)", "Edit(./outbox/**)", ...["tabs_context_mcp", "tabs_create_mcp", "navigate", "read_page", "get_page_text", "find", "computer"].map((t) => C + t)];
  const denied = ["form_input", "javascript_tool", "file_upload", "upload_image", "shortcuts_execute", "gif_creator"].map((t) => C + t);
  Object.assign(reader, { running: true, accountOk: false, added: 0, startedAt: new Date().toISOString() });
  reader.log = path.join(LOGS, `ig-reader-${reader.startedAt.replace(/[:.]/g, "-")}.log`);
  const out = fs.openSync(reader.log, "a");
  readerNote({ status: "running", startedAt: reader.startedAt, finishedAt: null, added: 0, error: null, account: null });
  let child;
  try { child = spawn(process.env.CLAUDE_BIN || "claude", ["-p", prompt, "--chrome", "--permission-mode", "dontAsk", "--allowedTools", ...allowed, "--disallowedTools", ...denied], { cwd: HERE, env, stdio: ["ignore", out, out] }); }
  catch (e) { fs.closeSync(out); reader.running = false; readerNote({ status: "failed", error: e.message }); return Promise.resolve({ ok: false, error: e.message }); }
  reader.child = child;
  const timer = setTimeout(() => child.kill("SIGTERM"), READER_TIMEOUT);
  return new Promise((resolve) => {
    let done = false;
    const finish = (status, error) => {
      if (done) return; done = true;
      clearTimeout(timer); try { fs.closeSync(out); } catch {}
      reader.running = false; reader.child = null;
      readerNote({ status, finishedAt: new Date().toISOString(), added: reader.added, ...(error ? { error } : {}) });
      console.log(`[ig-reader] ${status}, ${reader.added} added${error ? `: ${error}` : ""}`);
    };
    child.once("spawn", () => { console.log(`[ig-reader] started — log: ${path.relative(HERE, reader.log)}`); resolve({ ok: true }); });
    child.once("error", (e) => { finish("failed", e.code === "ENOENT" ? "Claude Code isn't installed." : e.message); resolve({ ok: false, error: e.message }); });
    child.on("exit", (code) => finish(code === 0 && reader.accountOk ? "done" : "failed", code === 0 ? (reader.accountOk ? null : "Never confirmed the signed-in account, so nothing was added.") : `Stopped with exit code ${code}. See local/logs/${path.basename(reader.log)}.`));
  });
}
const clip = (v, n) => String(v ?? "").slice(0, n);
function readerAdd(items) {
  if (!reader.running) throw httpErr(409, "The reader isn't running.");
  if (!reader.accountOk) throw httpErr(403, "Confirm the signed-in account first: node ig-inbox.mjs account <handle>.");
  if (!Array.isArray(items)) throw httpErr(400, "Send {\"items\": [...]}.");
  const res = [];
  for (const it of items) {
    if (reader.added >= READER_MAX) { res.push({ skipped: "limit reached" }); continue; }
    const m = /^https:\/\/(?:www\.)?instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels?|tv)\/([A-Za-z0-9_-]{5,})/.exec(String(it.url || ""));
    const from = ["saved", "comment", "dm"].includes(it.from) ? it.from : null;
    if (!from) { res.push({ skipped: "from must be saved, comment or dm" }); continue; }
    const kind = it.kind === "freebie" ? "freebie" : m ? "reel" : "link";
    let url = "";
    if (m) url = `https://www.instagram.com/${m[1].startsWith("reel") ? "reel" : m[1]}/${m[2]}/`;
    else if (it.url) { try { const u = new URL(String(it.url)); if (u.protocol === "https:" && !/(^|\.)instagram\.com$/.test(u.hostname)) { u.hash = ""; url = u.href; } } catch {} }
    if (!url && kind !== "freebie") { res.push({ skipped: "needs a post link or an https link" }); continue; }
    const key = m ? m[2] : Buffer.from(url || clip(it.body, 200)).toString("base64url").slice(0, 40);
    const id = `igr-${key}`;
    const dup = store.inbox[id] || (m && store.inbox["ig-" + m[2]]);
    if (dup) { res.push({ id, skipped: "already in the inbox" }); continue; }
    const topicId = store.topics[it.topicId] ? it.topicId : "";
    const owner = HANDLE_RE.test(normHandle(it.owner)) ? normHandle(it.owner) : "";
    const now = new Date().toISOString();
    write("set", "inbox", id, {
      url, shortcode: m ? m[2] : "", kind, owner: from === "dm" ? "" : owner, collection: clip(it.collection, 80), topicId,
      note: "", caption: clip(it.caption, 2000), body: clip(it.body, 8000), savedAt: clip(it.savedAt, 40) || now, addedAt: now,
      via: "ig-reader", from, ...(from === "dm" ? { fromDm: true } : {}), status: topicId ? "new" : "library",
    });
    reader.added++;
    res.push({ id, added: true });
  }
  readerNote({ added: reader.added });
  return res;
}
// Before the weekly scout, if switched on, so new finds are read the same day.
function readerThenScout() {
  if (!readerCfg().enabled || !HANDLE_RE.test(normHandle(readerCfg().account))) return startScout("schedule");
  startReader("schedule").then((r) => {
    if (!r.ok) return startScout("schedule");
    const wait = setInterval(() => { if (!reader.running) { clearInterval(wait); startScout("schedule"); } }, 5000);
  });
}

if (SCHEDULE) {
  setInterval(() => {
    const s = store.settings.main || {};
    const [hh, mm] = String(s.scoutTime || "06:51").split(":").map(Number);
    const now = indiaNow();
    const due = hh * 60 + mm;
    // Run once a week on scoutDay. If the computer was asleep or the app closed at that time,
    // catch up any time later that week.
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(s.scoutDay || "Sun");
    if (s.paused || scout.running || reader.running || s.lastScheduledDate === now.date) return;
    const onTime = now.weekday === day && now.minutes >= due;
    const sinceLast = s.lastScheduledDate ? (Date.parse(now.date) - Date.parse(s.lastScheduledDate)) / 864e5 : null;
    // Never run before: wait for the first scout day. Otherwise run on the day, or catch up once a full week has passed.
    if (sinceLast === null ? !onTime : !(onTime && sinceLast >= 6) && sinceLast < 7) return;
    write("update", "settings", "main", { lastScheduledDate: now.date });
    readerThenScout();
  }, 30000).unref();
}

/* ---------- http ---------- */
function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > 8e6) { reject(httpErr(413, "Too large.")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); } catch { reject(httpErr(400, "Body is not valid JSON.")); } });
  });
}
const PAGE_HEAD = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif;background:#fafaf8}img{max-width:100%}[hidden]{display:none!important}</style><script src="/runtime.js"></script></head><body>`;

const server = http.createServer(async (req, res) => {
  try {
    // Only this computer may talk to the server: refuse other hosts (DNS rebinding)
    // and require a custom header on writes, which other websites can't send.
    const host = String(req.headers.host || "");
    if (!/^(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(host)) return send(res, 403, { error: "Local only." });
    const url = new URL(req.url, `http://${host}`);
    const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    if (req.method !== "GET" && req.headers["x-skill-garden"] !== "1") return send(res, 403, { error: "Missing X-Skill-Garden header." });

    if (url.pathname === "/") return send(res, 200, PAGE_HEAD + fs.readFileSync(path.join(ROOT, "skill-garden.html"), "utf8") + "</body></html>", "text/html; charset=utf-8");
    if (url.pathname === "/runtime.js") return send(res, 200, fs.readFileSync(path.join(HERE, "runtime.js"), "utf8"), "text/javascript; charset=utf-8");
    if (url.pathname === "/favicon.ico") { res.writeHead(204); return res.end(); }
    if (url.pathname === "/credits.json") return send(res, 200, buildCredits(store));
    if (url.pathname === "/chains.json") return send(res, 200, loadChains());
    if (parts[0] === "media" && parts.length === 3 && ID_RE.test(parts[1]) && /^frame-\d{1,2}\.jpg$/.test(parts[2])) {
      const f = path.join(mediaDir(parts[1]), parts[2]);
      if (!fs.existsSync(f)) return send(res, 404, { error: "No such frame." });
      res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      return fs.createReadStream(f).pipe(res);
    }
    if (url.pathname === "/catalog.json") {
      const f = path.join(ROOT, "catalog", "catalog.json");
      return fs.existsSync(f) ? send(res, 200, JSON.parse(fs.readFileSync(f, "utf8"))) : send(res, 404, { error: "No catalog yet." });
    }
    if (url.pathname === "/library/list") {
      const dir = libPath(url.searchParams.get("path"));
      return send(res, 200, fs.statSync(dir).isDirectory() ? listFiles(dir) : []);
    }
    if (url.pathname === "/library/raw") {
      const f = libPath(url.searchParams.get("path"));
      if (!fs.statSync(f).isFile()) throw httpErr(400, "Not a file.");
      const type = /\.(md|txt|py|js|ts|json|ya?ml|sh|html|css|csv|toml)$/i.test(f) ? "text/plain; charset=utf-8" : "application/octet-stream";
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": `attachment; filename="${path.basename(f).replace(/[^\w.-]/g, "_")}"` });
      return fs.createReadStream(f).pipe(res);
    }
    if (parts[0] !== "api") return send(res, 404, { error: "Not found." });

    const [, kind, c, id] = parts;
    if (kind === "media") {
      if (!ID_RE.test(String(c || "")) || !store.inbox[c]) throw httpErr(404, "Add the item to the inbox first.");
      if (req.method === "POST" && id === "retry") { if (!videoIn(mediaDir(c))) throw httpErr(404, "The video is gone. Drop it again."); readVideo(c); return send(res, 202, { ok: true }); }
      if (req.method === "POST" && !id) { await saveUpload(req, c); readVideo(c); return send(res, 202, { ok: true }); }
      return send(res, 404, { error: "Not found." });
    }
    if (kind === "media-tools") return send(res, 200, await mediaTools());
    if (kind === "events") {
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
      res.write(": connected\n\n");
      listeners.add(res);
      req.on("close", () => listeners.delete(res));
      return;
    }
    if (kind === "now") return send(res, 200, { utc: new Date().toISOString().replace(/\.\d+Z$/, "Z"), indiaDate: indiaNow().date });
    if (kind === "ig-reader") {
      if (req.method === "GET" && c === "known") return send(res, 200, Object.values(store.inbox).map((r) => r.shortcode || r.url).filter(Boolean));
      if (req.method !== "POST") throw httpErr(405, "POST only.");
      if (c === "run") { const r = await startReader("manual"); return send(res, r.ok ? 202 : 409, r.ok ? { started: true } : { error: r.error }); }
      if (c === "stop") { if (reader.child) reader.child.kill("SIGTERM"); return send(res, 200, { ok: true }); }
      if (c === "account") {
        if (!reader.running) throw httpErr(409, "The reader isn't running.");
        const seen = normHandle((await readBody(req)).handle), want = normHandle(readerCfg().account);
        reader.accountOk = !!seen && seen === want;
        readerNote({ account: seen || "(none)" });
        if (!reader.accountOk) { if (reader.child) setTimeout(() => reader.child && reader.child.kill("SIGTERM"), 500); throw httpErr(403, `Chrome is signed in as @${seen || "?"}, not @${want}. Stop now.`); }
        return send(res, 200, { ok: true });
      }
      if (c === "add") return send(res, 200, { results: readerAdd((await readBody(req)).items) });
      throw httpErr(404, "Not found.");
    }
    if (kind === "scout") {
      if (req.method === "POST") {
        if (scout.running) return send(res, 409, { error: "The scout is already running." });
        if (reader.running) return send(res, 409, { error: "The Instagram reader is running. Try again when it finishes." });
        // Not awaited: the radar takes about a minute first. A failure to start lands in the Scout log.
        startScout("manual");
        return send(res, 202, { started: true });
      }
      return send(res, 200, { running: scout.running, topic: scout.topic, left: (scout.queue || []).length, startedAt: scout.startedAt, lastExit: scout.lastExit, log: scout.log && path.relative(HERE, scout.log) });
    }
    if (kind === "radar" && req.method === "GET") {
      const latest = Object.keys(store.radar).sort().pop();
      if (!latest) throw httpErr(404, "No radar yet. It is taken when a scout run starts.");
      if (!store.topics[c]) throw httpErr(404, `No topic "${c}".`);
      return send(res, 200, { id: latest, ...radarFor(store.radar[latest], c, store.topics[c], store.settings.main || {}) });
    }
    if (kind === "batch" && req.method === "POST") {
      const { writes } = await readBody(req);
      if (!Array.isArray(writes)) throw httpErr(400, "Send {\"writes\": [...]}.");
      for (const w of writes) write(w.op, w.collection, w.doc_id, w.data);
      return send(res, 200, { ok: true, count: writes.length });
    }
    if (!COLLECTIONS.includes(c)) throw httpErr(404, `Unknown collection "${c}".`);
    if (kind === "col" && req.method === "GET") {
      const filters = [...url.searchParams.entries()];
      const rows = Object.entries(store[c]).filter(([, d]) => filters.every(([k, v]) => String(d[k]) === v)).map(([docId, data]) => ({ id: docId, data }));
      return send(res, 200, rows);
    }
    if (kind === "doc") {
      if (req.method === "GET") return store[c][id] ? send(res, 200, { id, data: store[c][id] }) : send(res, 404, { error: `${c}/${id} not found.` });
      if (req.method === "PUT") { write("set", c, id, await readBody(req)); return send(res, 200, { ok: true }); }
      if (req.method === "PATCH") { write("update", c, id, await readBody(req)); return send(res, 200, { ok: true }); }
      if (req.method === "DELETE") { write("delete", c, id); return send(res, 200, { ok: true }); }
    }
    send(res, 404, { error: "Not found." });
  } catch (e) {
    send(res, e.status || 500, { error: e.message || "Server error." });
  }
});
// The admin page on the live site works on a Firestore copy of this data and asks for runs there
// (local/cloud.mjs). Off without the key file or with --no-cloud.
if (!process.argv.includes("--no-cloud")) cloud.start({ dataDir: DATA, store, collections: COLLECTIONS, write, request: async (kind) => {
  if (kind === "scout") {
    if (scout.running) return { ok: false, error: "The scout is already running." };
    if (reader.running) return { ok: false, error: "The Instagram reader is running. Try again when it finishes." };
    startScout("manual");
    return { ok: true };
  }
  if (kind === "ig-run") return startReader("manual");
  if (kind === "publish") return startPublish();
  if (kind === "ig-stop") { if (reader.child) reader.child.kill("SIGTERM"); return { ok: true }; }
  return { ok: false, error: `Unknown request "${kind}".` };
} });
refreshPublish();
server.listen(PORT, "127.0.0.1", () => {
  const s = store.settings.main;
  console.log(`\nSkill Garden is running at http://localhost:${PORT}`);
  console.log(SCHEDULE ? `The weekly scout runs ${s.scoutDay || "Sun"} at ${s.scoutTime} India time while this window stays open.` : "The weekly scout is off (--no-schedule).");
  console.log("Close this window or press Ctrl+C to stop.\n");
});
server.on("error", (e) => {
  console.error(e.code === "EADDRINUSE" ? `Port ${PORT} is busy. Skill Garden may already be running: open http://localhost:${PORT}` : e.message);
  process.exit(1);
});
