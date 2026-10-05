> Distilled from: ai-seo (coreyhaines31/marketingskills, MIT), seo-geo (AgriciDaniel/claude-seo, MIT), seo (AgriciDaniel/claude-seo, MIT), geo (zubair-trabzada/geo-seo-claude, MIT), seo-geo (resciencelab/opc-skills, Apache-2.0), seo-aeo-best-practices (sanity-io/agent-toolkit, MIT), apify-ai-search-visibility-tracker (apify/awesome-skills, Apache-2.0), seo (iannuttall/seo, Apache-2.0)

# AI search: GEO, AEO and agent readiness

AI answer engines (Google AI Overviews and AI Mode, ChatGPT search, Perplexity, Copilot, Gemini, Claude) don't list ten links. They retrieve a few sources and cite or name some of them. The goal is to be **retrieved, cited, mentioned and recommended**, in that order.

## What Google says (May 2026 guidance)

- Optimising for AI Overviews and AI Mode is still SEO. They draw on the normal Googlebot index.
- To be eligible, a page must be indexed and allowed to show a snippet. `nosnippet` or `max-snippet:0` removes it.
- No special markup, `llms.txt` file or content "chunking" is required.
- Since 31 Aug 2026 every Search Console property has a "Search generative AI" control (include, exclude or inherit; include by default). It sets eligibility for AI Overviews, AI Mode and AI features in Discover. It is not a ranking signal and not a training control. Beyond it, `nosnippet`, `data-nosnippet`, `max-snippet` and `noindex` govern appearance.
- `Google-Extended` in robots.txt controls Gemini training and grounding only. It does **not** affect Search inclusion or ranking, including AI Overviews.

So the foundation is the rest of this skill: crawlable, indexable, fast pages with clear answers. Everything below adds to that; none of it replaces it.

## Crawler access: three separate jobs

Report each bot separately, with the job it does. Blocking a training crawler is a business choice. Blocking a search crawler removes you from that engine's answers.

| Job | Bots | Effect of blocking |
|---|---|---|
| AI search index (gets you cited) | `OAI-SearchBot` (ChatGPT search), `Claude-SearchBot`, `PerplexityBot`, `Bingbot` (Copilot and ChatGPT partly), `Googlebot` | you disappear from that engine's answers |
| Model training | `GPTBot`, `ClaudeBot`, `CCBot` (Common Crawl), `Applebot-Extended`, `Google-Extended`, `Meta-ExternalAgent`, `Bytespider` | your content isn't used for future training; citations are unaffected |
| User-triggered fetch | `ChatGPT-User`, `Claude-User`, `Perplexity-User`, `Google-Agent` | the assistant can't open your page when a user asks it to |

User-triggered fetchers don't all honour robots.txt. Google's `Google-Agent` and OpenAI's `ChatGPT-User` may ignore it, while Anthropic's `Claude-User` honours it. To block those, use server-side access controls.

Also check:
- CDN and WAF bot rules. Cloudflare's default AI-bot blocking often overrides robots.txt.
- Rate limits that return 403 or 429 to these user agents.
- That the core content is in the initial HTML, since most AI crawlers don't run JavaScript.

## Content that gets cited

**Structure:**
- Answer first: a direct 40–60 word answer right under a question-style H2, then the detail. Keep each section self-contained, about 130–170 words at most, so it can be quoted without its neighbours.
- Put the key facts early. About 44% of AI citations come from the first 30% of a page.
- Use descriptive headings that match how people ask ("How much does X cost in 2026?"), not "Overview" or "Details".
- Use tables for comparisons and numbered lists for steps. They are easier to extract than prose.
- Define terms in one sentence ("X is a … that …").

**Evidence.** In the Princeton GEO study (KDD 2024), measured changes in visibility were:

| Change | Effect on visibility |
|---|---|
| Citing sources | about +40% |
| Adding statistics | about +37% |
| Adding expert quotations | about +30% |
| Authoritative tone | about +25% |
| Easier wording | about +20% |
| Keyword stuffing | about −10% |

Use specific, dated, attributed numbers ("42% of …, Gartner 2026"). Original data, such as a survey, benchmark or price index, is the strongest asset because others cite it.

**Freshness:**
- Content updated within the last 3 months is cited much more often; various studies put it at about 3×.
- Show the published and updated dates, and update `dateModified`.
- Only refresh when something has really changed.

