> Distilled from: codebase-design + improve-codebase-architecture + domain-modeling (mattpocock/skills, MIT)

# Designing modules, interfaces and decisions

**Prefer deep modules: a small interface hiding a lot of behaviour.** Shallow modules (interface nearly as complex as the implementation) add cost without leverage.

## Vocabulary (use it consistently)

| Term | Meaning |
|---|---|
| Module | Anything with an interface and an implementation: function, class, package, service |
| Interface | Everything a caller must know: signature, invariants, errors, ordering, config, performance |
| Depth | Behaviour hidden per unit of interface. Deep = small interface, lots behind it |
| Seam | A place where behaviour can be swapped without editing callers (where tests and adapters plug in) |
| Adapter | A concrete implementation that fits a seam |
| Leverage | What callers gain from depth: they do more while knowing less |
| Locality | What maintainers gain: change, bugs and knowledge concentrated in one place |

**Deletion test**: imagine deleting the module. If complexity vanishes, it was a pass-through; delete it. If the complexity reappears across N callers, it earned its keep.

**The interface is the test surface.** Callers and tests cross the same seam. If you want to test past the interface, the module is probably the wrong shape.

**One adapter = a hypothetical seam. Two adapters = a real one.** Don't introduce a port/interface until something actually varies (production and test count as two).

## Dependencies and how to test across them

| Category | Example | Approach |
|---|---|---|
| In-process | Pure functions, in-memory state | Merge and test directly through the interface |
| Local-substitutable | Postgres -> PGLite, filesystem -> temp dir | Run the local stand-in in tests |
| Remote but owned | Your own internal service | Port at the seam; HTTP adapter in prod, in-memory adapter in tests |
| True external | Stripe, Twilio, an LLM API | Inject a port; mock adapter in tests |

## Design it twice

For any non-trivial interface, sketch **at least three** different designs before choosing (in parallel subagents if available, each with a different constraint: "minimise methods", "optimise the most common caller", "maximise flexibility", "ports & adapters"). For each, show the signature, a caller example, what it hides, and trade-offs. Compare in prose on depth, locality and seam placement, then recommend one (a hybrid is fine). Your first idea is rarely the best.

## Interface rules

- Design from the caller's side: write the call you wish existed first.
- Make illegal states unrepresentable (discriminated unions, required fields, domain types instead of raw strings).
- Validate at the boundary once; trust data inside.
- Errors are part of the interface: consistent shape (e.g. `{ error: { code, message, details } }`), meaningful status codes, no stack traces to clients.
- Be strict in what you send, tolerant in what you accept; additive changes over breaking ones; version only when you must.
- Pagination, filtering and idempotency for anything list-like or retryable.
- Hyrum's law: every observable behaviour will be depended on. Keep the observable surface small.

## Domain language

Keep a `GLOSSARY.md` (or `CONTEXT.md`) at the root of a context:
```md
## Order
A confirmed purchase request. Created at checkout; immutable after payment.
_Avoid_: purchase, cart (a cart is pre-checkout)
**Relationships**: an Order has 1+ LineItems; belongs to one Customer.
**Flagged ambiguity**: "account" means Customer in billing, Login in auth.
```
- Use glossary terms in code, tests, commits and conversation.
- When a conversation uses a fuzzy or conflicting term, stop and sharpen it; update the glossary inline as terms are resolved.
- Stress-test with concrete scenarios ("a refund after partial shipment: what happens to the Order?") and cross-check claims against the code.

## Architecture Decision Records (sparingly)

Write an ADR **only when all three hold**: hard to reverse, surprising to a newcomer, and a real trade-off was made. Store as `docs/adr/0001-short-title.md`:
```md
# 0001. Use Postgres advisory locks for job claiming
Status: accepted (2026-03-02)
Context: two workers claimed the same job; we have no Redis.
Decision: claim jobs with pg_try_advisory_xact_lock(job_id).
Consequences: + no new infra. - locks tie us to Postgres; revisit if we shard.
Alternatives: SKIP LOCKED queue table (rejected: needs migration of 40M rows).
```

## Finding where architecture hurts

1. Hot spots: `git log --since=6.months --name-only --format= | sort | uniq -c | sort -rn | head -20` (high churn + high complexity = friction).
2. Look for shallow modules, pass-throughs, shotgun surgery (one feature touching many files), leaky interfaces, tests that mock internals.
3. Present candidates as cards: **Files**, **Problem**, **Proposed shape**, **Benefits** (in terms of locality and leverage, and how tests improve). Don't propose interfaces yet; let the user pick one to explore.
4. For the chosen candidate: walk the design tree together, update the glossary, write an ADR only if it meets the three criteria, then design-it-twice the new interface.
