# Credits

The router and references are written in this skill's own words from the licensed sources below, checked against the Claude API notes in Anthropic's `claude-api` skill (copy bundled with Claude Code, model table cached 25 Sep 2026). Scripts are copied unchanged with their licence beside them. Figures (prices, cache minimums, multipliers, plan limits, measured savings) are quoted as of their source and date; check current docs before relying on them.

## Sources used

| Source | Repo | Licence | What was used |
|---|---|---|---|
| caveman | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman/tree/main/skills/caveman) | Apache-2.0 | Terse-mode rules, auto-clarity cases, pre-send check, the repo's own measured result (terse-output.md) |
| caveman-compress | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman/tree/main/skills/caveman-compress) | Apache-2.0 | `validate.py` copied to `scripts/caveman-compress/`; compression rules, out-of-tree backup, fixture figures (fixed-overhead.md) |
| cavecrew | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman/tree/main/skills/cavecrew) | Apache-2.0 | When to delegate, subagent return contracts (session-hygiene.md, terse-output.md) |
| context-budget | [affaan-m/ECC](https://github.com/affaan-m/ECC/tree/main/skills/context-budget) | MIT | Overhead inventory, heuristics and thresholds, buckets, report shape (fixed-overhead.md) |
| strategic-compact | [affaan-m/ECC](https://github.com/affaan-m/ECC/tree/main/skills/strategic-compact) | MIT | Compaction decision table, what survives, todo-tool caveat, trigger-table lazy loading |
| cost-aware-llm-pipeline | [affaan-m/ECC](https://github.com/affaan-m/ECC/tree/main/skills/cost-aware-llm-pipeline) | MIT | Routing by complexity, immutable cost records, narrow retries (api-cost-patterns.md, model-and-effort.md). Its price table was not copied |
| context-optimization | [muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/context-optimization) | MIT | Masking, compaction targets, cache-friendly ordering, window budgets, partitioning thresholds (retrieval-and-compression.md, prompt-caching.md) |
| llm-cost-optimizer | [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills/tree/main/engineering/llm-cost-optimizer/skills/llm-cost-optimizer) | MIT | Audit, optimise and design modes, proactive flags, output length control, budgets and degradation |
| prompt-caching | [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills/tree/main/skills/prompt-caching) | MIT | Response caching (exact, semantic, temperature-aware), invalidation, CAG vs RAG table, miss-latency trap |
| stay-within-limits | [BuilderIO/skills](https://github.com/BuilderIO/skills/tree/main/skills/stay-within-limits) | MIT | Wave loop, 95% pause, self-contained resume prompts (usage-limits.md) |
| efficient-fable | [BuilderIO/skills](https://github.com/BuilderIO/skills/tree/main/skills/efficient-fable) | MIT | Orchestrator plus cheaper workers, handoff packets, vetting delegated work (model-and-effort.md) |
| claude-usage-analyst | [daymade/claude-code-skills](https://github.com/daymade/claude-code-skills/tree/main/daymade-claude-code/claude-usage-analyst) | MIT | Evidence rules, plain-language field translations, interpretation patterns (measuring-usage.md). Script not copied (it shells out to ccusage) |
| redis-semantic-cache | [redis/agent-skills](https://github.com/redis/agent-skills/tree/main/skills/redis-semantic-cache) | MIT | Cache-aside flow, similarity thresholds, separate caches per task (api-cost-patterns.md) |
| exploring-llm-costs | [PostHog/skills](https://github.com/PostHog/skills/tree/main/skills/omnibus/exploring-llm-costs) | MIT | Cost rollup rules, inclusive vs exclusive cache accounting, regression playbook (measuring-usage.md) |
| chisle | [JayPokale/Chisle](https://github.com/JayPokale/Chisle/tree/main/skills/chisle) | MIT | Context diet rules, "structure is tokens", thinking is billed (session-hygiene.md, terse-output.md) |
| tare | [kelviq/tare](https://github.com/kelviq/tare/tree/main/skills/tare) | MIT | `ccaudit.py`, `ccreport.py`, `forensics.py` copied to `scripts/tare/`; diagnosis method, amplification, session-shape reading (measuring-usage.md, usage-limits.md) |
| audit-prompt-caching | [sernote/audit-prompt-caching](https://github.com/sernote/audit-prompt-caching/tree/main/audit-prompt-caching) | MIT | `analyze_usage_logs.py`, `prefix_stability_check.py`, `estimate_cache_roi.py` copied to `scripts/audit-prompt-caching/`; applicability gate, cache killers, usage fields per provider, break-even formula, Anthropic snapshot (prompt-caching.md, claude-api-levers.md) |
| claude-api | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/claude-api) | Apache-2.0 | Lever order, caching API reference and TTL choice, cache breakers, batch, effort sweeps, tool search, compaction and context editing economics (claude-api-levers.md, model-and-effort.md) |

Licence texts: `scripts/tare/LICENSE` (MIT, Copyright (c) 2026 the ccaudit contributors), `scripts/audit-prompt-caching/LICENSE` (MIT, Copyright (c) 2026 sernote), `scripts/caveman-compress/LICENSE` (Apache-2.0). Scripts are unmodified. Apache-2.0 skill text was distilled, not copied; no NOTICE file was supplied with the source.

Security review of scripts: every bundled script imports only the Python standard library and reads or writes local files the user names (tare reads `~/.claude/projects` read-only). None opens a network connection. Not bundled: caveman-compress's `compress.py`/`cli.py` (they call the Anthropic API or the `claude` CLI with a hard-coded default model; the guide has Claude compress the file in-session and run only the validator instead), claude-usage-analyst's script (runs `ccusage` from npm), audit-prompt-caching's linter, routing analyser and report renderer (useful but specialised; see Go deeper), context-optimization's `compaction.py` (example code).

Not used: the caveman repo's CLI and proxy (`caveman-setup`, `-discover`, `-learn`, `-optimize`): per the source review it sends usage telemetry by default, a managed mode tags requests with repo and branch, and its README offers a `curl | bash` installer. Only the skills' text was used. Chisle's README also offers a `curl | bash` installer; not recommended here.

rtk-optimizer (FlorianBruniaux/claude-code-ultimate-guide, CC-BY-SA-4.0): RTK is named once in session-hygiene.md as an example of an output-compressing wrapper; no text, figures or structure from that skill were used, so no share-alike terms apply.

## Also see (not included)

Link-only: their licences don't allow copying. Nothing from them is copied or paraphrased here.

| Skill | Link | Why not included |
|---|---|---|
| context-mode | https://github.com/mksglu/context-mode/tree/main/skills/context-mode | Elastic License 2.0 (source-available, not OSI). Keeps large tool output in a local sandbox and returns only relevant lines |
| token-optimizer | https://github.com/alexgreensh/token-optimizer/tree/main/skills/token-optimizer | PolyForm Noncommercial 1.0.0: non-commercial use only. Audits Claude Code setups for unused skills, MCP servers and oversized memory |
