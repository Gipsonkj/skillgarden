> Distilled from: ad-creative (coreyhaines31/marketingskills, MIT; its format library credits Dara Denney, Oren John, Daniel Hangan's reelclaw-templates and the Gooseworks team), ugc-strategy (arnabbagxd/brand-building-skills, MIT), tiktok-ads (kostja94/marketing-skills, MIT), facebook-ads (openclaudia/openclaudia-skills, MIT)

# TikTok, Reels, Shorts and UGC video ads

Specs and safe zones: [platform-specs.md](platform-specs.md). Fully generated (faceless) video: [ai-ad-production.md](ai-ad-production.md).

## The hook is three parts

The first 3 seconds decide whether the rest exists. A video hook is three things at once:

| Part | Job |
|---|---|
| Visual action (0-3 s) | Stop the thumb |
| Spoken line (first words) | Open a loop |
| Caption text | Carry the claim for sound-off viewers |

They must not repeat each other. If the voice says "I stopped paying $200 a month for my gym" and the caption says the same over a static face, two slots are wasted. Better: visual shows the cancellation email, voice says the line, caption names the alternative. Write all three columns for every hook. Statics have two parts (visual + headline); the headline must not just caption the picture.

## Generating hooks

Work top-down: **segment → motivation (verbatim) → format → hook**. Output a matrix so coverage is visible:

```
| # | Segment | Motivation (quote + source) | Format | Visual | Spoken | Caption |
```

Ten hooks across ten segment × motivation cells beat thirty rewordings of one.

| Opening move | Shape | Watch out |
|---|---|---|
| Curiosity gap | Hold back the noun: "The ingredient behind most 3pm crashes" | Must pay off inside the ad |
| Bold claim | Specific and falsifiable | Prove it on screen |
| Confession | "I was doing [common thing] wrong" | Needs lived-in detail |
| Before/after | Two states in the first beat | Honest visuals; regulated in health/beauty |
| Hyper-specific POV | "POV: it's 3pm and you're on your fourth coffee" | Generic POV is invisible |
| Their question | The exact question they'd type into search | Use their words |
| Countdown/challenge | Timer or challenge with payoff at the end | The payoff must exist |
| Proof first | Open on the result screenshot or demo money-shot | Best when proof brags by itself |

Mine organic posts in the niche for vocabulary ("GLP-1", the slang for the pain) and visual conventions. Take language and conventions, never a creator's actual piece.

## The on-ramp (seconds 3-15)

The next beat must continue the hook's premise. If the hook promises "what actually causes this", second 3 starts explaining the cause, not the brand story. Every new hook needs its on-ramp rewritten; pasting a new hook onto an old body breaks the bridge and gets blamed on the hook. Hold rate measures the on-ramp.

## Production spec (all vertical video)

- 1080×1920, 30 fps, MP4. Centre-crop mixed footage to fill.
- All text and key visuals inside the 720×1200 band (y=220-1420).
- Native caption look: white bold sans, ~8 px black outline, no background pill. Captions appear at full opacity on their first frame and change on cuts; animated captions read as brand-made.
- Auto-size captions: start ~58 px, shrink in ~2 px steps to fit, floor ~26 px. Never clip a glyph. Measure after the font loads.
- Mute clip audio by default and let one music track carry; keep creator voice where it is the point. Fade music over the last ~0.8 s.
- Organic posts: often upload without baked-in music and add a trending sound in-app (algorithm favours native audio). Paid ads: bake the music in.
- Programmatic renders must be deterministic: no clocks, random values or network fetches at render time.

## Creator and UGC formats

| Format | Tier | Shape | Use when |
|---|---|---|---|
| VSL | S | 60 s to several min: hook + problem → mechanism → proof → offer | The buyer must understand why it works (health, finance, complex products). The script is the ad. |
| Reaction + demo | A | ~3 s creator reaction with hook caption, hard cut to screen/product demo; 9-12 s total | Apps and tools. Caption reads as inner monologue, not a claim. |
| Green-screen reaction | A | Creator cut out over a post, page or recording; starts large, shrinks to a corner | Reacting to a trend, competitor post or your product |
| Yapper | A | One creator to camera, personal story, product arrives as the turn; 20-60 s | You can cast someone one step ahead of the viewer, with a real arc. Flat delivery kills it. |
| Amateur investigation | A | Creator investigates a question on camera; product is the finding | Skepticism is the barrier and you hold up to comparison |
| Underdog vs. incumbent | A | Name a real villain (bloated incumbent, bad industry norm), the fight, why you win | A genuine antagonist exists. Pairs with founder delivery. |
| Authority | A | Credentialed expert explains why | Trust-gated niches. Real expert, true claims, legal review. |
| Green-screen commentary | A | Creator teaches over full-frame images that change per beat | Apparel, educational angles |
| "No talking" split-screen tutorial | B | Full-screen intro → 50/50 split: action / result, step captions at the seam | How-tos where showing beats telling |
| Conversation | B | Two people, product enters naturally, ideally answering an objection | Only if it sounds unscripted |
| Duet/stitch | C | Respond to another creator's clip | You have written rights to their footage for paid use |
| ASMR | C | Close-up sensory action, no voice-over | Pet, beauty, food, tactile products; needs an ASMR creator |
| Street interview | C | Questions to passers-by | Usually better staged; claims must still be real |

Classic UGC shapes still work as converters: testimonial to camera, unboxing, before/after, day-in-the-life, problem/solution. Generic problem-solution voice-over over B-roll is fatigued.

UGC hook lines that work when the detail is real: "Okay, I've used [product] for 30 days and...", "I was skeptical, but...", "This changed how I [routine]".

## Founder and vlog-style ads

Founder content is often a brand's first winner. Four story shapes:
- **Hero's journey**: problem → backstory → attempt → failure → insight → breakthrough → cliffhanger.
- **Money math**: a cost breakdown or fixed-budget challenge. Surprisingly cheap beats expensive; don't use luxury as the hook.
- **Shiny object**: something visually novel you have access to (factory, machine, process).
- **Expert walk-through**: narrate the real world through your professional lens, on location.

Shooting: film each moment close / medium / wide (0.5x); 2-3 s clips; if the subject moves, hold still, otherwise slow push or slide; get 5+ shots of the presenter; mark the best hook shot. Edit: record the voice track first, then lay 0.5-1 s shots under it (a 45 s track ≈ 45 shots). CapCut or Instagram Edits is enough (CapCut hand-off and caption import: [production-tools.md](production-tools.md)).

## Chat-reveal ads (iMessage style)

A scripted text thread: a screenshot of a result lands → friend reactions → "what app is that?" → brand reply → promo code → static end card.
- 8-14 bubbles. Real texting voice: lowercase, one emoji max, no marketing adjectives. Brand appears once, only after someone asks.
- Pacing: one-word reactions 250-450 ms apart, sentence replies get 600-900 ms after them, ~600 ms of silence before the last reaction, ~300 ms crossfade to a ~3 s static end card with the real logo SVG.
- Real send/receive sounds; the typing indicator is silent. Build the hook screenshot as a faithful HTML mock of the real app, not an AI image (garbled UI reads fake).
- It is a dramatization: every fact in the thread must be true, no real customer names, never framed as a real conversation. Test first; recognisable UI formats can stop everyone and qualify no one (see F-tier notes in [meta-ads-creative.md](meta-ads-creative.md)).

## TikTok specifics

- Formats: In-Feed (main), Spark Ads (boost an organic or creator post; reads native), TopView (premium first impression), Collection (catalog).
- Audience skews 18-34 and is sound-on more than other feeds: use music and captions both.
- Creative is the main lever: plan a high refresh rate. Install Pixel + Events API (server-side) and use consistent UTMs.
- Symphony Creative Studio (TikTok's free AI video tools) and the TikTok for Business MCP for building ads from Claude: [production-tools.md](production-tools.md).

## UGC creator brief

```
Brand / product + key benefit:
Audience (who watches):
Format: 9:16, 15-60 s
Hooks: 3 options to film (each as visual / spoken / caption)
Key message (the one thing):
CTA:
Tone:
Do: (show the product in use within 3 s, natural setting, captions on)
Don't: (specific claims not approved, competitor names, medical promises)
Deliverables: N videos × M hooks; raw + edited
Usage rights: paid social, [platforms], [6-12] months, [territory]; whitelisting yes/no
```

Rough rates: micro creators $50-150 per video, mid-tier $150-500, experts $300-1,000. Test 3-5 hooks on the same body and 3-5 creators on the same brief.

## Rights and disclosure

- Organic customer posts: get explicit written permission for each use; paid use needs separate written permission. Keep records.
- Paid creators: rights in the contract (platforms, duration, territory). Running ads from the creator's handle (whitelisting/partnership) costs more and needs their grant.
- Paid creators disclose (#ad, paid partnership). Don't present incentivised reviews as independent; don't offer rewards for positive reviews only.
- Health and supplement claims in UGC must be substantiated. Label AI-generated people where Meta/TikTok require it.
