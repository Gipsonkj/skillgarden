#!/usr/bin/env node
// Chains: one request that runs several super skill guides in order (a campaign runs
// research, then angles, hooks, posts, ads and a test plan). Each chain lives in
// ../chains/<id>/chain.json; its SKILL.md is generated from that file, so the plugin
// ships a skill per chain ("skillgarden:campaign") that stays in step with the data.
//
//   node chains.mjs           check every chain: guides exist, SKILL.md up to date
//   node chains.mjs --write   regenerate each chain's SKILL.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "..");
const SLUG = /^[a-z0-9][a-z0-9-]{0,60}$/;
const GUIDE = /^references\/[a-z0-9][a-z0-9._-]*\.md$/;

/** Every chain, in a stable order, each step's guides as [{ craft, guide }]. */
export function loadChains(root = ROOT) {
  const dir = path.join(root, "chains");
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const id of fs.readdirSync(dir).sort()) {
    const f = path.join(dir, id, "chain.json");
    if (!fs.existsSync(f)) continue;
    const c = JSON.parse(fs.readFileSync(f, "utf8"));
    c.steps = (c.steps || []).map((s) => ({ ...s, uses: [...(s.guides || []).map((g) => ({ craft: s.craft, guide: g })), ...(s.also || [])] }));
    const skill = path.join(dir, id, "SKILL.md");
    c.skill = fs.existsSync(skill) ? fs.readFileSync(skill, "utf8") : "";
    out.push(c);
  }
  return out;
}

export function problems(chain, root = ROOT) {
  const errs = [];
  if (!SLUG.test(chain.id || "")) errs.push(`bad id "${chain.id}"`);
  if (!chain.name || !chain.description) errs.push("needs a name and a description");
  if (!chain.steps.length) errs.push("has no steps");
  for (const s of chain.steps) for (const u of s.uses) {
    if (!SLUG.test(u.craft || "") || !GUIDE.test(u.guide || "")) { errs.push(`step ${s.id}: bad guide ${u.craft}/${u.guide}`); continue; }
    if (!fs.existsSync(path.join(root, "superskills", u.craft, u.guide))) errs.push(`step ${s.id}: ${u.craft}/${u.guide} doesn't exist`);
  }
  return errs;
}

const uses = (s) => s.uses.map((u) => `\`${u.craft}\` → \`${u.guide}\``).join(", ");

export function renderSkill(c) {
  const crafts = [...new Set(c.steps.flatMap((s) => s.uses.map((u) => u.craft)))];
  return `---
name: ${c.id}
description: ${JSON.stringify(c.description)}
---

<!-- Generated from chain.json by local/chains.mjs. Edit chain.json, then run: node local/chains.mjs --write -->

# ${c.name}

${c.blurb}

This is a **chain**: one request runs several Skill Garden super skills in order, each step using the guide written for it. It needs these super skills installed: ${crafts.map((x) => `\`${x}\``).join(", ")}. With the Skill Garden plugin they are \`skillgarden:<name>\`; on the Skill Garden connector, read each guide with \`get_guide\`.

Ask like this: "${c.ask}"

## Before step 1: gather the inputs once

Ask only for what the request and the conversation don't already give you, in one message:

${c.inputs.map((x) => `- ${x}`).join("\n")}

If something stays unknown, pick a sensible default, say which, and go on.

## Run the steps in order

For each step: load the named super skill, read the guides listed (and only those), do the step the way the guide says, and save the result as \`${c.id}/<n>-<step>.md\` in the working folder (or as a section of one document where files aren't available). Each step builds on the files before it. Don't stop between steps to ask "continue?". Stop only for a decision the user has to make, and say what it is.

${c.steps.map((s, k) => `### ${k + 1}. ${s.title}

- **Read:** ${uses(s)}
- **Deliver:** ${s.output}`).join("\n\n")}

## Finish

End with a short summary: what each step produced (file names), the decisions you made on the user's behalf, and the one thing to do first. Facts, numbers and claims come only from the user's inputs and the research step. Never invent results, testimonials or prices.
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes("--write");
  let bad = 0;
  for (const c of loadChains()) {
    const errs = problems(c);
    const file = path.join(ROOT, "chains", c.id, "SKILL.md");
    const want = renderSkill(c);
    if (write && !errs.length) fs.writeFileSync(file, want);
    else if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== want) errs.push("SKILL.md is out of date (run with --write)");
    console.log(errs.length ? `✗ ${c.id}: ${errs.join("; ")}` : `✓ ${c.id} (${c.steps.length} steps)`);
    bad += errs.length;
  }
  process.exit(bad ? 1 : 0);
}
