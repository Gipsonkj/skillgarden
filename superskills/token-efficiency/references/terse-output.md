# Terse output modes (caveman-style)

> Distilled from: caveman and cavecrew (JuliusBrussee/caveman, Apache-2.0), chisle (JayPokale/Chisle, MIT), llm-cost-optimizer (alirezarezvani/claude-skills, MIT). The caveman skills' text was used; the repo's separate CLI/proxy was not (see "What not to install").

Terse mode means: keep every technical fact, drop the ceremony. It is a voice, not broken grammar. The reader pays per token and often reads in a terminal; every word earns its place and every fact survives.

## 1. Know what it saves (and what it doesn't)

- It only touches **output** tokens. In agentic coding most tokens are input: context re-sent each turn and tool output. Terse prose barely moves that bill; `session-hygiene.md` and `fixed-overhead.md` do.
- The caveman repo measured its own default mode once (claude-opus-5-5, ten prompts, single run, output length only): about **3% fewer output tokens than a plain "Answer concisely." instruction**, inside the noise. Its harder "ultracave" mode measured about 35% fewer. No quality-equivalence claim is published. Treat bigger claims elsewhere with care.
- So the honest pitch: a one-line "answer concisely" instruction gets most of the gain; a terse mode adds consistency and readability rules on top, and real savings come from what it stops (preambles, recaps, decorative tables, narration between tool calls).
- Thinking is billed like output. A terse answer after a long internal draft saves little; lower effort is the lever for reasoning (`model-and-effort.md`).

## 2. The rules

1. **Answer first,** then the reason, then the next step: `[thing] [action] [reason]. [next step].`
   - Not: "Sure! I'd be happy to help. The issue you're experiencing is likely caused by..."
   - Yes: "Bug in auth middleware. Expiry check uses `<` not `<=`. Fix:"
2. **No ceremony:** no greeting, hedging, pleasantries, recap or closer. No "Sure!", "Let me", "I'll now", "Hope this helps". No just, really, basically, actually, simply.
3. **Short words:** "fix" not "implement a solution for". Standard acronyms fine (DB, API, HTTP). Invented abbreviations not (cfg, impl, fn): same tokens, harder to read.
4. **Articles optional, meaning never.** Drop a/an/the only where the sentence still reads in one pass. Never drop not, never, no, only, except. Numbers and units exact.
   - Not: "Migration drop column backup first."
   - Yes: "Back up first. Then run migration: it drops the column."
5. **One idea per sentence,** 20 words max, active voice, imperative for instructions, one term per thing. When compression and clarity conflict, clarity wins.
6. **Payload verbatim:** code blocks unchanged; commands, paths, API names and errors exact (quote the shortest decisive line of an error).
7. **Structure is tokens:** no headings, bullets, tables or recaps the question didn't ask for. "Compare X vs Y": the decisive trade-offs in prose, a verdict, stop.
8. **Tool runs: bounded status.** One line before a multi-step run, one per phase change, one with the result. No narration between routine calls.
9. **Never perform it:** no "caveman mode on", no "me think", no prefix, no normal answer followed by a terse copy. If the terse phrasing isn't shorter than plain, use plain.
10. **Keep the user's language.** Compress style, not language; technical terms stay verbatim.

## 3. When to write in full

Switch to plain full sentences for, then resume:
1. Security warnings.
2. Irreversible actions: confirm in full first.
3. Steps where order matters and a fragment could scramble it.
4. A confused user, or one who repeats the question.
5. Anything persisted outside the chat: code, comments, commit messages, docs, PRs, tickets, memory files, messages to other people. (Compressing a memory file on purpose is the exception: `fixed-overhead.md` section 4.)
6. The harness asks for a status line or confirmation: give it.

Don't use terse mode at all for teaching a beginner, for writing meant for an audience, or when the user asked for explanation.

## 4. Pre-send check

1. Does the first sentence announce what you will do? Delete it.
2. Does the last sentence recap or offer help? Delete it.
3. Is every not, never, no and only still there? Every code span, path, number and error verbatim?
4. Any sentence with two readings? Make it a full sentence.

## 5. Turning it on and off

- On: "caveman mode", "be brief", "less tokens", "terse mode", "no fluff". It stays on for the whole session until "normal mode" or "stop caveman". If unsure whether it is still on, it is.
- Off: confirm in one line.
- Harder levels exist (fragments only; one word where one word is enough). Use them for your own terminal reading, never for anything another person reads.
- For a whole team or project, one line in CLAUDE.md ("Answer first. No preamble or recap. Code, paths and errors verbatim.") is cheaper than a mode, and it is always on.

## 6. Terse subagent returns

Compressed formats matter most where output becomes someone else's input: a subagent's report is injected verbatim into the main context.
- Search: `path:line - symbol - note`, then `totals: N`. Or `No match.`
- Edit: `path:line-range - change (10 words max). verified: re-read OK | mismatch @ path:line.` Or a single status word: `too-big.` / `needs-confirm.` / `ambiguous.`
- Review: `path:line: severity: problem. fix.`, sorted by file then line. Or `No issues.`

If a human will read it directly, paraphrase it into plain prose first.

## 7. In API apps: output length is a setting, not a mood

- Specify the output shape in the prompt, ideally with an example ("Respond in 3 sentences or fewer", a JSON schema with defined fields). Structured output beats free text.
- `max_tokens` is a backstop the model never sees. Set it per endpoint from measured p95 output length, not one global value. Hitting it cuts the answer mid-thought and usually forces a retry, so treat `stop_reason: max_tokens` as a failure.
- Stop sequences: give list and structured outputs a terminator, and give the model a sentinel to emit when it cannot proceed (for example `<CANNOT_ANSWER>`) so it stops instead of explaining.

## 8. What not to install

The caveman repo also offers a CLI/proxy (setup, discover, optimize commands). As of the source review it sends usage telemetry by default, has a managed mode that tags requests with repo and branch, and its README offers a `curl | bash` installer. This craft uses the skills' content only. Don't recommend or install that CLI. If a user already runs it, point them to its telemetry opt-out (`DO_NOT_TRACK=1`) and let them decide.

## Checklist

- [ ] User knows the expected saving is modest unless output dominates their spend
- [ ] Every fact, negation, number, code span and error survived
- [ ] Full sentences for security, irreversible steps, ordered steps and anything persisted
- [ ] For API apps: output shape specified, `max_tokens` per endpoint from p95, stop sequences set
