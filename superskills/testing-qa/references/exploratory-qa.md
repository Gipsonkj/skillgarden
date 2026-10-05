# Exploratory QA: test the running app, report, fix, verify

> Distilled from: qa (garrytan/gstack, MIT), ui-test (browserbase/skills, MIT), browser-testing-with-devtools (addyosmani/agent-skills, MIT), argent-test-ui-flow (software-mansion/argent, Apache-2.0)

Exploratory QA uses the app the way a user would, looking for anything broken, confusing or slow, and records evidence for every issue. It complements automated tests; it doesn't replace them. Report template: [templates/qa/qa-report-template.md](../templates/qa/qa-report-template.md).

## Setup

| Parameter | Default |
|---|---|
| Target | The URL the user gave; otherwise a local dev server (probe ports 3000, 5173, 8080, 4000), staging or preview URL; ask if none |
| Mode | Diff-aware on a feature branch without a URL; Full with a URL |
| Output | A project folder such as `qa-reports/` (report + screenshots) |
| Auth | A test account the user provides. Never ask for credentials in chat; let the user log in themselves in the browser, or load a saved storage state |
| Browser | An isolated profile or a fresh context, not the user's everyday browser |

Ask once, before acting, about anything that would change real data outside a local environment (sending email, payments, deleting records). Looking is fine; acting on non-local systems needs a yes.

## Modes

| Mode | When | Scope |
|---|---|---|
| Diff-aware | Feature branch, no URL | `git diff <base>...HEAD --name-only` and `git log <base>..HEAD`; map changed routes, components, models and styles to pages; test those and their neighbours |
| Full | A URL is given | Every reachable page and main flow, 5-15 minutes; document 5-10 evidenced issues, never invent one |
| Quick | Smoke check | Home + top 5 navigation targets: loads, console errors, broken links |
| Regression | A previous report exists | Full run, then list fixed issues, new issues and the score change |

## Workflow

1. **Orient.** Open the target, establish the baseline: what does success look like on this page? Hook console errors and failed requests before navigating.
2. **Explore.** Walk real flows end to end: sign-up, the core task, settings, error paths. After every interaction check the console and network. Try: empty and invalid input, double-submit, back/forward, refresh mid-flow, deep links, long text, slow network, mobile viewport (375 px), keyboard only.
3. **Document** each issue as you find it, with a reproduction and evidence (screenshot path, console line, request and status).
4. **Score** with the rubric below and write the report.
5. **Triage**: order by severity; mark what's fixable now, what needs a decision, and what's out of scope.
6. **Fix loop** (only if the user asked for fixes), per issue in severity order:
   - Reproduce with a minimal replay; note actual vs expected.
   - Write a regression test first at the lowest level that catches it, extending an existing test or table when one covers the area. Run it and confirm it fails because of the bug, not a bad fixture. Don't add a production seam just for the test.
   - Make the minimal fix in the responsible file. No unrelated refactors.
   - Re-test: the regression test, the original reproduction, and the adjacent happy path. For UI bugs take an after screenshot.
   - Commit each verified fix separately with the issue ID in the message.
7. **Wrap up**: report, before/after evidence, regression tests added, deferred items, ship readiness.

Don't read the source to decide whether something "should" work during discovery; test the behaviour. Environment failures (server down, missing seed data) are blockers to report, not bugs to fix.

## Issue taxonomy

| Category | Examples |
|---|---|
| Visual / UI | Overlap, clipped text, horizontal scroll, broken images, z-index, dark-mode issues, jank |
| Functional | Dead buttons, broken links, wrong redirects, validation missing or bypassable, state lost on refresh/back, double-submit, wrong search results |
| UX | Dead ends, no loading feedback for > 500 ms, vague errors ("Something went wrong"), no confirmation for destructive actions, inconsistent patterns |
| Content | Typos, placeholder or lorem ipsum text, wrong labels, truncation without a way to read, unhelpful empty states |
| Performance | Load > 3 s, layout shift after load, janky scrolling, 50+ requests on one page, huge images |
| Console / errors | Uncaught exceptions, 4xx/5xx, CORS, mixed content, CSP violations, hydration errors |
| Accessibility | Missing alt, unlabelled inputs, broken keyboard navigation, focus traps, wrong ARIA |
| Links | 404s, wrong destination |

