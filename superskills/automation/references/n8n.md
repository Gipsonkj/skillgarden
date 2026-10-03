# n8n workflows

> Distilled from: n8n-workflow-patterns, n8n-mcp-tools-expert, n8n-code-javascript, n8n-expression-syntax (czlonkowski/n8n-skills, MIT), n8n-workflow-lifecycle-official (n8n-io/skills, Apache-2.0)

Vendor-specific guide for building n8n workflows through an MCP server or JSON. General planning and reliability rules are in automation-design.md.

## 1. Which MCP are you talking to?

| Server | Tell-tale tools | Notes |
|---|---|---|
| **n8n official MCP** (built into the instance) | `create_workflow_from_code`, `update_workflow`, `validate_workflow`, `get_workflow_details`, `test_workflow`, `prepare_workflow_pin_data`, `publish_workflow`, `search_workflows` | Writes workflows as SDK code; layout auto-applied; folders, tags, node groups |
| **n8n-mcp** (community, czlonkowski) | `search_nodes`, `get_node`, `validate_node`, `validate_workflow`, `n8n_create_workflow`, `n8n_update_partial_workflow`, `n8n_test_workflow`, `n8n_executions`, `n8n_manage_credentials` | JSON nodes + connections; node docs and templates; partial updates |

Check which tools exist before following a recipe. The lifecycle below is the same for both.

## 2. Lifecycle (six stages, none skipped)

1. **Plan**: confirm what the user means, search for an existing workflow or sub-workflow that already does it, agree the folder/project.
2. **Build** iteratively: add a few nodes, validate, continue. Not one giant JSON.
3. **Validate**: `validate_workflow` (and `validate_node` with `profile: "runtime"` while iterating), then read the saved workflow (`get_workflow_details` / `n8n_get_workflow`) and check the **connections object** matches intent.
4. **User wire-up**: the user opens every credentialed node and confirms the right credential (n8n auto-assigns the most recently edited credential of that type, which is often wrong when prod and staging both exist), and creates missing credentials.
5. **Test** with pinned/mock data. Official MCP: `test_workflow` auto-pins triggers, credentialed nodes and HTTP Request nodes; Code, Set, If, Wait, Execute Command, file ops, Data Tables and sub-workflows run for real. Ask before testing if any of those cause visible side effects.
6. **Publish/activate** only after 3–5 pass (`publish_workflow`, or `n8n_update_partial_workflow` with `{type: "activateWorkflow"}`), then hand off.

What validation does **not** catch: dropped wires, a fan-out collapsed into one connection, Merge input index off by one, error outputs wired without `onError: "continueErrorOutput"`, a valid but wrong sheet ID or column name.

## 3. Node JSON hygiene (n8n-mcp)

- `nodeType` formats differ: search/validate tools take `nodes-base.slack`; workflow tools take `n8n-nodes-base.slack`. `search_nodes` returns both.
- Use the current `typeVersion` from `get_node`, not a remembered one.
- Never emit a `credentials` block with a placeholder ID: it locks the UI selector. Use a real ID from `n8n_manage_credentials({action: "list"})` or omit the block.
- Node IDs are UUIDs; names are unique and descriptive.
- Pass `intent` on `n8n_update_partial_workflow` calls.
- Workflows built in the n8n UI may have MCP access off; if you can't find one, ask the user to enable it before assuming it doesn't exist.

## 4. The six patterns

| Pattern | Shape | Use for |
|---|---|---|
| Webhook processing | Webhook → Validate → Transform → Respond/Notify | Form posts, Stripe/GitHub/Slack events |
| HTTP API integration | Trigger → HTTP Request → Transform → Action → Error handler | Syncing SaaS data |
| Database operations | Schedule → Query → Transform → Write → Verify | ETL, syncs between DBs |
| AI agent | Trigger → AI Agent (model + tools + memory) → Output | Chat with tools, triage |
| Scheduled task | Schedule → Fetch → Process → Deliver → Log | Reports, cleanups |
| Batch processing | Prepare → Split In Batches → per batch → accumulate → aggregate | Large sets under rate limits |

Webhooks: respond quickly (Respond to Webhook node) and do slow work after; validate a shared secret or signature; return proper status codes.

## 5. Data access: the mistakes that cause most failures

