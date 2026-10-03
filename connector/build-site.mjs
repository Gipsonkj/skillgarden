#!/usr/bin/env node
// Build the public, read-only Skill Garden website into ./public for Cloudflare.
// Wrangler runs this before every deploy. It includes:
//   index.html         the app in read-only mode (Explore, previews, search, bundles, downloads)
//   catalog.json       every craft and ranked sub-skill
//   data/topics.json   the 29 super skills, read from ../superskills
//   lib/<skill>/…      SKILL.md, files.json and a .zip for each sub-skill whose license allows sharing
// Sub-skills come from the SkillGarden library folder next to the app (SKILLGARDEN_LIBRARY to override).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const LIB = path.resolve(process.env.SKILLGARDEN_LIBRARY || path.join(APP, ".."));
const OUT = path.join(HERE, "public");
const MAX_ASSET = 25 * 1024 * 1024; // Cloudflare's per-file limit
const MAX_TEXT = 512 * 1024;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "data"), { recursive: true });

// The app page, wrapped the way server.mjs serves it, with the read-only runtime.
const head = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Skill Garden</title><meta name="description" content="29 super skills for Claude, each distilled from the best community skills, with every ranked sub-skill."><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif;background:#fafaf8}img{max-width:100%}[hidden]{display:none!important}</style><script src="/runtime-public.js"></script></head><body>`;
fs.writeFileSync(path.join(OUT, "index.html"), head + fs.readFileSync(path.join(APP, "skill-garden.html"), "utf8") + "</body></html>");
fs.copyFileSync(path.join(HERE, "runtime-public.js"), path.join(OUT, "runtime-public.js"));

// Super skills from ../superskills, versions from the local app when it has them.
const textFiles = (root) => {
  const out = {};
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.isSymbolicLink()) continue;
    const full = path.join(d, e.name), rel = path.relative(root, full).split(path.sep).join("/");
    if (e.isDirectory()) { walk(full); continue; }
    if (rel === "SKILL.md" || rel === "topic.json") continue;
    const buf = fs.readFileSync(full);
    if (buf.length <= MAX_TEXT && !buf.includes(0)) out[rel] = buf.toString("utf8");
  } };
  walk(root);
  return out;
};
const localTopics = (() => { try { return JSON.parse(fs.readFileSync(path.join(APP, "local", "data", "topics.json"), "utf8")); } catch { return {}; } })();
const SUPER = path.join(APP, "superskills");
const topics = {};
for (const id of fs.readdirSync(SUPER).sort()) {
  const dir = path.join(SUPER, id);
  if (!fs.existsSync(path.join(dir, "SKILL.md"))) continue;
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "topic.json"), "utf8"));
  topics[id] = { name: meta.name, blurb: meta.blurb, hue: meta.hue, order: Number(meta.order) || 0, active: true,
    version: Number(localTopics[id]?.version) || 1, updatedAt: localTopics[id]?.updatedAt || null,
    content: fs.readFileSync(path.join(dir, "SKILL.md"), "utf8"), files: textFiles(dir) };
}
fs.writeFileSync(path.join(OUT, "data", "topics.json"), JSON.stringify(topics));

// Catalog and the shareable sub-skills.
const catalog = JSON.parse(fs.readFileSync(path.join(APP, "catalog", "catalog.json"), "utf8"));
let shared = 0, tooBig = 0, missing = 0;
for (const t of catalog.topics) {
  delete t.zip; // the whole-craft library zips stay on your computer
  for (const s of t.skills || []) {
    if (!s.local) continue;
    const src = path.join(LIB, s.local);
    if (!s.local.startsWith("skills/") || !fs.existsSync(path.join(src, "SKILL.md"))) { s.local = null; missing++; continue; }
    const dest = path.join(OUT, "lib", s.local);
    const zipPath = dest + ".zip";
    fs.mkdirSync(path.dirname(zipPath), { recursive: true });
    execFileSync("zip", ["-qr", "-X", zipPath, ".", "-x", ".*", "*/.*"], { cwd: src });
    if (fs.statSync(zipPath).size > MAX_ASSET) { fs.rmSync(zipPath); s.local = null; s.notes = [s.notes, "Too large to host on the website; get it from the source."].filter(Boolean).join(" "); tooBig++; continue; }
    const files = [];
    const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith(".") || e.isSymbolicLink()) continue;
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f); else files.push({ path: path.relative(src, f).split(path.sep).join("/"), size: fs.statSync(f).size });
    } };
    walk(src);
    fs.mkdirSync(dest, { recursive: true });
    fs.writeFileSync(path.join(dest, "files.json"), JSON.stringify(files));
    fs.copyFileSync(path.join(src, "SKILL.md"), path.join(dest, "SKILL.md"));
    shared++;
  }
}
fs.writeFileSync(path.join(OUT, "catalog.json"), JSON.stringify(catalog));
console.log(`Built ${path.relative(process.cwd(), OUT) || "public"}: ${Object.keys(topics).length} super skills, ${shared} downloadable sub-skills${tooBig ? `, ${tooBig} too large (link only)` : ""}${missing ? `, ${missing} missing from the library` : ""}.`);
