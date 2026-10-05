# Content strategy, calendar and profile

> Distilled from: instagram-marketing / ig-content-planner, ig-profile-optimizer, ig-repurposer and algorithm-heuristics (sergebulaev/instagram-skills, MIT), viral-instagram-reels (vyralcontent/content-skills, MIT), instagram-post (publora/skills, MIT; timing defaults), instagram (sickn33/agentic-awesome-skills, MIT; best-times-from-own-data idea). Linktree: its own pages and help centre (link-only, restated in our words).

Each format has a job. Reels reach new people, carousels earn saves, Stories build the relationship with existing followers, and the profile converts visitors into followers.

## Pillars (default mix)

| Pillar | Share | Purpose | Main goal | Best format |
|---|---|---|---|---|
| Educational | 40% | Teach what the account is known for | Saves | Carousel, how-I Reel |
| Story | 30% | First-person wins and losses, behind the scenes | Follows, comments | Before/after carousel, face-to-camera Reel |
| Engagement | 20% | Relatable moments, questions, Story stickers | Comments, sends | Single image, Reel, Stories |
| Promotion | 10% | The offer and the next step | Follows, sales | Carousel or Reel with one clear step |

Adjust the mix to the account, but keep every pillar under about 50% and promotion at 1-2 feed posts a week. Keep **one topic** across posts. Instagram matches accounts to topics, and a skincare-finance-travel mix weakens every post.

## Cadence

- **3-5 good feed posts a week** beats daily filler. Consistency is what compounds.
- **Reels** can run more often than carousels, because each one reaches fresh non-followers.
- **Stories:** 2-4 frames a day.
  - Include a poll, quiz or question sticker.
  - Reshare one recent feed post. A reshare acts like a send and pushes the post to followers who missed it.
- **Starting posting times** (local to the audience):

  | Audience | Times |
  |---|---|
  | Consumer | weekdays 11:00-13:00 and 19:00-21:00, Sunday evening |
  | B2B | Tue-Thu, mid-morning and lunch |

  After 4-6 weeks, replace these with the account's own best times. See `analytics.md`: the `online_followers` insight, or top posts by hour.
- **Reply to comments in the first 30-60 minutes.** Early saves, sends and comments decide whether a post gets wider distribution.

## Weekly plan output

| Day | Format | Pillar | Formula | One-line angle | Goal | Time |
|---|---|---|---|---|---|---|
| Mon | Reel | Educational | Pattern interrupt | "you post Reels at the worst time" | Sends | 12:00 |
| Tue | Carousel | Educational | Listicle | "7 portfolio mistakes (most miss #4)" | Saves | 11:30 |
| Wed | Stories | Engagement | Poll + question | "which layout wins?" | Comments | 19:00 |
| Thu | Carousel | Story | Before/after | "my first $0 to first $4k" | Follows | 11:00 |
| Fri | Single image | Engagement | Relatable cold open | "opening Canva for one graphic" | Comments | 13:00 |
| Sat | Reel | Educational | How-I teardown | "how I edit a Reel in 20 min" | Saves | 10:00 |
| Sun | Stories | Promotion | Reshare + link sticker | "doors open" | Follows | 18:00 |

Fill in real angles from the user's theme. Add a **weekly saves + sends target** as the headline metric (not likes).

Balance check:

- [ ] At least 2 Reels, at least 2 carousels, and Stories every day
- [ ] At least 3 save-oriented posts and at least 2 send-oriented posts
- [ ] At least 1 real first-person story post
- [ ] No pillar over 50%, promotion at 2 posts or fewer
- [ ] No formula used more than twice
- [ ] Every post has a clear primary goal: sends, saves, comments or follows

Deliver the plan as a markdown table, plus optional JSON or CSV for a scheduler. Each post then goes through `reels-scripting.md`, `carousels.md` or `captions-hashtags-ctas.md`.

## Repurposing other content

- **Blog post or newsletter → carousel:** one claim per slide, with the best point on slide 2. Turn the article's conclusion into the payoff slide.
- **LinkedIn post or X thread → carousel or caption:** cut the long setup. Instagram lines are shorter, so move the number into the hook.
- **YouTube script → 1-3 Reels:** one idea each, 20-40 s, a new hook for cold viewers, and on-screen text added.
- **Never cross-post a file with another platform's watermark.** Re-export clean (see the originality rules in `reels-scripting.md`).

