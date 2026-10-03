// "Where this came from": the public credits for each approved skill version.
// Used by the local server (/credits.json) and by the public website build.
//
// Only public, credit-worthy facts leave the inbox: a creator's handle, the public
// reel link, and the web or GitHub page a change was based on. Notes, captions,
// transcripts, freebie text and anything read from DMs never do. Links lose their
// query string and fragment, which is where download tokens and trackers live.

const HANDLE = /^[A-Za-z0-9_.]{1,30}$/;
const IG_POST = /^https:\/\/(?:www\.)?instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels?|tv)\/([A-Za-z0-9_-]{5,})\/?$/;

function cleanUrl(u) {
  try {
    const url = new URL(String(u || ""));
    if (url.protocol !== "https:" || url.username || url.password) return null;
    url.search = ""; url.hash = "";
    // Never a DM thread, an account page behind login, or a localhost link.
    if (/(^|\.)instagram\.com$/.test(url.hostname) && !IG_POST.test(url.href) && !/^\/[A-Za-z0-9_.]+\/?$/.test(url.pathname)) return null;
    if (/^(localhost|127\.|10\.|192\.168\.)/.test(url.hostname) || !url.hostname.includes(".")) return null;
    return url.href;
  } catch { return null; }
}
const short = (s, n = 80) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
const profile = (h) => `https://www.instagram.com/${h}/`;

function creditsFor(cand, inbox, gated) {
  const out = [];
  const seen = new Set();
  const push = (c) => { const k = (c.url || "") + "|" + c.label; if (c.label && !seen.has(k)) { seen.add(k); out.push(c); } };
  // Creators whose reels or freebies led here, by handle only.
  for (const id of cand.inboxIds || []) {
    const r = inbox[id];
    if (!r || r.fromDm) continue; // anything read from DMs stays private
    const h = String(r.owner || "").replace(/^@/, "");
    if (!HANDLE.test(h)) continue;
    const reel = r.kind !== "freebie" && IG_POST.test(String(r.url || "")) ? String(r.url) : null;
    push({ kind: r.kind === "freebie" ? "creator" : "reel", label: "@" + h, url: reel || profile(h) });
  }
  for (const s of cand.sources || []) {
    // A freebie is gated by its creator (comment a keyword to get it): credit it, never link it.
    if (s.kind === "freebie") { push({ kind: "creator", label: short(s.label, 60) || "Creator freebie" }); continue; }
    const kind = ["github", "web", "library", "reel"].includes(s.kind) ? s.kind : "web";
    const url = cleanUrl(s.url);
    if (kind === "reel") { if (url && IG_POST.test(url)) push({ kind, label: short(s.label, 40) || "Instagram reel", url }); continue; }
    if (!url || gated.has(url)) continue;
    push({ kind, label: short(s.label) || new URL(url).hostname, url });
  }
  return out.slice(0, 12);
}

/** { topics: { <topicId>: [{ version, date, title, credits }] }, feed: [...] } */
export function buildCredits({ versions = {}, candidates = {}, inbox = {} }) {
  const topics = {};
  // Freebie links stay private even if a source lists them as an ordinary web page.
  const gated = new Set(Object.values(inbox).filter((r) => r && r.kind === "freebie" && r.url).map((r) => cleanUrl(r.url)).filter(Boolean));
  for (const v of Object.values(versions)) {
    if (!v || !v.candidateId || !["candidate", "folded"].includes(v.source)) continue;
    const c = candidates[v.candidateId];
    if (!c) continue;
    const credits = creditsFor(c, inbox, gated);
    (topics[v.topicId] ||= []).push({ topicId: v.topicId, version: Number(v.version) || 0, date: v.createdAt || c.mergedAt || "", title: short(c.title || v.summary, 120), credits });
  }
  const feed = [];
  for (const list of Object.values(topics)) { list.sort((a, b) => b.version - a.version); feed.push(...list); }
  feed.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return { topics, feed: feed.slice(0, 12) };
}
