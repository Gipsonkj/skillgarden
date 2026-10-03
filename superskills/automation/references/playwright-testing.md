# Testing web apps with Playwright

> Distilled from: webapp-testing (anthropics/skills, Apache-2.0), playwright-cli test references (microsoft/playwright-cli, Apache-2.0), playwright-skill (lackeyjb/playwright-skill, MIT)

Repeatable browser checks of the user's own app: smoke scripts, Playwright test suites, debugging failing tests. Ad-hoc browsing is in browser-automation.md.

## 1. Pick the approach

| Situation | Approach |
|---|---|
| Quick check of a local app, no test suite | Python Playwright script + `scripts/webapp-testing/with_server.py` |
| Static HTML file | Read the HTML for selectors, then script against `file://` (see `templates/webapp-testing/static_html_automation.py`) |
| Project has `playwright.config.*` | Write/extend `@playwright/test` specs; run with `npx playwright test` |
| Need specs from scratch for a feature | Plan → generate → heal with `playwright-cli` (section 4) |
| A test fails and you don't know why | `--debug=cli` + `playwright-cli attach` (section 5) |

## 2. Python scripts against a local server (webapp-testing)

The helper starts one or more servers, waits for their ports, runs your script, then shuts everything down. Run `--help` first and treat it as a black box (don't read its source into context).

```bash
python scripts/webapp-testing/with_server.py --help
python scripts/webapp-testing/with_server.py --server "npm run dev" --port 5173 -- python check_home.py
# backend + frontend
python scripts/webapp-testing/with_server.py \
  --server "cd backend && python server.py" --port 3000 \
  --server "cd frontend && npm run dev" --port 5173 -- python check_flow.py
```

The script contains only Playwright logic:
```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")   # dynamic apps: let JS render before inspecting
    page.screenshot(path="/tmp/home.png", full_page=True)
    page.get_by_role("button", name="Sign in").click()
    browser.close()
```

**Reconnaissance, then action**: navigate → wait → screenshot or dump the DOM/buttons/links → pick selectors from what rendered → act. Never inspect the DOM before the page has rendered.

Templates (copy and adapt):
- `templates/webapp-testing/element_discovery.py`: list buttons, links and inputs on a page.
- `templates/webapp-testing/console_logging.py`: capture browser console output during a run.
- `templates/webapp-testing/static_html_automation.py`: drive a local HTML file via `file://`.

## 3. Writing good tests

- **Locators in priority order**: `getByRole` with accessible name → `getByLabel` → `getByText` → `getByTestId` → CSS. Avoid XPath and nth-child chains.
- **Web-first assertions** that auto-retry: `await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()`, `toHaveURL(/dashboard/)`, `toHaveText`. No fixed sleeps, no `waitForSelector`.
- Waits: in `@playwright/test` code, wait for a specific locator or URL, not `networkidle` (flaky on apps with polling or websockets). `networkidle` is fine as a coarse "render done" step in quick reconnaissance scripts.
- One behaviour per test; independent tests (no ordering); fresh state per test via fixtures.
- **Seed/fixture**: a fixture that navigates (and logs in, with test credentials for the local app) so scenarios start from a known state.
- Auth once: log in in a setup project, save `storageState`, reuse it. Keep that file out of git.
- Mock unstable third parties: `page.route('**/api/payments', r => r.fulfill({ json: {...} }))`, or `playwright-cli route "**/api/users" --body='[...]' --content-type=application/json`.
- Visible browser by default for interactive work; `headless: true` in CI or when no display exists.
- Responsive check: loop over viewports (1440×900 desktop, 390×844 mobile) and screenshot each.
- Put the target URL in a constant or env var (`TARGET_URL`), never hard-code production.

Running:
```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test             # don't pop the HTML report
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/login.spec.ts --project=chromium
npx playwright show-trace test-results/**/trace.zip       # inspect a failure
```
Turn on traces on first retry (`trace: 'on-first-retry'`) in config; read the trace before guessing.

## 4. Plan → generate → heal (playwright-cli)

Every `playwright-cli` action prints the equivalent Playwright TypeScript; that output is the raw material for tests.

1. **Workspace**: `test -f playwright.config.ts || npx --no-install playwright --version`. None → `npm init playwright@latest` (ask the user first).
2. **Seed test**: `tests/seed.spec.ts` (or a fixture) that lands in the start state.
3. **Plan**: run the seed with `--debug=cli` in the background, `playwright-cli attach tw-XXXX`, `resume`, explore with `snapshot` / `click` / `eval "location.href"`. Write the scenarios to `specs/<feature>.plan.md` (always a file): happy paths, validation errors, empty states, permissions.
4. **Generate**: for each scenario, drive it with `playwright-cli`, collect the generated lines into `tests/<feature>/<scenario>.spec.ts`, add `expect` assertions for the outcome. Update the spec when it's vague or wrong.
5. **Heal**: run the suite; for each failure, debug (section 5), decide whether the test or the app is wrong. Fix locators/expectations in the test; report real app bugs instead of weakening the assertion.

## 5. Debugging a failing test

```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test tests/cart.spec.ts --debug=cli   # run in background
# wait until "Debugging Instructions" prints a session name, e.g. tw-abcdef
playwright-cli attach tw-abcdef
playwright-cli snapshot        # see the paused page; step to the failing line
```
Explore, copy the generated locator into the test, stop the background run, rerun to confirm green. Common causes: locator matches 0 or 2+ elements, assertion runs before data loads, test depends on another test's state, real regression.

## 6. Done checklist

- [ ] Servers started via `with_server.py` or the project's config (`webServer`), not left running
- [ ] Selectors are role/label based; assertions are web-first; no sleeps
- [ ] External services mocked; test credentials only, local host only
- [ ] Suite run with `PLAYWRIGHT_HTML_OPEN=never`; failures diagnosed from traces
- [ ] Screenshots/traces paths reported; real app bugs reported, not hidden
