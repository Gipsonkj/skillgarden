---
name: content-creation
description: Write, edit and plan content and marketing copy that sounds human and converts: humanizing AI-sounding text, landing and product page copy, headlines and CTAs, proofreading and tightening, blog posts, articles and case studies, content strategy, brand voice guides, newsletters, repurposing one piece into posts and threads, and drafts to WordPress or HubSpot. Use when asked to write, rewrite, edit or plan copy or content. Email sequences: email-marketing. Ranking in search: seo.
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

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Launch article plus social cut-downs: `references/brand-voice.md` → `references/long-form-articles.md` → `references/humanize-ai-writing.md` → `references/repurposing.md`; keyword targets from `seo` → `references/keywords-content.md`; posting plan from `social-media` → `references/platform-playbook.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Remove AI patterns, humanize, de-slop, audit a draft for AI tells (any text) | [references/humanize-ai-writing.md](references/humanize-ai-writing.md) |
| Landing/home/pricing/feature page copy, headlines, CTAs, value props, product and meta descriptions, microcopy, subject lines | [references/conversion-copy.md](references/conversion-copy.md) |
| Edit, proofread, tighten or review existing copy; expert-panel scoring; refresh outdated content; pick a checker (Grammarly, bundled scripts) | [references/copy-editing.md](references/copy-editing.md) |
| Content strategy, pillars, topic clusters, keyword-by-stage research, prioritizing ideas, calendars (pick where it lives, e.g. Notion), content briefs | [references/content-strategy.md](references/content-strategy.md), [templates/content-production/content-brief-template.md](templates/content-production/content-brief-template.md) |
| Blog posts, articles, guides, tutorials, case studies, press releases, release notes, SEO and AI-citation optimization | [references/long-form-articles.md](references/long-form-articles.md), scripts in [scripts/content-production/](scripts/content-production/) |
| Interview the author for fragments, then shape notes/transcripts into an article block by block | [references/writing-from-raw-material.md](references/writing-from-raw-material.md) |
| Brand voice: voice profile from samples, tone-of-voice guide (TONE.md), ghostwriting voice guide, Writing DNA, enforcing voice on any piece | [references/brand-voice.md](references/brand-voice.md), [templates/copywriting-tone-of-voice-creator/TONE-template.md](templates/copywriting-tone-of-voice-creator/TONE-template.md) |
| Newsletter issues, Substack posts and Notes, subject lines, welcome sequences, newsletter growth and monetization | [references/newsletters.md](references/newsletters.md) |
| Repurpose one piece into threads, LinkedIn posts, carousels, clips scripts, emails | [references/repurposing.md](references/repurposing.md) |
| Hand off or publish the finished piece: Google Docs for review, Notion page, WordPress or HubSpot draft and schedule; pick a publishing tool | [references/publishing-tools.md](references/publishing-tools.md) |

Call a sub-capability by naming the task ("write a landing page for...") or with "use content-creation: humanize", "...: brand voice", "...: repurpose", and so on. Read only the guide(s) the task needs; most tasks need one plus the humanize pass.

## Scripts

Run only in the optimize step of long-form SEO pieces, as described in [references/long-form-articles.md](references/long-form-articles.md). Local Python 3 standard library, no network:

| Script | Use |
|---|---|
| `scripts/content-production/seo_optimizer.py draft.md --keyword "kw" --secondary "a,b"` | Keyword placement and density, structure, meta suggestions |
| `scripts/content-production/content_scorer.py draft.md "kw"` | 0-100 score on readability, SEO, structure, engagement (target 70+) |
| `scripts/content-production/content_quality_gates.py draft.md --json` | Publish gates: heading order, paragraph length, alt text, sourced stats, title/meta length, freshness marker |

## Other crafts

| When the request also needs | Use |
|---|---|
| Platform-native posts, threads and a posting schedule (beyond the drafts in `references/repurposing.md`) | `social-media` → `references/platform-playbook.md`, `references/x-threads.md`, `references/publishing-apis.md` |
| LinkedIn posts with a pre-publish lint, or ghostwriting for a founder | `linkedin-automation` → `references/post-writing.md`, `references/ghostwriting.md` |
| Keyword research, schema or AI-search visibility (beyond the on-page basics in `references/long-form-articles.md`) | `seo` → `references/keywords-content.md`, `references/schema.md`, `references/ai-search.md` |
| Paid ad copy with character limits and policy checks | `ad-creation` → `references/ad-copywriting.md`, `references/platform-specs.md` |
| Hero images, social graphics or illustrations for the piece | `image-creation` → `references/marketing-brand-images.md`, `references/web-frontend-assets.md` |
| The landing page itself: design, build and deploy | `website-building` → `references/design-direction.md`, `references/stacks-astro-vue-static.md`, `references/deploy-vercel.md` |
| A designed white paper, report or one-pager as PDF or Word | `docs-office` → `references/document-design.md`, `references/pdf.md`, `references/word-docx.md` |
| A video script broken into scenes and shots | `storyboarding` → `references/script-and-scene-craft.md`, `references/shot-lists-and-boards.md` |
| An article turned into a podcast or narrated audio | `audio-generation` → `references/podcast-and-dialogue.md`, `references/voiceover-tts.md` |
| Email sequences, deliverability, templates or an ESP set-up (beyond writing one issue in `references/newsletters.md`) | `email-marketing` → `references/sequences-and-lifecycle.md`, `references/deliverability.md`, `references/esp-platforms-and-analytics.md` |

## Go deeper (original skills)

Original community skills behind these guides, for a part the guides don't cover in full: `references/go-deeper.md`. Read any script there before running it.

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
