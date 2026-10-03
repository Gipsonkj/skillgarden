> Distilled from: ad-creative (coreyhaines31/marketingskills, MIT), ads-create (AgriciDaniel/claude-ads, MIT), ad-creative (alirezarezvani/claude-skills, MIT), ad-creative-builder (aaron-he-zhu/aaron-marketing-skills, Apache-2.0), copywriting (coreyhaines31/marketingskills, MIT)

# Creative strategy, briefs and angles

Decide which ads are worth making before writing any. Most weak AI ads fail on inputs, not wording: copy written from training data sounds like every other ad in the feed.

## 1. Gather the brief

Ask only for what is missing. If a product-marketing or brand-context file exists in the project, read it first.

| Need | Questions |
|---|---|
| Offer | What exactly is sold (product, trial, demo, lead magnet)? Price, guarantee, deadline? |
| Destination | The landing page URL. Its headline, main claim, offer and CTA. |
| Audience | Who, in what moment of their day? What do they already believe? Main objection? |
| Awareness | Problem-aware, solution-aware or product-aware? Cold, warm or retargeting? |
| Platform | Which platforms and formats (search, feed, stories, video)? |
| Proof | Real numbers, reviews, case studies, certifications you can show. |
| Constraints | Brand voice, banned words, regulated category, mandatory disclaimers. |
| History | What is running now, what won, what lost, by which metric. |

No destination URL means you cannot check message match. Say so and ask.

## 2. Build the grounding corpus

For anything beyond a one-off, keep a folder the whole team reuses:

```
inputs/winning-ads/   10-20 top ads from the last 90 days (screenshots + metrics)
inputs/reviews/       50-100 reviews (Trustpilot, G2, Amazon, App Store) as text
inputs/comments/      comments under existing ads: objections, praise, questions
brand/                voice notes, hex codes, logo, product photos
```

- Reviews give the buyer's exact words for pain, outcome and surprise benefits. Quote them; don't paraphrase into marketing voice.
- Ad comments are the most skipped and most useful input. Objections become FAQ ads; unprompted praise reveals angles you didn't write.
- Refresh winning ads as new ones scale; refresh reviews and comments monthly.
- For batch production, if `winning-ads/` or `reviews/` is empty, stop and ask for them. Don't generate ungrounded concepts as a fallback.

## 3. Separate facts from hypotheses

Sort every claim before writing:

