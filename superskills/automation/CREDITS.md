# Credits: automation

All content in `references/` is distilled and rewritten. Files in `scripts/` and `templates/` are copied as-is with the source licence beside them.

| Source skill | Repo | Licence | What was used |
|---|---|---|---|
| playwright-cli | https://github.com/microsoft/playwright-cli/tree/main/skills/playwright-cli | Apache-2.0 | Snapshot/ref loop, sessions, state, mocking, tracing, video, test generation and `--debug=cli` attach (browser-automation.md, playwright-testing.md, web-extraction.md, devtools-debugging.md) |
| agent-browser | https://github.com/vercel-labs/agent-browser/tree/main/skills/agent-browser | Apache-2.0 | Version-matched guide rule, driver choice, extraction tips (browser-automation.md, web-extraction.md) |
| browser-use | https://github.com/browser-use/browser-use/tree/main/skills/browser-use | MIT | CDP attach, tab etiquette, shared-lane rule, cloud browsers (browser-automation.md, web-extraction.md) |
| browser (Browserbase) | https://github.com/browserbase/skills/tree/main/skills/browser | MIT | Local vs remote sessions (browser-automation.md, web-extraction.md) |
| chrome-devtools | https://github.com/ChromeDevTools/chrome-devtools-mcp/tree/main/skills/chrome-devtools | Apache-2.0 | Interaction order, output-size rules, extension testing (devtools-debugging.md, browser-automation.md) |
| chrome-devtools-axi | https://github.com/kunchenguid/chrome-devtools-axi/tree/main/skills/chrome-devtools-axi | MIT | CLI-served guidance pattern (devtools-debugging.md, browser-automation.md) |
| browser-act | https://github.com/browser-act/skills/tree/main/browser-act | MIT | Driver table entry only (browser-automation.md) |
| computer-use (Orca) | https://github.com/stablyai/orca/tree/main/skills/computer-use | MIT | Native-app last-resort rules (browser-automation.md) |
| webapp-testing | https://github.com/anthropics/skills/tree/main/skills/webapp-testing | Apache-2.0 | Server helper workflow, reconnaissance-then-action (playwright-testing.md); `scripts/webapp-testing/with_server.py` and `templates/webapp-testing/*.py` copied as-is |
| playwright-skill | https://github.com/lackeyjb/playwright-skill/tree/main/skills/playwright-skill | MIT | Locator priority, web-first waits, responsive checks (playwright-testing.md) |
| n8n-workflow-patterns | https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-workflow-patterns | MIT | Six patterns, batch loops, validate/verify/test/activate gates (n8n.md, automation-design.md) |
| n8n-mcp-tools-expert | https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-mcp-tools-expert | MIT | Tool selection, nodeType formats, credential hygiene (n8n.md) |
| n8n-code-javascript | https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-code-javascript | MIT | Code node modes, performance numbers, return shape, helpers (n8n.md) |
| n8n-code-python | https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-code-python | MIT | Native Python Code node variables, blocked features, empty import allowlist, task-runner image (n8n.md) |
| n8n-expression-syntax | https://github.com/czlonkowski/n8n-skills/tree/main/skills/n8n-expression-syntax | MIT | Expression syntax, webhook `body` rule, JMESPath quoting, silent nulls (n8n.md) |
| n8n-workflow-lifecycle-official | https://github.com/n8n-io/skills/tree/main/skills/n8n-workflow-lifecycle-official | Apache-2.0 | Six-stage lifecycle, what validation misses, sequential fan-out, naming, groups, handoff (n8n.md, automation-design.md) |
| make-scenario-building | https://github.com/integromat/make-skills/tree/main/skills/make-scenario-building | MIT | Two-phase build, provider disambiguation, connection gate, scheduling, verification, app gotchas (make.md, automation-design.md) |
| zapier-sdk | https://github.com/zapier/sdk/tree/main/skills/zapier-sdk | MIT | Discovery commands, connections, runAction, gotchas (zapier.md) |
| workflows-create | https://github.com/zapier/agent-skills/tree/main/skills/workflows/create | MIT | Durable workflow phases, start mode, AI by Zapier, dependency pinning, trigger claims (zapier.md) |
| composio | https://github.com/ComposioHQ/skills/tree/main/skills/composio | MIT | CLI search/link/execute, Tool Router sessions, user IDs, native vs MCP (app-integrations.md) |
| gws-workflow | https://github.com/googleworkspace/cli/tree/main/skills/gws-workflow | Apache-2.0 | Workflow helpers, schema discovery (app-integrations.md) |
| gws-gmail | https://github.com/googleworkspace/cli/tree/main/skills/gws-gmail | Apache-2.0 | Gmail helpers, confirm-before-send (app-integrations.md) |
| gh-axi | https://github.com/kunchenguid/gh-axi/tree/main/skills/gh-axi | MIT | CLI-served GitHub guidance (app-integrations.md) |
| firecrawl-agent | https://github.com/firecrawl/skills/tree/main/skills/core/firecrawl-agent | ISC | Agent extraction commands, schema, credit caps, scrape-first rule (web-extraction.md) |

