# Workflows on the platform the team already runs: Power Automate, Apps Script, GitHub Actions, UiPath

> Written in our own words from the official docs of each tool (links in CREDITS.md). Facts checked against those docs in October 2026; limits and plans change, so re-check the linked page before quoting a number to the user.

When a team lives in Microsoft 365, Google Workspace, GitHub or an RPA estate, build there: the connections, licences and admins already exist. Which platform to pick is the "Pick a platform" table in automation-design.md section 1; planning, reliability and handoff rules are in the same guide. Everything below is the mechanics.

## 1. Power Automate (Microsoft 365)

For flows across Outlook, Teams, SharePoint, Excel and Dataverse in a Microsoft 365 tenant. Pick it over Zapier or Make when the data already sits in Microsoft 365 and IT governs connectors there.

**Routes**
- **Official Power Automate plugin for Claude Code** (Microsoft): creates, edits, runs and debugs cloud flows with the user's own signed-in identity, and creates new flows in a stopped state for review. Needs Node.js 18+, the Azure CLI, and a Power Automate licence that covers the connectors used. Install it from the marketplace (the docs also offer a one-line installer piped into `node`; skip that and use these):
  ```text
  /plugin marketplace add microsoft/power-platform-skills
  /plugin install power-automate@power-platform-skills
  ```
  Restart the session, then `/setup`. Skills: `/browse-flows`, `/create-flow`, `/build-flow`, `/debug-flow`, `/diagnose-flow`, `/manage-flows`, `/manage-desktop-flows` (list and run desktop flows only; it can't edit Power Automate Desktop scripts), `/route-environments`, `/report-issue` (files a **public** GitHub issue: strip tenant IDs, URLs and data first, and ask before filing).
- **No plugin**: the designer at make.powerautomate.com. Give the user a numbered build spec (trigger, each action, its fields and expressions) and have them build it or paste it into the designer's Copilot.

**Auth.** The user signs in themselves: `az login --allow-no-subscriptions` with the same work account they use for Power Automate. Check it worked without printing the token:
```bash
az account get-access-token --resource https://service.flow.microsoft.com --query expiresOn --output tsv
```
Connections (SharePoint, Outlook, Teams) are picked or signed in by the user; some need browser consent. Never ask for client secrets, tenant secrets or passwords in chat.

**Build pattern: scheduled digest from a SharePoint list**

| Step | What to set |
|---|---|
| **Recurrence** trigger | `Interval` 1, `Frequency` Week, **`Time zone` set explicitly**, `Start time` as `YYYY-MM-DDTHH:MM:SSZ`, `On these days`, `At these hours`, `At these minutes`. A schedule beats an item-created trigger for a weekly digest |
| SharePoint **Get items** | `Site Address`, `List Name`, `Filter Query` (OData, filtered on the server), `Order By`, `Top Count`, `Limit Columns by View` |
| Group per owner | Filter/Select actions on the returned array, then one message per owner |
| Mail | Office 365 Outlook connector, connection the user picked |
| Teams **Post message in a chat or channel** | `Post as`, `Post in`, team and channel; the user picks the connection |

`Get items` details that bite:
- It returns **100 items by default**. Raise `Top Count` (up to the 5,000 list view threshold), and on lists over 5,000 items turn **Pagination** on in the action's settings, or a filter whose matches sit past the first 5,000 returns nothing.
- Filter operators: `eq`, `ne`, `lt`, `le`, `gt`, `ge`, `startswith`, `substringof`, joined with `and`. Example: `Status ne 'Done' and DueDate lt '<expr>'` where `<expr>` is the expression `formatDateTime(utcNow(),'yyyy-MM-dd')` inserted from the expression editor.
- Column names use internal names: spaces become `_x0020_` (`Due_x0020_Date`).
- Paginated items cap at 5,000 on the Low performance profile and 100,000 on the others.

**Error path.** Put the main actions in a **Try** scope and add a **Catch** scope whose **Run after** is set to *has failed* and *has timed out*. In Catch, filter `result('Try')` for failed actions, build the run link from `workflow()` (environment name, flow name, run ID), and notify the owner. Set an exponential **Retry policy** on flaky actions; end with **Terminate** (status Failed) so the run shows red. Owners also get email alerts for broken connections and throttling.

**Test without spamming people**
1. Build it stopped (the plugin does this) or in a test environment ("copy this flow to the test environment").
2. Run **Flow Checker**, then point every mail and Teams action at the user only (their address, a private test chat or channel).
3. **Test → Manually** runs it now; **Automatically** reuses a recent trigger (save first; one manual test is needed before automatic is offered).
4. Mock slow or risky steps with **static results**: the action's **Testing** tab → **Static result** on (a beaker icon marks it). Remove them before go-live.
5. Show the user the run output and the real recipient list, swap the recipients in, and turn the flow on only after a yes. Watch the first scheduled run.
6. **Resubmit** reruns a past run and can send the same emails again; check before resubmitting.

**Limits** (from the limits page; requests count every action, including retries and pagination pages)

| Item | Limit |
|---|---|
| Power Platform requests per 24 h | 10,000 Low (Free, Microsoft 365 plans, Power Automate Plan 1, trials); 200,000 Medium (Premium, Plan 2); 500,000 High (Process, per flow) |
| Run duration / run history kept | 30 days / 30 days |
| Apply to each | 5,000 items Low, 100,000 others; concurrency 1 by default, up to 50 |
| Outbound synchronous request | 120 seconds |
| Turned off automatically | after 14 days of continuous failures or throttling; after 90 days with no trigger (owners with premium or Process licences are exempt, notice 30 days ahead) |
| SharePoint connector | 600 calls per connection per 60 s; Standard (not premium) |
| Teams connector | 100 calls per connection per 60 s; message about 28 KB max; the Workflows app must be allowed in the Teams admin center |

A designer test that runs over 10 minutes can show a timeout while the flow keeps running; reopen the run to see its status.

## 2. Google Apps Script (Google Workspace)

For Gmail, Sheets, Docs, Forms, Drive and Calendar automations that stay inside Google. Free with a Google account; pick it over Zapier or Make when everything lives in Workspace and the quotas below fit. One-off actions from the terminal use `gws` instead (app-integrations.md).

**Access.** The editor at script.google.com, or `clasp` to keep the code in a local folder or repo:
```bash
npm install @google/clasp -g     # Node.js 20+
clasp login                      # the user's browser OAuth
clasp clone <scriptId>           # or: clasp create "Weekly overdue digest"
clasp pull / clasp push          # push overwrites the project in Drive
clasp version "v3" && clasp deploy
clasp open-script
```
To run `clasp` from CI, the user also turns on the Apps Script API at `script.google.com/home/usersettings`. `.clasprc.json` holds a refresh token: never print it, and keep it and `.clasp.json` out of git. Avoid `clasp push --force` (overwrites without asking) unless the user wants it.

**Auth and scopes.** A script run from the editor or a menu runs as the user at the keyboard; installable triggers always run as the account that created them. Scopes live in `appsscript.json` (`oauthScopes`); its `timeZone` field (a zone ID such as `Europe/Berlin`) is the time zone triggers fire in.

**Example: Friday digest from a sheet, drafts first**
```js
const SHEET_ID = 'paste-the-sheet-id';
const DRY_RUN = true;                       // drafts only until the user says yes

function weeklyOverdue() {
  const rows = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Tasks')
    .getDataRange().getValues();            // 2-D array, row then column
  const [header, ...data] = rows;
  const col = n => header.indexOf(n);
  const today = new Date();
  const byOwner = {};
  for (const r of data) {
    if (r[col('Status')] !== 'Done' && r[col('Due')] < today) {
      const owner = r[col('Owner')];
      if (!byOwner[owner]) byOwner[owner] = [];
      byOwner[owner].push(r[col('Task')]);
    }
  }
  for (const [owner, tasks] of Object.entries(byOwner)) {
    const body = 'Overdue:\n- ' + tasks.join('\n- ');
    if (DRY_RUN) GmailApp.createDraft(owner, 'Overdue tasks', body);
    else if (MailApp.getRemainingDailyQuota() > 0) MailApp.sendEmail(owner, 'Overdue tasks', body);
  }
}

function installTrigger() {                 // run once; skip if it already exists
  if (ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'weeklyOverdue')) return;
  ScriptApp.newTrigger('weeklyOverdue').timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(9).create();
}
```
Show the drafts to the user, then flip `DRY_RUN` after a yes. Triggers can also be added by hand: **Triggers** → **Add Trigger** in the editor.

**Limits** (quotas page; per user, reset 24 hours after the first request; exceeding one throws and stops the run)

| Quota | Consumer (gmail.com) | Google Workspace |
|---|---|---|
| Email recipients per day | 100 | 1,500 |
| Trigger total runtime per day | 90 min | 6 h |
| URL Fetch calls per day | 20,000 | 100,000 |
| Script runtime per execution | 6 min | 6 min |
| Triggers per user per script | 20 | 20 |
| Simultaneous executions per user | 30 | 30 |

Gotchas: a "9 AM" trigger fires at a time Apps Script picks between 9 and 10 and keeps it day to day. Failed trigger runs email the owner; logs are under **Executions**. Batch long jobs under 6 minutes per run (process a slice, store a cursor, let the next run continue).

## 3. GitHub Actions (scheduled scripts and repo chores)

For a script that should run on a schedule or on demand next to its code: price checks, report builds, repo housekeeping, a nightly agent run. Free for public repos on standard runners. Build, test and deploy pipelines belong to `cloud-devops` → `references/ci-cd.md`.

```yaml
# .github/workflows/weekly-price-check.yml
name: Weekly price check
on:
  schedule:
    - cron: '17 9 * * 5'            # Fri 09:17, off the top of the hour
      timezone: "Europe/Berlin"
  workflow_dispatch:
    inputs:
      dry_run:
        type: boolean
        default: true
permissions:
  contents: read                    # every permission not listed becomes none
concurrency:
  group: weekly-price-check
  cancel-in-progress: false
jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@<full-length-commit-sha>   # pin; look up the SHA on the action's own repo
      - run: node scripts/price-check.mjs
        env:
          PRICE_API_KEY: ${{ secrets.PRICE_API_KEY }}
          DRY_RUN: ${{ inputs.dry_run }}
```

**Drive it with `gh`**
```bash
gh secret set PRICE_API_KEY            # prompts for the value; or: gh secret set PRICE_API_KEY < key.txt
gh workflow run weekly-price-check.yml -f dry_run=true
gh run watch --exit-status
gh run view <run-id> --log-failed
```
The user sets secrets themselves; never put a value on the command line, in the YAML or in chat. `gh workflow run` needs a `workflow_dispatch` trigger, and both it and `schedule` only fire for a workflow file on the default branch.

**Schedule rules**
- Five-field cron; add `timezone` with an IANA name. In a DST spring-forward gap, a run in the skipped hour moves to the next valid time.
- Shortest interval is every 5 minutes. Runs can be late under load (the start of each hour is busiest) and some queued runs can be dropped: pick an odd minute and make the job safe to skip or run late.
- Schedules run the latest commit on the default branch. In a public repo they are disabled after 60 days without repository activity; a commit that changes the cron re-enables them.

**Hardening**
- Least-privilege `permissions`, raised per job only where needed.
- Pin third-party actions to a full-length commit SHA from the action's official repo.
- Never interpolate untrusted text (`${{ github.event.issue.title }}` and the like) into `run:`; pass it through `env:` and use the variable.
- Don't check out untrusted code in `pull_request_target` workflows. Secrets (except `GITHUB_TOKEN`) are not passed to runs triggered from forks.
- One secret per value (no JSON blobs; redaction works worse); 48 KB max each.

**Limits and cost**

| Item | Limit |
|---|---|
| Job time | 6 h on GitHub-hosted runners, 5 days self-hosted |
| Workflow run (including waits) | 35 days |
| Concurrent jobs, Free plan | 20 |
| `GITHUB_TOKEN` API calls | 1,000 per hour per repo |
| Included minutes, private repos | Free 2,000 / Pro 3,000 / Team 3,000 / Enterprise Cloud 50,000 per month |
| Price per minute beyond that | Linux $0.006, Windows $0.010, macOS $0.062 |

Without a payment method on file, runs are blocked once the quota is used. A scheduled job that calls paid APIs still needs its own per-run cap (automation-design.md rule 12).

## 4. UiPath (RPA for desktop and legacy apps)

For organisations that already run UiPath robots and Orchestrator, and for desktop or legacy systems with no API. In a Microsoft-only shop, Power Automate desktop flows are the alternative (the plugin above can list and run them).

**Install and sign in** with the official `uip` CLI (Node.js 22+). Use npm; the vendor also offers one-line installers piped into a shell, which this guide doesn't use:
```bash
npm install -g @uipath/cli
uip --version
uip login                              # browser OAuth, then pick a tenant (--tenant to skip the picker)
uip login status --output table
uip skills install --agent claude      # UiPath's own skills; global only for Claude Code. Read them before use
```
- **Service identity** (CI, unattended): an External Application in UiPath admin (Confidential, client credentials, only the scopes needed), then
  ```bash
  uip login --client-id env.UIPATH_CLIENT_ID --client-secret env.UIPATH_CLIENT_SECRET \
    --tenant "$UIPATH_TENANT" --scope "OR.Folders OR.Jobs"
  ```
  `env.NAME` makes `uip` read the value from that environment variable, keeping it out of shell history. Setting the variables alone does not log in; the flags are required.
- Sessions are stored in a `.uipath/` folder (searched from the working directory upward, then `~/.uipath/`); keep a project-local one out of git. `uip logout` clears it.
- The agent acts with whatever session is active: prefer a dedicated token with minimal scopes, run attended, and review before anything touches production.

**Operate Orchestrator**
```bash
uip or folders list                              # first 50 folders
uip or folders list --all --name Shared          # filters need --all
uip or processes list --folder-path Shared
uip or jobs start <process-key> --input-arguments '{"invoiceNumber":"INV-001"}' \
  --wait-for-completion --timeout 600            # polls every 5 s, up to 600 s
```
Output is JSON by default (`--output table|json|yaml|plain`). Starting a job makes a robot act in real systems: show the process, folder and input arguments and wait for a yes. Packaging and release go `uip solution pack` → `uip solution publish` → `uip solution deploy run`, each step confirmed. When stuck, run `uip <command> --help` rather than guessing. After CLI updates: `uip skills update --agent claude` and `uip tools update`.

`uip mcp` exposes one tool, `run_command`, that runs any `uip` command: that is the whole CLI's power behind one call, so prefer the skills and keep confirmations on.

**Limits.** Listing jobs with filters (`GET /odata/Jobs`) allows 100 requests per minute per tenant from scripts and tools outside processes (1,000 from automations); over that returns 429 with `Retry-After`. Fetching one job by ID and starting jobs are not rate limited, so poll a job by its ID.

## 5. Checklist

- [ ] Platform picked from the user's existing stack (asked when unclear), not from habit
- [ ] Sign-in done by the user (`az login`, `clasp login`, `uip login`, `gh secret set`); no secrets in flows, code, YAML or chat
- [ ] Schedule has an explicit time zone and tolerates late or skipped runs
- [ ] Tested on the user only: stopped flow, drafts, `dry_run`, static results or a test folder
- [ ] Error path notifies a human with the run link
- [ ] Licence or quota limits named in the handoff, with what happens when they are hit
- [ ] Turned on, deployed or started only after a yes; first real run checked
