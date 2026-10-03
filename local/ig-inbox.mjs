#!/usr/bin/env node
// The Instagram reader's only way to talk to Skill Garden. It can confirm which account
// Chrome is signed in to, list what's already in the inbox, and add new items. Nothing else.
//
//   node ig-inbox.mjs account <handle>               must match the dedicated account, or the run stops
//   node ig-inbox.mjs known                           shortcodes and links already in the inbox
//   node ig-inbox.mjs add --file outbox/<name>.json   a JSON array of items (see ig-reader.md)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const OUTBOX = path.join(path.dirname(fileURLToPath(import.meta.url)), "outbox");
const BASE = `http://127.0.0.1:${process.env.SKILL_GARDEN_PORT || 4747}/api/ig-reader`;
const [cmd, a, b] = process.argv.slice(2);
async function call(method, p, body) {
  const r = await fetch(BASE + p, { method, headers: { "Content-Type": "application/json", "X-Skill-Garden": "1" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}
try {
  if (cmd === "account" && a) console.log(JSON.stringify(await call("POST", "/account", { handle: a })));
  else if (cmd === "known") console.log(JSON.stringify(await call("GET", "/known")));
  else if (cmd === "add" && a === "--file" && b) {
    const real = fs.realpathSync(path.resolve(b));
    if (path.dirname(real) !== fs.realpathSync(OUTBOX)) throw new Error("--file must be a file directly inside the outbox folder.");
    console.log(JSON.stringify(await call("POST", "/add", { items: JSON.parse(fs.readFileSync(real, "utf8")) }), null, 1));
  } else { console.error("Usage: node ig-inbox.mjs account <handle> | known | add --file outbox/<name>.json"); process.exit(2); }
} catch (e) { console.error(e.message); process.exit(1); }
