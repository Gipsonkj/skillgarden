# Skill Garden: SEO keyword map

Researched 6 Oct 2026, read-only. Site: https://skillgarden.gipsonkj.workers.dev (landing `/`, app `/explore/`).

## How to read the numbers

Each number has one of three labels:

- **Measured**: observed directly on 6 Oct 2026, with the source named.
- **Estimated**: inferred from a measured signal, with the reasoning given.
- **Unknown**: no source. I had no access to a keyword-volume tool (Ahrefs, Semrush, Google Keyword Planner or Search Console), so **every search volume below is Unknown.** Where autocomplete offers a query, that only shows people type it. It says nothing about how many do.

Sources used:

1. **Google autocomplete** (`suggestqueries.google.com`, `hl=en&gl=us`). Measured: whether a phrase is suggested, and its position in the list of 10 suggestions.
2. **WebSearch tool** (US index). It is not a Google results page, and the engine behind it is not disclosed. "Rank" below means the position in its list of about 9–10 results. Treat ranks as a directional signal, not as Google positions.
3. **GitHub API** (`gh api`) for repository facts.
4. `curl` against the live site.

## Where Skill Garden stands today (Measured, 6 Oct 2026)

| Check | Result | Source |
|---|---|---|
| Site in search results for any query tested (21 queries) | **Not found for any of them**, including the bare domain `skillgarden.gipsonkj.workers.dev` | WebSearch tool |
| `/sitemap.xml` | **404** | curl |
| JSON-LD structured data on `/` | none (0 `application/ld+json` blocks) | curl |
| Per-craft URLs | **none.** `/explore/` is one 242 KB single-page app titled "Skill Garden", so no URL exists that could rank for a craft query | curl |
| Landing `<title>` | "Skill Garden: one super skill for every craft Claude works in". It contains none of the searched phrases ("Claude skills", "best Claude skills", "Claude Code plugin") | curl |
| GitHub `Gipsonkj/skillgarden` | 0 stars, 0 forks, created 29 Sep 2026, 49 commits; **no description, no homepage, no topics, no licence GitHub can detect** (no root `LICENSE`) | GitHub API |
| Repo `README.md` | Opens with "A personal tool for Gipson… not deployed anywhere". That is stale, and it is the first thing a list maintainer would read | repo |
| MCP connector `/mcp` | 401 without a key. It is key-gated, so it is not a public feature to advertise | curl |
| skills.sh page `skills.sh/gipsonkj/skillgarden` | 404 (not indexed) | curl |
| claudemarketplaces.com marketplace page | 404 (not indexed) | curl |

**Name clash (Measured):** a search for "Skill Garden" Claude skills returns **ConardLi/garden-skills** first. Coverage on discuss.pytorch.kr calls it "Skill Garden", and the repo has 12,746 stars (GitHub API). Google autocomplete for "skill garden claude" offers only "garden skill claude". The brand query is therefore taken by a bigger project. Brand searches need a qualifier ("Skill Garden super skills", "skillgarden plugin"), and pages should name both "Skill Garden" and "superseed" next to "Claude Code plugin". "superseed claude" has no autocomplete suggestions, and its results are all about obra/superpowers.

## Broad queries

Search volume for every row: **Unknown** (no volume source).

