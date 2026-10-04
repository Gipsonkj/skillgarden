# Staying within plan limits

> Distilled from: stay-within-limits and efficient-fable (BuilderIO/skills, MIT), tare (kelviq/tare, MIT), claude-usage-analyst (daymade/claude-code-skills, MIT)

Subscription plans for Claude Code meter usage in a rolling 5-hour window plus a weekly cap (as of the sources; plan rules change, so check your plan's current terms and `/usage`). There is no daily limit: "my daily limit" almost always means the 5-hour window. The window is rolling, so it does not reset when you walk away: work from earlier in the window still counts.

## 1. Before a big run

1. Check where you are: `/usage`, or `npx ccusage@<version> blocks --active --json` (active block start, usage, time remaining), or `python3 scripts/tare/forensics.py <csv> --at <now>` for load in the current window.
2. If the window is already at 60%+, a short heavy session hitting the cap is expected, not a fault. Start the big run after it clears, or run the cheap parts first.
3. Estimate the run: how many parallel agents, how long, which model. Fan-out multiplies usage roughly by the number of agents, each paying its own context.
4. Pick the cheapest setup that works: strong model as orchestrator only, cheaper subagents for bulk (`model-and-effort.md`), lean context (`session-hygiene.md`, `fixed-overhead.md`).

## 2. Run in bounded waves

1. Launch a wave of at most 3 parallel subagents (default; use the user's or host's throttle if given).
2. Let the wave finish. Don't kill in-flight agents to save budget: that usually loses the work and its tokens.
3. Check usage between waves.
4. If either the 5-hour or weekly window is at or above 95%, stop launching work.
5. Some users set an earlier caution threshold; treat that as their setting, not a universal rule.

## 3. Pause and resume safely

When a window is near the cap and the host has a wake or schedule tool:
- Schedule the resume for `min(3600, seconds until the window clears)`. If wake delays are capped (for example 60-3600 seconds), chain wakeups; each one re-checks and reschedules if still over.
- **On wake, re-check the real window.** Compare the active block's start timestamp with the previous one; a new block is stronger evidence than "enough time passed".
- **Make the wake prompt self-contained:** remaining plan; the 95% rule and wave size; the exact usage command; the previous block id; next verification steps; and the next wave's briefs (scope, verification commands, stop conditions). The resumed session must not depend on chat memory. Write the same state to a file in the project.
- A cache miss after a long pause is acceptable; protecting the window matters more.
- Don't poll in a tight loop for things the host notifies you about (subagent completion, background tasks).
- Use cron or recurring schedules only for recurring fresh-session work, not for resuming one task.

If no wake tool exists: write state to a file, tell the user which window is over, the observed usage, when it should clear, and what remains.

## 4. Habits that stretch a plan

| Habit | Why |
|---|---|
| `/clear` between unrelated tasks | Stops re-sending dead context every turn |
| Lean MCP and skill set | Fixed overhead is paid on every turn of every session |
| Top model for judgment only | Premium models draw down the shared cap much faster per token |
| Cheaper subagents for scans, tests and logs | Bulk work at a lower rate |
| Lower effort for routine work | Less thinking and fewer tool calls |
| Batch unattended jobs into one session | Many fresh sessions each pay a full cache write |
| Avoid resuming a huge session after a long break for new work | The cache expired; the whole context is written again |
| Check for automation you forgot | Scripts, CI jobs, editor extensions or watchers using Claude Code in the background |

## 5. When a limit was hit: diagnose

Ask which limit (5-hour or weekly) and roughly when. Then follow `measuring-usage.md` sections 3-4: daily table for a step change, window load at that time, session shape, tool attribution. Report the cause in one or two sentences first. If local data shows nothing disproportionate, say so; don't invent a cause and don't call it a bug.

## Checklist

- [ ] Usage checked before starting and between waves
- [ ] Waves of at most 3 agents unless told otherwise; stop at 95%
- [ ] Resume prompt and state file self-contained; window re-checked on wake
- [ ] User told which window, observed usage, expected clear time and remaining work
