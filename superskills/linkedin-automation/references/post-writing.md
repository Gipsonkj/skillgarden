# Post writing: hooks, formats, formulas

> Distilled from: linkedin-content (alirezarezvani/claude-skills, MIT), linkedin-skills platform canon (alirezarezvani/claude-skills, MIT), post-writer and hook-generator (charlie947/social-media-skills, MIT), li-post (Jakeschincariol/linkedin-agent-skill, MIT), linkedin-post-writer (sickn33/agentic-awesome-skills, MIT, vendored from sergebulaev/linkedin-skills), linkedin-marketing (sergebulaev/linkedin-skills, MIT), linkedin-content-writer (microsoft/cat-agent-skills, MIT), linkedin-posts (kostja94/marketing-skills, MIT), linkedin-content (openclaudia/openclaudia-skills, MIT).

ToS reminder: draft only. The account holder posts it, or it goes out through the official API after an explicit yes ([tos-and-safe-automation.md](tos-and-safe-automation.md)).

## 1. Get the material before writing

A post needs **one specific true thing**: what happened, to whom, what it cost or returned. If the user gives only a topic ("post about AI"), ask one batched question: *what happened, what number, what would you do differently?* Don't pad around a missing fact.

Before writing, sort the input into three piles: **confirmed facts and stated views**, **constraints** (length, tone, format), and **unknowns**. Facts and attributed claims come only from the first pile. Unknowns stay unknown.

## 2. The numbers (🟡 third-party documented unless noted)

| Item | Value |
|---|---|
| Post hard cap | 3,000 characters |
| Mobile "...see more" fold | ~140 characters (write to this) |
| Desktop fold | ~210 characters |
| Default length | 900-1,300 characters (150-220 words) |
| Long form | 1,500-2,000, only with real payoff and line breaks |
| Under 400 characters | Reads as a note. Fine for a field note or announcement |
| Hashtags | 0-3, at the end. 5+ looks like reach-chasing |
| Links | First comment, with "link in the comments" in the post. A body link costs roughly 20-60% of reach (🟡, contested) |
| Comment cap | 1,250 characters |
| Posting frequency | 2-5 a week. Never 2+ a day (cannibalises) |
| Posting window | Tue-Thu 7:30-9:00 in the audience's timezone (🟡, test it) |
| Edits | Fix typos after the first ~90 minutes. Don't restructure a live post |

## 3. Pick the format from the material, not from fashion

| Format | Good at | Time | Hard rule |
|---|---|---|---|
| Text post | Stories, opinions, single ideas | ~25 min | One idea |
| Document (PDF carousel) | Steps, comparisons, structured data | ~90 min | Every slide stands alone; real PDF with selectable text ([carousels-documents.md](carousels-documents.md)) |
| Single image + text | One chart, one artefact | ~30 min | Alt text that says what the image shows |
| Native video | Demos, personality | ~120 min | Captions, corrected; point made in first 5 s; 30-90 s; vertical |
| Poll | A real decision you will report back on | ~10 min | No poll without a declared decision and a follow-up post |
| Article / newsletter | Durable reference, search-indexed | 150-180 min | Lower reach. Mine it for posts afterwards |
| Comment on someone else's post | Visibility from a standing start | ~6 min | Must add something ([comments-engagement.md](comments-engagement.md)) |
| Repost with a take | Joining a conversation with a position | ~15 min | The take must be more than "this" |

The carousel test: if a reader gets the value from slide 1 plus the caption, it's a text post.

## 4. The shape

```
Line 1   Hook. Alone. A sentence completes inside 140 characters.
Line 2   The payoff of line 1, not setup for line 3.
Body     Blocks of 1-3 lines, blank line between them. Concrete support early.
Turn     One line that reframes what came before.
Close    One specific question OR one instruction OR a clean landing. Never several.
```

Don't write "broetry": six or more one-line paragraphs in a row reads as if formatted for an algorithm.

## 5. Hooks

