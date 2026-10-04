# Campaigns, subject lines and testing

> Distilled from: email-marketing (arnabbagxd/Brand-building-skills, MIT), emails and its copy-guidelines reference (coreyhaines31/marketingskills, MIT), subject-line-lab and its spam-trigger checklist (aaron-he-zhu/aaron-marketing-skills, Apache-2.0), email-best-practices marketing-emails reference (resend/resend-skills, MIT), email-marketing-bible (CosmoBlk/email-marketing-bible, MIT), klaviyo-analyst REFERENCE (thatrebeccarae/claude-marketing, MIT).

Use for "plan our email calendar", "broadcast", "promo email", "launch email", "Black Friday emails", "subject line ideas", "preview text", "will this subject get cut off", "A/B test", "what should we test", "pre-send check".

The writing of a single newsletter issue (story, sections, voice) belongs to `content-creation` (`references/newsletters.md`). This guide owns the campaign plan around it: who gets it, when, with which subject, how it is tested and checked before it goes.

## 1. Campaign types

| Type | Job | Cadence | Notes |
|---|---|---|---|
| Newsletter / regular broadcast | Keep the relationship, earn clicks | Weekly or fortnightly on a fixed day | About 80% value, 20% promotion; consistency beats frequency |
| Promotional (sale, offer) | Revenue now | 2-3 a month on top of the newsletter, more in peak season | Clear offer, real deadline |
| Product launch | Awareness to purchase | Series of 3-6 | Teaser → launch day → proof → last chance |
| Content / educational | Authority, engagement between offers | 1-2 a month | How-tos, case studies, behind the scenes |
| Announcement (feature, policy, price) | Inform | As needed | Plain, early, explain why |
| Seasonal (holiday, BFCM, back to school) | Peak revenue | Planned months ahead | See section 6 |

Automated flows (welcome, cart, win-back) are not campaigns: see [sequences-and-lifecycle.md](sequences-and-lifecycle.md). Build them first; campaigns sit on top.

## 2. Campaign brief (one per send)

```
Campaign: [name]   Type: [newsletter | promo | launch | announcement]
Goal and KPI: [e.g. revenue per recipient, click rate, replies]
Audience: [segment rule] | Exclusions: [in active flows, bought in last N days, suppressed]
Engagement tiers included: [0-30 / 31-60 / 61-90 days]  Expected size: [count]
Offer and deadline: [...]   Proof available: [...]
Subject options (3-5) + preview text   From name / reply-to: [...]
Send time (recipient local): [...]  Test: [variable, split, KPI, decision rule]
Links and UTM: [...]   Owner and approver: [...]
```

Rules: one primary CTA per email; buttons for the main action; headline and offer in live text near the top (inbox summaries and screen readers read it first); a promo should still give a reason to open beyond the discount.

## 3. Subject lines

**Length.** Sources differ (under ~25 characters opens highest in one; 35-50 or 40-60 in others). Practical rule: aim for about 30-50 characters and put the promise in the **first ~30 characters**, because that is roughly what a phone shows. Overflow at the end is fine; a cut-off promise is not.

**Principles**
- Clear beats clever; specific beats vague. The subject must hold up if it is the only line they read.
- One idea. Name the benefit, the thing, or the open question.
- Lowercase, casual subjects can beat title case for newsletters and personal-feeling sends; test it for your list.
- The from name matters as much as the subject. A person's name ("Maya at Brand") often wins for newsletters and win-backs; keep it consistent.
- Never fake familiarity or urgency (see the spam patterns below). Subject lines carry claims too: no invented numbers, prices or scarcity.

**Angles to draft from** (write 3-5 options across different angles, then cut)

| Angle | Pattern | Example |
|---|---|---|
| Direct | "[Product] is back in stock" | "The linen shirt is back" |
| Benefit | "[Outcome] in [time]" | "Faster month-end close in 3 steps" |
| Number | "3 things to know before [action]" | "3 checks before you renew" |
| Curiosity | "The [topic] mistake most [audience] make" | "The pricing page mistake we made" |
| Question | "Still [problem]?" | "Still copying data by hand?" |
| Personal | "A quick note from [founder]" | "A quick note from Sam" |
| Offer | "[Offer] ends [day]" | "Free shipping ends Sunday" |

**Spam and trust patterns: rank down or cut**

| Pattern | Flag when |
|---|---|
| ALL-CAPS | 3+ capitalised words in a row, or a fully capitalised subject |
| Exclamation stacking | 2+ `!` |
| Fake thread | `RE:` or `FWD:` with no earlier thread (deceptive under CAN-SPAM) |
| False scarcity | "Only 2 left", "ends in 1 hour" without a real basis |
| Spam-word clusters | 2+ of: free, guaranteed, act now, risk-free, cash, winner, congratulations, 100%, click here |
| Symbol stacking | Several `$`, `%`, stars or check-mark emoji used as decoration |
| Broken personalisation | A merge tag with no fallback, or a claim the data cannot fill |
| Emoji | More than 1; any at all in B2B or cold email. One on-brand emoji in a promo or newsletter is fine |

A clean pattern check is not an inbox guarantee: authentication, reputation and engagement decide placement ([deliverability.md](deliverability.md)).

## 4. Preview text (preheader)

