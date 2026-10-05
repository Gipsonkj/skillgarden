# Batch, routing, budgets, gateways and response caching in API apps

> Distilled from: llm-cost-optimizer (alirezarezvani/claude-skills, MIT), cost-aware-llm-pipeline (affaan-m/ECC, MIT), prompt-caching (sickn33/agentic-awesome-skills, MIT), redis-semantic-cache (redis/agent-skills, MIT), claude-api cost-optimization notes (anthropics/skills, Apache-2.0). OpenAI Batch and Flex, LiteLLM and OpenRouter sections written in our own words from their official docs (see CREDITS.md)

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
| Several apps or developers share one provider key with no per-key spend | Consider a gateway with a key and budget each (section 7) |
| Free-tier users on the same model as paid | Tier model access by plan |

## 2. Batch anything nobody waits on

**Pick a tool**

| Situation | Use | Why |
|---|---|---|
| The app already uses one of these | That one | No new integration to test |
| Claude, unattended bulk work | Message Batches (`claude-api-levers.md`) | 50% off every token (Oct 2026) |
| OpenAI, unattended bulk work (nightly tagging, evals, backfills) | Batch API (below) | 50% off, its own rate-limit pool, results within 24 hours |
| OpenAI, low-priority calls that must stay synchronous (one-off enrichment, evals run from a script) | Flex (below) | Batch prices without a file round trip; slower and sometimes unavailable |
| A user is waiting (chat, live assistant) | Standard processing | Neither batch nor Flex is safe for live traffic |
| Not sure which provider or account the job runs on | Ask the user | Discounts and limits are per provider and model |

- Fits: evals, backfills, nightly reports, bulk classification and extraction, embeddings refresh.
- Doesn't fit: user-facing requests, multi-step tool loops (batch requests are single-shot).
- Results can arrive out of order: key them by your own id. Handle per-item errors and expiry; re-queue failures.
- Off-peak async queues help even without a batch endpoint: they flatten rate-limit pressure and let you group similar requests behind one cached prefix.
- A batch spends money in one go: show the user the line count, model and an estimated cost from current prices, and wait for a yes before creating it.

### OpenAI Batch API (as of OpenAI's batch guide, Oct 2026)

1. **Write a `.jsonl` file,** one request per line with `custom_id`, `method` (`POST`), `url` and `body` (the normal request for that endpoint). Supported `url`s include `/v1/responses`, `/v1/chat/completions`, `/v1/embeddings`, `/v1/completions` and `/v1/moderations`.
   ```json
   {"custom_id": "ticket-48213", "method": "POST", "url": "/v1/responses", "body": {"model": "<model from config>", "instructions": "<same tagging rules for every line>", "input": "<ticket text>", "prompt_cache_key": "ticket_tagger_v3"}}
   ```
2. **Upload and create** (key from `OPENAI_API_KEY` in the environment, never in code):
   ```python
   from openai import OpenAI
   client = OpenAI()
   f = client.files.create(file=open("tickets.jsonl", "rb"), purpose="batch")
   batch = client.batches.create(input_file_id=f.id, endpoint="/v1/responses",
                                 completion_window="24h", metadata={"job": "nightly-tagging"})
   ```
3. **Poll** `client.batches.retrieve(batch.id)`: `status` moves through `validating`, `in_progress`, `finalizing` to `completed` (or `failed`, `expired`, `cancelling`, `cancelled`); `request_counts` gives total, completed and failed.
4. **Collect:** `client.files.content(batch.output_file_id).text` for successes, `error_file_id` for failures. Output order may not match input: join on `custom_id`. Re-queue failed and expired lines.
5. **Stop** a wrong batch with `client.batches.cancel(batch.id)` (it can sit in `cancelling` for up to 10 minutes).

Limits: `completion_window` is `"24h"` only; at most 50,000 requests and 200 MB per batch (a 30,000-ticket night fits in one file; split above that); unfinished work expires after 24 hours. Batch traffic uses a separate rate-limit pool, so it does not eat into the live app's per-model limits. Keep the shared instructions first and identical in every line anyway, and only count on a prompt-cache saving on top of the 50% if the output usage shows `cached_tokens`.

### OpenAI Flex processing

