> Distilled from: social (references/x-algorithm.md; coreyhaines31/marketingskills, MIT), x-marketing (sergebulaev/x-skills, MIT), x-twitter-growth (alirezarezvani/claude-skills, MIT), thread-writer-sms (blacktwist/social-media-skills, MIT)

# X posts, threads, replies and growth

Use this for any X post, thread, reply, quote post, X profile audit, or X growth plan. Posting mechanics (API, xurl) are in publishing-apis.md.

## 1. How the For You feed ranks (what is known)

xAI open-sourced the X recommendation pipeline (github.com/xai-org/x-algorithm). The release shows **which signals are scored**, not their weights. Treat any "a reply is worth N likes" claim as community estimate.

- Candidates come from accounts the viewer follows **and** from the global pool, so every post competes for out-of-network reach.
- Filters run **before** scoring: too old, already seen, muted keywords, blocked or muted authors.
- A model predicts about 15 separate actions and sums them with weights. Scored positives include: like, reply, repost, quote, click on the quoted post, post click, **profile click**, **share via DM**, share via copy link, photo expand, dwell (as a threshold and as time), **follow author**, and video quality view (only above a minimum duration).
- Predicted **not interested, mute, block and report subtract** from the score before anyone acts.
- An author-diversity step decays your second and later posts in the same feed load, so bursts compete with each other.

## 2. Ten posting rules that follow

1. **Specific claim in the first 8 words.** Dwell is scored; scroll-past kills it.
2. **Name the topic in the first 10 words** (specific nouns like "Stripe", "Claude") so topic routing works and muted-keyword filters do not catch you.
3. **Write for the DM-share and the follow, not the like.** Test: "would someone send this to a friend?"
4. **Quote posts beat plain reposts** when you add a real layer (data, counterpoint, experience).
5. **Make the profile worth clicking:** clear bio and a current pinned post convert the profile-click signal.
6. **Space original posts about 60 minutes apart** (spacing number is reported; the decay mechanism is in the code).
7. **Stay for the first 30 minutes** and answer early replies; each answered reply is fresh engagement. Post when you can stay, not when a scheduler fires.
8. **Video must pass the minimum duration (reported around 8+ seconds) and carry captions.**
9. **No engagement bait** ("RT if", "reply YES"); predicted mutes and "not interested" subtract.
10. **Do not repost the same content quickly**; the already-seen filter removes it. Space evergreen reruns by weeks.

Widely reported, not visible in code (test on the account): external links in the first post reduce reach, so put the link in a reply or a later thread post; 2+ hashtags read as spam; X Premium accounts get a reach and reply-ranking boost.

## 3. Single posts

Shapes that work (fill with real facts):

| Shape | Goal |
|---|---|
| One-line contrarian claim you can defend | Reposts |
| Unrounded data point + one line of meaning | Bookmarks |
| Build-in-public metric including the ugly part | Replies |
| Mini-list of 3-7 tools or steps | Bookmarks |
| Relatable cold open from a real moment | Replies, likes |
| Third-person case study with a number ("[Company] spent $X on Y. Then Z happened.") | Reposts |

Rules: one idea; under ~200 characters often performs best for single posts; line breaks for pacing; 0-1 emoji; 0-1 hashtag at the end; lowercase sentence starts are fine on X but capitalize names; specific numbers over adjectives. Pick one primary goal (replies, reposts, bookmarks) per post.

## 4. Threads

Use a thread only when a single post would collapse the argument. Pick the format first:

| Format | Structure |
|---|---|
| Listicle | Promise "[N] [things]" -> one item per post -> the lesson the list reveals |
| Story | Setup -> conflict -> resolution -> transferable lesson |
| Framework | Name the framework -> one step per post -> the result |
| Breakdown | Why this example matters -> component by component -> principle to reuse |
| Contrarian | Claim -> the common belief -> evidence -> claim restated with nuance |

Architecture:
- **Post 1 is the whole funnel.** One or two lines, a specific number or claim, a promise, and an open loop. It must work as a standalone post. Add a thread signal ("1/" or "A thread:").
- **Length:** 5-9 posts for teaching or list threads; longer only for a strong story. Under 5 feels thin.
- **Front-load value:** the strongest item goes at position 1-2, because read-through drops with depth.
- **Each post stands alone** (people land mid-thread from quote posts); one idea each; max 3-4 lines; white space every 1-2 lines; vary lengths.
- **Close** with the most quotable line plus one ask (follow, bookmark, or "reply with yours"), not several.
- Optionally reply to post 1 with the link or resource.
- **Character budget:** 280 per post on standard accounts; emoji count 2; URLs count 23; leave ~8 characters if a tool adds "(1/N)" markers.

## 5. Replies and quote posts

- **Reply** stays inside the conversation: lower reach, higher intimacy. Use it to answer, add a data point, or build a relationship.
- **Quote** puts your take on your own timeline: use it when your addition deserves its own reach.
- Reply to accounts 2-10x your size, early (first 30 minutes on large accounts), with something tweet-worthy: an insight, a counter-example, a number. Never "great thread", "this", "100%".
- Do not sell your product in replies on other people's posts. Describe what you do only if asked.
- Write a full set of replies as drafts; the user posts them (most schedulers and APIs restrict automated replies).

## 6. Profile audit (do before growth work)

- [ ] Bio line 1 says who you help and how; a specific niche (not "builder | thinker")
- [ ] One proof element (title, metric, notable work) and one link or CTA
- [ ] No hashtags in the bio
- [ ] Pinned post is under 30 days old and is the strongest hook or best work
- [ ] Last 30 posts: at least 1 per day; mix of posts, threads, replies, quotes; replies are 30%+ of activity

## 7. Cadence by account size

| Followers | Posts/day | Threads/week | Replies/day |
|---|---|---|---|
| < 1K | 2-3 | 1-2 | 10-20 |
| 1K-10K | 3-5 | 2-3 | 5-15 |
| 10K-50K | 3-7 | 2-4 | 5-10 |
| 50K+ | 2-5 | 1-3 | 5-10 |

Keep about 60 minutes between originals (rule 6).

## 8. Growth plan

- **Weeks 1-2:** fix bio and pin; list 20 niche accounts on a private X list; 10-20 real replies a day; 2-3 posts a day across different shapes; 1 thread.
- **Weeks 3-4:** keep the top 2 formats by engagement rate; 3-5 posts a day; 2-3 threads a week; daily quote posts with added value.
- **Month 2+:** 3-5 recurring series (e.g. "Friday teardown"); repurpose threads into LinkedIn posts and newsletter sections; build reply relationships with 5-10 peers your size.
- Research what works in the niche with search (e.g. `"topic" min_faves:100` in X search) and the method in listening-research.md.

## 9. Pre-publish checklist

- [ ] Post 1 stops the scroll alone and names the topic early
- [ ] Every post fits 280 (emoji = 2, URL = 23) or the account has Premium
- [ ] No link in post 1; 0-1 hashtag; 0-1 emoji
- [ ] At least one real, specific number where the claim allows
- [ ] No AI tells (hooks-and-voice.md)
- [ ] Close is a landing or one specific ask
- [ ] The user can be online for 30 minutes after it goes out
