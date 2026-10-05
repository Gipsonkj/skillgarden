# Prompt caching for API apps

> Distilled from: audit-prompt-caching (sernote/audit-prompt-caching, MIT), prompt-caching (sickn33/agentic-awesome-skills, MIT), context-optimization (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT), llm-cost-optimizer (alirezarezvani/claude-skills, MIT), claude-api prompt-caching notes (anthropics/skills, Apache-2.0)

Prompt (prefix) caching lets a provider reuse the work it already did on the start of your prompt. Cached input is billed at a fraction of normal input and arrives faster. It only works when the start of the prompt is byte-identical across requests, so it is mostly a layout discipline. Claude-specific syntax and settings are in `claude-api-levers.md`; this guide is the method for any provider.

## 1. Is it worth it here? (applicability gate)

Cache only when all of these hold:
1. **Repeated:** the same prefix is sent many times (chatbot system prompt, agent loop, many questions over one document).
2. **Long enough:** above the provider's minimum cacheable size. Minimums are per model and change (from 512 to 6,144 tokens across providers as of the audit-prompt-caching references, Sep 2026; on Claude, 512 on Sonnet 5.5 and 1,024 on Sonnet 5, Oct 2026). Below the minimum the request runs uncached with no error.
3. **Frequent enough:** the next request arrives before the entry expires (minutes by default on most providers).
4. **Input-heavy:** if output tokens dominate cost, a perfect hit rate saves little. Compute output share first.
5. **Safe to share:** the cache scope matches your trust boundary (see section 6).

Not worth it: cold or sparse routes, unique prompts, short prompts, output-bound endpoints. Say "no change needed" when that is the answer.

## 2. Layout: stable first, volatile last

Order every request from most to least stable:

1. Tool definitions (deterministic order, sorted keys)
2. System prompt (frozen text)
3. Static reference material and few-shot examples
4. Conversation history (append-only)
5. The current question, user facts, dates, IDs (always last)

One changed byte invalidates everything after it. The silent cache killers:

| Killer | Fix |
|---|---|
| `Current date: {today}` or a timestamp in the system prompt | Move it into the latest user message |
| Request ID, trace ID, user name, tenant facts, cwd or git status early in the prompt | Move after the cached prefix |
| Tools or MCP schemas listed in a different order, or a tool list that changes per turn | Sort; freeze the tool set per session; use the provider's allowed-tools or deferred-loading form instead of rewriting the list. On Claude, mid-conversation tool changes (beta: `mid-conversation-tool-changes-2026-07-01`, or `inline-tools-2026-09-15` to define a tool inline) add or remove tools without losing the cache |
| JSON serialised with unsorted keys, or a schema regenerated per request | `sort_keys=True`; serialise once and reuse the string |
| Random or A/B few-shot examples before the stable part | Fix the examples; put variants after the prefix |
| Whitespace or template changes between deploys | Diff rendered prompts byte-for-byte in CI (section 5) |
| Editing the system prompt mid-conversation to add an instruction | Append the instruction as a new message instead. On Claude, append a mid-conversation system message (`{"role": "system", "content": "..."}`, placed right after a user turn) rather than editing the top-level `system` field, which invalidates the whole cached prefix |
| Compaction or masking that rewrites early messages every turn | Edit in rare large batches, near the end |
| Switching model, effort/reasoning setting or speed mode mid-conversation | Decide once per conversation; caches are per model, and some providers render reasoning settings into the prefix. Where per-message effort exists, use it instead of changing top-level effort (`model-and-effort.md` section 4b) |
| Prompts above 1-2K tokens split across "versions" by feature flags | One canonical render function per prompt family |

On Claude Sonnet 5.5 keep history append-only for another reason: replaying one of its thinking blocks after an edit to earlier history (system prompt, tools or an earlier message) can return a 400 error, and accounts created on or after 31 Aug 2026 are checked by default (Oct 2026 docs).

## 3. Explicit vs automatic caching

- **Automatic** (OpenAI on recent models, Gemini implicit, Claude top-level auto mode): the provider decides where the cached prefix ends. Simplest; works well for one growing conversation. It can write a new entry every request when the last block contains changing user text.
- **Explicit breakpoints** (Claude `cache_control`, Bedrock `cachePoint`, OpenAI explicit breakpoints on newer models, Gemini explicit cache objects): you mark where the stable prefix ends. Use them when many independent conversations share one static prefix, or when layers change at different rates (tools rarely, a document daily, history every turn). Put the marker on the last block whose whole prefix should stay identical.
- A robust agent-loop shape: one explicit breakpoint at the end of the static prefix plus automatic caching for the growing tail.

