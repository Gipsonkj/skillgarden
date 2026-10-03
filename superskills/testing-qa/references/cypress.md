# Cypress E2E and component tests

> Distilled from: cypress-author (cypress-io/ai-toolkit, MIT), e2e-testing-patterns (wshobson/agents, MIT), javascript-testing-patterns (wshobson/agents, MIT)

Use when the project already uses Cypress (a `cypress.config.{js,ts}` and a `cypress/` folder). Don't introduce Cypress into a Playwright project, or the reverse, unless the user asks for a migration.

## First, identify the task

| Field | Values |
|---|---|
| Task | `CREATE` new tests, `UPDATE` behaviour in existing ones, `FIX` a failing or flaky test |
| Spec | The existing spec file, or a proposed path for a new one |
| Test | Optional: the `describe` / `it` path or a line number |
| Type | `E2E` (`cypress/e2e/**/*.cy.ts`) or Component (`cypress/component/**/*.cy.tsx`) |
| Instructions | What to build or change |

Pick the type: E2E for critical journeys, URL behaviour, reload/history and flows across areas; component tests for isolated UI behaviour of one React, Vue or Angular component mounted with props and state. If a required field is unclear, ask before writing.

## Understand the project before writing

- Read `cypress.config.*`, the support file for the test type (`cypress/support/e2e.ts`, `component.ts`), and `package.json` for the Cypress version and plugins. Use only APIs that exist in that version (`npx cypress --version`).
- Find the existing spec for this area and extend it; otherwise find 1-3 closely related specs and match their style, language (TS/JS), custom commands, fixtures and selectors.
- Grep for custom commands (`Cypress.Commands.add`) and reuse them.

## Selectors

Check whether the project configured `Cypress.ElementSelector` priorities and follow them. Otherwise:

1. Accessible text and roles where stable: `cy.contains('button', 'Save')`, or `cy.findByRole('button', { name: 'Save' })` if `@testing-library/cypress` is installed.
2. Dedicated test attributes: `data-cy`, `data-test`, `data-testid`.
3. `id` / `name` attributes.
4. Never CSS classes, DOM structure or generated attributes.

The Cypress source recommends test attributes first. This skill prefers accessible names where they're stable (see [playwright-e2e.md](playwright-e2e.md) for why); in a project that standardised on `data-cy`, follow the project. If the only available selector is fragile, propose adding a `data-cy` attribute to the component.

## Waiting and async

- Never `cy.wait(5000)`. Use retrying assertions, `cy.intercept()` + `cy.wait('@alias')`, or a longer `timeout` on the assertion that checks the next state: `cy.get('[data-cy=toast]', { timeout: 10000 }).should('contain', 'Saved')`.
- Cypress commands are queued, not Promises. Don't `await` them, don't assign their results to variables, don't mix them with manual Promises. Use `.then()` or aliases (`.as('user')` then `cy.get('@user')`).
- Define aliases in `beforeEach`, not `before`: aliases are cleared between tests.

## State and data

- Prepare state programmatically: `cy.request()` to the API, `cy.task()` for DB seeding, fixtures from `cypress/fixtures`.
- Don't log in through the UI except in the login test itself; use `cy.session()` to cache the logged-in state.
- Reset state before each test rather than cleaning up after; tests must run alone and in any order.
- Stub only what you don't own (payments, email, analytics) with `cy.intercept('POST', '**/charges', { statusCode: 200, body: {...} })`. Intercept your own API to wait on it, not to fake it, unless the test is about an error state.

## Structure and style

- Titles in the form "action -> expected result": `it('submitting an expired code -> shows "Code expired"')`.
- Explicit assertions on what the user sees (`should('be.visible')`, `should('have.text', ...)`, `should('have.length', 3)`), plus the URL when navigation matters (`cy.location('pathname').should('eq', '/orders')`).
- Shared setup in `beforeEach`; repeated multi-step actions in custom commands; configuration in `cypress.config.*`, not in specs.
- Prefer fewer, meaningful journey tests with several assertions over many one-assertion E2E tests (unit-level detail belongs in unit or component tests).
- Short comments where intent isn't obvious.

## Example

```ts
describe('Promo codes', () => {
  beforeEach(() => {
    cy.session('shopper', () => cy.loginByApi('shopper@example.test'));
    cy.request('POST', '/api/test/cart', { items: [{ sku: 'MUG-01', qty: 1 }] });
    cy.intercept('POST', '/api/cart/promo').as('applyPromo');
    cy.visit('/cart');
  });

  it('applying an expired code -> shows an error and keeps the total', () => {
    cy.findByLabelText('Promo code').type('SPRING24');
    cy.contains('button', 'Apply').click();
    cy.wait('@applyPromo').its('response.statusCode').should('eq', 422);
    cy.findByRole('alert').should('contain', 'This code has expired');
    cy.get('[data-cy=cart-total]').should('have.text', '£12.00');
  });
});
```

## Running and debugging

- `npx cypress open` for the interactive runner (time-travel snapshots per command); `npx cypress run --spec cypress/e2e/cart.cy.ts` headless; `--component` for component tests.
- Don't run the suite unless the user asked or the project's workflow expects it; do make sure the change passes formatting, lint and type checks.
- Failures in CI: read the screenshot and video artifacts, the command log, and the intercepted requests. Fix causes (missing intercept wait, shared state, wrong selector), not with longer waits. Flake process: [flaky-tests.md](flaky-tests.md).
- Retries: `retries: { runMode: 2, openMode: 0 }` collects evidence; a test that needs retries to pass is still flaky.
