# Agent frameworks: vendor-specific notes

> Distilled from: ai-sdk (vercel/ai, Apache-2.0), mastra (mastra-ai/skills, Apache-2.0), langgraph-fundamentals and deep-agents-core (langchain-ai/langchain-skills, MIT), google-agents-cli-workflow / -adk-code / -eval / -deploy (google/agents-cli, Apache-2.0), agents-sdk (cloudflare/skills, Apache-2.0), microsoft-foundry (microsoft/azure-skills, MIT), multi-agent-patterns frameworks notes (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT); OpenAI Agents SDK, CrewAI, Microsoft Agent Framework and Copilot Studio sections written from their official docs (see CREDITS.md)

Every framework below changes fast. The shared rule: **inspect the installed version and read its bundled or version-matched docs before writing code**; never write model IDs or API names from memory; when a type error says a property doesn't exist, suspect your memory first. Claude-specific surfaces are in claude-platform.md.

## Pick a framework

| The user's situation | Use | Why |
|---|---|---|
| The project or team already uses (or pays for) one of these | That one | Switching frameworks costs more than any feature gap; read its installed version's docs |
| Claude only, you host the loop | Claude API / Tool Runner / Agent SDK (claude-platform.md) | Least glue; native caching and tools |
| TypeScript app with a streaming chat UI, any provider | Vercel AI SDK | Agent class plus React hooks |
| TypeScript agents + workflows + memory with a local dev UI | Mastra | Studio, storage-backed memory |
| Explicit graph, checkpoints, approvals (Python/TS) | LangGraph (Deep Agents on top) | `interrupt()` + checkpointer |
| Python, OpenAI models, built-in handoffs, guardrails, sessions and tracing | OpenAI Agents SDK | Runtime manages turns, approvals and traces |
| Python, role-based "crew" of agents with tasks in config files | CrewAI | JSON/YAML crews, Flows for state and order |
| .NET, Go or Python in a Microsoft shop, or migrating from AutoGen / Semantic Kernel | Microsoft Agent Framework | Their direct successor; graph workflows, OpenTelemetry |
| Hosted agents on Azure with deploy and evals managed for you | Microsoft Foundry | `azd` lifecycle |
| Google Cloud deploy, A2A | Google ADK via `agents-cli` | Scaffold, eval, deploy in one CLI |
| Stateful agents at the edge | Cloudflare Agents SDK | Durable Objects + SQLite |
| Business makers, Microsoft 365 / Teams, low-code | Microsoft Copilot Studio | Built in the browser, published to Teams and Copilot |
| No code at all, outside Microsoft | n8n / Make / Zapier | `automation` craft |
| Free and open source only | OpenAI Agents SDK, CrewAI or Microsoft Agent Framework (all MIT-licensed) | Pay only for the model calls |
| Not sure which cloud, language or tenant the team uses | Ask the user | Don't guess a stack or create accounts |

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

## OpenAI Agents SDK (`openai-agents`, Python)

Pick it for Python agents on OpenAI models when you want the runtime to own turns, handoffs, approvals, guardrails, sessions and tracing.

