# Sequences and lifecycle flows

> Distilled from: emails and its sequence-templates, email-types and copy-guidelines references (coreyhaines31/marketingskills, MIT), email-sequence (anthropics/knowledge-work-plugins, Apache-2.0), ecommerce-email-marketing-builder (nexscope-ai/eCommerce-Skills, MIT), email-marketing-bible (CosmoBlk/email-marketing-bible, MIT), klaviyo-analyst REFERENCE (thatrebeccarae/claude-marketing, MIT), loops-email-sending-best-practices program-strategy reference (loops-so/skills, MIT).

Use for "welcome sequence", "onboarding emails", "nurture sequence", "drip campaign", "abandoned cart flow", "browse abandonment", "post-purchase", "win-back", "re-engagement", "sunset flow", "dunning", "trial ending emails", "what emails should my app send".

## 1. Before drafting

Get these, then design the whole flow before writing any email:

1. **Trigger**: the event or state that enters someone (subscribed to list X, `Started Checkout`, trial day 10, no click in 90 days). Prefer real product or purchase events over arbitrary dates.
2. **Goal and exit**: the one action that means the flow worked (first order, activated feature, payment updated). Converting exits the flow at once.
3. **Audience and what they already get**: other active flows, the newsletter, transactional mail. Avoid stacking.
4. **Offer and proof** available, and the brand voice (or ask for samples; voice work goes to `content-creation`).
5. **ESP** so the setup notes use its terms (flow, journey, loop, automation; trigger, filter, split).

## 2. Flow rules

1. **One email, one job, one primary CTA.** Secondary links only for help or preferences.
2. **Value before ask.** The first emails deliver what was promised and a quick win; the offer comes later.
3. **Exit on conversion.** Check "has done goal?" before every send, not only at the start.
4. **Suppress overlaps.** Do not send if the person is in a higher-priority flow, unsubscribed from marketing, or opened a support ticket in the last 48 hours.
5. **Re-entry rules are explicit.** For example: cart flow at most once per 7 days; win-back once per 90 days.
6. **Timing follows intent.** Fast for hot intent (cart: hours), slower for nurture (days), local time zone, B2B avoids weekends.
7. **Flows that mention a cart, browse history or offers are marketing email,** so they need marketing consent and an unsubscribe link even though they are triggered.
8. **Each email stands alone.** People skip emails; never depend on "as I said yesterday".
9. **Fallbacks for every merge field** (`{{ first_name | default: "there" }}`), or the email can fail to send or read "Hi ,".

## 3. Length and spacing at a glance

| Flow | Emails | Spread | Notes |
|---|---|---|---|
| Welcome (newsletter, ecommerce) | 3-6 | 7-14 days | Email 1 immediately |
| Onboarding (SaaS) | 5-7 | 14-21 days | Behaviour-based; supports in-app onboarding, does not duplicate it |
| Lead nurture | 4-8 | 2-4 weeks | Educational first, direct offer last |
| Abandoned cart | 2-3 | 1-3 days | First at 1-4 hours |
| Browse abandonment | 1-2 | 1-2 days | First at 2-4 hours |
| Post-purchase | 3-4 | 14-21 days | Split first-time vs repeat |
| Win-back (lapsed customers) | 3-4 | about 30 days | Trigger at 60-90 days since last order (fit your purchase cycle) |
| Re-engagement / sunset | 2-4 | 10-21 days | Ends in suppression |
| Failed payment (dunning) | 3-4 | 7-14 days | Transactional in tone |
| Product launch | 4-6 | 2-3 weeks | Teaser to last chance |
| Event or webinar follow-up | 3-4 | 7-10 days | Replay within 24 hours |
| Educational drip | 5-8 | 4-6 weeks | One lesson per email |

## 4. Recipes

### Welcome (subscriber)
1. **Immediately:** welcome, deliver the promised magnet or code, set expectations (what, how often), ask one segmenting question or for a reply.
2. **Day 1-2:** quick win or best content, chosen by their answer.
3. **Day 3-4:** story or why you exist.
4. **Day 5-7:** social proof (reviews, one customer result with real numbers).
5. **Day 7-10:** objection handler (shipping, price, "no time").
6. **Day 10-14:** offer or next step; for ecommerce, "your code expires" only if non-buyers remain (split on "placed order?").

