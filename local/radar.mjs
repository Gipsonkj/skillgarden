// The radar: one look at GitHub, Hacker News, Reddit, Hugging Face, the MCP Registry and each
// topic's official feeds just before each scout run, so every topic session works from the same
// measured numbers instead of guessing what is trending:
//   - every watched repo (topic repos, the repos in each CREDITS.md, libraries, lists): stars and
//     how many it gained since the last radar, commits since then with their first lines, the
//     latest release;
//   - new skill and plugin repos created in the last 7 days, most stars first;
//   - the week's top Hacker News stories (general and per topic keyword) and Reddit posts;
//   - new posts in each topic's feeds (official blogs and changelogs) and the shared feeds;
//   - trending Hugging Face models for each topic's model types, and the week's top papers;
//   - new MCP servers in the official registry with a starred GitHub repo;
//   - per topic, how often each watched repo was checked and cited (for source proposals),
//     and the changes the person added or skipped (with their reason, when given).
// Public data only, read-only, and nothing about the user is sent. GitHub goes through the
// signed-in `gh` CLI when there is one, so this file never handles a token; without it, the
// anonymous API (stars only, rate-limited).
import { execFile } from "node:child_process";

const REPO_RE = /^[\w.-]+\/[\w.-]+$/;
const UA = "skillgarden-radar/1.0 (local)";
const DAY = 864e5;
const NEW_QUERIES = ["topic:agent-skills", "topic:claude-skills", "topic:claude-code-skills", "topic:claude-code-plugin", "SKILL.md in:readme"];
const MCP_REGISTRY = "https://registry.modelcontextprotocol.io/v0/servers";
const HF_TASK_RE = /^[a-z0-9-]{2,40}$/;
const HN_QUERIES = ["Claude Code", "agent skills", "Claude skill", "MCP server"];
// One search over both subreddits: Reddit answers 429 to quick repeat calls.
const REDDIT = "https://www.reddit.com/r/ClaudeAI+ClaudeCode/search.rss?q=skill%20OR%20skills%20OR%20MCP%20OR%20plugin&restrict_sr=1&sort=top&t=week&limit=15";

const clip = (v, n) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const lc = (s) => String(s).toLowerCase();

// gh exits non-zero when a GraphQL reply carries errors (a renamed repo) but still prints the data.
function gh(args) {
  return new Promise((resolve, reject) => execFile("gh", ["api", ...args], { timeout: 60e3, maxBuffer: 20e6 }, (e, out) => {
    try { if (out && out.trim()) return resolve(JSON.parse(out)); } catch {}
    reject(e || new Error("gh returned nothing"));
  }));
}
async function get(url, text = false) {
  const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20e3) });
  if (!r.ok) throw new Error(`${new URL(url).host} answered ${r.status}`);
  return text ? r.text() : r.json();
}
const ghGet = (path) => gh([path]).catch(() => get(`https://api.github.com/${path}`));
// Run fn over items, n at a time.
async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } }));
  return out;
}
const isHttps = (u) => { try { return new URL(u).protocol === "https:"; } catch { return false; } };
// The GitHub repos a super skill was distilled from, as named in its CREDITS.md.
const creditRepos = (t) => [...new Set([...String(t.files?.["CREDITS.md"] || "").matchAll(/github\.com\/([\w.-]+\/[\w.-]+)/g)].map((m) => m[1].replace(/\.+$/, "").replace(/\.git$/, "")))].filter((r) => REPO_RE.test(r));

