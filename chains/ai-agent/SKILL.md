---
name: ai-agent
description: "Design, build, test and ship an AI agent for a real task from one request: agent or workflow, framework, tool design and MCP servers, the system prompt, context and memory, evals, a security review and deploy with monitoring, using the Skill Garden ai-agents, security and cloud-devops super skills in order. Use when asked to build an AI agent, assistant, support bot, internal copilot or an automation that uses a model with tools."
---

<!-- Generated from chain.json by local/chains.mjs. Edit chain.json, then run: node local/chains.mjs --write -->

# Ship an AI agent

Decide agent or workflow, design the tools and prompt, prove it with evals, lock down security and deploy.

This is a **chain**: one request runs several Skill Garden super skills in order, each step using the guide written for it. It needs these super skills installed: `ai-agents`, `security`, `cloud-devops`. With the Skill Garden plugin they are `skillgarden:<name>`; on the Skill Garden connector, read each guide with `get_guide`.

Ask like this: "Build an AI agent that <does the task> for <users>, using <systems>."

## Before step 1: gather the inputs once

Ask only for what the request and the conversation don't already give you, in one message:

- The task and what done looks like
- Who uses it and where: chat, Slack, voice or API
- Systems and data it reads or changes
- Actions that need a person to approve
- Model or platform preference and the budget per run

If something stays unknown, pick a sensible default, say which, and go on.

## Run the steps in order

For each step: load the named super skill, read the guides listed (and only those), do the step the way the guide says, and save the result as `ai-agent/<n>-<step>.md` in the working folder (or as a section of one document where files aren't available). Each step builds on the files before it. Don't stop between steps to ask "continue?". Stop only for a decision the user has to make, and say what it is.

### 1. Agent or workflow

- **Read:** `ai-agents` → `references/agent-or-workflow.md`, `ai-agents` → `references/frameworks.md`
- **Deliver:** The design (agent, workflow or a mix), the framework and why.

### 2. Design the tools

- **Read:** `ai-agents` → `references/tool-design.md`, `ai-agents` → `references/mcp-servers.md`
- **Deliver:** Each tool's name, inputs, outputs and errors, and an MCP server where it helps.

### 3. Write the prompt and memory

- **Read:** `ai-agents` → `references/agent-prompts.md`, `ai-agents` → `references/context-and-memory.md`
- **Deliver:** The system prompt, what goes into context and what it remembers.

### 4. Prove it with evals

- **Read:** `ai-agents` → `references/evaluation.md`
- **Deliver:** A test set of real tasks, the graders and the pass rate to ship at.

### 5. Security review

- **Read:** `security` → `references/threat-modeling.md`, `security` → `references/secrets.md`
- **Deliver:** Prompt-injection and data-leak risks with fixes, approval on risky actions, secrets handled.

### 6. Deploy and watch it

- **Read:** `cloud-devops` → `references/platform-choice.md`, `cloud-devops` → `references/observability.md`
- **Deliver:** The deployed agent with cost and error dashboards and alerts.

## Finish

End with a short summary: what each step produced (file names), the decisions you made on the user's behalf, and the one thing to do first. Facts, numbers and claims come only from the user's inputs and the research step. Never invent results, testimonials or prices.
