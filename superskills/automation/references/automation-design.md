# Designing automations that survive production

> Distilled from: n8n-workflow-patterns, n8n-mcp-tools-expert (czlonkowski/n8n-skills, MIT), n8n-workflow-lifecycle-official (n8n-io/skills, Apache-2.0), make-scenario-building (integromat/make-skills, MIT), workflows-create and zapier-sdk (zapier, MIT), composio (ComposioHQ/skills, MIT)

Platform-neutral rules for any automation: n8n, Make, Zapier, a script on cron, or an agent run on a schedule. The platform files cover the mechanics.

## 1. Pick the vehicle

| Situation | Use |
|---|---|
| One-off task right now ("send this email", "make an issue") | Direct CLI/API/MCP call (gws, gh, Composio CLI, Zapier CLI). No workflow |
| Repeating, deterministic, connects SaaS apps | A workflow platform (pick one with the table below) or a small script |
| Repeating, needs judgment (classify, summarise, draft) | Workflow with one AI step, not a free-roaming agent |
| Open-ended multi-step judgment | Agent (see the ai-agents super skill) |
| No API exists, only a web UI | Browser automation (browser-automation.md) |
| Only a native desktop app | Computer use, as a last resort |

Order of preference for reaching a system: **official API/CLI → MCP/connector → integration broker (Composio, Zapier) → browser → GUI**. A plain HTTP fetch beats a browser for public pages.

### Pick a platform

| The user's situation | Use | Why |
|---|---|---|
| Already uses or pays for one of these | That one | Connections, licences and admins already exist; a second platform doubles the upkeep |
| Not sure what they have | Ask which platform they log into and on which plan or licence | Connectors, limits and quotas depend on it; don't guess |
| Team on Microsoft 365 (Outlook, Teams, SharePoint, Excel) | Power Automate → platform-workflows.md | Microsoft 365 plans include it at the lowest request tier; official Claude Code plugin |
| Team on Google Workspace, data in Sheets, Gmail, Forms | Google Apps Script → platform-workflows.md | Free with the Google account, within daily quotas |
| A script that should run on a schedule next to its code | GitHub Actions → platform-workflows.md | Free in public repos; private repos get monthly minutes |
| Desktop or legacy apps with no API, or an existing robot estate | UiPath → platform-workflows.md (Power Automate desktop flows in a Microsoft shop) | Robots drive the UI where nothing else can |
| Many SaaS apps, wants code nodes or to self-host | n8n → n8n.md | |
| Many SaaS apps in a visual builder | Make → make.md | |
| Code or an agent calling many apps through managed connections | Zapier → zapier.md, or Composio → app-integrations.md | |
| No account and no budget | Apps Script on a personal Google account, or GitHub Actions in a public repo | Both free within their limits |
| A script that runs in the user's cloud (Cloud Run job, Workers Cron) | `cloud-devops` craft | |

## 2. Plan before building

Write a one-paragraph plan the user confirms:
- **Trigger**: schedule (cron + timezone), webhook/instant event, polling, or manual. Prefer instant/webhook triggers: faster and cheaper than polling.
- **Every app named explicitly.** "Form", "CRM", "AI", "email" are categories: ask which product (Google Forms or Typeform? OpenAI or Anthropic? Gmail or Outlook?). Different products mean different modules, auth and limits.
- **Data path**: what moves from where to where, field by field, and in which direction.
- **Conditions and branches**, waits, human approvals.
- **Side effects**: which steps write, send, pay, or delete. These get gates and test mocks.
- **Failure plan**: what happens on an API error, empty input, duplicate input.

Present the flow in arrow notation and get a yes:
```
Schedule (Mon 09:00 Europe/Berlin) → Stripe: list refunds (last 7 days) → Sheets: append rows
  → AI: summarise → Gmail: create draft to finance@ (not send)
```
Treat the confirmed plan as a contract; if you need to change the shape mid-build, say so and re-confirm.

## 3. Reliability rules