| Query | Autocomplete variants (Measured, Google, US) | What ranks (WebSearch tool, 6 Oct 2026) | Format mix | Skill Garden | What a page needs to compete |
|---|---|---|---|---|---|
| **best claude skills** | best claude skills github / for website design / reddit / for developers / for writing / for app development / for coding / for business | 1 lagrowthmachine.com list · 2 mpgone.com "Best Claude Skills Reddit" roundup · 3 techpp.com list (18 Aug 2026) · 4 tutorialsdojo tag page · 5 skillsindex.dev blog · 6–9 claudeskills.info (ko/ja/zh) | List articles; 2026-dated roundups | Not in top 10 as of 6 Oct 2026 | A dated, opinionated "best Claude skills by craft" page with real picks per craft (name, author, why, install), visible "updated weekly" date, ItemList schema. The by-craft suffixes in autocomplete ("for website design", "for writing", "for coding") map straight onto craft pages. |
| **claude skills** | claude skills marketplace / github / library / examples / guide / vs agents / repo / reddit / list | 1 hatchworks.com guide · 2 zeabur explainer · 3 buildfastwithai guide · 4–5 conduction.nl tutorial · 6 bunny.zeabur · 7 ivee.jobs · 8 verdent guide · 9 Notion field guide | Explainers ("what are Claude skills") | Not in top 10 as of 6 Oct 2026 | Informational intent; a directory will not rank for it. Only worth it as a short explainer page linking to the library. Low priority. |
| **claude code plugins** | marketplace / github / vs skills / list / **to reduce token usage** / official / directory / reddit / and skills | 1 claude.com blog · 2 anthropic.com news · 3 claude.com blog (dup) · 4 help.sleuth.io · 5 fast.io guide · 6 claudelog FAQ · 7 sourcepulse (ccplugins list) · 8 sharedcontext.ai · 9 vibeindex.ai | Official docs, then directories | Not in top 10 as of 6 Oct 2026 | Anthropic owns the head term. Target the long tail instead ("claude code plugins list", "…directory", "…to reduce token usage" → `token-efficiency`). |
| **claude skills library** | (suggested at position 4 under "claude skills") | 1–2 mintlify.com/npow/claude-skills · 3 gptprompts.ai/claude-skills · 4 Medium · 5 gptprompts.ai library · 6 analyticsvidhya · 7 sharedcontext.ai · 8 glama.ai · 9 neura.market | Directory / library pages | Not in top 10 as of 6 Oct 2026 | **Best fit for `/explore/`.** It needs a crawlable, server-rendered list (at least the 38 crafts with counts and links), a title containing "Claude Skills Library", and a count stated in text (1,353). The competitors are thin directories. |
| **claude code skills marketplace** | claude code skills marketplace / github / examples / documentation / library / for web design / best practices | 1–2 horadecodar.com.br (PT) · 3 x-cmd.com · 4 vibeindex.ai · 5–9 claudemarketplaces.com (5 results) | Directories (claudemarketplaces.com dominates) | Not in top 10 as of 6 Oct 2026 | Hard to outrank claudemarketplaces.com directly. Getting listed *on* it (via skills.sh and GitHub crawling, see outreach.md) is the realistic route. |
| **awesome claude skills** | github / repo / list / security / **travisvn** / **composiohq** / master | 1 jimmysong.io · 2 wikidocs (Composio) · 3 x-cmd · 4 sourcepulse (karanb192) · 5 context-awesome (Composio) · 6 awesomeclaude.ai · 7–8 gittrend.io · 9 neura.market · 10 aiindigo | GitHub awesome lists and mirror sites of them | Not in top 10 as of 6 Oct 2026 | Do not build a page for this. The way in is to **be listed in the lists** (outreach.md). Mirrors copy the lists, so one listing spreads. |
| *variant:* claude skills marketplace | (suggested at position 2 under "claude skills") | 1 intempt.com blog · 2 korben.info (SkillsMP, "26,000 skills") · 3 x-cmd · 4 gptprompts.ai marketplace · 5 agent37 blog · 6–7 claudemarket.ai · 8 agent-skills.cc · 9 claudemarketplaces.com | Blogs about marketplaces plus directories | Not in top 10 as of 6 Oct 2026 | Same as "library". Our honest angle is curated and ranked rather than "26,000 skills", so say that in the title and description. |
| *variant:* best claude skills github | (position 2 under "best claude skills") | 1 toolsforhumans.ai · 2 heyuan110.com · 3–4 analyticsvidhya "Top 5 GitHub repos" · 5 sickn33 docs on raw.githubusercontent · 6 glama.ai · 7 skillsindex.dev · 8 sourcepulse · 9 gittrend.io | Roundups of GitHub repos | Not in top 10 as of 6 Oct 2026 | Needs GitHub stars and a repo description first. Roundup authors pick repos with stars. |
| *variant:* claude code skills | marketplace / github / examples / documentation / library / for developers / for web design | olostep, datanorth, mintlify, verdent, claudelog, pasqualepillitteri, seawork | Explainers | Not in top 10 as of 6 Oct 2026 | Informational; low priority. |
| **Brand:** Skill Garden Claude | only "garden skill claude" | 1 discuss.pytorch.kr on **ConardLi/garden-skills** · then generic skills explainers · obra "gardening-skills-wiki" | Another project owns the name | Not in top 10 as of 6 Oct 2026 | Repo description and homepage set; site title and H1 should say "Skill Garden: super skills for Claude Code"; get one listing that links the name to the URL. |
| **Brand:** superseed Claude | no suggestions | All results are about obra/superpowers | none | Not in top 10 as of 6 Oct 2026 | Give superseed its own section with an H2 "superseed: one entry point for every craft" on the landing page, and mention it in the repo README. |

