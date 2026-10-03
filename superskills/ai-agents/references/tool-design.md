# Tool design for agents

> Distilled from: tool-design (muratcankoylan/Agent-Skills-for-Context-Engineering, MIT), build-mcp-server (anthropics/claude-plugins-official, Apache-2.0), mcp-builder (anthropics/skills, Apache-2.0), claude-api agent-design (anthropics/skills, Apache-2.0)

Tool names, descriptions and schemas are prompt text: they sit in the model's context every turn and decide which tool gets called with which arguments. Most "the agent is dumb" bugs are vague tools.

## 1. The selection test

If a human engineer can't say which tool fits a situation, the model can't either. Every tool needs **one unambiguous purpose** and no overlap with its siblings.

## 2. Names

- `verb_noun`, snake_case: `search_issues`, `get_customer`, `create_invoice`.
- Prefix with the service when tools may share a context with other servers: `github_create_issue`, not `create_issue`.
- Same parameter name for the same thing everywhere (`customer_id` in every tool, never `id` / `cid` / `identifier`).
- ≤64 characters (Anthropic Directory hard limit for MCP tools).
- When telling an agent to use an MCP tool in a prompt, use the qualified name (`GitHub:create_issue`) to avoid collisions.

## 3. Descriptions: answer four questions

1. **What** it does, exactly ("Search issues by keyword across title and body").
2. **When** to use it, and when to use a sibling instead ("Does NOT search comments: use search_comments").
3. **Inputs**: types, formats, defaults, an example value (`"CUST-000123"`).
4. **Returns**: shape, size limits, error cases.

Good:
```
search_issues: Search issues by keyword across title and body. Returns up to
`limit` results, newest first. Does NOT search comments or PRs; use
search_comments / search_prs for those.
```
Bad: `search: Search the database.`

Never put behaviour instructions for the model in a description ("always call X first", "you must…"): reviewers treat that as prompt injection. Put cross-tool guidance in server `instructions` or the system prompt.

## 4. Schemas: make bad calls impossible

| Instead of | Use |
|---|---|
| free string for an ID | regex: `^usr_[a-z0-9]{12}$` |
| bare number for a limit | int, min 1, max 100, default 20 |
| free string for a choice | enum `["open","closed","all"]` |
| optional with no hint | optional + description of the default |

- Describe every parameter (`.describe()` in Zod, `Field(description=...)` in Pydantic, docstrings in FastMCP).
- Sensible defaults so the common call needs 1–2 arguments.
- More than 8–10 parameters or two unrelated modes → split the tool. Rarely used options go in an `options` object.

## 5. Return shapes

- Structured data as JSON (or offer `response_format: "json" | "markdown"`, default markdown for reading).
- A `concise` vs `detailed` switch when objects are large.
- Always return the IDs the next call needs. After a create, return the new ID ("Created issue #123"), never just "ok".
- Paginate lists: respect `limit` (default 20–50), return `has_more`, `next_offset`/`next_cursor`, `total_count`.
- Truncate huge payloads and say so: "Showing 10 of 847. Narrow with `status` or `since`."
- No raw HTML, no megabyte dumps. Offer file/resource references for big blobs.
- MCP: add `outputSchema` + `structuredContent`, and keep a text copy for older hosts.

## 6. Errors the agent can recover from

Every error says what was wrong, what valid input looks like, and what to try next:
```
Item 'usr_12' not found. IDs look like usr_ + 12 lowercase chars. Use search_users to find valid IDs.
```
- Return tool errors as results (`isError: true`), not exceptions that kill the transport.
- Mark retryable errors as such (rate limit: "retry after 30 s").
- Don't leak stack traces or secrets.

## 7. How many tools

| Count | Guidance |
|---|---|
| 1–15 | One tool per action. Sweet spot |
| 15–30 | Audit for near-duplicates and merge |
| 30+ | Search + execute pattern (`search_actions` → `execute_action`), promote the top 3–5 to real tools; or use the host's tool-search feature |

Thirty rich schemas can eat 3–5k tokens before the conversation starts.

**Consolidate** narrow tools that are always chained (`list_users` + `list_events` + `create_event` → `schedule_event`). **Don't** consolidate tools with different risk levels: reads and writes stay separate (Directory rule: a tool that both reads and writes is rejected).

## 8. Bash vs dedicated tools

A shell tool gives the agent huge reach with one tool; well-documented files + `grep/cat/find` often beat a pile of custom "lookup" tools (architectural reduction). Promote an action to its own tool when the harness needs to:
- **gate it** (send, delete, pay, post: easy to put behind confirmation as a tool, impossible as `curl -X POST` inside bash),
- **check staleness** (an edit tool can refuse if the file changed since last read),
- **render** it (questions as a modal, previews),
- **parallelise** it (read-only tools can run concurrently; opaque bash must be serialised).

Reduction works when the data is clean and documented and the model is strong. Keep structured tools when the data is messy, the domain needs knowledge the model lacks, or safety demands narrow actions.

## 9. Annotations and safety

MCP annotations: `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`, plus `title`. Mark every read tool `readOnlyHint: true` (hosts may auto-approve) and every delete/overwrite `destructiveHint: true` (hosts show a confirm). They are hints, not security: enforce permissions server-side.

## 10. Audit checklist (run per tool)

1. Name: verb_noun, namespaced, ≤64 chars.
2. Description answers what / when (and when not) / inputs / returns.
3. Every parameter typed, constrained, described, defaulted.
4. Success and error payloads documented, machine-readable, include next-step IDs.
5. Errors name the bad value, the expected format and a recovery step.
6. No other tool shares its trigger scenario.
7. Read and write are separate tools; annotations set.
8. Large outputs: pagination, concise mode or file reference.

## 11. Improve tools from failures

Run the agent on 10–20 realistic tasks, collect wrong-tool picks, bad arguments and dead-end errors, then rewrite descriptions and re-run the same tasks. The MCP evaluation harness (evaluation.md) asks the model for tool feedback in `<feedback>` tags: read it. Version descriptions like code; review them whenever the underlying API changes.
