# Outreach and connection messages (sent by hand)

> Distilled from: linkedin-engagement outreach ethics, benchmarks and scripts (alirezarezvani/claude-skills, MIT), lead-intelligence outreach-drafter rules (affaan-m/ECC, MIT), linkedin-outreach message-writing guidance and tone presets (gooseworks-ai/goose-skills, MIT; its automation-tool export is deliberately left out), connections-optimizer review-first defaults (affaan-m/ECC, MIT).

ToS reminder: every message is **drafted here and sent by the account holder, by hand, one at a time**. No auto-connect or auto-message tools (Dripify, Expandi, Waalaxy, PhantomBuster and similar), no CSV exports for them, no bulk sends. Those are HIGH risk under User Agreement section 8.2 ([tos-and-safe-automation.md](tos-and-safe-automation.md)).

## The order that works

1. **Comment on their work for about two weeks**, with substance and in public ([comments-engagement.md](comments-engagement.md)).
2. **Send the invitation**, referencing something specific from that reading.
3. **After they accept, wait.** Then ask once, and keep the ask small.

This converts better than any wording tweak.

## Check volume before writing anything

```bash
python3 scripts/linkedin-engagement/outreach_volume_guard.py --invites 20 --pending 5 \
  --minutes 120 --acceptance 0.42 --output human
```

Exit 0 safe / 2 tight / 3 over a cap or the time budget / 4 refused (more than 40 invitations a day).

Working limits (🟡 observed, not published by LinkedIn):

| Limit | Value |
|---|---|
| Invitations | About 100 a week, **pending ones included**. Clear stale pending invites first |
| Daily manual ceiling | 25 at most; 10-20 is realistic with personal notes |
| Time per invitation | About 5 minutes (read the profile and their work, write the line) |
| Acceptance floor | Below 20% means stop and fix the targeting |
| Withdrawn invitation | Can't resend to the same person for about 3 weeks |

## Character caps

| Message | Cap |
|---|---|
| Connection note | **200 characters free, 300 Premium**. Write to 200 unless Premium is confirmed |
| Message to a 1st-degree connection | Several thousand allowed; keep it to 2-5 sentences |
| InMail | Subject 200, body about 1,900 |

If a draft is over the cap, rewrite it. Don't truncate.

## The person-specific line

Every message needs one line **that couldn't be sent to anyone else on the list**. Test: could this sentence go to the next person? If so, it isn't specific.

Good: something they published (named, and the part that mattered to you); a decision they made that you now face; a respectful disagreement ("your point on X is the opposite of what we found").
Not good enough: "I came across your profile", their job title or company, "as a fellow [category]", praise with no specifics.

## Message types

**Connection note** (200 characters): their thing first, then one clause on why you want to connect. **No ask, no pitch, no link.** In large vendor datasets (🟡) a note barely changes acceptance (about 26% either way) but nearly doubles replies after acceptance (about 5.4% to 9.4%). The note earns the conversation, not the meeting.

**First message after accepting** (wait a few days): one clause of thanks at most, something genuinely useful or a specific observation, and a question. No pitch.

**The ask** (later, only if the conversation is real): one bounded, small ask that can be answered in two sentences, with "no reply needed if you're busy". "Pick your brain" asks for unlimited unpaid time, so don't use it.

**InMail** (for people you can't connect with): it must stand on its own. Explain why this person and why now (the signal), make one ask, and keep it under 1,900 characters.

**Warm intro request to a mutual connection** (60 words or fewer): the ask in one sentence, why it makes sense in one sentence, and an offer of a short forwardable blurb.

**Follow-up**: **one**, at least a week later, **only with something new** (an update, a useful link with nothing attached). "Just bumping this" isn't new. Three-touch drip sequences belong to automation tools. Don't build them.

## Signals worth referencing (from public or consented sources)

| Signal | Angle |
|---|---|
| They're hiring for a role your work relates to | "Saw the [role] opening; the line about [detail] is the problem we..." |
| They spoke at or attended an event you were at | The specific talk or session |
| They published a post or article | The specific claim, and what you found |
| A mutual connection | Ask the mutual for an intro instead of cold messaging |
| Company news (funding, launch) | Only if it genuinely relates to why you're writing |

Where leads come from: [lead-research.md](lead-research.md).

## Phrases to delete

"I came across your profile", "I'd love to pick your brain", "hope this finds you well", "quick question", "just following up", "touch base", "synergy", "I'll keep it short", "as a fellow", "I see we're both in", "let's connect" as the whole reason, "game-changer", "leverage".

## Check each message

```bash
python3 scripts/linkedin-engagement/outreach_message_builder.py --type connection \
  --recipient "Priya" --specific-line "..." --reason "..." --output human
```

It refuses a message with no person-specific line, an ask in a first-touch note, the dead phrases above, and anything over the cap (add `--premium` for 300). For prep, use [../templates/linkedin-engagement/outreach_worksheet.md](../templates/linkedin-engagement/outreach_worksheet.md), one per person (its script paths point to the original plugin; use the command above).

## Output format (per person)

```
TO: <name>  ·  CHANNEL: connection note / DM / InMail / intro via <mutual>
SIGNAL USED: <what specific thing, where it came from>
---
<message, character count>
---
Confidence: high / medium / low (low means "needs a manual personal touch", not faked detail)
```

Hand drafts over for the user to send. Never present them as "ready to import".

## Pitfalls

- Fake familiarity ("loved your talk" without naming the talk).
- Several asks in one message.
- The same copy reused for email, LinkedIn and X.
- Pushing through low acceptance with more volume. That's the pattern LinkedIn reviews.
- When the number of contacts is the goal rather than the people, LinkedIn outreach is the wrong tool. LinkedIn Ads are built for volume and honest about it.
