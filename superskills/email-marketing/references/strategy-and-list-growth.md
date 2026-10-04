# Strategy, list growth and segmentation

> Distilled from: email-marketing (arnabbagxd/Brand-building-skills, MIT), lead-magnets and its format and benchmark references (coreyhaines31/marketingskills, MIT), email-best-practices email-capture, marketing-emails and compliance references (resend/resend-skills, MIT), email-marketing-bible (CosmoBlk/email-marketing-bible, MIT), loops-email-sending-best-practices audience-and-consent reference (loops-so/skills, MIT), ecommerce-email-marketing-builder (nexscope-ai/eCommerce-Skills, MIT), klaviyo-analyst (thatrebeccarae/claude-marketing, MIT).

Use for "email strategy", "grow my email list", "lead magnet", "signup form", "popup", "double opt-in", "segment my list", "who should get this email", "migrate to a new ESP", "import contacts".

## 1. Intake

Ask once, in one message, only for what is missing:

| Question | Why it matters |
|---|---|
| Business type (ecommerce, SaaS, creator/newsletter, B2B service, nonprofit) | Decides which flows come first |
| List size, ESP and how the list was collected | Consent basis, warm-up needs, what tools exist |
| Where subscribers live (US, EU/UK, Canada, Australia) | Which law sets the floor ([compliance-and-cold-email.md](compliance-and-cold-email.md)) |
| What is sent today, and current click, bounce and complaint rates | Baseline; complaints over 0.1% means fix deliverability first |
| One goal for the next 90 days (list growth, revenue, activation, re-engagement) | Everything else is sequenced behind it |

## 2. Build order

Automated flows earn far more per recipient than one-off campaigns (the bible puts it near 30x), so build the always-on flows before planning a campaign calendar.

| Business | First three | Then |
|---|---|---|
| Ecommerce | Welcome, abandoned cart, post-purchase | Browse abandonment, win-back, cross-sell, VIP, sunset, replenishment |
| SaaS | Onboarding (behaviour-based), essential transactional email, trial-ending | Failed payment, usage reports, win-back for expired trials, product updates |
| Creator / newsletter | Welcome (delivers the lead magnet), weekly issue, re-engagement | Referral asks, sponsorship or paid tier emails |
| B2B service | Lead-magnet nurture, event follow-up, newsletter | Case-study drip, reactivation of old leads |

Flow recipes: [sequences-and-lifecycle.md](sequences-and-lifecycle.md). Campaign planning: [campaigns-subject-lines-testing.md](campaigns-subject-lines-testing.md).

## 3. Lists, tags and segments

- **One master list or audience.** Tags hold facts (bought product X, came from quiz Y). Segments are saved rules that update themselves.
- **Lists the subscriber can see** (newsletter, product updates, offers) power the preference centre. Use them for categories people choose. Use segments for your own targeting.
- **Minimum segments** for any program: new (joined in 30 days), engaged (clicked in 60 days), customer vs non-customer, lapsed (no click or purchase in 90+ days).
- **Verify every segment against real counts** before sending. A segment that jumps 10x between runs is a bug until proven otherwise; AI-built segments tend to run too broad.

### Ecommerce segment rules (adapt to your ESP's wording)

| Segment | Condition | Use for |
|---|---|---|
| New subscribers | Subscribed, 0 orders | Welcome, first-purchase offer |
| First-time buyers | Exactly 1 order | Post-purchase education, second-order push |
| Repeat customers | 2+ orders | Cross-sell, loyalty |
| VIP | Top 10% by spend, or 3-5+ orders | Early access, no-discount perks |
| At risk | Last order 60-90 days ago | Win-back |
| Lapsed | Last order 90+ days ago and no engagement 60+ days | Win-back, then sunset |
| Engaged non-buyers | Clicks, no order | Social proof, objections |
| Discount-only buyers | Every order used a code | Value messaging to cut discount dependence |

