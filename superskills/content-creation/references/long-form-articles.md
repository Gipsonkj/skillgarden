# Long-form: articles, blog posts, guides, case studies

> Distilled from: article-writing (affaan-m/ECC, MIT), content-production (alirezarezvani/claude-skills, MIT), blog-writing-guide (getsentry/skills, Apache-2.0), sepia tech-articles and release-notes domains (Nanako0129/sepia, MIT), ai-copywriter strategic blog rules (mikiarlo3/ai-copywriter, MIT), content-creation templates (anthropics/knowledge-work-plugins, Apache-2.0).

Use for "write a post about", "draft an article", "blog post", "guide", "tutorial", "engineering deep dive", "case study", "press release", "thought leadership", "optimize this post for SEO". If the user hands you notes, a transcript or a fragments file and wants to build the piece together, use [writing-from-raw-material.md](writing-from-raw-material.md) instead.

## Three modes

| Mode | Start when | Output |
|---|---|---|
| Brief | Topic only | Brief per [content-strategy.md](content-strategy.md) §7 |
| Draft | Brief or clear angle exists | Full piece with H1, H2s, intro, body, close, inline source markers |
| Optimize | Draft exists | Annotated draft, title tag, meta, link plan, gate results |

Ask in one batch for what is missing: topic and angle, reader (what they already know), goal (inform, convert, authority, trial), target keyword, length, existing pages to link. If the topic is vague ("write about AI"), push back for the reader and the problem.

## Core rules

1. **Lead with the concrete thing**: the incident, number, artifact, code, screenshot or result. Explain after the example.
2. **Problem before topic.** First 2-3 sentences state the problem or the conclusion. Never open with background, company history, a definition everyone knows, or "In today's..." If no real incident exists, write "notes on X", never a fabricated war story.
3. **Proof over adjectives.** "p99 dropped from 340 ms to 45 ms" beats "significantly faster". Numbers carry conditions (machine, version, data size, runs).
4. **Never invent** facts, quotes, customers, benchmarks or credentials. Missing → ask or leave `TODO:`.
5. **One job per section.** Each H2 opens with its point, proves it, ends with something usable.
6. **Take a position.** At least one opinion the reader could disagree with, with the condition that would change it. Comparisons end in a recommendation.
7. **Include the dead end.** What broke, what you tried first, known limits. Models omit this; readers trust it.
8. **Uneven depth.** The surprising part gets 5x the words of setup steps. Symmetric coverage reads as machine-made.
9. **Voice persists.** Personality in the middle too, not only in the intro anecdote and the closing CTA.

## Structure

Default: follow the reader's questions.
1. What problem does this solve? (1-2 paragraphs)
2. How does it actually work? (the bulk, specific)
3. What were the trade-offs and alternatives?
4. How do I use or try it?
Deep dives add: what did not work, known limitations.

If your section questions read *what is X → why X matters → how to X → conclusion*, restructure around what actually happened.

**Intro** (3-4 sentences, under 150 words): the reader's situation, what this piece does about it, optionally why to trust you. Primary keyword in the first 100 words when SEO matters.
**Outline:** 4-7 H2s that are complete thoughts ("Why pre-aggregation destroys debugging context", not "Background"). H3 only when a section truly splits. Do not spend more than 5 minutes on the outline; draft and restructure.
**Close:** 1-2 sentence takeaway, the single next step, CTA if the goal needs one. No recap section, no "exciting times ahead", no engagement-bait question. Under 150 words.

## Template by intent

| Request | Template | Length |
|---|---|---|
| "How do I..." | How-to: prerequisites, numbered steps, common mistakes, FAQ | 1,500-3,000 |
| "Best X for Y" | Listicle: comparison table first, one H2 per item with best-for, how evaluated, FAQ | 2,000-4,000 |
| "X vs Y" | Comparison: verdict first, table, strengths/weaknesses, when to choose each, FAQ | 2,000-3,500 |
| "Complete guide to X" | Pillar: what/why, H2 per subtopic linking to cluster posts, getting started, FAQ | 3,000-5,000 |
| Results data | Case study: challenge, approach, results with metrics, quote, takeaways | 1,500-2,500 |
| Recent event | News analysis | 800-1,500 |
| Original data | Research post: findings as citable one-line stats | 1,500-3,000 |
| "What is X" | FAQ/definition | 1,000-2,000 |
| Market shift for founders | Strategic post (below) | 1,500-3,000 |
| Unclear | Offer 2-3 of these | |

