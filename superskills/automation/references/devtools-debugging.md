# Debugging pages with Chrome DevTools (MCP and CLI)

> Distilled from: chrome-devtools (ChromeDevTools/chrome-devtools-mcp, Apache-2.0), chrome-devtools-axi (kunchenguid/chrome-devtools-axi, MIT), playwright-cli tracing notes (microsoft/playwright-cli, Apache-2.0)

Use DevTools tooling when the question is "why is this page broken or slow": console errors, failed requests, CSS, performance traces, extensions.

## 1. Two front ends

| Tool | How | Notes |
|---|---|---|
| **Chrome DevTools MCP** (`chrome-devtools-mcp`) | MCP tools: `new_page`, `navigate_page`, `wait_for`, `take_snapshot`, `click`, `fill`, `evaluate_script`, `list_console_messages`, `list_network_requests`, `get_css_styles`, performance trace tools | Browser starts on first call with a persistent profile; config via `npx chrome-devtools-mcp@latest --help` |
| **chrome-devtools-axi** (CLI) | `npx -y chrome-devtools-axi --help`, then `<command> --help` | Guidance lives in the CLI; follow its next-step hints; run follow-ups as `npx -y chrome-devtools-axi ...` |

Optional MCP flags: `--categoryExtensions` (extension tools), `--memoryDebugging` (memory tools). If those tools aren't in your list, ask the user to add the flag to their MCP config and restart the client; don't work around it.

## 2. Interaction order

1. `new_page` / `navigate_page`.
2. `wait_for` the text or element you expect.
3. `take_snapshot` (with `pageId`) to get element `uid`s.
4. Act by `uid` (`click`, `fill`, passing the `pageId`). Element missing → fresh snapshot.

Parallel tool calls are fine if this order holds per page. Page-scoped tools need a `pageId` from `list_pages` or `new_page`.

## 3. Keep outputs small

- `filePath` for screenshots, snapshots and traces instead of inlining them.
- Paginate and filter: `pageIdx`, `pageSize`, `types` (e.g. only `error` console messages, only `xhr`/`fetch` requests).
- `includeSnapshot: false` on input actions unless you need the updated tree.
- Snapshot for automation, screenshot only when the user needs to see visual state.

## 4. Diagnosis recipes

| Symptom | Steps |
|---|---|
| Blank page / JS error | Reload → console messages filtered to errors → open the stack's source → `evaluate_script` to inspect state |
| Data not showing | Network requests filtered to fetch/xhr → status codes, response body, CORS errors → compare request payload with what the API expects |
| Wrong styling | `get_css_styles` on the element: matched rules, cascade, CSS variables (treat as authoritative) |
| Layout shift / slow load | Start a performance trace → reload → stop → read LCP, CLS, INP, long tasks, render-blocking resources; fix the largest first |
| Works locally, fails in CI | Compare console and network between both; check env-specific URLs and feature flags |
| Flaky interaction | Snapshot before/after; look for overlays, disabled states, animations; wait for a condition, not a timeout |

Report the evidence (error text, request URL + status, metric values) and the suspected cause before changing code. After a fix, re-run the same recipe to confirm.

## 5. Testing a Chrome extension (MCP with `--categoryExtensions`)

1. `install_extension` with the unpacked extension path.
2. Get the ID from the response or `list_extensions`.
3. `trigger_extension_action` to open the popup or side panel.
4. `evaluate_script` with `serviceWorkerId` (omit `pageId`) to check background state.
5. Navigate to a target page and `take_snapshot` to confirm content scripts injected what they should.

## 6. Playwright alternatives

- `playwright-cli console`, `network`, `tracing-start` / `tracing-stop` give the same evidence inside a Playwright session; open traces with `npx playwright show-trace`.
- For performance budgets in CI, a Lighthouse run or Playwright trace beats eyeballing.

## 7. Limits

When the MCP can't answer (deep memory leaks, rendering internals), point the user to the DevTools UI and its AI assistance panel. Launch problems: check the project's troubleshooting doc (Chrome path, sandbox flags, profile lock from another running instance).

## 8. Done checklist

- [ ] Evidence captured (console errors, failing requests, metrics) before changing code
- [ ] Large outputs written to files, not pasted
- [ ] Fix verified by repeating the same recipe
- [ ] Extension/memory flags requested from the user rather than bypassed