| Type | Example | Can ship? |
|---|---|---|
| Verified fact | "SOC 2 Type II", "38 L capacity" (spec sheet) | Yes |
| Operator-approved claim | "Set up in 10 minutes" (client signed off) | Yes, note the source |
| Customer language | "I finally sleep through the night" (review #12) | Yes, verbatim |
| Creative hypothesis | "Busy parents will respond to the 3am angle" | Test it; it is not a claim |
| Unsupported | "#1 rated", "doctor recommended", "results in 7 days" | No. Mark `[NEED: source]` |

Never invent testimonials, statistics, prices, scarcity, certifications, outcomes or credentials.

## 4. Define angles (3-5 per brief)

An angle is a reason someone would click. Two angles that produce near-identical copy count as one: vary the lead, not the wording.

| Angle | Leads with | Starter |
|---|---|---|
| Pain | the problem they want gone | "Still exporting CSVs every Monday?" |
| Outcome | the result | "Close your books in 3 days" |
| Proof | numbers, names, reviews | "3,400 clinics book with [X]" |
| Mechanism | how it works differently | "Reads your bank feed, files the receipts" |
| Comparison | vs. the old way or a rival | "Spreadsheets: 6 hours. Us: 6 minutes." |
| Objection | the reason they hesitate | "Works with your existing POS" |
| Identity | who it's built for | "Built for solo bookkeepers" |
| Urgency | a real deadline or limit | "Q1 pricing ends 31 March" (only if true) |
| Contrarian | a belief that's wrong, then the fact | "Most teams read 3 of their 40 dashboards." |

## 5. Write concepts, not ad ideas

A concept is one testable hypothesis: **segment × motivation × angle × format**, with evidence attached.

- Weak: "UGC for moms".
- Strong: "new parents up at 3am (40+ reviews mention night feeds) × 'quiet enough not to wake the baby' × before/after demo × POV night-shot video".

Rank concepts by their strongest evidence:

| Tier | Evidence | Treatment |
|---|---|---|
| 1 | Your own converting ad with this angle | Iterate and extend first |
| 2 | Repeated customer language (reviews, calls) | Build new creative on it |
| 3 | Competitor ad running 60+ days | Adapt the angle, never copy the ad |
| 4 | Organic engagement on the theme | Validate cheaply |
| 5 | Worked in an adjacent category | Park until corroborated |
| 6 | Team hunch | Cheapest test or drop |

Evidence sets priority. Production cost is a separate call (see fidelity ladder in [testing-iteration.md](testing-iteration.md)).

## 6. Match the funnel stage

| Stage | Lead with | Frameworks |
|---|---|---|
| Cold / awareness | the problem in their words; don't pitch | PAS, contrarian, specific stat |
| Consideration | outcome + mechanism + first proof | AIDA, FAB, BAB, how-it-works |
| Decision / retargeting | proof, then risk removal, then real urgency | social proof, BAB, guarantee |
| Retention / upsell | value they already got, next step | BAB, milestone |

Showing heavy proof to a cold audience or a vague problem hook to retargeting is a stage mismatch. Flag it.

## 7. Message match

Every ad unit must echo a claim the destination page makes. Build the map:

```
| Unit                        | Angle   | Page claim it echoes         | Match |
| "Cut onboarding to 2 days"  | Outcome | Hero: "Onboard in 2 days"    | yes   |
| "Rated #1 by G2"            | Proof   | (not on page)                | NO    |
```

`NO` means cut the unit or flag the page gap. Mismatch lowers Google Quality Score and raises post-click drop-off.

## 8. The brief per concept

One brief per concept, handed to production:

```
Concept: [name]
Segment: [specific slice]          Motivation: [verbatim quote + source]
Angle: [one]                       Format: [e.g. founder static, yapper video, RSA]
Promise: [one sentence]            Proof: [the receipt]
Hooks: [3 options, each with visual / spoken / caption for video]
Objection handled: [one]           CTA: [verb + what they get]
Destination: [URL + claim echoed]  Platforms/placements: [list + sizes]
Production tier: T1 / T2 / T3      Success metric: [the one that decides]
Hypothesis: "If [segment] sees [angle], [metric] beats control because [reason]."
```

## 9. Account state decides the mix

- **Exploration** (nothing working): go wide. Mostly new concepts across segments and angles; iterate only on single-metric hits. Check for the usual root causes: boring creative, overcomplicated message, unclear offer, too-narrow audience.
- **Scaling** (something converts profitably): go deep on the winner with visually distinct executions of the same message, plus a few sub-angle probes. Keep a small exploration share alive; the next winner is rarely a variant of the current one.

## 10. Capacity check

Count how many concepts the team or pipeline can produce at quality this month, and plan to that number. Cut by evidence rank. Twenty planned concepts against capacity for eight gives twenty weak ads.

## 11. Present concepts for approval

When a client or stakeholder must pick, build a review page from `templates/ad-creative-coreyhaines/creative-review-template.html`: one self-contained HTML file (no build, no network) that shows each concept as an Instagram/Facebook feed mockup, with carousel frames as a storyboard, headline toggles and an optional whitelist-handle toggle.

1. Copy it into the batch folder as `review.html`.
2. Replace the JSON in `<script type="application/json" id="review-data">` (it ships with a sample brand). Shape: `project` {brand, agency?, date?, note?}, `platforms` ["instagram","facebook"], `concepts` [{name, tagline, handles?, frames [{label, prompt, image?, headline?, headlineTheme?}], headlines [], primaryText, destination {url, cta, offer}, rollout?, grounding}].
3. Valid JSON only; escape `<` as `<` in every string. Keep image paths relative. Frames without an image show their label and prompt as a placeholder.
4. Label frames by job ("Hook", "The proof"), not content. Show 2-4 concepts; more is a menu, not a decision.
5. `grounding` is required and must say what is real and what is illustrative.
6. Open it in a browser and click every tab and toggle before sending. Edit data, not the render code.

## Pitfalls

- Thirty rewordings of one cell instead of ten distinct segment × motivation cells.
- Hunches shot as expensive productions while tier-2 customer language sits unused.
- Copying a competitor's ad instead of the angle behind it.
- Insights without a receipt. If you can't name the review, ad or post, it doesn't enter the plan.
