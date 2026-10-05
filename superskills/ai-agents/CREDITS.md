# Credits: ai-agents

All content in `references/` is distilled and rewritten. Scripts in `scripts/` are copied as-is with the source licence beside them.

| Source skill | Repo | Licence | What was used |
|---|---|---|---|
| mcp-builder | https://github.com/anthropics/skills/tree/main/skills/mcp-builder | Apache-2.0 | MCP best practices, evaluation guide (mcp-servers.md, tool-design.md, evaluation.md); `scripts/mcp-builder/` copied as-is |
| claude-api | https://github.com/anthropics/skills/tree/main/skills/claude-api | Apache-2.0 | Surface choice, agent design, tool loop, caching/compaction, Managed Agents notes (agent-or-workflow.md, claude-platform.md, context-and-memory.md, tool-design.md) |
| launch-your-agent | https://github.com/anthropics/launch-your-agent/tree/main/.claude/skills/launch-your-agent | Apache-2.0 | v0/v1 scoping, interview, CMA launch sequence, outcomes and scheduling (agent-or-workflow.md, claude-platform.md, evaluation.md) |
| dispatching-parallel-agents | https://github.com/obra/superpowers/tree/main/skills/dispatching-parallel-agents | MIT | When to dispatch, brief structure, integration (multi-agent.md) |
| orchestration | https://github.com/stablyai/orca/tree/main/skills/orchestration | MIT | Pointer to Orca's version-matched guide (multi-agent.md) |
| build-mcp-server | https://github.com/anthropics/claude-plugins-official/tree/main/plugins/mcp-server-dev/skills/build-mcp-server | Apache-2.0 | Discovery questions, deployment matrix, tool design, auth, elicitation, scaffold and testing (mcp-servers.md, tool-design.md) |
| multi-agent-patterns | https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/multi-agent-patterns | MIT | Topologies, failure modes, context isolation, cost (multi-agent.md) |
| herdr | https://github.com/herdrdev/herdr/tree/main/skills/herdr | Apache-2.0 | Pointer: use the CLI's own help before controlling panes/agents (multi-agent.md) |
| tool-design | https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/tool-design | MIT | Consolidation, description structure, architectural reduction, audit checklist (tool-design.md) |
| agents-sdk | https://github.com/cloudflare/skills/tree/main/skills/agents-sdk | Apache-2.0 | Cloudflare Agents SDK rules (frameworks.md, mcp-servers.md) |
| ai-sdk | https://github.com/vercel/ai/tree/main/skills/use-ai-sdk | Apache-2.0 | Version-matched docs workflow, gateway, agent class (frameworks.md) |
| mastra | https://github.com/mastra-ai/skills/tree/main/skills/mastra | Apache-2.0 | Doc lookup order, ES2022, model format, Studio (frameworks.md) |
| google-agents-cli-adk-code | https://github.com/google/agents-cli/tree/main/skills/google-agents-cli-adk-code | Apache-2.0 | ADK patterns, recipes-first (frameworks.md) |
| google-agents-cli-eval | https://github.com/google/agents-cli/tree/main/skills/google-agents-cli-eval | Apache-2.0 | Quality flywheel, failure-to-fix table, anti-shortcuts (evaluation.md, agent-prompts.md) |
| google-agents-cli-workflow | https://github.com/google/agents-cli/tree/main/skills/google-agents-cli-workflow | Apache-2.0 | Phases, spec-before-scaffold (agent-or-workflow.md, frameworks.md) |
| google-agents-cli-deploy | https://github.com/google/agents-cli/tree/main/skills/google-agents-cli-deploy | Apache-2.0 | Deploy target matrix, sizing, approval rule (frameworks.md) |
| microsoft-foundry | https://github.com/microsoft/azure-skills/tree/main/skills/microsoft-foundry | MIT | Foundry lifecycle overview (frameworks.md) |
| deep-agents-core | https://github.com/langchain-ai/langchain-skills/tree/main/config/skills/deep-agents-core | MIT | Middleware choice, HITL needs checkpointer (frameworks.md, context-and-memory.md) |
| langgraph-fundamentals | https://github.com/langchain-ai/langchain-skills/tree/main/config/skills/langgraph-fundamentals | MIT | Graph design steps, edges, Command/Send gotchas, error table (frameworks.md) |
| mcp-apps-builder | https://github.com/mcp-use/mcp-use/tree/main/skills/mcp-apps-builder | MIT | View binding invariants, request-scoped state (mcp-apps.md, mcp-servers.md) |
| prompt-engineering-patterns | https://github.com/wshobson/agents/tree/main/plugins/llm-application-dev/skills/prompt-engineering-patterns | MIT | System prompt structure, best practices, metrics (agent-prompts.md) |
| memory-systems | https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/memory-systems | MIT | Memory layers, retrieval strategies, consolidation, gotchas (context-and-memory.md) |
| build-mcp-app | https://github.com/anthropics/claude-plugins-official/tree/main/plugins/mcp-server-dev/skills/build-mcp-app | Apache-2.0 | Widget signals, tool/resource registration, App runtime, sandbox limits (mcp-apps.md) |
| task-coordination-strategies | https://github.com/wshobson/agents/tree/main/plugins/agent-teams/skills/task-coordination-strategies | MIT | Decomposition axes, dependency graphs, task template, rebalancing (multi-agent.md) |
| evaluation | https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/evaluation | MIT | Outcome-based grading, rubrics, stratified sets, thresholds (evaluation.md) |
| agents (ElevenLabs) | https://github.com/elevenlabs/skills/tree/main/agents | MIT | Voice agent creation, prompt sections, tool types, sessions (voice-agents-elevenlabs.md) |
| skills-for-copilot-studio | https://github.com/microsoft/skills-for-copilot-studio | MIT | Pointer only: install commands and prerequisites for Microsoft's Copilot Studio plugin (frameworks.md); no content copied |

