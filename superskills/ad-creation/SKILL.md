---
name: ad-creation
description: Plan, write, produce and iterate paid ad creative for Google, Meta (Facebook/Instagram), TikTok, LinkedIn and X. Use for creative strategy, ad briefs, angles and concept matrices; ad copy, hooks, headlines, RSA headlines and descriptions, primary text, CTAs and character-limit checks; Meta static and video ad formats, crop-safe design and Special Ad Categories; TikTok/Reels/Shorts video ads, UGC and creator briefs, founder ads, chat-reveal ads; AI-generated product images and video ads (FLUX, Higgsfield, Nano Banana, Veo, faceless motion ads); competitor ad research and ad library teardowns (Meta Ad Library, Google Ads Transparency, TikTok Creative Center, Apify, ScrapeCreators); creative testing, iteration from performance data, creative audits and creative fatigue; client review pages. Triggers: "write me some ads", "ad copy", "ad creative", "ad variations", "hooks", "creative brief", "UGC ad", "product ad", "spy on competitor ads", "which ad won", "ads are fatiguing".
---

# Ad creation

Covers paid ad creative from the first brief to the next iteration: deciding which ads to make, writing them inside each platform's limits, producing statics and video (including with AI models), researching what competitors run, and learning from results. Campaign setup, bidding and tracking appear only where they shape the creative.

## Core principles

1. **Ground every ad in real inputs.** Winning ads, 50-100 customer reviews and ad comments first; copy written from nothing reads like every other ad in the feed. For batch work, stop and ask for inputs rather than generate ungrounded concepts.
2. **No invented claims.** No made-up stats, testimonials, prices, scarcity, credentials or results. Every on-screen or in-copy claim has a source (seen, spec, said, or a named review). Mark gaps `[NEED: source]`.
3. **Angles before wording.** 3-5 distinct angles per brief (pain, outcome, proof, mechanism, comparison, objection, identity, real urgency). Ten cells of segment × motivation beat thirty rewordings of one.
4. **Specific beats vague.** Numbers, nouns, the customer's own words. "Cut reporting from 4 hours to 15 minutes", not "save time".
5. **Fit the limit, then check it.** Google headline 30, description 90; Meta primary text 125 visible, headline ~40; LinkedIn intro 150; TikTok 100. Show the count on every line and run the validator.
6. **The hook decides.** Video: visual action + spoken line + caption in 0-3 s, each doing a different job. The next 12 seconds must continue the hook's premise.
7. **Message match.** Every ad echoes a claim the landing page makes. No destination URL, no message-match check: ask for it.
8. **Design for the placement.** Text and key visuals inside the 720×1200 band of a 1080×1920 canvas; for 9:16 reused in feed, keep the message block in y=420-1500. Captions on; most feed video plays muted.
9. **Pick formats by job.** Scalers (founder, creator partnership, VSL, grid static) open cold audiences; supporting cast (callout, FAQ, before/after, us vs. them) converts warm ones. Build a portfolio.
10. **Native beats polished.** Real product photos, plain bold captions, creator delivery. No fake platform UI.
11. **No AI tells.** No "it's not X, it's Y", negation lists, "The result?" reveals, stock phrases or em dashes in short copy. Vary openings across a batch.
12. **One variable per test, read the whole funnel.** Thumbstop → hold → CTR → conversion; fix the stage that's weak. Wait for 1,000+ impressions and 7+ days per variant before a verdict.
13. **Cost follows evidence.** Hunches ship as cheap statics within days; only angles with a signal earn a shoot.
14. **Unsubstantiated superlatives lose.** Some sources offer "#1", "Best X of 2026" and "As seen in" templates. Don't use them unless the proof is on the page: they trigger rejections and press logos carry rights risk. Health before/after and earnings claims need category policy checks.

Where sources conflict on numbers (impression thresholds, refresh cadence), treat the numbers here as minimums and defer to the account's own data; one source rightly warns there is no universal fatigue cadence.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Meta launch for a desk mat: `references/creative-strategy.md` → `references/ad-copywriting.md` → `references/meta-ads-creative.md` → `references/testing-iteration.md`; landing hero from `content-creation` → `references/conversion-copy.md`; static layouts from `poster-design` → `references/banners-social.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Brief, angles, concepts, evidence ranking, message match, roadmap, client review page | [references/creative-strategy.md](references/creative-strategy.md) + `templates/ad-creative-coreyhaines/creative-review-template.html` |
| Ad copy: headlines, hooks, primary text, descriptions, CTAs, AI tells, policy triggers | [references/ad-copywriting.md](references/ad-copywriting.md) + `scripts/ad-creative-alirezarezvani/ad_copy_validator.py` |
| Character limits, image sizes, safe zones, video specs per platform | [references/platform-specs.md](references/platform-specs.md) |
| Meta/Facebook/Instagram: format tiers, static templates, crop-safe, Advantage+, Special Ad Categories | [references/meta-ads-creative.md](references/meta-ads-creative.md) |
| TikTok/Reels/Shorts video, hooks, UGC and creator formats, briefs, rights, founder and chat-reveal ads | [references/short-form-video-ugc.md](references/short-form-video-ugc.md) |
| AI product images and video ads, faceless motion ads, VO, assembly and QC (any provider) | [references/ai-ad-production.md](references/ai-ad-production.md) |
| FLUX 3 (BFL API) product ads or Higgsfield product photoshoot CLI | [references/vendor-flux-higgsfield.md](references/vendor-flux-higgsfield.md) |
| Competitor ads, ad library teardown, swipe file, gap analysis | [references/competitor-ad-research.md](references/competitor-ad-research.md) |
| Bulk ad-library pulls with Apify Actors or ScrapeCreators API | [references/vendor-ad-library-apis.md](references/vendor-ad-library-apis.md) |
| Testing plan, iterating from data, creative audit, fatigue, monthly retro | [references/testing-iteration.md](references/testing-iteration.md) |