For Responses or Chat Completions calls that can wait and may fail: set `service_tier="flex"`. Tokens are billed at Batch API rates, and prompt caching discounts still apply. It is in beta on a limited set of models (see OpenAI's pricing page).

```python
client = OpenAI(timeout=900.0)   # SDK default is 10 minutes; Flex is slower, so allow 15
resp = client.responses.create(model=MODEL, instructions=RULES, input=text, service_tier="flex")
```

- When capacity is short the call fails with `429 Resource Unavailable`, which is not charged. Retry with exponential backoff, or, if the higher price is acceptable, retry with `service_tier="auto"` (or no `service_tier`) for standard processing.
- Never put Flex on the live chat path; give it its own client or call site so a retry storm can't touch user traffic.

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

## 7. Gateways: one place for keys, budgets, routing and spend

A gateway sits between the app (or Claude Code) and the providers. It is worth it when several apps, teams or developers share providers and you need spend per key, hard budgets or one bill for many models. One app on one provider rarely needs one: log usage per request instead (`measuring-usage.md` section 5).

**Pick a tool**

| Situation | Use | Why |
|---|---|---|
| The team already runs or pays for a gateway | That one | Budgets and logs already live there |
| Self-hosted, provider keys stay on your servers, per-key or per-team budgets | LiteLLM proxy | Open source; virtual keys with `max_budget`; spend endpoints |
| Many models from different vendors behind one key, no servers to run | OpenRouter | Hosted, OpenAI-compatible; cost in every response; credit fee on top-ups |
| Per-developer Claude Code spend on Bedrock, Google Cloud or Foundry | LiteLLM, or Anthropic's Claude apps gateway (see Claude Code's cost docs) | Claude Code's own docs name both for per-user attribution there |
| Unsure whether a gateway is allowed, or which one the user logs into | Ask the user | A gateway sees every prompt and holds provider keys |

A gateway is one more service that sees every prompt and response. Keep provider and gateway keys in environment variables or the gateway's own config, never in the repo or chat, and prefer the self-hosted option for sensitive data. Anything that creates keys or raises a budget changes what can be spent: show the exact request and wait for a yes.

### LiteLLM proxy (as of docs.litellm.ai, Oct 2026)

- **Install and run:** `uv tool install 'litellm[proxy]'` (or `pip install 'litellm[proxy]'`; LiteLLM 1.84.0+ needs Python 3.10+), then `litellm --config config.yaml`; it listens on port 4000 and is OpenAI-compatible.
- **Config:**
  ```yaml
  model_list:
    - model_name: claude-main                  # what clients ask for
      litellm_params:
        model: anthropic/<model id>
        api_key: os.environ/ANTHROPIC_API_KEY  # read from the environment
  general_settings:
    master_key: os.environ/LITELLM_MASTER_KEY  # must start with sk-
  ```
- **Postgres is required** for virtual keys and spend (`DATABASE_URL=postgresql://...`); without it, requests with a virtual key fail with `No connected db.` and budgets are not enforced.
- **A key per app, team or developer, with a budget:**
  ```bash
  curl -s http://localhost:4000/key/generate \
    -H "Authorization: Bearer $LITELLM_MASTER_KEY" -H 'Content-Type: application/json' \
    -d '{"models": ["claude-main"], "max_budget": 50, "budget_duration": "30d", "rpm_limit": 60, "metadata": {"team": "support"}}'
  ```
  `max_budget` is USD; `budget_duration` takes forms like `"30m"`, `"24h"`, `"30d"` (no duration = never resets). Budgets also exist per user (`/user/new`), team (`/team/new`) and end customer. Over budget, requests fail with an `ExceededTokenBudget` (or `ExceededBudget` for team members) error.
