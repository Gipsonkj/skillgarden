// Skill Garden on Cloudflare: the public website plus a small MCP server (the connector) for
// claude.ai and the Claude apps, in one Worker. The connector only reads, except send_feedback.
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
//
// Feedback: POST /feedback takes a note from the plugin's /skillgarden:feedback (sent only after the
// user said yes) and keeps it in the FEEDBACK KV store for 90 days; send_feedback does the same for
// connector users. The owner's Mac collects them with GET /feedback/inbox and POST /feedback/ack,
// using the FEEDBACK_KEY secret (not the connector keys). Without the KV binding, feedback is off.

const PROTOCOL = "2025-06-18";
const CACHE_SECONDS = 300;

const TOOLS = [
  {
    name: "list_crafts",
    description: "List the Skill Garden crafts (topics). Each has one super skill that routes to distilled guides. Call this first to find the craft id for a task.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_super_skill",
    description: "Get a craft's super skill: its router (SKILL.md), which says how to plan the request, which guide to read for which part and which other crafts to hand parts to, plus the list of its guide files. Then call get_guide for the guides the plan needs. Craft \"superseed\" is the planner: one entry point that picks the crafts for any request, and plans requests that need several.",
    inputSchema: { type: "object", properties: { craft: { type: "string", description: "Craft id from list_crafts, e.g. backend-databases, or superseed for the planner" } }, required: ["craft"], additionalProperties: false },
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
    name: "get_chain",
    description: "Chains run several crafts' guides in order from one ask, e.g. 'campaign' does research, angles, hooks, posts, ads and a test plan. With no chain id, lists the chains. With one, returns its inputs and steps; then read each step's guides with get_guide and do the steps in order.",
    inputSchema: { type: "object", properties: { chain: { type: "string", description: "Chain id, e.g. campaign. Leave out to list them." } }, additionalProperties: false },
  },
  {
    name: "send_feedback",
    description: "Send the user's feedback on how a Skill Garden super skill or the superseed planner did, so the weekly scout can improve it. Only call this after you have shown the user the exact note and they said yes to sending it. Never include secrets, file contents, personal details or client names; generalise instead.",
    annotations: { title: "Send feedback to Skill Garden", readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    inputSchema: {
      type: "object",
      properties: {
        problem: { type: "string", enum: ["worked-well", "wrong-craft", "wrong-guide", "guide-missing", "guide-wrong", "too-slow", "other"], description: "wrong-craft: the wrong skill or none was used; wrong-guide: right skill, wrong guide; guide-missing: the guide lacked what the task needed; guide-wrong: its advice was wrong or out of date; too-slow: too many steps or tokens" },
        crafts: { type: "array", items: { type: "object", properties: { id: { type: "string" }, guides: { type: "array", items: { type: "string" }, description: "Guide file names read, e.g. postgres-schema.md" } }, required: ["id"] }, description: "The crafts the note is about, with the guides read from each" },
        task: { type: "string", description: "One generic line, e.g. 'hero image for a bakery landing page'" },
        detail: { type: "string", description: "What happened, specifically: which guide said what, what the result lacked" },
        words: { type: "string", description: "The user's own words" },
        rating: { type: "integer", minimum: 1, maximum: 5 },
      },
      required: ["problem", "crafts"], additionalProperties: false,
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
    const chains = [], planners = [];
    for (const e of (await r.json()).tree || []) {
      const m = e.type === "blob" && /^(superskills|planner)\/([^/]+)\/(.+)$/.exec(e.path);
      if (m) (files[m[2]] ||= []).push({ path: m[3], size: e.size });
      if (m && m[1] === "planner" && m[3] === "SKILL.md") planners.push(m[2]);
      const k = e.type === "blob" && /^chains\/([a-z0-9][a-z0-9-]{0,60})\/chain\.json$/.exec(e.path);
      if (k) chains.push(k[1]);
    }
    Object.defineProperty(files, "chains", { value: chains.sort(), enumerable: false });
    Object.defineProperty(files, "planners", { value: planners, enumerable: false });
    return files;
  });
}
async function catalog(env) {
  return cached("catalog", async () => JSON.parse((await raw(env, "catalog/catalog.json")) || '{"topics":[]}').topics || []);
}

// "Where this came from" for a craft, from the website's credits.json (built on the owner's Mac).
async function credits(env, craft) {
  try {
    if (!env.ASSETS) return "";
    const all = await cached("credits", async () => { const r = await env.ASSETS.fetch(new Request("https://assets.local/credits.json")); return r.ok ? r.json() : { topics: {} }; });
    const list = ((all.topics || {})[craft] || []).slice(0, 5);
    if (!list.length) return "";
    return `\n\nRecent changes and where they came from:\n${list.map((v) => `- v${v.version}: ${v.title}${v.credits && v.credits.length ? ` (from ${v.credits.map((k) => k.label).join(", ")})` : ""}`).join("\n")}`;
  } catch { return ""; }
}

/* ---------- tools ---------- */
const SLUG = /^[a-z0-9][a-z0-9-]{0,60}$/;
const text = (t) => ({ content: [{ type: "text", text: t }] });
const fail = (t) => ({ content: [{ type: "text", text: t }], isError: true });
// Super skills live in superskills/<craft>; the planner in planner/superseed.
// Old names that still work: the planner was called "garden" until 4 Oct 2026.
const ALIAS = new Map([["garden", "superseed"]]);
const craftId = (v) => { const c = String(v || ""); return ALIAS.get(c) || c; };
const home = (files, craft) => ((files.planners || []).includes(craft) ? `planner/${craft}` : `superskills/${craft}`);

async function callTool(env, name, args = {}) {
  if (name === "list_crafts") {
    const [topics, files] = await Promise.all([catalog(env), tree(env)]);
    const rows = topics.filter((t) => files[t.id]).map((t) => `- ${t.id}: ${t.name}. ${t.blurb || ""} (${(files[t.id] || []).filter((f) => f.path.startsWith("references/") && f.path !== "references/go-deeper.md").length} guides, ${(t.skills || []).length} ranked sub-skills)`);
    const chains = files.chains || [];
    const plan = (files.planners || []).includes("superseed") ? `\n\nA request that needs several crafts, or when unsure which craft fits: call get_super_skill with craft "superseed" (the planner) first.` : "";
    return text(`${rows.length} crafts. Call get_super_skill with a craft id.\n\n${rows.join("\n")}${chains.length ? `\n\nChains (several crafts in order from one ask; call get_chain): ${chains.join(", ")}` : ""}${plan}`);
  }
  if (name === "get_super_skill") {
    const craft = craftId(args.craft);
    if (!SLUG.test(craft)) return fail("Give a craft id from list_crafts.");
    const files = await tree(env);
    const skill = await raw(env, `${home(files, craft)}/SKILL.md`);
    if (!skill) return fail(`No super skill called "${craft}". Call list_crafts for the ids.`);
    const list = (files[craft] || []).filter((f) => f.path !== "SKILL.md" && f.path !== "topic.json").map((f) => `- ${f.path}`).join("\n");
    const history = await credits(env, craft);
    return text(`${skill}\n\n---\nFiles in this super skill (read one with get_guide):\n${list}\n\nScripts listed here run on the user's own computer; this connector only returns their text.${history}`);
  }
  if (name === "get_guide") {
    const craft = craftId(args.craft), p = String(args.path || "").replace(/^\.?\//, "");
    if (!SLUG.test(craft)) return fail("Give a craft id from list_crafts.");
    const all = await tree(env), files = all[craft] || [];
    if (!files.some((f) => f.path === p)) return fail(`"${p}" isn't in ${craft}. Call get_super_skill to see its files.`);
    const body = await raw(env, `${home(all, craft)}/${p}`);
    return body == null ? fail("That file couldn't be read.") : text(body);
  }
  if (name === "get_chain") {
    const ids = (await tree(env)).chains || [];
    const load = async (id) => { const t = await raw(env, `chains/${id}/chain.json`); return t ? JSON.parse(t) : null; };
    if (!args.chain) {
      const all = (await Promise.all(ids.map(load))).filter(Boolean);
      if (!all.length) return text("No chains yet.");
      return text(`${all.length} chains. Call get_chain with an id.\n\n${all.map((c) => `- ${c.id}: ${c.name}. ${c.blurb || ""} (${(c.steps || []).length} steps)`).join("\n")}`);
    }
    const id = String(args.chain);
    if (!SLUG.test(id) || !ids.includes(id)) return fail(`No chain called "${id}". Call get_chain with no id to list them.`);
    const c = await load(id);
    if (!c) return fail("That chain couldn't be read.");
    const steps = (c.steps || []).map((st, k) => {
      const uses = [...(st.guides || []).map((g) => ({ craft: st.craft, guide: g })), ...(st.also || [])];
      return `${k + 1}. ${st.title}\n   Read: ${uses.map((u) => `get_guide(craft: "${u.craft}", path: "${u.guide}")`).join(", ")}\n   Deliver: ${st.output}`;
    }).join("\n");
    return text(`# ${c.name}\n\n${c.blurb || ""}\n\nAsk the user once for whatever the conversation doesn't already give you:\n${(c.inputs || []).map((i) => `- ${i}`).join("\n")}\nIf something stays unknown, pick a sensible default and say which.\n\nThen run the steps in order. For each one, read its guides with get_guide (and only those), do the step the way the guides say, and build on the earlier steps. Don't stop between steps unless the user has to decide something. Use only facts from the user and the research step; never invent results, testimonials or prices.\n\n${steps}\n\nFinish with a short summary of what each step produced, the choices you made, and the one thing to do first.`);
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
  if (name === "send_feedback") {
    const r = await keepFeedback(env, { v: 1, id: crypto.randomUUID(), at: new Date().toISOString(), plugin: "connector", ...args, crafts: (args.crafts || []).map((c) => ({ id: craftId(c && c.id), fired: 1, guides: (c && c.guides) || [] })) }, env.SENDER || "unknown", "connector");
    return r.error ? fail(r.error) : text("Thanks: the note reached Skill Garden. The weekly scout reads it before it proposes changes to these skills.");
  }
  return fail(`Unknown tool ${name}.`);
}

/* ---------- feedback ---------- */
const PROBLEMS = ["worked-well", "wrong-craft", "wrong-guide", "guide-missing", "guide-wrong", "too-slow", "other"];
const FEEDBACK_TTL = 90 * 86400;
const PER_SENDER_HOUR = 10, PER_DAY = 200;
const str = (v, n) => String(v ?? "").trim().slice(0, n);
const num = (v) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.round(Number(v)) : null);

// Only the fields the plugin sends, checked and cut to size; anything else is dropped.
function cleanFeedback(b) {
  if (!b || typeof b !== "object" || b.v !== 1) return { error: "Not a Skill Garden feedback note." };
  if (!/^[0-9a-f-]{36}$/.test(String(b.id))) return { error: "Bad note id." };
  const crafts = (Array.isArray(b.crafts) ? b.crafts : []).filter((c) => c && SLUG.test(String(c.id))).slice(0, 12).map((c) => ({
    id: String(c.id), fired: num(c.fired) ?? 0,
    guides: (Array.isArray(c.guides) ? c.guides : []).map(String).filter((g) => /^[\w.-]{1,80}\.md$/.test(g)).slice(0, 30),
  }));
  const rating = Number(b.rating);
  const t = b.tokens && typeof b.tokens === "object" ? b.tokens : null;
  const note = {
    id: String(b.id), at: str(b.at, 30), plugin: str(b.plugin, 40),
    problem: PROBLEMS.includes(b.problem) ? b.problem : "other",
    rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
    task: str(b.task, 200), detail: str(b.detail, 1500), words: str(b.words, 1500), crafts,
    prompts: num(b.prompts), minutes: num(b.minutes), model: str(b.model, 60) || null,
    tokens: t ? { input: num(t.input), cacheRead: num(t.cacheRead), cacheWrite: num(t.cacheWrite), output: num(t.output) } : null,
  };
  if (!note.detail && !note.words) return { error: "The note is empty." };
  return { note };
}

async function keepFeedback(env, body, sender, via) {
  if (!env.FEEDBACK) return { error: "Feedback isn't switched on for this Skill Garden.", status: 503 };
  const { note, error } = cleanFeedback(body);
  if (error) return { error, status: 400 };
  const key = `note:${note.id}`;
  if (await env.FEEDBACK.get(key)) return { ok: true };
  // Rough limits (KV counts settle within a minute): per sender per hour, and for everyone per day.
  const hour = new Date().toISOString().slice(0, 13), day = hour.slice(0, 10);
  const who = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${sender}|${hour}`)))].slice(0, 8).map((x) => x.toString(16).padStart(2, "0")).join("");
  const [mine, all] = await Promise.all([env.FEEDBACK.get(`rl:${who}`), env.FEEDBACK.get(`day:${day}`)]);
  if (Number(mine) >= PER_SENDER_HOUR || Number(all) >= PER_DAY) return { error: "Too many notes right now. Try again later.", status: 429 };
  await Promise.all([
    env.FEEDBACK.put(key, JSON.stringify({ ...note, receivedAt: new Date().toISOString(), via }), { expirationTtl: FEEDBACK_TTL }),
    env.FEEDBACK.put(`rl:${who}`, String(Number(mine) + 1), { expirationTtl: 3700 }),
    env.FEEDBACK.put(`day:${day}`, String(Number(all) + 1), { expirationTtl: 90000 }),
  ]);
  return { ok: true };
}

// POST /feedback from the plugin; GET /feedback/inbox and POST /feedback/ack for the owner's Mac.
async function feedbackRoute(req, url, env) {
  if (url.pathname === "/feedback") {
    if (req.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
    if (Number(req.headers.get("Content-Length") || 0) > 16384) return json({ error: "Too large." }, 413);
    let body;
    try { body = JSON.parse((await req.text()).slice(0, 16384)); } catch { return json({ error: "Send JSON." }, 400); }
    const r = await keepFeedback(env, body, env.SENDER || "unknown", "plugin");
    return r.error ? json({ error: r.error }, r.status) : json({ ok: true });
  }
  const auth = req.headers.get("Authorization") || "";
  if (!env.FEEDBACK || !env.FEEDBACK_KEY || !auth.startsWith("Bearer ") || !safeEqual(auth.slice(7).trim(), String(env.FEEDBACK_KEY).trim())) return json({ error: "Not allowed." }, 401);
  if (url.pathname === "/feedback/inbox" && req.method === "GET") {
    const { keys } = await env.FEEDBACK.list({ prefix: "note:", limit: 200 });
    const notes = (await Promise.all(keys.map((k) => env.FEEDBACK.get(k.name, "json")))).filter(Boolean);
    return json({ notes });
  }
  if (url.pathname === "/feedback/ack" && req.method === "POST") {
    const ids = ((await req.json().catch(() => ({}))).ids || []).filter((id) => /^[0-9a-f-]{36}$/.test(String(id))).slice(0, 200);
    await Promise.all(ids.map((id) => env.FEEDBACK.delete(`note:${id}`)));
    return json({ ok: true, removed: ids.length });
  }
  return json({ error: "Not found." }, 404);
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
      instructions: "Skill Garden super skills. For a task, call list_crafts, then get_super_skill for the matching craft, then get_guide for the guides its router names. Each router says how to split a request into parts and which other crafts' guides serve parts it doesn't cover best; read those with get_guide too. For a request that needs several crafts, or when unsure which craft fits, call get_super_skill with craft \"superseed\" (the planner) first. For a whole marketing campaign, sales outreach or a launch video, call get_chain. When the user wants to say how a skill did, draft a short note, show it, and call send_feedback only if they agree.",
    });
    if (method === "ping") return ok({});
    if (method === "tools/list") return ok({ tools: TOOLS });
    if (method === "tools/call") return ok(await callTool(env, params?.name, params?.arguments));
    return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
  } catch (e) {
    return ok(fail(`Couldn't reach the Skill Garden repo: ${e.message}`));
  }
}

/* ---------- the public website (static files in ./public, built by build-site.mjs) ---------- */
// The page asks for sub-skill files the way the local app serves them; answer from the
// prebuilt files. Everything else is a static file.
async function site(req, url, env) {
  if (!env.ASSETS) return new Response("Skill Garden connector. MCP endpoint: /mcp\n", { headers: { "Content-Type": "text/plain" } });
  const p = url.searchParams.get("path") || "";
  const asset = (pathname) => env.ASSETS.fetch(new Request(new URL(pathname, url.origin), { method: "GET" }));
  if (url.pathname === "/library/list") return /^skills\/[^?#]+$/.test(p) && !p.includes("..") ? asset(`/lib/${p}/files.json`) : json({ error: "Bad path." }, 400);
  if (url.pathname === "/library/raw") return /^skills\/[^?#]+\/SKILL\.md$/.test(p) && !p.includes("..") ? asset(`/lib/${p}`) : json({ error: "Download the whole skill instead." }, 404);
  return env.ASSETS.fetch(req);
}

export default {
  async fetch(req, env) {
    env = { REPO: "Gipsonkj/skillgarden", REF: "main", ...env, SENDER: req.headers.get("CF-Connecting-IP") || "unknown" };
    const url = new URL(req.url);
    if (/^\/feedback(\/(inbox|ack))?$/.test(url.pathname)) return feedbackRoute(req, url, env);
    if (!/^\/mcp(\/[^/]+)?\/?$/.test(url.pathname)) return site(req, url, env);
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
