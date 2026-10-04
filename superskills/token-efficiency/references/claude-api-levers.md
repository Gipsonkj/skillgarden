# Claude API cost levers

> Distilled from: claude-api prompt-caching, cost-optimization and token-counting notes (anthropics/skills, Apache-2.0; read from the copy bundled with Claude Code, cached 25 Sep 2026), audit-prompt-caching Anthropic reference (sernote/audit-prompt-caching, MIT; reviewed 22 Sep and 2 Oct 2026), cost-aware-llm-pipeline (affaan-m/ECC, MIT)

Vendor-specific guide for apps on the Claude API. Parameter names, betas, model support, minimums and prices change often. Everything here is as of the sources above: check the live docs (platform.claude.com/docs) or the `claude-api` skill before quoting a number or shipping a beta header. Building the agent itself (tool loop, Agent SDK, Managed Agents) is `ai-agents` work.

## 1. Order of levers

Free wins first, trade-offs last:

1. Prompt caching (stays on)
2. Input hygiene: smaller, deferred or on-demand context
3. Loop hygiene in long agents
4. Output hygiene
5. Batch for anything nobody waits on
6. Effort, then task budgets (trade-offs: measure on an eval)
7. Model choice (last, deliberately; `model-and-effort.md`)

Judge every change on cost per completed task, one lever per change, keep or revert.

## 2. Prompt caching on Claude

- **Prefix order:** `tools` -> `system` -> `messages`. A change in an earlier level invalidates everything after it.
- **Markers:** `"cache_control": {"type": "ephemeral"}` (5-minute TTL) or `{"type": "ephemeral", "ttl": "1h"}` on a content block (system text, tool definition, message block). Up to 4 breakpoints per request. When mixing TTLs, 1-hour entries come before 5-minute ones.
- **Automatic mode:** a top-level `cache_control` on the request places the marker on the last cacheable block. Simplest for one growing conversation; add an explicit marker at the end of the static prefix when many conversations share it.
- **Minimum size** is per model (512 to 4,096 tokens as of Sep 2026, and not monotonic across generations). Below it nothing caches and nothing errors. Re-check after any model change.
- **Lookback:** a read searches back about 20 blocks from the active breakpoint. In long conversations add an intermediate breakpoint before the active one moves more than 20 blocks past the last write.
- **TTL clock** starts when the writing or reading request starts; generation time counts. A read refreshes the timer at no extra cost.

| Start-to-start gap between requests sharing the prefix | TTL |
|---|---|
| Under 5 minutes (agent loops, steady traffic) | 5-minute; strictly cheaper |
| 5 to 60 minutes (user replies after a while) | 1-hour, or a keep-alive (below) |
| Over an hour | Neither: pre-warm on a schedule or accept the miss |

- **Keep-alive:** re-sending the last request with `max_tokens: 0` shortly before expiry refreshes the entry for the price of a cache read. On models with very cheap reads it can beat the 1-hour TTL. Not with streaming, structured outputs or Batches.
- **Pricing shape (as of Sep 2026, check current pricing):** writes 1.25x base input (5 minutes) or 2x (1 hour); reads about 0.1x on most models and lower on some newer ones. Break-even with the 5-minute TTL is two requests.
- **Scope:** caches are isolated per workspace on the Claude API (per organisation on some cloud platforms) and per model. The same prompt split across two workspaces caches twice.
- **Concurrent fan-out:** an entry is readable only after the first response starts, so N parallel cold requests all pay the write. Send one first, then fan out.

### What breaks the cache on Claude (besides prefix edits)

- Changing top-level `output_config.effort` or the `thinking` config between requests (setting effort explicitly to the model default is the same as omitting it).
- Switching models (caches are per model); toggling fast mode (`speed`); changing `tool_choice`; setting or changing a structured-output format; changing a task budget mid-task.
- Every context-editing pass.

### Append-only alternatives (supported models only, check the docs)

- **Mid-conversation system messages:** append `{"role": "system", ...}` inside `messages` instead of editing the top-level `system`. The cached history stays valid.
- **Per-message effort (beta):** an effort-only system message changes effort from that turn on without restarting the cache.
- **Tool changes mid-conversation (beta):** add or remove tools with system-message blocks instead of rewriting `tools`.
- On newer models thinking blocks are bound to the conversation: editing `system`, `tools` or earlier messages can invalidate earlier reasoning as well as the cache, and is rejected on some accounts. Treat history as append-only; use server-side compaction or context editing instead of rewriting turns yourself.

### Verify

