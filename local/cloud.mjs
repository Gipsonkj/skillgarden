#!/usr/bin/env node
// Keeps this Mac's app data (local/data) and the Firestore copy behind the live site's admin page
// (/admin/) in step. The admins sign in there with Google and read and write Firestore directly;
// connector/firebase/firestore.rules lets in no one else. This Mac pushes every change it makes,
// pulls what the admins change online, and runs what they ask for (a scout run, an Instagram read).
// Google's REST APIs with the service-account key in ~/.claude/secrets/skillgarden-firebase.json;
// no npm packages. Without the key file, nothing here runs. The site build also reads the data
// here (readCollections), with an access token from GitHub Actions in place of the key.
//
//   node cloud.mjs rules     publish connector/firebase/firestore.rules
//   node cloud.mjs indexes   create the index the version history needs
//   node cloud.mjs status    how many documents each collection has in Firestore
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const KEY_FILE = process.env.SKILLGARDEN_FIREBASE_KEY || path.join(os.homedir(), ".claude", "secrets", "skillgarden-firebase.json");
export const enabled = () => fs.existsSync(KEY_FILE);

/* ---------- Google APIs as the service account ---------- */
let key = null, tok = null;
const loadKey = () => (key ||= JSON.parse(fs.readFileSync(KEY_FILE, "utf8")));
async function token() {
  // GitHub Actions signs in through Workload Identity Federation and hands over a short-lived token.
  if (process.env.SKILLGARDEN_GOOGLE_TOKEN) return process.env.SKILLGARDEN_GOOGLE_TOKEN;
  if (tok && tok.exp > Date.now() + 60_000) return tok.value;
  const k = loadKey(), now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: k.client_email, scope: "https://www.googleapis.com/auth/cloud-platform", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const sig = crypto.sign("RSA-SHA256", Buffer.from(unsigned), k.private_key).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Google refused the Mac's key: ${d.error_description || d.error || r.status}`);
  tok = { value: d.access_token, exp: Date.now() + d.expires_in * 1000 };
  return tok.value;
}
async function api(method, url, body) {
  const r = await fetch(url, { method, headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d.error?.message || `${method} ${url} → ${r.status}`), { status: r.status });
  return d;
}
const project = () => process.env.SKILLGARDEN_FIREBASE_PROJECT || loadKey().project_id;
const DOCS = () => `projects/${project()}/databases/(default)/documents`;
const FS = () => `https://firestore.googleapis.com/v1/${DOCS()}`;
const name = (c, id) => `${DOCS()}/${c}/${id}`;

/* ---------- JSON <-> Firestore values ---------- */
function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isSafeInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: v.length ? { values: v.map(toValue) } : {} };
  return { mapValue: { fields: toFields(v) } };
}
const toFields = (o) => Object.fromEntries(Object.entries(o).filter(([, x]) => x !== undefined).map(([k, x]) => [k, toValue(x)]));
function fromValue(v) {
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromValue);
  if ("mapValue" in v) return fromFields(v.mapValue.fields || {});
  if ("nullValue" in v) return null;
  for (const k of ["booleanValue", "stringValue", "timestampValue", "referenceValue", "bytesValue"]) if (k in v) return v[k];
  return null;
}
const fromFields = (f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, fromValue(v)]));
// Every document in Firestore carries who wrote it last and when (server time); the app never sees these.
const strip = ({ _ts, _by, ...rest }) => rest;

/** Every document of each collection, as { collection: { id: data } }, for the site build. */
export async function readCollections(cols) {
  const out = {};
  for (const c of cols) {
    out[c] = {};
    let page = "";
    do {
      const r = await api("GET", `${FS()}/${c}?pageSize=300${page ? `&pageToken=${encodeURIComponent(page)}` : ""}`);
      for (const d of r.documents || []) out[c][d.name.split("/").pop()] = strip(fromFields(d.fields || {}));
      page = r.nextPageToken || "";
    } while (page);
  }
  return out;
}

/* ---------- sync ---------- */
const MAX_DOC = 1_000_000;       // Firestore's limit is 1 MiB a document
const POLL = 20_000;             // how often the Mac asks whether the admins changed anything
const HEARTBEAT = 5 * 60_000;    // how often it tells the admin page it's online
const STALE_REQUEST = 2 * 3600_000;
let st = null;

