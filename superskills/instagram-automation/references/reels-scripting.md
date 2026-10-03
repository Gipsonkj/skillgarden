# Reels scripting

> Distilled from: viral-instagram-reels (vyralcontent/content-skills, MIT), ig-reel (Jakeschincariol/instagram-agent-skill, MIT; scripts copied as-is to `scripts/ig-reel/`), reels-scripting (charlie947/social-media-skills, MIT), instagram-marketing (sergebulaev/instagram-skills, MIT).

> ToS: official Graph API / Instagram API only (Business or Creator), user-approved actions, no bots or cold DMs, scraping is HIGH risk and never the default.

A Reel is mostly shown to people who don't follow you. It is decided in the first 2-3 seconds, kept by the next five, and spread when someone sends it to a friend.

## Brief (ask once, only for what's missing)

- **Topic and the one true specific:** what happened, to whom, and what it cost or returned. A Reel needs one concrete fact. If the idea is thin, ask; don't pad it.
- **Goal:** cold reach, follows, saves, or nurturing existing followers.
- **Account type:** Creator or Business (this changes which audio is available), and follower count (Trial Reels need roughly 1,000+).
- **Voice:** 2-3 of the user's own Reels or transcripts. A script in the wrong voice is useless because they have to say it out loud.

## Length

- **Working range is 15-45 s. Default to 20-30 s** for cold reach. Use 30-45 s only when there are two real points.
- Instagram allows longer Reels. Almost nobody should use the extra time.
- Under about 7 s, the loop count inflates and nothing else improves.
- At most 2 key points per Reel. A third point means a second Reel.
- Speaking rate is about 165 words per minute, so 30 s is roughly 80 words. Time yourself once, then pass `--wpm`.

## The shape

```
0-2/3s   HOOK      the claim. The spoken line and the on-screen line are written separately.
                    Motion or a face in frame 1. No greeting, logo or "in this video".
2-7s     STAKE     why this matters to the viewer. One line.
7s-...   BODY      one idea per beat. Change the frame every beat (about every 2-4 s).
                    Put a re-hook where attention sags ("but here's the part...").
last 3s  PAYOFF    deliver what the hook promised, then ONE ask.
last line LOOP     echo a word from the hook so the replay lands cleanly.
```

Rules that make the difference:

- **Start at the sentence you would normally reach at second six.**
- **The first spoken word should be the most interesting word in the line.**
- **Numbers over adjectives.** If the number is unknown, write `{{your number}}` and flag it. Never invent one.
- **Never open with "I".** Open with "you", "this", a number, or a name.
- **Avoid staccato fragment stacks.** "Short. Punchy. Done." reads as written, not spoken.
- **Deliver the promise before the halfway mark.** A hook the body never pays off kills sends.
- **One ask:** send, save, follow, or comment a keyword. Pick one.
  - Prefer a send prompt that names a person: "Send this to the friend who buys every new serum" beats "share with a friend" and "follow for more".
  - Use a comment-keyword CTA ("comment SCRIPT") only if a working, policy-compliant comment-to-DM automation and a real deliverable exist. See `dms-and-comments.md`. Otherwise use a send or save ask.

## Hooks: write 3, score them, pick 1

1. Choose 3 *different* formulas from `scripts/ig-reel/hooks.json` (26 formulas). Each has a template, an example, an on-screen version, what it's best for, and the usual trap.
2. Write the spoken line plus a separate on-screen line for each hook.
3. Put the spoken lines in a file, one per line, and run:
   ```bash
   python3 scripts/ig-reel/hookscore.py hooks.txt          # rank
   python3 scripts/ig-reel/hookscore.py --hook "one line"  # single
   ```
   The scorer uses five local heuristics: sayable in about 3 s, something concrete, a stake, the point up front, and a named viewer.
   - If the top hook scores under 50, you don't have the hook yet.
   - It catches greetings, preambles and vague hooks well. It does not predict views. Its own docstring reports AUC 0.56 for separating a creator's hits from their misses. Trust the retention graph over the score.

Hook formulas that work most often (all in `hooks.json`):

| Formula | Shape | On screen |
|---|---|---|
| Cost confession | "$18,000 is what one missing clause cost me." | $18,000 MISTAKE |
| Time collapse | "This took 5 hours. Now it takes 20 minutes." | 5 HOURS -> 20 MIN |
| Nobody tells you | "Nobody tells you your first 30 Reels are supposed to flop." | YOUR FIRST 30 WILL FLOP |
| Negative command | "Stop X. Do Y instead." | STOP POSTING DAILY |
| If this, then watch | "If you get views but no followers, this fixes it." | VIEWS BUT NO FOLLOWERS? |
| The receipt | "I did X for 60 days. Here are the real numbers." | 60 DAYS. REAL NUMBERS. |
| Numbered with a favourite | "5 edits that... number 4 is the one nobody uses." | 5 EDITS. #4 IS THE ONE. |
| Cold-open demo | Start mid-action: "Watch what this does." | WATCH THIS |

If the hook would work for anyone else in the niche, it isn't the user's hook yet. Add the thing only they can say.

## On-screen text is its own script