## Per-craft queries (all 38)

The primary query is the most specific "Claude + craft + skill" phrase that **Google autocomplete actually suggests** (Measured, 6 Oct 2026). The secondary is another suggested phrase. All volumes are Unknown. Most of these searchers want to **find and install a skill** (commercial investigation). Exceptions are noted in the Intent column.

Notes behind the choices:

- **Wording:** autocomplete favours "claude X skill" and "claude skill for X". "Claude Code" appears less often, so it goes in the H1 and body rather than the title.
- **`course-design`:** avoid "claude course". Autocomplete turns it into Anthropic courses (skilljar, skillsfuture), a different intent.
- **`audio-generation`:** many searchers want transcription ("claude skill audio to text"). The page should mention transcripts high up.
- **`open-models`:** demand is thin and ambiguous. "claude code ollama skills" mostly means running Claude Code on Ollama. Low priority.
- **`storyboarding`:** only one suggestion each way, so demand is thin.

| Craft id | Name (topic.json) | Primary query | Secondary query | Intent | Ranked sub-skills / guides (Measured, repo) |
|---|---|---|---|---|---|
| `3d-modeling` | 3D modeling | claude blender skill | claude skill for 3d modeling | Find/install (commercial investigation) | 37 / 11 |
| `ad-creation` | Ad creation | claude ads skill | claude skill for meta ads | Find/install | 28 / 11 |
| `ai-agents` | AI agents | claude skills for building ai agents | claude skill mcp builder | Find/install + learn | 49 / 11 |
| `ai-video` | AI video | claude skill for video editing | claude skills video generation | Find/install | 42 / 16 |
| `app-building` | App building | claude skill for app development | claude skill for ios development | Find/install | 40 / 12 |
| `audio-generation` | Audio generation | claude audio skill | claude music skill | Mixed: find/install; many searchers want transcription | 34 / 12 |
| `automation` | Automation | claude n8n skills | claude playwright skill | Find/install | 37 / 10 |
| `backend-databases` | Backend & Databases | claude database skill | claude supabase skill | Find/install | 49 / 12 |
| `career` | Career & job search | claude skill for resume tailoring | claude job search skill | Find/install | 26 / 11 |
| `claude-meta` | Claude meta-skills | claude skill creator skill | claude code skills best practices | Learn + find/install | 38 / 11 |
| `cloud-devops` | Cloud & DevOps | claude devops skills | claude terraform skill | Find/install | 47 / 11 |
| `coding-practices` | Coding practices | claude debugging skill | claude code skill for code review | Find/install | 40 / 9 |
| `content-creation` | Content creation & copywriting | claude copywriting skill | claude skill for writing like a human | Find/install | 38 / 10 |
| `course-design` | Teaching & course design | claude teaching skill | claude skill for education | Find/install (avoid 'claude course': Anthropic course intent) | 28 / 11 |
| `data-analysis` | Data Analysis | claude data analysis skill | claude skill for data science | Find/install | 37 / 11 |
| `docs-office` | Docs & Office files | claude excel skills | claude pdf skill | Find/install | 38 / 8 |
| `ecommerce` | E-commerce | claude shopify skill | claude skill for shopify theme | Find/install | 33 / 12 |
| `email-marketing` | Email marketing | claude email marketing skill | email marketing skill claude github | Find/install | 33 / 9 |
| `figma-design` | Figma & design systems | claude figma skill | claude skill figma mcp | Find/install | 44 / 10 |
| `frontend-ui-design` | Frontend UI design | claude frontend design skill | claude skill for ui design | Find/install (dominated by Anthropic's official skill) | 41 / 13 |
| `google-ads` | Google Ads | claude google ads skill | claude google ads audit skill | Find/install | 31 / 8 |
| `image-creation` | Image creation | claude image generation skill | claude code skill for image generation | Find/install | 30 / 11 |
| `instagram-automation` | Instagram automation | claude instagram skill | claude skill for instagram carousel | Find/install | 19 / 9 |
| `linkedin-automation` | LinkedIn automation | claude skill for linkedin posts | claude linkedin skill | Find/install | 29 / 11 |
| `motion-animation` | Motion & animation | claude animation skill | claude gsap skill | Find/install | 39 / 13 |
| `open-models` | Open models | claude code ollama skills | claude skill for fine tuning | Weak/ambiguous demand (many want to run Claude Code on Ollama) | 30 / 11 |
| `poster-design` | Poster & graphic design | claude skill for poster design | claude skill for logo design | Find/install | 37 / 13 |
| `presentations` | Presentations | claude powerpoint skill | claude presentation skill | Find/install | 31 / 12 |
| `product-management` | Product & Project Management | claude skills for product managers | claude prd skill | Find/install | 32 / 12 |
| `research-science` | Research & Science | claude skill for research paper writing | claude research skills | Find/install | 36 / 10 |
| `security` | Security | claude security skill | claude skill security review | Find/install | 39 / 8 |
| `seo` | SEO | claude seo skill | claude skill for seo content writing | Find/install + learn | 35 / 10 |
| `social-media` | Social media | claude social media skills | claude skill for social media content | Find/install | 30 / 12 |
| `storyboarding` | Storyboarding | claude skill for storyboarding | claude storyboard skill | Thin demand; find/install | 35 / 10 |
| `testing-qa` | Testing & QA | claude tdd skill | claude skill for test automation | Find/install | 38 / 11 |
| `token-efficiency` | Token efficiency | claude skill for token optimization | claude code plugins to reduce token usage | Find/install | 29 / 10 |
| `trading-finance` | Trading & Finance | claude trading skills | claude finance skills | Find/install | 36 / 12 |
| `website-building` | Website building | claude skill for website design | best claude skills for website design | Find/install | 38 / 11 |

## Live check: 12 representative craft queries (WebSearch tool, 6 Oct 2026)

Skill Garden is **not in the top 10 for any of the 12 queries as of 6 Oct 2026** (Measured). It has no per-craft URL that could rank.

| Craft | Query checked | What ranks (position: site) | Format | What a page would need |
|---|---|---|---|---|
| `seo` | claude skill for seo | 1 ahrefs.com/blog · 2 github.com/seranking/seo-skills · 3 ahrefs (dup) · 4 studiohawk.com.au · 5 blog.mean.ceo · 6 tripledart · 7 tomevault (agricidaniel/claude-seo) · 8–9 mejba.me | SEO-brand blogs, then GitHub repos | High-authority brands own this. Compete on **comparison**: name the SEO skills that exist (claude-seo, seranking, marketingskills…), what each is good for, and install lines. Long tail first ("claude seo skill github", "claude skill seo audit"). |
| `frontend-ui-design` | claude frontend design skill | 1 codegen.com skill page · 2 claude.com/de blog · 3 codegen · 4 claude.com blog "improving frontend design through skills" · 5 claudelog FAQ · 6–10 claudemarketplaces.com ×5 | Official Anthropic content plus directory pages | Anthropic's own skill dominates. Claudelog and the claudemarketplaces snippet report it as the most-installed official plugin at over 1.1M installs (reported by those pages, not verified). The angle that can win: "alternatives and add-ons to frontend-design, ranked" ("best claude skill for frontend design" is suggested). |
| `image-creation` | claude image generation skill | 1 levelup.gitconnected (Medium) · 2 sourcepulse (cc-nano-banana) · 3–9 claudemarketplaces.com ×7 | Directory pages | **Weak competition.** Thin per-skill directory pages. A real ranked comparison (models covered, API key needed, licence) should be able to compete. |
| `ai-video` | claude skill for video editing | 1 opus.pro blog · 2 point-broadband · 3 tella.com/skills · 4 videohighlight · 5 chrislema.com · 6 learnwithhasan · 7–8 claudemarketplaces · 9 agentskillsfinder | Vendor blogs promoting their own skill | A neutral ranked page is a real gap: every vendor ranks its own tool. |
| `career` | claude skill for resume tailoring | 1 scour.ing (varunr89 repo) · 2 github.com/amanattar · 3 LinkedIn profile · 4–5 asadfaizee blog · 6 jsdelivr README (deusyu) · 7 asadfaizee · 8 sourcepulse · 9 claudecodehq.com blog | GitHub repos and small blogs | **Weak competition.** A comparison of the 4–5 resume skills plus a "how to tailor a resume with Claude" walkthrough. |
| `google-ads` | claude google ads skill | 1–2 gomarble.ai · 3 lilys.ai (RU) · 4–5 claudemarketplaces · 6 spilnoagency (PL) · 7–9 claudemarketplaces | Vendor plus directories | Ranked list with what each skill audits, and whether it needs API access. |
| `presentations` | claude presentation skill | 1 academy.smarterx.ai · 2 sourcepulse (academic-pptx) · 3 bleap.finance "best claude skills for presentations" · 4 smarterx (dup) · 5 artificialcorner "We tried 100 Claude skills" · 6 opendesigner.io · 7 agentskill.work · 8–9 open-design.ai | List articles | Head-to-head: .pptx out vs HTML decks, which skill for which output. |
| `trading-finance` | claude trading skills github | 1 sourcepulse (tradermonty) · 2 claudemarketplaces · 3 vibeindex · 4 gittrend (staskh) · 5–6 claudemarketplaces · 7–9 claudeskills.info | Mirrors of two GitHub repos | Low bar. Ranked list plus a clear "paper first, not advice" stance. |
| `token-efficiency` | claude skill for token optimization | 1 gollop wiki · 2 GitHub wiki · 3 Medium · 4 skillselion · 5–6 claudemarketplaces · 7 tech.sailjada · 8 claudemarketplaces · 9 skills.sh | Directories and small blogs | **Weak competition** and growing interest ("claude code plugins to reduce token usage" is suggested). Good early target. |
| `automation` | claude n8n skills | 1 lilys.ai (TR) · 2 gittrend (czlonkowski/n8n-skills, reported 4.8k stars) · 3 agentskill.work · 4 vibeindex · 5 agentskill.work · 6 here.now · 7 claudskills.com · 8 agent-skills.cc · 9 skywork blog | Directories | One strong repo (czlonkowski) wins. Our page should rank it honestly and add what it doesn't cover (Make, Zapier, Playwright). |
| `motion-animation` | claude animation skill | 1 claudemarketplaces · 2–3 vibeindex · 4–5 claudemarketplaces · 6 claudskills.com · 7 vibeindex · 8 claudemarketplaces · 9 claudskills.com | **Only directory pages**, almost all one author (dylantarre) | **Weakest competition seen.** Any substantive ranked page has a real chance. |
| `product-management` | claude skill for product management PRD | 1–2 composio.dev · 3–5 snyk.io (es/de/en) · 6 vibecodingacademy · 7 enterpret · 8 departmentofproduct substack | Brand list articles | Strong brands. Target "claude prd skill" and "claude skills for product managers github" (both suggested). |

**Pattern (Measured over these 12):** claudemarketplaces.com shows up in **7 of 12** craft results (frontend, image, video, google-ads, trading, token, animation). Its listings come from crawling skills.sh, GitHub and MCP registries (its about page). The fastest route into craft results is therefore to **get the 38 super skills indexed there via skills.sh**, alongside building our own pages (see outreach.md).

## What every craft page needs (recommendation)

1. **Its own crawlable URL**, server-rendered at build time (the Worker already builds `/explore/`). For example `/claude-skills/seo/` or `/crafts/seo/`, one per craft, plus `/sitemap.xml` and a `<link rel=canonical>`.
2. Title, H1 and meta from the table below. Body copy should use the primary and secondary query once each, naturally.
3. **The ranked list as HTML**: name, author, GitHub link, stars, licence, link-only flag, one line on what it's best at. This is the content the competing directories lack.
4. A "which one should I use?" section of 3–5 bullets, then the super skill's install lines:
   `claude plugin marketplace add Gipsonkj/skillgarden` / `claude plugin install skillgarden@skillgarden`.
5. A visible "last scouted <date>" from the weekly scout, plus `dateModified` in JSON-LD (`ItemList` for the ranked skills, `SoftwareSourceCode` for the plugin, `BreadcrumbList`).
6. Internal links: the craft's hand-offs to other crafts (from the router's `## Other crafts`) and its chains.
7. Off-site: GitHub stars and awesome-list links (outreach.md). Without any links, the pages are unlikely to rank even with weak competition (Estimated, from the fact that every ranking repo or directory seen has stars or domain history).

