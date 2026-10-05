#!/usr/bin/env node
// The website's downloadable sub-skills: SKILL.md, files.json and a .zip for each sub-skill in
// catalog.json whose license allows sharing. They come from the SkillGarden library folder next to
// the app (SKILLGARDEN_LIBRARY to override), which is not in git, so GitHub Actions gets them from
// the "library" release instead: this Mac builds them into ./.library and publishes that.
//
//   node library.mjs            build ./.library from the library folder
//   node library.mjs --publish  build it, then upload it as the "library" release (after the library changes)
//   node library.mjs --publish --if-changed [--ref <commit>]
//                               the same, only when the library differs from the release (the pre-push
//                               hook in .githooks runs this for pushes to main, with the pushed commit's catalog)
import crypto from "node:crypto";
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

// The catalog's sub-skills that are in the library folder.
const sources = (catalog) => catalog.topics.flatMap((t) => (t.skills || []).map((s) => s.local))
  .filter((l) => l && l.startsWith("skills/") && fs.existsSync(path.join(SOURCE, l, "SKILL.md")));
const filesOf = (src) => { const out = []; const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  if (e.name.startsWith(".") || e.isSymbolicLink()) continue;
  const f = path.join(d, e.name);
  if (e.isDirectory()) walk(f); else out.push(f);
} }; walk(src); return out.sort(); };

/** A hash of everything that goes into the library: this file, the sub-skill list and every file's content. */
export function fingerprint(catalog) {
  const h = crypto.createHash("sha256").update(fs.readFileSync(fileURLToPath(import.meta.url)));
  for (const l of [...new Set(sources(catalog))].sort()) for (const f of filesOf(path.join(SOURCE, l))) {
    h.update(path.relative(SOURCE, f) + "\0").update(fs.readFileSync(f)).update("\0");
  }
  return h.digest("hex");
}

/** Build BUILT/lib from the library folder; returns the manifest, or null without the library. */
export function buildLibrary(catalog) {
  if (!fs.existsSync(path.join(SOURCE, "skills"))) return null;
  fs.rmSync(BUILT, { recursive: true, force: true });
  const shared = [], tooBig = [];
  for (const local of sources(catalog)) {
    const src = path.join(SOURCE, local);
    const dest = path.join(BUILT, "lib", local);
    const zipPath = dest + ".zip";
    fs.mkdirSync(path.dirname(zipPath), { recursive: true });
    execFileSync("zip", ["-qr", "-X", zipPath, ".", "-x", ".*", "*/.*"], { cwd: src });
    if (fs.statSync(zipPath).size > MAX_ASSET) { fs.rmSync(zipPath); tooBig.push(local); continue; }
    const files = filesOf(src).map((f) => ({ path: path.relative(src, f).split(path.sep).join("/"), size: fs.statSync(f).size }));
    fs.mkdirSync(dest, { recursive: true });
    fs.writeFileSync(path.join(dest, "files.json"), JSON.stringify(files));
    fs.copyFileSync(path.join(src, "SKILL.md"), path.join(dest, "SKILL.md"));
    shared.push(local);
  }
  const manifest = { shared, tooBig };
  fs.writeFileSync(path.join(BUILT, "manifest.json"), JSON.stringify(manifest));
  return manifest;
}

/** The library as last built here or downloaded from the release, or null. */
export function readLibrary() {
  try { return JSON.parse(fs.readFileSync(path.join(BUILT, "manifest.json"), "utf8")); } catch { return null; }
}

function publish(catalog, ifChanged) {
  if (!fs.existsSync(path.join(SOURCE, "skills"))) throw new Error(`No library at ${SOURCE}.`);
  const gh = (...a) => execFileSync("gh", a, { cwd: APP, stdio: ["ignore", "pipe", "pipe"] }).toString();
  const fp = fingerprint(catalog);
  let body = null;
  try { body = gh("release", "view", RELEASE, "--json", "body", "-q", ".body"); } catch {}
  if (ifChanged && body?.includes(`fingerprint: ${fp}`)) { console.log("The published library is up to date."); return; }
  console.log("Publishing the sub-skill library (the website's downloads)…");
  const m = buildLibrary(catalog);
  const tar = path.join(HERE, ASSET);
  execFileSync("tar", ["-czf", tar, "-C", BUILT, "."]);
  const notes = `Built by connector/library.mjs for the website's downloads. Not a version of Skill Garden.\n\nfingerprint: ${fp}`;
  if (body === null) gh("release", "create", RELEASE, "--title", "Sub-skill library", "--notes", notes, "--latest=false");
  gh("release", "upload", RELEASE, tar, "--clobber");
  gh("release", "edit", RELEASE, "--notes", notes); // the fingerprint goes up only once the upload has worked
  fs.rmSync(tar);
  console.log(`Published the library: ${m.shared.length} sub-skills, ${m.tooBig.length} too large (link only).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ref = process.argv[process.argv.indexOf("--ref") + 1];
  const catalog = JSON.parse(process.argv.includes("--ref")
    ? execFileSync("git", ["show", `${ref}:catalog/catalog.json`], { cwd: APP, maxBuffer: 1 << 28 }).toString()
    : fs.readFileSync(path.join(APP, "catalog", "catalog.json"), "utf8"));
  if (process.argv.includes("--publish")) publish(catalog, process.argv.includes("--if-changed"));
  else { const m = buildLibrary(catalog); console.log(m ? `Built .library: ${m.shared.length} sub-skills.` : `No library at ${SOURCE}.`); }
}
