> Distilled from: self-learning (Kulaxyz/self-learning-skills, MIT), continuous-learning-v2 (affaan-m/ECC, MIT), find-skills (vercel-labs/skills, MIT), claude-automation-recommender (anthropics/claude-plugins-official, Apache-2.0), using-superpowers (obra/superpowers, MIT)

# Learning from sessions and finding skills

Two directions: capture what this session figured out so the next one starts smarter, and find existing skills before building your own.

## 1. Spot the moment to capture

Any one of these is a cue:
- A task worked only after several attempts, wrong turns or a user correction.
- You learned a project fact you didn't have up front: where creds/env vars live, which command reaches the dev DB, a required order of steps, a gotcha that defies the obvious.
- An operational workflow is likely to recur: deploy, migrate, seed, verify live, tail the right logs, run one specific test path.
- The user says "remember this", "save this as a skill", "don't make me explain this again".

## 2. Triage: skill, memory line, or nothing

| What you learned | Where it goes |
|---|---|
| Multi-step, repeatable procedure | A skill (project scope by default) |
| One fact, path, env var name, one-line correction | `CLAUDE.md` / memory file, one line |
| Unverified hunch | Memory, marked "unverified", or nothing |
| One-off, won't recur | Nothing |

### Promotion rule: no skills from guesses
A skill is trusted without re-checking, so write one only when all three hold:
1. **Passing check**: a test passed, the command exited 0, the build went green. Record which check.
2. **Named failure pattern**: "stale build cache causes phantom type errors", not "sometimes breaks".
3. **At least one ruled-out dead end**, with why it failed.

Missing one? Leave a tentative note or skip.

## 3. Harvest procedure

1. Apply the promotion rule.
2. Pick scope: **project** (`.claude/skills/`, ships via git) when it's about this repo's env, build, schema or quirks; **global** (`~/.claude/skills/`) when it's a personal cross-repo habit. Unsure: project.
3. Dedupe: list both skill directories and the memory index; update an existing skill instead of adding a near-duplicate.
4. Distil from this conversation while it's fresh: exact working commands, paths, env var **names** (never values), required order, and the dead ends.
5. Write it with `templates/self-learning/SKILL.template.md` (it has slots for failure pattern, verification, procedure, gotchas and "what didn't work"). Follow `references/skill-authoring.md` for the description.
6. Tell the user in one line what you captured and where. Harvesting proactively is fine for project notes; ask first before writing to global scope or to a shared team file.

## 4. Automatic learning systems (optional)

Hook-based learners (e.g. continuous-learning-v2) record prompts and tool calls via PreToolUse/PostToolUse hooks, let a background agent extract small "instincts" (one trigger, one action, confidence 0.3-0.9, evidence list), keep them project-scoped by default, and promote to global after the same pattern shows in 2+ projects. Before enabling one:
- Review exactly what the hooks record and where it is stored (prompts can contain secrets).
- Keep instincts project-scoped to avoid one repo's conventions leaking into another.
- Promote an instinct into a skill only through the promotion rule above.

## 5. Use skills that already exist

- Before a task, check the available skills list. If a skill plausibly applies, load it and follow it; process skills (brainstorming, debugging) come before implementation skills.
- User instructions (CLAUDE.md, direct requests) override skills; skills override defaults.
- Skills change: read the current version instead of relying on memory of it.

## 6. Find and install new skills

### Pick a tool (installing)

| Situation | Use | Why |
|---|---|---|
| The user already installs through one route | That route | One place to update and remove |
| It's published as a Claude Code plugin (skills plus hooks, agents or MCP) | `/plugin marketplace add <owner/repo>`, then `/plugin install <plugin>@<marketplace>`; browse the official one in `/plugin` → **Discover** | Versioned updates; review steps in `references/packaging-and-connecting.md` |
| A single skill, or the user also runs Cursor, Codex, Copilot, Gemini CLI or OpenCode | `npx skills add <owner/repo> --skill <name>` (`-a claude-code codex ...` picks agents, `-g` installs for the user instead of the project) | One command writes the skill into each agent's folder |
| No network installer wanted | Copy the reviewed folder into `.claude/skills/` (or `~/.claude/skills/`) | Nothing runs but what you read |

When the user asks "is there a skill for X" or wants to extend capabilities:
1. Identify the domain and the specific task (e.g. "React performance", "PR review").
2. Check well-known sources first: `anthropics/skills`, `anthropics/claude-plugins-official`, `vercel-labs/agent-skills`, `obra/superpowers`, the skills.sh leaderboard.
3. Search: `npx skills find <keywords>` (try synonyms: deploy / deployment / ci-cd).
4. Vet before recommending:
   - Install count: prefer 1k+; be wary under 100.
   - Source: known orgs over unknown authors; repo stars < 100 = extra scrutiny.
   - License present and compatible.
   - **Read the SKILL.md and every script**: look for network calls, telemetry, hooks that record prompts, instructions to disable safety or exfiltrate data.
5. Present: name, what it does, installs and source, install command (`npx skills add <owner/repo@skill>`), link.
6. Install only after the user agrees. Nothing found: say so, offer to do the task directly, or to write a skill.

## 7. Recommend automations for a repo (read-only)

1. Detect stack: `ls package.json pyproject.toml Cargo.toml go.mod`, frameworks in dependencies, test and CI config, existing `.claude/` and `CLAUDE.md`.
2. Recommend the top 1-2 per category, each tied to evidence:

| Signal | Recommend |
|---|---|
| Prettier / ESLint / Ruff config | PostToolUse format/lint hook |
| TypeScript | PostToolUse typecheck hook |
| `.env` or lock files | PreToolUse block-edit hook |
| Popular libraries | Docs MCP (e.g. context7) |
| UI app | Browser MCP (Playwright) for checks |
| GitHub / Linear / Sentry in use | Matching MCP server |
| Auth or payments code | security-reviewer subagent |
| Repeated release / migration steps | user-invoked skill |

3. End with "ask for more in any category". Build only what the user picks (hooks: `references/hooks-and-guardrails.md`; agents: `references/subagents-and-delegation.md`).