async function viaGraphql(repos, since) {
  const out = {};
  for (let i = 0; i < repos.length; i += 30) {
    const chunk = repos.slice(i, i + 30);
    const q = chunk.map((r, k) => {
      const [o, n] = r.split("/");
      return `r${k}: repository(owner: ${JSON.stringify(o)}, name: ${JSON.stringify(n)}) { stargazerCount isArchived latestRelease { name publishedAt url } defaultBranchRef { target { ... on Commit { history(since: ${JSON.stringify(since)}, first: 5) { totalCount nodes { messageHeadline committedDate url } } } } } }`;
    }).join("\n");
    const { data } = await gh(["graphql", "-f", `query={${q}}`]);
    if (!data) throw new Error("GitHub GraphQL returned no data");
    chunk.forEach((r, k) => {
      const d = data[`r${k}`];
      if (!d) { out[r] = { missing: true }; return; }
      const h = d.defaultBranchRef?.target?.history;
      const rel = d.latestRelease;
      out[r] = {
        stars: d.stargazerCount, ...(d.isArchived ? { archived: true } : {}),
        commits: h ? h.totalCount : 0,
        recent: (h?.nodes || []).map((c) => ({ msg: clip(c.messageHeadline, 120), at: c.committedDate, url: c.url })),
        release: rel ? { name: clip(rel.name, 80), at: rel.publishedAt, url: rel.url } : null,
      };
    });
  }
  return out;
}
// Without gh: the anonymous API allows 60 calls an hour, so stars and last push only, at most 50.
async function viaRest(repos) {
  const out = {};
  for (const r of repos.slice(0, 50)) {
    try { const d = await get(`https://api.github.com/repos/${r}`); out[r] = { stars: d.stargazers_count, ...(d.archived ? { archived: true } : {}), pushedAt: d.pushed_at }; }
    catch (e) { if (/ 404$/.test(e.message)) out[r] = { missing: true }; else break; }
  }
  return out;
}

async function newRepos(watched, errors) {
  const day = new Date(Date.now() - 7 * DAY).toISOString().slice(0, 10);
  const found = new Map();
  for (const q of NEW_QUERIES) {
    try {
      const res = await ghGet(`search/repositories?q=${encodeURIComponent(`${q} created:>=${day}`)}&sort=stars&order=desc&per_page=15`);
      for (const it of res.items || []) {
        if (it.stargazers_count < 10 || watched.has(lc(it.full_name)) || found.has(it.full_name)) continue;
        found.set(it.full_name, { repo: it.full_name, stars: it.stargazers_count, about: clip(it.description, 160), url: it.html_url, created: it.created_at });
      }
    } catch (e) { errors.push(`new repos (${q}): ${e.message}`); }
  }
  return [...found.values()].sort((a, b) => b.stars - a.stars).slice(0, 25);
}

const unent = (s) => String(s).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, "&");
async function community(errors) {
  const ts = Math.floor((Date.now() - 7 * DAY) / 1000);
  const hn = new Map();
  for (const q of HN_QUERIES) {
    try { for (const h of await hnSearch(q, ts, 20)) if (!hn.has(h.id)) hn.set(h.id, h); }
    catch (e) { errors.push(`Hacker News (${q}): ${e.message}`); }
  }
  const out = [...hn.values()].sort((a, b) => b.points - a.points).slice(0, 15).map(({ id, ...h }) => h);
  // Reddit refuses anonymous JSON but serves search feeds; entries come in score order.
  try {
    const xml = await get(REDDIT, true);
    for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
      const e = m[1];
      const html = unent((/<content[^>]*>([\s\S]*?)<\/content>/.exec(e) || [])[1] || "");
      const link = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((x) => x[1]).find((u) => !/(^https?:\/\/([\w-]+\.)*(reddit\.com|redd\.it|redditmedia\.com))/.test(u));
      out.push({ site: `r/${(/<category term="([^"]+)"/.exec(e) || [])[1] || "ClaudeAI"}`, title: clip(unent((/<title>([\s\S]*?)<\/title>/.exec(e) || [])[1] || ""), 160), url: (/<link href="([^"]+)"/.exec(e) || [])[1] || "", ...(link ? { link } : {}), at: (/<updated>([^<]+)/.exec(e) || [])[1] || "" });
    }
  } catch (e) { errors.push(`Reddit: ${e.message}`); }
  return out;
}

