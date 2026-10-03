// Skill Garden connector: a small read-only MCP server for claude.ai and the Claude apps.
// It reads the super skills and the sub-skill catalog straight from the GitHub repo, so a
// super skill you approve and push shows up here with no redeploy.
//
// Endpoint: POST /mcp (streamable HTTP, JSON responses, stateless).
// Access: set the ACCESS_KEYS secret to a comma-separated list of keys. A client sends one as
// "Authorization: Bearer <key>" or, for claude.ai custom connectors that can't send headers,
// as the last path segment: /mcp/<key>. With no ACCESS_KEYS set, the server is open.
//
// Vars (wrangler.toml): REPO (owner/name), REF (branch). Optional secret GITHUB_TOKEN raises
// GitHub's rate limit for the one file-list call made every few minutes.

const PROTOCOL = "2025-06-18";
const CACHE_SECONDS = 300;

const TOOLS = [
  {
    name: "list_crafts",
    description: "List the 29 Skill Garden crafts (topics). Each has one super skill that routes to distilled guides. Call this first to find the craft id for a task.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_super_skill",
    description: "Get a craft's super skill: its router (SKILL.md), which says which guide to read for which task, plus the list of its guide files. Then call get_guide for the guide the task needs.",
    inputSchema: { type: "object", properties: { craft: { type: "string", description: "Craft id from list_crafts, e.g. backend-databases" } }, required: ["craft"], additionalProperties: false },
  },
  {
    name: "get_guide",
    description: "Read one file from a super skill, usually references/<guide>.md as named by its router.",
    inputSchema: {
      type: "object",
      properties: { craft: { type: "string" }, path: { type: "string", description: "Path inside the super skill, e.g. references/postgres-schema.md" } },
      required: ["craft", "path"], additionalProperties: false,
    },
  },
  {
    name: "search_skills",
    description: "Search all ranked sub-skills across every craft (name, purpose, how to use). Returns the best matches with their craft, rank, stars, license and source link.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" }, craft: { type: "string", description: "Optional craft id to search within" }, limit: { type: "number", minimum: 1, maximum: 25 } },
      required: ["query"], additionalProperties: false,
    },
  },
];

/* ---------- GitHub reads, cached ---------- */
const memo = new Map();
async function cached(key, load) {
  const hit = memo.get(key);
  if (hit && hit.until > Date.now()) return hit.value;
  const value = await load();
  memo.set(key, { value, until: Date.now() + CACHE_SECONDS * 1000 });
  return value;
}
function ghHeaders(env) {
  const h = { "User-Agent": "skillgarden-connector", Accept: "application/vnd.github+json" };
  if (env.GITHUB_TOKEN) h.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  return h;
}
async function raw(env, path) {
  return cached(`raw:${path}`, async () => {
    const r = await fetch(`https://raw.githubusercontent.com/${env.REPO}/${env.REF}/${path}`, { headers: { "User-Agent": "skillgarden-connector" } });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`GitHub returned ${r.status} for ${path}`);
    return r.text();
  });
}
async function tree(env) {
  return cached("tree", async () => {
    const r = await fetch(`https://api.github.com/repos/${env.REPO}/git/trees/${env.REF}?recursive=1`, { headers: ghHeaders(env) });
    if (!r.ok) throw new Error(`GitHub returned ${r.status} listing the repo`);
    const files = {};
    for (const e of (await r.json()).tree || []) {
      const m = e.type === "blob" && /^superskills\/([^/]+)\/(.+)$/.exec(e.path);
      if (m) (files[m[1]] ||= []).push({ path: m[2], size: e.size });
    }
    return files;
  });
}
async function catalog(env) {
  return cached("catalog", async () => JSON.parse((await raw(env, "catalog/catalog.json")) || '{"topics":[]}').topics || []);
}

/* ---------- tools ---------- */
const SLUG = /^[a-z0-9][a-z0-9-]{0,60}$/;
const text = (t) => ({ content: [{ type: "text", text: t }] });
const fail = (t) => ({ content: [{ type: "text", text: t }], isError: true });

