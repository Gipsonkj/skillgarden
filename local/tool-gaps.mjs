#!/usr/bin/env node
// Which of a craft's tools (topic.json `tools`) its guides actually teach. A tool counts as
// `covered` when a reference guide has a heading naming it or names it 3+ times itself (a how-to),
// `mentioned` when it is only named here and there, `missing` otherwise. The scout reads this (node sg.mjs gaps <topicId>)
// to find tools worth a guide section; the server uses the live files from the app, this CLI the
// repo's superskills/ folder:
//   node local/tool-gaps.mjs [craft ...] [--json]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const nameRe = (n) => new RegExp(`(?<![\\w-])${esc(n)}(?![\\w-])`, "gi");

// tools: topic.json `tools`; files: { "SKILL.md" | "references/x.md": text }.
export function toolGaps(tools = [], files = {}) {
  const guides = Object.entries(files).filter(([p, t]) => typeof t === "string" && t && (p === "SKILL.md" || /^references\/[^/]+\.md$/.test(p)));
  return tools.map((tool) => {
    const res = [tool.name, ...(tool.aliases || [])].filter((n) => String(n).trim().length > 1).map((n) => nameRe(String(n).trim()));
    let hits = 0, heading = false, deep = false;
    const where = [];
    for (const [p, text] of guides) {
      let n = 0;
      for (const line of text.split("\n")) {
        const k = res.reduce((sum, re) => sum + (line.match(re) || []).length, 0);
        if (!k) continue;
        n += k;
        if (/^#{1,6}\s/.test(line) && p !== "SKILL.md") heading = true;
      }
      if (n) { hits += n; where.push(p); }
      if (n >= 3 && p !== "SKILL.md") deep = true;
    }
    const status = heading || deep ? "covered" : hits ? "mentioned" : "missing";
    return { name: tool.name, tier: tool.tier || "minor", status, mentions: hits, in: where };
  }).sort((a, b) => (a.tier === b.tier ? 0 : a.tier === "major" ? -1 : 1) || ["missing", "mentioned", "covered"].indexOf(a.status) - ["missing", "mentioned", "covered"].indexOf(b.status));
}

function repoFiles(dir) {
  const out = { "SKILL.md": fs.readFileSync(path.join(dir, "SKILL.md"), "utf8") };
  const refs = path.join(dir, "references");
  if (fs.existsSync(refs)) for (const f of fs.readdirSync(refs)) if (f.endsWith(".md")) out[`references/${f}`] = fs.readFileSync(path.join(refs, f), "utf8");
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fs.realpathSync(process.argv[1])) {
  const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "superskills");
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const want = args.filter((a) => !a.startsWith("--"));
  const out = {};
  for (const id of (want.length ? want : fs.readdirSync(ROOT)).sort()) {
    const dir = path.join(ROOT, id);
    if (!fs.existsSync(path.join(dir, "topic.json"))) continue;
    const tools = JSON.parse(fs.readFileSync(path.join(dir, "topic.json"), "utf8")).tools;
    if (!tools?.length) continue;
    out[id] = toolGaps(tools, repoFiles(dir));
  }
  if (json) console.log(JSON.stringify(out, null, 1));
  else for (const [id, rows] of Object.entries(out)) {
    const miss = rows.filter((r) => r.tier === "major" && r.status !== "covered");
    console.log(`${id}: ${rows.filter((r) => r.status === "covered").length}/${rows.length} tools covered${miss.length ? `; major gaps: ${miss.map((r) => `${r.name} (${r.status})`).join(", ")}` : ""}`);
    for (const r of rows) console.log(`  ${r.tier === "major" ? "*" : " "} ${r.status.padEnd(9)} ${r.name}${r.in.length ? `  [${r.in.join(", ")}]` : ""}`);
  }
}