## Recommended landing pages (broad terms)

| Page | `<title>` (chars) | H1 | Meta description (chars) | Targets |
|---|---|---|---|---|
| `/` (landing) | Best Claude Skills, Ranked by Craft \| Skill Garden (50) | Skill Garden: the best Claude skills for every craft, ranked | 1,353 community Claude skills ranked across 38 crafts, each distilled into one super skill. Free Claude Code plugin, licences respected, rescouted weekly. (154) | best claude skills; best claude skills for <craft>; Skill Garden (brand) |
| `/explore/` (library) | Claude Skills Library: 1,353 Ranked Skills \| Skill Garden (57) | Claude skills library: 1,353 ranked skills in 38 crafts | Browse 1,353 ranked Claude skills in 38 crafts: what each is good at, its licence and source, plus one super skill per craft that routes to the right guide. (156) | claude skills library; claude skills list; claude code skills library |

Also, with no new page needed:

- **GitHub repo description:** "38 super skills for Claude Code, one per craft, distilled from 1,353 ranked community skills. Plugin + planner."
- **Homepage field:** set to the site URL.
- **Topics:** `claude-skills`, `claude-code`, `claude-code-plugin`, `agent-skills`, `skills-marketplace`.
- **README:** replace the stale "personal tool… not deployed" opening.

