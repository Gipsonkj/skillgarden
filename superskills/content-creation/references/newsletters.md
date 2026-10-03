# Newsletters and Substack

> Distilled from: substack-ghostwriting (samber/cc-skills, MIT), newsletter (openclaudia/openclaudia-skills, MIT), content-creation email structure (anthropics/knowledge-work-plugins, Apache-2.0), article-writing newsletter rules (affaan-m/ECC, MIT).

Use for "newsletter issue", "Substack post", "ghostwrite my newsletter", "subject line", "welcome sequence", "grow my newsletter", "newsletter strategy", "Beehiiv", "paid subscribers", "Substack Notes", "turn this blog post into a newsletter".

## 1. Decide the mode

| Dimension | Options | Default |
|---|---|---|
| Voice | Own voice / ghostwriting | Ghostwriting: build the voice guide first ([brand-voice.md](brand-voice.md) §2) and get it approved |
| Format | Newsletter issue (email-first) / web post (web-first, search) | "newsletter", "issue" → email; "article", "essay", "evergreen" → web |
| Archetype | Curated (5-10 links, 2-3 sentences each) / Original (one 1,000-2,500 word essay) / Hybrid (200-500 word intro + 3-5 links) | Hybrid for new newsletters |

Own voice with an existing archive: read recent issues, summarize the voice in 5-7 bullets, confirm before writing.

## 2. Intake (ask and wait; do not draft before answers)

Topic and angle; format; audience (junior devs and CTOs read differently); concrete objective (grow free subs, convert to paid, drive product signups, authority); series context and recent issues; length: short 500-800, standard 1,000-1,500, deep 2,000+. If the user has Notes or social data, use what got engagement to choose the topic.

## 3. Title and hook gate

Present **5 titles/subject lines + 3 hooks** (2-3 sentences each, labelled by strategy: credibility, counter-view, curiosity, surprise, data). Wait for a pick or remix before writing the body.

- Titles: specific benefit or reveal, 6-10 words; for technical readers, keywords filter the right audience; no fake urgency.
- Subject lines: 30-50 chars, only ~35-40 visible on mobile, so front-load; one reader, not a segment. Avoid FREE, URGENT, ALL CAPS, !!!.
- Preview text (~90 chars visible) extends the subject, never repeats it.
- Web posts: punchy feed title plus a separate SEO title under 60 chars, SEO description 150-160 chars, slug of 3-6 words with no date.

## 4. Issue structure

1. **Hook** (chosen). The first screen does real work: no diary warm-up, no "this week I've been thinking".
2. **Context** (1-2 paragraphs): why now, what prompted it.
3. **Body**: one argument thread; every section adds something new.
4. **Takeaway** (1-2 sentences): the one thing to remember.
5. **CTA** (1-2 sentences): one specific ask. A real question that invites replies is the strongest (replies help deliverability and the Substack algorithm).

Add a share line with a specific situation ("forward this to the colleague who owns your on-call rota") and a 2-5 sentence Notes/teaser version that stands alone.

## 5. Formatting

| Rule | Email issue | Web post |
|---|---|---|
| Paragraph length | 2-3 sentences max | 3-4 sentences OK |
| Subheads | every 300-400 words, H2/H3 only | every 200-400 words; TOC over 2,000 words |
| Bold | 1-2 key phrases per section so skimmers get the argument | same |
| Code | inline under 5 lines; fenced under 10; longer → link a Gist with a 2-3 line excerpt | 30-40 lines fine |
| Images | sparing (often blocked); never put critical info only in an image; always alt text | use freely |
| TL;DR | at top when over 1,500 words | optional |
| Length cap | Gmail clips emails over 102 KB (~3,000 formatted words) | none |
| Dividers | max 2-3 per issue | same |
| Embeds | degrade to a link in email; never essential | fine |

Links: descriptive anchors, important links early, no URL shorteners (spam signal). Send from a person's name, not a company.

## 6. Adapting existing content

Evergreen source → web post; timely source → newsletter issue. Cut 30-50% of a blog post's length for email. Add the personal layer (why you are sharing it, your take). Hook in the first two sentences. End with an ask. Do not paste the blog post.

## 7. After drafting

Run [humanize-ai-writing.md](humanize-ai-writing.md) on the body but **leave the approved subject line and hook intact**; they were chosen for opens. Suggest 1-3 images with placement, purpose and description (newsletter: cover plus at most 1-2 inline). Offer, do not auto-write, social promo posts (they belong to the social-media skill; [repurposing.md](repurposing.md) covers the derivatives).

## 8. Growth and strategy

**Cadence:** start weekly; reliable weekly beats erratic daily. Increase only with templates or a team.

| Stage | Highest-leverage moves |
|---|---|
| 0 → 1,000 | Lead magnet that is instantly useful; signup page with clear promise, proof and a sample issue; CTA in every blog post; personal network; on Substack keep everything free |
| 1,000 → 10,000 | Referral program (1 / 5 / 10 referral rewards); recommendation swaps with overlapping newsletters of similar size; excerpts on social; archive as searchable posts |
| 10,000+ | Paid acquisition at $1-5 per subscriber; podcast guesting; sponsorships |

**Substack specifics:** the ranking optimizes for subscriptions, not clicks, so bait does not help. Recommendations from related publications are the biggest free-growth lever (one large tech newsletter attributes ~70% of free growth to Recommendations + Discover). Post 3-5 Notes a week as cheap topic tests and expand the ones that land. Free issues are your best work; paid gets depth, access or exclusivity; do not paywall below ~1,000 subscribers.

**Health metrics:**

| Metric | Good | Great | If below |
|---|---|---|---|
| Open rate | 35-45% | 50%+ | Better subjects, clean the list |
| Click rate | 3-5% | 7%+ | Fewer, more relevant links; one clear CTA |
| Unsubscribe | <0.5% | <0.2% | Segment, lower frequency |
| Reply rate | 1-2% | 3%+ | Ask real questions; answer replies |

**Sequences.** Welcome: day 0 welcome + lead magnet + what to expect; day 2 your story + best issue; day 5 "reply and tell me..."; day 7 proof + referral ask. Re-engagement for 60+ days inactive: day 0 "here's what you missed" (3 best issues), day 7 "should I remove you?", day 14 final notice, then remove. Clean the list quarterly; 5,000 subscribers at 50% opens beat 20,000 at 15%.

**Monetization thresholds (rough):** sponsorships from ~1,000 subs at $25-50 CPM for business audiences ($30-60 developer, $50-100 executive); paid tier from ~5,000 free subs at $5-20/month; digital products from ~2,000. CPM = price ÷ subscribers × 1,000.

**Deliverability basics:** SPF, DKIM, DMARC, custom sending domain, ~80/20 text-to-image ratio, unsubscribe link and real reply-to address, sunset non-openers after ~90 days.

## Output

```
Subject (pick) + 2 alternates | Preview text
Issue in markdown
Image suggestions (placement, purpose, description)
Notes/teaser (2-5 sentences)
Voice guide used (if ghostwriting)
Open items: [NEED: ...]
```