- The hook card is up at **frame 1** with **3-6 bold words**. It is a headline, not a sentence.
  - Spoken: "If you keep breaking out after every new serum, this is for you."
  - On screen: "BREAKOUTS FROM EVERY NEW SERUM?"
- Hold the hook text for 2-3 s. Body beats get labels of 3-4 words. The payoff gets its own bold card, and the CTA gets its own final card.
- **Safe zone on 1080x1920:** keep text between y=230 and y=1440, and keep the right 230 px clear. The caption, action rail and audio strip cover everything outside that box.
- Use high contrast (outlined or boxed text). Default white text on busy footage fails in sunlight.
- Burn in captions for the body: most viewers start muted. Use text as punctuation, not as a transcript.
- If the Reel goes to the grid, it shows as a 3:4 crop there. Keep the hook subject in the upper two-thirds of the frame.

## Time it before shooting

```bash
python3 scripts/ig-reel/beats.py script.txt --target 30          # one line per beat
python3 scripts/ig-reel/beats.py script.txt --wpm 185 --target 45
```

Fix every flag, then re-run until the output is clean:

- hook longer than 3 s
- any beat over 4 s with no change on screen
- 3 beats in a row with nothing concrete
- no loop back to the hook
- total length far from the target

## Output format

````
REEL: [working title]
Goal: [cold reach / saves / follows]   Length: ~[x]s at [wpm] wpm   Account: [Creator/Business]
Hook: formula [name], score [n]

```script
[0:00-0:02] HOOK: ...
[0:02-0:07] STAKE: ...
[0:07-0:20] BODY: beat 1 ... / beat 2 ...
[0:20-0:27] PAYOFF + CTA: ...
```

On-screen cards:
0:00  [3-6 words]   0:07  [...]   0:20  [...]   0:25  [CTA card]

Shot list: [frame change per beat, B-roll, first-frame composition]
Audio: [original voice / Sound Collection / trending, with the window check]
Caption: see captions-hashtags-ctas.md (keyword first line, send prompt, 3-5 tags)
Placeholders to fill: {{...}}
````

## Using a reference Reel

When the user wants "a Reel like this one", work from material they supply: the video file, the transcript, or their own notes on the hook, structure and timings. Analyse:

- the exact first words and their word count
- the section timings
- the before/after moment
- the CTA
- the one technique worth copying

Then write the user's version on *their* topic and voice, keeping the hook's length and structure. Call the reference an "outlier" only if real comparison data proves it beat that creator's own baseline. One source automates this with an Apify Reel scraper. That is scraping (HIGH risk, see `tos-and-safe-automation.md`), so it is not the default here.

## Test cold first: Trial Reels

- **Use a trial when** the goal is cold reach, the account is public with roughly 1,000+ followers, and you're unsure the hook lands. Trials are most useful on your least certain drafts.
- **How a trial behaves:** the Reel goes only to non-followers.
  - At about 24 h you get a read of views, likes, shares and comparison with your previous trials.
  - At about 72 h Instagram may share it to followers automatically, or you can publish it to everyone at any time.
- **Decision after the read:**
  - Above your trial baseline: share it to everyone now.
  - So-so: let the auto-share decide.
  - High skip rate: recut the first 3 s and run the trial again.
  - Views but no sends or follows: rewrite the on-screen topic and the CTA.
- **Skip the trial** for follower-only content (behind the scenes, thank-yous), time-critical drops, or accounts under the threshold.

## Originality and audio pass (before publishing)

- **No TikTok or CapCut watermark, and no third-party app UI** in screen recordings. Your own logo is fine.
- **Make a substantial edit.** Your own voiceover, re-cut pacing, new on-screen text or a reaction count. Borders, speed changes, crops or "credit to @x" do not count.
- **Originality is judged over a rolling 30 days.** A run of reposts takes away cold distribution until most of the last 30 days is original again. There is no appeal; just post original work for 30 or more days.
- **Audio depends on account type.**
  - Creator accounts get the full music library.
  - Business accounts are limited to the commercial Sound Collection. Trending songs can silently strip from the post.
  - A Creator account still doesn't license commercial use of a song. For ads or brand work, use licensed or original audio.
- **Trending audio:** the lift is strongest in the first 5-7 days of a 1-3 week trend. Look for an upward arrow and fewer than about 30k uses. Use it only if it fits the Reel.
- **After posting,** check the Reel from a second, non-creator account to confirm the audio is still attached.
- **The Edits app** (Meta, mobile) exports without a watermark and fits Reels workflows. It won't fix a weak hook.

## Pre-shoot checklist

- [ ] The hook lands in about 2 s when spoken, its first word is the interesting one, and it works on mute.
- [ ] It names a concrete viewer, number or stake, and opens a loop the body closes.
- [ ] One idea, at most 2 points, and the frame changes every beat.
- [ ] The on-screen text sits in the safe zone, 6 words or fewer per card.
- [ ] One ask (send prompt preferred), and the last line loops back to the hook.
- [ ] `beats.py` runs clean and the length is within 15-45 s.
- [ ] Originality and audio pass done. No invented numbers.
