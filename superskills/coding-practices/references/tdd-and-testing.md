> Distilled from: test-driven-development + writing-good-tests (obra/superpowers, MIT), tdd (mattpocock/skills, MIT), code-review-and-quality (addyosmani/agent-skills, MIT)

# Test-driven development and tests worth keeping

**If you didn't watch the test fail, you don't know that it tests the right thing.** Use TDD for features, bug fixes, refactors and behaviour changes. Exceptions (throwaway prototypes, generated code, config files) are the user's call, not yours.

## The loop: red, green, refactor

1. **RED** - write one small test for one behaviour, with a name that says what should happen.
2. **Verify RED** - run it. It must *fail* (not error) for the expected reason: "feature missing", not a typo. Passes already? You're testing existing behaviour; fix the test.
3. **GREEN** - write the simplest code that passes. No extra options, no future features.
4. **Verify GREEN** - run it, then run the **project's whole suite** (`npm test`, `pytest`, `cargo test`), not just your file. Output clean: no new warnings. Any red test, even one you didn't cause, goes in your report by name.
5. **REFACTOR** - only when green: remove duplication, improve names, extract helpers. Stay green; add no behaviour.
6. Next behaviour.

Work in **vertical slices**: one test, one implementation, repeat. Writing all tests first and all code after (horizontal slicing) tests imagined behaviour and locks in a structure before you understand it.

Code written before its test: delete it and start from the test. Keeping it "as reference" means you'll adapt it, which is testing after.

```typescript
// RED
test('rejects empty email', async () => {
  const result = await submitForm({ email: '' });
  expect(result.error).toBe('Email required');
});
// run -> FAIL: expected 'Email required', got undefined
// GREEN
function submitForm(data: FormData) {
  if (!data.email?.trim()) return { error: 'Email required' };
  // ...
}
// run -> PASS; run full suite -> PASS
```

### Running the loop with pytest (Python)

| Step | Command |
|---|---|
| RED / GREEN on one test | `python -m pytest tests/test_checkout.py::test_rejects_empty_code -q` (node ID: `file::Class::test`) |
| A group by name | `python -m pytest -k "discount and not expired"` |
| Stop at the first failure | `-x` (or `--maxfail=3`) |
| Rerun only what failed last time | `--lf`; `--ff` runs those first, then the rest |
| Fix failures one at a time | `--sw` stops at the first failure and resumes from it next run |
| Whole suite before GREEN counts | `python -m pytest` |
| Find slow tests | `--durations=10` |

- `python -m pytest` also puts the current directory on `sys.path`, which plain `pytest` doesn't; use it when imports of the project fail.
- Read the exit code: `0` all passed, `1` some failed, `2` interrupted, `3` internal error, `4` usage error, `5` **no tests collected**. A "red" with exit `5` means your new test never ran (wrong file or function name), not that it failed.
- `--lf` with no failures recorded runs the whole suite (the default `--lfnf all`). State lives in `.pytest_cache`; `--cache-clear` resets it.
- `--pdb` and `--trace` open the interactive debugger: for a user at a terminal, not an unattended run.
- Fixtures, parametrize, markers, coverage and other runners' idioms: `testing-qa` → `references/unit-runners-by-language.md`.

## Where tests go: seams

- Test at public interfaces (the *seam*), never private methods or internal collaborators.
- For non-trivial work, agree the seams with the user first ("public interface is `checkout(cart, payment)`; I'll test there") so effort goes to critical paths.
- If testing feels hard, the interface is probably wrong: simplify it rather than mocking more.

## What makes a good test

**Name the break first.** Before writing the body, answer: *which production change would make this test fail?* If only an intentional decision would (a constant's value, exact wording, private structure), it's a change detector: test the behaviour that depends on the decision instead ("a failing call is retried 5 times and the 6th never happens", not `expect(MAX_RETRIES).toBe(5)`).

**Derive expected values independently.** Use literals or hand-checked fixtures.
```typescript
// Tautological: passes whatever the code does
expect(calculateTotal(items)).toBe(items.reduce((s, i) => s + i.price, 0));
// Good
expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
```

**Verify through the interface, not a side channel.**
```typescript
// Bad: reaches into the DB
await createUser({ name: 'Alice' }); expect(await db.query('SELECT ...')).toBeDefined();
// Good
const user = await createUser({ name: 'Alice' }); expect((await getUser(user.id)).name).toBe('Alice');
```

**Test your code, not the framework.** Don't assert that the router calls a registered handler. Constructors, getters and trivial forwarding earn a test only if they validate, default, derive or cause side effects.

**Behaviour, not source text.** Don't assert a script or config "contains line X"; run it on controlled input and check output, side effects or exit code.

| Quality | Good | Bad |
|---|---|---|
| Minimal | One behaviour; "and" in the name means split it | `validates email and domain and whitespace` |
| Clear | Name states the behaviour | `test1`, `retry works` |
| Real | Exercises real code | Asserts on mocks |
| Durable | Survives internal refactors | Breaks when internals move, behaviour unchanged |

## Mocks

Mock only at system boundaries: external APIs, time, randomness, sometimes the DB or filesystem. Don't mock your own modules or internal collaborators.

- **A mock earns no assertions.** `expect(screen.getByTestId('sidebar-mock'))` tests the mock. Assert the real component's behaviour.
- **Know the side effects before mocking.** Mock the slow/external layer *below* what the test depends on, or you'll swallow the write the test needs.
- **Make doubles specific**: when arguments, counts or order are the contract, assert them; give success, error and malformed cases their own fixtures.
- **Mirror real data completely**: partial mock objects pass while integration breaks on the missing field.
- **No test-only methods on production classes** (`destroy()` used only by tests belongs in a test utility).
- Mock setup bigger than the test? Use real components in an integration test.

Design for mockability at the boundary: inject dependencies (`processPayment(order, paymentClient)`), and prefer one function per external operation (`api.getUser`, `api.createOrder`) over a generic `fetch(endpoint, opts)`.

## Check that tests can catch bugs (mutation by hand)

Invert one condition the change adds (drop a `!`, swap `&&`/`||`), run the suite, restore the file. If everything stays green, a test is missing: name it and add it.

For a regression test: write it, run (fail), apply fix, run (pass), revert the fix, run (**must fail**), restore, run (pass).

## When stuck

| Problem | Do |
|---|---|
| Don't know how to test it | Write the call you wish existed, then the assertion |
| Test is complicated | The design is complicated; simplify the interface |
| Must mock everything | Code is too coupled; inject dependencies |
| Huge setup | Extract helpers; if still huge, simplify the design |
| Legacy code with no tests | Add characterisation tests for current behaviour before changing it |

## Rationalisations

| Excuse | Reality |
|---|---|
| "Too simple to test" | Simple code breaks; the test takes 30 s. |
| "I'll add tests after" | Tests written after pass immediately and prove nothing. |
| "I tested it by hand" | No record, can't rerun, misses cases under pressure. |
| "Deleting hours of work is wasteful" | Sunk cost; untrusted code is the waste. |
| "TDD is dogmatic" | It's the fast path: bugs caught before commit. |

## Done checklist
- [ ] Every new function/behaviour has a test that was seen failing for the right reason
- [ ] Minimal code to pass; full suite green; output clean
- [ ] Tests use real code; mocks only at boundaries; no mock assertions
- [ ] Edge cases and error paths covered (null, empty, boundary, failure)