These need the owner's GitHub account.

## Final table: recommended page metadata per craft

The ranked sub-skill and guide counts in the descriptions come from `catalog/catalog.json` and `superskills/<id>/references/` on 6 Oct 2026. Update them if the catalog changes. Length limits checked: every title is 60 characters or fewer, every description is 120–160.


| Craft id | Recommended `<title>` (chars) | H1 | Meta description (chars) | Primary query |
|---|---|---|---|---|
| `3d-modeling` | Claude Blender & 3D Modeling Skills \| Skill Garden (50) | Claude skills for Blender and 3D modeling | 37 ranked 3D skills for Claude in one super skill: Blender scripts, Three.js scenes, GLB optimisation, CAD and 3D printing. Free plugin, every source credited. (159) | claude blender skill |
| `ad-creation` | Claude Ads Skill: Ad Copy, Hooks & UGC Briefs \| Skill Garden (60) | Claude skills for ad creation | 28 ranked ad skills for Claude, distilled into 11 guides: briefs, hooks, ad copy, statics and UGC video ads for Meta, TikTok and Google. Free, credited. (152) | claude ads skill |
| `ai-agents` | Claude Skills for Building AI Agents & MCP \| Skill Garden (57) | Claude skills for building AI agents and MCP servers | 49 ranked agent-building skills for Claude in 11 guides: tool design, MCP servers, multi-agent setups, memory and evals. Free Claude Code plugin. (145) | claude skills for building ai agents |
| `ai-video` | Claude Skill for Video Editing & AI Video \| Skill Garden (56) | Claude skills for video editing and AI video | 42 ranked video skills for Claude in 16 guides: ffmpeg cuts, captions, 9:16 reframes, HyperFrames renders and prompts for Veo, Kling and Wan. Free. (147) | claude skill for video editing |
| `app-building` | Claude Skill for App Development: iOS, Expo \| Skill Garden (58) | Claude skills for mobile and desktop app development | 40 ranked app-building skills for Claude in 12 guides: Expo, SwiftUI, Compose, Flutter, Tauri, simulator checks and store releases. Free plugin. (144) | claude skill for app development |
| `audio-generation` | Claude Audio Skill: Voice, Music & Podcasts \| Skill Garden (58) | Claude skills for audio, voice and music | 34 ranked audio skills for Claude in 12 guides: voiceovers, music, sound effects, podcasts, dubbing and transcripts, mixed to a loudness target. (144) | claude audio skill |
| `automation` | Claude n8n & Automation Skills, Ranked \| Skill Garden (53) | Claude skills for n8n, Playwright and automation | 37 ranked automation skills for Claude in 10 guides: n8n, Make, Zapier, Playwright, DevTools and safe web extraction. Free Claude Code plugin. (142) | claude n8n skills |
| `backend-databases` | Claude Database Skill: Postgres & Supabase \| Skill Garden (57) | Claude skills for backends and databases | 49 ranked backend skills for Claude in 12 guides: Postgres schemas and slow queries, API design, auth, Supabase, Prisma and Stripe webhooks. Free. (146) | claude database skill |
| `career` | Claude Skill for Resume Tailoring & Job Hunt \| Skill Garden (59) | Claude skills for resumes and job search | 26 ranked career skills for Claude in 11 guides: resumes tailored to a posting, ATS checks, cover letters, interview prep and salary talks. Free. (145) | claude skill for resume tailoring |
| `claude-meta` | Claude Skill Creator & CLAUDE.md Guides \| Skill Garden (54) | Claude meta-skills: skills, CLAUDE.md, hooks and subagents | 38 ranked meta-skills in 11 guides: write skills that trigger, CLAUDE.md, hooks, subagents, plans and context for long Claude Code tasks. Free. (143) | claude skill creator skill |
| `cloud-devops` | Claude DevOps Skills: Docker & Terraform \| Skill Garden (55) | Claude skills for cloud and DevOps | 47 ranked DevOps skills for Claude in 11 guides: hosting choice, Docker, Kubernetes, Terraform, CI/CD, Cloudflare, AWS and observability. Free. (143) | claude devops skills |
| `coding-practices` | Claude Debugging & Code Review Skills, Ranked \| Skill Garden (60) | Claude skills for debugging, code review and safe changes | 40 ranked coding-practice skills for Claude in 9 guides: debug to root cause, test first, verify before done, review well, use git safely. (138) | claude debugging skill |
| `content-creation` | Claude Copywriting Skill: Human-Sounding Copy \| Skill Garden (60) | Claude skills for copywriting and content | 38 ranked writing skills for Claude in 10 guides: copy that converts, articles, newsletters, brand voice and edits that strip AI tells. Free. (141) | claude copywriting skill |
| `course-design` | Claude Teaching Skill: Lesson Plans & Courses \| Skill Garden (60) | Claude skills for teaching and course design | 28 ranked teaching skills for Claude in 11 guides: objectives, backward design, lesson plans, quizzes, rubrics, retrieval practice and LMS export. (146) | claude teaching skill |
| `data-analysis` | Claude Data Analysis Skill: SQL & Statistics \| Skill Garden (59) | Claude skills for data analysis | 37 ranked data skills for Claude in 11 guides: SQL, statistics, A/B tests, pandas and Polars, dashboards and honest charts. Free Claude Code plugin. (148) | claude data analysis skill |
| `docs-office` | Claude Excel, PDF & Word Skills, Ranked \| Skill Garden (54) | Claude skills for Excel, PDF and Word files | 38 ranked document skills for Claude in 8 guides: create, edit, fill, convert and check Word, PDF and Excel files, plus Google Docs. Free plugin. (145) | claude excel skills |
| `ecommerce` | Claude Shopify Skill: Stores, Feeds, Checkout \| Skill Garden (60) | Claude skills for Shopify and e-commerce | 33 ranked e-commerce skills for Claude in 12 guides: Shopify and WooCommerce builds, checkout and tax, catalogs, feeds, pricing and analytics. (142) | claude shopify skill |
| `email-marketing` | Claude Email Marketing Skill: Flows & Inbox \| Skill Garden (58) | Claude skills for email marketing | 33 ranked email skills for Claude in 9 guides: lifecycle flows, campaigns, A/B tests, deliverability, React Email, MJML and email law. Free. (140) | claude email marketing skill |
| `figma-design` | Claude Figma Skill: Figma MCP & Design Tokens \| Skill Garden (60) | Claude skills for Figma and design systems | 44 ranked Figma skills for Claude in 10 guides: Figma MCP, tokens and variables, code-to-Figma sync, component specs and design-to-code. Free. (142) | claude figma skill |
| `frontend-ui-design` | Claude Frontend Design Skills, Ranked \| Skill Garden (52) | Claude frontend design skills, ranked | 41 ranked frontend design skills for Claude in 13 guides: design direction, tokens, states, motion, WCAG 2.2 audits and redesigns. Free plugin. (143) | claude frontend design skill |
| `google-ads` | Claude Google Ads Skill: Audits, RSAs & PMax \| Skill Garden (59) | Claude skills for Google Ads | 31 ranked Google Ads skills for Claude in 8 guides: Search, PMax and Shopping builds, RSAs, negatives, bidding, tracking and account audits. (140) | claude google ads skill |
| `image-creation` | Claude Image Generation Skill: Nano Banana \| Skill Garden (57) | Claude skills for image generation and editing | 30 ranked image skills for Claude in 11 guides: prompts for GPT Image, Nano Banana and FLUX, edits, consistent characters and code-made art. Free. (146) | claude image generation skill |
| `instagram-automation` | Claude Instagram Skill: Reels & Carousels \| Skill Garden (56) | Claude skills for Instagram | 19 ranked Instagram skills for Claude in 9 guides: Reels scripts, carousels and captions, published only via Meta's official API. Free plugin. (142) | claude instagram skill |
| `linkedin-automation` | Claude Skill for LinkedIn Posts & Profiles \| Skill Garden (57) | Claude skills for LinkedIn | 29 ranked LinkedIn skills for Claude in 11 guides: posts, profiles, comments and outreach drafted for you. No bots, no scraping. Free plugin. (141) | claude skill for linkedin posts |
| `motion-animation` | Claude Animation Skill: GSAP & Framer Motion \| Skill Garden (59) | Claude skills for motion and animation | 39 ranked animation skills for Claude in 13 guides: easing and timing, GSAP and scroll, Framer Motion, Reanimated, Lottie, Three.js and Manim. (142) | claude animation skill |
| `open-models` | Claude Open Model Skills: Ollama, vLLM, LoRA \| Skill Garden (59) | Claude skills for open-weight models | 30 ranked open-model skills for Claude in 11 guides: model and licence choice, VRAM maths, Ollama, llama.cpp, vLLM, GGUF and LoRA fine-tunes. (141) | claude code ollama skills |
| `poster-design` | Claude Skill for Poster & Logo Design, Ranked \| Skill Garden (60) | Claude skills for posters and graphic design | 37 ranked graphic design skills for Claude in 13 guides: posters, covers, thumbnails, logos, brand kits and print, in code or with image models. (144) | claude skill for poster design |
| `presentations` | Claude PowerPoint & Presentation Skills \| Skill Garden (54) | Claude skills for PowerPoint and presentations | 31 ranked presentation skills for Claude in 12 guides: deck story, slide design, PowerPoint, HTML, Slidev, Marp and Google Slides decks. Free. (142) | claude powerpoint skill |
| `product-management` | Claude Skills for Product Managers & PRDs \| Skill Garden (56) | Claude skills for product managers | 32 ranked product skills for Claude in 12 guides: PRDs and specs, stories, prioritization, outcome roadmaps, sprints, Jira and Linear. Free. (140) | claude skills for product managers |
| `research-science` | Claude Skill for Research Paper Writing \| Skill Garden (54) | Claude skills for research and science | 36 ranked research skills for Claude in 10 guides: find papers, literature reviews, citation checks, hypotheses, writing and peer review. Free. (143) | claude skill for research paper writing |
| `security` | Claude Security Skill: Secure Code Review \| Skill Garden (56) | Claude skills for secure code and security review | 39 ranked security skills for Claude in 8 guides: secure coding, threat models, Semgrep and CodeQL triage, secrets and CI hardening. Free. (138) | claude security skill |
| `seo` | SEO Skill for Claude: Ranked Skills & Guides \| Skill Garden (59) | Claude SEO skills, ranked and distilled | 35 ranked SEO skills for Claude in 10 guides: audits, indexing, schema, content that ranks, local SEO and AI search visibility. Free plugin. (140) | claude seo skill |
| `social-media` | Claude Social Media Skills: Posts & Reels \| Skill Garden (56) | Claude skills for social media | 30 ranked social media skills for Claude in 12 guides: plan, write and publish posts, threads, carousels and short video scripts, then engage. (142) | claude social media skills |
| `storyboarding` | Claude Storyboarding Skill: Script to Shots \| Skill Garden (58) | Claude skills for storyboarding | 35 ranked storyboarding skills for Claude in 10 guides: beats, scripts, camera language, consistent characters and per-shot AI video prompts. (141) | claude skill for storyboarding |
| `testing-qa` | Claude TDD & Test Automation Skills \| Skill Garden (50) | Claude skills for testing and QA | 38 ranked testing skills for Claude in 11 guides: TDD, unit and E2E tests with Playwright, pytest and Vitest, browser QA and flaky-test fixes. (142) | claude tdd skill |
| `token-efficiency` | Claude Token Optimization Skill: Spend Less \| Skill Garden (58) | Claude skills for token efficiency | 29 ranked token-saving skills for Claude in 10 guides: lean context, session hygiene, caching that hits, model and effort choice, plan limits. (142) | claude skill for token optimization |
| `trading-finance` | Claude Trading & Finance Skills, Ranked \| Skill Garden (54) | Claude skills for trading and finance | 36 ranked finance skills for Claude in 12 guides: DCF, comps and LBO models, equity research, backtests, risk and options maths. Paper first. (141) | claude trading skills |
| `website-building` | Claude Skill for Website Design & Building \| Skill Garden (57) | Claude skills for website design and building | 38 ranked web skills for Claude in 11 guides: copy, design that doesn't look AI-made, Next.js or Astro builds, Core Web Vitals and deploys. Free. (145) | claude skill for website design |
