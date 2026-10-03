# Make (Make.com) scenarios

> Distilled from: make-scenario-building (integromat/make-skills, MIT)

Vendor-specific guide for building Make scenarios through the Make MCP server. General planning and reliability rules are in automation-design.md. Tool names below are the Make MCP's; if one isn't found by exact name, look for the similarly named tool.

## Phase 1: understand and plan (never skip)

### 1. Clarify the use case
- Start with 1–2 questions (what to automate, which systems), then drill into trigger, data direction, conditions, error needs.
- **Provider disambiguation is mandatory.** Generic categories ("form", "AI", "email", "CRM", "calendar", "storage", "database", "chat") and capability words ("summarise", "notify", "store") don't name an app. Ask which product before going further.
- Proceed only when the use case fits in one paragraph with every app named.

### 2. Identify modules
1. `apps_recommend` for each app, **one app per call** (calls can run in parallel). Record exact app name and version.
2. `app_modules_list` (pass `appVersion`) to see triggers, actions, searches. **Never guess module names**; case and spelling must match.
3. `app_documentation_get` once per app with the exact `appName`.
4. Pick trigger, action and utility modules. There is **no scheduler module**: scheduling is a scenario setting (`scenario_scheduling_update`).

Trigger choice: instant/webhook triggers are faster and use fewer operations but are hard to verify end to end (see Phase 2 step 6). Use a webhook when the user needs real-time or the source only offers webhooks; otherwise a polling "Watch…" module or schedule is easier to verify.

### 3. Look up a template (recommended for aggregators, AI modules, unfamiliar apps, >3 modules)
`public-templates_list` (name keywords + `usedApps`) → highest usage with most overlap → `public-templates_get-blueprint`. Use it as a structural reference for module versions and mapper shapes, not as a copy; tell the user how it differs.

### 4. Present and confirm
```
Trigger: Typeform - Watch Responses → Anthropic - Create a Message → If-Else
  ├─ If (sentiment = negative): Slack - Send Message
  └─ Else: (nothing)
→ Merge → Google Sheets - Add a Row
```
One sentence per module, then ask "Does this composition do what you need?" Output a **Scenario Plan** (use case, trigger type, table of app / version / module slug / role, flow). The plan is a contract: any later change in modules, branching or trigger is proposed and re-confirmed, never silent.

## Phase 2: configure, deploy, verify

1. **Connections (hard gate).** `extract_blueprint_components` on the unconfigured blueprint gives the definitive list of connection types and OAuth scopes. `connections_list` for the team (no type filter, then match by `accountName`). For every app, list all matches with name, ID, account email and **scope status**, plus "Create a new connection", and wait for the user's pick, **even when there is only one**. No module RPCs (sheet/channel lists) before every connection is confirmed. Missing → `credential_requests_create` with the required scopes.
2. **Configure modules left to right**: read the module interface (`app-module_get`), load dynamic options via RPCs, fill parameters and mapper, `validate_module_configuration` on each.
3. `validate_blueprint_schema` on the full blueprint (it needs a top-level `metadata` object).
4. `scenarios_create`. Scheduling: webhook/instant first module → `{"type": "immediately"}`; polling → `"indefinitely"` with an interval. Using "indefinitely" on a webhook scenario fails with "Invalid interval".
5. `scenarios_activate` (new scenarios are inactive; running before activating fails).
6. **Run and verify**: `scenarios_run`, then `executions_list` / `executions_get`. Status `1` = success, `3` = error (read `error.message`, `error.causeModule`). Fix loop: deactivate → `scenarios_update` → activate → run. Use the headless tools, not the `show_*` UI tools, while iterating.
   - Status 1 is not proof of correct data: inspect the output; a module can succeed and pass an empty value. Use a Throw module to turn bad data into a real failure.
   - **Webhook scenarios**: `scenarios_run` injects data straight into the trigger and does not return outputs, so it verifies neither direction. The webhook URL is a bearer secret: don't fetch and echo it; tell the user where to find it and have them send a real request (`curl`).
7. Give the scenario URL: `https://<zone>.make.com/<teamId>/scenarios/<scenarioId>` (team ID, not org ID).

## Building blocks

| Concept | Rule |
|---|---|
| Bundles | Each module outputs bundles; a search returning 10 rows runs downstream modules 10 times |
| Iterator / aggregators | Iterator splits an array into bundles; Array/Text/Numeric/Table aggregators collapse them back (set the source module) |
| Filters | Conditions on the link between modules; cheapest way to drop bundles |
| **If-Else + Merge** | Mutually exclusive branches that converge into shared steps |
| **Router** | Several routes can fire for one bundle; routes never merge back; add a fallback route |
| Data stores | Key-value storage across runs: dedupe, state, cross-scenario sharing |
| Subscenarios | Reuse; sync or async calls with declared inputs/outputs |
| AI agents | Make AI Agents with module, scenario and MCP tools; non-deterministic, verify outputs |

## Error handlers (only when the user asks for error handling)

| Handler | Effect | Typical use |
|---|---|---|
| Break | Store incomplete execution; auto/manual retry (exponential backoff) | Connection errors, rate limits |
| Commit | Stop, keep changes so far | Halt but preserve partial work |
| Ignore | Drop the error, continue with next bundles | Non-critical items |
| Resume | Substitute a fallback output, continue | Reasonable default exists |
| Rollback | Stop and revert transactional (ACID) modules | All-or-nothing; only ACID modules revert |

Break leaves incomplete executions that need resolving.

## App gotchas

- **Google Sheets** add/update row: mapper must include `"valueInputOption": "USER_ENTERED"` (400 otherwise). Spreadsheet IDs from the `listSpreadsheets` RPC need a leading `/` in select mode.
- **Gmail** uses connection `accountName: "google-email"`, not `"google"`; a generic Google connection lacks Gmail scopes. Slack is `slack2`/`slack3`.
- **IML dates**: there's no `startOfDay()`/`endOfDay()`; use `{{formatDate(now; "YYYY-MM-DD")}}T00:00:00Z`.
- **Make AI Tools** (`ai-tools:Ask`): `model` is required with no default; with the Make AI Provider use tier slugs (`small`, `medium`, `large`), not provider model IDs. No Make AI connection → use the provider app's own module (OpenAI, Anthropic, Gemini).
- Code module id: `code:ExecuteCode`.

## Checklist

- [ ] Every app named by product; modules verified via `app_modules_list`
- [ ] Scenario Plan confirmed; deviations re-confirmed
- [ ] User picked each connection; scopes sufficient
- [ ] Each module validated, blueprint validated, scheduling type matches trigger
- [ ] Activated, run, output content checked (webhooks verified by the user's real request)
- [ ] Scenario URL handed over