Exit to post-purchase on first order. Welcome flows usually get the highest engagement of anything you send.

### SaaS onboarding (product users)
1. **Immediately:** welcome plus the single first action, deep-linked.
2. **Day 1:** only if step 1 is not done: help, short video, reply-to-a-human.
3. **Day 2-3:** the feature that drives the "aha" moment.
4. **Day 4-5:** customer story from a similar user.
5. **Day 7:** check-in, ask what is blocking them.
6. **Day 10-12:** advanced tip for active users.
7. **Day 14+:** upgrade (trial), expand (paid), or next milestone (free).

Add **step reminders** on missed setup steps (integration not connected after 48 hours, no teammate invited after 3 days), and an **invite flow** for invited teammates: invite, reminder day 2, final day 5, using the inviter's name.

### Lead nurture (pre-sale)
Deliver magnet → expand the topic (day 2-3) → problem deep-dive (day 4-5) → your method (day 6-8) → case study (day 9-11) → why you are different (day 12-14) → objection or FAQ (day 15-18) → direct offer (day 19-21).

### Abandoned cart (ecommerce)
Trigger: started checkout, no order. Exclude anyone who ordered in the last 4 hours.
1. **1-4 hours:** plain reminder with cart items, images and prices, link back to cart. No discount.
2. **24 hours:** objections: reviews, shipping and returns, guarantee, FAQ.
3. **48-72 hours:** small incentive only if margin allows and only for first-time buyers; otherwise honest scarcity or a reason to buy now.

