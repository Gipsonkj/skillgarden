> Distilled from: cro (coreyhaines31/marketingskills, MIT), scroll-craft (nateherkai/scroll-craft, MIT), auteur (agiwhitelist/auteur, MIT), web-artifacts-builder (anthropics/skills, Apache-2.0)

# Plan the page and write the words

Most AI-built pages fail on the brief and the copy, not the code. Decide what the page must make a visitor believe and do, write every word, then design.

## 1. The brief (one message, before anything else)

Ask only what you cannot default. Reuse anything the user already gave.

| Question | Why it matters |
|---|---|
| What is this, and who is it for? (1-2 sentences, their words) | Sets vocabulary and tone |
| What must the visitor believe by the end? | The one sentence the page exists to install. If they give three, make them pick one |
| What does the visitor do next? | One action, one label, used everywhere |
| Where does traffic come from? (ads, search, email, social) | Message match: the headline must echo the ad or link that brought them |
| What do you already have? (logo, palette, photos, footage, prices, reviews) | Real assets beat generated ones every time |
| Feel in 3-5 words, plus up to 3 references from any medium (film, shop, album) | Not "sites you like": naming sites produces copies of those sites |

If the user says "use your judgment", write the brief yourself, label it `Self-authored under creative delegation`, mark assumptions, and proceed. Never invent quotes, testimonials, statistics or prices. No real number means no stat counter.

## 2. The journey (4-7 beats)

Write the visitor's journey before sections. Each beat is a shift in what the visitor knows or feels:

```
1 Recognition   they see their own situation
2 Tension       the cost of it, named plainly
3 Turn          the thing that changes
4 Proof         why it holds up (evidence, demo, reviews)
5 Choice        plans, options, what they get
6 Commitment    the one action, repeated
```

Sections serve beats. A section that serves no beat is cut, however nice it looks. Typical landing order: hero, proof, how it works, offer or pricing, objections/FAQ, final call to action.

Name **one peak**: the moment a visitor would describe to a friend ("it's the site where ___"). It gets the most space and the best asset. One peak, not three.

## 3. Copy rules

- Write all copy before building. Placeholder text hides layout problems.
- **Headline**: the concrete outcome for the visitor, under ~10 words. "Fresh sadya boxes, delivered in Kochi" beats "Welcome to our website". Patterns: outcome ("Get X without Y"), specificity (numbers, time frames), real proof ("Used by 40 clinics in Bavaria").
- **Subhead** answers "for whom" or "how", and carries the proof the headline promised.
- **Buttons say what happens**: "Start free trial", "Get my report", "Book a table". Never "Submit", "Learn more", "Click here".
- One label per intent across the page. "Get started", "Start now" and "Begin" on one page is a defect.
- Adjectives must be checkable. Replace abstraction with mechanism: not "Seamless integration" but "Connects to Stripe with one webhook".
- Banned copy tells: Revolutionize, Seamless, Effortless, Unleash, Elevate, "innovative solutions", "unlock your potential", em-dash chains, decorative word strips ("BRAND. MOTION. SPATIAL.").
- If a sentence survives with an adjective deleted, delete it.
- Error text says what to do next. Microcopy is quiet, precise, present tense.
- Text never lives inside a generated image. Real markup is selectable, translatable and sharp.

## 4. Conversion checklist (score an existing page in this order)

1. **Value proposition** (highest impact): can a cold visitor say what this is and why it matters within 5 seconds? Benefit, not feature; customer's words, not jargon.
2. **Headline**: specific, matches the traffic source.
3. **Primary CTA**: one clear action, visible without scrolling, value-stating copy, repeated at decision points (after proof, after pricing, at the end).
4. **Hierarchy**: someone scanning headings alone gets the argument. Images support, not distract.
5. **Trust**: recognisable logos, attributed testimonials with photo and specifics, case numbers, review counts. Place them next to CTAs and right after claims.
6. **Objections**: price, "will it work for me", effort, risk. Answer with FAQ, guarantee, comparison, process transparency.
7. **Friction**: form field count, unclear next step, required fields that should not be, slow load, mobile breakage.

Page-type notes:
- **Landing page (paid traffic)**: single CTA, remove or minimise navigation, complete argument on one page.
- **Homepage**: serve both "ready to buy" and "still researching"; quick path to the most common action.
- **Pricing**: clear plan comparison, a recommended plan, answer "which plan is for me?".
- **Feature page**: feature, then benefit, then use case, then try/buy path.

## 5. Forms

- Every field must earn its place; each extra field costs conversions. Ask for email first, enrich later.
- Labels always visible (a placeholder is not a label). Inline errors next to the field, with recovery text.
- Correct input types and keyboards: `type="email"`, `type="tel"`, `inputmode="numeric"`, `autocomplete` set.
- Submit button shows progress and a clear success state.
- A form needs somewhere to send data (form service, backend, email or WhatsApp link). If none exists, say so instead of shipping a dead form.
- Multi-step only when the form is long: put the easiest question first, show progress.

## 6. Output when reviewing a page (CRO mode)

```
Quick wins (do now)          - copy and placement changes, < 1 hour each
High-impact changes          - structural, bigger effort
Test ideas                   - hypotheses worth an A/B test, not assumptions
Copy alternatives            - 2-3 headline and CTA options with the reason for each
```

Ask for current conversion rate, traffic source and what has been tried before recommending big changes. Do not claim a lift you have not measured.

## Pitfalls

- Asking the user ten questions in a row. One pass, then default the rest and state assumptions.
- A menu of industries or styles you made up: it biases them. Ask open questions.
- Invented social proof or stats. Never.
- Writing copy after the layout exists: the layout then dictates what gets said.
