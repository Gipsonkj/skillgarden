# Context engineering and memory

> Distilled from: memory-systems (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT), multi-agent-patterns (same repo, MIT), claude-api agent-design and prompt-caching notes (anthropics/skills, Apache-2.0), deep-agents-core (langchain-ai/langchain-skills, MIT)

An agent's context window is its working memory. Long runs fail less from model limits than from a window filled with stale tool output. Keep the fixed part small and cached, load detail just in time, and persist only what must survive the session.

## 1. Budget the window

- Fixed prefix (system prompt + tool schemas) stays stable and small. Every tool schema is paid every turn.
- Load on demand: skills (description always present, body read when relevant), tool search (schemas appended when needed), documents fetched by tools rather than pasted up front.
- Put critical retrieved facts at the start or end of the context; the middle gets less attention.
- Large tool outputs: write them to files and return a path + summary, or let code process them (programmatic tool calling: the model writes a script that calls tools; only the script's final output enters context).

## 2. Long-running sessions

| Technique | Use when | Effect |
|---|---|---|
| **Context editing** | Old tool results and finished thinking pile up | Clears stale blocks past a threshold, no summary |
| **Compaction** | The conversation will approach the window limit | Earlier turns summarised server-side (Claude: beta, default trigger around 150k tokens) |
| **Observation masking** | Repeated big outputs (logs, page dumps) | Replace old outputs with one-line stubs |
| **File scratchpad / todo list** | Multi-hour or multi-step plans | Plan and progress live in files the agent re-reads |
| **Sub-agents** | A sub-task would flood the main window | Worker returns a short summary (multi-agent.md) |

Claude compaction rule: append the full `response.content` (not just the text) back into `messages` every turn, or the compaction state is lost silently.

## 3. Prompt caching for agents

- Caching is a prefix match over `tools → system → messages`. One changed byte invalidates everything after it.
- Keep volatile values (timestamps, request IDs, the user's question) after the last cache breakpoint. `datetime.now()` in the system prompt silently kills caching.
- Sort JSON keys and keep the tool list deterministic.
- Need to change instructions mid-session? Append a system/reminder message instead of editing the system prompt.
- Need a cheaper model for a sub-task? Spawn a sub-agent; don't switch the main loop's model (caches are per model).
- Need new tools mid-session? Use tool search (appends) rather than swapping the tool list.
- Verify with the usage field (`cache_read_input_tokens` on Claude). Zero across repeated calls means something in the prefix is changing.

## 4. Memory layers: use the shallowest that works

| Layer | Lives in | Use for |
|---|---|---|
| Working | The context window | Current task state |
| Short-term | Session files, in-memory cache | Intermediate results, conversation state |
| Long-term | Key-value / document store | User preferences, domain facts |
| Entity | Entity registry | "John Doe" is the same person across sessions |
| Temporal graph | Graph with `valid_from` / `valid_until` | Facts that change; "what was true on March 1?" |

Escalation path: (1) prototype with plain files (JSON facts with timestamps; filesystem baselines are competitive on some memory benchmarks), (2) vector store with metadata when you need similarity search and per-user isolation (Mem0-style), (3) temporal knowledge graph when you need relationships and time (Zep/Graphiti; Cognee for dense multi-layer graphs), (4) self-editing tiered memory when the agent must manage its own memory (Letta). Pick by retrieval shape, not brand; re-check benchmark claims before quoting them.

## 5. Retrieval strategies

| Strategy | Good for | Weak at |
|---|---|---|
| Semantic (embeddings) | Direct factual lookups | Multi-hop reasoning |
| Entity / graph traversal | "Everything about X" | Needs graph structure |
| Temporal filter | Changing facts | Needs validity metadata |
| Hybrid (semantic + keyword + graph) | Best accuracy | Most infrastructure |

## 6. Memory hygiene rules

1. Retrieve just in time with relevance filtering; never dump all memories into the prompt.
2. Track validity for any fact that can change. **Invalidate, don't delete**: history answers "what did we know then".
3. Consolidate on a trigger (count threshold, falling retrieval quality, or a schedule).
4. Conflicts: prefer the most recent `valid_from`; if confidence is low, surface the conflict to the user.
5. Empty retrieval: widen the search (drop entity filter, widen time range), then ask the user.
6. Never block a response on a memory write; queue and retry.
7. Pin one embedding model per store; re-embed everything if you change it.
8. Prefer generic relation types and property bags over rigid graph schemas.
9. Privacy: retention limits, deletion on request, per-user isolation keys (never a shared "default" user in multi-user apps).
10. Measure before and after changes (LoCoMo / LongMemEval-style question sets, or your own 20–50 recall questions).

## 7. Platform memory primitives

- Claude API memory tool: the model reads/writes a `/memories` directory; you implement storage.
- Claude Managed Agents: memory stores attached to a session at creation (`read_write` or read-only, with instructions).
- Deep Agents: `MemoryMiddleware` + a LangGraph `Store`; files via `FilesystemMiddleware` backends.
- ADK: memory service and sessions (Agent Platform Sessions, Cloud SQL, or in-memory for dev).
- Mastra: memory module with threads; requires a storage adapter.

## 8. Pitfalls

- Stuffing everything into context "just in case".
- No validity tracking → stale facts silently steer the agent.
- Over-engineering a graph on day one.
- Mixing embedding models in one store.
- Caching broken by a timestamp or an unsorted dict in the prefix.
