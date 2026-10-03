# Content strategy: pillars, clusters, keywords, briefs

> Distilled from: content-strategy (coreyhaines31/marketingskills, MIT), content-production brief guide and templates (alirezarezvani/claude-skills, MIT), content-creation SEO fundamentals (anthropics/knowledge-work-plugins, Apache-2.0).

Use for "content strategy", "what should I write about", "blog strategy", "content pillars", "topic clusters", "editorial calendar", "content roadmap", "keyword research for content", "content brief". This file decides what to make; writing the piece is in [long-form-articles.md](long-form-articles.md).

## 1. Context to gather (ask once, in a batch)

- Business: what it sells, ideal customer, the problems it solves, primary content goal (traffic, leads, authority).
- Customer research: questions asked before buying, objections from sales calls, repeated support topics, their exact words.
- Current state: existing content and what works, team capacity, formats they can produce.
- Competitors: who, and where their content is thin.

If the user has keyword exports, call transcripts, surveys or support logs, mine them before guessing.

## 2. Searchable, shareable, or both

Every piece must be at least one.

| | Searchable | Shareable |
|---|---|---|
| Job | Capture existing demand | Create demand, earn links and mentions |
| Rules | One keyword or question; match intent exactly; title and headings mirror the query; answer every related question | Novel insight, original data, a well-argued counter-view, honest stories |
| Formats | Use-case pages ([persona] + [use case]), hub and spoke, templates, how-tos, comparisons | Thought leadership, data studies, expert roundups (15-30 experts, one question), case studies, behind-the-scenes |

**Calendar split, starting point:** 60% searchable, 30% shareable, 10% experimental. A new blog can over-index on searchable; a brand chasing category leadership can push shareable higher.

**Link-earning formats** (one vendor study of B2B SaaS, March 2026, directional): statistics roundups earned 4.25x their page share in backlinks; glossaries 1.47x; calculators 1.38x; how-tos 1.36x; original research 0.80x; ultimate guides 0.77x; templates 0.68x. Practical read: keep a maintained stats page for your category; when you publish research, also publish its findings as citable one-liners.

## 3. Pillars and clusters

Pick **3-5 pillars** the brand will own. Find them four ways: product-led (problems you solve), audience-led (what the buyer must learn), search-led (topics with volume), competitor-led (what they rank for). A good pillar aligns with the product, matters to the audience, has search or social demand, and is broad enough for many subtopics.

```
Pillar (hub page)
├── Cluster 1: article, article, article
├── Cluster 2: article, article, article
└── Cluster 3: article, article, article
```

Build the hub first, then the spokes, and interlink them. Most sites can keep everything under `/blog/post-title`; use dedicated hub URLs only for topics with real layered depth.

## 4. Keywords by buyer stage

| Stage | Modifiers | Example titles |
|---|---|---|
| Awareness | what is, how to, guide to | "How to run a standup meeting" |
| Consideration | best, top, vs, alternatives | "Asana vs Trello vs Monday" |
| Decision | pricing, reviews, demo, trial | "Project management tool pricing compared" |
| Implementation | template, example, tutorial, setup | "Sprint planning template" |

Per piece: **one primary keyword, 2-4 secondary**. Find secondaries in People Also Ask, autocomplete and the top results. Match intent: an informational keyword needs a guide, not a sales page.

| What ranks now | Intent | Write |
|---|---|---|
| What is / how to pages | Informational | Guide or explainer |
| Product pages, reviews | Commercial | Comparison or buyer's guide |
| News | News | Skip unless you have a unique angle |
| Reddit/Quora threads | Discovery | Opinionated piece with real experience |

Flag without being asked: **thin content** (competitors at 2,000+ words, you plan 600), **cannibalization** (you already target the keyword), **intent mismatch**, **CTA that does not fit the goal**.

## 5. Where ideas come from

| Source | Extract | Output |
|---|---|---|
| Keyword data (Ahrefs, Semrush, GSC) | Clusters, stage, intent, quick wins (low difficulty + decent volume + high relevance), competitor gaps | Table: Keyword, Volume, Difficulty, Stage, Type, Priority |
| Sales/customer calls | Questions, pains in their words, objections, competitor mentions | Ideas with supporting quotes |
| Surveys | Themes (30%+ mention = high priority), resource wishes | Prioritized themes |
| Forums (`site:reddit.com <topic>`, Quora, HN, Indie Hackers) | FAQs, misconceptions, debates, vocabulary | Ideas + terms to use |
| Competitors (`site:competitor.com/blog`) | Top posts, repeated topics, gaps, stale pieces | Topics to do better or differently |
| Support and sales teams | Ticket patterns, success stories | FAQ and how-to backlog |

## 6. Prioritize

Score each idea 1-10 per factor, multiply by the weight, sum.

| Factor | Weight | Ask |
|---|---|---|
| Customer impact | 40% | How often it came up, how many customers, how painful |
| Content-market fit | 30% | Tied to what the product solves? Do we have unique insight or stories? |
| Search potential | 20% | Volume, competition, long tail, trend |
| Resources | 10% | Expertise, research and assets needed |

Example: 8, 9, 7, 6 → 0.4×8 + 0.3×9 + 0.2×7 + 0.1×6 = 7.9. Make the top scorers first.

## 7. The content brief (one per piece)

Use [templates/content-production/content-brief-template.md](../templates/content-production/content-brief-template.md). The bar: two different writers would produce nearly the same piece from it.

- **Angle** (most important field): one opinionated sentence, different from what ranks, grounded in something you know. "Why most email open-rate benchmarks are useless and what to measure instead" is an angle; "comprehensive guide to email marketing" is not.
- **Gap**: all listicles → write the deep guide; all 2+ years old → current version; all generic → practitioner cases; one point of view → the other side; long but shallow → shorter and useful.
- **H2s as complete thoughts**, 4-6 of them, in reader order.
- **3+ sources** with the exact data point identified before drafting.
- **Internal links**: 2-3 out, 1-2 existing pages that will link in.
- **Success criteria**: e.g. top 5 for the keyword in 6 months, X leads a month.

## 8. Production discipline per format

- Blog post: write 10 title options before drafting; plan about 5 editing passes (structure, clarity, evidence, line edit, title/SEO).
- Pillar guide: the flagship; table of contents, links to every spoke.
- Video: script the hook first; plan the short clips at writing time.
- Podcast: plan the transcript, quotes, clips and recap before recording.
- Email: one idea per send; write several subject lines.
- Every flagship: build the repurposing hooks in from the start (standalone subheads, liftable sections, pre-picked quotes and stats). See [repurposing.md](repurposing.md).

## 9. Strategy deliverable

```
1. Pillars (3-5): rationale, link to product, subtopic clusters
2. Priority topics: title | searchable/shareable | type | keyword | stage | why (research evidence) | score
3. Cluster map: hub → spokes, internal links
4. Calendar: first 8-12 weeks at the 60/30/10 mix, cadence the team can sustain
5. Distribution: owned/rented/borrowed channel per piece
```