- **Read spend:** the `x-litellm-response-cost` response header per call; `/spend/logs` per request; `/user/daily/activity` daily by model, provider and key; `/global/spend/report` by team, customer, key or user. Tag requests with `"metadata": {"tags": ["job:nightly-tagging"]}` or the `x-litellm-tags` header; some tag and report features are Enterprise-only.
- **Caching through it:** Anthropic `cache_control` blocks pass through unchanged; responses carry `prompt_tokens_details.cached_tokens`, `cache_creation_input_tokens` and `cache_read_input_tokens`, and LiteLLM's cost calculation prices cached tokens. `prompt_tokens` includes cache hits and misses (inclusive accounting).
- **Traces:** add `success_callback: ["langfuse"]` under `litellm_settings` with the Langfuse keys in the environment to send every call to Langfuse (`measuring-usage.md` section 8).
- **Claude Code through it:** set `ANTHROPIC_BASE_URL=http://<proxy>:4000` and `ANTHROPIC_AUTH_TOKEN=<virtual key>` in the shell or the `env` block of `~/.claude/settings.json` (never a committed `.claude/settings.json`), then check `/status`. With a gateway credential active, requests no longer use the claude.ai subscription: they are billed per token to whoever owns the provider key. Say that to the user before switching. Anthropic's docs note LiteLLM is unaffiliated and not security-audited by them.

### OpenRouter (as of openrouter.ai/docs, Oct 2026)

- **Access:** OpenAI-compatible at `https://openrouter.ai/api/v1`; point the OpenAI SDK's `base_url` there with the key from an environment variable (e.g. `OPENROUTER_API_KEY`).
- **Cost per call is in every response:** `usage.cost`, `prompt_tokens`, `completion_tokens`, `prompt_tokens_details.cached_tokens`, `prompt_tokens_details.cache_write_tokens`, `completion_tokens_details.reasoning_tokens`; when streaming, in the last SSE message. Look up a past call by its `id` through the `/generation` endpoint. The old `usage: {include: true}` flag does nothing now.
- **Route on price:** a `provider` object per request: `"sort": "price"` (or the `:floor` model suffix), `"max_price": {"prompt": 1, "completion": 4}` in USD per million tokens, `"allow_fallbacks": false` to fail rather than fall back to other providers, `"data_collection": "deny"` or `"zdr": true` to keep prompts away from providers that store them. By default it balances load weighted toward cheaper providers.
- **Caching:** OpenAI, DeepSeek, Grok and Gemini 2.5+ cache automatically. Claude needs `cache_control`: top-level `{"cache_control": {"type": "ephemeral"}}` for automatic caching or on content blocks (up to 4 breakpoints; `"ttl": "1h"` for the longer cache). After a cached request it keeps routing that model to the same provider; pass a `session_id` (body) or `x-session-id` header to control stickiness, which lapses after 10 minutes idle. The `cache_discount` field shows what caching saved.
- **Limits and balance:** `GET /api/v1/key` returns `limit`, `limit_remaining`, `usage_daily`, `usage_weekly`, `usage_monthly`. A management key (it cannot make completion calls) creates capped keys: `POST /api/v1/keys` with `name`, `limit` and `limit_reset` (`"daily"`, `"weekly"`, `"monthly"`). A negative balance returns HTTP 402, even on free models.
- **Fees:** model prices are passed through from providers; buying credits costs 5.5% by card ($0.80 minimum) or 5% in crypto, and bring-your-own-key usage above the free allowance costs 5%. Count the fee when comparing with going direct.

## 8. Compress the prompt, not the instructions

- Strip filler from prompts ("Please carefully analyze the following text and provide..." -> "Analyze:"), duplicated context between system and user messages, and HTML or markdown the model doesn't need.
- Over-compression causes vague or wrong outputs and retries that erase the saving. If quality drops, restore that section and mark it compression-resistant.
- Deeper compression and retrieval choices: `retrieval-and-compression.md`.

## 9. Pitfalls

- Optimising prompts before any measurement exists.
- One global `max_tokens`: some endpoints need 2,000 tokens, others 50.
- Semantic cache with one shared index for all tasks, no TTL, and no tenant scope.
- Retrying 400s in a loop.
- Treating cost work as a one-off: prices, traffic and features drift. Review weekly with alerts.

## Checklist

- [ ] Logging per request exists before any optimisation
- [ ] Unattended work on batch (or Flex on OpenAI); user-facing work on standard processing
- [ ] Batch results joined on `custom_id`; failed and expired lines re-queued
- [ ] Routing rules in config, decisions logged, cascade has a real check
- [ ] Budgets per feature with 80% alerts and a degradation path
- [ ] Retries only on transient errors
- [ ] Response cache keyed by model and params, TTL set, scoped per tenant, threshold tuned
- [ ] Gateway (if any) gives each app or team its own key with a budget; provider keys stay in the environment