async function callTool(env, name, args = {}) {
  if (name === "list_crafts") {
    const [topics, files] = await Promise.all([catalog(env), tree(env)]);
    const rows = topics.filter((t) => files[t.id]).map((t) => `- ${t.id}: ${t.name}. ${t.blurb || ""} (${(files[t.id] || []).filter((f) => f.path.startsWith("references/")).length} guides, ${(t.skills || []).length} ranked sub-skills)`);
    return text(`${rows.length} crafts. Call get_super_skill with a craft id.\n\n${rows.join("\n")}`);
  }
  if (name === "get_super_skill") {
    const craft = String(args.craft || "");
    if (!SLUG.test(craft)) return fail("Give a craft id from list_crafts.");
    const [skill, files] = await Promise.all([raw(env, `superskills/${craft}/SKILL.md`), tree(env)]);
    if (!skill) return fail(`No super skill called "${craft}". Call list_crafts for the ids.`);
    const list = (files[craft] || []).filter((f) => f.path !== "SKILL.md" && f.path !== "topic.json").map((f) => `- ${f.path}`).join("\n");
    return text(`${skill}\n\n---\nFiles in this super skill (read one with get_guide):\n${list}\n\nScripts listed here run on the user's own computer; this connector only returns their text.`);
  }
  if (name === "get_guide") {
    const craft = String(args.craft || ""), p = String(args.path || "").replace(/^\.?\//, "");
    if (!SLUG.test(craft)) return fail("Give a craft id from list_crafts.");
    const files = (await tree(env))[craft] || [];
    if (!files.some((f) => f.path === p)) return fail(`"${p}" isn't in ${craft}. Call get_super_skill to see its files.`);
    const body = await raw(env, `superskills/${craft}/${p}`);
    return body == null ? fail("That file couldn't be read.") : text(body);
  }
  if (name === "search_skills") {
    const words = String(args.query || "").toLowerCase().split(/\W+/).filter((w) => w.length > 1);
    if (!words.length) return fail("Give a few words to search for.");
    const limit = Math.min(25, Math.max(1, Number(args.limit) || 10));
    const hits = [];
    for (const t of await catalog(env)) {
      if (args.craft && t.id !== args.craft) continue;
      for (const s of t.skills || []) {
        const name = String(s.name).toLowerCase(), hay = `${name} ${s.purpose || ""} ${s.how_to_use || ""}`.toLowerCase();
        let score = 0;
        for (const w of words) { if (name.includes(w)) score += 3; else if (hay.includes(w)) score += 1; }
        if (score) hits.push({ score: score + 1 / (Number(s.rank) || 50), t, s });
      }
    }
    hits.sort((a, b) => b.score - a.score);
    if (!hits.length) return text("No sub-skill matched. Try other words, or call list_crafts.");
    const out = hits.slice(0, limit).map(({ t, s }) =>
      `- ${s.name} (${t.id}, rank ${s.rank}, ★${s.stars || "?"}, ${s.license || "no license"}${String(s.nonCommercial) === "True" ? ", non-commercial" : ""}): ${s.purpose || ""}\n  ${s.url || ""}`);
    return text(`Top ${out.length} sub-skills. The craft's super skill already carries the best of these; get_super_skill gives the distilled version.\n\n${out.join("\n")}`);
  }
  return fail(`Unknown tool ${name}.`);
}

/* ---------- MCP over HTTP ---------- */
function keyOf(req, url) {
  const auth = req.headers.get("Authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  const parts = url.pathname.split("/").filter(Boolean);
  return parts.length === 2 ? parts[1] : "";
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

async function handle(env, msg) {
  const { id, method, params } = msg || {};
  if (id === undefined || id === null) return null; // notification
  const ok = (result) => ({ jsonrpc: "2.0", id, result });
  try {
    if (method === "initialize") return ok({
      protocolVersion: params?.protocolVersion || PROTOCOL,
      capabilities: { tools: {} },
      serverInfo: { name: "skillgarden", version: "1.0.0" },
      instructions: "Skill Garden super skills. For a task, call list_crafts, then get_super_skill for the matching craft, then get_guide for the guide its router names. Follow the guide.",
    });
    if (method === "ping") return ok({});
    if (method === "tools/list") return ok({ tools: TOOLS });
    if (method === "tools/call") return ok(await callTool(env, params?.name, params?.arguments));
    return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
  } catch (e) {
    return ok(fail(`Couldn't reach the Skill Garden repo: ${e.message}`));
  }
}

export default {
  async fetch(req, env) {
    env = { REPO: "Gipsonkj/skillgarden", REF: "main", ...env };
    const url = new URL(req.url);
    if (url.pathname === "/" && req.method === "GET") return new Response("Skill Garden connector. MCP endpoint: /mcp\n", { headers: { "Content-Type": "text/plain" } });
    if (!/^\/mcp(\/[^/]+)?\/?$/.test(url.pathname)) return json({ error: "Not found" }, 404);
    const keys = String(env.ACCESS_KEYS || "").split(",").map((k) => k.trim()).filter(Boolean);
    if (keys.length) {
      const k = keyOf(req, url);
      if (!k || !keys.some((x) => safeEqual(x, k))) return json({ jsonrpc: "2.0", id: null, error: { code: -32001, message: "A valid access key is required." } }, 401);
    }
    if (req.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
    let body;
    try { body = await req.json(); } catch { return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, 400); }
    if (Array.isArray(body)) {
      const out = (await Promise.all(body.map((m) => handle(env, m)))).filter(Boolean);
      return out.length ? json(out) : new Response(null, { status: 202 });
    }
    const out = await handle(env, body);
    return out ? json(out) : new Response(null, { status: 202 });
  },
};
