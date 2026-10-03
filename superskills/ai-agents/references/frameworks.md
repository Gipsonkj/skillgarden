# Agent frameworks: vendor-specific notes

> Distilled from: ai-sdk (vercel/ai, Apache-2.0), mastra (mastra-ai/skills, Apache-2.0), langgraph-fundamentals and deep-agents-core (langchain-ai/langchain-skills, MIT), google-agents-cli-workflow / -adk-code / -eval / -deploy (google/agents-cli, Apache-2.0), agents-sdk (cloudflare/skills, Apache-2.0), microsoft-foundry (microsoft/azure-skills, MIT), multi-agent-patterns frameworks notes (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT)

Every framework below changes fast. The shared rule: **inspect the installed version and read its bundled or version-matched docs before writing code**; never write model IDs or API names from memory; when a type error says a property doesn't exist, suspect your memory first. Claude-specific surfaces are in claude-platform.md.

## Vercel AI SDK (`ai`, TypeScript)

- Docs ship inside the package: grep `node_modules/ai/docs/` and `node_modules/ai/src/`; providers in `node_modules/@ai-sdk/<name>/docs/`. Fallback: `https://ai-sdk.dev/docs/...` (append `.md`) and `https://ai-sdk.dev/api/search-docs?q=...`.
- Not installed? Install only `ai` (plus the provider package you need) with the project's package manager.
- Compare installed vs `npm view ai version`; a major version behind → recommend upgrading before writing new code (UI hooks like `useChat` change most).
- Use the SDK's agent abstraction (e.g. `ToolLoopAgent`) instead of a hand-rolled tool loop; infer the client UI message type from the agent definition for end-to-end types.
- AI Gateway: one key (`AI_GATEWAY_API_KEY`), `provider/model` strings; list models live (`curl -s https://ai-gateway.vercel.sh/v1/models`), don't truncate the list, prefer the highest version.
- Set only options that differ from defaults; run the type checker after every change. DevTools package for local debugging of runs.

## Mastra (TypeScript)

- Check `ls node_modules/@mastra/`. Installed → embedded docs in `node_modules/@mastra/*/dist/docs/` first, source/types second; not installed → `https://mastra.ai/llms.txt`.
- Project must be ES2022 modules (`"type": "module"`, target/module ES2022); CommonJS fails.
- **Agent** for open-ended tool use; **workflow** for defined steps, approvals, ETL, resumable processes. Memory needs a storage adapter ("Storage is required for Memory"); semantic recall needs a vector store + embedder.
- Models as `"provider/model-name"`; verify with the skill's provider registry or docs before use.
- Dev UI: `npm run dev` → Studio at `http://localhost:4111`. `mastra api` inspects agents, workflows, traces, logs and scores on local or deployed servers.

## LangGraph (Python / TypeScript)

Design in five steps: map discrete steps → classify each (LLM, data, action, user input) → design state (store raw data, format prompts inside nodes) → write nodes returning **partial** updates → wire edges and compile.

| Need | Use |
|---|---|
| Fixed next step | `add_edge` |
| Branch on state | `add_conditional_edges` |
| Update state and route in one node | `Command(update=…, goto=…)` |
| Dynamic parallel fan-out | `Send("worker", {...})` + a reducer on the results field |
| Human approval / missing info | `interrupt()` + resume with `Command(resume=…)`; requires a checkpointer and a `thread_id` |

Gotchas: `Command(goto=…)` adds dynamic edges, but static edges still fire too (both branches run). List fields need a reducer or the last write wins. `START` is entry-only; loop through a named node. Errors: transient → `RetryPolicy(max_attempts=3)`; tool failures → return as tool messages so the LLM can fix; missing info → `interrupt`. Stream modes: `values`, `updates`, `messages` (tokens for chat UIs), `custom`.

## Deep Agents (LangChain, Python / TypeScript)