// store: the server's collections; write(op, c, id, data): its write; request(kind): runs a scout or
// Instagram read for the admin page and returns { ok, error }.
export function start({ dataDir, store, collections, write, request }) {
  if (!enabled()) return null;
  const file = path.join(dataDir, ".cloud.json");
  const saved = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  st = { file, store, collections, write, request, dirty: new Set(saved.dirty || []), seeded: !!saved.seeded, lastPull: saved.lastPull || null, beacon: saved.beacon || null, applying: false, timer: null, failing: false };
  const persist = () => fs.writeFileSync(file, JSON.stringify({ seeded: st.seeded, lastPull: st.lastPull, beacon: st.beacon, dirty: [...st.dirty] }));
  st.persist = persist;
  if (!st.seeded) for (const c of collections) for (const id of Object.keys(store[c])) st.dirty.add(`${c}/${id}`);
  persist();
  console.log(`[cloud] syncing with Firestore (${project()})${st.seeded ? "" : ": first upload of everything"}`);
  flush();
  setInterval(() => pull().catch((e) => warn("pull", e)), POLL).unref();
  const beat = () => api("PATCH", `${FS()}/sync/mac`, { fields: toFields({ at: new Date().toISOString() }) }).catch((e) => warn("heartbeat", e));
  beat(); setInterval(beat, HEARTBEAT).unref();
  return st;
}

// Called by the server after every local write; changes the Mac pulled from Firestore aren't sent back.
export function changed(c, id) {
  if (!st || st.applying) return;
  st.dirty.add(`${c}/${id}`);
  st.persist();
  clearTimeout(st.timer);
  st.timer = setTimeout(() => flush().catch((e) => warn("push", e)), 1500);
}

async function commit(writes) { return api("POST", `${FS()}:commit`, { writes }); }
async function flush() {
  if (!st || !st.dirty.size) return;
  const keys = [...st.dirty];
  let batch = [], bytes = 0, sent = [], sentKeys = [], last = null;
  const send = async () => {
    if (!batch.length) return;
    const r = await commit(batch);
    last = r.commitTime || last;
    for (const k of sentKeys) st.dirty.delete(k);
    sent.push(...sentKeys); batch = []; bytes = 0; sentKeys = [];
    st.persist();
  };
  try {
    for (const k of keys) {
      const [c, id] = k.split("/");
      const doc = st.store[c] && st.store[c][id];
      let w;
      if (doc === undefined) w = { delete: name(c, id) };
      else {
        const size = Buffer.byteLength(JSON.stringify(doc));
        if (size > MAX_DOC) { console.warn(`[cloud] ${k} is ${Math.round(size / 1024)} KB, over Firestore's 1 MB limit; it stays on this Mac only.`); st.dirty.delete(k); continue; }
        w = { update: { name: name(c, id), fields: toFields({ ...doc, _by: "mac" }) }, updateTransforms: [{ fieldPath: "_ts", setToServerValue: "REQUEST_TIME" }] };
      }
      const n = Buffer.byteLength(JSON.stringify(w));
      if (batch.length && (bytes + n > 4_000_000 || batch.length >= 400)) await send();
      batch.push(w); bytes += n; sentKeys.push(k);
    }
    await send();
    if (st.failing) { st.failing = false; console.log("[cloud] back in sync"); }
    // After the first upload, only what the admins change from here on needs pulling.
    if (!st.seeded && !st.dirty.size) { st.seeded = true; st.lastPull ||= last; st.persist(); console.log(`[cloud] uploaded ${sent.length} documents`); }
  } catch (e) {
    warn("push", e);
    clearTimeout(st.timer);
    st.timer = setTimeout(() => flush().catch((err) => warn("push", err)), 30_000);
  }
}