Call a sub-capability by naming the task, or say "use ad-creation: <capability>" (for example "use ad-creation: competitor teardown").

## Other crafts

| When the request also needs | Use |
|---|---|
| Google Search, PMax or Shopping builds: keywords, bidding, conversion tracking (beyond the RSA copy here) | `google-ads` → `references/campaign-build.md`, `references/keywords-negatives.md`, `references/conversion-tracking.md` |
| Landing page copy that matches the ads, or a brand voice to write them in | `content-creation` → `references/conversion-copy.md`, `references/brand-voice.md` |
| Static layouts, type hierarchy and one design resized to every placement, or bulk in Canva | `poster-design` → `references/banners-social.md`, `references/foundations.md`, `references/canva.md` |
| Product shots consistent across a batch, background swaps, model-specific prompts (beyond `references/ai-ad-production.md`) | `image-creation` → `references/editing-references-consistency.md`, `references/prompting-fundamentals.md` |
| Real footage cut into a video ad, HyperFrames motion ads, captions and export checks | `ai-video` → `references/footage-editing-ffmpeg.md`, `references/hyperframes-workflows.md`, `references/delivery-qa.md` |
| A voiceover, music bed or final mix at the platform's loudness | `audio-generation` → `references/voiceover-tts.md`, `references/music-generation.md`, `references/mixing-and-mastering.md` |
| Organic posts and a calendar beside the ads (posts plus ads together: the `campaign` chain) | `social-media` → `references/hooks-and-voice.md`, `references/strategy-calendar.md` |
| Whether a test winner is real: sample size, significance and an honest readout | `data-analysis` → `references/experiments-causal.md`, `references/statistics.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Launching Meta campaigns through the Marketing API and verifying Pixel and CAPI tracking | [meta-ads](https://github.com/boringmarketer/meta-ads-skill) (MIT; needs Business Manager and Marketing API access) |
| Generated UGC-style ads: talking-head, testimonial, unboxing, before-after and faceless voiceover videos | [ugc](https://github.com/fal-ai-community/skills/tree/main/skills/ugc) (MIT, stated in README; needs the genmedia CLI and FAL_KEY; nothing copied here) |
| A finished FLUX 3 product video ad with action-to-word sync and QC gates | [flux-3-product-ads](https://github.com/black-forest-labs/skills/tree/master/skills/flux-3-product-ads) (MIT; needs a BFL API key) |
| Competitor ads across Meta, Google, TikTok, LinkedIn and X libraries, with their landing pages | [apify-ads-intelligence](https://github.com/apify/awesome-skills/tree/main/skills/apify-ads-intelligence) (Apache-2.0; needs APIFY_TOKEN, paid runs) |
| A creative audit across platforms: format coverage, fatigue, accessibility and policy | [ads-creative](https://github.com/AgriciDaniel/claude-ads/tree/main/skills/ads-creative) (MIT; part of the claude-ads plugin) |
| TikTok Ads setup: Pixel, Events API and Spark Ads | [tiktok-ads](https://github.com/kostja94/marketing-skills/tree/main/skills/paid-ads/platforms/tiktok-ads) (MIT) |
| A whole UGC programme: review generation, contests, rights and reuse in paid ads | [ugc-strategy](https://github.com/arnabbagxd/brand-building-skills/tree/main/skills/ugc-strategy) (MIT) |

## Default workflow

1. **Brief.** Offer, destination URL, audience and awareness stage, platforms and placements, proof, constraints, current performance. Ask only for what's missing.
2. **Ground.** Collect reviews, comments, winning ads; optionally run a competitor teardown.
3. **Concepts.** 3-5 angles → concepts (segment × motivation × angle × format), ranked by evidence, sized to production capacity.
4. **Write.** Copy per platform within limits; hooks as visual / spoken / caption for video; message-match map.
5. **Produce.** Statics from templates, video from creator briefs or AI pipeline; native sizes per placement; safe zones checked.
6. **Validate.** Run `python3 scripts/ad-creative-alirezarezvani/ad_copy_validator.py ads.json`, strip AI tells, check claims and policy, simulate crops.
7. **Deliver.** Organised by angle with character counts and grounding sources; CSV for bulk upload; review page if someone else must choose. Launch paused and check placement previews.
8. **Learn.** Read the funnel per concept after enough data, log the iteration, refresh before fatigue, retro monthly.

## Done means

- [ ] Every line within its platform limit, count shown, validator flags fixed or explained
- [ ] 3+ distinct angles; no near-duplicates; openings varied
- [ ] Every claim traces to a source; no invented proof; `[NEED: ...]` flags listed
- [ ] Each unit matches a claim on the destination page
- [ ] Video hooks specify visual, spoken line and caption; text inside safe zones; captions on
- [ ] No AI-tell patterns, ALL CAPS, repeated punctuation or unproven superlatives
- [ ] Assets in native sizes for each placement; AI/paid-partnership disclosure where required
- [ ] A test plan names the one variable and the deciding metric
