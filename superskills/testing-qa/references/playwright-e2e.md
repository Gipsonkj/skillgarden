# Playwright end-to-end tests (TypeScript)

> Distilled from: playwright-best-practices (currents-dev/playwright-best-practices-skill, MIT), playwright-expert (jeffallan/claude-skills, MIT), e2e-testing (affaan-m/everything-claude-code, MIT), e2e-testing-patterns (wshobson/agents, MIT)

Use `@playwright/test` for E2E suites that live in the repo and run in CI. For driving a browser ad hoc (exploring, screenshots, one-off checks) see [browser-automation.md](browser-automation.md).

## Locators: priority order

1. `getByRole('button', { name: 'Save' })`: what users and assistive tech see.
2. `getByLabel('Email')`, `getByPlaceholder(...)` for form fields.
3. `getByText(...)`, `getByTitle(...)` for non-interactive content.
4. `getByTestId('invoice-row')` when there's no stable accessible name (canvas, repeated icon buttons, third-party widgets).
5. CSS / XPath: last resort.

Some sources default to `data-testid` everywhere. Role and label locators win here: they survive refactors just as well, and they fail when the UI loses its accessible name, which is a real bug. Add test IDs where semantics can't do the job.

- Scope inside a region: `page.getByRole('row', { name: /INV-1042/ }).getByRole('button', { name: 'Delete' })`.
- `filter({ hasText })` / `filter({ has })` instead of `nth()`. `first()`/`nth()` only with a reason in a comment.
- Never select by CSS classes from a styling framework (`.btn-primary`, `.css-1x2y3z`).

## Assertions and waiting

- Web-first assertions retry until the timeout: `await expect(locator).toBeVisible()`, `toHaveText`, `toHaveValue`, `toHaveURL`, `toHaveCount`, `toBeEnabled`.
- Never `expect(await locator.isVisible()).toBe(true)`: it checks once, no retry.
- Never `page.waitForTimeout(ms)`. Wait for an observable condition: an element, a URL, a response (`page.waitForResponse(r => r.url().includes('/api/orders') && r.ok())`).
- Actions auto-wait for the element to be attached, visible, stable, enabled and receiving events. Don't add manual waits before clicks.
- Polling a non-DOM condition: `await expect.poll(() => getJobStatus(id)).toBe('done')` or `await expect(async () => {...}).toPass()`.
- `expect.soft()` to collect several checks in one pass (a form's many fields), then fail at the end.
- Avoid `networkidle`; it's unreliable on apps with polling or analytics.

## Structure

```ts
import { test, expect } from '@playwright/test';

test.describe('checkout', () => {
  test('guest can pay with a saved card', async ({ page }) => {
    await page.goto('/cart');
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByLabel('Email').fill('guest@example.test');
    await page.getByRole('button', { name: 'Pay £24.00' }).click();
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
    await expect(page).toHaveURL(/\/orders\/\w+/);
  });
});
```

- One user journey per test; independent of every other test; runnable alone and in parallel.
- `test.step('add item', async () => {...})` to make long journeys readable in reports.
- Tags for selection: `test('...', { tag: '@smoke' }, ...)`, then `npx playwright test --grep @smoke`.
- Annotations: `test.fixme()` for known bugs with an issue link; `test.slow()` for genuinely slow tests. `test.skip()` only for "not applicable here" (wrong browser), never to hide a flake.

## Page objects or fixtures

- Use a page object when a page is touched by several tests: it holds locators and user-level actions (`checkout.payWith(card)`), no assertions about business outcomes.
- Use custom fixtures (`test.extend`) for setup and dependencies: a logged-in page, a seeded account, an API client. Fixtures compose and tear down automatically.
- Small suites can skip POM; don't build a framework before the third test.

## Authentication

Log in once per role in a setup project and reuse the session:

```ts
// playwright.config.ts (excerpt)
projects: [
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' }, dependencies: ['setup'] },
],
```

`auth.setup.ts` logs in through the UI (or API), then `await page.context().storageState({ path: 'playwright/.auth/user.json' })`. Add `playwright/.auth` to `.gitignore`. Test the login UI itself in one dedicated test without stored state. Use separate accounts per parallel worker when tests mutate user data.

## Network control

- Mock only what you don't own (payments, email, analytics, maps, OAuth): `await page.route('**/api.stripe.com/**', r => r.fulfill({ json: {...} }))`. Block noise: `route.abort()` for analytics.
- Keep your own API real; seed data through it with the `request` fixture.
- Test failure paths by forcing errors: `route.fulfill({ status: 500 })`, `route.abort('failed')`, `context.setOffline(true)`.
- HAR record/replay (`page.routeFromHAR`) for complex third-party responses; re-record when the API changes.
- Time-dependent UI: `await page.clock.install({ time: new Date('2026-01-31T23:59:00Z') })`.

## Configuration essentials

```ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI },
});
```

Retries exist to collect a trace and report flakiness, not to make flaky tests pass. A test that passed on retry is reported as flaky and must be fixed (see [flaky-tests.md](flaky-tests.md)).

## Beyond the happy path

| Need | Approach |
|---|---|
| Mobile / responsive | `devices['iPhone 15']` project or `page.setViewportSize`; test the real touch UI |
| Accessibility | `@axe-core/playwright`: `const r = await new AxeBuilder({ page }).analyze(); expect(r.violations).toEqual([])`; plus keyboard-only journeys |
| Visual regression | `await expect(page).toHaveScreenshot()` with masked dynamic regions, a fixed viewport and fonts, run in one OS image (Docker) |
| API tests | The `request` fixture: `const res = await request.post('/api/orders', { data }); expect(res.status()).toBe(201)` |
| Component tests | `@playwright/experimental-ct-react` (or Vitest browser mode) for widgets in isolation |
| Multi-user | Two `browser.newContext()` with different `storageState` in one test |
| Popups / new tabs | `const popup = page.waitForEvent('popup'); await click; await (await popup).waitForLoadState()` |
| Iframes | `page.frameLocator('#payment').getByLabel('Card number')` |
| Downloads | `const d = page.waitForEvent('download'); ...; await (await d).path()` |

## Debugging a failure

1. Read the error and the failing line. Open the trace: `npx playwright show-trace test-results/.../trace.zip` (or the HTML report). It has DOM snapshots, network, console and action timing for every step.
2. Reproduce: `npx playwright test path/to/spec.ts:42 --headed` or `--debug` (inspector), `--ui` for watch-mode.
3. Fix the cause (wrong locator, missing wait on a response, shared data), not the symptom (longer timeout).
4. Generate a starting locator or flow with `npx playwright codegen <url>`, then rewrite it to role-based locators and real assertions.

## CI

- Install browsers with `npx playwright install --with-deps` (or use the official Playwright Docker image) in CI, cached by version.
- Shard large suites: `npx playwright test --shard=1/4`, merge reports with `npx playwright merge-reports`.
- Upload `playwright-report/` and `test-results/` as artifacts on failure.
- Run smoke-tagged tests on every PR; the full cross-browser suite on main or nightly.

## Report template

```
E2E run: <branch/commit>, <env>
Total N | Passed P | Failed F | Flaky K | Skipped S
Failed: <test> - <error line> - trace: <path>
Flaky (passed on retry): <test> - issue <link>
Artifacts: playwright-report/index.html, test-results/
```
