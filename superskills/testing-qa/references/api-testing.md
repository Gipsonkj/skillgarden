# API tests: Postman collections, the Postman CLI and Newman

> Written from the official Postman, Newman and GitHub Actions docs (link-only, our own words); see CREDITS.md.

API tests check endpoints request by request: status, response shape, key fields, permissions and errors. Where they sit among the other levels is in [test-strategy.md](test-strategy.md). Code-level API tests in the project's own runner (pytest with the framework's test client, Vitest/Jest, Go `httptest`) are in [unit-runners-by-language.md](unit-runners-by-language.md). This guide covers the case where the team keeps its API requests in Postman.

## Pick a tool

| Need or situation | Tool | Why |
|---|---|---|
| The user already uses or pays for one (Postman, Newman in CI, a pytest API suite) | That one | Don't move a working suite; extend it |
| API tests should live with the code and run with the unit suite | The project's runner (pytest, Vitest/Jest, Go) | One runner, one report, no extra account |
| A Postman collection exists and must run in CI with no Postman account in the pipeline | Newman | Open-source npm runner; runs an exported collection JSON with no sign-in |
| Run in CI by collection ID, or see the run results in Postman | Postman CLI, signed in with an API key | Postman's own runner; when signed in it uploads run results to Postman |
| Read or edit collections, environments and specs from Claude | Postman MCP server | Official server; OAuth on the US endpoint |
| Not sure where the collection lives or which runner CI uses | Ask the user | Workspace vs JSON in the repo decides the runner and whether a key is needed at all |

## Write the tests in the collection

Tests go in each request's **Post-response** script. Check more than the status code: a 200 with the wrong body is still a bug.

```js
// Create order (POST {{baseUrl}}/orders)
pm.test("201 Created", () => pm.response.to.have.status(201));
pm.test("JSON body", () =>
  pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json"));

const schema = {
  type: "object",
  required: ["id", "status", "items"],
  properties: {
    id: { type: "string" },
    status: { type: "string", enum: ["pending"] },
    items: { type: "array", minItems: 1 }
  }
};
pm.test("matches the order schema", () => pm.response.to.have.jsonSchema(schema));

const order = pm.response.json();
pm.test("echoes the item we sent", () => pm.expect(order.items[0].sku).to.eql("SKU-1"));
pm.test("responds within 1.5 s", () => pm.expect(pm.response.responseTime).to.be.below(1500));

pm.collectionVariables.set("orderId", order.id);   // used by Get and Cancel
```

```js
// Get order (GET {{baseUrl}}/orders/{{orderId}})
pm.test("200 OK", () => pm.response.to.have.status(200));
pm.test("same order", () =>
  pm.expect(pm.response.json().id).to.eql(pm.collectionVariables.get("orderId")));
```

| Piece | What to know |
|---|---|
| `pm.test(name, fn)` | One named check; the name is what the report shows |
| `pm.expect(...)` | Chai assertions (`to.eql`, `to.include`, `to.be.below`) |
| `pm.response.to.have.status(n)`, `pm.response.code` | Status assertion, or the number itself |
| `pm.response.json()` | Parsed body |
| `pm.response.responseTime` | Milliseconds; keep the bound generous on shared staging |
| `pm.response.to.have.jsonSchema(schema)` | Validates with Ajv; takes an optional Ajv options object |
| `pm.collectionVariables.set/get`, `pm.environment.set/get` | Carry values (the new order ID) to later requests |
| `{{name}}` in URLs, headers, bodies | Variable reference; the narrowest scope wins (global, collection, environment, data, local, in rising priority) |
| `{{$guid}}`, `{{$randomUUID}}`, `{{$timestamp}}` | Dynamic values for unique test data per run; in scripts use `pm.variables.replaceIn('{{$guid}}')` |

Rules:
- **Each run makes its own data.** Create the order in the run, carry its ID forward, never hard-code an existing ID. Use a dynamic value for anything that must be unique.
- **Order matters.** Requests run in collection order; chained variables break when one request or folder runs alone. Keep create → get → cancel in one folder.
- **Mutating requests need a yes.** Create and cancel change data. Run them only against staging or a disposable environment; before pointing the collection anywhere else, show the target URL and wait for a yes. Never production.
- **Variables you type stay local by default**: Postman doesn't sync a variable's local value to the cloud unless someone shares it. Still check the exported environment file before it goes into the repo; it must hold placeholders only.

## Run it: Postman CLI or Newman

Install from npm. Postman also offers one-line installers that run a downloaded script straight away (on macOS/Linux and in PowerShell); don't use those (download and read the script first, or use npm).

```bash
npm install -g postman-cli     # Postman CLI
npm install -g newman          # Newman (Node 16 or newer)
```

