# Conversion copy: pages, headlines, CTAs, microcopy

> Distilled from: copywriting (coreyhaines31/marketingskills, MIT), ai-copywriter (mikiarlo3/ai-copywriter, MIT), content-creation (anthropics/knowledge-work-plugins, Apache-2.0).

Use for homepage, landing, pricing, feature, about and product pages; hero sections, headlines, taglines, value propositions, CTAs; product descriptions, meta descriptions, app-store blurbs; buttons, errors, empty states, subject lines.

## 1. Intake before a word of copy

Check for a product context file first (`.agents/product-marketing.md`, `.claude/product-marketing.md`, `TONE.md`, a VOICE PROFILE). Ask only for what is missing, in one batch:

| Need | Good answer looks like |
|---|---|
| The one action | "Start a 14-day trial", not "engagement" |
| Who exactly (ICP) | "Seed-stage founder doing their own cold outreach", not "founders" |
| Their words for the problem | Quotes from reviews, calls, tickets |
| Category (the shelf they file you on) | "a scheduling link tool"; if "new category", ask what they will mistake it for |
| Differentiator vs named alternatives | One concrete thing competitors cannot say |
| Proof | Numbers, named customers, testimonials, guarantees |
| Traffic source and awareness | Ad, search, email; what they know on arrival |
| The story | What happened, what it cost, what changed, real numbers |

Then answer two questions for yourself before drafting:
1. **What does the reader feel at the moment this line reaches them?** Mid-scroll and bored, comparing three tabs, mid-task with a broken payment. The feeling sets length, tone and what goes first.
2. **What is the simplest way to say what this does?** Kitchen-table words. If you cannot, keep asking the user what it actually does.

If the material is generic, ask more. Generic input makes generic copy and no craft fixes it. If no one can answer (embedded use), write from what exists and list what was missing.

## 2. Principles

- **Clear beats clever.** A line the reader has to decode has already lost.
- **Benefit over feature.** Add "which means..." after each feature until it reaches the reader's life.
- **Specific over vague.** "Cut weekly reporting from 4 hours to 15 minutes" beats "save time".
- **Customer words over company words.** Mirror voice-of-customer phrasing.
- **One idea per section, one primary CTA per page.**
- **Swap test.** If the line works unchanged on a competitor's site, rewrite it. If you lack the differentiator, write the best line and mark `[NEED: differentiator vs <competitor>]`.
- **Never invent proof.** No made-up stats, testimonials, logos or customer counts. Mark `[NEED: proof]`.
- **"Now you can..." test.** Prefix a headline or benefit with it. Keep lines that come out compelling and true. "Now you can have a powerful analytics platform" fails; "Now you can see which companies visit your site" passes.

## 3. Page spine

Hero follows the three beats a person needs before acting: **current discomfort** (in their words) → **better state** → **this step closes the gap** (CTA plus proof). Miss one and the reader stalls.

| Section | Job | Rules |
|---|---|---|
| Hero | State the outcome | Headline under ~10 words; subhead 1-2 sentences adding "for whom/how"; one primary CTA; real product visual |
| Proof bar | Credibility early | Recognizable logos over many; real counts; star rating with review count |
| Problem | Recognition | Their situation better than they can say it; cost of not solving |
| Benefits | 3-5, not 10 | Each: outcome headline, 1-2 sentence how, proof if available |
| How it works | Lower perceived effort | 3-4 numbered steps, verb first, with time ("Connect your tools, 2 minutes") |
| Objections | Remove doubt | FAQ 5-10 real questions, comparison vs status quo/competitors, guarantee |
| Final CTA | Close | Recap value, repeat the same CTA, risk reversal |

Page variants: **ad landing page** = single message, headline matches the ad, compact (hero, proof, 3 benefits, testimonial, 3 steps, CTA). **Homepage** = broadest value prop with paths per visitor intent. **Pricing** = make the recommended plan obvious and answer "which one is me?". **Feature** = feature → benefit → outcome plus use cases. **Enterprise** = add security/compliance, integrations, ROI, demo CTA. **Launch** = announcement hero, demo, 3-5 highlights, before/after, early-access offer.