// The admin page touches sync/web with every write, so one read tells the Mac whether to look further.
async function pull() {
  if (!st || !st.seeded) return;
  let beacon;
  try { beacon = (await api("GET", `${FS()}/sync/web`)).fields; }
  catch (e) { if (e.status === 404) return; throw e; }
  const at = beacon && beacon.at && fromValue(beacon.at);
  if (!at || at === st.beacon) return;
  const since = st.lastPull || "1970-01-01T00:00:00Z";
  for (const c of [...st.collections, "deleted", "requests"]) {
    const rows = await api("POST", `${FS()}:runQuery`, { structuredQuery: { from: [{ collectionId: c }], where: { fieldFilter: { field: { fieldPath: "_ts" }, op: "GREATER_THAN", value: { timestampValue: since } } } } });
    for (const row of rows) {
      if (!row.document) continue;
      const id = row.document.name.split("/").pop(), data = fromFields(row.document.fields || {});
      if (data._by === "mac") continue;
      if (c === "requests") { await handle(id, data); continue; }
      if (c === "deleted") { apply(data.col, data.id, undefined); continue; }
      apply(c, id, strip(data));
    }
  }
  st.lastPull = at; st.beacon = at;
  st.persist();
}
function apply(c, id, data) {
  if (!st.collections.includes(c) || st.dirty.has(`${c}/${id}`)) return;   // a change made here and not yet sent wins
  if (data === undefined && st.store[c][id] === undefined) return;
  if (data !== undefined && JSON.stringify(st.store[c][id]) === JSON.stringify(data)) return;
  st.applying = true;
  try { st.write(data === undefined ? "delete" : "set", c, id, data); console.log(`[cloud] ${data === undefined ? "deleted" : "updated"} ${c}/${id} from the admin page`); }
  catch (e) { warn(`apply ${c}/${id}`, e); }
  finally { st.applying = false; }
}
async function handle(id, req) {
  if (req.status !== "new") return;
  const age = Date.now() - Date.parse(req._ts || 0);
  const res = age > STALE_REQUEST ? { ok: false, error: "Asked for while this Mac was off; ask again." } : await st.request(req.kind).catch((e) => ({ ok: false, error: e.message }));
  console.log(`[cloud] ${req.kind} asked for by ${req._by}: ${res.ok ? "started" : res.error}`);
  await commit([{ update: { name: name("requests", id), fields: toFields({ ...strip(req), status: res.ok ? "started" : "failed", note: res.error || "", doneAt: new Date().toISOString(), _by: "mac" }) }, updateTransforms: [{ fieldPath: "_ts", setToServerValue: "REQUEST_TIME" }] }]);
}
function warn(what, e) {
  if (st && st.failing && what !== "apply") return;
  if (st) st.failing = true;
  console.warn(`[cloud] ${what} failed: ${e.message}. Changes wait on this Mac and go up when Firestore is reachable.`);
}

/* ---------- command line ---------- */
async function cli(cmd) {
  if (!enabled()) throw new Error(`No key at ${KEY_FILE}.`);
  if (cmd === "rules") {
    const content = fs.readFileSync(path.join(HERE, "..", "connector", "firebase", "firestore.rules"), "utf8");
    const set = await api("POST", `https://firebaserules.googleapis.com/v1/projects/${project()}/rulesets`, { source: { files: [{ name: "firestore.rules", content }] } });
    const rel = `projects/${project()}/releases/cloud.firestore`;
    await api("PATCH", `https://firebaserules.googleapis.com/v1/${rel}`, { release: { name: rel, rulesetName: set.name } })
      .catch((e) => (e.status === 404 ? api("POST", `https://firebaserules.googleapis.com/v1/projects/${project()}/releases`, { name: rel, rulesetName: set.name }) : Promise.reject(e)));
    return console.log(`Published ${set.name.split("/").pop()} as the Firestore rules.`);
  }
  if (cmd === "indexes") {
    const r = await api("POST", `https://firestore.googleapis.com/v1/projects/${project()}/databases/(default)/collectionGroups/versions/indexes`,
      { queryScope: "COLLECTION", fields: [{ fieldPath: "topicId", order: "ASCENDING" }, { fieldPath: "version", order: "DESCENDING" }] })
      .catch((e) => (e.status === 409 ? { name: "already there" } : e.status === 403
        ? Promise.reject(new Error(`The Mac's key can't create indexes. Signed in as an owner, run:\n  gcloud firestore indexes composite create --project=${project()} --collection-group=versions --query-scope=COLLECTION --field-config=field-path=topicId,order=ascending --field-config=field-path=version,order=descending --async`))
        : Promise.reject(e)));
    return console.log(`Version-history index: ${r.name ? "building (a few minutes)" : "ok"}.`);
  }
  if (cmd === "status") {
    for (const c of ["settings", "topics", "versions", "inbox", "candidates", "runs", "radar", "requests", "deleted", "sync"]) {
      const r = await api("POST", `${FS()}:runAggregationQuery`, { structuredAggregationQuery: { structuredQuery: { from: [{ collectionId: c }] }, aggregations: [{ alias: "n", count: {} }] } });
      console.log(c.padEnd(11), fromValue(r[0].result.aggregateFields.n));
    }
    return;
  }
  console.log("Usage: node cloud.mjs rules | indexes | status");
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) cli(process.argv[2]).catch((e) => { console.error(e.message); process.exit(1); });
