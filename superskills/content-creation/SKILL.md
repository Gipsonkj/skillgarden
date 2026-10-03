---
name: content-creation
description: Write, edit and plan written content and marketing copy that sounds human and converts. Covers humanizing AI-sounding text (de-AI, "sounds like AI", slop, em dashes, AI tells), conversion copy (landing, homepage, pricing and product pages, headlines, taglines, value props, CTAs, microcopy, meta descriptions), copy editing (proofread, polish, tighten, content refresh), content strategy (pillars, topic clusters, keyword research, editorial calendar, content briefs), long-form articles and blog posts (guides, tutorials, case studies, press releases, release notes, SEO optimization), shaping notes or transcripts into an article, brand voice and tone-of-voice guides (write in our voice, TONE.md, write like this author, ghostwriting), newsletters and Substack issues (subject lines, growth), and repurposing one piece into threads, posts, carousels and emails. Use for any of these, or say "use content-creation: <task>".
---

# Content creation

Everything that is words on a page: copy that sells, articles that rank and get shared, newsletters people open, and edits that make a draft sound like a specific person instead of a model. The job is the same across formats: know the reader and the one thing they should do or learn, find the specific facts, write it plainly in the right voice, then edit hard. Posting and scheduling on social platforms belongs to the separate social-media skill; this one writes the words.

## Core principles

1. **Never invent facts.** No made-up numbers, quotes, customers, testimonials, benchmarks or anecdotes. Missing material becomes `[NEED: ...]` or a question. A confident wrong fact is worse than a vague true one, and is itself a top AI tell.
2. **Reader and job first.** Before drafting, name the exact reader, what they feel when the text reaches them, and the one action or takeaway. Ask once, in a batch, for what is missing. Generic input makes generic output.
3. **Specific beats vague.** Every claim sentence needs a number, a name, a mechanism or a concrete action. Swap test: if the line works unchanged for a competitor, rewrite it.
4. **Lead with the point.** Open on the problem, the result or the artifact. No era openers, definitions everyone knows, announcements of what the piece will do, or warm-up paragraphs.
5. **One idea per unit.** One claim per post, one argument per section, one primary CTA per page, one idea per derivative.
6. **Shape tells outrank word tells.** Contrast reveals ("it's not X, it's Y"), negation lists, trailing pile-ons, one-line closers, forced triads and uniform rhythm give AI away more than any banned word. Judge clusters, not single hits.
7. **Rewrite from the facts, not with synonyms.** Swapping "robust" for "solid" makes a new tell; "99.99% uptime over two years" fixes it.
8. **Dashes.** None in short copy (headlines, ads, posts, subject lines). In long copy default to none, max 1-2 per page, unless the writer's own samples use them. (Sources split between "never" and "fine in moderation"; this keeps rewrites from adding them while respecting real voices.)
9. **The writer's voice wins.** A sample, VOICE PROFILE, TONE.md or Writing DNA overrides generic style rules. Restore stance and asides in opinion genres; never add first person, fake candor or anecdotes the source lacks.
10. **Voice is constant, tone flexes.** Personality stays the same; formality, energy and technical depth change by channel and situation.
11. **Cut more than you add.** Professional edits run roughly 74% replace, 18% delete, 8% insert. Growth is only for real specifics.
12. **Separate passes.** Draft, then audit one dimension at a time (clarity, voice, proof, specificity, AI tells). A single combined pass misses things.
13. **Short copy ships as options.** Headlines and hooks: 5-10 variants across angles, then one pick justified by the reader's feeling.
14. **Proof and honesty over hype.** Name sources, keep conditions on numbers, include the trade-off or dead end, never overstate a feature.

## Pick the right guide