Opinionated harness on LangGraph: planning (todo list), filesystem tools with pluggable backends, sub-agents, long-term memory (Store), human-in-the-loop, skills loading. Use it for multi-step tasks with large context; use a plain `create_agent` for single-purpose agents.
```python
agent = create_deep_agent(model="<provider model id>", tools=[...], system_prompt="...",
    subagents=[research_agent], backend=FilesystemBackend(root_dir=".", virtual_mode=True),
    interrupt_on={"write_file": True}, checkpointer=MemorySaver())
agent.invoke({"messages": [{"role": "user", "content": "..."}]},
             config={"configurable": {"thread_id": "user-123"}})
```
HITL (`interrupt_on`) needs a checkpointer. `virtual_mode=True` keeps file writes sandboxed. Store backends serve skills where there is no filesystem.

## Google ADK via `agents-cli` (Python / Go)

Phases: understand → study recipes → scaffold → build → evaluate → deploy → publish → observe.
- Install: `uv tool install google-agents-cli`; check with `agents-cli info`. Don't write agent code before a scaffold exists: `agents-cli scaffold create <name>` (Go: `--agent adk_go`) or `agents-cli scaffold enhance .`.
- Write the agreed design to `.agents-cli-spec.md` and get approval before scaffolding.
- Before building any capability (RAG, sandboxed code, cross-session memory, approval gates, guardrails, per-user OAuth, schedules/events, sub-agents, A2A), look for a matching reference recipe and study it first.
- Multi-agent: `SequentialAgent`, `ParallelAgent`, `LoopAgent`, custom `BaseAgent`, or the graph Workflow API for explicit topology. A2A is built into scaffolded Python agents. Live/voice agents use `Runner.run_live`.
- Eval: `agents-cli eval run` → open `artifacts/grade_results/results_<ts>.html` → fix → `agents-cli eval compare prev.json new.json`.
- Deploy targets: **Agent Runtime** (managed, OAuth consent via Gemini Enterprise, lowest ops), **Cloud Run** (full networking control, Pub/Sub/Eventarc triggers), **GKE** (Kubernetes control). Never run `agents-cli deploy` without explicit human approval after showing eval results; pass `--no-confirm-project` in non-interactive runs; long Agent Runtime deploys continue server-side (check with `--status`).
- Sizing: defaults cpu 1, memory 4Gi, concurrency 8, min 0, max 10 instances. Memory bounds concurrency (each request holds its context); scale out, not up; voice agents need `--timeout 3600` and `--min-instances 1`.

## Cloudflare Agents SDK (`agents`, TypeScript)

- Each agent class is a Durable Object with SQLite state. `wrangler.jsonc` needs `nodejs_compat`, a DO binding per class, and a migration entry (`new_sqlite_classes`). Never edit old migrations: add new tags.
- Do **not** enable `experimentalDecorators` in tsconfig (breaks `@callable`).
- Core: `this.state` / `this.setState`, `` this.sql`...` ``, `schedule(delaySecs | cron | Date)`, `scheduleEvery`, `@callable()` RPC, `runWorkflow`, `runFiber` (survives eviction), `queue`, `retry` with backoff, `broadcast`.
- Routing: `/agents/{agent-name}/{instance-name}`; client `useAgent({ agent, name })`. Chat: `AIChatAgent` with resumable streams. MCP: `McpAgent` / `createMcpHandler` for servers, MCP client for consuming.
- Prefer the docs index `https://developers.cloudflare.com/agents/index.md` over memory.

## Microsoft Foundry (Azure)

- Run the skill's dependency check first, read the `azd` guidance before any `azd` command, and discover Foundry MCP tools before calling them.
- Lifecycle: project (public or VNet-isolated) → model deployment → create hosted or prompt agent → deploy (`azd`) → invoke → observe (batch evals, continuous evaluation, prompt optimisation) → trace/troubleshoot. Routines schedule or event-trigger agents.
- Quota, RBAC (managed identities) and region capacity are the usual deployment blockers: check them before retrying a failed deploy.

## Other frameworks in brief

- **CrewAI**: role-based crews with hierarchical processes. **AutoGen**: conversational GroupChat, event-driven. Pick by coordination needs, not by metaphor.
- **OpenAI Agents SDK / Assistants-style APIs** and others: same rules: installed version, current docs, live model list.

## Cross-framework checklist

- [ ] Installed version identified; docs read from that version
- [ ] Model ID taken from a live list or registry
- [ ] Human-approval steps have persistence (checkpointer / durable state)
- [ ] Every loop has a max-iterations or budget stop
- [ ] Typecheck/build passes; one real run end to end; eval set run