## Official docs (link-only references, written in our own words)

| Tool | Docs used | Used in |
|---|---|---|
| Microsoft Power Automate | https://learn.microsoft.com/en-us/power-automate/power-automate-plugin-external-tools, https://learn.microsoft.com/en-us/power-automate/run-scheduled-tasks, https://learn.microsoft.com/en-us/power-automate/limits-and-config, https://learn.microsoft.com/en-us/power-automate/guidance/coding-guidelines/error-handling, https://learn.microsoft.com/en-us/power-automate/guidance/coding-guidelines/test-cloud-flows, https://learn.microsoft.com/en-us/connectors/sharepointonline/, https://learn.microsoft.com/en-us/sharepoint/dev/business-apps/power-automate/guidance/working-with-get-items-and-get-files, https://learn.microsoft.com/en-us/connectors/teams/ | platform-workflows.md, automation-design.md |
| Google Apps Script | https://developers.google.com/apps-script/guides/clasp, https://developers.google.com/apps-script/guides/triggers/installable, https://developers.google.com/apps-script/guides/services/quotas, https://developers.google.com/apps-script/manifest, https://developers.google.com/apps-script/reference/mail/mail-app, https://developers.google.com/apps-script/reference/gmail/gmail-app, https://developers.google.com/apps-script/reference/script/script-app, https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app, https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet, https://developers.google.com/apps-script/reference/spreadsheet/range | platform-workflows.md, automation-design.md |
| GitHub Actions | https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows, https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax, https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets, https://docs.github.com/en/actions/reference/security/secure-use, https://docs.github.com/en/actions/reference/limits, https://docs.github.com/en/billing/concepts/product-billing/github-actions, https://cli.github.com/manual/gh_workflow_run, https://cli.github.com/manual/gh_run_view, https://cli.github.com/manual/gh_run_watch | platform-workflows.md, automation-design.md |
| UiPath | https://docs.uipath.com/uipath-cli/standalone/latest/user-guide/installing-uipath-cli, https://docs.uipath.com/uipath-cli/standalone/latest/user-guide/authentication, https://docs.uipath.com/uipath-cli/standalone/latest/user-guide/coding-agents, https://docs.uipath.com/uipath-cli/standalone/latest/user-guide/quickstart, https://docs.uipath.com/orchestrator/automation-cloud/latest/api-guide/rate-limits | platform-workflows.md |
| Selenium | https://www.selenium.dev/documentation/webdriver/getting_started/install_library/, https://www.selenium.dev/documentation/webdriver/getting_started/first_script/, https://www.selenium.dev/documentation/selenium_manager/, https://www.selenium.dev/documentation/webdriver/waits/, https://www.selenium.dev/documentation/webdriver/browsers/chrome/, https://www.selenium.dev/documentation/grid/getting_started/ | browser-automation.md |
| Puppeteer | https://pptr.dev/guides/installation, https://pptr.dev/guides/getting-started, https://pptr.dev/guides/page-interactions, https://pptr.dev/guides/headless-modes, https://pptr.dev/guides/pdf-generation | browser-automation.md |

Left out on purpose from these docs: the one-line installers that pipe a download into a shell or `node` (Power Platform Skills, UiPath CLI); the npm and marketplace routes are given instead.

Idea only, no text copied: the case for hard spend caps over warning emails, from Simon Willison's post of 3 Oct 2026 (https://simonwillison.net/2026/Oct/3/default-hard-budget-caps/), used in automation-design.md rule 12.

Left out on purpose: browser-use's helper that auto-approves Chrome's remote-debugging security prompt and its promotional cloud links; browser-act's CAPTCHA "verification assistance"; Firecrawl's feedback command that sends task objectives to the vendor.

## Also see (not included)

- firecrawl (CLI skill): https://github.com/firecrawl/cli/tree/main/skills/firecrawl (no licence file in repo; link only)
- connect-apps (Composio): https://github.com/ComposioHQ/awesome-claude-skills/tree/master/connect-apps (no LICENSE file, licence only stated in README; link only)
- apify-ultimate-scraper: https://github.com/apify/agent-skills/tree/main/skills/apify-ultimate-scraper (no licence file; link only)
