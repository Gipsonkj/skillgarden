> Distilled from: social (coreyhaines31/marketingskills, MIT), social-media-manager (alirezarezvani/claude-skills, MIT), social-media-content-calendar (NousResearch/hermes-agent, MIT), social-content-engine (anthropics/knowledge-work-plugins, Apache-2.0)

# Strategy, content pillars and the calendar

Use this for "what should we post", "build a social strategy", "plan next month", "audit our social", or turning a launch into a campaign.

## 1. Intake (ask only for what is missing)

Check for an existing context file first (`.agents/product-marketing.md`, `.claude/product-marketing-context.md`, a voice profile, or an existing `content-calendar.md`). Read it, then ask only for gaps.

| Topic | Questions |
|---|---|
| Goal | Awareness, leads, traffic, community, or hiring? What one action should people take? What does success look like in 90 days? |
| Audience | Who exactly? Which platforms do they already use? What do they engage with? |
| Voice | Tone, words they use, words they never use, topics to avoid, claims that need sign-off |
| Resources | Hours per week, who creates, can they film video, existing content to repurpose, budget |
| Current state | Platforms, follower counts, engagement rate, cadence, what has worked |
| Authority | Who approves posts? May Claude publish, schedule, or only draft? |

Pick a mode: **build from scratch**, **audit and fix** (underperforming account), or **scale and systematize** (needs a calendar, workflow and measurement).

## 2. Platform selection

Choose where the audience already is, not where you feel you should be. **Do 1-2 platforms well before adding a third.**

| Platform | Best for | Sustainable cadence | Lead formats |
|---|---|---|---|
| LinkedIn | B2B, thought leadership, hiring | 3-5 posts/week | Text story posts, document carousels |
| X | Tech, media, real-time, builders | 1-5 originals/day plus replies (see platform-playbook) | Single posts, threads, quote posts |
| Instagram | Visual B2C, lifestyle, ecommerce | 4-7 feed posts/week plus Stories most days | Reels, carousels |
| TikTok | Reach, under-35 audiences | 1-3 videos/day when growing, 3/week to maintain | Native short video |
| YouTube | Search, tutorials, long-form trust | 1-2 long videos/week, Shorts as available | Long-form plus Shorts |
| Facebook | Local business, groups, 35+ | 3-7 posts/week | Native video, groups, events |
| Threads / Bluesky | Conversational, tech/indie communities | Daily if active | Short text |

Cadence by team size (for small businesses), from the standing-calendar playbook:

| Team | Starting cadence |
|---|---|
| Solo owner | 2 posts/week, 1 email/month |
| Owner plus admin help | 3-4 posts/week, 1 email every 2 weeks |
| Dedicated marketer | 5 posts/week, weekly email |

Rule: **a cadence the owner can sustain beats an ambitious one.** Three good posts a week beats fourteen mediocre ones followed by three months of silence.

## 3. Content pillars

Pick 3-5 pillars. Each must answer: what unique view do we have, what does the audience ask, what has performed, what can we make every week, and how does it tie to the business goal.

Default mix (sources disagree on the promo share; the stricter cap wins because feeds that read as ads lose followers):

| Pillar type | Share | Examples |
|---|---|---|
| Educational / useful | 35-40% | How-tos, frameworks, mistakes, tips |
| Proof | 15-30% | Case studies, before/after, real job photos, results |
| Behind the scenes / people | 15-20% | Process, team, building in public |
| Conversation | 10-15% | Real questions, polls, takes |
| Promotional / offer | 5-10% (up to 20% for a shop with a live offer and strong proof) | Launches, offers, features |

Proof posts are the most under-used and among the best performers. Ask for real photos, numbers and customer words.

## 4. Campaign constraints (before any calendar)

