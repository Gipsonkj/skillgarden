// Feedback on the super skills, gathered into the app's `feedback` collection (and from there, by
// cloud.mjs, into Firestore for the admin page). Two sources:
//   - this Mac's own notes from /skillgarden:feedback, in ~/.claude/skillgarden/feedback.jsonl
//     (this Mac has ~/.claude/skillgarden/local-garden, so the plugin doesn't offer to send them);
//   - notes other people chose to send, waiting on the live site (connector/worker.js /feedback),
//     collected with the key in ~/.claude/secrets/skillgarden-feedback.key and then removed there.
// The usage log (~/.claude/skillgarden/usage/<sessionId>.json, written by the plugin's Stop and
// SessionEnd hooks) stays in files; usage() sums it up for one craft when asked.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOME = path.join(os.homedir(), ".claude", "skillgarden");
const NOTES = path.join(HOME, "feedback.jsonl");
const USAGE = path.join(HOME, "usage");
const KEY_FILE = process.env.SKILLGARDEN_FEEDBACK_KEY_FILE || path.join(os.homedir(), ".claude", "secrets", "skillgarden-feedback.key");
const SITE = process.env.SKILLGARDEN_SITE || "https://skillgarden.gipsonkj.workers.dev";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lines = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : []);

// Which topics a note reaches. Only crafts are topics: a chain counts as the crafts its steps use, and a
// note about the superseed planner alone (or naming nothing) is tagged with the crafts its text names,
// so their scout runs see it. Planner notes are also flagged for the person in Review.
const ids = (dir, file) => { try { return fs.readdirSync(path.join(ROOT, dir)).filter((d) => fs.existsSync(path.join(ROOT, dir, d, file))); } catch { return []; } };
function topicsOf(crafts, text) {
  const topics = new Set(ids("superskills", "SKILL.md")), out = new Set();
  for (const c of crafts) {
    if (topics.has(c.id)) out.add(c.id);
    else if (fs.existsSync(path.join(ROOT, "chains", c.id, "chain.json"))) {
      try { for (const s of JSON.parse(fs.readFileSync(path.join(ROOT, "chains", c.id, "chain.json"), "utf8")).steps || []) if (topics.has(s.craft)) out.add(s.craft); } catch {}
    }
  }
  const byText = !out.size;
  if (byText) for (const t of topics) if (new RegExp(`\\b${t.replace(/-/g, "[- ]")}\\b`, "i").test(text)) out.add(t);
  return { topicIds: [...out], byText };
}

// Notes are data from people, not instructions: the scout reads them as leads to check.
export function toDoc(n, source) {
  const crafts = (n.crafts || []).map((c) => ({ id: String(c.id), fired: Number(c.fired) || 0, guides: (c.guides || []).map(String) }));
  const { topicIds, byText } = topicsOf(crafts, [n.task, n.detail, n.words].filter(Boolean).join(" "));
  return {
    source, at: n.at || null, receivedAt: n.receivedAt || null, plugin: n.plugin || null,
    problem: n.problem || "other", rating: n.rating ?? null, task: n.task || "", detail: n.detail || "", words: n.words || "",
    crafts, topicIds, ...(byText && topicIds.length ? { taggedByText: true } : {}),
    planner: crafts.some((c) => c.id === "superseed") || !topicIds.length,
    prompts: n.prompts ?? null, minutes: n.minutes ?? null, tokens: n.tokens || null, model: n.model || null,
    status: "new",
  };
}

let busy = null;
export function collect(store, write) {
  return (busy ||= run(store, write).finally(() => { busy = null; }));
}
async function run(store, write) {
  const out = { local: 0, site: 0, siteError: null };
  for (const n of lines(NOTES)) {
    if (!n.id || store.feedback[n.id]) continue;
    write("set", "feedback", n.id, toDoc(n, "you"));
    out.local++;
  }
  if (!fs.existsSync(KEY_FILE)) return out;
  try {
    const auth = { Authorization: `Bearer ${fs.readFileSync(KEY_FILE, "utf8").trim()}` };
    const r = await fetch(`${SITE}/feedback/inbox`, { headers: auth, signal: AbortSignal.timeout(20000) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || `the site answered ${r.status}`);
    const got = [];
    for (const n of d.notes || []) {
      if (!/^[0-9a-f-]{36}$/.test(String(n.id))) continue;
      if (!store.feedback[n.id]) { write("set", "feedback", n.id, toDoc(n, n.via === "connector" ? "connector" : "user")); out.site++; }
      got.push(n.id);
    }
    if (got.length) await fetch(`${SITE}/feedback/ack`, { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ ids: got }), signal: AbortSignal.timeout(20000) });
  } catch (e) { out.siteError = e.message; }
  return out;
}

// What the usage log says about one craft: how often it fired, how often it fired and no guide was
// read, which guides were read and which never were, and the typical new tokens per session.
export function usage(topicId, guides = [], days = 90) {
  const since = Date.now() - days * 864e5;
  const rows = (fs.existsSync(USAGE) ? fs.readdirSync(USAGE).filter((f) => f.endsWith(".json")) : [])
    .map((f) => { try { return JSON.parse(fs.readFileSync(path.join(USAGE, f), "utf8")); } catch { return null; } })
    .filter((u) => u && Date.parse(u.at) >= since);
  const read = {}, tokens = [];
  let sessions = 0, fired = 0, ignored = 0;
  for (const u of rows) {
    const c = (u.crafts || []).find((x) => x.id === topicId);
    if (!c) continue;
    sessions++;
    if (c.fired) fired++;
    if (c.fired && !(c.guides || []).length) ignored++;
    for (const g of c.guides || []) read[g] = (read[g] || 0) + 1;
    if (u.tokens) tokens.push((u.tokens.input || 0) + (u.tokens.cacheWrite || 0) + (u.tokens.output || 0));
  }
  tokens.sort((a, b) => a - b);
  return {
    days, loggedSessions: rows.length, sessions, fired, firedNoGuide: ignored, guidesRead: read,
    neverRead: guides.filter((g) => !read[g]),
    medianNewTokens: tokens.length ? tokens[tokens.length >> 1] : null,
    logOn: fs.existsSync(path.join(HOME, "usage-on")),
  };
}
