# Building agents on Claude (API, Agent SDK, Managed Agents)

> Distilled from: claude-api (anthropics/skills, Apache-2.0), launch-your-agent (anthropics/launch-your-agent, Apache-2.0)

Vendor-specific guide. Model IDs, beta headers and limits change often: list models with `GET /v1/models`, and if a `claude-api` skill or the live docs (platform.claude.com/docs) are available, they win over this file. Default to the newest Opus-class model unless the user names another; never append date suffixes to model IDs from memory.

## 1. Four ways to build a Claude agent

Two questions separate them: who runs the **loop** (harness) and who hosts the **compute** (deployment).

| # | Approach | You write | Harness / hosting | Tools |
|---|---|---|---|---|
| 1 | Messages API, manual loop | The `while stop_reason == "tool_use"` loop | You / you | Only yours |
| 2 | Messages API **Tool Runner** (`client.beta.messages.tool_runner`, `@beta_tool`, `betaZodTool`) | Tool functions | SDK loop / you | Only yours; per-turn hooks for approval, logging, retries |
| 3 | **Managed Agents** (REST, beta) | Agent config + custom tool results | Anthropic loop + per-session sandbox | Built-in bash/files/web + skills + MCP + yours |
| 4 | **Claude Agent SDK** (`claude-agent-sdk`, `@anthropic-ai/claude-agent-sdk`) | A prompt + options (`query()`) | Claude Code harness / you | Built-in Read/Write/Edit/Bash/Glob/Grep/Web + MCP + subagents + hooks |

Tool Runner ≠ Agent SDK: the runner loops over tools you define; the Agent SDK is Claude Code as a library. Neither hosts anything. Only Managed Agents adds hosting, scheduling and versioned agent objects.

Pick: custom tools in your own service → 2; full control or unusual flow → 1; file/shell coding agent on your machines → 4; hosted, scheduled, long-running or "until it passes a rubric" → 3.

## 2. Messages API agent loop essentials