1. **Idempotent writes.** Upsert by a natural key or keep a processed-ID store (data store / static data / table) so re-runs and retries never double-post.
2. **Dedupe on input.** Webhooks fire twice; polling overlaps. Match cadence to lookback (daily run, 1-day window) and dedupe anyway.
3. **Retries with backoff** for transient errors (429, 5xx, timeouts); no retries for 4xx validation errors: fix the data.
4. **Rate limits**: batch to the API's page/bulk size, add delays between batches, prefer bulk endpoints.
5. **Pagination**: loop until `has_more` is false; never assume the first page is everything.
6. **Validate early**: check required fields right after the trigger and stop with a clear error.
7. **Error path**: a global error workflow/handler that notifies a human with the run link and input; per-step handlers only where a step can safely fall back.
8. **Times**: store UTC, convert at the edges, state the timezone of every schedule.
9. **Money and floats**: compare at the cent level (`Math.round(a*100)`), write numbers as numbers.
10. **Threshold checks both ways**: `Math.abs(diff) > threshold` catches spikes and crashes.
11. **No hard-coded dates** in scheduled prompts or filters: compute "today" at run time.
12. **Cap what an unattended run can spend.** An alert tells you after the bill; a limit stops it. For anything on a schedule or webhook that calls a paid API, an LLM, a scraping credit pool or cloud compute: set a hard per-run ceiling (max items, pages, tokens, credits, loop iterations; stop and notify when it is hit), set the provider-side monthly cap where one exists (cloud budgets that pause the service, API workspace spend limits) rather than only a warning email, and tell the user the numbers and how to raise them. A webhook that fans out per item, or an agent loop with no iteration limit, is the usual runaway.

## 4. Credentials and safety

- Credentials live in the platform's credential store or a secret manager; never in node parameters, code, sticky notes or chat. If a user pastes a secret in chat, tell them to rotate it.
- **Never auto-pick a connection.** List matching connections (with account email and scope status) and let the user choose, even when only one exists. A connection that authenticates but lacks scopes fails later.
- Never generate placeholder credential IDs in workflow JSON: omit the block and let the user select it.
- OAuth connections need a human click; give the user the connect URL and wait.
- Webhook URLs are bearer secrets: don't paste them into logs or public docs; add a shared-secret header or signature check.
- Per-user apps (Composio, Zapier SDK): use a stable internal user ID per end user, never a shared "default" user or an email address.
- Ask before running anything that sends, posts, pays or deletes for real. Test with mocks, pinned data, drafts or a sandbox account.

## 5. Validate, verify, test, then activate

Validation passing is necessary, not sufficient.
1. **Validate**: the platform's schema/config validator on every node and the whole workflow.
2. **Verify wiring**: read the saved workflow back and check the connections object/blueprint matches the plan (validators miss dropped wires, collapsed fan-outs, off-by-one merge inputs, error outputs without error mode enabled).
3. **Test** with representative pinned/mock data, including empty input, one item, many items and a bad item. Confirm output shape, not just "success": a step can succeed and hand downstream an empty value.
4. **Activate/publish** only after 1–3 pass. Watch the first real executions.

## 6. Readability and handoff

- Name workflows verb-first and scoped ("Send weekly refund summary"); name steps by what they do ("Fetch refunds", not "HTTP Request1").
- Add a 1–2 sentence description: what it does and **why it exists**, including context from the conversation that won't survive otherwise.
- Group steps past ~10 nodes; notes only for non-obvious logic.
- Handoff (half a dozen bullets): how it triggers (URL, cadence + timezone), what it produces and where, how to run it manually, what to watch (error notifications, rate limits, where logs are), what's still pending on the user's side (credentials, rotation).

## 7. Done checklist

- [ ] Plan confirmed with every app named and every side effect listed
- [ ] Credentials chosen by the user; no secrets in the workflow
- [ ] Idempotency/dedupe, retries and an error path in place
- [ ] Per-run spend ceiling and a provider-side cap for paid steps, stated in the handoff
- [ ] Validated, wiring verified, tested on edge cases with mocks
- [ ] Activated only after tests; first run checked
- [ ] Handoff note delivered with the live URL or schedule
