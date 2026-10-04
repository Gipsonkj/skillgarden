# Fixed per-turn overhead: tools, skills, CLAUDE.md and memory

> Distilled from: context-budget and strategic-compact (affaan-m/ECC, MIT), caveman-compress (JuliusBrussee/caveman, Apache-2.0), claude-api cost-optimization notes (anthropics/skills, Apache-2.0)

Before you type anything, a Claude Code session already carries a system prompt, every tool schema, every skill and agent description, and the CLAUDE.md chain. That block is re-sent on every turn of every session. It is usually cached, so the dollar cost per turn is modest, but it takes window space, counts toward plan limits, and is paid in full on the first turn of every new session and subagent.

## 1. What loads every turn

| Component | Loaded | Typical weight | Lever |
|---|---|---|---|
| MCP tool schemas | Every turn, unless deferred | Heuristic ~500 tokens per tool; a 30-tool server can outweigh all your skills | Remove unused servers; defer tools; prefer a CLI the agent already has |
| Skill names + descriptions | Every turn (bodies load on demand) | 1 line each, but 100 skills add up | Uninstall unused skills; keep descriptions tight |
| Agent (subagent) descriptions | Every turn | Descriptions over ~30 words are bloat | Trim descriptions; delete unused agents |
| CLAUDE.md chain (user, project, nested) | Every turn | Combined over ~300 lines is heavy | Cut, move detail behind "read X when Y" pointers |
| Rules and memory files | Every turn when auto-loaded | Duplicates of CLAUDE.md are common | Dedupe; compress prose (section 4) |
| Conversation and tool results | Grows | Usually the largest part | `session-hygiene.md` |

Thresholds are the context-budget skill's heuristics, not tokenizer counts. Confirm with real numbers (section 2).

## 2. Measure before cutting

1. **In Claude Code, run `/context`.** It shows what the current session actually loads, by category. This beats any estimate. `/usage` (alias `/cost` in recent versions, check yours) shows spend and plan usage.
2. **Inventory what is configured:** `.mcp.json` and user MCP config (servers, tool count per server), `~/.claude/skills/` and project `.claude/skills/`, `agents/`, every CLAUDE.md and rules file in the chain.
3. **Estimate where `/context` can't reach** (files on disk, a planned addition): prose words x 1.3, code-heavy files characters / 4, MCP ~500 tokens per tool. For an exact count of a prompt on the API, use the provider's token-counting endpoint, not `tiktoken` (a different tokenizer).
4. **Bucket every component:** always needed (referenced in CLAUDE.md, backs a command you use, matches this project), sometimes needed (load on demand), rarely needed (remove).
5. **Report** total overhead, the top 3 cuts with estimated savings, and what you didn't check.

Example finding from the source: 87 MCP tools (~43K tokens) of a ~63K overhead; removing three servers that wrapped CLIs already on the machine (`gh`, `git`, `npm`) saved ~27K tokens.

## 3. Cut the overhead

**MCP servers and tools (biggest lever)**
- Remove servers you haven't used this week. Disable per project rather than globally where your client allows.
- Flag servers with more than ~20 tools and servers that wrap a CLI the agent can run directly.
- **Defer tool schemas.** Claude Code can keep MCP tool schemas out of the prefix and load them on demand through tool search (names listed, schemas fetched when needed). Check that it is on in your version and confirm with `/context`. On the API the same idea is tool search with `defer_loading` on rarely used tools; it pays once schemas pass roughly 10K tokens (as of the claude-api notes, Oct 2026). Never defer every tool: at least one must stay loaded.
- Prefer narrow tools with `limit`, `fields` and date-range parameters over "get everything" tools: their results are the other half of MCP cost.

**Skills and agents**
- Uninstall skills you never trigger; duplicates in two skill folders count twice.
- Descriptions say scope and triggers in one tight paragraph. Writing good descriptions is `claude-meta` work; this craft only says "shorter, and remove the unused".
- Keep agent files under ~200 lines; the body is loaded on every spawn.

**CLAUDE.md, rules and memory**
- Every line must be project-specific and change behaviour. Delete generic advice the model already follows.
- Remove rules duplicated across `~/.claude/` and the project, and rules that repeat a skill.
- Move long procedures into a skill or a doc and leave a one-line pointer: "Before a deploy, read `docs/deploy.md`."
- Trigger-table lazy loading: map keywords to files ("test, tdd, coverage" -> `docs/testing.md`) so detail loads only when relevant.
- Auditing and rewriting CLAUDE.md for quality: `claude-meta` -> `references/claude-md-and-rules.md`.

## 4. Compress a memory file safely

For prose files loaded every session (CLAUDE.md, preference notes, todo lists), terse prose can cut the file roughly in half. The caveman-compress fixtures averaged 46% fewer tokens (range 37-60%) on five sample files; those are counted tokens on fixtures, not measured billing savings, and structural checks passing does not prove the meaning survived.

Steps:
1. **Back up the original outside any auto-loaded folder** (not `CLAUDE.original.md` beside it, or the loader may read both). For example `~/.local/share/compress-backups/<project>/CLAUDE.md`.
2. **Rewrite the prose only.** Remove: articles where the sentence still reads, filler (just, really, basically), pleasantries, hedging ("it might be worth"), "you should / make sure to / remember to", redundant phrasing ("in order to" -> "to"). Merge bullets that say the same thing. Keep one example where several show the same pattern.
3. **Copy exactly, never touch:** fenced and inline code, URLs, file paths, commands, env vars, version numbers, dates, numbers, proper nouns, library and API names, every heading's text, list nesting and numbering, table structure, YAML frontmatter.
4. **Never drop a negation or a qualifier:** not, never, no, only, except, unless. A dropped "not" costs more than every token saved.
5. **Validate structure:**
   ```bash
   python3 scripts/caveman-compress/validate.py <backup-original.md> <compressed.md>
   ```
   It checks headings, code blocks (and their order), URLs, paths, bullets and inline code were preserved. Fix every error; read the warnings.
6. **Read the diff for meaning.** Rules that depended on nuance ("prefer X unless Y, because Z") must still say Y. Security rules and irreversible-action rules stay in full sentences.
7. **Edit the readable original later, then re-compress;** don't hand-edit the compressed copy into drift.

Only compress natural-language files (.md, .txt). Never compress code, JSON, YAML, TOML, `.env` or lock files.

Before:
> You should always make sure to run the test suite before pushing any changes to the main branch. This is important because it helps catch bugs early and prevents broken builds from being deployed to production.

After:
> Run tests before push to main. Catches bugs early, prevents broken prod deploys.

## 5. Pitfalls

- Adding "just one more" MCP server per week until a third of the window is tool schemas.
- Measuring with word counts while `/context` is one command away.
- Compressing a file and losing an "unless" that mattered.
- Leaving the backup beside the live file so both get loaded.
- Editing CLAUDE.md or the tool list in the middle of a long session: on the next session start it is cheap, but in an API agent it invalidates the cache from that point.

## Checklist

- [ ] `/context` (or a token count) taken before and after
- [ ] Unused MCP servers, skills and agents removed; heavy servers deferred or replaced by CLIs
- [ ] CLAUDE.md chain deduplicated, detail moved behind pointers
- [ ] Compressed files backed up out of tree, validated, and read for meaning
- [ ] Report gives savings with how they were measured
