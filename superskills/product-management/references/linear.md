> Distilled from: linear (openai/skills, Apache-2.0), linear-cli (schpet/linear-cli, ISC), to-tickets (mattpocock/skills, MIT)

# Linear (MCP and CLI)

Vendor-specific. Two routes; use whichever the user has.

## 1. Linear MCP server

Remote server at `https://mcp.linear.app/mcp`, OAuth login. If a call fails because it is not connected, tell the user how to add it in their client (for Claude Code: `claude mcp add --transport http linear https://mcp.linear.app/mcp`, then authenticate) and stop; they usually need to restart the session.

Tool families (names vary slightly by version; check the live list):
- Issues: list, get, create, update, list my issues, statuses, labels, create label
- Projects and teams: list/get/create/update project, list/get team, list users
- Docs and comments: list/get documents, search documentation, list/create comments, list cycles

**Order of work:**
1. Clarify goal and scope: team, project, priority, labels, cycle, due dates.
2. Resolve identifiers first (team key, project id, issue id, state names); never guess them.
3. Read (list/get/search) to build context.
4. Create/update with all required fields. For bulk changes, explain the grouping and get approval before applying; batch to stay under rate limits.
5. Summarise what changed (IDs + links), remaining gaps, and proposed next steps.

## 2. `linear` CLI (schpet/linear-cli)

Check `linear --version`; or run without installing via `npx @schpet/linear-cli ...`. Prefer dedicated commands; use `linear api` (GraphQL) only when no command covers the operation.

```bash
# Query (any assignee, team-wide); `issue list` / `issue mine` only shows YOUR issues
linear issue query --team ENG --state started --json
linear issue query --project "Mobile App" --state backlog --state triage --unassigned
linear issue mine --state started --sort priority

# Create — write markdown to a file, never inline multi-line text
linear issue create --team ENG --title "Fix login redirect" --description-file ./desc.md --no-interactive
linear issue create --team ENG --template "Bug report" --title "Login fails on Safari"

# Update
linear issue update ENG-123 --state "In Review" --assignee sam
linear issue update ENG-123 --add-label security            # keep other labels
linear issue update ENG-123 --label infra --label security  # REPLACES the label set

# Comment / attach an image inline
linear issue comment add ENG-123 --body-file ./comment.md
linear issue comment add ENG-123 --attach ./screenshot.png  # renders inline; `issue attach` only adds a sidebar link

# View
linear issue view ENG-123 --json
linear issue url ENG-123
```

Close with `--state Done` or `Canceled`; Linear auto-archives closed issues later. `issue delete` moves to trash (restorable 30 days). Do not use `issue archive` unless the user explicitly asks: it bypasses Linear's checks and hides the issue from queries.

Markdown bodies: always `--description-file` / `--body-file` (heredoc to a temp file) so newlines render; inline flags only for one-liners.

## 3. Common workflows

| Workflow | Steps |
|---|---|
| Plan → tickets | Approved slice list (see `references/stories-and-tickets.md`) → create in dependency order → set "blocked by" relations → return IDs |
| Bug triage | List urgent/high bugs → rank by user impact → propose assignee/state changes → apply after approval |
| Cycle (sprint) planning | List open issues for the team by priority → fit to capacity → assign to the cycle |
| Workload balance | Group active issues by assignee → flag overload → suggest moves |
| Release planning | Project with milestones (freeze, beta, docs, launch) → issues under each with estimates |
| Stale issues | Find issues with no update in N days → comment with status request or propose closing |
| Cycle retro | Completed vs carried-over issues in the last cycle → patterns → discussion issues |

## 4. Rules

- Never print or store API keys; the user authenticates the CLI/MCP themselves.
- Confirm before bulk edits, label replacement, deletes or project changes.
- Use the team's templates when they exist (`linear template list --type issue --team ENG`).