### Engagement tiers (the strongest single lever)

| Last click (or purchase) | Send |
|---|---|
| 0-30 days | Every campaign |
| 31-60 days | Most campaigns (about 75%) |
| 61-90 days | Best content and key offers only |
| 91-180 days | Re-engagement flow only |
| 180+ days | Sunset: suppress after a final "stay subscribed?" email |

Use clicks, replies and purchases to define "engaged". Opens are inflated by Apple Mail Privacy Protection and inbox summaries, so an open-only rule keeps dead addresses on the list.

**Personalisation order (highest value first):** behaviour (viewed, bought, used feature) → lifecycle stage → dynamic blocks → send time → location → first name. Only use data the person gave permission for, and always set a fallback for merge fields.

## 4. Consent capture (do this right once)

Marketing email goes only to people who clearly asked for it. Full legal detail: [compliance-and-cold-email.md](compliance-and-cold-email.md).

**Forms**
- `type="email"` input, a visible label, a specific promise: "Weekly tips on X, every Tuesday. Unsubscribe anytime." Not "Sign up for emails".
- Marketing checkboxes start **unchecked**, one per email type ("Weekly newsletter", "Offers and deals"), with a privacy-policy link. One ecommerce source suggests a pre-checked checkout box; that is not valid consent under GDPR or CASL, so the stricter rule wins.
- Ask for the minimum. Every extra field costs roughly 5-10% of conversions; email only is the default, add first name only if you will use it.
- Validate server-side (format, domain has MX records), suggest fixes for typos (`@gmial.com`), rate-limit submissions, add bot protection, and block disposable domains if abuse appears.
- "Already subscribed" message: offer "Manage preferences"; for account sign-ups do not reveal whether an account exists.

**Double opt-in** (default for marketing lists, lead magnets and anything with abuse risk; required in practice in Germany)
1. Send the confirmation email immediately: one button, what they signed up for, link expiry (24-48 hours), "didn't request this?" line.
2. Allow resend after 60 seconds; cap at about 3 per hour per address.
3. Add to the marketing list only after the click. Record the consent (below).
4. Single opt-in is acceptable for people who just bought or created an account, within the limits of the law that applies (CASL implied consent, UK PECR soft opt-in for similar products with an opt-out offered at collection; check current guidance).

**Record for every subscriber:** address, timestamp, method (form, checkbox, import), the exact wording or list they agreed to, source page or form, IP if you collect it. Keep consent records while the contact is active and at least 3 years after (CASL).

## 5. Where to put the form

| Placement | Typical conversion | Notes |
|---|---|---|
| Dedicated landing page, warm traffic | 20-40% | Organic or newsletter traffic |
| Dedicated landing page, paid traffic | 10-25% | Cold traffic |
| Content upgrade inside a post | 3-8% of readers | 2-5x a generic sidebar box |
| Popup (after 5-8 s, 60% scroll or exit intent; never on load) | about 3-5% of visitors, top decile near 9% | Two-step popups (button, then form) beat one-step |
| Sidebar or banner | 0.5-2% | Lowest effort, lowest return |
| Checkout opt-in (unchecked) | Varies | Highest-intent address you will get |
| Packaging insert, event, social bio link | Varies | Point to a landing page with the same promise |

Benchmarks are rough industry ranges; build your own baseline from the first month. The page itself (headline, proof, form layout, CRO) is website work: hand it to `website-building`.

## 6. Lead magnets

**Rules:** solve one specific problem; match the buyer stage; look worth paying for but take under 30 minutes (ideally under 10) to use; lead naturally to the product; one format, works on a phone.

