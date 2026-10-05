---
name: feedback
description: Leave feedback on how a Skill Garden super skill or the superseed planner did in this session, so the weekly scout can fix it. Writes a short note (which crafts and guides were used, what went wrong or right, the user's words, an optional 1-5 rating), shows it, saves it on this computer and, only if the user says yes, sends it to Skill Garden. Also switches the opt-in usage log on or off and shows what it recorded.
argument-hint: "[what went wrong or right] | usage on | usage off | usage stats | status"
disable-model-invocation: true
---

# Skill Garden feedback

The script is `scripts/feedback.mjs` in this skill's folder (the base directory shown when this skill
loaded). Below, `FB` means `node "<that folder>/scripts/feedback.mjs"`. It needs Node 18 or newer.

The user typed: `$ARGUMENTS`

## Switches and stats

If that is `usage on`, `usage off`, `usage stats` or `status`, run `FB <the same words>`, explain the
result in two or three plain sentences and stop.

- `usage on` starts a private log on this computer: for every session that uses a Skill Garden skill,
  it records which skills fired, which guides were read, the number of prompts and the tokens used,
  updated after each reply. Never the prompts themselves, never files. It is never sent anywhere.
- `usage stats` shows, per craft, how often it fired, how often it fired but no guide was read, which
  guides were read and the typical token cost.

## Leave a note

1. Run `FB session`. It returns what this session used: crafts (`fired` = times the skill loaded,
   `guides` = guide files read), prompts, minutes, tokens and model.
2. If the user gave no words, ask one short question: what went wrong (or right), and a rating from 1
   to 5 if they want to give one. Don't ask anything else.
3. Draft the note from this conversation and their words:
   - `problem`: one of `worked-well`, `wrong-craft` (the wrong skill or none was used), `wrong-guide`
     (right skill, wrong guide), `guide-missing` (the guide lacked what the task needed),
     `guide-wrong` (the guide's advice was wrong or out of date), `too-slow` (too many steps or
     tokens), `other`.
   - `task`: one generic line, such as "hero image for a bakery landing page".
   - `detail`: what happened, specifically: which guide (by file name) said what, what the result
     lacked, what fixed it. This is what the scout acts on, so be concrete.
   - `words`: the user's own words, as they wrote them.
   - `rating`: 1-5 or null.
   - Keep out secrets, keys, file contents, personal details, client or company names and anything the
     user wouldn't post publicly. Generalise instead ("a client's bakery", not its name).
4. Show the note as a short block (problem, rating, task, detail, words, crafts and guides) and let the
   user correct it.
5. Save it:
   ```bash
   FB save <<'EOF'
   {"problem": "...", "rating": null, "task": "...", "detail": "...", "words": "..."}
   EOF
   ```
   The script adds the crafts, guides, prompts and tokens itself. The answer has the saved note's `id`,
   `wouldSend` (exactly what would leave this computer) and `askToSend`.
6. If `askToSend` is false, this is the Skill Garden owner's computer: say the local app picks the note
   up for the next scout run, and stop.
7. If `askToSend` is true, ask, word for word: "Send this note to Skill Garden so it can improve these
   skills? It goes to skillgarden.gipsonkj.workers.dev and contains only what's shown above (no
   prompts, files or session id)." Only on a clear yes run `FB send <id>`. On anything else, say the
   note stays only in `~/.claude/skillgarden/feedback.jsonl` and stop. Never send without asking, and
   never send a note the user hasn't seen.
8. If `FB status` shows `usageLog: false`, mention once, in one line, that `/skillgarden:feedback usage on`
   keeps a private log of which skills and guides get used.