**Case study fields:** title "[Customer] achieves [result] with [product]"; snapshot box (industry, size, product, key result); challenge; solution; quantified results; customer quote; CTA.
**Press release:** factual headline under 80 chars; dateline (city, date); lead paragraph with who/what/when/where/why in 2-3 sentences; supporting detail and quotes; standard boilerplate; media contact.
**Release notes:** breaking changes first with the exact migration step; one verb-first line per change with its PR/issue number; no "thrilled to announce", no journey intro, no road-ahead outro; a patch release can be three lines.
**Strategic post (market thesis + playbook):** open with the playbook that is breaking and the companies growing anyway; 2-4 named phases of how we got here; a 2-5 word name for the new model; 1-2 ground rules; 4-7 numbered strategies, each with a real company mechanism and an operating lesson; cautious causal language where evidence is thin.

## Voice

If voice matters, build or load the profile first ([brand-voice.md](brand-voice.md)) and reuse it. Without samples, default to a sharp operator voice: concrete, unsentimental, useful; "we" and "you"; contractions; one good joke at most.

Banned on sight: "We're excited/thrilled to announce", best-in-class, industry-leading, cutting-edge, seamless, empower, leverage, unlock, robust, streamline, "At [Company], we believe", "In this post we will explore", "That being said", "It's worth noting", "At the end of the day". Also the shapes in [humanize-ai-writing.md](humanize-ai-writing.md): staccato fragments, bumper-sticker aphorisms, three-beat reveals ("Not X. Not Y. It was Z."), "That's it. That's all you need." after code, ad-copy parallelism.

## Formatting for the web

- Paragraphs: one idea, usually 2-4 sentences; break at the "but" so the turn starts a new paragraph.
- Subheading every 200-300 words; a table, list, image or callout at least every ~400 words.
- Sentences average 15-20 words, none over ~35; passive under 20%.
- Code must run (imports, config included) or be labelled a sketch. Systems with 3+ components get a diagram with real names.
- Headings carry information and, for SEO, a secondary keyword.

## SEO and AI-citation pass (Optimize mode)

- Title tag 50-60 chars with the primary keyword; H1 may differ; slug short, keyword-first, hyphens.
- Primary keyword 3-5 times naturally, in the first 100 words and one H2; 2-4 secondaries in H2s and body.
- Meta description 150-160 chars, keyword, ends with a reason to click. OG title/description written for sharing.
- 2-4 internal links with descriptive anchors; 1-2 external links to authoritative sources; every stat carries "(Source, year)".
- Developer/competitive queries: first ~50-60% tool-agnostic education, product as the example in the second half; include a "What is X?" section and a 3-4 question FAQ for long-tail queries.
- For AI answer engines: the first 40-60 words after each H2 answer that section's question; self-contained 120-180 word passages; full entity names on first mention ("React 19 Server Components", not "the new feature"); a visible "Last updated" date; refresh evergreen pieces every 6-12 months. Never fabricate a stat to be "citable".

## Run the bundled checkers

These are local, stdlib-only Python scripts (no network). Run them in Optimize mode on a markdown draft, then fix and re-run:

```bash
python3 scripts/content-production/seo_optimizer.py draft.md --keyword "primary keyword" --secondary "phrase one,phrase two"
python3 scripts/content-production/content_scorer.py draft.md "primary keyword"   # 0-100; target 70+
python3 scripts/content-production/content_quality_gates.py draft.md --json      # PUBLISH / TARGET / BLOCK
```

Gates checked mechanically: H1→H2→H3 hierarchy, no paragraph over 150 words, image alt text, a `[source]` marker or link next to every statistic, title 50-60 chars, meta description 150-160 chars, at most 1 self-promotional mention, an "Updated"/dateModified marker. Paths are relative to this skill's folder. The scripts are heuristics; a pass does not replace reading it aloud.

## Done means

- [ ] Opening states the problem or conclusion within 2 sentences
- [ ] Every section adds something new and leads with its point
- [ ] Every factual claim is sourced or labelled as opinion/estimate; nothing invented
- [ ] At least 2 concrete examples; at least one stance; the dead end is in
- [ ] Voice matches the profile or samples; humanize pass run
- [ ] Title, meta, links and gates pass (SEO pieces)
- [ ] "Would a practitioner share this?" If not, go deeper or make it a changelog entry