async function hnSearch(q, ts, minPoints) {
  const res = await get(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=10&restrictSearchableAttributes=title&typoTolerance=false&numericFilters=${encodeURIComponent(`created_at_i>${ts},points>=${minPoints}`)}`);
  return (res.hits || []).map((h) => ({ id: h.objectID, site: "Hacker News", title: clip(h.title, 160), url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`, discussion: `https://news.ycombinator.com/item?id=${h.objectID}`, points: h.points, comments: h.num_comments, at: h.created_at }));
}
// Each topic's `keywords` (tool and technique names) through Hacker News titles.
async function topicNews(topics, errors) {
  const ts = Math.floor((Date.now() - 7 * DAY) / 1000);
  const jobs = topics.flatMap(([tid, t]) => (t.keywords || []).slice(0, 4).map((k) => [tid, clip(k, 60)])).filter(([, k]) => k);
  const out = {};
  await pool(jobs, 6, async ([tid, k]) => {
    try { for (const h of await hnSearch(k, ts, 10)) { const l = (out[tid] ||= []); if (!l.some((x) => x.id === h.id)) l.push(h); } }
    catch (e) { errors.push(`Hacker News (${k}): ${e.message}`); }
  });
  for (const tid of Object.keys(out)) out[tid] = out[tid].sort((a, b) => b.points - a.points).slice(0, 6).map(({ id, ...h }) => h);
  return out;
}