| Format | Effort | Landing-page conversion | Best for |
|---|---|---|---|
| Checklist | 1-2 h | 30-50% | Process steps, quick wins |
| Cheat sheet | 2-4 h | 25-40% | Reference, shortcuts |
| Template (doc, sheet, Notion) | 2-8 h | 25-45% | Repeatable work; usable within 5 minutes |
| Swipe file (15-50 annotated examples) | 4-8 h | n/a | Inspiration with "why it works" notes |
| Quiz (5-10 questions, 3-5 results) | 1-2 weeks | 30-50% | Segmentation: tag the result and branch the welcome |
| Email mini-course (3-5 lessons over 5-7 days) | 1-2 weeks | 15-30% | Education plus habit |
| Webinar (30-45 min + 15 min Q&A) | 1 week | 20-40% registration | Authority; send confirmation, day-before and 1-hour reminders, replay within 24 h |
| Ebook or guide (10-25 pages) | 1-3 weeks | 20-35% | Awareness stage |
| Free trial or tool | varies | 5-15% | Decision stage, highest lead quality |
| Discount (ecommerce) | low | varies | First order; protect margin |

**Stage fit:** awareness → checklist, cheat sheet, guide, quiz. Consideration → comparison template, assessment, case-study set, webinar. Decision → implementation template, migration checklist, trial, calculator.

**Gating:** full gate for bottom-funnel assets; partial gate (preview, full version for an email) to keep reach; ungated plus optional for top-funnel; content upgrades for blog posts. For quizzes, keep the quiz open and gate the personalised result.

**Delivery:** thank-you page with instant access **and** an email copy (verifies the address and starts the welcome flow). Use the thank-you page for one next step: start a trial, book a call, or read the best related piece.

**Quality signals** (check after 30 days): first three emails opened and clicked above list average, low unsubscribes after delivery, leads match the ideal customer, progression to trial or purchase. High volume with none of these means the magnet attracts freebie hunters; narrow it.

## 7. Imports, migrations and old lists

- **Never buy, rent, scrape or append** addresses. They carry spam traps, complaints and no consent; one bad import can sink the domain.
- Old CSVs are not safe by default. Check how each contact opted in; some ESPs (Loops, for one) mark imported contacts as subscribed unless told otherwise, so set the field explicitly.
- When switching ESPs, pull unsubscribe and suppression state from the old ESP's API, not from a list export (exports often drop unsubscribes). Import suppressions first.
- Contacts silent for 6+ months: send a re-permission email ("Still want these?") and keep only those who click. Never blast a dormant list from a new domain.
- Ramp sending on the new platform with the most engaged contacts first, in chunks, per the warm-up schedule in [deliverability.md](deliverability.md).

## 8. Preference centre and frequency

- Offer frequency (weekly / monthly) and topics alongside a one-click "unsubscribe from all". A preference centre lowers unsubscribes but never replaces the unsubscribe.
- Start conservative and raise frequency only while clicks hold and unsubscribes stay under 0.3%. Rough ranges: ecommerce 2-5 a week to engaged, SaaS B2B 1-2 a week, newsletters 1-3 a week, nonprofits 1-2 a month.
- Track revenue (or the goal action) per email sent, not per campaign, to see when more email stops paying.

## 9. Strategy deliverable

```
Email program: [brand]
Goal (90 days) | Baseline metrics | Consent basis per region
List growth: magnet(s), placements, form copy, opt-in type
Segments and engagement tiers (exact rules)
Flows to build, in order, with owner and launch date
Campaign cadence and calendar (link)
Deliverability actions (auth, warm-up, hygiene)
KPIs and review rhythm (weekly for the first month, then monthly)
```

## Checklist

- [ ] Consent basis stated for every audience and region; checkboxes unchecked; double opt-in on marketing forms
- [ ] Consent records captured with timestamp, method, wording and source
- [ ] Flows prioritised before campaigns, in the order for this business type
- [ ] Segments defined with exact rules and verified against real counts
- [ ] Engagement tiers and a sunset rule exist; "engaged" means clicks, replies or purchases
- [ ] Lead magnet is specific, quick to use, matched to a stage, delivered by page and email
- [ ] No bought, rented, scraped or unverified imported contacts