## Official docs (link-only reference, written in our own words)

| Tool | Docs used | Where |
|---|---|---|
| OpenAI Agents SDK | https://openai.github.io/openai-agents-python/ (agents, tools, handoffs, guardrails, human-in-the-loop, running agents, sessions, tracing); https://github.com/openai/openai-agents-python (version, Python requirement, default turn limit, MIT licence) | frameworks.md, agent-or-workflow.md |
| CrewAI | https://docs.crewai.com/en/installation, /en/quickstart, /en/concepts/agents, /en/concepts/tasks, /en/concepts/crews, /en/concepts/flows, /en/concepts/llms, /en/learn/create-custom-tools, /en/learn/human-feedback-in-flows, /en/telemetry | frameworks.md, agent-or-workflow.md |
| Microsoft Agent Framework | https://learn.microsoft.com/en-us/agent-framework/ (overview, your first agent, tools, tool approval, model providers, Anthropic, workflows, observability) | frameworks.md, evaluation.md, agent-or-workflow.md |
| Microsoft Copilot Studio | https://learn.microsoft.com/en-us/microsoft-copilot-studio/ (overview, VS Code extension overview and synchronization, connect an existing MCP server, standard harness licensing) | frameworks.md, evaluation.md, agent-or-workflow.md |
| LangSmith | https://docs.langchain.com/langsmith/ (home, API keys, trace OpenAI, trace with OpenAI Agents SDK, evaluation quickstart, evaluate an LLM application, MCP server); https://www.langchain.com/pricing | evaluation.md |
| Langfuse | https://langfuse.com/docs (overview, OpenAI Agents integration, datasets, experiments via SDK, scores via SDK, MCP server, self-hosting); https://langfuse.com/pricing; https://github.com/langfuse/langfuse (licence) | evaluation.md |

## Also see (not included)

- design-agent (CrewAI): https://github.com/crewaiinc/skills/tree/main/skills/design-agent (no licence file in repo; link only)
