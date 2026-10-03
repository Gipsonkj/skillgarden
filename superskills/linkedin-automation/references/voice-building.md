# Voice building

> Distilled from: voice-builder and post-writer (charlie947/social-media-skills, MIT), linkedin-marketing interviewer, story bank and voice profile (sergebulaev/linkedin-skills, MIT), linkedin-content-writer (microsoft/cat-agent-skills, MIT), li-post (Jakeschincariol/linkedin-agent-skill, MIT), linkedin-skills forcing questions (alirezarezvani/claude-skills, MIT).

A post in the wrong voice is worse than no post. Voice building produces three files that every writing task reads first. They hold personal career detail, so keep them out of public repos.

| File | Holds | Size |
|---|---|---|
| `about-me.md` | Who they are, audience, 3-5 topic pillars, point of view, brand promise, off-limits topics | < 300 words |
| `voice.md` | How they write and what they never do | < 500 words |
| `story-bank.md` (optional) | Receipts, shipped work, turning points, scars, positions, names they can and can't use | Grows over time |

If the user won't keep files, return a short copyable "LinkedIn writing profile" block and say it lasts **for this conversation only**.

## Step 1: Interview (ask in two batches)

**Batch 1**: name and role; who they write for (specific enough that someone is left out); 3-5 topics they want to be known for; the belief they hold that their industry doesn't.
**Batch 2**: the one thing people should think when they see their name; what they refuse to write about.

Then the five forcing questions, one at a time, each with your recommended answer:
1. What has to be true in 90 days for this to have been worth it? (Not a follower count.)
2. Who exactly is this for?
3. How many minutes a week can they protect, measured on a bad week?
4. What proof already exists? (If none, the first pillar is process, not results.)
5. What will they not post about?

## Step 2: Samples

Ask for **3-5 pieces they wrote**: posts, newsletters, emails, talks. The minimum is 3. If they have none, use the story-bank interview instead (Step 4). If they paste someone else's writing as a style reference, take only the mechanics (sentence length, contractions, rhythm). Never take that writer's facts, stances, signature openers or first-person claims.

## Step 3: Analyse across samples, not within one

| Signal | Extract |
|---|---|
| Rhythm | Average sentence length, paragraph length, blank-line habit, staccato or flowing |
| Hooks | 3-5 opening types used, each with an example; types never used |
| Tone | 3-5 attributes they hit; 1-2 they never hit |
| Point of view | First person, second person or observational |
| Close / CTA | How they end; endings they avoid |
| Signature words | Recurring phrases |
| Absences | Punctuation, words and structures missing from every sample (for example "em dashes in 0 of 5", "never 'not X but Y'") |

Keep explicit prohibitions ("I never use emoji") separate from patterns that simply didn't appear. Label the second kind *provisional* with the count. If samples contradict each other, record the contradiction rather than smoothing it over.

## Step 4: Story bank (for people with no posting history)

Each question targets **one moment**, not a category. Categories get summaries back, and a summary can't be published.

| Section | Good questions | Avoid |
|---|---|---|
| Receipts | "Put a number on that, even a rough one, and say it's rough." "Before and after?" "How long, how many people, what did it cost?" | "Key achievements?" (gets adjectives) |
| Shipped | "What exists now that wouldn't if you hadn't been there?" "Which part was actually yours?" | |
| Turning points | "What did you believe a year ago that you don't now?" | |
| Scars | "Most expensive professional mistake?" "What do you check now that you never used to?" | Pushing twice |
| Positions | "What's true that most of your field disagrees with?" "What does holding it cost you?" | |
| Recurring stories | "Which 3 stories do you already tell at dinner?" | |
| Names | Free to name / never name / ask first | |

Whenever they say "recently" or "a while ago", ask "which month?". Dates anchor posts.

## Step 5: Write voice.md

```
# Voice Profile
## Who I sound like        (2-3 plain sentences)
## Tone                    (hits / never hits)
## Sentence rhythm         (lengths, pacing, avoidances)
## Hook patterns           (3-5 with sample examples; absent types)
## How I open / How I close
## Signature phrases
## Off-limits              (words, punctuation, constructions; mark provisional ones)
## What this voice never does (3-5 specific behaviours)
```

Fill every section from the samples. If a pattern isn't there, write "not observed". Don't repeat the audience or pillars from about-me.md.

## Using the voice

Apply preferences in this order: the latest instruction from the user, then the active profile or voice.md, then any brand guide, then the draft's own voice, then neutral defaults (plain text, no hashtags or emoji, no em or en dashes, no hype or bait, the source's own spelling).

Configuring a voice never relaxes the evidence, permission or approval rules.

## Pitfalls

- Inventing patterns that aren't in the samples.
- Borrowing a famous creator's voice and then writing their experiences as the user's.
- Profiles over 500 words. Nobody, including the model, applies 40 rules consistently.
- Saving the voice on install, or without being asked. Only write files when the user requests it.
