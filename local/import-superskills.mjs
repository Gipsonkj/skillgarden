#!/usr/bin/env node
// Load the super skills in ../superskills into the running local Skill Garden.
//
//   node import-superskills.mjs            import every folder in ../superskills
//   node import-superskills.mjs seo ai-video   import only these
//   node import-superskills.mjs --inactive     import with "Scout this topic" off
//
// Each folder holds SKILL.md, topic.json (name, blurb, hue, searches, tests) and any
// references/, scripts/ or templates/ files. Text files ride along as topic.files and
// come with the skill's download. A topic that already has the same content is left alone;
// a changed one gets a new version. New topics join the weekly scout (one topic at a time).
// The three hand-made starter topics that a super skill replaces are folded into it, history kept.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.resolve(HERE, "..", "superskills");
const BASE = `http://127.0.0.1:${process.env.SKILL_GARDEN_PORT || process.env.PORT || 4747}/api`;
const MAX_FILE = 512 * 1024;
const args = process.argv.slice(2);
const only = args.filter((a) => !a.startsWith("--"));
const ACTIVE = !args.includes("--inactive");
const SUPERSEDES = { "website-building": "websites", "motion-animation": "motion-graphics", "poster-design": "ai-posters" };

async function call(method, p, body) {
  const r = await fetch(BASE + p, { method, headers: { "Content-Type": "application/json", "X-Skill-Garden": "1" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok && r.status !== 404) throw new Error(data.error || `HTTP ${r.status}`);
  return r.ok ? data : null;
}
function textFiles(root) {
  const out = {};
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name), rel = path.relative(root, full).split(path.sep).join("/");
      if (e.name === ".DS_Store" || e.name === ".git") continue;
      if (e.isDirectory()) { walk(full); continue; }
      if (rel === "SKILL.md" || rel === "topic.json") continue;
      const buf = fs.readFileSync(full);
      if (buf.length > MAX_FILE || buf.includes(0)) { console.log(`  skipped ${rel} (binary or over 512 KB)`); continue; }
      out[rel] = buf.toString("utf8");
    }
  };
  walk(root);
  return out;
}

try { await call("GET", "/now"); } catch { console.error("Skill Garden isn't running. Start it first (node server.mjs), then run this again."); process.exit(1); }
const slugs = fs.readdirSync(DIR).filter((s) => fs.existsSync(path.join(DIR, s, "SKILL.md")) && (!only.length || only.includes(s)));
const order0 = Math.max(0, ...(await call("GET", "/col/topics")).map((r) => Number(r.data.order) || 0));
const now = new Date().toISOString();
let made = 0, updated = 0, same = 0;
for (const [i, slug] of slugs.entries()) {
  const dir = path.join(DIR, slug);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "topic.json"), "utf8"));
  const content = fs.readFileSync(path.join(dir, "SKILL.md"), "utf8");
  const files = textFiles(dir);
  const cur = (await call("GET", `/doc/topics/${slug}`))?.data;
  if (cur && cur.content === content && JSON.stringify(cur.files || {}) === JSON.stringify(files)) { same++; continue; }
  const version = (Number(cur?.version) || 0) + 1;
  const summary = cur ? "Updated super skill from SkillGarden" : "Super skill built from the SkillGarden library";
  await call("PUT", `/doc/versions/${slug}--v${version}`, { topicId: slug, version, content, files, summary, source: "superskill", createdAt: now });
  await call("PUT", `/doc/topics/${slug}`, {
    ...(cur || { active: ACTIVE, collections: meta.collections || [], order: order0 + i + 1, repos: meta.repos || [] }),
    name: meta.name, blurb: meta.blurb, hue: meta.hue ?? (i * 37) % 360,
    searches: cur?.searches?.length ? cur.searches : meta.searches || [],
    // Tests edited in the app stay; seed tests it doesn't have yet (by id, e.g. a new t4) are added.
    tests: cur?.tests?.length ? [...cur.tests, ...(meta.tests || []).filter((x) => !cur.tests.some((c) => c.id === x.id))] : meta.tests || [],
    version, content, files, updatedAt: now,
  });
  cur ? updated++ : made++;
  console.log(`${cur ? "updated" : "added  "} ${slug} v${version} (${Object.keys(files).length} files)`);
}
// Fold each hand-made starter topic into the super skill that replaced it, so there's one
// card per craft. Its versions become earlier versions (v0.1, v0.2…), and its reels, review
// history, Instagram collections and watched repos move over. Nothing is lost.
for (const [slug, oldId] of Object.entries(SUPERSEDES)) {
  if (only.length && !only.includes(slug)) continue;
  const old = (await call("GET", `/doc/topics/${oldId}`))?.data;
  const cur = (await call("GET", `/doc/topics/${slug}`))?.data;
  if (!old || !cur) continue;
  const uniq = (...lists) => [...new Map(lists.flat().filter(Boolean).map((x) => [String(x).toLowerCase(), x])).values()];
  const writes = [];
  for (const { id, data } of await call("GET", "/col/versions")) {
    if (data.topicId !== oldId) continue;
    writes.push({ op: "set", collection: "versions", doc_id: `${slug}--starter-v${data.version}`, data: { ...data, topicId: slug, version: Number(`0.${data.version}`), source: "starter", summary: `${old.name} (starter skill): ${data.summary || ""}`.replace(/: $/, ""), foldedFrom: oldId } });
    writes.push({ op: "delete", collection: "versions", doc_id: id });
  }
  for (const col of ["candidates", "inbox"]) for (const { id, data } of await call("GET", `/col/${col}`))
    if (data.topicId === oldId) writes.push({ op: "update", collection: col, doc_id: id, data: { topicId: slug } });
  writes.push({ op: "update", collection: "topics", doc_id: slug, data: { collections: uniq(cur.collections || [], old.collections || []), repos: uniq(cur.repos || [], old.repos || []) } });
  writes.push({ op: "delete", collection: "topics", doc_id: oldId });
  for (let i = 0; i < writes.length; i += 50) await call("POST", "/batch", { writes: writes.slice(i, i + 50) });
  console.log(`  folded ${oldId} into ${slug} (${writes.length - 2} records moved)`);
}
console.log(`\nDone: ${made} added, ${updated} updated, ${same} unchanged. Open http://localhost:${process.env.PORT || 4747} → Explore.`);