- **Extends the subject, never repeats it.** Subject asks, preview answers; or subject names the thing, preview adds the detail.
- About 85-100 characters (some sources say up to 140). Set it explicitly: an empty preheader makes the client pull whatever body text comes first ("View in browser", alt text).
- Gmail's AI and Apple Intelligence summaries are built from the first ~150-200 characters of live text and can replace your preview line, so the opening lines of the body should state the point too.
- Render the full inbox line before choosing: `From name | Subject | Preview`, cut at mobile and desktop widths. Pick the variant whose promise survives the cut.

Example:
```
From: Maya at Northfield
Subject: Your winter boots, half the weight
Preview: The new Ridge Lite is 640 g a pair and still fully waterproof. First look inside.
```

## 5. A/B testing

**Rules**
1. **One variable per test.** Subject OR send time OR CTA OR offer, never several at once.
2. **Pick the KPI before launch:** clicks for content and CTA tests, revenue per recipient for offers, conversions for flows. Opens only for subject tests, and label the result low-confidence (privacy features inflate opens).
3. **Random, equal cells.** Campaigns: test on 20% (10/10), send the winner to the remaining 80%. Flows: 50/50 until a winner.
4. **Wait for significance:** 95% confidence minimum, and a minimum run (at least 4-24 hours for a campaign; a week or a set number of recipients for a flow). Do not stop early because one cell is ahead.
5. **Write the result down** (hypothesis, cells, sample, result, decision) and make the winner the new default.
6. Expect most tests to lose: roughly 1 in 7 produces a real winner. Test flows before campaigns, because a flow win keeps paying.

**Minimum sample per variant (rough guide)**

| Baseline | Lift you want to detect | Per variant |
|---|---|---|
| 20% open rate | 10% relative (to 22%) | about 7,500 |
| 20% open rate | 20% relative (to 24%) | about 2,000 |
| 3% click rate | 20% relative (to 3.6%) | about 12,000 |
| 3% click rate | 30% relative (to 3.9%) | about 5,500 |
| 1% conversion | 30% relative (to 1.3%) | about 18,000 |

A list under about 1,000 per variant cannot call small differences: test bigger changes, run the test over several sends, or skip it. For the significance maths, power analysis or a messy readout, hand off to `data-analysis` (`references/experiments-causal.md`).

**What to test, highest value first:** sender name (the effect compounds), offer type (% vs $ vs free shipping, on revenue per recipient), CTA wording and placement, template structure (designed vs plain text; plain often wins for newsletters), subject angle, send time, length.

**Sequential plan example**
```
Weeks 1-2  Subject: benefit vs urgency          KPI: clicks (opens as a hint)
Weeks 3-4  CTA: button above fold vs below copy KPI: click rate
Weeks 5-6  Offer: 15% off vs free shipping      KPI: revenue per recipient
Each: 7-14 days or the sample above per cell; winner becomes the default.
```

## 6. Calendar and peak season

- Plan monthly: fixed newsletter day, 2-3 promos, any launches, and the seasonal moments for your market. Leave quiet weeks after big pushes.
- Send at recipient local time where the ESP allows. Weekday mornings (9-11 am, Tuesday to Thursday) are a common starting point; your own tests beat any benchmark.
- **Frequency:** start conservative; raise it while clicks hold and unsubscribes stay under 0.3%. Rough ranges: ecommerce 2-5 a week to engaged contacts, newsletters 1-3 a week, SaaS B2B 1-2 a week, nonprofits 1-2 a month. Track revenue (or goal actions) per email sent to see when more stops paying.
- **BFCM and other peaks:** grow the list in September and October; raise volume gradually from October so the jump is not sudden; tease 2-3 weeks out; send daily during the event to engaged tiers first; follow with thanks, cross-sell and shipping-deadline emails. Do not add cold or long-dormant segments at peak: a reputation dip then is expensive.

## 7. Pre-send check and approval

Every campaign or staged send on a real ESP is live. Before anything goes to more than one person, assemble this packet, show it, and wait for an explicit "send it":

- [ ] **Audience:** segment rule, actual count (compare with the last similar send; a 10x jump is a bug until proven otherwise), engagement tiers included
- [ ] **Suppressions:** unsubscribed, bounced, complained, globally suppressed, frequency-capped, open support issue
- [ ] **Authentication and health:** SPF, DKIM, DMARC aligned; complaint rate under 0.1% (block the send at or above it)
- [ ] **Compliance:** one-click unsubscribe and visible unsubscribe link, physical address, consent basis valid for this audience and region
- [ ] **Copy:** subject, preview, one CTA, no invented claims, merge tags with fallbacks (including inside `href`)
- [ ] **Design:** renders in a test send on mobile, desktop and dark mode; alt text; live-text headline; under ~100 KB of HTML ([templates-and-html.md](templates-and-html.md))
- [ ] **Links:** every link clicked in the test send, no placeholder URLs, UTMs present
- [ ] **Sender:** from name, monitored reply-to, send time and time zone
- [ ] **Kill switch:** batched or throttled send, and you know how to pause it

Test sends go to seed or internal addresses. Never trigger an unknown "send", "dispatch" or "publish" endpoint to see what it does; if the approve or schedule step is unclear, ask the person to click it.

## Checklist

- [ ] Flows exist before the campaign calendar fills up
- [ ] Brief names goal, KPI, audience rule, exclusions and approver
- [ ] 3-5 subject options across angles; promise in the first ~30 characters; no spam patterns
- [ ] Preview text set, extends the subject, and the body opening states the point
- [ ] One variable per test, KPI chosen up front, sample size checked, 95% confidence before calling it
- [ ] Pre-send packet shown and explicit approval received
