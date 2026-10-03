> Distilled from: ad-creative (coreyhaines31/marketingskills, MIT; its Meta format tier list credits Dara Denney's public ranking), meta-ads (boringmarketer/meta-ads-skill, MIT), facebook-ads (openclaudia/openclaudia-skills, MIT), ad-creative (alirezarezvani/claude-skills, MIT)

# Meta (Facebook, Instagram) ad creative

Copy limits and image sizes: [platform-specs.md](platform-specs.md). Video and creator formats: [short-form-video-ugc.md](short-form-video-ugc.md).

## Pick the format by its job

Ask of every format: does it open **cold, new audiences** (a scaler), or does it **convert people already warm** (supporting cast)? Supporting cast is not bad; it just won't open new reach however much you spend. Build a portfolio: a few scalers, a bench of converters.

Meta's delivery now matches ads to personas rather than just interests, so creator-fronted formats reach a persona through someone it already follows. That is why they sit at the top.

| Tier | Formats | Role |
|---|---|---|
| S | Founder content; partnership (creator) ads; VSL for products that need explaining | Cold scalers. Start here. |
| A | Grid static (multi-SKU/bundle); creator "yapper" story; amateur investigation; underdog vs. incumbent; expert/authority; green-screen commentary; catalog/DPA used for prospecting | Scale with the right inputs |
| B | Callout; us vs. them; before/after; FAQ/objection; problem/solution; founder letter (strong in sales); tweet/Reddit screenshot (good first frame); educational infographic; lifestyle hero; mood board (apparel); scrappy post-it/handwritten (sales periods) | Mid-funnel converters |
| C | Stat callout (awareness, luxury); AI animation; celebrity; AI avatar (needs disclosure); street interview (often staged); duet/stitch (needs rights); ASMR; generic problem-solution UGC (fatigued) | Situational |
| D-F | Breaking-news style; AI billboard; listicle; review-card and testimonial-stack statics (unless one golden quote); carousel for its own sake; press-logo ads (rights risk); podcast clips (unless a well-known show); notes-app or fake-UI ads (stop everyone, qualify no one) | Skip by default |

Tiers are a snapshot. Re-check against the account's own data. When rolling month-over-month reach falls, the audience is saturated: add creator-fronted formats.

Tactic: when you hire creators for partnership ads, also have each shoot 2-3 low-fi Story-style statics. A mini-funnel per creator for almost no extra cost.

## Static templates

Each template is a layout with copy slots. Fill slots from real reviews, ads and comments, and record the source.

| Template | Layout | Copy slot | Source it from |
|---|---|---|---|
| Founder message (S) | Note-style, founder name/photo, no glamour shot | "I built this because..." one honest paragraph | The real founding story |
| Origin story (S) | Portrait, 2-3 short paragraphs, product secondary | The specific moment that started it | Real story only |
| Grid static (A) | 4-9 product tiles, same light and crop, small logo, optional bundle price | Collection name or "build your bundle" | SKUs reviews cluster around |
| Headline statement (B) | One line at 60%+ of visual weight, product shot, small logo | One stop-the-scroll claim | Best winning hook |
| Us vs. them (B) | Two columns, old way greyed, 4-6 rows with ticks/crosses | Real differentiators only | Reviews that mention switching |
| Callout (B) | Product centre, leader lines to 3-5 labels of 2-5 words | Attributes buyers ask about | Review and comment themes |
| Before/after (B) | Two panels + arrow | States in customer words | "I used to X, now Y" reviews |
| Problem/solution (B) | Tension above, relief below | Pain verbatim, then one-line answer | Most common pain phrase |
| FAQ card (B) | Question large, short answer, product | Objection as customers phrase it | Ad comments |
| Competitor callout (B) | Their name vs. yours on one axis | A provable difference | Competitor mentions in reviews |
| Educational infographic (B) | Diagram, cycle or cross-section | One checkable teaching point | "How does it work?" comments |
| Tweet/Reddit screenshot (B) | Pixel-accurate native card | A real post, verbatim, with permission | Real mentions |
| Post-it / handwritten (B) | One scrappy element on product | Blunt offer line | The offer |
| Stat callout (C) | One number at 60% of the frame | A defensible number | Analytics, studies |

For a cold-reach batch, weight toward S/A. For retargeting, lean on callout, FAQ, before/after, competitor callout. Cycle through templates instead of clustering on two favourites.

Per concept, deliver:

```
## Concept 7: FAQ card (B, mid-funnel)
Headline: But does it work on sensitive skin?
Body: We tested it on 200 people with eczema. 3 reacted.
Visual: cream background, question in black serif at top third, tube bottom right, answer below.
Image prompt: [prompt + 1080x1350]
Grounded in: comment thread on ad #22 (14 people asked this); clinical summary p.2
```

For 20+ concepts, add an `INDEX.md`: concept, template, tier, grounding source. Picking 5 winners from 50 grounded concepts beats picking 5 from 10.

## Make it look native

- Per-line rounded caption boxes read as Instagram/TikTok; one flat band reads as a slide.
- Bold or bold-italic system sans reads native; a polished brand typeface reads as an ad.
- Real photos of the actual product, team or work beat stock.
- No fake Meta UI (progress bars, reply boxes, swipe-up arrows, drawn cursors). Meta rejects creative that mimics its own interface.
- Auto-fit text to its box and check for clipped lines; italics overhang, so pad wider.

## Crop-safe design

A 9:16 asset is cropped in feed: 4:5 loses ~285 px top and bottom, 1:1 loses ~420 px. Keep identifier, message and CTA as one block inside y=420-1500 on a 1080×1920 canvas. Simulate both crops, then check the Ads Manager per-placement preview before enabling.

## Turn off Advantage+ creative enhancements when composition matters

By default Meta may auto-crop, add text overlays, adjust brightness and generate variants. If your layout is load-bearing, opt out in Ads Manager (ad → creative). The old API field `standard_enhancements` is deprecated; confirm by reading the creative's `degrees_of_freedom_spec` and checking `advantage_plus_creative: OPT_OUT`.

## Special Ad Categories (employment, housing, credit, social issues)

- Declaring one removes age and gender targeting, detailed interest targeting, and forces a 15-mile minimum radius. The category can't be changed after creation.
- So the creative is the targeting: put the audience in the image as literal words ("TAMPA HVAC TECHNICIANS"), inside the crop-safe band.
- Employment and credit ads can't make earnings claims. Check every editable copy field, for example with a pattern like `\$\s?\d|\b\d+\s?(k|dollars|usd)\b|\bper hour\b|/hr\b`.

## Copy fields

`message` (primary text, ~125 visible) → image/video → `name` (headline, bold) → `description` (often truncated) → CTA button (Shop Now, Learn More, Sign Up, Get Offer, Book Now). Front-load the message.

## Carousel (2-10 cards)

Shared primary text, 40-char headline per card. Use a narrative arc: hook → problem → mechanism → proof → offer. Label each card by its job. Carousels cost more assets for an uncertain payoff, so use them when the story needs steps.

## Video structure for feed (15-60 s)

| Time | Beat |
|---|---|
| 0-3 s | Hook: visual action + spoken line + caption (see short-form reference) |
| 3-10 s | The problem, continuing the hook's premise |
| 10-25 s | Product doing the thing |
| 25-40 s | Proof or differentiator |
| 40-50 s | Offer and CTA |
| last 2-3 s | Logo + CTA card |

Design for sound off with captions. 1:1, 4:5 or 9:16 beat 16:9. Stories/Reels ads: keep under 15 s.

## Testing on Meta

- Put several creatives in **one** ad set so they share learning; separate ad sets split budget and data.
- Tag each variant in `utm_content` to attribute in your own analytics.
- An ad set needs about 50 conversions a week to exit learning. If the real conversion is rarer, optimise for a higher-volume upstream event and report on the real one.
- Create ads PAUSED, check every placement preview, then enable. Never let an agent launch ACTIVE ads on unreviewed creative.

Full test design and fatigue: [testing-iteration.md](testing-iteration.md).