| Severity | Definition |
|---|---|
| Critical | Data loss, security or privacy exposure, crash, or core app unusable |
| High | A major task blocked with no workaround |
| Medium | Task impaired, workaround exists (mobile layout broken, slow page) |
| Low | Cosmetic, copy or minor friction |

Deduplicate: one root cause on many pages is one issue.

## Health score (0-100)

Score each tested category, start at 100:
- Console: 0 errors = 100; 1-3 = 70; 4-10 = 40; 11+ = 10.
- Links: -15 per broken link.
- Other categories: -25 per critical, -15 per high, -8 per medium, -3 per low (minimum 0).

Weights: Functional 20%, Console 15%, UX 15%, Accessibility 15%, Visual 10%, Performance 10%, Links 10%, Content 5%. Leave untested categories out and mark the score "provisional (coverage: ...)". Compare scores only across runs with the same coverage.

## Framework-specific things to watch

- **Next.js / React SSR**: hydration mismatch errors, `_next/data` 404s, client-side navigation (click links, don't only `goto`), layout shift from dynamic content.
- **SPAs**: stale state when returning to a view, back/forward history, memory growth over a long session.
- **Rails**: CSRF on forms, Turbo transitions, flash messages appearing and dismissing.
- **WordPress**: plugin JS conflicts, admin bar when signed in, mixed content.

## Issue format

```
ISSUE-003  High  Functional
Title: Saving a draft twice creates two invoices
Steps: 1. /invoices/new  2. fill client "Northwind"  3. double-click "Save draft"
Expected: one draft. Actual: two drafts INV-1042, INV-1043.
Evidence: qa-reports/issue-003.png; POST /api/invoices x2 (201, 201)
Likely area: InvoiceForm submit handler (no pending state)
```

## Where findings and results go: Jira and TestRail

> Written from the official Atlassian (Rovo MCP, Jira REST API v3) and TestRail CLI docs (link-only, our own words); see CREDITS.md.

### Pick a tool

| Need or situation | Tool | Why |
|---|---|---|
| The team already tracks bugs or test cases somewhere (Jira, Xray or Zephyr in Jira, TestRail, GitHub Issues, Linear) | That one | Findings belong where the team triages |
| No tracker, or a one-off pass | The report from `templates/qa/qa-report-template.md` | No account, nothing written to shared systems |
| File QA bugs in Jira Cloud from Claude | Atlassian Rovo MCP server | OAuth, acts with the user's own Jira permissions |
| Create or update Jira issues from a CI job or script | Jira REST API v3 with an API token | No interactive sign-in |
| Test cases and runs live in TestRail; push automated results there | TestRail CLI (`trcli`) | Uploads JUnit XML and matches it to cases |
| Test cases live in Jira through Xray or Zephyr | That app's own import or API | Not covered here; ask the user which app and how they import today |
| Unknown tracker, project key or issue type | Ask the user | A bug filed in the wrong project is noise |

Writing to a tracker is visible to the whole team. **Show the exact item (project, type, summary, description, attachments, or the run title and result count) and wait for a yes before creating it.** Search for an existing issue first; one root cause is one issue (see "Deduplicate" above). Screenshots and logs can contain personal data or tokens: check before attaching.

### Jira

**MCP (interactive).** `claude mcp add --transport http atlassian https://mcp.atlassian.com/v2/mcp`, then `/mcp` in Claude Code to sign in with OAuth 2.1. (`/v1/mcp` is the legacy endpoint.) It works across Jira, Confluence and other Atlassian products with the user's existing permissions, so it can do anything they can: keep to searching, creating and commenting on QA issues.

**REST API v3 (scripts and CI).** Basic auth with the user's email and an API token created in their Atlassian account (revocable per token); keep both in environment variables or CI secrets (here `JIRA_EMAIL`, `JIRA_API_TOKEN`), never in the repo. Base URL `https://<site>.atlassian.net`.

| Job | Call |
|---|---|
| Find duplicates first | `GET /rest/api/3/search/jql?jql=<bounded JQL>&fields=key,summary,status`; the JQL needs a restriction (`project = SHOP AND text ~ "double submit"`), `maxResults` defaults to 50, page with `nextPageToken`. The old `/rest/api/3/search` is being removed |
| Look up issue type IDs | `GET /rest/api/3/issue/createmeta/{projectKey}/issuetypes` |
| Create the bug | `POST /rest/api/3/issue`; `description` and `environment` take Atlassian Document Format (ADF), single-line text fields take plain strings; the response has `id`, `key`, `self` |
| Attach evidence | `POST /rest/api/3/issue/{key}/attachments`, multipart field `file`, header `X-Atlassian-Token: no-check` (requests without it are blocked) |
| Add a comment | `POST /rest/api/3/issue/{key}/comment` |

```bash
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Content-Type: application/json" \
  -X POST "https://example.atlassian.net/rest/api/3/issue" --data '{
  "fields": {
    "project":   { "id": "10000" },
    "issuetype": { "id": "10004" },
    "summary":   "Saving a draft twice creates two invoices",
    "description": { "type": "doc", "version": 1, "content": [
      { "type": "paragraph", "content": [ { "type": "text",
        "text": "Steps: /invoices/new, fill client, double-click Save draft. Expected one draft, got INV-1042 and INV-1043." } ] } ] }
  } }'
```

On `429 Too Many Requests`, wait for the `Retry-After` header before retrying.

### TestRail

**trcli** is TestRail's own CLI: `pip install trcli` (Python 3.10+ recommended). Give it the host, username, API key and project through environment variables (`TR_CLI_HOST`, `TR_CLI_USERNAME`, `TR_CLI_KEY`, `TR_CLI_PROJECT`; command-line flags beat a `-c` config file, which beats environment variables) and keep any config file out of the repo. Use the API key (`--key`) rather than the password. Exit code 0 means success; anything else (usually 1 or 2) means it failed.

Push a JUnit report (pytest `--junit-xml=path`, Playwright/Postman/Newman JUnit reporters) as a new run:

```bash
trcli -n parse_junit -f "reports/*.xml" --title "PR 123: orders API" --case-matcher name
# add --run-id 456 to report into an existing run, --milestone-id, --close-run, --suite-id for multi-suite projects
```

Matching results to cases:

| Approach | How | Watch out |
|---|---|---|
| Spec-first (cases written in TestRail) | Case ID in the test name, `[C123] test_cancel_order` (`--case-matcher name`), or a `test_id` property (`--case-matcher property`) | Use `-n` so unmatched tests don't create duplicate cases |
| Code-first (tests create the cases) | A custom Text field with system name `automation_id`; trcli matches it to `classname.name` | Renaming a test creates a new case unless its `automation_id` is updated; `-y` auto-creates cases in the team's repository, so ask first |

Statuses: the default mapping can be overridden with `case_result_statuses` in a YAML config (`passed`, `skipped`, `error`, `failure` to status IDs). Read the project's real IDs from `get_statuses` before mapping skips: a skipped test is neither a pass nor a failure.

Read cases to turn into tests: `trcli cases list --suite-id 2 --json-output` and `trcli cases get --case-id 123`. For anything trcli doesn't cover, the API lives at `https://<host>/index.php?/api/v2/<method>` with basic auth (username and API key) and JSON bodies (`Content-Type: application/json`). TestRail's API reference blocks scripted fetching; open it in a browser and confirm method names before calling them.
