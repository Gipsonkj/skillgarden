# Go deeper: original skills

The guides in this super skill distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

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