## Profile audit (9 parts)

People decide whether to follow from the profile header plus the first rows of the grid.

| # | Part | Passes when |
|---|---|---|
| 1 | Photo | A clear face (or logo) filling the frame, high contrast, readable at small size |
| 2 | **NAME field** | Real name plus a searchable keyword, 30 characters or fewer (e.g. "Sam Rivera \| Instagram Growth"). This field is indexed by search; the @handle carries less weight. |
| 3 | @handle | Short, matches the brand, avoids numbers and underscores |
| 4 | Bio (150 characters) | Who you help + what you post + one proof or specific. Leads with the reader's benefit, not a job title. No emoji storm. |
| 5 | Link | One link matched to the goal (offer, newsletter or booking), or a link hub such as Linktree if several are needed (below) |
| 6 | Category | One clear niche label (Business or Creator accounts) |
| 7 | Highlights | 4-6, ordered by the visitor's next question (Start here, Proof, Offer, FAQ, About), with consistent covers and one-word names |
| 8 | First 9 grid tiles | A consistent look, readable at a glance, showing range. Replace weak tiles at the top. |
| 9 | Pinned posts (up to 3) | Best proof, clearest offer, and an intro to who this account is for |

Deliver:

- a scorecard (pass / needs work / fail)
- priority fixes, with the NAME field, bio and pins first
- before and after rewrites, within the 150 and 30 character limits
- the **header test**: would a stranger follow from the photo, NAME, bio, link and first grid row alone?

## Link in bio (Linktree)

Captions can't carry clickable links, so every "link in bio" CTA lands on the profile link. With one goal, link straight to it. With several (shop, booking, newsletter), use a link hub; Linktree is the usual one, and its free plan has unlimited links. Claude has no route into Linktree here: it drafts the link list and the user edits it in the Linktree admin.

**Pick a tool**

| The user's situation | Use | Why |
|---|---|---|
| Already has a link hub in the bio | Keep it | Its links and click history stay |
| One goal this month (one shop, one sign-up) | The goal's own URL, no hub | No account needed |
| Several goals (shop, booking, newsletter) | Linktree | Free plan has unlimited links |
| Wants comment-to-DM from the same tool | Linktree | Its Instagram auto-reply sends the link by DM (`dms-and-comments.md`) |
| Needs click history beyond 28 days, or traffic sources | A paid Linktree plan | Free Insights stop at 28 days; Starter reaches back 90 days, and traffic sources need Pro or Premium |
| Not sure what the bio link points to now | **Ask** for the current link | Don't replace a page the user relies on |

- **Order by goal:** the top link is this week's CTA. When a post says "link in bio", check before it goes live that the top link matches it, and give the link the same words the caption uses.
- **Add it to Instagram:** profile → Edit profile → Links → Add external link → paste the full URL, including `https://` → Done.
- **Stories:** a link sticker can point to the Linktree; Linktree notes this works for every account, whatever the follower count.
- **Measure:** read Linktree's views and clicks beside Instagram's profile link taps (`analytics.md`).
- **Auto-reply:** Linktree can also DM a link to people who comment; rules and setup are in `dms-and-comments.md`.

## Account type

| Type | When |
|---|---|
| Creator | Individuals. Full music library, API access. |
| Business | Shops and brands. Shopping, more scheduler support, Sound Collection audio only. Some tools (e.g. Publora) require Business. |
| Personal | No API access, no insights. Switch to a professional account for free in Settings. Posts and followers are kept, and the account becomes public. |

## Growth without bots

> ToS: official Graph API / Instagram API only (Business or Creator), user-approved actions, no bots or cold DMs, scraping is HIGH risk and never the default.

Growth levers that work within the rules:

- Reels built for sends, with Trial Reels for testing
- Collab posts with peers (shared reach)
- a fixed profile
- fast replies to comments
- a weekly manual routine of 10-15 thoughtful comments on niche accounts
- Story reshares
- comment-to-DM lead magnets
- paid boosts of proven posts
