# Credits

This super skill is distilled from the open-source agent skills below. Reference files are rewritten summaries; files under `scripts/` and `templates/` are copied unchanged with their source license beside them.

| Source skill | Repo | License | Used for |
|---|---|---|---|
| webapp-testing | https://github.com/anthropics/skills/tree/main/skills/webapp-testing | Apache-2.0 | Python Playwright approach, reconnaissance-then-action; `scripts/webapp-testing/with_server.py` and `examples/` copied |
| playwright-cli | https://github.com/microsoft/playwright-cli/tree/main/skills/playwright-cli | Apache-2.0 | Snapshot/ref interaction loop, session state, routing, tracing commands |
| playwright | https://github.com/openai/skills/tree/main/skills/.curated/playwright | Apache-2.0 | CLI workflow guardrails (re-snapshot rules, artifacts). Its `npx --yes` wrapper script was not copied |
| test-driven-development | https://github.com/obra/superpowers/tree/main/skills/test-driven-development | MIT | Red-green-refactor, rationalisations, "name the break", mutation check, mocking rules |
| e2e-testing | https://github.com/affaan-m/everything-claude-code/tree/main/skills/e2e-testing | MIT | Playwright config, artifacts, CI workflow, report template |
| qa | https://github.com/garrytan/gstack/tree/main/qa | MIT | QA modes, issue taxonomy, health-score rubric, fix loop with regression tests; `templates/qa/qa-report-template.md` copied. Its telemetry, learnings binaries and host-specific tooling were left out |
| browser-testing-with-devtools | https://github.com/addyosmani/agent-skills/tree/main/skills/browser-testing-with-devtools | MIT | DevTools debugging workflows and browser security boundaries |
| python-testing-patterns | https://github.com/wshobson/agents/tree/main/plugins/python-development/skills/python-testing-patterns | MIT | pytest fixtures, parametrisation, mocking, test types |
| javascript-testing-patterns | https://github.com/wshobson/agents/tree/main/plugins/javascript-typescript/skills/javascript-testing-patterns | MIT | Jest/Vitest patterns, MSW, Testing Library |
| e2e-testing-patterns | https://github.com/wshobson/agents/tree/main/plugins/developer-essentials/skills/e2e-testing-patterns | MIT | What E2E should and shouldn't cover, best practices |
| pytest-coverage | https://github.com/github/awesome-copilot/tree/main/skills/pytest-coverage | MIT | Coverage annotate workflow (its 100% target was moderated) |
| java-junit | https://github.com/github/awesome-copilot/tree/main/skills/java-junit | MIT | JUnit 5 structure, parameterised tests, Mockito |
| cypress-author | https://github.com/cypress-io/ai-toolkit/tree/main/skills/cypress-author | MIT | Cypress task identification, authoring rules, waiting, state, async. Its mandatory branded sign-off was dropped |
| playwright-expert | https://github.com/jeffallan/claude-skills/tree/main/skills/playwright-expert | MIT | Must/must-not rules, debugging workflow |
| vitest | https://github.com/antfu/skills/tree/main/skills/vitest | MIT | Vitest API, mocking, timers, fixtures, projects |
| fix-flaky-tests | https://github.com/intercom/2x-skills/tree/main/plugins/test-tools/skills/fix-flaky-tests | MIT | Hard rules, fast exits, flake classification, CI-only verification by measurement |
| flutter-add-widget-test | https://github.com/flutter/agent-plugins/tree/main/skills/flutter-add-widget-test | BSD-3-Clause | Flutter widget test workflow |
| argent-test-ui-flow | https://github.com/software-mansion/argent/tree/main/packages/skills/skills/argent-test-ui-flow | Apache-2.0 | Mobile interact-screenshot-verify loop, evidence types, recovery |
| playwright-best-practices | https://github.com/currents-dev/playwright-best-practices-skill/tree/main/playwright-best-practices | MIT | Test-type decision matrix, mock-or-real matrix, locator priority, assertions, flaky categories, CI conditions |
| property-based-testing | https://github.com/trailofbits/skills/tree/main/plugins/property-based-testing/skills/property-based-testing | CC-BY-SA-4.0 | Property catalogue, strength order, tautology/vacuity, failure classification, library list (references/property-and-mutation.md is CC-BY-SA-4.0) |
| mutation-testing | https://github.com/trailofbits/skills/tree/main/plugins/mutation-testing/skills/mutation-testing | CC-BY-SA-4.0 | Mutation outcomes, survivor interpretation, severity vs risk, equivalent mutants (references/property-and-mutation.md is CC-BY-SA-4.0) |
| ui-test | https://github.com/browserbase/skills/tree/main/skills/ui-test | MIT | Assertion strength ladder, step pass/fail markers. Its remote mode that syncs local browser cookies to a cloud service was left out |
| golang-testing | https://github.com/samber/cc-skills-golang/tree/main/skills/golang-testing | MIT | Go table tests, parallelism, goleak, synctest, fuzzing, build tags |
| swift-testing-pro | https://github.com/twostraws/Swift-Testing-Agent-Skill/tree/main/swift-testing-pro | MIT | Swift Testing rules, XCTest migration, review format |

## Also see (not included)

- momentic-spec (https://github.com/momentic-ai/skills/tree/main/skills/momentic-spec): no license file and needs a Momentic account; link only.
- playwright-skill (https://github.com/lackeyjb/playwright-skill/tree/main/skills/playwright-skill): an executable Playwright runner for Claude; overlaps with the bundled webapp-testing helper.
- playwright-skill (https://github.com/testdino-hq/playwright-skill): Playwright guides for POM, CI and migration; overlaps with the sources used.
- The full playwright-best-practices reference set (framework-specific guides for Next.js, React, Vue, Angular; Electron, extensions, WebSockets, service workers).
