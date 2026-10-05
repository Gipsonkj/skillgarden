// What search engines and AI answer engines get from the website, used by build-site.mjs:
//   seoRoutes()     every address the build pre-renders (prerender.mjs saves the app's own view of it):
//                   /explore/, /crafts/<id>/, /chains/<id>/, /guides/<craft>/<guide>/, and 404.html
//   headFor(route)  that address's title, description, canonical, share tags and JSON-LD
//   writeSiteFiles  robots.txt, sitemap.xml, llms.txt, favicon.svg
//   landingLd       JSON-LD for the landing page
// The pages themselves are the app; only the head is written here. Titles and descriptions per craft
// come from seo-titles.json (from _research/seo/keyword-map.md).
import fs from "node:fs";
import path from "node:path";

// The site's address for canonicals, share tags and the sitemap. Change it here (or set SITE_URL) when
// the site moves to its own domain.
export const SITE = (process.env.SITE_URL || "https://skillgarden.gipsonkj.workers.dev").replace(/\/$/, "");
const NAME = "Skill Garden";
const OG_IMAGE = `${SITE}/film/poster.jpg`;

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const day = (iso) => (iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toISOString().slice(0, 10) : null);
const strip = (s) => String(s).replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
const clip = (s, n) => { s = strip(s).replace(/\s+/g, " ").trim(); return s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)).replace(/[,;:.]$/, "") + "…"; };
const fit = (...options) => options.find((t) => t.length <= 65) || options[options.length - 1];
const titleOf = (src, slug) => (String(src).match(/^#\s+(.+)$/m)?.[1] || slug.replace(/-/g, " ")).replace(/`/g, "").trim();
const crumbs = (list) => ({ "@type": "BreadcrumbList", itemListElement: list.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE + url })) });

// A guide's description: its own opening sentences, long enough to say something on a results page.
function guideLead(src, title, craftName) {
  let lead = "";
  for (const l of src.replace(/^#\s+.+\n/m, "").replace(/```[\s\S]*?```/g, "").split("\n")) {
    if (!l.trim() || /^(>|#|\||[-*] |\d+\.)/.test(l)) continue;
    lead += (lead ? " " : "") + strip(l).trim();
    if (lead.length >= 120) break;
  }
  if (lead.length < 90) lead = `${title}: how Claude handles it in the ${craftName} super skill. ${lead}`;
  return clip(lead, 158);
}

export function seoRoutes({ topics, catalog, chains, counts }) {
  const titles = (() => { try { return JSON.parse(fs.readFileSync(new URL("./seo-titles.json", import.meta.url), "utf8")); } catch { return {}; } })();
  const byId = Object.fromEntries(catalog.topics.map((t) => [t.id, t]));
  const skills = counts.SKILLS.toLocaleString("en");
  const routes = [];
  const home = [NAME, "/"], explore = ["Explore", "/explore/"];

  routes.push({ route: "/explore/", file: "explore/index.html",
    title: `Claude Skills Library: ${skills} Ranked Skills | ${NAME}`,
    description: `Browse ${skills} ranked Claude skills in ${counts.CRAFTS} crafts: what each is good at, its licence and source, plus one super skill per craft that routes to the right guide.`,
    ld: [{ "@type": "CollectionPage", name: "Claude skills library", url: `${SITE}/explore/`, isPartOf: { "@id": `${SITE}/#website` },
      mainEntity: { "@type": "ItemList", numberOfItems: catalog.topics.length, itemListElement: catalog.topics.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: `${SITE}/crafts/${t.id}/` })) } }] });

  for (const [id, t] of Object.entries(topics)) {
    const cat = byId[id]; if (!cat) continue;
    const ranked = [...(cat.skills || [])].sort((a, b) => (a.rank || 999) - (b.rank || 999));
    const refs = Object.keys(t.files || {}).filter((p) => /^references\/[\w.-]+\.md$/.test(p));
    const url = `/crafts/${id}/`;
    const fill = (x) => x && x.replace(/\{\{N\}\}/g, ranked.length).replace(/\{\{G\}\}/g, refs.length);
    const o = titles[url] || {};
    const more = ` A free Claude super skill with ${refs.length} guides from ${ranked.length} ranked community skills.`;
    const description = fill(o.description) || (cat.blurb.length + more.length <= 160 ? cat.blurb + more : clip(cat.blurb, 158));
    routes.push({ route: url, file: `crafts/${id}/index.html`, lastmod: day(t.updatedAt),
      title: fill(o.title) || fit(`${cat.name} skills for Claude | ${NAME}`, `${cat.name} skills for Claude`), description,
      ld: [{ "@type": "CollectionPage", name: `${cat.name} skills for Claude`, description, url: SITE + url, isPartOf: { "@id": `${SITE}/#website` }, ...(t.updatedAt ? { dateModified: t.updatedAt } : {}),
        mainEntity: { "@type": "ItemList", name: `Ranked ${cat.name} skills`, numberOfItems: ranked.length,
          itemListElement: ranked.slice(0, 50).map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, ...(s.url ? { url: s.url } : {}) })) } },
        crumbs([home, explore, [cat.name, url]])] });

    for (const p of refs) {
      const slug = p.slice(11, -3), gurl = `/guides/${id}/${slug}/`, src = t.files[p], title = titleOf(src, slug);
      // A long title is cut at its colon; a generic label before it ("Vendor notes:") is dropped instead.
      const [lead0, rest] = title.split(/:\s(.*)/s), short = rest && /^vendor( notes| apis)?$/i.test(lead0) ? rest : title.split(/:\s|\s\(/)[0];
      const g = titles[gurl] || {}, lead = g.description || guideLead(src, title, cat.name);
      routes.push({ route: gurl, file: `guides/${id}/${slug}/index.html`, lastmod: day(t.updatedAt),
        // The link list behind each craft's "Go deeper" is reachable but not worth a search result.
        noindex: slug === "go-deeper",
        title: g.title || fit(`${title}: ${cat.name} guide | ${NAME}`, `${title} | ${NAME}`, `${short}: ${cat.name} guide | ${NAME}`, `${short} | ${NAME}`),
        description: lead,
        ld: [{ "@type": "TechArticle", headline: title, description: lead, url: SITE + gurl, isPartOf: { "@type": "CollectionPage", url: SITE + url },
          publisher: { "@id": `${SITE}/#org` }, ...(t.updatedAt ? { dateModified: t.updatedAt } : {}) }, crumbs([home, explore, [cat.name, url], [title, gurl]])] });
    }
  }

  for (const c of chains) {
    const url = `/chains/${c.id}/`, o = titles[url] || {};
    routes.push({ route: url, file: `chains/${c.id}/index.html`,
      title: o.title || fit(`${c.name}: Claude skill chain | ${NAME}`, `${c.name} | ${NAME}`),
      description: o.description || clip(`${c.blurb} ${c.description || ""}`, 158),
      ld: [{ "@type": "WebPage", name: c.name, url: SITE + url, isPartOf: { "@id": `${SITE}/#website` } }, crumbs([home, explore, [c.name, url]])] });
  }

  // Unknown addresses: the explorer's front page, marked noindex (wrangler.toml serves it with a 404).
  routes.push({ route: "/explore/", file: "404.html", noindex: true, sitemap: false, title: `Page not found | ${NAME}`, description: "This page doesn't exist. Every craft is listed here." });
  return routes;
}