| Job | Postman CLI | Newman |
|---|---|---|
| Run | `postman collection run <file-or-collection-id>` | `newman run <file>` |
| Environment | `-e staging.postman_environment.json` (or an environment UID) | `-e <file>` |
| Override one variable | `--env-var "token=$STAGING_TOKEN"` (repeatable) | `--env-var "token=$STAGING_TOKEN"` |
| Iteration data (CSV/JSON) and count | `-d data.csv`, `-n 3` | `-d data.csv`, `-n 3` |
| One folder or request | `-i <folder-or-request-UID>` | `--folder "Orders"` |
| Reports | `-r cli,junit --reporter-junit-export reports/api.xml` (also `json`, `html`; default folder `postman-cli-reports/`) | `-r cli,junit --reporter-junit-export reports/api.xml` |
| Stop at first failure | `--bail` | `--bail` |
| Timeouts, pacing | `--timeout-request <ms>`, `--delay-request <ms>` | same flags |
| Skip TLS checks | `--insecure` / `-k`: only for a self-signed local server, never to hide a staging certificate problem | `--insecure` |

**Sign-in.** A local collection file runs without signing in. Sign in only to run by collection ID or to send results to Postman: `postman login --with-api-key "$POSTMAN_API_KEY"`. Once signed in, the CLI uploads run results (assertions and pass/fail) to Postman from local and CI runs; tell the user before turning that on.

**Newman gotcha.** Newman can fetch a collection from the Postman API with the key as a URL parameter. Don't: the key lands in logs and shell history. Export the collection to JSON in the repo, or use the Postman CLI with `postman login`.

Before calling it done, break one assertion on purpose and confirm the run, and the CI step, goes red.

## Run on every pull request (GitHub Actions)

Secrets live in GitHub (repository or environment secrets), never in the repo, the collection or the environment file. The environment file in the repo holds `baseUrl` and an empty `token`; the real token arrives through `--env-var`.

```yaml
name: API tests
on: pull_request
permissions:
  contents: read
jobs:
  api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<full-commit-sha>        # pin every action to a full SHA
      - uses: actions/setup-node@<full-commit-sha>
        with: { node-version: 22 }
      - run: npm install -g postman-cli
      - name: Run orders collection against staging
        env:
          STAGING_TOKEN: ${{ secrets.STAGING_TOKEN }}
        run: >
          postman collection run postman/orders.postman_collection.json
          -e postman/staging.postman_environment.json
          --env-var "token=$STAGING_TOKEN"
          -r cli,junit --reporter-junit-export reports/orders.xml
      - if: failure()
        uses: actions/upload-artifact@<full-commit-sha>
        with: { name: api-report, path: reports/ }
```

- Add `POSTMAN_API_KEY` as a secret and a `postman login --with-api-key "$POSTMAN_API_KEY"` step (with the key in `env:`) only when the run uses collection IDs or should upload results. Postman's own `postmanlabs/postman-cli-action` takes `command` and `api-key` inputs if the team prefers an action.
- Pass secrets through `env:`, not as `${{ }}` inside the command line. Pinning to a full commit SHA is the only way GitHub offers to make an action immutable; `contents: read` keeps the token least-privilege.
- Pull requests from forks get no secrets (except `GITHUB_TOKEN`), so the job fails there; say so, or skip the job for forks.
- Caching, matrices, required checks and deploy gates belong to `cloud-devops` → `references/ci-cd.md`.

## Postman MCP server and API

| Route | Setup | Notes |
|---|---|---|
| Remote MCP, OAuth (US) | `claude mcp add --transport http postman https://mcp.postman.com/minimal` | No key to store. Modes: `/minimal` (default), `/code`, `/mcp` (full, 100+ tools), `/learn`, `/context-graph`. Start minimal |
| Remote MCP, EU | `https://mcp.eu.postman.com/minimal` or `/mcp` with `--header "Authorization: Bearer $POSTMAN_API_KEY"` | EU has no OAuth; the key ends up in Claude's MCP config, outside the repo |
| Local MCP | npm package `@postman/postman-mcp-server` with the key in its env | Same tools on your machine |
| Postman API | `X-API-Key` header; key from Settings → Account settings → API keys, with an expiry you choose | 300 requests per minute per key, plus a monthly call allowance by plan; when the limit is exceeded, the `RetryAfter` (or `X-RateLimit-RetryAfter`) header gives the seconds to wait |

Keep the key in an environment variable (`POSTMAN_API_KEY`) or a CI secret. Never paste it into chat, a collection, an environment file or a committed config. Writes through the MCP (editing a shared collection or environment) change the team's workspace: show the change and wait for a yes.

## Report

The command that ran, its real output (passes and failures, with the failing assertion text), the environment it hit, which runner was chosen and why, and anything not run (for example cancel requests held back pending a yes).