### OpenAI settings (Responses and Chat Completions, as of OpenAI's prompt-caching guide, Oct 2026)

Caching is on by default for supported models; there is nothing to enable, only the layout to get right and a few request fields.

| Setting | What it does | Use it when |
|---|---|---|
| Minimum size | 1,024 visible input tokens on GPT-5.6 and later; on earlier models it depends on the request (tools, images, schemas, reasoning settings) and cached tokens are rounded down to a multiple of 128 | Check before expecting any hit |
| `prompt_cache_key` | A stable string you send with every request that shares a prefix, e.g. `"ticket_tagger_v3"`. On earlier models it helps route related requests to the same cache; on GPT-5.6+ it is optional and separates cache accounting | Many requests share one prefix. On earlier models, keep each key to about 15 requests per minute in total across the prefixes using it: above that, overflow routing can happen. Partition busier traffic over a few keys with a stable mapping (`..._v3:0` to `..._v3:3`). Keys influence routing; they do not guarantee a hit |
| `prompt_cache_retention` (before GPT-5.6) | `"in_memory"`: usually 5-10 minutes idle, at most an hour. `"24h"`: usually around 30 minutes, kept up to 24 hours, on the models the guide lists (GPT-5.5, 5.4, 5.2, 5.1 and 5 families, GPT-4.1) | `"24h"` when gaps between requests can exceed a few minutes; it is the better chance of a hit, not a promise. Zero Data Retention organisations default to `"in_memory"`, others to `"24h"` |
| `prompt_cache_options: {"ttl": "30m"}` (GPT-5.6+) | Keeps an entry 30 minutes after its last write or reuse; `"30m"` is the only value | Replaces `prompt_cache_retention` on these models |
| `prompt_cache_breakpoint: {"mode": "explicit"}` (GPT-5.6+) | Set on an `input_text` content block to mark the end of a stable prefix; up to four cache writes per request | Several layers change at different rates (section 3 above) |

```python
# Responses API: fixed instructions and examples first, the changing ticket last
resp = client.responses.create(
    model=MODEL,                         # from config
    instructions=TAGGING_INSTRUCTIONS,   # the same 6,000 tokens every call, byte for byte
    input=ticket_text,                   # volatile part last
    prompt_cache_key="ticket_tagger_v3",
)
u = resp.usage
print(u.input_tokens, u.input_tokens_details.cached_tokens)   # cached is part of input_tokens
```

Price shape on GPT-5.6+: cached reads at 0.1x uncached input (0.05x on GPT-6.1 Sol) and cache writes at 1.25x, reported as `cache_write_tokens`; GPT-5.5 and earlier charge no cache-write premium. Caches are never shared across organisations. Check current pricing before quoting a saving.

## 4. Verify from usage fields, never from reading code

Every provider reports cache hits in the response usage. Log them per request, by route and model.

| Provider (as of Sep 2026, check current docs) | Read | Accounting |
|---|---|---|
| Anthropic | `cache_read_input_tokens`, `cache_creation_input_tokens`, `input_tokens` | Exclusive: `input_tokens` is only the uncached part; total input = all three |
| OpenAI (Chat Completions / Responses) | `prompt_tokens_details.cached_tokens` / `input_tokens_details.cached_tokens`; `cache_write_tokens` on newer models | Inclusive: cached is a subset of the input total |
| Gemini | `cached_content_token_count` (Generate Content) or `total_cached_tokens` (Interactions) | Inclusive |
| Bedrock Converse | `CacheReadInputTokens`, `CacheWriteInputTokens` | Check the reference: differs by API |

Getting the denominator wrong is the most common reporting error. Hit rate = cached read tokens / total input tokens, with total input computed per the accounting column. Wrappers and gateways (OpenRouter, Azure, LiteLLM) may change which applies: check before trusting a ratio. LiteLLM's `prompt_tokens` counts cache hits and misses together; OpenRouter returns `prompt_tokens_details.cached_tokens` and `cache_write_tokens` in every response's usage. Gateway setup and their own cache settings: `api-cost-patterns.md` section 7.

Healthy signs:
- In a warmed agent loop, cache reads dominate uncached input, and cache writes per turn are about one turn's worth, not the whole conversation.
- In a shared-prefix app, reads appear from the second request on.

