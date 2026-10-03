# Property-based testing and mutation testing

> Distilled from: property-based-testing and mutation-testing (trailofbits/skills, CC-BY-SA-4.0), test-driven-development (obra/superpowers, MIT), golang-testing (samber/cc-skills-golang, MIT)
>
> License: CC-BY-SA-4.0 (derived from trailofbits/skills property-based-testing and mutation-testing). This file may be shared and adapted under the same license with attribution.

Two techniques that test the tests. Property-based testing (PBT) widens inputs: instead of one example, it asserts a rule over the whole input domain and lets a generator search for a counterexample. Mutation testing checks assertions: it changes the code on purpose and sees whether any test notices.

## Property-based testing

Use it when the code has an algebraic shape. Code without one gets example tests, and saying so is a valid outcome.

### Property catalogue

| Property | Formula | Typical code |
|---|---|---|
| Roundtrip | `decode(encode(x)) == x` | Serialisation, parsers, format conversion |
| Inverse | `f(g(x)) == x` | Encrypt/decrypt, compress/decompress |
| Oracle | `new(x) == reference(x)` | Optimisations, rewrites, a fast path vs a simple path |
| Idempotence | `f(f(x)) == f(x)` | Normalisation, formatting, dedupe, sorting |
| Invariant | Holds before and after | Balances never negative, list length preserved, totals add up |
| Easy to verify | `is_sorted(sort(x))` | Algorithms with cheap checkers |
| Commutativity | `f(a, b) == f(b, a)` | Merges, set operations |
| Associativity | `f(f(a, b), c) == f(a, f(b, c))` | Combining operations |
| Identity | `f(x, e) == x` | Operations with a neutral element |

Strength, weakest to strongest: no crash -> type preserved -> invariant -> idempotence -> roundtrip / oracle. Assert the strongest one the code supports. If "doesn't crash" is all you can find, look for a small refactor that exposes a stronger property (pull a pure calculation out of the I/O, return a value instead of mutating in place) before concluding the code is a poor fit.

### Two ways a property asserts nothing

- **Tautology**: `assert add(a, b) == a + b` re-implements the function; a shared bug can't fail it. Constrain the output without recomputing it. (`f(x) == f(x)` is a real determinism property when `f` might not be pure: hashing, dict/set serialisation, anything reading the clock.)
- **Vacuity**: `assume()` / filters that discard most inputs run almost nothing; contradictory assumptions run zero cases and pass. Build valid inputs in the generator instead of filtering.

### Writing them

- Generators produce valid inputs directly: compose them from the domain (`st.builds(Order, ...)`, `fc.record({...})`), bound sizes, include edge values (empty, unicode, extremes).
- Keep each property to one rule; name it after the rule (`test_roundtrip_preserves_order`).
- Run enough cases in CI (library default, more nightly); keep failing seeds/examples as explicit regression cases.
- Libraries: Python Hypothesis; TS/JS fast-check; Rust proptest; Go rapid (or native `testing.F` fuzzing); Java jqwik; Kotlin Kotest; C# FsCheck; Scala ScalaCheck; Elixir StreamData; Haskell QuickCheck/Hedgehog. If the project has none, adding one is the user's decision: offer it once with the specific property you'd write.

```python
from hypothesis import given, strategies as st

@given(st.lists(st.integers()))
def test_sort_is_ordered_and_a_permutation(xs):
    out = my_sort(xs)
    assert all(a <= b for a, b in zip(out, out[1:]))
    assert sorted(out) == sorted(xs)  # same elements; oracle is the stdlib
```

### When a property fails

The shrunk counterexample is the starting point. Decide which of three things is wrong before touching code:

| Symptom | Cause | Action |
|---|---|---|
| Violates a documented guarantee (spec, type, docstring) | Code bug | Report with the shrunk input and the guarantee quoted; fix with a regression example |
| Input breaks a documented precondition | Generator too broad | Constrain the generator |
| Property contradicts the docs or types | Wrong property | Fix the property |
| Edge case the spec never decided | Ambiguous spec | Ask the owner; it's a discussion, not a bug |
| Vanishes under realistic constraints | Test artefact | Fix the generator |

Ground the property in the strongest available source: external spec (RFC, format definition) > types > docstrings > existing tests > the function name.

## Mutation testing

A mutant is the code with one small change (operator flipped, condition forced true/false, statement removed, error injected, constant changed). A mutant that survives the test suite shows a place where the tests don't check the behaviour.

### Tools

| Stack | Tool |
|---|---|
| JS / TS | StrykerJS |
| Java / JVM | PIT (pitest) |
| Python | mutmut, cosmic-ray |
| C# | Stryker.NET |
| Rust | cargo-mutants |
| Go | go-mutesting, gremlins |
| Multi-language / smart contracts | mewt, muton (Trail of Bits) |

Check what's installed; adding a tool is the user's call.

### Running a campaign

1. Scope it: the module that matters (pricing, auth, parsing), not the whole repo. Exclude generated code, logging and UI glue.
2. Make the test command fast and deterministic first; mutation runs it once per mutant.
3. Estimate the run time (mutants x test time) and trim scope or use incremental/diff-only mode if it's long.
4. Run, then list survivors by file and line.

### Reading results

| Outcome | Meaning |
|---|---|
| Killed / caught | A test failed: good |
| Survived / uncaught | No test noticed: a gap or an equivalent mutant |
| Timeout | Inconclusive, not evidence of coverage |
| Skipped / no coverage | The line never ran: write a test that executes it first |

| Survivor type | What it tells you |
|---|---|
| Injected error tolerated | Error handling swallows it, or nothing asserts the outcome |
| Statement removed, still passes | Its effect isn't observed by any assertion |
| Condition forced true/false, negation removed | Tests don't distinguish the branches; add boundary cases |
| Operator swapped (`<` / `<=`, `+` / `-`) | Missing boundary or arithmetic assertions |

Severity ranks the mutation, not the risk: a low-severity survivor in a fee calculation matters more than a high-severity one in a log line.

**Equivalent mutants** change the code without changing behaviour (reordering independent statements, a bound that can't be reached). Prove equivalence by reasoning about all inputs before dismissing a survivor; when unsure, write the test.

### Turning survivors into work

1. For each meaningful survivor, write the test that would kill it: an assertion on the outcome, a boundary input, an error-path check. Confirm it fails against the mutant and passes on the real code.
2. Sometimes the survivor reveals a real bug (dead validation, an error that's silently ignored). Report and fix it with its own regression test.
3. Report: mutation score for the scoped module, survivors grouped by cause, tests added, equivalent mutants with reasoning, and remaining gaps.

Mutation score is a better quality signal than line coverage, but it's still a guide. Aim to kill survivors in risky code, not to reach 100% everywhere.
