# SEO setup: the owner's steps

The site builds its own SEO files (`connector/pages.mjs`): a page per craft, chain and guide,
`robots.txt`, `sitemap.xml`, `llms.txt` and a 404 page. These steps need the owner's accounts, so
they are done by hand. Nothing here is submitted or pinged without the owner's OK.

## 1. Own domain (do this first)

A `*.workers.dev` address works but ranks and earns links worse than a real domain, and moving later
costs a re-index. Better to move before Search Console has history.

1. Buy the domain in Cloudflare (Dashboard → Domain Registration → Register). At cost, no markup, and the DNS is already in the right account.
2. Tell Claude the domain. Claude then:
   - sets `SITE` in `connector/pages.mjs` (also used by the landing page's canonical, OG tags and JSON-LD);
   - adds a `routes` entry (custom domain) to `connector/wrangler.toml`;
   - adds a 301 from `skillgarden.gipsonkj.workers.dev` to the new domain at the top of `fetch` in `connector/worker.js`, keeping `/mcp` and `/feedback` working on the old host, because the claude.ai connector URL and the plugin's feedback command point there;
   - tests locally, shows the result, and commits after your OK (the push deploys).

## 2. Google Search Console

- **With the domain:** add a *Domain* property and verify with the DNS TXT record (Cloudflare can add it in one click).
- **Before the domain:** add a *URL prefix* property for `https://skillgarden.gipsonkj.workers.dev/`, choose *HTML tag*, and give Claude the `content` value. Claude adds the `<meta name="google-site-verification">` tag to `connector/landing/index.html`.
- Then: Sitemaps → submit `sitemap.xml`. URL Inspection → request indexing for `/`, `/crafts/` and two or three craft pages.
- Baseline after 7 days: indexed pages, impressions, clicks, average position. Record them in NOTES.md with the date, then re-read at 14, 28 and 56 days.

## 3. Bing Webmaster Tools

Sign in and import the site from Search Console (one click; it brings the sitemap along). Bing also feeds ChatGPT search and Copilot.

## 4. IndexNow (optional; needs your OK)

Bing and Yandex accept an IndexNow ping when pages change. It needs a key file on the site and a ping
on each deploy. Say if you want it, and Claude adds it to the deploy workflow.

## 5. Check after the first deploy

- `https://<site>/robots.txt` and `/sitemap.xml` open.
- Rich Results Test on `/crafts/seo/` and one guide page: valid, no errors.
- PageSpeed Insights on `/` and `/crafts/seo/` (lab data only; field data appears once Chrome has enough visitors).
- An unknown address returns the 404 page with status 404.

## Decision for the owner

`robots.txt` lets every crawler in, AI training crawlers (GPTBot, ClaudeBot, Google-Extended, CCBot) included. For an open-source
project that wants to be known that is usually right. Blocking training crawlers while allowing AI
search crawlers is a two-line change if you prefer it.
