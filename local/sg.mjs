#!/usr/bin/env node
// The scout's only way to read and write Skill Garden's data. It talks to the
// local server and nothing else, and reads files only from ./outbox, the one
// folder the scout may write to.
//
//   node sg.mjs now
//   node sg.mjs list <collection> [field=value ...]
//   node sg.mjs get <collection> <id>
//   node sg.mjs radar <topicId>        this run's radar, cut down to one topic
//   node sg.mjs set|update <collection> <id> '<json>'
//   node sg.mjs set|update <collection> <id> --file outbox/<name>.json
//   node sg.mjs delete <collection> <id>
//   node sg.mjs batch '<json array of {op, collection, doc_id, data}>' | --file outbox/<name>.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const OUTBOX = path.join(path.dirname(fileURLToPath(import.meta.url)), "outbox");
const BASE = `http://127.0.0.1:${process.env.SKILL_GARDEN_PORT || 4747}/api`;
const [cmd, ...args] = process.argv.slice(2);

async function stdinText() {
  if (process.stdin.isTTY) return "";
  let s = "";
  for await (const chunk of process.stdin) s += chunk;
  return s;
}
function outboxFile(p) {
  const real = fs.realpathSync(path.resolve(p));
  if (path.dirname(real) !== fs.realpathSync(OUTBOX)) throw new Error("--file must be a file directly inside the outbox folder.");
  return fs.readFileSync(real, "utf8");
}
async function jsonArg(raw, next) {
  const text = raw === "--file" ? outboxFile(next) : raw ?? (await stdinText());
  if (!text.trim()) throw new Error("Give the JSON as an argument or on stdin (a heredoc).");
  try { return JSON.parse(text); } catch (e) { throw new Error(`That isn't valid JSON: ${e.message}`); }
}
async function call(method, path, body) {
  const r = await fetch(BASE + path, { method, headers: { "Content-Type": "application/json", "X-Skill-Garden": "1" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}
const enc = encodeURIComponent;

try {
  let out;
  if (cmd === "now") out = await call("GET", "/now");
  else if (cmd === "list") {
    const [col, ...filters] = args;
    const qs = filters.length ? "?" + new URLSearchParams(filters.map((f) => f.split(/=(.*)/s).slice(0, 2))).toString() : "";
    out = await call("GET", `/col/${enc(col)}${qs}`);
  } else if (cmd === "get") out = await call("GET", `/doc/${enc(args[0])}/${enc(args[1])}`);
  else if (cmd === "radar") out = await call("GET", `/radar/${enc(args[0])}`);
  else if (cmd === "set") out = await call("PUT", `/doc/${enc(args[0])}/${enc(args[1])}`, await jsonArg(args[2], args[3]));
  else if (cmd === "update") out = await call("PATCH", `/doc/${enc(args[0])}/${enc(args[1])}`, await jsonArg(args[2], args[3]));
  else if (cmd === "delete") out = await call("DELETE", `/doc/${enc(args[0])}/${enc(args[1])}`);
  else if (cmd === "batch") { const w = await jsonArg(args[0], args[1]); out = await call("POST", "/batch", { writes: Array.isArray(w) ? w : w.writes }); }
  else throw new Error("Commands: now, list, get, radar, set, update, delete, batch.");
  console.log(JSON.stringify(out, null, 1));
} catch (e) {
  console.error(`sg: ${e.cause?.code === "ECONNREFUSED" ? "Skill Garden's server isn't running." : e.message}`);
  process.exit(1);
}