A hook has three jobs: **finish a thought inside the fold**, **open a specific gap** (the reader can tell what they'll learn), and **signal who it's for**.

Shapes that work:

| Shape | Example | Trap |
|---|---|---|
| Number + reversal | "Our onboarding took 6 weeks. We got it to 4 days without hiring anyone." | Burying the number |
| Mistake / confession | "$18,000 is what not having a contract cost me last March." | A fake-humble mistake |
| Time anchor | "Writing a proposal took me 5 hours. It now takes 20 minutes." | An unbelievable ratio |
| Quoted line | "'We are going with someone cheaper.' That email arrived 40 minutes after my best proposal." | Dialogue nobody said |
| Contrarian | "Everyone says post daily. I posted 4x a week for a year and beat it." | Contradicting a belief nobody holds |
| Decision with a cost | "We deleted the kickoff call. 80% of accounts never needed it." | No cost named |
| Myth bust | "The algorithm is not why your posts are dying." | Never naming the real cause |
| Before / after | "18 months ago I wrote proposals at 2am. Today they take 6 minutes." | Three levers instead of one |
| List promise | "7 things I wish I'd known before my first hire." | N over 10 |
| Curiosity gap | "The best hire I ever made failed the interview." | Not paying it off by line 4 |

Hook rules:
- "How I" beats "How to", but only for real first-person experience. Otherwise use a non-personal, evidence-based angle.
- Put a specific number in the first sentence ($873.47 beats $900), but never a made-up one.
- No question in line 1 unless only this author could ask it.
- If the hook works with someone else's name on it, it isn't this author's hook.
- Delete on sight: "I'm excited/thrilled/humbled to announce", "In today's fast-paced world", "Quick thought:", "Have you ever wondered", all-caps openers, and any first 8 words that could start any post.
- When asked for hooks, give 3-6 options from **different** shapes, keep them to 40-60 characters a line, count the characters, and say which one you'd ship and why in one sentence.

## 6. Choose a structure by what the post should earn

| Goal | Structures |
|---|---|
| Comments | Contrarian + receipts, confession ("N months ago I stopped X"), specific scenario question, permission slip (once a month at most) |
| Saves | Exact how-to, checklist, odd-precision cost ledger, jargon explained plainly, framework |
| Reposts | Named gratitude, "X isn't Y" distinction, era-ending argument with dated evidence |
| Trust | Measurement that changed our mind, decision with the cost attached, field note |

Reusable skeletons (fill only with the user's facts):

**Measurement that changed our mind**: the number nobody believed, then the instinct everyone had, then what we actually measured, then three changes each with a consequence, then the part I got wrong, then a question for someone facing the same measurement.

**Decision with the cost**: "We stopped doing X", then the consequence quantified, then the strongest argument for keeping it, then why it lost, then what it cost us, then "where does this break for you?"

**Teardown**: one artefact (with permission or anonymised), what it gets right, three changes each with the mechanism, the one you're least sure about, then a question.

**Field note** (500-900 characters, for bad weeks): what you did this week, what surprised you, what you'll do differently.

**Transition post**: the specific thing you did in the new field, what carried over from the old field, what you had to learn from zero, then the direction you're heading (not a request).

**Odd-precision ledger**: an exact total, then every line item unrounded, then what it replaces, then what surprised you. The totals must add up.

Don't blend two formulas in one post. Don't promise a public test you won't run. Lead-magnet "comment X to get it" posts are engagement bait: give the artefact away in the post instead.

## 7. Write the body

- Show concrete support early. Keep fact, interpretation and recommendation clearly apart.
- Match certainty to the evidence. No control group means no causal claim. Don't turn "several" into "every".
- Never invent a scene, motive, reaction or plan. Future ideas are possibilities, not "next steps".
- Vary sentence length (3-word and 25-word sentences). Write in active voice.
- Use first person in the user's voice ([voice-building.md](voice-building.md)). Default to the user's spelling convention. Don't add emoji or hashtags they don't use.

## 8. AI-tell scrub (before showing a draft)

Remove or rewrite:
- **Vocabulary** (3 or more in one paragraph means rewrite it): leverage, delve, robust, seamless, crucial, comprehensive, foster, landscape, streamline, unlock, harness, navigate, game-changer, deep dive, move the needle, at the end of the day.
- **Phrases (one is enough to fix)**: "It's not just X, it's Y" and other negative parallels; "The result?", "The kicker?"; "Here's the thing", "Here's what"; "Stop X, start Y"; "let me be honest", "real talk", "unpopular opinion:".
- **Structure**: lists of three without receipts, a motivational summary as the close, an "In conclusion" paragraph.
- **Punctuation**: em and en dashes unless voice.md uses them (then about 1 per 100 words at most); curly quotes from copy-paste.
- **Add human fingerprints**: per ~100 words, at least one specific number, one named entity, and one concrete first-person detail, all from the user's material.

## 9. Lint, then hand over

```bash
python3 scripts/linkedin-content/post_linter.py --input draft.md --output human   # add --has-image if relevant
```

Exit 0 SHIP / 2 REVISE / 3 REWRITE. Blocking findings: over 3,000 characters, engagement bait, Unicode pseudo-bold. The linter doesn't catch everything (a bare "Thoughts?" can pass), so read the close yourself.

Final edit pass: (1) cut the first paragraph and see if the post starts better at paragraph two; (2) read the first 140 characters on their own; (3) read it aloud.

Output: the post in a plain code block exactly as it should be pasted, then the character count, the hook shape used, the first-comment text (link or source), alt text if there's an image, and a suggested window. Allow at most 3 revision rounds.

## 10. Repurposing

Split a talk, article or README into standalone units of 240-2,400 characters. Each needs evidence and at least 3 real sentences, and no dangling references ("As we saw above..."). Every unit is raw material: the author still adds the sentence only they can write (what it cost, what they assumed, what they'd do differently). Keep a simple ledger of posted units (date and first line) so the same idea doesn't go out three times in eight months. One strong source can feed about a month of posts, not a quarter.

## Pitfalls

- Choosing a formula by its headline engagement number. Reference numbers from different corpora measure different things.
- "Pure insight" with no stakes. Include one real moment of cost or uncertainty.
- Tagging people for reach. Only tag people who were genuinely involved.
- Framing LinkedIn as inferior inside a LinkedIn post.
