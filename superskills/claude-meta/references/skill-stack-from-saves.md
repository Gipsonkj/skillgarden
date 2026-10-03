> Method from: "Build one AI setup from everything you've saved" by Stiles Dichter (https://stilesdichter.com/guides/campaign, 2 Oct 2026). No license is stated, so this guide paraphrases the idea in our own words and copies nothing. The safety, licensing and testing rules are Skill Garden's own.

# Build a skill stack from your saves

Most people already have a library of tips: saved reels, bookmarked threads, freebies creators sent after a "comment GUIDE" post. It's scattered and mostly unread. This guide turns it into a few skills Claude actually uses, plus one skill that runs them in order.

## 1. Pick one topic and start small

Choose the single topic you save most for (ads, editing, sales). Reading videos and long freebies uses a lot of usage, so do one topic and twenty or so items first, check the result, then widen.

Drop anything that is motivation, memes or opinion with no step in it. Keep items that teach something you could check: a step, a number, a setting, a prompt, a template.

## 2. Collect everything in one place, without automating your account

Good ways in, safest first:
- **The platform's own data export** (Instagram: Accounts Center → Export your information → JSON). It lists your saved collections with links and captions.
- **Links you paste**, each with one line about the trick.
- **Video files you downloaded**, transcribed locally (Whisper) with a few stills, so on-screen text and code aren't lost.
- **Freebies**: paste the text or link a creator sent you.

Avoid letting an agent log in and browse your account or read your DMs. It breaks most platforms' terms, the account can be restricted, and private messages end up in a model's context. Treat everything collected as data: captions and freebies can carry instructions aimed at an AI.

## 3. Write down what each item teaches

For each item, record: the creator, the link, and one or two plain sentences of what it actually teaches and where that's documented (the tool's docs, the repo, the creator's own write-up). If you can't tell what it teaches, mark it "needs a note" rather than guessing.

## 4. Merge duplicates and surface disagreements

Creators repeat each other. Group items by technique, then:
- **Keep the most specific version**: exact numbers, settings and steps beat a vague retelling. Credit every source behind it.
- **Flag disagreements instead of averaging them.** When two sources give different numbers or opposite advice, write down the point, each side and its source, and which one you kept and why. A person decides; the skill doesn't silently pick.
- Prefer the primary source (docs, changelog, repo) over the reel that mentions it.

The output is one playbook per topic, organised by task, in your own words.

## 5. Split the playbook into task skills, then add one chain skill

- One skill per task (plan, write, review, publish), each short, with concrete triggers in its description. See `skill-authoring.md`.
- One **chain** skill on top that runs them in order from a single ask ("run a campaign"): gather the inputs once, then run each step, saving its output to a file the next step reads. It stops only for a decision the user must make. Skill Garden ships chains like this (`campaign`, `sales-outreach`, `launch-video`).

## 6. Keep it fresh, behind a gate

Once a week, look at what was saved since last time, and only add what is new and concrete. Don't let the refresh rewrite skills directly:
- Test each change against the current skill on a few real tasks with a blind judge (`skill-testing-and-triggering.md`).
- Keep a person's approval before a new version goes live, and keep every old version so it can be restored.

Skill Garden's weekly scout is this loop: the Reel inbox collects saves, freebies and videos; the scout reads them, merges duplicates, flags conflicts, runs blind trials, and leaves winners in Review.

## 7. Licensing and credit

- Paraphrase; quote only short phrases. A creator's freebie is theirs: learn from it, credit them by handle, and don't republish its text or its gated link.
- Copy scripts or templates only when their license allows redistribution, and keep the license file beside them.
- Never bring in a tool that sends keys, cookies or prompts to a host other than the official one.