// RSS and Atom: title, link and date of each entry, newest first.
const strip = (s) => String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "");
function feedItems(xml) {
  return [...xml.matchAll(/<(item|entry)[\s>]([\s\S]*?)<\/\1>/g)].map(([, , b]) => {
    const links = [...b.matchAll(/<link\b([^>]*)\/?>/g)].map((m) => m[1]);
    const attr = (a, k) => (new RegExp(`${k}=["']([^"']+)["']`).exec(a) || [])[1];
    const alt = links.find((a) => !/rel=/.test(a) || /rel=["']alternate["']/.test(a));
    const url = (alt && attr(alt, "href")) || unent(strip((/<link>([\s\S]*?)<\/link>/.exec(b) || [])[1] || "")).trim();
    const at = (/<(pubDate|updated|published|dc:date)>([^<]+)/.exec(b) || [])[2];
    return { title: clip(unent(strip((/<title[^>]*>([\s\S]*?)<\/title>/.exec(b) || [])[1] || "")), 160), url, at: at && !isNaN(Date.parse(at)) ? new Date(at).toISOString() : null };
  }).filter((x) => x.at).sort((a, b) => b.at.localeCompare(a.at));
}
async function feeds(urls, since, errors) {
  const out = {};
  await pool(urls, 6, async (u) => {
    try { out[u] = { items: feedItems(await get(u, true)).filter((x) => x.at >= since).slice(0, 8) }; }
    catch (e) { out[u] = { error: e.message }; errors.push(`feed ${new URL(u).host}: ${e.message}`); }
  });
  return out;
}

// Trending models for each Hugging Face task the topics name, and the week's most upvoted papers.
async function huggingFace(tasks, wantPapers, since, errors) {
  const models = {};
  await pool(tasks, 4, async (task) => {
    try {
      const res = await get(`https://huggingface.co/api/models?pipeline_tag=${task}&sort=trendingScore&limit=10`);
      models[task] = res.filter((m) => m.likes >= 20).map((m) => {
        const lic = (m.tags || []).find((x) => x.startsWith("license:"));
        return { id: m.id, likes: m.likes, trending: m.trendingScore, created: m.createdAt, url: `https://huggingface.co/${m.id}`, ...(lic ? { license: lic.slice(8) } : {}) };
      });
    } catch (e) { errors.push(`Hugging Face (${task}): ${e.message}`); }
  });
  let papers = [];
  if (wantPapers) {
    try {
      const res = await get("https://huggingface.co/api/daily_papers?limit=100");
      papers = res.filter((p) => (p.publishedAt || "") >= since).map((p) => ({ title: clip(p.title || p.paper?.title, 160), upvotes: p.paper?.upvotes || 0, url: `https://huggingface.co/papers/${p.paper?.id}`, about: clip(p.summary || p.paper?.summary, 240) })).sort((a, b) => b.upvotes - a.upvotes).slice(0, 15);
    } catch (e) { errors.push(`Hugging Face papers: ${e.message}`); }
  }
  return { models, papers };
}

// New or updated servers in the official MCP Registry whose GitHub repo has 25+ stars.
async function newMcp(since, errors) {
  const found = new Map();
  try {
    let cursor = "";
    for (let page = 0; page < 10; page++) {
      const res = await get(`${MCP_REGISTRY}?limit=100&updated_since=${encodeURIComponent(since)}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
      for (const { server: s, _meta } of res.servers || []) {
        const m = _meta?.["io.modelcontextprotocol.registry/official"] || {};
        const repo = (/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+?)(?:\.git)?\/?$/.exec(s?.repository?.url || "") || [])[1];
        if (!repo || m.status === "deleted" || found.has(s.name)) continue;
        found.set(s.name, { name: clip(s.name, 100), title: clip(s.title || s.name, 100), about: clip(s.description, 200), repo, at: m.publishedAt || m.updatedAt });
      }
      cursor = res.metadata?.nextCursor;
      if (!cursor) break;
    }
    const repos = [...new Set([...found.values()].map((x) => x.repo))];
    const stats = repos.length ? await viaGraphql(repos, since) : {};
    return [...found.values()].map((x) => ({ ...x, stars: stats[x.repo]?.stars || 0 })).filter((x) => x.stars >= 25).sort((a, b) => b.stars - a.stars).slice(0, 20);
  } catch (e) { errors.push(`MCP Registry: ${clip(e.message, 160)}`); return []; }
}

// What the person added and skipped for each topic (newest 10 each), so the scout learns their taste.
function decisionsOf(store) {
  const out = {};
  for (const c of Object.values(store.candidates)) {
    const kind = c.status === "merged" || c.status === "approved" ? "added" : c.status === "skipped" ? "skipped" : null;
    if (!kind || !c.topicId) continue;
    (out[c.topicId] ||= { added: [], skipped: [] })[kind].push({ title: clip(c.title, 100), kind: c.kind, ...(c.skipNote ? { why: clip(c.skipNote, 200) } : {}), at: String(c.mergedAt || c.approvedAt || c.skippedAt || c.createdAt || "") });
  }
  for (const d of Object.values(out)) for (const k of ["added", "skipped"]) d[k] = d[k].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 10);
  return out;
}

// For each active topic and watched repo: runs of that topic that checked it, candidates that cited
// it, and how many of those were added. A repo checked often and never cited is a drop candidate.
function yieldOf(store) {
  const out = {};
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const [tid, t] of Object.entries(store.topics)) {
    if (t.active === false) continue;
    const runRe = new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${esc(tid)}(-\\d+)?$`);
    const runs = Object.entries(store.runs).filter(([id, r]) => runRe.test(id) || r.perTopic?.[tid]).map(([, r]) => r.checked || []);
    const cands = Object.values(store.candidates).filter((c) => c.topicId === tid && c.kind !== "sources");
    out[tid] = {};
    for (const repo of (t.repos || []).filter((r) => REPO_RE.test(r))) {
      const re = new RegExp(`(github\\.com|githubusercontent\\.com)/${esc(lc(repo))}(?![\\w.-])`);
      const hit = (u) => re.test(lc(u));
      const cited = cands.filter((c) => (c.sources || []).some((s) => hit(s.url)));
      out[tid][repo] = { runs: runs.filter((urls) => urls.some(hit)).length, cited: cited.length, kept: cited.filter((c) => c.status === "merged" || c.status === "approved").length };
    }
  }
  return out;
}

// prev: the last radar document, for star growth and the "since" date.
export async function takeRadar(store, prev) {
  const s = store.settings.main || {};
  const errors = [];
  const topics = Object.entries(store.topics).filter(([, t]) => t.active !== false);
  const watched = new Map();
  for (const r of [...topics.flatMap(([, t]) => [...(t.repos || []), ...creditRepos(t)]), ...(s.libraries || []), ...(s.lists || [])]) {
    if (REPO_RE.test(r) && !watched.has(lc(r))) watched.set(lc(r), r);
  }
  const takenAt = new Date().toISOString();
  const floor = Date.now() - 14 * DAY;
  const since = new Date(Math.max(floor, Date.parse(prev?.takenAt) || Date.now() - 7 * DAY)).toISOString();
  let repos, via = "gh";
  try { repos = await viaGraphql([...watched.values()], since); }
  catch (e) { via = "anonymous"; errors.push(`gh: ${clip(e.message, 160)}; used the anonymous API (stars only)`); repos = await viaRest([...watched.values()]); }
  for (const [r, d] of Object.entries(repos)) {
    const before = prev?.repos?.[r]?.stars;
    if (typeof d.stars === "number" && typeof before === "number") d.starsGained = d.stars - before;
  }
  const rising = Object.entries(repos).filter(([, d]) => d.starsGained > 0).sort((a, b) => b[1].starsGained - a[1].starsGained).slice(0, 10).map(([repo, d]) => ({ repo, stars: d.stars, starsGained: d.starsGained }));
  const feedUrls = [...new Set([...(s.feeds || []), ...topics.flatMap(([, t]) => t.feeds || [])])].filter(isHttps);
  const hf = topics.flatMap(([, t]) => t.hf || []);
  return {
    takenAt, since, via, repos, rising,
    newRepos: await newRepos(new Set(watched.keys()), errors),
    community: await community(errors),
    topicNews: await topicNews(topics, errors),
    feeds: await feeds(feedUrls, since, errors),
    hf: await huggingFace([...new Set(hf.filter((x) => x !== "papers" && HF_TASK_RE.test(x)))], hf.includes("papers"), since, errors),
    mcp: via === "gh" ? await newMcp(since, errors) : [],
    yield: yieldOf(store),
    decisions: decisionsOf(store),
    errors,
  };
}

// What one topic session needs: its own repos, feeds and model types plus the shared ones, the
// credited repos that changed, and the rest.
export function radarFor(doc, topicId, topic, settings) {
  const mine = new Set([...(topic.repos || []), ...(settings.libraries || []), ...(settings.lists || [])].map(lc));
  const changed = (d) => d && (d.commits > 0 || (d.release?.at || "") >= doc.since);
  const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o && o[k]).map((k) => [k, o[k]]));
  const hf = topic.hf || [];
  return {
    takenAt: doc.takenAt, since: doc.since, via: doc.via,
    repos: Object.fromEntries(Object.entries(doc.repos || {}).filter(([r]) => mine.has(lc(r)))),
    credits: Object.fromEntries(creditRepos(topic).filter((r) => !mine.has(lc(r)) && changed(doc.repos?.[r])).map((r) => { const { commits, recent, release } = doc.repos[r]; return [r, { commits, recent, release }]; })),
    feeds: pick(doc.feeds, [...(topic.feeds || []), ...(settings.feeds || [])]),
    hf: { models: pick(doc.hf?.models, hf), ...(hf.includes("papers") ? { papers: doc.hf?.papers || [] } : {}) },
    news: (doc.topicNews || {})[topicId] || [],
    rising: doc.rising || [], newRepos: doc.newRepos || [], community: doc.community || [], mcp: doc.mcp || [],
    yield: (doc.yield || {})[topicId] || {},
    decisions: (doc.decisions || {})[topicId] || { added: [], skipped: [] },
    ...(doc.errors?.length ? { errors: doc.errors } : {}),
  };
}

export const RADAR_KEEP = 4; // radar documents kept (each is about 250 KB)
