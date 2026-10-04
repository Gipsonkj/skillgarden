#!/usr/bin/env node
// Build the public, read-only Skill Garden website into ./public for Cloudflare.
// Wrangler runs this before every deploy. It includes:
//   index.html         the landing page (./landing) with its hero film (film/) and stills (img/)
//   explore/index.html the app in read-only mode (Explore, previews, search, bundles, downloads)
//   admin/index.html   the whole app for the admins (Google sign-in, data in Firestore; see runtime-cloud.js)
//   catalog.json       every craft and ranked sub-skill
//   data/topics.json   the super skills, read from ../superskills
//   lib/<skill>/…      SKILL.md, files.json and a .zip for each sub-skill whose license allows sharing
//   chains.json        the chains in ../chains (one ask that runs several super skills in order)
//   credits.json       "Where this came from" for each approved version: creator handles, public
//                      reel links and source pages only, never notes, transcripts or freebie text
// Sub-skills come from the SkillGarden library folder next to the app (SKILLGARDEN_LIBRARY to override).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadChains, problems } from "../local/chains.mjs";
import { stale as staleCraftMap } from "../local/craft-map.mjs";
import { buildCredits } from "../local/credits.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
const LIB = path.resolve(process.env.SKILLGARDEN_LIBRARY || path.join(APP, ".."));
const OUT = path.join(HERE, "public");
const MAX_ASSET = 25 * 1024 * 1024; // Cloudflare's per-file limit
const MAX_TEXT = 512 * 1024;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "data"), { recursive: true });

// The app page at /explore/, wrapped the way server.mjs serves it, with the read-only runtime.
// The landing page (./landing) takes / and is written at the end, once the counts are known.
const APP_HTML = fs.readFileSync(path.join(APP, "skill-garden.html"), "utf8");
const head = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Skill Garden</title><meta name="description" content="One super skill for every craft Claude works in, each distilled from the best community skills, with every ranked sub-skill."><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif;background:#fafaf8}img{max-width:100%}[hidden]{display:none!important}</style><script src="/runtime-public.js"></script></head><body>`;
fs.mkdirSync(path.join(OUT, "explore"), { recursive: true });
fs.writeFileSync(path.join(OUT, "explore", "index.html"), head + APP_HTML + "</body></html>");
fs.copyFileSync(path.join(HERE, "runtime-public.js"), path.join(OUT, "runtime-public.js"));
// The whole app at /admin/ for the garden's admins: Google sign-in, data in Firestore (runtime-cloud.js).
// The page holds no data; firebase/firestore.rules lets only the admins read any.
const adminHead = head.replace("<title>Skill Garden</title>", `<title>Skill Garden admin</title><meta name="robots" content="noindex">`).replace("/runtime-public.js", "/runtime-cloud.js");
fs.mkdirSync(path.join(OUT, "admin"), { recursive: true });
fs.writeFileSync(path.join(OUT, "admin", "index.html"), adminHead + APP_HTML + "</body></html>");
fs.copyFileSync(path.join(HERE, "runtime-cloud.js"), path.join(OUT, "runtime-cloud.js"));
for (const dir of ["film", "img"]) {
  const src = path.join(HERE, "landing", dir);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(OUT, dir), { recursive: true });
}

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
    // Example requests for the craft page's "Try asking" (the prompts only, not the grading notes).
    tests: (meta.tests || []).slice(0, 2).map(({ id, prompt }) => ({ id, prompt })),
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

// Chains, checked against the super skills so a broken step never ships.
const chains = loadChains(APP);
const oldMap = staleCraftMap(APP);
if (oldMap.length) throw new Error(`Planner craft map out of date (${oldMap.join(", ")}). Run: node local/craft-map.mjs --write`);
for (const c of chains) { const errs = problems(c, APP); if (errs.length) throw new Error(`Chain ${c.id}: ${errs.join("; ")}`); }
fs.writeFileSync(path.join(OUT, "chains.json"), JSON.stringify(chains));

// Credits from the local app's data (empty until the scout's first approved change).
const local = (c) => { try { return JSON.parse(fs.readFileSync(path.join(APP, "local", "data", c + ".json"), "utf8")); } catch { return {}; } };
const credits = buildCredits({ versions: local("versions"), candidates: local("candidates"), inbox: local("inbox") });
fs.writeFileSync(path.join(OUT, "credits.json"), JSON.stringify(credits));

// The landing page: counts and lists filled in from the same data, grouped the way the app groups
// crafts (its CATS list is the one source for that).
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const catsSrc = APP_HTML.match(/const CATS = (\[[\s\S]*?\n\s*\]);/);
if (!catsSrc) throw new Error("CATS not found in skill-garden.html");
const CATS = new Function(`return ${catsSrc[1]}`)();
const byId = Object.fromEntries(catalog.topics.map((t) => [t.id, t]));
const unplaced = catalog.topics.filter((t) => !CATS.some((c) => c.ids.includes(t.id))).map((t) => t.id);
if (unplaced.length) throw new Error(`Crafts missing from CATS in skill-garden.html: ${unplaced.join(", ")}`);
const craftsHtml = CATS.map((c) => `        <div class="bed"><h3>${esc(c.name)}</h3><ul>${c.ids.filter((id) => byId[id]).map((id) => {
  const t = byId[id], n = (t.skills || []).length;
  return `<li><a href="/explore/#/c/${esc(id)}" style="--h:${Number(t.hue) || 165}"><i></i>${esc(t.name)}<small>${n} skills</small></a></li>`;
}).join("")}</ul></div>`).join("\n");
const chainsHtml = chains.map((x) => {
  const path = [...new Set((x.steps || []).map((s) => byId[s.craft]?.name || s.craft))];
  return `        <li><a href="/explore/#/chain/${esc(x.id)}"><div><h3>${esc(x.name)}</h3><div class="path">${path.map((p, i) => `<span style="--i:${i}">${esc(p)}</span>`).join(" → ")}</div></div><p>${esc(x.blurb)}</p></a></li>`;
}).join("\n");
const counts = { CRAFTS: Object.keys(topics).length, SKILLS: catalog.topics.reduce((n, t) => n + (t.skills || []).length, 0), SHARED: shared, CHAINS: chains.length };
const landing = fs.readFileSync(path.join(HERE, "landing", "index.html"), "utf8")
  .replace("<!--CRAFTS-->", craftsHtml).replace("<!--CHAINS-->", chainsHtml)
  .replace(/\{\{(CRAFTS|SKILLS|SHARED|CHAINS)\}\}/g, (_, k) => String(counts[k]));
fs.writeFileSync(path.join(OUT, "index.html"), landing);
console.log(`Built ${path.relative(process.cwd(), OUT) || "public"}: ${Object.keys(topics).length} super skills, ${chains.length} chains, ${credits.feed.length} credited changes, ${shared} downloadable sub-skills${tooBig ? `, ${tooBig} too large (link only)` : ""}${missing ? `, ${missing} missing from the library` : ""}.`);
