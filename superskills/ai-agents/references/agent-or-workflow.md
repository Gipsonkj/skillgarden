# Agent or workflow? Picking the shape and the stack

> Distilled from: claude-api (anthropics/skills, Apache-2.0), launch-your-agent (anthropics/launch-your-agent, Apache-2.0), google-agents-cli-workflow (google/agents-cli, Apache-2.0), langgraph-fundamentals and deep-agents-core (langchain-ai/langchain-skills, MIT), mastra (mastra-ai/skills, Apache-2.0), multi-agent-patterns (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT)

Most "agent" requests are better served by something simpler. Decide the shape first, then the stack.

## 1. The four-question gate

Only build an agent (a model choosing its own tool calls in a loop) when all four are "yes":

| Question | "No" means |
|---|---|
| **Complexity**: is the task multi-step and hard to fully specify in advance? | A single call or a fixed pipeline does it |
| **Value**: does the outcome justify more tokens and latency (agents cost several times a single call)? | Use a cheaper shape |
| **Viability**: can the model actually do this kind of task? Try it by hand in a chat first | Reshape the task or add tools/data |
| **Cost of error**: can mistakes be caught and undone (tests, review, drafts, rollback)? | Keep a human gate or stay deterministic |

## 2. The ladder of shapes (use the lowest rung that works)

| Rung | Shape | Use for | Who controls flow |
|---|---|---|---|
| 0 | **Single call** (+ structured output) | Classify, extract, summarise, rewrite, Q&A over given text | Your code |
| 1 | **Prompt chain** | Fixed steps: outline → draft → check | Your code |
| 2 | **Router** | Pick one of N handlers by input type (billing / tech / sales) | Model picks, code runs |
| 3 | **Parallel / fan-out** | Same step over many items, or several independent checks then merge | Your code |
| 4 | **Evaluator–optimizer** | Generate → grade against a rubric → revise, max N rounds | Code loop, model grades |
| 5 | **Single agent with tools** | Open-ended work: research, coding, ops, triage | Model |
| 6 | **Orchestrator + sub-agents** | Work that overflows one context or splits into independent parts | Model (see multi-agent.md) |

Rules:
- Start at the lowest rung. Move up only when a measured failure demands it.
- A graph/workflow engine (LangGraph, ADK Workflow, Mastra workflow, n8n) is the right tool for rungs 1–4: explicit, testable, cheaper.
- Rungs 5–6 need evals before they ship (see evaluation.md).
- Cap every loop: max iterations (3 is a good default for evaluator loops, 20 is a sane hard ceiling), a token/task budget, and a wall-clock timeout.

## 3. Design dialogue before code

Ask one question cluster at a time; let the user describe it in their own words before you reshape it.

1. **Job**: what does a great first version do? What is the input, what is the output, where does the output land?
2. **Trigger**: on demand, on a schedule (cron + timezone), or on an event (webhook, new email, new row)?
3. **Tools and data**: which systems does it read? Which does it write to? What auth does each use?
4. **Never-dos**: what must it never do (send, delete, pay, post publicly)? Those become gates or are left out.
5. **Definition of done**: 3–6 binary checks a grader can apply to one run.
6. **Evidence**: 3+ past cases with known-good answers. No cases → today's first verified output becomes case 1.

Write the result into a short spec (one paragraph + a table of tools, trigger, outputs, never-dos, done-checks) and get a "yes" before building. Scale the ceremony: a one-tool helper needs two questions; a multi-agent system with auth needs the full set.

Scope in versions: **v0** is the few features that make the core job work, with external writes mocked or saved as drafts. Everything else goes into a numbered v1/v2 list with *why it is later*: (a) the platform can't do it, (b) a credential isn't available yet, or (c) it's possible but out of scope for this round. Never blur those three.

## 4. Pick the stack

Match the user's language and existing project first. If nothing exists yet:

| Need | Good default | Notes |
|---|---|---|
| Claude, you host, your own tools | Claude API + Tool Runner (SDK helper loop) | Manual `while stop_reason == "tool_use"` loop only when you must own every step |
| Claude, batteries-included file/shell agent on your infra | Claude Agent SDK | Claude Code as a library: built-in Read/Edit/Bash/Grep, subagents, hooks |
| Claude, hosted loop + sandbox, schedules, versioned agents | Claude Managed Agents | Least code you own for scheduled or long-running agents |
| TypeScript app, any provider, streaming UI | Vercel AI SDK | Use its agent class, not a hand-rolled loop |
| TypeScript agents + workflows + memory with a dev UI | Mastra | `provider/model` strings; ES2022 modules |
| Python/TS explicit graph, checkpoints, human-in-the-loop | LangGraph | Deep Agents on top for planning + files + subagents |
| Google Cloud deploy, A2A, eval tooling | Google ADK via `agents-cli` | Scaffold first; Agent Runtime / Cloud Run / GKE |
| Stateful agents at the edge, WebSockets, schedules | Cloudflare Agents SDK | Durable Objects + SQLite state |
| Azure / enterprise Microsoft stack | Microsoft Foundry (`azd`) | Hosted or prompt agents |
| Real-time voice | ElevenLabs Agents (or ADK Live) | See voice-agents-elevenlabs.md |
| No-code business automation | n8n / Make / Zapier | See the automation super skill |

Framework-specific rules live in frameworks.md and claude-platform.md.

## 5. Retrieval over memory

Agent SDKs change monthly. Before writing framework code:
1. Check what is installed (`package.json`, `node_modules/<pkg>/package.json`, `pip show`, `uv pip list`).
2. Read the version-matched docs bundled in the package (`node_modules/ai/docs/`, `node_modules/@mastra/*/dist/docs/`) or the CLI's own guide (`agents-cli`, `orca skills get`, `agent-browser skills get core`).
3. Only then fall back to the live docs site (`llms.txt` indexes: `adk.dev/llms.txt`, `mastra.ai/llms.txt`, `ai-sdk.dev/docs/...md`).
4. Never write model IDs from memory: list them (`GET /v1/models`, the gateway's model list, the framework's provider registry).
5. Type errors like "Property X does not exist" usually mean your memory is stale, not that the user is wrong.

## 6. Pitfalls

- Building an agent where a single structured-output call would do (most "extract X from Y" tasks).
- Starting multi-agent before a single agent has been measured.
- No stop condition: loops that run until the context window or the bill stops them.
- Letting the agent write to external systems in v0 without a confirmation gate.
- Hard-coded dates in scheduled prompts ("as of 2026-03-01"): scheduled runs reuse the same text. Write "today" / "as of this run".
- Inventing the user's pain points in specs ("you spend 3 hours a week…"). Use their words.