| Task | Read |
|---|---|
| Remove AI patterns, humanize, de-slop, audit a draft for AI tells (any text) | [references/humanize-ai-writing.md](references/humanize-ai-writing.md) |
| Landing/home/pricing/feature page copy, headlines, CTAs, value props, product and meta descriptions, microcopy, subject lines | [references/conversion-copy.md](references/conversion-copy.md) |
| Edit, proofread, tighten or review existing copy; expert-panel scoring; refresh outdated content | [references/copy-editing.md](references/copy-editing.md) |
| Content strategy, pillars, topic clusters, keyword-by-stage research, prioritizing ideas, calendars, content briefs | [references/content-strategy.md](references/content-strategy.md), [templates/content-production/content-brief-template.md](templates/content-production/content-brief-template.md) |
| Blog posts, articles, guides, tutorials, case studies, press releases, release notes, SEO and AI-citation optimization | [references/long-form-articles.md](references/long-form-articles.md), scripts in [scripts/content-production/](scripts/content-production/) |
| Interview the author for fragments, then shape notes/transcripts into an article block by block | [references/writing-from-raw-material.md](references/writing-from-raw-material.md) |
| Brand voice: voice profile from samples, tone-of-voice guide (TONE.md), ghostwriting voice guide, Writing DNA, enforcing voice on any piece | [references/brand-voice.md](references/brand-voice.md), [templates/copywriting-tone-of-voice-creator/TONE-template.md](templates/copywriting-tone-of-voice-creator/TONE-template.md) |
| Newsletter issues, Substack posts and Notes, subject lines, welcome sequences, newsletter growth and monetization | [references/newsletters.md](references/newsletters.md) |
| Repurpose one piece into threads, LinkedIn posts, carousels, clips scripts, emails | [references/repurposing.md](references/repurposing.md) |

Call a sub-capability by naming the task ("write a landing page for...") or with "use content-creation: humanize", "...: brand voice", "...: repurpose", and so on. Read only the guide(s) the task needs; most tasks need one plus the humanize pass.

## Scripts

Run only in the optimize step of long-form SEO pieces, as described in [references/long-form-articles.md](references/long-form-articles.md). Local Python 3 standard library, no network:

| Script | Use |
|---|---|
| `scripts/content-production/seo_optimizer.py draft.md --keyword "kw" --secondary "a,b"` | Keyword placement and density, structure, meta suggestions |
| `scripts/content-production/content_scorer.py draft.md "kw"` | 0-100 score on readability, SEO, structure, engagement (target 70+) |
| `scripts/content-production/content_quality_gates.py draft.md --json` | Publish gates: heading order, paragraph length, alt text, sourced stats, title/meta length, freshness marker |

## Default workflow

1. **Classify the task** and open the matching guide from the table. Check for existing context files first (`TONE.md`, `.claude/brand-voice-guidelines.md`, `.agents/product-marketing.md`, a VOICE PROFILE).
2. **Intake.** One batch of questions for what is missing: reader, goal/action, proof and facts, voice samples, channel, length. Skip what the brief already answers.
3. **Load or build the voice** when voice matters or more than one piece is coming ([brand-voice.md](references/brand-voice.md)).
4. **Plan.** Strategy pieces: the brief. Pages: section plan. Articles: angle + 4-7 H2s. Short copy: angles for variants. Newsletters: titles and hooks for the user to pick.
5. **Draft** from facts, leading with the concrete thing; mark gaps `[NEED: ...]`.
6. **Edit in passes:** structure and clarity, then proof and specificity, then voice, then the AI-tell audit in [humanize-ai-writing.md](references/humanize-ai-writing.md). High-stakes copy also gets the sweeps and panel in [copy-editing.md](references/copy-editing.md).
7. **Optimize** if it will be found by search (title, meta, links, scripts).
8. **Deliver** in the format the guide specifies, with alternatives where useful, a 1-line rationale for key choices, and the list of open gaps.

## Done means

- [ ] Nothing invented; every number, name and quote traces to the user or a named source; gaps flagged
- [ ] The reader, the one action or takeaway, and the format are obvious from the first screen
- [ ] Opens on the point; every section or line adds something new; no recap ending
- [ ] Passes the swap test and the "Now you can..." test (copy) or "would a practitioner share this?" (articles)
- [ ] Voice matches the samples or guide; tone fits the channel
- [ ] AI-tell audit run on the final text: no contrast reveals, negation lists, pile-ons, staged openers, chatbot residue, forced triads, decorative bold; dash rule respected
- [ ] Length, character limits and formatting fit the medium (meta 150-160 chars, subject 30-50, title tag 50-60)
- [ ] Short copy delivered as options with a stated pick
