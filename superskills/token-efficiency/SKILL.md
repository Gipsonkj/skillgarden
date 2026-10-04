---
name: token-efficiency
description: Spend fewer tokens and less money with Claude and other LLMs without losing quality, in Claude Code or agent sessions and in apps that call an LLM API. Covers session hygiene (/clear vs /compact, reading file ranges, subagents that return short results); model and effort choice per task, cascades and routing; per-turn overhead from MCP tools, skills and CLAUDE.md, and compressing memory files; terse output (caveman mode) and when not to use it; prompt caching that actually hits; batch, semantic caching and max_tokens; retrieval vs long context; measuring usage and cost (usage fields, ccusage, cost per task) and staying within 5-hour or weekly plan limits. Triggers: "caveman mode", "use fewer tokens", "why did I hit my Claude limit", "where did my tokens go", "my context fills up too fast", "cut our LLM API bill", "cache_read_input_tokens is 0", "cheapest model for this", "compress my CLAUDE.md". Building the agent itself: ai-agents. CLAUDE.md, hooks and skills: claude-meta.
---

# Token efficiency

Spending fewer tokens and less money with Claude and other LLMs while keeping the quality of the work, in two places: Claude Code and agent sessions (what goes into the window, which model does what, plan limits) and apps that call an LLM API (caching, batch, routing, output length, measurement). This is a router. Name the task (or say "use token-efficiency: <capability>") and read the matching guide; each guide is self-contained. Writing CLAUDE.md, hooks and skills well is `claude-meta`; building agents is `ai-agents`.

## Core principles