- Install `pip install openai-agents` (Python 3.10+); key in `OPENAI_API_KEY` (env var, never in code). Core: `Agent(name, instructions, tools, handoffs, input_guardrails, output_type)` and `Runner.run` (async), `Runner.run_sync`, `Runner.run_streamed`; answer in `result.final_output`.
- **Tools**: `@function_tool` (also exposed as `@tool` from `agents.decorators`): name from the function, description from the docstring, schema from type hints. Hosted tools: `WebSearchTool`, `FileSearchTool`, `CodeInterpreterTool`, `HostedMCPTool`. `agent.as_tool()` turns a specialist into a tool for a manager agent.
- **Handoffs**: `handoffs=[billing, handoff(refunds)]`. The model sees a tool named `transfer_to_<agent_name>`; `handoff()` adds `on_handoff`, `input_type`, `input_filter`, `tool_name_override`. Start specialist instructions with `RECOMMENDED_PROMPT_PREFIX` from `agents.extensions.handoff_prompt`.
- **Approval gate**: `needs_approval=True` (or an async `(ctx, params, call_id) -> bool`) on the tool. The run pauses with `result.interruptions` (`ToolApprovalItem`: `agent.name`, `tool_name`, `arguments`); `state = result.to_state()`, `state.approve(item)` or `state.reject(item)`, then `Runner.run(top_agent, state)`. This works for tools reached after a handoff too. Park a pending approval with `state.to_json()` and restore with `RunState.from_json(agent, data)`.
- **Guardrails**: `@input_guardrail` returns `GuardrailFunctionOutput(output_info=..., tripwire_triggered=...)`; a trip raises `InputGuardrailTripwireTriggered`. Input guardrails run only for the **first** agent, output guardrails only for the agent that gives the final answer; use `@tool_input_guardrail` / `@tool_output_guardrail` for checks on every call of a tool. Input guardrails run in parallel by default, so the agent may already spend tokens and call tools before the trip: pass `run_in_parallel=False` when side effects matter.
- **Loop bound**: `max_turns` (default 10) raises `MaxTurnsExceeded`. **Memory**: `SQLiteSession("user_123", "conversations.db")` passed as `session=`.
- **Tracing** is on by default and goes to the OpenAI Traces dashboard (not available under Zero Data Retention). Spans include model inputs/outputs unless `OPENAI_AGENTS_TRACE_INCLUDE_SENSITIVE_DATA=false`; turn tracing off with `OPENAI_AGENTS_DISABLE_TRACING=1`. To send traces to LangSmith or Langfuse see evaluation.md section 7.

```python
import asyncio
from agents import Agent, Runner, function_tool
from agents.extensions.handoff_prompt import RECOMMENDED_PROMPT_PREFIX

@function_tool(needs_approval=True)
async def issue_refund(order_id: str, amount: float) -> str:
    """Refund an order. Use only after the customer confirmed order and amount."""
    return f"Refunded {amount} on {order_id}"

billing = Agent(name="Billing agent", tools=[issue_refund],
                instructions=f"{RECOMMENDED_PROMPT_PREFIX} Handle billing questions.")
triage = Agent(name="Triage agent", handoffs=[billing],
               instructions=f"{RECOMMENDED_PROMPT_PREFIX} Route each ticket to the right agent.")

async def main():
    result = await Runner.run(triage, "I was charged twice for order 812", max_turns=8)
    while result.interruptions:
        state = result.to_state()
        for item in result.interruptions:
            print(item.agent.name, item.tool_name, item.arguments)   # show the exact call
            state.approve(item) if input("Approve? y/n ") == "y" else state.reject(item)
        result = await Runner.run(triage, state)
    print(result.final_output)

asyncio.run(main())
```

Gotchas: resume with the **top-level** agent, not the specialist; a guardrail on the billing agent never runs when triage is first; hosted tools and handoffs bypass tool guardrails.

## CrewAI (Python)

Pick it when the work maps to a team of role-based agents handing tasks along, defined in config files; wrap crews in a Flow when you need state, branching or approvals.