- **Webhook payload lives under `body`**: `{{$json.body.email}}`, not `{{$json.email}}`. Query params under `query`, headers under `headers`.
- Expressions need double braces: `{{$json.field}}`; field values that mix text and expressions start with `=` in JSON (`"=Hello {{$json.body.name}}"`). Spaces in names: `{{$json['first name']}}`.
- Another node: `{{$('Fetch orders').item.json.id}}` or `$node["Fetch orders"].json`; in Code use `$('Name').first().json` / `.all()`, never `.json` on the node directly.
- No `{{ }}` inside Code nodes (plain JS) and no expressions in webhook paths.
- Dates: Luxon `$now.toFormat('yyyy-MM-dd')`, `$now.plus({days: 7})`; state the timezone.
- `$jmespath($json, "items[?active].id")` replaces a Split Out → Filter → Aggregate chain for one projected field.

## 6. Code nodes

```javascript
// Run Once for All Items (default): one execution for the whole input
const items = $input.all();
return items
  .filter(i => i.json.email)
  .map(i => ({ json: { email: i.json.email.toLowerCase(), seenAt: new Date().toISOString() } }));
```
- Prefer **Run Once for All Items**: per-item mode builds a sandbox per item, about 25–30x the overhead (10k items ≈ 6 s vs 0.2 s). Use Each Item only for genuinely independent per-item handling.
- Return `[{ json: {...} }]`. Primitives or `null` fail.
- Access fields via `.json`; check lengths before indexing; don't mutate input items (spread into new objects).
- Available: `this.helpers.httpRequest()` (unauthenticated), Luxon `DateTime`, `$jmespath`. Not available: authenticated helper requests, `$env` when blocked, `require()` unless the instance allowlists modules. For auth, pagination and retries use the **HTTP Request node** and keep Code for pure logic.
- Persist small state between runs with `$getWorkflowStaticData('global')` (only saved for active, non-manual runs).

## 7. Loops and batches

- Split In Batches: output `main[0]` is **done**, `main[1]` is **loop**. Wire the per-batch work from the loop output back into the node; take results from done.
- After "done", a `Limit 1` or an Aggregate stops downstream nodes running once per item when you want one summary.
- Accumulate across iterations in a Code node with static data or by aggregating after done.
- Fan-out branches run **sequentially** (ordered by canvas Y-position), not in parallel. Real concurrency: Execute Workflow with `mode: "each"` and `waitForSubWorkflow: false`.

## 8. AI agent workflows

- AI Agent node with sub-nodes on the `ai_languageModel`, `ai_tool`, `ai_memory`, `ai_outputParser` ports (not `main`).
- The agent's answer is at `$json.output`.
- Tools: HTTP Request tool, Code tool, sub-workflow tools, MCP client tool. Describe each tool clearly; the model picks from descriptions.
- Memory: window buffer for chats, keyed on a session ID from the trigger.
- Keep side-effect tools (send, delete) behind an approval step or out of the agent entirely.

## 9. Errors

- One **Error Trigger** workflow per instance/project that posts the failing workflow, node and execution link to a channel.
- Per-node: Retry On Fail (3 tries, 1–5 s wait) for flaky APIs; `continueErrorOutput` to route failures to a handler branch.
- Stop and Error node for business-rule failures with a clear message.

## 10. Readability and handoff

- Workflow names verb-first ("Send weekly customer report"); node names say what they do ("Fetch active customers", not "Postgres1").
- Always set a 1–2 sentence `description` (what and why).
- Past ~10 nodes, group each logical step (node groups via `setNodeGroups` on the official MCP); sticky notes only for callouts/TODOs/warnings with a fixed colour palette.
- Mirror the conventions of nearby workflows.
- Handoff: trigger (webhook URL / cadence + timezone), where output goes, example `curl`, what to watch (Executions tab, error workflow, rate limits), pending items (credential checks, secret rotation).

## 11. Checklist

- [ ] Right MCP identified; existing workflows searched
- [ ] Webhook data read from `body`; expressions braced; Code returns `[{json}]` in All Items mode
- [ ] No placeholder credentials; user confirmed credentials per node
- [ ] Validated, connections read back, tested with pinned data (side effects confirmed with user)
- [ ] Error workflow linked; retries on flaky nodes
- [ ] Description, node names and groups set; published only after test; handoff given
