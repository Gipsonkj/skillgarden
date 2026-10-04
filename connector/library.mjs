#!/usr/bin/env node
// The website's downloadable sub-skills: SKILL.md, files.json and a .zip for each sub-skill in
// catalog.json whose license allows sharing. They come from the SkillGarden library folder next to
// the app (SKILLGARDEN_LIBRARY to override), which is not in git, so GitHub Actions gets them from
// the "library" release instead: this Mac builds them into ./.library and publishes that.
//
//   node library.mjs            build ./.library from the library folder
//   node library.mjs --publish  build it, then upload it as the "library" release (after the library changes)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, "..");
export const SOURCE = path.resolve(process.env.SKILLGARDEN_LIBRARY || path.join(APP, ".."));
export const BUILT = path.join(HERE, ".library"); // lib/<skill>/… and manifest.json
const MAX_ASSET = 25 * 1024 * 1024; // Cloudflare's per-file limit
const RELEASE = "library", ASSET = "library.tar.gz";

/** Build BUILT/lib from the library folder; returns the manifest, or null without the library. */
export function buildLibrary(catalog) {
  if (!fs.existsSync(path.join(SOURCE, "skills"))) return null;
  fs.rmSync(BUILT, { recursive: true, force: true });
  const shared = [], tooBig = [];
  for (const t of catalog.topics) for (const s of t.skills || []) {
    if (!s.local) continue;
    const src = path.join(SOURCE, s.local);
    if (!s.local.startsWith("skills/") || !fs.existsSync(path.join(src, "SKILL.md"))) continue;
    const dest = path.join(BUILT, "lib", s.local);
    const zipPath = dest + ".zip";
    fs.mkdirSync(path.dirname(zipPath), { recursive: true });
    execFileSync("zip", ["-qr", "-X", zipPath, ".", "-x", ".*", "*/.*"], { cwd: src });
    if (fs.statSync(zipPath).size > MAX_ASSET) { fs.rmSync(zipPath); tooBig.push(s.local); continue; }
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
    shared.push(s.local);
  }
  const manifest = { shared, tooBig };
  fs.writeFileSync(path.join(BUILT, "manifest.json"), JSON.stringify(manifest));
  return manifest;
}

/** The library as last built here or downloaded from the release, or null. */
export function readLibrary() {
  try { return JSON.parse(fs.readFileSync(path.join(BUILT, "manifest.json"), "utf8")); } catch { return null; }
}

function publish() {
  const catalog = JSON.parse(fs.readFileSync(path.join(APP, "catalog", "catalog.json"), "utf8"));
  const m = buildLibrary(catalog);
  if (!m) throw new Error(`No library at ${SOURCE}.`);
  const tar = path.join(HERE, ASSET);
  execFileSync("tar", ["-czf", tar, "-C", BUILT, "."]);
  const gh = (...a) => execFileSync("gh", a, { cwd: APP, stdio: ["ignore", "pipe", "pipe"] }).toString();
  try { gh("release", "view", RELEASE); }
  catch { gh("release", "create", RELEASE, "--title", "Sub-skill library", "--notes", "Built by connector/library.mjs for the website's downloads. Not a version of Skill Garden.", "--latest=false"); }
  gh("release", "upload", RELEASE, tar, "--clobber");
  fs.rmSync(tar);
  console.log(`Published the library: ${m.shared.length} sub-skills, ${m.tooBig.length} too large (link only).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--publish")) publish();
  else { const m = buildLibrary(JSON.parse(fs.readFileSync(path.join(APP, "catalog", "catalog.json"), "utf8"))); console.log(m ? `Built .library: ${m.shared.length} sub-skills.` : `No library at ${SOURCE}.`); }
}