Diagnose by pattern:

| Symptom | Likely cause |
|---|---|
| Reads and writes both zero | Not enabled, below the minimum size, unsupported model or surface, no eligible block |
| Writes every request, reads zero | Something volatile inside the "stable" part; TTL expiring between requests; breakpoint placed after changing text |
| Writes much larger than reads over a day | Contexts being rebuilt: restarts, many fresh sessions, idle gaps past TTL, model or effort switches |
| Good hit rate, small savings | Output tokens or tool time dominate; caching is working, look elsewhere |
| Faster first token, same total latency | Decode (output length) or tool execution dominates |
| Hit rate dropped after a deploy | Prompt or tool-order change; prefix fingerprint will show where |
| Same prompt, low hits across services | Cache scope: different workspace, region, model or routing per service |

Bundled helpers (stdlib Python, local files only):

```bash
# hit ratio, write/read ratio and output share from a JSON, JSONL or CSV usage log
python3 scripts/audit-prompt-caching/analyze_usage_logs.py usage.jsonl
python3 scripts/audit-prompt-caching/analyze_usage_logs.py usage.jsonl --jsonl-normalized   # per event, with denominator status
# where two rendered prompts or request bodies first differ
python3 scripts/audit-prompt-caching/prefix_stability_check.py req1.json req2.json --canonical-json
```

`analyze_usage_logs.py` flags ambiguous accounting (`denominator_status: ambiguous`); don't quote a hit rate from an ambiguous log. Pass `--accounting-mode inclusive|additive` once you know which applies.

## 5. Guard it in CI

Add a smoke test that renders the prompt for two different users, dates and questions, fingerprints the cacheable prefix (system + tools + stable early messages), and fails when the fingerprints differ or change unexpectedly between commits. `prefix_stability_check.py` returns exit code 1 with the first differing byte, which is enough for a test. Log per request: prompt version, prefix hash, tool-name hash and count, model, cache read/write fields, output tokens.

## 6. Economics and trust

**Write premium.** Some providers charge more for the first (cache-writing) request than for normal input (Claude: 1.25x for the 5-minute TTL and 2x for 1 hour; OpenAI's newer models 1.25x; reads around 0.1x or less, and on Claude 0.1x on Sonnet 5.5, 0.05x on Opus 5.5, 0.025x on Fable 5.1; all as of Sep-Oct 2026, check current pricing). With write multiplier `w` and read multiplier `r` (relative to normal input), caching saves input cost when the share of cached tokens that are reads exceeds `(w - 1) / (w - r)`. Example: `w = 1.25, r = 0.1` gives about 22%; `w = 2, r = 0.1` gives about 53%. Sparse traffic that writes often and reads rarely can cost more than no caching.

Estimate before changing anything, with current prices passed in explicitly:

```bash
python3 scripts/audit-prompt-caching/estimate_cache_roi.py --requests 10000 \
  --static-tokens 6000 --dynamic-tokens 400 --output-tokens 300 \
  --hit-rate 0.85 --cache-write-rate 0.05 \
  --input-price-per-mtok <P_in> --cached-input-price-per-mtok <P_read> \
  --cache-write-input-price-per-mtok <P_write> --output-price-per-mtok <P_out>
```

It reports savings, and `output_share_of_baseline_cost`: if that is high, caching won't move the bill much.

**Trust.** Provider caches are scoped (per organisation or workspace on most). Per-user cache keys or salts are correct for sensitive data even though they lower hit rates; report it as an expected efficiency loss, not a bug. Never log raw cache keys or session identifiers; log a keyed hash.

## 7. Response caching is a different thing

Prompt caching reuses the prefix computation and still runs the model. Response caching (exact or semantic) skips the model call entirely and returns a stored answer. Keep them separate in reports: a gateway response-cache hit is not a provider prefix hit. Response caching: `api-cost-patterns.md`.

## Checklist

- [ ] Applicability gate passed (repeated, long, frequent, input-heavy, safe)
- [ ] Stable-to-volatile order; no timestamps, IDs or unsorted JSON in the prefix
- [ ] Breakpoints on the end of the stable prefix where many conversations share it
- [ ] Hit rate measured from usage fields with the right denominator, per route and model
- [ ] Write premium and output share checked before claiming savings
- [ ] CI check fails when the cacheable prefix changes
