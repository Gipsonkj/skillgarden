# Test strategy: what to test, at which level, with what

> Distilled from: playwright-best-practices (currents-dev/playwright-best-practices-skill, MIT), e2e-testing-patterns, python-testing-patterns and javascript-testing-patterns (wshobson/agents, MIT), test-driven-development (obra/superpowers, MIT), e2e-testing (affaan-m/everything-claude-code, MIT), pytest-coverage (github/awesome-copilot, MIT)

Decide the level before writing a test. The wrong level gives slow, flaky or meaningless tests.

## The levels

| Level | Tests | Speed | Use for |
|---|---|---|---|
| Unit | One function/class, no I/O | ms | Business rules, parsing, calculations, edge cases, error branches |
| Integration | Your code + a real DB, queue or file system | 10-500 ms | Repositories, queries, migrations, serialisation, framework wiring |
| API / contract | HTTP endpoints, request -> response | 10-200 ms | CRUD, validation errors (400/422), auth and permissions, response shapes; Postman collections in [api-testing.md](api-testing.md) |
| Component | One UI component rendered in a real or simulated DOM | 10-300 ms | Form validation, widgets, conditional rendering, per-component a11y, visual states |
| End-to-end | The deployed app through a real browser | 1-30 s | Critical journeys across pages: sign-up, login, checkout, onboarding |
| Exploratory / manual QA | A human or agent driving the app looking for problems | minutes | New features, release candidates, things no one thought to script |

Shape: many unit tests, a solid layer of integration/API tests, a thin layer of E2E tests on the journeys that make money or lose data. If an E2E test checks a validation message, it belongs at component or API level.

## Pick the level by scenario

| Scenario | Level | Why |
|---|---|---|
| Login / auth flow | E2E | Cookies, redirects, session state across pages |
| Form validation messages | Component | Isolated logic and error states |
| CRUD and data integrity | API | Data matters more than pixels |
| Search with results | API (query) + component (rendering) | Split the two concerns |
| Cross-page navigation, deep links | E2E | Routing and history |
| API error handling | API | Status codes, error shapes |
| How errors look to users | Component | Toast, banner, inline error |
| Roles and permissions | API | Authorisation is backend logic |
| Payment / checkout | E2E (third party mocked or in test mode) | Multi-step, iframes |
| Widget behaviour (modal, date picker) | Component | Fast, focused |
| Real-time / WebSocket | E2E | Needs the full browser |
| Pure function with many inputs | Unit, often property-based | See [property-and-mutation.md](property-and-mutation.md) |

## Mock or real?

Mock at the boundary you don't own; keep everything you own real.

| Dependency | Mock? |
|---|---|
| Your own API and database | No. Run them locally or in a container; seed through the API or fixtures |
| Your auth | Mostly no. Log in once and reuse the session (Playwright `storageState`) |
| Payments, email, SMS, OAuth providers, maps, analytics | Yes. Stub the HTTP call and assert on the request you sent |
| Feature flags | Usually: force the state the test needs |
| Clock, randomness, UUIDs | Control them (fake timers, seeded RNG, injected clock) |
| Flaky external dependency | Mock in CI; run against the real one in a nightly job |

Rules for doubles:
- A mock earns no assertions. If a test passes because the mock returned what you told it to, it tests nothing. Assert on the outcome your code produced.
- Learn the real method's side effects before mocking it; mock at the slow/external level, not one layer too high.
- Mirror the real response structure completely, including fields you don't use.
- When mock setup is more than half the test, switch to an integration test with real components.

## Test data

- Each test creates what it needs and doesn't depend on another test's leftovers. Use factories/builders with sensible defaults; override only what the test is about.
- Unique identifiers per test (UUID or worker-index suffix), never second-precision timestamps.
- Seed through the API or fixtures, not through the UI, unless the UI flow is what you are testing.
- Clean up in teardown, or use transactions rolled back per test, or a fresh DB per worker.
- Never point tests at production data or production accounts.

## Coverage: a flashlight, not a target

Coverage shows which code no test executed; it can't show whether the assertions are any good. Use it to find gaps, then judge each gap.

- Run it (`pytest --cov --cov-report=term-missing`, `vitest run --coverage`, `go test -cover`, JaCoCo) and read the uncovered lines in changed files.
- Cover the risky uncovered lines: error branches, boundary conditions, permission checks, money and data-loss paths.
- Some sources aim for 100% line coverage, and many teams gate at 80%. Treat any number as a floor for changed code, not a goal: chasing 100% produces change-detector tests with no real assertion. Use mutation testing to measure assertion quality.
- Don't lower an existing coverage gate to get a change through.

## What makes a test worth keeping

1. **It names the break it catches.** Before writing it, say which plausible production change would make it fail ("if the discount is applied after tax"). If only an intentional change can fail it, it's a change detector; delete it.
2. **It exercises the real thing** with real inputs and checks a real outcome (return value, state change, emitted request, rendered text).
3. **Expected values are derived independently**: literals worked out by hand, never computed by the code under test.
4. **One behaviour per test**, named as a sentence: `rejects_expired_card`, `shows error when email is taken`.
5. **Deterministic**: same result on every run, alone or in any order, in parallel.
6. **Fast enough to run on every change**: unit suite in seconds, full suite in minutes.

## Where tests run

| When | What runs |
|---|---|
| On save / pre-commit | Affected unit tests |
| On every PR | Lint, type check, unit, integration, API, component, smoke E2E |
| On merge to main | Full E2E across browsers, visual regression if used |
| Nightly | Slow suites, real third-party integrations, mutation testing on core modules |
| Before release | Exploratory QA pass on changed areas (see [exploratory-qa.md](exploratory-qa.md)) |