- Everything goes through `POST /v1/messages`; tools, structured output, thinking and caching are parameters.
- Loop: send → if `stop_reason == "tool_use"`, run every `tool_use` block, append **all** results as `tool_result` blocks in **one** user message (results first in that message) → send again. Stop on `end_turn`; handle `max_tokens` (raise or continue); handle `pause_turn` from server tools by re-sending the conversation unchanged (no "continue" message).
- Append the full `response.content` (thinking, tool_use, compaction blocks), never just the text.
- Validate tool inputs against your schema before executing (typed runner helpers do it; raw JSON helpers don't). `strict: true` on a tool guarantees schema-valid arguments.
- Tool failures: `{"type":"tool_result","tool_use_id":…,"content":"<what failed + what to try>","is_error":true}`.
- Some current models reject forced `tool_choice` (`any` / specific tool): use `auto`, say in the prompt which tool to use, check a call happened, or use structured outputs (`output_config.format`) when you only wanted JSON.
- Shell/file tools execute untrusted model output: run in a container or restricted user, allow-list executables, reject shell operators, set timeouts, log every command.

## 3. Knobs that matter for agents

| Knob | Guidance |
|---|---|
| Thinking | Adaptive thinking (`thinking: {type: "adaptive"}`) on current models; fixed `budget_tokens` is legacy. Set `display: "summarized"` if you stream reasoning to users |
| Effort (`output_config.effort`) | `low` for sub-agents and simple routes, `high`/`xhigh` for coding and long-horizon agents, `max` only when measured headroom exists. Defaults differ per model: set it explicitly |
| Task budget (beta) | Advisory token budget for a whole agentic loop so the model paces itself; different from `max_tokens` |
| Compaction (beta) | Server-side summary near the window limit; keep compaction blocks in history |
| Context editing | Clears stale tool results/thinking past thresholds |
| Prompt caching | Stable `tools → system` prefix; volatile data after the last breakpoint; verify `cache_read_input_tokens` |
| Server tools | Web search/fetch, code execution: declare them, Anthropic runs them |
| Programmatic tool calling | Model writes code that calls your tools in a sandbox; only the final output returns to context |
| Tool search / Skills | Load tool schemas or instructions on demand to keep the prefix small |

Cost order of operations: caching first (free), then effort, then model choice. Judge cost per completed task.

Auth: SDKs resolve credentials in order `ANTHROPIC_API_KEY` → `ANTHROPIC_AUTH_TOKEN` → an `ant auth login` profile. Run `ant auth status` before asking the user for a key. Never print a key or put it in chat.

## 4. Claude Managed Agents (CMA) in practice

Primitives (introduce each with one plain sentence when you first use it):

| Primitive | What it is |
|---|---|
| **Agent** | Versioned config: model, system prompt, tools, MCP servers, skills, optional multi-agent roster |
| **Environment** | Reusable sandbox template: cloud container, networking (unrestricted or allow-listed hosts), packages (pip, npm, apt…) |
| **Session** | One run of an agent in a fresh container; status `idle` / `running` / `rescheduling` / `terminated` |
| **Outcome** | Task + rubric + `max_iterations`; a grader iterates the agent until it passes |
| **Deployment** | Cron + timezone schedule that starts sessions with fixed `initial_events` |
| **Vault** | Stored credentials for MCP connectors |
| **Memory store** | Persistent files attached to sessions |

Launch sequence (one API call per step; save every returned ID to an `IDS.env` file immediately; each step skips objects that already exist):
1. Pick a model from `GET /v1/models`.
2. Create the environment.
3. Create the agent with tools `[{"type": "agent_toolset_20260401"}]` (the toolset as a whole; don't list built-ins individually). Gate risky tools: `configs: [{"name": "bash", "permission_policy": {"type": "always_ask"}}]`. MCP toolsets default to `always_ask`.
4. Create a session (pin `{"type":"agent","id":…,"version":N}` for evals).
5. Kick off with a `user.define_outcome` event (task text + rubric markdown, `max_iterations: 3`), or a plain `user.message`.
6. Watch: open the SSE stream **before** sending events, or poll the session. Parse responses with Python (`json.JSONDecoder(strict=False)`); embedded prompts contain control characters that break `jq`.
7. Answer `requires_action` stops with `user.tool_confirmation` (allow/deny) or `user.custom_tool_result`.
8. Read the grader's verdict, fetch output files (Files API, scoped to the session), grade them yourself against the rubric.

Iterate by changing **one** thing: rubric (new session), instructions/tools (agent update → new version; pass the current version as a concurrency guard), or task text.

Scheduling: only for jobs that truly repeat. Re-read the kickoff for literal dates first (the same text fires every run: write "today"). Confirm `upcoming_runs_at`, then trigger one manual run so the user sees it fire.

v0 defaults that work: one agent, newest Opus-class model, full toolset in a cloud environment, outcome kickoff with `max_iterations: 3`, external writes as drafts or a mocked outbox file (wire real Slack/email connectors as v1 with an `always_ask` gate).

Key hygiene: reuse `ANTHROPIC_API_KEY` from the shell if set, otherwise a `chmod 600` `.env` file listed in `.gitignore`. Objects land in the key's workspace; "I can't see it in the Console" usually means the wrong workspace is selected.

Fallbacks after two failures on a step: re-check live docs → do the step in the Console UI → copy a known-good archetype config → if CMA is unreachable, build the same design as a local Claude Code workflow and say plainly it's not a managed agent.

## 5. Claude Agent SDK notes

- `query(prompt, options)` runs the full Claude Code loop: built-in tools, permissions, hooks, subagents, sessions, MCP servers.
- Restrict tools and permission mode for unattended runs; add MCP servers for your systems; use hooks for approval gates and audit logs.
- Read its current docs (code.claude.com/docs/en/agent-sdk) before coding; don't substitute the Tool Runner for it or vice versa.

## 6. Done checklist

- [ ] Right approach (1–4) chosen and stated with one sentence of why
- [ ] Model ID from the live list; effort set explicitly
- [ ] Tool errors returned as `is_error` results; inputs validated
- [ ] Caching verified on repeated calls
- [ ] Destructive tools gated (`always_ask` / approval hook)
- [ ] For CMA: IDs saved, outcome verdict read, outputs graded, held-back cases run on the pinned version