- Python >=3.10 and <3.14. Install the CLI with `uv tool install crewai` (install `uv` from its own docs first; don't pipe a download into a shell), check with `crewai version`.
- Scaffold: `crewai create crew <name>` makes a JSON-first project: `crew.jsonc` plus one `agents/<name>.jsonc` per agent (`--classic` gives the older `config/agents.yaml` + `@CrewBase` layout). `crewai create flow <name>` makes a Flow app, which the docs recommend for production. Then `crewai install` and `crewai run`. Keys go in `.env`.
- Agent file: `role`, `goal`, `backstory` (all three required), `llm` as `"provider/model-id"`, `tools`, and `settings` (`verbose`, `allow_delegation` default false, `max_iter` default 20, `max_rpm`). `{topic}`-style placeholders fill from `crew.kickoff(inputs=...)` or `inputs` defaults in `crew.jsonc`; `crewai run` prompts for missing ones.
- `crew.jsonc`: `name`, `agents`, `tasks` (each `name`, `description`, `expected_output`, `agent`, optional `output_file`), `process` `"sequential"` or `"hierarchical"` (hierarchical needs `manager_llm` or `manager_agent`).
- Custom tools: `"custom:<name>"` in an agent's `tools` loads `tools/<name>.py`; in Python subclass `BaseTool` (`name`, `description`, `args_schema`, `_run`) or use `@tool("Name")` from `crewai.tools`. **Only run JSON crews you trust**: `custom:` tools and `{"python": "module.attribute"}` references execute local code on load.
- Task checks: `guardrail` is a function returning `(bool, Any)`, retried up to `guardrail_max_retries` (default 3); `output_pydantic` for structured output; `human_input` defaults to false.
- Approvals: in a Flow, `@human_feedback(message=..., emit=["approved", "rejected"], llm=..., default_outcome=...)` (CrewAI 1.8.0+) pauses for a person and routes on the answer. For a single risky tool, also refuse in the tool's own code unless approved.
- Models: `MODEL=provider/model-id` in `.env`, `llm:` per agent, or `LLM(model=...)`. OpenAI, Anthropic, Google, Azure and Bedrock are native; others need `uv add 'crewai[litellm]'`. Anthropic models need `max_tokens`.
- Privacy: CrewAI collects anonymous usage telemetry unless `CREWAI_DISABLE_TELEMETRY=true` (or `OTEL_SDK_DISABLED=true`); set it. Leave `share_crew` off: it shares the full crew and its execution with the crewAI team.
- Deploy to CrewAI AMP (`crewai login`, `crewai deploy create`, `crewai deploy push`) needs the project in GitHub; it publishes the crew, so show what will deploy and wait for a yes.

## Microsoft Agent Framework (Python, .NET, Go)

The direct successor to AutoGen and Semantic Kernel, built by the same teams. Pick it for .NET or Azure shops and for any AutoGen/SK migration (Microsoft publishes migration guides for both).

- Python `pip install agent-framework` (+ `azure-identity` for Azure sign-in); provider packages such as `pip install agent-framework-anthropic --pre`. .NET `dotnet add package Microsoft.Agents.AI.Foundry --prerelease`. Go is in public preview. It does **not** load `.env` by itself: call `load_dotenv()`.
- Agent: `Agent(client=..., name=..., instructions=..., tools=[...])`, then `await agent.run(prompt)` or `agent.run(prompt, stream=True)`. Clients: `FoundryChatClient(project_endpoint=..., model=..., credential=AzureCliCredential())`, `OpenAIChatClient()`, `AnthropicClient()` (reads `ANTHROPIC_API_KEY` and `ANTHROPIC_CHAT_MODEL`). In production replace `DefaultAzureCredential` with a specific one such as a managed identity.
- Tools: `@tool` from `agent_framework`, parameters typed `Annotated[str, "description"]`, docstring as description. `agent.as_tool()` wraps an agent for another agent.
- Approval: `@tool(approval_mode="always_require")`. The run returns `result.user_input_requests`; for each, show `function_call.name` and `.arguments`, then send `Message(role="user", contents=[req.to_function_approval_response(True or False)])` back with the **same** `session = agent.create_session()`. Loop until no requests remain. Approvals are bound to pending requests in that session by default; never set `disable_approval_response_binding`. Microsoft's samples use `"never_require"` only for brevity.
- Workflows: graph API (`WorkflowBuilder`, executors and edges, checkpoints at superstep boundaries, `RequestInfoExecutor` for human input) or the experimental Python functional API (`@workflow`, `ctx.request_info()`). `create_harness_agent` gives a batteries-included agent for long tasks (planning, compaction, tool approval).
- Observability: OpenTelemetry built in. `configure_otel_providers()` from `agent_framework.observability` reads `OTEL_EXPORTER_OTLP_*`; prompts and tool arguments are recorded only with `ENABLE_SENSITIVE_DATA=true` (default false; keep it off in production). Free local viewer: the Aspire Dashboard container (UI on port 18888, OTLP on 4317). On Foundry/Azure OpenAI paths the framework adds a feature-usage token to the User-Agent; `AGENT_FRAMEWORK_USER_AGENT_DISABLED=true` removes it.

```python
import asyncio
from typing import Annotated
from dotenv import load_dotenv
from agent_framework import Agent, Message, tool
from agent_framework.anthropic import AnthropicClient

load_dotenv()

@tool(approval_mode="always_require")
def issue_refund(order_id: Annotated[str, "Order ID"], amount: Annotated[float, "Amount"]) -> str:
    """Refund an order after the customer confirmed it."""
    return f"Refunded {amount} on {order_id}"

async def main():
    agent = Agent(client=AnthropicClient(), name="Billing",
                  instructions="Handle billing tickets.", tools=[issue_refund])
    session = agent.create_session()
    result = await agent.run("Refund order 812, charged twice", session=session)
    while result.user_input_requests:
        replies = []
        for req in result.user_input_requests:
            print(req.function_call.name, req.function_call.arguments)   # show it, wait for a yes
            ok = input("Approve? y/n ") == "y"
            replies.append(Message(role="user", contents=[req.to_function_approval_response(ok)]))
        result = await agent.run(replies, session=session)
    print(result.text)

asyncio.run(main())
```

## Microsoft Copilot Studio (low-code)

Microsoft's browser studio (`https://copilotstudio.microsoft.com`) for agents, workflows and agent flows that publish to Teams, Microsoft Copilot, websites and mobile apps. Pick it when the user's organisation runs on Microsoft 365 and makers, not developers, will own the agent; pick Agent Framework or Foundry when you need code-level control. A pure automation with no agent belongs to the `automation` craft.

- **Harness** (chosen per agent; it changes billing and features): GitHub Copilot harness for reasoning-heavy multi-step work, standard harness for topic-based structured conversations, Copilot chat harness to extend Microsoft Copilot Chat. The local YAML route below is for standard-harness agents.
- **Drive it from Claude** (the documented code route is the VS Code extension): install the Copilot Studio extension for VS Code (generally available), clone the agent, and edit its YAML agent definition (topics, tools, knowledge, triggers) locally under Git. Sync with the extension's **Preview** (see remote changes), **Get** (pull them) and **Apply** (push). Apply is blocked until remote changes are fetched with Get.
- **Apply changes the live agent in that environment immediately, but does not publish it.** Test in the Copilot Studio test pane, then publish there. Both Apply and Publish change what users see: show the diff or the channel and wait for a yes.
- Optional helper: Microsoft's MIT plugin `skills-for-copilot-studio` (author, test, manage and advisor sub-agents) installs in Claude Code with `/plugin marketplace add microsoft/skills-for-copilot-studio` then `/plugin install copilot-studio@skills-for-copilot-studio`; it needs Node.js 18+ and the VS Code extension. Its README calls it an experimental research project whose YAML schema may change without notice: read its scripts before running them.
- **Connect your MCP server**: Tools → Add a tool → New tool → Model Context Protocol; fill **Server name**, **Server description** (the orchestrator reads it to decide when to call) and **Server URL**; auth **None**, **API key** (header or query) or **OAuth 2.0** (Dynamic discovery, Dynamic or Manual). Only the Streamable HTTP transport works; SSE stopped being supported after August 2025. Power Platform data policies on connectors also govern MCP access.
- **Billing**: usage is counted in Copilot Credits (renamed from messages on 1 September 2025) via prepaid packs, pay-as-you-go on an Azure subscription, or a one-year prepurchase. Unused credits don't carry over; a trial licence can build and test but not publish. For Microsoft 365 Copilot licensed users in Copilot Chat, Teams or SharePoint, classic answers, generative answers and Graph grounding are zero-rated. Check costs with Microsoft's agent usage estimator before scaling.
- Quality: built-in Evaluations (test sets and a shared grader library) and Analytics; keep a held-back set as in evaluation.md.

## Other frameworks

Same rules for anything not listed: installed version, current docs, live model list.

## Cross-framework checklist

- [ ] Installed version identified; docs read from that version
- [ ] Model ID taken from a live list or registry
- [ ] Human-approval steps have persistence (checkpointer / durable state)
- [ ] Every loop has a max-iterations or budget stop
- [ ] Typecheck/build passes; one real run end to end; eval set run
