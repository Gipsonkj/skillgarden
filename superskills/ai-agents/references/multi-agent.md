# Multi-agent systems and sub-agent dispatch

> Distilled from: multi-agent-patterns (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT), dispatching-parallel-agents (obra/superpowers, MIT), task-coordination-strategies (wshobson/agents, MIT), claude-api agent-design (anthropics/skills, Apache-2.0), orchestration (stablyai/orca, MIT), herdr (herdrdev/herdr, Apache-2.0)

Sub-agents exist to **isolate context**, not to role-play an org chart. Each one gets a clean window with only what its sub-task needs. Everything else about multi-agent design follows from that.

## 1. When it pays

Use more than one agent when at least one is true:
- One context can't hold the task (history + documents + tool output degrade answers: lost-in-the-middle, too many competing items, irrelevant content crowding out useful content).
- The work splits into **independent** parts that can run in parallel (wall-clock ≈ slowest part, not the sum).
- Parts need different tools, prompts or a cheaper model.

Don't when: parts are related (fixing one may fix the others), you don't yet know what's broken (explore first), or agents would edit the same files/resources.

Cost reality: multi-agent runs cost many times a single agent (budget around 15x a plain chat). Measure against a single-agent baseline before keeping it. A better model at the same budget often beats more agents.

## 2. Topologies

| Pattern | Use when | Watch out for |
|---|---|---|
| **Supervisor / orchestrator** | Clear decomposition, human oversight matters | Supervisor context bloats; it paraphrases workers badly ("telephone game") |
| **Swarm / handoffs** | Requirements emerge as you go; any agent can hand to any other | Divergence without a state keeper; needs convergence rules |
| **Hierarchical** | Large work: strategy → planning → execution layers | Strategy/execution drift, long error paths |
| **Fan-out / fan-in** | Same job over many inputs, then merge | Merge step must validate, not just concatenate |

Fixes for known failure modes:
- **Telephone game**: let a worker's final answer go to the user verbatim (a `forward_message` / direct-response path) instead of being re-summarised.
- **Supervisor bottleneck**: workers return a fixed short schema (summary, evidence paths, status), not transcripts. Cap 3–5 workers per supervisor; add a tier rather than overload one.
- **Error propagation**: validate each worker's output before another agent consumes it; add a verifier for critical facts. One agent's hallucination becomes the next agent's "fact".
- **Sycophantic consensus**: don't majority-vote. Weight by evidence/confidence, assign an explicit critic role, require stated disagreements before convergence.
- **Runaway**: time-to-live, max turns and a token budget per agent.

## 3. How context reaches a sub-agent

| Mechanism | Use for |
|---|---|
| **Instruction passing** (default) | Well-defined sub-tasks: the sub-agent gets a self-contained brief |
| **Shared files / state store** | Shared state many agents must read faithfully (plans, findings, outputs). Scales better than message passing |
| **Full context delegation** | Only when the sub-task genuinely needs everything; defeats isolation |

Establish the shared store (a folder, a DB table, a task list) before starting a multi-agent run, or agents duplicate work and lose track.

## 4. Writing the sub-agent brief

A sub-agent never sees your conversation. Each brief contains:
1. **Objective**: one or two sentences.
2. **Scope / owned files**: exactly what it may touch; what is read-only.
3. **Context**: the error messages, test names, paths, decisions it needs (paste them).
4. **Constraints**: "don't change production code", "don't just raise timeouts".
5. **Interface contract**: what other agents produce/consume.
6. **Acceptance criteria**: how to tell it's done.
7. **Out of scope**: explicit list.
8. **Return format**: e.g. "root cause, files changed, tests run with results, open questions".

Bad: "Fix the tests." Good: "Fix the 3 failing tests in `src/agents/abort.test.ts` (names + errors below). Likely timing issues; replace sleeps with event waits. Don't change files outside `src/agents/`. Return root cause and diff summary."

## 5. Decompose and schedule

Split by one axis:
- **File ownership** (best for parallel coding: no two agents touch the same file),
- **Layer** (frontend / API / DB / tests), **component** (auth, billing), or **concern** (security, performance, architecture reviews).

Dependency graph rules: prefer wide and shallow; mark only real `blockedBy` edges; find the critical path (it sets the minimum time); no cycles. Patterns: independent → integrate; diamond (A → B, C → D); sequential only when unavoidable.

Dispatch truly independent agents **in the same turn** so they run concurrently; one per turn is sequential.

Monitor: an idle agent while others are busy → reassign; one stuck on a task → check for a blocker; everything blocked → fix the critical path; one with 3x the load → split.

## 6. Integrate

When agents return:
1. Read every summary; don't trust "done" without evidence.
2. Check for overlapping edits or conflicting assumptions.
3. Run the full test suite / end-to-end check once everything is merged.
4. Spot-check: agents make systematic errors.

## 7. Model and cost per role

- Keep one model for the main loop (switching models mid-session breaks the prompt cache); give sub-agents a cheaper/faster model or lower effort for mechanical work.
- Lower effort on sub-agents = fewer, more consolidated tool calls.
- Hosted options: Claude Managed Agents `multiagent` coordinator rosters, Deep Agents `SubAgentMiddleware`, ADK `SequentialAgent` / `ParallelAgent` / `LoopAgent`, LangGraph `Send` for fan-out.
- Terminal orchestrators (Orca, Herdr) serve their own version-matched guide from the CLI (`orca skills get orchestration`, `herdr --help`); load it before issuing commands, and only act inside them when the user runs them.

## 8. Done checklist

- [ ] A single-agent baseline was considered or measured
- [ ] Each sub-task is independent or its dependencies are explicit
- [ ] Every brief is self-contained with scope, constraints and return format
- [ ] Shared state lives in files/a store, not in re-summarised messages
- [ ] Outputs validated before reuse; full suite run after integration
- [ ] Per-agent limits: turns, tokens, time
