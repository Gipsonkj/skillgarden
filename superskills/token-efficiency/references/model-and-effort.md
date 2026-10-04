# Model and effort choice per task

> Distilled from: efficient-fable (BuilderIO/skills, MIT), cost-aware-llm-pipeline (affaan-m/ECC, MIT), llm-cost-optimizer (alirezarezvani/claude-skills, MIT), claude-api cost-optimization notes (anthropics/skills, Apache-2.0)

Model names and prices change every few months; the shape of the decision does not. Work in tiers (small, mid, frontier) and look up the current lineup and price list when you apply this. Any figure below is as of its source; check current pricing before quoting it.

## 1. Judge cost per completed task, not per token

A cheaper model that fails still bills its tokens, then the retry, then whatever the failure costs downstream. A pricier model that finishes in fewer turns can be the cheaper option. Every comparison below is: pass rate and cost per finished task, on your own work, read together.

## 2. Pick the tier by the job

| Job | Tier |
|---|---|
| Classification, extraction, yes/no, formatting, short summaries, routing | Small |
| Structured output, moderate summarisation, code completion, bounded edits, scans, log reduction | Mid |
| Multi-step reasoning, architecture, ambiguous specs, long agentic coding, final review | Frontier |

Most production traffic is simple. Sending every request to the largest model is the most common overspend pattern (llm-cost-optimizer calls it "model monoculture").

## 3. In Claude Code and agent sessions: orchestrator plus cheaper workers

Use the strongest model as orchestrator, architect and judge; give token-heavy, bounded work to cheaper subagents.

Keep on the strong model:
- Decomposing ambiguous work into slices
- Architecture, product and safety trade-offs
- Reading conflicting reports and deciding what matters
- Integrating partial work; final review and the user-facing answer

Push to cheaper subagents:
- Repo scans, inventories, doc and API surveys
- Running tests and browser checks, reducing logs, clustering errors
- Narrow bug hunts and 1-2 file edits with a known site

Rules:
1. Name the expensive-token risk first (big repo search, long logs, broad docs, repetitive edits), then split before reading everything yourself.
2. Set the subagent's model explicitly; don't rely on the default.
3. Verify what workers report before acting on it (see `session-hygiene.md` section 4).
4. Keep tiny tasks and judgment-heavy debugging on the strong model: the handoff costs more than it saves.
5. The source's claim of "up to 3-5x more cost-efficient" for parallelisable codebase work is a workload-dependent estimate, not a guarantee.

In Claude Code you can also switch the session model (`/model`) for a stretch of routine work. Do it at a task boundary: caches are per model, so a switch mid-task re-writes the whole context.

## 4. Effort before model

Many current models take an effort (or reasoning) setting that scales thinking and tool-call depth without changing the model. Sweep it before changing models.

1. Hold everything else byte-identical; change only effort. Run each level in its own session (changing effort mid-conversation can invalidate the cache and skew the comparison).
2. Include the hard cases you know about. Curves are flat on easy tasks; the hard tail is where higher effort earns its cost.
3. Read the curve:
   - **Flat:** take the lower level. Research and knowledge work often look like this (in Anthropic's published runs, as of Oct 2026, `medium` matched `high` for noticeably less).
   - **Steep:** the higher level is earning its cost. Long agentic coding often looks like this.
   - **Mixed:** note which tasks flipped; those are candidates for a cascade (section 5).
4. Re-sweep after a model upgrade, a big prompt change or a workload shift. Defaults differ per model; set effort explicitly.
5. Consider the newer, stronger model at lower effort before stepping down a tier: it is often the cheaper cell. Measure; it is not guaranteed.

Low effort also means fewer, more consolidated tool calls and shorter preambles, which is often what people actually want when they ask for "fewer tokens".

## 5. Cascades and routing

**Cascade:** run cheap first, escalate only failures. Needs a usable failure signal (tests, a schema validator, a checker, a confidence score).

```
result = run(task, tier="small" or effort="low")
if not check(result):
    result = run(task, tier="frontier" or effort="high")
```

In Anthropic's coding runs (as of Oct 2026), running everything low and re-running only failures high held the high-only pass rate for a little over half the cost, counting the failed cheap attempts. Price in the checker and the doubled wall-clock on failures.

**Router:** pick the tier before the call. Start rule-based; add a classifier only if rules miss.

| Signal | Example rule |
|---|---|
| Endpoint or task type | `/classify` always small; `/plan` always frontier |
| Input size | Over N characters or M items goes up a tier (thresholds tuned from logs) |
| User tier | Free users on mid, paid on frontier (decided at design time) |
| Confidence | Small model answers with a score; below threshold escalates |

Rules:
- Log every routing decision with model and outcome so thresholds can be tuned from data.
- Keep model ids in one config, never scattered through code.
- A classifier that adds more latency than the constraint allows: fall back to rules.
- Routing one conversation between models mid-stream costs a cache miss each switch and may drop the earlier model's reasoning blocks. Route per request or per conversation, not per turn.
- Two-model designs (an executor consulting a stronger advisor, or an orchestrator with workers) pay only when there is bulk to hand off or a cheap signal for "this is hard". For one dependent chain that fits in one window, the strong model alone at lower effort usually wins.

Implementation of routers, budgets and retries in an app: `api-cost-patterns.md`.

## 6. Price the tail, not the median

On typical tasks every model looks similar and the cheapest looks best. The bill is decided by the hard tenth: the tasks the cheap model fails and the long ones (one 20-problem research run in the claude-api notes had two problems carry 43% of spend). Compare candidates on the hardest slice too.

## 7. Pitfalls

- Downgrading the model because a single request looked expensive, then paying for retries.
- Comparing per-token prices instead of cost per solved task.
- Carrying an effort level across a model migration instead of re-sweeping from the new default.
- Switching models inside a long conversation "to save money" and paying a full cache re-write.
- Hard-coding model names and prices from a blog post.

## Checklist

- [ ] Each task type mapped to a tier, with the reason
- [ ] Effort swept on real samples before any model change; hard cases included
- [ ] Cascade or router has a real check signal and logs its decisions
- [ ] Model switches happen between conversations, not inside one
- [ ] Compared on cost per completed task, including the hard tail
