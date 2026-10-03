> Distilled from: jira-expert (alirezarezvani/claude-skills, MIT), atlassian-mcp (Jeffallan/claude-skills, MIT), to-tickets (mattpocock/skills, MIT)

# Jira and Confluence (Atlassian)

Vendor-specific. Tool names and endpoints change; prefer the live tool list / schema of whatever Atlassian server is connected over examples here.

## 1. Connection options

| Option | Covers | Auth |
|---|---|---|
| Atlassian's official Remote MCP server | Jira Cloud + Confluence Cloud | OAuth in the browser; check Atlassian's docs for the current endpoint |
| Community `mcp-atlassian` (sooperset, Python) | Cloud and Server/Data Center | API token (Cloud) or PAT (Server/DC) via env vars |
| REST API directly | Everything, incl. admin actions MCP lacks | API token / OAuth |

Credentials: the user sets `JIRA_API_TOKEN` / `CONFLUENCE_API_TOKEN` (or does the OAuth login) themselves. Never ask for a token in chat, never hardcode, print or log it.

With the official server, call the "accessible resources" tool once to get the `cloudId`, then pass it to every call.

## 2. Safety rules for any write

1. Read before write: probe with a read-only query (`maxResults=1`) to confirm permissions and that the JQL matches what you think.
2. Check required fields for the issue type before creating (issue-type metadata call).
3. Status changes go through **transitions** (get transitions → transition by id), not field edits.
4. Bulk changes: run the JQL, show the user the matching issues and the exact change, get approval, apply in small batches, read back.
5. Respect rate limits: page 50–100 results; back off exponentially on 429.
6. Do not expose sensitive issue data in logs or summaries beyond what the user asked for.

Usually **not** available through MCP (use the UI or REST): creating projects (`POST /rest/api/3/project`), sprints and boards (`POST /rest/agile/1.0/sprint`), saved filters (`POST /rest/api/3/filter`), custom fields, screens, workflow and permission schemes.

## 3. JQL

Structure: `field operator value [AND|OR ...] ORDER BY field`. Operators: `= != ~ !~ > < >= <= IN NOT IN IS EMPTY IS NOT EMPTY WAS CHANGED`.

Start with the bundled builder, then run the result:
```bash
python3 scripts/jira-expert/jql_query_builder.py "high priority bugs assigned to me" --format json
python3 scripts/jira-expert/jql_query_builder.py --patterns      # list supported patterns
```
Take the `jql` field and run it with the search tool. If no pattern matches, write JQL by hand from the table below.

| Need | JQL |
|---|---|
| My open work | `assignee = currentUser() AND statusCategory != Done ORDER BY priority DESC` |
| Overdue | `duedate < now() AND statusCategory != Done` |
| Stale | `updated < -30d AND statusCategory != Done ORDER BY updated ASC` |
| Current sprint | `project = KEY AND sprint in openSprints() ORDER BY rank` |
| Unscheduled stories | `project = KEY AND issuetype = Story AND sprint IS EMPTY AND statusCategory != Done` |
| Done in a sprint | `sprint = 23 AND status CHANGED TO Done DURING (startOfSprint(), endOfSprint())` (some sites need explicit dates) |
| Velocity basis | `project = KEY AND sprint in closedSprints() AND resolution = Done` |
| Bug inflow 30 d | `project = KEY AND issuetype = Bug AND created >= -30d` |
| Open blockers | `priority = Blocker AND statusCategory != Done` |
| Team load | `assignee in membersOf("eng-team") AND status in ("In Progress","In Review") ORDER BY assignee` |
| Epic children | `parent = KEY-123` (team-managed and newer company-managed) or `"Epic Link" = KEY-123` (older) |

Functions: `startOfDay() endOfWeek() startOfMonth() ...`, `openSprints() closedSprints() futureSprints()`, `currentUser() membersOf("group")`. Avoid leading-wildcard text searches on big projects; save repeated queries as filters.

## 4. Creating backlog items from a plan

1. Get the approved ticket list (see `references/stories-and-tickets.md`).
2. Create in dependency order so blockers exist first.
3. Link with the native "blocks / is blocked by" link type; put stories under the epic via parent.
4. Fill summary, description (what to build + acceptance criteria), issue type, priority, labels; leave estimates to the team unless given.
5. Return the created keys and links in a table.

## 5. Workflow design

States: keep to ≤ 10; every non-terminal state needs a way forward; every state must be reachable; at least one terminal state (Done/Closed/Resolved).

Lint a design before building it in Jira admin:
```bash
python3 scripts/jira-expert/workflow_validator.py workflow.json            # --format json for machine output
```
Input shape:
```json
{"states": ["To Do", "In Progress", "In Review", "Done"],
 "transitions": [{"name": "Start", "from": "To Do", "to": "In Progress"},
                 {"name": "Submit", "from": "In Progress", "to": "In Review"},
                 {"name": "Approve", "from": "In Review", "to": "Done"},
                 {"name": "Rework", "from": "In Review", "to": "In Progress"}]}
```
Fix every dead-end, orphan and undefined-state finding, then deploy to a test project first and walk a sample issue through all transitions.

## 6. Dashboards and automation

- Gadgets: filter results, sprint burndown, velocity, created vs resolved, status pie. Fewer gadgets load faster.
- Automation rule = trigger (created, field changed, scheduled) + conditions + actions (edit field, transition, comment, notify, create sub-task). Test on sample issues, then enable and watch the audit log.

## 7. Confluence (CQL)

| Need | CQL |
|---|---|
| Pages in a space edited recently | `space = "ENG" AND type = page AND lastmodified >= now("-30d") ORDER BY lastmodified DESC` |
| Text search | `space = "ENG" AND type = page AND text ~ "deployment runbook"` |
| By label | `label = "adr" AND type = page` |
| Mine | `creator = currentUser() AND type = page` |

Use it to find prior specs, ADRs and meeting notes before writing new ones; publish PRDs, decision records and minutes as pages when the user asks, under the space/parent they name.