- Log `input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`, `output_tokens` per request. `input_tokens` excludes cached tokens; total input is the sum of the three.
- Cache probe: send one representative request twice, byte-identical; the second must show `cache_read_input_tokens > 0`. Ship it with any caching change. It costs real tokens; get approval.
- Cache diagnostics (beta, Claude API only): pass the previous response id and the response names where two consecutive requests diverged (model, system, tools or messages). Use it to localise a breaker, then confirm with usage fields.

## 3. Input hygiene

- **Count before you send** with `POST /v1/messages/count_tokens` (`client.messages.count_tokens(...)`). Don't use `tiktoken`: different tokenizer. Newer Opus-class tokenizers produce noticeably more tokens for the same text than older ones (roughly 1x to 1.35x as of the docs), so re-baseline counts after a migration. The count endpoint rejects server tools; read billed input from a `max_tokens: 1` request instead.
- **Tool search with `defer_loading: true`** on rarely used tools: schemas load only when needed. Pays once schemas pass roughly 10K tokens; below that the search step is overhead. Keep at least one tool non-deferred.
- **Delete tool recaps** from the system prompt: schemas are already in the request.
- **Images:** cost scales with pixel area, not information. Downscale to what the task needs before sending.
- **Large tables and files:** Files API plus code execution lets the model compute in a sandbox so only the answer enters context.
- **Programmatic tool calling:** the model calls your tools from code; only the filtered result enters context. Useful for chains whose intermediates don't matter.
- **Big reference document in every prompt:** keep it if most calls use most of it (cached, it's cheap); move it behind a tool if calls need one section. Validate: a smaller prefix can cost more discovery turns.

## 4. Long agent loops

- **Server-side compaction** (beta) summarises old turns near a token threshold. It pays only in sessions long enough to need it. Append the full `response.content` back each turn or the compaction state is lost.
- **Context editing** (clearing old tool results or thinking) is a window tool, not a savings lever: each pass rewrites the cached conversation. Clear rarely and in large batches.
- **Subagents** absorb bulky steps and hand back one line, optionally on a cheaper model; they start a fresh, uncached prefix.
- **Task budget** (beta): an advisory token budget for the whole loop so the model paces itself. Set from the loop's p90 usage, then tighten; verify adherence. Different from `max_tokens`, which the model never sees.

## 5. Output hygiene

- Specify the output shape with an example; use structured outputs where a schema fits.
- `max_tokens` is a backstop. For agentic work set it generously and stream; treat `stop_reason: "max_tokens"` as a failed attempt. For classification-style endpoints a small cap is fine.
- Stop sequences as early exits (`<CANNOT_ANSWER>`).
- Reasoning spend is controlled by effort, not by `max_tokens` and not by forcing thinking off (some current models reject disabled thinking with a 400; check the model's row in the docs).

## 6. Batches

- Message Batches: 50% off every token in the request, including cache reads and writes (as of Oct 2026). Results within 24 hours (an expiry, not an SLA), in any order: key results by `custom_id`, never by position.
- Use for evals, backfills, nightly summaries, bulk classification. Not for anything a user is waiting on.
- Each batch request is single-shot (no tool loop inside). A loop can sometimes be flattened by pre-fetching its inputs, but that changes how the model reasons: re-validate quality.
- Cache hits inside a concurrent batch are best-effort.

## 7. Effort

- `output_config: {"effort": "low" | "medium" | "high" | "xhigh" | "max"}`. Levels available and the default differ per model (for example, the default was `medium` on Opus 5.5 and `high` on most others, as of Sep 2026). Set it explicitly.
- `low` for subagents, routing, classification and chat; sweep before raising a default (`model-and-effort.md` section 4).
- Changing top-level effort mid-conversation invalidates the message cache; use per-message effort where supported, or change it between conversations.

## 8. Measuring spend at the org level

- Per request: log the four usage fields plus model, route/feature and user tier; compute cost from the current price list held in config.
- Org-wide: the Usage and Cost Admin API (needs an Admin API key; raw HTTP as of Sep 2026) reports usage by model, workspace and key. Keep admin keys out of code and chat (`security` craft for secrets).
- A workspace spend limit is the final backstop, not a saving.

## Checklist

- [ ] Static prefix cached; probe shows reads on the second identical request
- [ ] No effort, thinking, model, speed or tool-list changes inside a cached conversation
- [ ] `count_tokens` (not tiktoken) used for sizing; tool search only past ~10K schema tokens
- [ ] Batch used for every unattended job
- [ ] Effort set explicitly per route and swept on samples
- [ ] Every number quoted with its source date and "check current pricing"
