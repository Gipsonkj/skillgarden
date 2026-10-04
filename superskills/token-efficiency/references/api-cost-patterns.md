# Batch, routing, budgets and response caching in API apps

> Distilled from: llm-cost-optimizer (alirezarezvani/claude-skills, MIT), cost-aware-llm-pipeline (affaan-m/ECC, MIT), prompt-caching (sickn33/agentic-awesome-skills, MIT), redis-semantic-cache (redis/agent-skills, MIT), claude-api cost-optimization notes (anthropics/skills, Apache-2.0)

Patterns for apps that call an LLM API, provider-neutral. Savings percentages below are the sources' rules of thumb, not guarantees: measure on your traffic. Prompt caching has its own guide (`prompt-caching.md`); Claude parameters are in `claude-api-levers.md`.

## 1. Proactive flags

Raise these whenever you see an LLM call being built or reviewed, even if nobody asked about cost:

| Signal | Action |
|---|---|
| No per-request token or cost logging | Add it first; it is deliverable number one (`measuring-usage.md`) |
| Every request hits the same (largest) model | Design routing (section 3) |
| System prompt over ~2,000 tokens sent on every request | Cache it (`prompt-caching.md`) |
| `max_tokens` unset, or one global value | Set per endpoint from measured p95 output length |
| Unattended bulk jobs on the synchronous API | Move to batch (section 2) |
| Retries on every error | Retry only transient errors (section 5) |
| No budget or alert | Add per-feature budgets and an alert at 80% (section 4) |
| Free-tier users on the same model as paid | Tier model access by plan |

## 2. Batch anything nobody waits on

- Most providers have an asynchronous batch endpoint at a discount (Claude Message Batches: 50% off every token, as of Oct 2026; check your provider's current terms).
- Fits: evals, backfills, nightly reports, bulk classification and extraction, embeddings refresh.
- Doesn't fit: user-facing requests, multi-step tool loops (batch requests are single-shot).
- Results can arrive out of order: key them by your own id. Handle per-item errors and expiry; re-queue failures.
- Off-peak async queues help even without a batch endpoint: they flatten rate-limit pressure and let you group similar requests behind one cached prefix.

## 3. Route by complexity

```python
# Model ids and thresholds live in config, never inline.
def select_model(task_type: str, text_len: int, items: int) -> str:
    if task_type in CONFIG.small_tasks:            # classify, extract, yes/no
        return CONFIG.models["small"]
    if text_len >= CONFIG.big_text or items >= CONFIG.many_items:
        return CONFIG.models["frontier"]
    return CONFIG.models["mid"]
```

1. Start with rules (endpoint, task type, input size, user tier). Add a learned classifier only if rules misroute and its latency fits.
2. Log the decision, model and outcome per request; tune thresholds from data after a week or two.
3. Even routing 20% of traffic to a cheaper tier is a real saving. Start with the obvious simple endpoints.
4. For a quality floor, cascade: small model first, escalate on a failed check (schema invalid, low confidence, tests fail). See `model-and-effort.md` section 5.
5. Route per request or per conversation, never switch models inside one cached conversation.

## 4. Budgets and graceful degradation

- **Budget envelopes:** per feature, per user tier, per day. Hard limit plus a soft alert at 80%.
- **Check before the call, record after it.** Keep an append-only cost record per call (model, input, output, cache read/write, cost) so totals can be audited.

```python
@dataclass(frozen=True)
class CostRecord:
    model: str; input_tokens: int; output_tokens: int
    cache_read: int; cache_write: int; cost_usd: float
# tracker = tracker.add(record) returns a new tracker; never mutate in place
if tracker.total_cost >= budget.limit: raise BudgetExceeded(...)
```

- **Price table in config,** with the date it was copied from the provider's pricing page. Never hard-code prices from memory.
- **When a budget is hit, degrade in steps:** smaller model -> cached answer -> queue for async processing -> clear error. Don't silently drop quality on paid tiers.

## 5. Retry narrowly

- Retry only transient failures: connection errors, rate limits (429), server errors (5xx, overloaded). Exponential backoff with jitter, max ~3 attempts, honour `retry-after`.
- Fail fast on authentication, permission, bad-request and validation errors: retrying them only bills again (and some SDKs already retry transient errors; don't stack a second retry loop on top).
- A response cut off at `max_tokens` is not a transient error: fix the cap or the prompt.

## 6. Response caching (skip the model call)

Prompt caching makes a call cheaper; response caching avoids it. Two kinds:

**Exact match**
- Key = hash of (normalised prompt + model + temperature + relevant params + prompt version).
- Only cache low-temperature, deterministic workloads (classification, extraction, FAQ). Skip when temperature is above ~0.5 or answers should vary.
- Always set a TTL that matches how fast the source data changes.
- Invalidate on source change: version prefix in the key (bump to invalidate all), content hash of the source document stored with the entry, or tag-based invalidation per source.

**Semantic (embedding similarity)**
- Cache-aside: search by similarity -> hit returns the stored answer -> miss calls the model and stores the result.
- Threshold (cosine similarity, per the Redis LangCache guidance): 0.95+ for customer-facing answers where a wrong answer is costly; ~0.9 as a starting default; ~0.8 only for internal tools or FAQ deduplication. Tune by watching hit rate and spot-checking hits for relevance.
- **Separate caches (or attribute filters) per task type.** A password-reset question and a code question can be close in embedding space; one shared cache returns nonsense.
- Never share entries across users or tenants when answers contain personal or tenant data. Scope keys by tenant.
- Pin one embedding model per cache; changing it means re-embedding.
- Hosted semantic caches store your prompts and responses on that vendor's service (Redis LangCache is a preview Redis Cloud service). For sensitive data prefer a self-hosted vector index (for example Redis with vector search, or Postgres with pgvector).
- Expected hit rates vary widely (the llm-cost-optimizer source suggests 30-60% on repeated-query workloads). Below ~20%, prompts are too varied: stop and rethink what you cache.

**Latency trap:** a cache lookup plus a cache write on a miss can make misses slower than no cache. Keep the lookup timeout short (tens of ms), write asynchronously, and cache only high-frequency patterns if hit rates are low.

## 7. Compress the prompt, not the instructions

- Strip filler from prompts ("Please carefully analyze the following text and provide..." -> "Analyze:"), duplicated context between system and user messages, and HTML or markdown the model doesn't need.
- Over-compression causes vague or wrong outputs and retries that erase the saving. If quality drops, restore that section and mark it compression-resistant.
- Deeper compression and retrieval choices: `retrieval-and-compression.md`.

## 8. Pitfalls

- Optimising prompts before any measurement exists.
- One global `max_tokens`: some endpoints need 2,000 tokens, others 50.
- Semantic cache with one shared index for all tasks, no TTL, and no tenant scope.
- Retrying 400s in a loop.
- Treating cost work as a one-off: prices, traffic and features drift. Review weekly with alerts.

## Checklist

- [ ] Logging per request exists before any optimisation
- [ ] Unattended work on batch; user-facing work synchronous
- [ ] Routing rules in config, decisions logged, cascade has a real check
- [ ] Budgets per feature with 80% alerts and a degradation path
- [ ] Retries only on transient errors
- [ ] Response cache keyed by model and params, TTL set, scoped per tenant, threshold tuned