1. **Measure first.** `/context`, `/usage`, usage fields, local logs. No baseline, no change; the first deliverable in an unmeasured app is per-request logging.
2. **Cost per completed task, not per token.** A cheap call that fails bills its tokens, the retry and the fallout. Read pass rate and cost together.
3. **Input dominates agentic cost.** Everything in context is re-sent every turn: a 20K-token read early in a 200-request session is ~4M tokens of cache reads. Cut what goes in before cutting words that come out.
4. **Free wins before trade-offs.** Caching, context hygiene, batch and output shape first; then effort; model choice last. Trade-offs are proposed with their measured quality cost and applied only when the user accepts.
5. **Stable first, volatile last.** One changed byte invalidates the cache after it. Verify hits from the usage fields (`cache_read_input_tokens` or `cached_tokens`), never from reading code.
6. **Every always-loaded token is paid every turn.** MCP tool schemas (heuristic ~500 tokens per tool), skill and agent descriptions, CLAUDE.md. Remove, defer or shorten them.
7. **Compact at phase boundaries, after writing state to a file; `/clear` between unrelated tasks.** Never compact mid-implementation; compact at 70-80% of the window, not at the limit.
8. **Strong model for judgment, cheaper workers for bulk.** Subagents return `path:line` evidence, not prose; their reports are leads to verify.
9. **Effort before model, and switch between conversations, not inside one.** Caches are per model; a mid-conversation switch re-writes the whole context.
10. **Terse output keeps every fact.** Its measured saving is modest (about 3% versus "Answer concisely." in the caveman repo's own single run); write in full for security, irreversible steps and anything persisted.
11. **Figures carry a date.** Model ids, prices, cache minimums and plan limits change: describe the method, quote numbers "as of <source, date>, check current pricing", and never invent a price.
12. **Measurement stays local.** Use local logs and official APIs; no telemetry CLIs, no `curl | bash` installers, no uploading transcripts. Only redacted summaries are shareable, and sharing is the user's call.

Where sources disagreed: llm-cost-optimizer puts model routing first (biggest percentage), the claude-api notes put caching first and model choice last. This craft orders by risk: caching and hygiene first because they cost no quality, routing early only for endpoints that are clearly simple, everything else measured. Caveman's README and older posts claim large savings; this craft quotes the repo's own measured run instead.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Halve the support bot's API bill: `references/measuring-usage.md` → `references/prompt-caching.md` → `references/claude-api-levers.md` → `references/api-cost-patterns.md`; the spend dashboard from `data-analysis` → `references/dashboards-kpis.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Claude Code or agent session burns tokens: /clear vs /compact, phase boundaries, reading less, subagents with compact returns, stale tool output | [references/session-hygiene.md](references/session-hygiene.md) |
| Which model and effort for which task; orchestrator plus cheap workers; cascades and routers; effort sweeps | [references/model-and-effort.md](references/model-and-effort.md) |
| Context full before you start: MCP tool schemas, deferred tools, skill and agent descriptions, CLAUDE.md and memory size; compress a memory file safely | [references/fixed-overhead.md](references/fixed-overhead.md) + `scripts/caveman-compress/validate.py` |
| Terse or caveman mode: rules, when not to use it, subagent return formats, output length in API apps | [references/terse-output.md](references/terse-output.md) |
| Prompt caching for any provider: is it worth it, prefix order, silent cache killers, verifying hits, write premium, CI guard | [references/prompt-caching.md](references/prompt-caching.md) + `scripts/audit-prompt-caching/` |
| Claude API specifics: `cache_control`, TTLs, keep-alive, cache breakers, `count_tokens`, tool search, compaction, Batches, effort | [references/claude-api-levers.md](references/claude-api-levers.md) |
| API app patterns: batch, routing code, budgets and degradation, narrow retries, exact and semantic response caching | [references/api-cost-patterns.md](references/api-cost-patterns.md) |
| Measure usage and cost: Claude Code logs, where tokens went, API request logging, cost per completed task, bill regressions | [references/measuring-usage.md](references/measuring-usage.md) + `scripts/tare/` |
| 5-hour and weekly plan limits: check before big runs, bounded waves, pause and resume, diagnose a hit limit | [references/usage-limits.md](references/usage-limits.md) |
| Retrieval vs long context (CAG vs RAG), narrow retrieval, window budgets, masking and compaction, prompt compression | [references/retrieval-and-compression.md](references/retrieval-and-compression.md) |

To use one capability directly, name the task, or say "use token-efficiency: <capability>" (for example "use token-efficiency: why did I hit my limit").

## Bundled scripts (stdlib Python, local files only, no network)

| Script | Does | When |
|---|---|---|
| `scripts/tare/ccaudit.py` (+ `ccreport.py`) | Parses `~/.claude/projects/**/*.jsonl`: tokens by day, model, project, session, tool and file (amplified), findings, HTML, CSV, redacted share summary | "Where did my tokens go", limit diagnosis; run `--dump-sample` and check dedupe first |
| `scripts/tare/forensics.py` | Reads the ccaudit CSV: spikes, session shape, concurrency, 5-hour window load at a time | After `ccaudit.py --csv`, for "why did I hit the limit" |
| `scripts/audit-prompt-caching/analyze_usage_logs.py` | Cache hit ratio, write/read ratio, output share from JSON, JSONL or CSV usage logs, with accounting checks | Verifying caching in an API app |
| `scripts/audit-prompt-caching/prefix_stability_check.py` | First differing byte between two rendered prompts or request bodies; exit 1 on drift | Finding a cache killer; CI guard |
| `scripts/audit-prompt-caching/estimate_cache_roi.py` | Savings from hit rate, write rate and prices you pass in | Before adding or changing caching |
| `scripts/caveman-compress/validate.py` | Checks a compressed memory file kept headings, code blocks, URLs, paths, bullets and inline code | After compressing CLAUDE.md or notes |

`ccaudit.py` weights tokens with an editable `MODEL_RATES` table whose shipped values are placeholders; update it from current prices or compare by tokens. Read a script before changing more than its arguments.

## Other crafts

| When the request also needs | Use |
|---|---|
| Writing or auditing CLAUDE.md, planning files or a handoff for a long task (beyond trimming it for tokens) | `claude-meta` → `references/claude-md-and-rules.md`, `references/context-and-memory.md` |
| Subagent definition files, or a hook that nudges compaction or blocks noisy commands | `claude-meta` → `references/subagents-and-delegation.md`, `references/hooks-and-guardrails.md` |
| Building the agent, its tools, memory or retrieval layer (not just cutting its cost) | `ai-agents` → `references/tool-design.md`, `references/context-and-memory.md`, `references/claude-platform.md` |
| An eval set that proves a cheaper model, effort or prompt keeps quality | `ai-agents` → `references/evaluation.md` |
| A spend dashboard or KPI set built from usage logs | `data-analysis` → `references/dashboards-kpis.md`, `references/sql.md` |
| Spend alerts, tracing, or a CI job that fails when the prompt prefix drifts | `cloud-devops` → `references/observability.md`, `references/ci-cd.md` |
| A Redis or Postgres response cache in the backend | `backend-databases` → `references/backend-architecture.md`, `references/nosql-analytics.md` |
| Storing the API and admin keys used for usage reports | `security` → `references/secrets.md` |
| Checking the cheaper setup still passes before calling it done | `coding-practices` → `references/verification.md` |
| Running a local or open-weight model to cut API spend | `open-models` → `references/choosing-models-and-licences.md`, `references/local-inference.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| Cache rules for 20+ providers and gateways, vLLM/SGLang KV reuse, a layout linter and audit report renderer | [audit-prompt-caching](https://github.com/sernote/audit-prompt-caching/tree/main/audit-prompt-caching) (MIT; three of its scripts are bundled here) |
| Current Claude model ids and prices, and an eval-gated cost-optimize workflow for Claude API code | [claude-api](https://github.com/anthropics/skills/tree/main/skills/claude-api) (Apache-2.0) |
| A CLI that compresses a memory file through Claude, validates it and retries | [caveman-compress](https://github.com/JuliusBrussee/caveman/tree/main/skills/caveman-compress) (Apache-2.0; calls only the Anthropic API or the `claude` CLI; only its validator is bundled) |
| Ready-made search, edit and review subagents with compressed return formats | [cavecrew](https://github.com/JuliusBrussee/caveman/tree/main/skills/cavecrew) (Apache-2.0; needs the plugin's agent files; skip the repo's CLI, which sends telemetry by default) |
| LLM cost questions in PostHog: HogQL recipes, trace cost, dashboards and alerts | [exploring-llm-costs](https://github.com/PostHog/skills/tree/main/skills/omnibus/exploring-llm-costs) (MIT; needs PostHog LLM analytics and its MCP tools) |
| Redis LangCache SDK and REST calls for a hosted semantic cache | [redis-semantic-cache](https://github.com/redis/agent-skills/tree/main/skills/redis-semantic-cache) (MIT; preview service that stores prompts and responses on Redis Cloud) |
| A ccusage-based report comparing two models' token and cost burn over a date range | [claude-usage-analyst](https://github.com/daymade/claude-code-skills/tree/main/daymade-claude-code/claude-usage-analyst) (MIT; needs ccusage from npm) |
| Sibling context-compression and degradation skills and a compaction code sample | [context-optimization](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/context-optimization) (MIT) |

## Default workflow

1. **Locate the spend.** Claude Code session, plan limit, or an API app? Which model, which feature, since when?
2. **Measure.** `/context` and `/usage`, `ccaudit.py`, or per-request usage logs. State scope, dates and timezone. If an API app has no logging, adding it is step one.
3. **Find the driver.** Amplified tool output, fixed overhead, fresh-session cache writes, a premium model, cache misses, output length or volume. Lead with it in one sentence.
4. **Apply free wins** from the matching guide: hygiene, overhead cuts, caching layout, batch, output shape.
5. **Propose trade-offs** (effort, model tier, budgets, compression) with the quality risk and how to measure it; apply only on the user's yes.
6. **Re-measure the same way** and compare cost per completed task and quality.
7. **Report** the saving with how it was measured, what was not checked, and every price or limit with its source date.

## Done means

- [ ] A baseline and an after measurement exist, from the same source
- [ ] The main driver named with evidence (numbers, not impressions)
- [ ] Quality checked: tests, eval or spot-checks; no silent quality trades
- [ ] Caching changes verified from usage fields on a repeated request
- [ ] No price, model id or plan limit stated without its source and date
- [ ] Persisted text (code, commits, docs, memory files) written in full sentences; compressed files validated
- [ ] No telemetry tools or `curl | bash` installers recommended; transcripts and keys stayed local