Write these down for every campaign: objective, audience, message/offer, platforms, date range, cadence, voice, **mandatory and prohibited claims**, links and UTM convention, localization, and who approves and who publishes. Then inventory source material: verified facts, launches, articles, media, testimonials **with permission**, brand assets, key dates. Mark each claim with an owner and an expiry date. A post with no verified claim behind it does not go in the calendar.

## 5. Build the calendar

Weekly skeleton (adapt per platform):

| Day | Pillar | Format |
|---|---|---|
| Mon | Educational | Long post or carousel |
| Tue | Conversation | Question or poll |
| Wed | Behind the scenes | Photo or short video |
| Thu | Educational | Thread or how-to |
| Fri | Proof or promo | Case study or offer |

One row per post. The row format that survives between sessions:

| Date | Channel | Path | Pillar | Format | Hook / angle | Asset | CTA | Metric | Status |
|---|---|---|---|---|---|---|---|---|---|
| Jul 8 | Instagram | Design | Useful | Carousel 1080x1350 | "What that rattling noise means" | 6 slides | Save | Saves | draft |
| Jul 8 | Facebook | Repurpose of Jul 8 IG | Useful | 1200x630 crop | same | reuse | Book link | Clicks | draft |

Status values: `draft` -> `needs review` -> `approved` -> `scheduled` / `handed off` -> `published`. Never publish from `draft` or `needs review`.

To generate a balanced pillar rotation quickly, run the bundled generator (stdlib Python, no network):

```bash
python3 scripts/social-media-manager/social_calendar_generator.py --config calendar.json --start 2026-11-02 --weeks 4 --markdown
```

`calendar.json` takes `pillars` (name, description, weight) and `platforms` (name, posts_per_week, best_days). No config runs a demo. Treat its output as slots only: you still write the hook, angle and asset for each row.

Before presenting, flag conflicts: two posts on the same product the same day, a promo on a holiday or sensitive date, a sale post after the sale ends, a scheduled time already in the past.

## 6. Keep the calendar standing

The calendar is the durable artifact. Keep it in `content-calendar.md` (or the user's tool) with a `Home:` line saying where the user views it. On every run, open it first and report:

```
Published since last run:  6 posts (Jun 2 - Jun 24)
Still scheduled:           4 posts (through Jul 6)
Gap starting:              Jul 7, nothing drafted
```

Then **extend from the gap; never rebuild from scratch.** Default horizon 30 days; go to 60-90 only for a dated reason (launch, season, event). When asked for "more", keep the shapes that performed and change the subject.

## 7. Batch production

- Week -1: plan next week's topics (30 min).
- One session: write 5 posts or 3-5 video scripts (2 hours).
- Daily: 15-30 min engagement (see analytics-growth.md).
- Week +1: review results, adjust next week (30 min).
- Keep 1-2 weeks queued, review the queue weekly for relevance, and leave gaps for real-time posts.

**Schedule:** core posts, threads, carousels, evergreen. **Post live:** news reactions, trend responses, replies.

## 8. Editorial and risk review (every post)

Check: factual accuracy, tone, repetition, rights and permissions (photos, music, testimonials), accessibility (alt text, captions), disclosures (#ad for paid or gifted), link destination and UTM, date relevance, crisis sensitivity. Give each post a disposition and an owner.

## Deliverables by request

| Request | Deliver |
|---|---|
| Social strategy | Platform choice with reasons, 3-5 pillars with mix, cadence, 90-day plan, metrics |
| Content calendar | 4-week table using the row format above, plus the pillar distribution |
| Social audit | Profile, content, engagement and growth findings, prioritized fixes (see analytics-growth.md) |
| Campaign | Constraints sheet, claim inventory, calendar, per-post briefs, approval batch |

## Pitfalls

- Same copy on every platform (see repurposing-crossposting.md).
- Filling cadence with low-value repetitive posts.
- Publishing unverified metrics, testimonials or future claims.
- Restating a price, discount or stock count from memory; read it fresh from the source every time.
- Calling a slot "scheduled" when it only reached a draft handoff.
