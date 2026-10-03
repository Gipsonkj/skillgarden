# Zapier SDK, CLI and durable workflows

> Distilled from: zapier-sdk (zapier/sdk, MIT), workflows-create (zapier/agent-skills, MIT)

Vendor-specific guide. Zapier gives code and agents governed access to ~9,000 apps through OAuth connections Zapier holds. Three interfaces share the same capabilities:

| Interface | Use when |
|---|---|
| **SDK** (`@zapier/zapier-sdk`, TypeScript) | The deliverable is code (script, API route, Lambda) |
| **CLI** (`npx zapier-sdk ...`, package `@zapier/zapier-sdk-cli`) | One-off commands, exploration, shell scripts |
| **Durable workflow** (`@zapier/zapier-durable`) | Zapier's infrastructure runs it on a trigger (webhook, poll, schedule) with retry-safe steps |
| Zapier MCP | Ad-hoc tool calls in a chat client, no code |

## 1. Never trust memory

The SDK is new and changes often. Verify every method against `node_modules/@zapier/zapier-sdk/README.md` (version-locked) or https://docs.zapier.com/sdk/reference. Never invent app keys, action keys or input shapes; discover them:

```bash
npx zapier-sdk get-profile                      # who am I (there is no whoami/status/auth)
npx zapier-sdk list-apps --search notion        # substring match: confirm the right app
npx zapier-sdk list-actions notion --action-type search
npx zapier-sdk list-action-input-fields notion search page_by_title   # dynamic: run against a live connection
npx zapier-sdk --help                           # before guessing any other command
```
Use default output for reading; add `--json` (per subcommand) only to pipe into `jq`. Filter out `is_hidden: true` actions (not on the stable surface).

## 2. Setup

```bash
ls node_modules/@zapier/zapier-sdk 2>/dev/null && echo installed
npm install @zapier/zapier-sdk                               # library
npm install -D @zapier/zapier-sdk-cli @types/node typescript  # CLI
npx zapier-sdk login                                         # opens a browser
```
Ask before installing or starting the browser login. Server/CI: `createZapierSdk({ credentials: { clientId, clientSecret } })` from env vars.

## 3. Connections

- Every action needs a connection (an OAuth grant for one app + user). `findFirstConnection({ app, owner: "me", expired: false })` throws if none.
- **OAuth needs a human.** Agent flow: `get-connection-start-url <app>` → give the user the URL → `wait-for-new-connection <app> <started-at>`.
- Several connections per app is normal (work + personal Gmail). For reads, the first match is fine. For writes and sends, show the candidates (title/owner) and let the user pick (see automation-design.md, "Never auto-pick a connection").

## 4. Running actions

```typescript
import { createZapierSdk } from "@zapier/zapier-sdk";
const zapier = createZapierSdk();
const { data: connection } = await zapier.findFirstConnection({ app: "notion", owner: "me", expired: false });
const { data } = await zapier.runAction({
  appKey: "NotionCLIAPI",           // SDK runAction needs the CLIAPI-suffixed key
  actionType: "search",            // read | write | search
  actionKey: "page_by_title",
  connection: connection.id,
  inputs: { title: "Meeting Notes", exact_match: "no" },
});
const [page] = data;               // always an array
```
- The CLI's `run-action` accepts the short slug (`notion`); only the SDK's `runAction` needs `NotionCLIAPI`.
- No first-class action → `zapier.fetch(url, { connection, method })` for an authenticated raw call.
- Vendor 429s arrive as `ZAPIER_ACTION_ERROR` ending in `..., N)`: sleep N seconds, retry, throttle bursts.
- Paginate `list-*` calls with the SDK's iterators (`.items()`), not by assuming one page.
- Test a write action only after the user agrees; it runs for real.

## 5. Durable workflows (workflows-create)

**Gate**: run the `workflows-doctor` compatibility check if available, then verify `zapier-sdk --version`, `get-profile`, and `--experimental --help` for `create-workflow`, `publish-workflow-version`, `run-durable`, `list-triggers`, `trigger-workflow`.

### Phase 1: intent
Extract steps, apps, data between steps, inputs, conditions, waits/approvals, and the **start mode**:
- `trigger`: schedule ("every morning") or event ("when a new row is added in Sheets"). Published with `--trigger`.
- `manual`: runs on demand via `trigger-workflow`.
- Ambiguous → ask. Never assume manual because no trigger was named.

Summarise the shape and get agreement before discovery or code.

### Phase 2: discover
`list-apps`, `list-connections <app> --owner me`, `list-actions`, `list-action-input-fields ... --connection`, `list-action-input-field-choices`; triggers via `--experimental list-triggers <app>` and `list-trigger-input-fields`. Several plausible candidates → ask. Give each chosen connection a snake_case alias (`slack_work`); the alias goes in code, the ID in `--connections` JSON.

**AI steps**: use "AI by Zapier" (`AICLIAPI`, action `get_completion`) with `instructions`, `model_id: "advanced/auto"`, `authentication_id: "0"` (built-in credentials). If the user names a provider/model, set `provider_id` and resolve `model_id` via `list-action-input-field-choices` rather than hard-coding.

### Phase 3: build plan → code
Present workflow name, input, connections, steps, start mode; then write `workflow.ts`:
- Zod `InputSchema` parsed on the handler's first line.
- **One `ctx.step("<name>-${primaryId}", ...)` per side effect**, keyed by the payload's primary ID (charge ID, response ID, `triggered_at` for schedules, item ID in loops, never an array index). This makes retries replay safely; names must be unique within a run and stable across retries.
- Copy action/app/trigger keys exactly as discovery printed them (`channel_message`, not `send_channel_message`).

### Dependencies
- `@zapier/zapier-durable` and `@zapier/zapier-sdk`: pass `latest` (resolved server-side to a release older than 24 h). Ranges are rejected for the durable runtime.
- Every other import: **exact version** (`"zod": "4.3.6"`), and every import must appear in `--dependencies` (the sandbox ignores your local `package.json`).

### Publish and verify
- Trigger claims need a **version-pinned** `selected_api` (`GoogleSheetsAPI@2.3.0` from discovery), `params` matching each field's `value_type` (arrays as arrays), and `--enabled`. Any miss fails silently: if `get-workflow` shows `enabled: false`, the claim failed; diagnose, don't report success.
- Catch-hook triggers: the public endpoint is `https://hooks.zapier.com/hooks/catch/<code>/`; never surface the internal editor-testing URL.
- Test with `run-durable` (declare all imports) before publishing; confirm side effects with the user first.

## 6. Checklist

- [ ] Logged in (`get-profile`); all keys discovered, none invented
- [ ] Connections exist (human did OAuth); write targets confirmed by the user
- [ ] `runAction` uses CLIAPI keys; results handled as arrays; 429s retried
- [ ] Durable: start mode chosen, every side effect in a keyed `ctx.step`, exact dependency versions
- [ ] Trigger claim verified `enabled: true`; endpoint URL handed over