export function headFor(r) {
  const url = SITE + r.route;
  const ld = r.ld ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": r.ld }).replace(/</g, "\\u003c")}</script>` : "";
  return `<title>${esc(r.title)}</title><meta name="description" content="${esc(r.description)}">` +
    (r.noindex ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${esc(url)}">`) +
    `<meta property="og:type" content="website"><meta property="og:site_name" content="${NAME}"><meta property="og:title" content="${esc(r.title)}"><meta property="og:description" content="${esc(r.description)}"><meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${OG_IMAGE}">` +
    `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(r.title)}"><meta name="twitter:description" content="${esc(r.description)}"><meta name="twitter:image" content="${OG_IMAGE}">` +
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">${ld}`;
}

export function writeSiteFiles({ out, routes, topics, catalog, chains, CATS }) {
  const byId = Object.fromEntries(catalog.topics.map((t) => [t.id, t]));
  const listed = [{ route: "/" }, ...routes.filter((r) => !r.noindex && r.sitemap !== false)];
  fs.writeFileSync(path.join(out, "robots.txt"), `# Search engines and AI search and answer crawlers are welcome.\nUser-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /lib/\nDisallow: /library/\nDisallow: /mcp\nDisallow: /feedback\n\nSitemap: ${SITE}/sitemap.xml\n`);
  fs.writeFileSync(path.join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${listed.map((r) => `  <url><loc>${esc(SITE + r.route)}</loc>${r.lastmod ? `<lastmod>${r.lastmod}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`);
  fs.writeFileSync(path.join(out, "llms.txt"), `# ${NAME}\n\n> One super skill for every craft Claude works in: ${Object.keys(topics).length} crafts, each a short router plus focused guides distilled from the best-ranked public community skills, with a planner (superseed) and saved multi-craft chains. Free and open source; install in Claude Code with \`claude plugin marketplace add Gipsonkj/skillgarden\` then \`claude plugin install skillgarden@skillgarden\`.\n\n## Crafts\n\n${CATS.flatMap((c) => c.ids.filter((id) => byId[id] && topics[id]).map((id) => `- [${byId[id].name}](${SITE}/crafts/${id}/): ${byId[id].blurb}`)).join("\n")}\n\n## Chains\n\n${chains.map((c) => `- [${c.name}](${SITE}/chains/${c.id}/): ${c.blurb}`).join("\n")}\n\n## Optional\n\n- [Claude skills library](${SITE}/explore/)\n- [Source on GitHub](https://github.com/Gipsonkj/skillgarden)\n`);
  fs.writeFileSync(path.join(out, "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0b1210"/><path d="M16 27V15" stroke="#6fe3b0" stroke-width="2.4" stroke-linecap="round"/><path d="M16 18c-4 0-7-2.6-7-6.5 4 0 7 2.6 7 6.5zM16 15c0-4 2.8-7 6.8-7 0 4-2.8 7-6.8 7z" fill="#6fe3b0"/><circle cx="16" cy="27" r="2.6" fill="#f2c14e"/></svg>`);
  return listed.length;
}

/** JSON-LD for the landing page: the site, its publisher and the plugin. */
export function landingLd({ crafts, skills }) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": `${SITE}/#org`, name: NAME, url: `${SITE}/`, logo: `${SITE}/favicon.svg`, sameAs: ["https://github.com/Gipsonkj/skillgarden"] },
    { "@type": "WebSite", "@id": `${SITE}/#website`, name: NAME, url: `${SITE}/`, publisher: { "@id": `${SITE}/#org` }, inLanguage: "en" },
    { "@type": "SoftwareApplication", "@id": `${SITE}/#plugin`, name: `${NAME} plugin for Claude Code`, applicationCategory: "DeveloperApplication", operatingSystem: "macOS, Windows, Linux",
      description: `${crafts} super skills for Claude, one per craft, distilled from ${skills} ranked community skills.`, url: `${SITE}/`, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: { "@id": `${SITE}/#org` } },
  ] }).replace(/</g, "\\u003c");
}
