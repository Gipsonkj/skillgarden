---
name: instagram-automation
description: Instagram content and safe automation. Drafts Reels scripts, carousels, captions and hashtag sets. Plans content calendars and fixes profiles. Publishes and reads insights only through Meta's official Instagram Graph API or official-API tools (Composio, Publora, SocialClaw, Meta Business Suite). Handles comments and DMs within Meta policy, researches influencers and collabs with risk flags, and diagnoses performance. Use when asked to write a Reel script or hook, plan or design an Instagram carousel, write an Instagram caption, CTA or hashtags, plan a week of posts, audit a bio or profile, publish or schedule to Instagram by API, check publishing limits, pull Instagram insights or work out why a Reel flopped, set up comment replies or comment-to-DM flows, or find creators and brand partnerships. Also use when someone asks for an Instagram bot, auto-follow, auto-like, mass DM or scraper, to offer the ToS-safe alternative. Default: draft, then post manually or via the official API.
---

# Instagram automation

This skill turns ideas into Instagram posts that people send and save: Reels, carousels, captions and a plan for the week. It publishes, moderates and measures only through Meta's official APIs. Treat "automation" as two jobs: making drafts faster (always fine), and taking actions on Instagram (official API only, with the user's approval for each one).

## Instagram rules first

These rules come before every other rule in this skill. If a request breaks one of them, say so plainly and offer the compliant route.

- **Publish and read insights only through Meta's official Instagram Graph API / Instagram API**, from a **Business or Creator** account. Tools built on that API are also fine: Meta Business Suite, Composio's Instagram toolkit, Publora, SocialClaw. Personal accounts have no API access, so for them use manual posting.
- **Respect the content publishing limit.** Read the current limit from the API's `content_publishing_limit` endpoint before every batch. Never hard-code a number: sources disagree (25 vs 50 per 24 h) and Meta changes it.
- **DMs go only through the Messaging API and only within Meta policy.** The user has to start the conversation (a message, a comment or a story reply). Replies must fall inside the 24-hour window, and the person must have opted in to anything recurring. No cold or mass DMs, ever.
- **No engagement bots.** Never build follow/unfollow, auto-like, auto-comment on other accounts, view or story-view bots, engagement pods, or anything that logs in with a password or session cookie.
- **Scraping is HIGH risk** under Meta's terms. That covers instagram-scraper / ScrapeCreators, Apify Instagram actors and cookie/session tools. Use it for research on public data only, at small volume, when the user explicitly chooses it after hearing the risk. It is never the default, and this skill ships no scraping code.
- **The default mode is drafting**: Reels scripts, carousels, captions and plans. The user then posts by hand or approves an official-API publish.

Full risk table and the wording to use when declining: [references/tos-and-safe-automation.md](references/tos-and-safe-automation.md).

## Core principles