Recovery rates around 5-15% are typical; revenue per recipient is the KPI. Turn smart sending (the ESP's "skip if emailed recently") **off** for cart and transactional flows.

### Browse abandonment
Trigger: viewed product, no add-to-cart. Exclude anyone who started checkout in the last hour or ordered in 24 hours. Email 1 at 2-4 hours shows the product and one review ("Still deciding?", never "we saw you looking"); email 2 at 24 hours shows 3-4 related products. No discount here: it trains people to browse and leave.

### Post-purchase
1. **Immediately:** order confirmation (transactional, see [transactional-email.md](transactional-email.md)) with what happens next.
2. **Delivery + 2 days:** first-time buyers get how to use or care for it; repeat buyers get a thank-you or loyalty perk.
3. **Delivery + 5-7 days:** review request with a one-click rating; one reminder after 5 days if no review. Never after a support problem.
4. **14-21 days:** cross-sell based on what they bought ("pairs well with").
5. **Replenishment** (consumables): about 5 days before expected run-out (30-day supply → day 25), then one reminder 3 days later; offer a subscription.

### VIP
Trigger: enters VIP segment (top 10% spend or 3+ orders). Welcome to VIP with concrete perks (early access, free shipping), then event-based sends: early access, birthday, milestones. Avoid discount-led VIP perks.

### Win-back (lapsed customers)
Trigger: last order 60-90 days ago and no click in 30 days; exclude anyone who ordered in the last 60 days.
1. "We miss you" plus what is new, no discount.
2. Day 7: new products or improvements, especially fixes for their likely reason for leaving.
3. Day 14: time-limited returning-customer offer.
4. Day 28: "should we keep emailing you?" with a one-click stay button. No click → move to sunset.

SaaS variants: **expired trial** (day 1 what you're missing, day 7 what held you back, day 14 extended trial or offer, day 30 door open; vary by trial engagement) and **cancelled customers** (day 30, 60, 90: what is new, the fix for their stated reason, an offer).

### Re-engagement and sunset (list hygiene)
Trigger: no click, reply or order in 90-120 days (180 at most).
1. "Are you still there?" with one button: "Yes, keep me subscribed".
2. Day 7: something genuinely useful or new.
3. Day 14: "This is our last email unless you tell us to keep going."
4. No click → **suppress** from marketing (do not delete: keep the record so they are never re-imported). The breakup email often gets the most replies of the flow.

### Billing and account flows (SaaS)
- **Failed payment:** day 0 friendly notice plus update link; day 3 service may pause; day 7 account will be suspended on date X; day 10-14 final notice. Assume an accident, one CTA, no guilt.
- **Trial ending:** value summary, what they lose, plan comparison, last day with an easy path. Trigger on behaviour too (hit a limit, used a paid feature).
- **Renewal reminder:** 14-30 days before annual renewal (3-7 days for monthly): date, amount, how to change plan.
- **Pricing change:** announce 30-60 days ahead, remind at 14 and 7 days, explain why, offer lock-in or downgrade.
- **Upgrade prompts:** at 80% of a seat limit or 90% of usage, or after trying a higher-tier feature.

### Product launch and events
Launch: teaser → launch-day announcement → feature or use case → early results and proof → bonus or deadline → last chance. Event: thank you plus recording within 24 hours → resource roundup → related next step → feedback survey.

## 5. Exclusions every ESP flow needs

| Flow | Exclude | Why |
|---|---|---|
| Welcome | Has ever placed an order (route to a buyer welcome) | Different message |
| Abandoned cart | Placed order in last 4 hours | Already bought |
| Browse | Started checkout in last hour, ordered in last 24 hours | Higher-intent flow wins |
| Win-back | Ordered in last 60 days | Still active |
| Sunset | Ordered in last 90 days | Buyers are treated differently |
| All marketing flows | Unsubscribed, bounced, complained, suppressed | Legal and deliverability |

## 6. Branching and diagrams

Use conditional splits sparingly: one or two per flow. Common ones: "placed order?", "completed setup?", "clicked email N?", quiz result, first-time vs repeat. Describe every flow as a text diagram the user can rebuild in any ESP:

```
[Started checkout] → wait 1h → Email 1 (reminder)
   → wait 24h → [Placed order?] yes → EXIT
                               no  → Email 2 (objections)
   → wait 24h → [Placed order?] yes → EXIT
                               no  → [First-time buyer?] yes → Email 3 (incentive)
                                                         no  → Email 3b (no discount)
   → EXIT: sequence complete
```

## 7. Copy inside flows

- Structure: hook (why you are writing) → why it matters to them → the useful part → one CTA → a human sign-off.
- Length: 50-125 words for transactional-style nudges, 150-300 for educational, 300-500 for story emails.
- Buttons for the main action ("Finish setting up", "Return to your cart"), text links for secondary ones.
- Subject 40-60 characters at most, specific beats clever; preview text extends the subject (see [campaigns-subject-lines-testing.md](campaigns-subject-lines-testing.md)).
- Avoid AI tells: "I hope this email finds you well", "Just checking in", contrast reveals ("it's not X, it's Y"), negation lists, self-answered questions, fake "Re:" subjects, em dashes in subjects. For voice and a full de-AI pass, use `content-creation` (`references/brand-voice.md`, `references/humanize-ai-writing.md`).
- Never invent proof. Missing numbers, reviews or customer names become `[NEED: ...]`.

## 8. Benchmarks to set targets (directional)

| Metric | Onboarding | Lead nurture | Re-engagement | Win-back |
|---|---|---|---|---|
| Click rate | 10-20% | 3-7% | 2-5% | 2-4% |
| Conversion | 15-30% | 2-5% | 3-8% | 1-3% |
| Unsubscribe | <0.5% | <0.5% | 1-2% | 1-3% |

Open rates are reported by tools but inflated by privacy features; set goals on clicks and conversions ([esp-platforms-and-analytics.md](esp-platforms-and-analytics.md)).

## 9. Deliverable format

```
Flow: [name] | Trigger: [...] | Goal / exit: [...] | Re-entry: [...]
Exclusions and suppressions: [...]
Diagram: [text diagram]

| # | Send | Subject (2-3 options) | Preview | Purpose | CTA → link | Condition |

Email N
Subject options / Preview text
Body (full copy)
CTA: [button text] → [destination]
Who gets it / who skips it

ESP setup notes (trigger, filters, delays, splits, smart sending on/off)
Tests to run first (1-3, see campaigns-subject-lines-testing.md)
Metrics and review rhythm
```

## Checklist

- [ ] Trigger is an event or state; goal defined; converters exit before every send
- [ ] Exclusions and overlap suppression set; re-entry rule stated
- [ ] Marketing-type flows (cart, browse, win-back) go only to consented contacts with an unsubscribe
- [ ] One job and one CTA per email; every email stands alone
- [ ] Merge fields have fallbacks; no invented proof
- [ ] Sunset path ends in suppression, not deletion
- [ ] Diagram, per-email specs and ESP setup notes delivered