Perception gap: the same claim reads differently by risk tolerance. "Ship in a weekend" excites a startup and scares an enterprise buyer; "SOC 2, 99.99% SLA" does the reverse. Segment pages; do not average both into mush.

## 4. Headlines

Formulas are starting shapes; fill every slot with specifics.

| Angle | Formula | Example |
|---|---|---|
| Outcome | {Outcome} without {pain} | "Build your website without writing code" |
| Mechanism | {Outcome} by {how} | "Generate more leads by seeing which companies visit your site" |
| Time | {Outcome} in {timeframe} | "Get your tax refund in 10 days" |
| Problem | {Pain question}? | "Hate returning stuff to Amazon?" |
| Audience | {Category} for {audience} | "Advanced analytics for Shopify stores" |
| Differentiator | The {category} that {difference} | "The CRM that updates itself" |
| Proof | {N} {people} use {product} to {outcome} | "50,000 marketers use Drip to send better emails" |

For editorial titles (blogs, posts): lead with the sharpest concrete detail ("We cut our AWS bill by $40,000 in one afternoon"); open a curiosity gap only if the piece closes it; withhold the answer, never the subject; odd verifiable numbers beat round inflated ones. Banned: ultimate, game-changer, unlock, elevate, revolutionize, secrets, "you won't believe".

Deliver 5-10 variants across angles (number, question, contradiction, outcome, named enemy, how-to), then one line naming your pick and why in terms of the reader's feeling.

## 5. CTAs

- Formula: **verb + what they get + qualifier**: "Start my free trial", "Get the complete checklist", "See pricing for my team".
- Weak: Submit, Sign up, Learn more, Click here, Get started.
- Risk reducers next to it: "No card required", "Cancel anytime", "Free for 14 days" (one absence, stated once).
- Urgency only when true.
- Placement: above the fold on landing pages; after value in emails; end of blog posts; repeated at the bottom of long pages.

## 6. Short descriptions

App-store subtitles ~30 chars, meta descriptions ~150-160 chars, product one-liner = one breath aloud. First five words carry the benefit (the product name is already on screen). One idea per description; cut ideas, not grammar, to fit.

## 7. Microcopy

| Element | Rule | Example |
|---|---|---|
| Button | Name the result | "Send invoice", not "Submit" |
| Error | What happened + how to fix, no blame | "That card was declined. Try another card or check the number." |
| Empty state | Sell the first action | "Add your first client to start invoicing" |
| Destructive confirm | State the consequence | "Delete 3 files? You can't undo this." |
| Labels/buttons | Sentence case, no period | |

## 8. Subject lines and hooks

30-50 characters; the mobile preview shows ~35-40, so front-load the concrete word. Write to one person. Lowercase-casual and plain-direct both work. No fake urgency ("LAST CHANCE!!"), no fake familiarity ("quick question"). Preview text extends the subject, never repeats it.

## 9. Copy-specific AI tells (hard rules)

Never write: contrast reveals, negation lists, trailing pile-ons, self-answered questions, colon reveals, "In today's fast-paced world", "Whether you're X or Y", "Say goodbye to", "X, reimagined", "Unlock the power of", "Take it to the next level", "Join thousands of happy customers", exclamation points in body copy, em dashes in short copy. Cap at one fragment and one list of three per section. Full catalog: [humanize-ai-writing.md](humanize-ai-writing.md).

## 10. Delivery format

```
HERO
Headline: ...          (Alt A: ... reason) (Alt B: ... reason)
Subhead: ...
CTA: ...               (Alt: ...)
SECTION: Proof / Problem / Benefits / How it works / FAQ / Final CTA
...
Notes: why the key choices fit the reader's feeling (1 line each)
Gaps: [NEED: ...] list
Meta: title (<60 chars), description (150-160 chars)
```

## 11. Self-check before handing over

1. Search headlines and short copy for "not", "isn't", "no ", "without", "?", ":", "—" and check each hit.
2. Read every sentence over 20 words; more than two commas usually hides a pile-on.
3. Count fragments, threes and tier-2 buzzwords per section.
4. Run the swap test on the headline, subhead and every section heading.
5. Read it aloud. Anything that sounds like a press release gets rewritten from the facts.
Then run [copy-editing.md](copy-editing.md) on high-stakes pages.