**Entity and brand signals:**
- In Ahrefs data, brand mentions correlated with AI visibility about 3× more strongly than backlinks.
- Off-site presence matters: YouTube (correlation about 0.74, against about 0.27 for Domain Rating), Reddit, Wikipedia and Wikidata, review sites, and industry lists.
- Keep `Organization` schema with `sameAs` links to your real profiles, and keep the name, description and category consistent everywhere.

**Avoid:**
- Self-promotional "best X" listicles that rank yourself first. One study found 69% of AI Overview citations of such lists appeared in answers that recommended a competitor.
- After ChatGPT's August 2026 model update, citations of listicles fell about 50% and of comparison pages about 32%, while official and first-party pages gained.
- Hidden text or prompt-injection aimed at AI crawlers. It is spam and can get the page dropped.

## Per-platform notes (dated snapshots, they change fast)

| Platform | Retrieval | What helps |
|---|---|---|
| Google AI Overviews and AI Mode | Google index | normal SEO, snippet eligibility, clear answer blocks, strong E-E-A-T |
| ChatGPT search | own index (OAI-SearchBot) plus Bing | allow OAI-SearchBot, Bing indexing, brand mentions, fresh content |
| Microsoft Copilot | Bing | Bing Webmaster Tools, IndexNow, pages loading under 2 s |
| Perplexity | own index plus live fetch | allow PerplexityBot, Q&A-style content, public PDFs, recency |
| Claude | Brave Search index plus live fetch | Brave indexing, allowing Claude-SearchBot and Claude-User |
| Gemini | Google index plus grounding | as for Google |

## llms.txt

- Google Search ignores it. In server logs, only about 0.1% of AI-bot requests fetch it.
- It is worth having for **developer docs**: coding agents and IDE assistants do read `/llms.txt` and `/llms-full.txt` to find clean Markdown.
- If you add one, keep it short: a title, a one-line summary, and links to your key pages or `.md` versions. Don't sell it as a ranking factor.

## Agent readiness

AI agents increasingly visit pages on behalf of users: comparing prices, filling forms, reading docs.
- Core content and prices are in the initial HTML, not behind JS-only widgets or logins.
- Serve Markdown on request, either by content negotiation (`Accept: text/markdown`, with `Vary: Accept`) or with parallel `.md` URLs (for example `/pricing.md`) advertised in a `<link rel="alternate" type="text/markdown">` or `Link` header.
- Use semantic HTML: real `<button>`, `<label>` and `<table>` elements. Forms must work without custom gestures.
- Keep pricing, plans and limits on a public, crawlable page.
- Emerging standards such as WebMCP and the OKF draft are low priority until they are widely adopted. Note them; don't build for them first.
- Lighthouse 13 has an "Agentic Browsing" category, scored as X of N checks. Use it as a checklist, not as a ranking signal.

## Measuring AI visibility

AI answers are not deterministic. One manual query proves nothing.

1. Build a prompt set of 20–50 real questions buyers ask, grouped by intent: "best X for Y", "X vs Y", "how to …", "X pricing", "X alternatives".
2. Run each prompt 3–5 times per platform, and fix the country and language.
3. For each run, record:
   - **cited**: your registrable domain appears in the sources;
   - **mentioned**: your brand name appears in the answer text (match on word boundaries);
   - **recommended**: you are named as an option to choose.
4. Report rates with sample sizes ("cited in 7 of 15 runs on Perplexity"), and share of voice against 2–4 named competitors.
5. Track the result over time, weekly or monthly. Record first-ever citations and drops against prior runs.
6. In analytics, separate referral traffic from `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com` and `gemini.google.com` (a GA4 `sessionSource` report: `tools-vendors.md`). Expect it to be small but high-converting.

To find gaps, take the prompts where you aren't cited, identify the top-cited URL for each, and compare its structure with your page: answer position, headings matching the query, data, freshness and format. Then fix the biggest gap first.

Paid tracking tools (Apify, Profound, Otterly, Ahrefs Brand Radar and others) are listed in [tools-vendors.md](tools-vendors.md).

## Checklist

- [ ] The page is indexed and snippet-eligible in Google and Bing
- [ ] AI search and user-fetch bots are allowed in robots.txt and in the CDN/WAF; the training-bot policy is a deliberate choice
- [ ] Core content is in the initial HTML
- [ ] Each key question has a 40–60 word direct answer under a matching heading
- [ ] Statistics and claims are attributed and dated, and there is at least one original data point
- [ ] Organization schema has `sameAs`, and the brand is described the same way everywhere
- [ ] A prompt set is tracked, each prompt run 3–5 times, with rates and sample sizes reported
