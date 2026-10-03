# TDD and writing good unit tests

> Distilled from: test-driven-development and writing-good-tests (obra/superpowers, MIT), python-testing-patterns and javascript-testing-patterns (wshobson/agents, MIT), golang-testing (samber/cc-skills-golang, MIT), java-junit (github/awesome-copilot, MIT)

If you didn't watch the test fail, you don't know whether it tests the right thing.

## When to use TDD

Always for new features, bug fixes, refactors and behaviour changes. Ask the user before skipping it for throwaway prototypes, generated code or config files.

For a bug fix the order is fixed: write a test that reproduces the bug, watch it fail for the right reason, then fix.

## Red -> green -> refactor

| Step | Do | Check |
|---|---|---|
| **Red** | Write one small test for one behaviour, with a clear name, using real code (mocks only when unavoidable) | Run it. It must *fail*, not error, with the message you expected, because the feature is missing (not a typo) |
| **Green** | Write the minimum code to pass. No extra features, no "while I'm here" | Run it and the project's whole relevant suite. All pass, output clean (no warnings, no stray logs) |
| **Refactor** | Remove duplication, improve names, extract helpers | Suite still green after each change |
| Repeat | Next behaviour | |

- Test passes immediately in Red? It's testing existing behaviour or the wrong thing. Fix the test.
- Test fails in Green? Fix the code, not the test.
- Wrote code before the test? Delete it and start from the test. Keeping it "as reference" turns into testing after.
- Hard to test usually means hard to use: listen to the test and change the design (inject the clock, split the function, pass dependencies in).

## Rationalisations to refuse

| Excuse | Reality |
|---|---|
| "Too simple to test" | Simple code breaks; the test takes 30 seconds |
| "I'll add tests after" | Tests written after pass immediately and prove nothing about whether they'd catch a bug |
| "I already tested it manually" | No record, can't re-run, misses edge cases |
| "TDD slows me down" | Debugging regressions later is slower |
| "Existing code has no tests" | Add tests for the part you're changing |

## Writing tests that catch bugs

1. **Name the break.** Before writing a test, write down the realistic production change that would make it fail. If you can't, don't write the test.
2. **Derive expectations by hand.** `assert total == 107.50`, not `assert total == calc_total(items)`.
3. **No change detectors.** A test that only fails on intentional changes (snapshotting a config, asserting a log line's exact text) costs maintenance and catches nothing.
4. **Behaviour, not text.** Don't grep a script or document to test it; run it.
5. **Test your contract, not the framework.** Don't test that the ORM saves or the router routes.
6. **Assert on real outcomes, never on mock behaviour.** A test that fails if you remove the mock is testing the mock.
7. **Production classes carry production methods only.** Cleanup helpers used only by tests live in test utilities.

### The mutation check (before finishing a test file)
Mentally (or with a tool, see [property-and-mutation.md](property-and-mutation.md)) apply each mutation; at least one test must fail for each:
- wrong constant or argument
- wrong branch taken
- missing state change or side effect
- empty or default return
- missing validation for zero, empty, null, unauthorised or malformed input

### Warning signs
- Setup and assertion share the same object, guaranteeing equality.
- The test can only fail by crashing.
- Expected values hidden behind loops, builders or helpers.
- Mock setup is more than half the test.
- The test exists for coverage and checks no outcome.

## Structure

- **Arrange / Act / Assert** (or Given / When / Then), separated by blank lines. One Act per test.
- **Name as a sentence** about behaviour: `test_rejects_expired_card`, `it('shows an error when the email is taken')`, `TestParse_EmptyInput_ReturnsError`.
- **Table-driven / parametrised** tests for many inputs to one behaviour (`@pytest.mark.parametrize`, `it.each`, Go `[]struct{...}` with `t.Run`, JUnit `@ParameterizedTest`). Give each case a name.
- **Edge cases to always consider**: empty, one, many; zero, negative, max; null/None/undefined; unicode and whitespace; duplicate; unauthorised; concurrent; time zone and DST boundaries.
- **Error paths** get as much attention as the happy path: assert the error type and message, and that no partial state was left behind.
- **Time and randomness** controlled: fake timers, frozen clock, seeded RNG, injected UUID generator.
- **No sleeps** in unit tests. If you need to wait, the design needs an injectable clock or a synchronisation point.

## Test doubles vocabulary

| Double | Does | Use when |
|---|---|---|
| Fake | Working lightweight implementation (in-memory repo) | Preferred for your own interfaces |
| Stub | Returns canned answers | Controlling an input |
| Spy | Records calls on a real or fake object | Checking a side effect you can't observe otherwise |
| Mock | Pre-programmed with expectations | Verifying an interaction with an external system is the behaviour |

Prefer fakes and real components; reach for mocks at system boundaries (HTTP, email, payments).

## Done for a unit-test change

- [ ] Each new test was seen failing for the right reason before the code existed
- [ ] Each test names the break it catches; no change detectors
- [ ] Edge and error cases covered for the changed code
- [ ] Whole relevant suite passes, output clean
- [ ] No sleeps, no real network, no dependence on test order

Language-specific runners and idioms: [unit-runners-by-language.md](unit-runners-by-language.md).
