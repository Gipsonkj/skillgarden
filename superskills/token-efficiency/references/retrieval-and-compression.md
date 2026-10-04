# Retrieval vs long context, and compressing what you send

> Distilled from: context-optimization and its optimization_techniques reference (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT), prompt-caching (sickn33/agentic-awesome-skills, MIT), llm-cost-optimizer (alirezarezvani/claude-skills, MIT), claude-api cost-optimization notes (anthropics/skills, Apache-2.0)

Context windows are now large enough to paste whole corpora. That doesn't make it cheap. The question for every request is: what is the smallest context that still answers well, and is the rest better cached, retrieved, or left out?

## 1. Long context, cached long context, or retrieval

| Approach | What you send | Good when | Weak when |
|---|---|---|---|
| **Everything in context, uncached** | Whole corpus every call | One-off analysis of a big document | Any repeated use: you pay full input every time |
| **Cached long context (CAG)** | Whole corpus as a stable cached prefix, question last | Corpus is stable, fits comfortably (the source's rule of thumb: under ~100K tokens), queries are broad, latency matters | Corpus changes often (each change rewrites the cache), corpus is huge, traffic is sparse (cache expires) |
| **Retrieval (RAG)** | Top few relevant chunks + question | Large or fast-changing corpus, specific factual questions | Multi-hop or "everything about X" questions; retrieval misses look like wrong answers |
| **Tool on demand** | Short index; the model fetches sections | Calls need one section of a big reference | Most calls need most of it (then cache it instead) |

Rules:
1. Do the arithmetic per query: cached corpus = cache-read price x corpus tokens + new tokens; RAG = retrieval cost + chunk tokens. At high volume on a stable corpus, caching often wins; at low volume or with a changing corpus, retrieval does.
2. A smaller context isn't automatically cheaper: an agent that has to go looking may spend extra turns. Validate on real questions, comparing cost per correct answer.
3. Put the facts that matter at the start or end of a long context; the middle gets less attention.
4. Building the retrieval system itself (embeddings, stores, hybrid search, memory): `ai-agents` -> `references/context-and-memory.md`.

## 2. Retrieve narrowly

- Small top-k, then rerank; send only chunks above a relevance cut-off.
- Filter by metadata (product, version, date, tenant) before similarity search.
- Chunk at natural boundaries with titles kept, so fewer chunks carry the answer.
- Repeated irrelevant retrievals are a signal to tighten scope, not to raise k.
- Prefer narrow tool accessors (`get_policy(claim_id)`) over broad dumps (`get_all_policies()`); give list tools `limit`, `fields` and date-range parameters.

## 3. Budget the window by category

Decide shares before the session, and act when a category runs over:

```yaml
budgets:              # example from the source; tune per app
  tool_outputs: 35%
  message_history: 30%
  retrieved_documents: 20%
  reserved_buffer: 15%
triggers:
  tool_outputs_over_budget: mask resolved observations
  total_over_70_percent: compact message history
  repeated_irrelevant_retrievals: tighten retrieval scope
```

| What dominates | First action | Second |
|---|---|---|
| Tool outputs (>50%) | Mask used-up observations | Compact remaining turns |
| Retrieved documents | Summarise or narrow retrieval | Partition if documents are independent |
| Message history | Compact, keeping decisions | Start a sub-task in a fresh context |
| Several things | Stable-prefix caching first, then masking and compaction | |
| Near the limit while debugging | Mask only resolved outputs; keep error details | |

## 4. Compress in this order

1. **Mask observations** (cheapest, near-zero quality loss). Replace a used-up tool output with a reference and its key point: `[obs 7 elided. Key: 3 failing tests in auth/. Full output: /tmp/obs7.txt]`. Never mask the latest turn, anything in active reasoning, or errors while debugging. Mask duplicates and boilerplate immediately. Source targets: 60-80% reduction of masked content with under 2% quality impact.
2. **Compact history** when the window passes ~70-80%. Keep by type:
   - Tool outputs: findings, metrics, error codes, conclusions. Drop raw dumps and stack traces once resolved.
   - Conversation: decisions, commitments, user preferences, constraints. Drop pleasantries and exploration already concluded.
   - Retrieved documents: the facts used. Drop supporting elaboration.
   Never compress the system prompt. Target 50-70% reduction; past 70%, audit the summary for lost facts. Compact before the model is under heavy pressure (summaries written above ~85% utilisation drop goals and constraints), or use a separate call with a clean context.
3. **Partition** to sub-agents only when the job would exceed ~60% of the window and splits into 3+ independent parts; below that, coordination costs more than it saves.

Every edit to earlier context invalidates the cache after it. Batch edits, and prefer editing near the end.

## 5. Compress the prompt text

- Remove filler instructions and politeness: "Please carefully analyze the following text and provide a summary" -> "Summarise:".
- Remove context that appears in both system and user messages.
- Strip markup the model doesn't need (HTML, decorative markdown) from inserted documents.
- Downscale images to what the task needs; cost follows pixel area, not information.
- Keep every task-critical instruction, constraint and example that changes behaviour. Over-compression causes wrong or vague answers and retries that cost more than the saving. If quality drops after a cut, restore that part and mark it as compression-resistant.
- Compressing memory files for Claude Code: `fixed-overhead.md` section 4.

## 6. Measure every technique

If a technique doesn't measurably improve cost, latency or quality on your workload, remove it: the machinery itself spends tokens and adds latency. Track per technique: tokens saved, quality on a fixed question set, and added latency.

## Checklist

- [ ] Choice between cached context, retrieval and tool-on-demand made with per-query arithmetic
- [ ] Retrieval narrow (filters, small top-k, rerank); tools return narrow results
- [ ] Masking before compaction; compaction at 70-80%, not at the limit
- [ ] System prompt and critical constraints never compressed
- [ ] Quality checked on a fixed question set after each change