1. **ToS first (above).** If a request automates actions on other people's accounts, check it against the risk table before writing any code.
2. **The human approves every public action.** Before any publish, comment reply or DM goes out, show the exact media, caption, account and time and get a "yes". Drafts and saved plans never count as approval to publish.
3. **Design for sends and saves, not likes.** Meta has said publicly that sends per reach is a top signal for reaching new audiences. Before writing, name the specific person a viewer would send this to, or why they would save it.
4. **The hook lives in the first unit.** That means 0-3 s of a Reel, the first ~125 characters of a caption, or slide 1 of a carousel. No greetings, no logo intros, nothing that only works with sound.
5. **One idea per post.** If a draft carries two ideas, split it into two posts.
6. **Numbers beat adjectives, and nothing is invented.** "47 minutes" beats "fast". Never invent results, clients, quotes or statistics. Leave `{{your number}}` and flag it.
7. **Captions and on-screen text are the search surface. Use 3-5 hashtags.** Sources ranged from 3 to 30. This skill uses 3-5 because Instagram's head said hashtags don't add reach and more than 5 reads as spam.
8. **Originality is enforced.** No TikTok or CapCut watermarks. Reposts need a substantial edit (your voice, your cuts, your text). Instagram judges originality over a rolling 30 days.
9. **Media is required and has fixed specs.** Feed and carousel images are 1080x1350 (4:5). Reels and Stories are 1080x1920 (9:16). The API takes 2-10 carousel items and captions up to 2,200 characters.
10. **Keep text in the safe zone.** On a 1080x1920 frame, keep text between y=230 and y=1440 and leave the right 230 px clear.
11. **Judge results against the account's own baseline,** and fix the earliest failure first, in this order: hook, then body, then topic, then CTA.
12. **Sound like the user.** Read their past captions or scripts first. Strip AI tells: clusters of words like "leverage" or "elevate", "It's not X, it's Y", heavy em-dash use, "Here's the thing".
13. **Consistency beats volume.** Stick to one clear topic and 3-5 good feed posts a week, plus Stories, rather than daily filler.
14. **Secrets stay secret.** Tokens and API keys live in environment variables and are never printed or committed. Never type an Instagram password into a third-party tool.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Week of bakery posts: `references/content-strategy.md` → `references/reels-scripting.md` → `references/captions-hashtags-ctas.md` → `references/graph-api-publishing.md`; Reel cuts and captions from `ai-video` → `references/captions-talking-head.md`; carousel slides from `poster-design` → `references/banners-social.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Is this automation allowed? Bot/scraper/mass-DM requests, risk table | [references/tos-and-safe-automation.md](references/tos-and-safe-automation.md) |
| Reel script, hooks, beat sheet, on-screen text, Trial Reels, audio | [references/reels-scripting.md](references/reels-scripting.md) + `scripts/ig-reel/hookscore.py`, `scripts/ig-reel/beats.py`, `scripts/ig-reel/hooks.json` |
| Carousel copy (slide by slide) and visual design/export | [references/carousels.md](references/carousels.md) |
| Caption, CTA, hashtag set, alt text, AI-tell scrub | [references/captions-hashtags-ctas.md](references/captions-hashtags-ctas.md) |
| Weekly plan, content pillars, cadence, profile/bio audit, repurposing | [references/content-strategy.md](references/content-strategy.md) |
| Publish or schedule by API: Graph API, Composio, Publora, SocialClaw, limits | [references/graph-api-publishing.md](references/graph-api-publishing.md) |
| Comment moderation, replies, comment-to-DM, DM inbox within policy | [references/dms-and-comments.md](references/dms-and-comments.md) |
| Influencer or brand-collab research, creator vetting | [references/influencer-research.md](references/influencer-research.md) |
| Insights, Reels metrics, why a post flopped, reporting | [references/analytics.md](references/analytics.md) |

To call one capability directly, name the task, or say "use instagram-automation: carousels".

## Other crafts

| When the request also needs | Use |
|---|---|
| The same idea adapted for X, TikTok, LinkedIn or YouTube | `social-media` → `references/repurposing-crossposting.md`, `references/platform-playbook.md` |
| Creator deals, briefs, rates and FTC disclosure (beyond the vetting in `references/influencer-research.md`) | `social-media` → `references/influencer-marketing.md` |
| Photos or illustrations generated for posts and slides | `image-creation` → `references/marketing-brand-images.md`, `references/editing-references-consistency.md` |
| Finished slide design or a Reel cover (beyond the design notes in `references/carousels.md`) | `poster-design` → `references/banners-social.md`, `references/thumbnails.md` |
| Cutting, captioning and exporting the Reel footage | `ai-video` → `references/footage-editing-ffmpeg.md`, `references/captions-talking-head.md`, `references/delivery-qa.md` |
| Paid Instagram and Facebook ads | `ad-creation` → `references/meta-ads-creative.md`, `references/ad-copywriting.md` |
| A brand voice guide, or the long-form piece to repurpose | `content-creation` → `references/brand-voice.md`, `references/long-form-articles.md` |
| Publish or comment-to-DM flows run on a schedule, still through the official API | `automation` → `references/automation-design.md`, `references/n8n.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| The rest of its 13-skill suite: Stories, profile audits, comment and DM drafts | [ig-reel](https://github.com/Jakeschincariol/instagram-agent-skill/tree/main/skills/ig-reel) (MIT; drafting only) |
| Deeper hook and caption work in the sibling viral-hooks and viral-captions-and-ctas skills | [viral-instagram-reels](https://github.com/vyralcontent/content-skills/tree/main/skills/viral-instagram-reels) (MIT) |
| Hook extraction from viral Reels and nine sub-skills (captions, carousels, hashtags, profile) | [instagram-marketing](https://github.com/sergebulaev/instagram-skills/tree/main) (MIT; publishing needs a Publora key) |
| An HTML template for a connected multi-card carousel, exported to images | [social-carousel](https://github.com/nexu-io/open-design/tree/main/design-templates/social-carousel) (Apache-2.0; the template wasn't copied here) |

## Default workflow

1. **Classify the request** as draft, publish, engage, research or analyse. If it involves actions on Instagram or data from other accounts, run the ToS check first.
2. **Get the brief.** Ask once, in one batch, only for what's missing:
   - the goal (reach, saves, follows or sales)
   - account type (Personal, Creator or Business) and rough follower count
   - the audience
   - 2-3 samples of the user's own posts
   - the one true specific (a number, a story or a result)
3. **Draft** using the matching reference. For Reels, write 3 hooks from different formulas and score them with `python3 scripts/ig-reel/hookscore.py hooks.txt`. Time the script with `python3 scripts/ig-reel/beats.py script.txt --target 30` and fix every flag it raises.
4. **Self-check** the draft against "Done means" below and the checklist in the reference.
5. **Deliver** a copy-paste block: the script or slides, the caption, the hashtags, alt text and a media note.
6. **Publish only if asked**, and only through the official route, after the user approves:
   - check `content_publishing_limit`
   - create the container
   - wait for `FINISHED`
   - publish
   - return the permalink
7. **Review after 24-72 h**: pull insights, compare them with the account's baseline, name the earliest failure and suggest one concrete change.

## Done means

- [ ] No step breaks the Instagram rules above. Any risky option was labelled, and the user chose it explicitly.
- [ ] The hook works on mute and lands within 3 s, 125 characters or slide 1, and the body pays off what the hook promised.
- [ ] One idea, one CTA, and a named person to send it to or a reason to save it.
- [ ] Captions: 3-5 relevant hashtags at the end, no engagement bait, alt text drafted.
- [ ] Media specs and safe zone are respected, with no third-party watermark.
- [ ] No invented numbers. Any `{{placeholders}}` are flagged to the user.
- [ ] Any publish, reply or DM was approved explicitly, ran through the official API, and its permalink or ID is reported.
