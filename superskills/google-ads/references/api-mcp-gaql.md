> Distilled from: google-ads-api-quickstart, google-ads-api-mcp-setup, google-ads-api-account-diagnostics, data-manager-api-event-ingestion (google/skills, Apache-2.0), google-ads (jdrhyne/agent-skills, MIT), ads (AgriciDaniel/claude-ads, MIT), ads (coreyhaines31/marketingskills, MIT)

# Google Ads API, MCP server, GAQL and Data Manager API (developer guide)

Vendor-specific. API versions change every few months: check the [release notes](https://developers.google.com/google-ads/api/docs/release-notes) for the current major version before writing code, and prefer the client library's default version instead of hardcoding one.

## Credentials (five values)

| Value | Where | Format |
|---|---|---|
| Developer token | API Center in a **manager (MCC)** account: ads.google.com/aw/apicenter | Alphanumeric |
| OAuth client ID + secret | Google Cloud Console: enable "Google Ads API", OAuth consent screen (External, Testing, add your Google Ads login as a test user), create **Desktop app** client, download `client_secrets.json` | `*.apps.googleusercontent.com` |
| Refresh token | `gcloud auth application-default login --scopes=https://www.googleapis.com/auth/adwords,https://www.googleapis.com/auth/cloud-platform --client-id-file=client_secrets.json`, then read `refresh_token` from `~/.config/gcloud/application_default_credentials.json` | Long string |
| Customer ID | Account to query (top right in the UI) | 10 digits, **no hyphens** |
| Login customer ID | The manager account ID, when access goes through an MCC | 10 digits, no hyphens |

Token access levels: a **pending** token works only against **test accounts**. Production needs Explorer, Basic or Standard access, approved by Google. For server-to-server, a service account with direct access to the Ads account is an alternative to user OAuth.

Secret safety: keep credentials in a protected `google-ads.yaml` outside the repo, environment variables, or a secret manager. Never paste secrets into chat, print them, log them, or commit them. Readiness checks should test presence and a harmless read, not display values.

## Client libraries and REST

| Language | Package |
|---|---|
| Python | `google-ads` (`GoogleAdsClient.load_from_storage(path)` or `load_from_env()`) |
| Java | `com.google.api-ads:google-ads` |
| .NET | `Google.Ads.GoogleAds` |
| PHP | `googleads/google-ads-php` |
| Ruby | `google-ads-googleads` |
| Perl | `Google::Ads::GoogleAds::Client` |

`google-ads.yaml`:

```yaml
developer_token: INSERT
client_id: INSERT
client_secret: INSERT
refresh_token: INSERT
login_customer_id: INSERT_MANAGER_ID_IF_VIA_MCC
use_proto_plus: true
```

Python first query:

```python
from google.ads.googleads.client import GoogleAdsClient
client = GoogleAdsClient.load_from_storage("google-ads.yaml")
svc = client.get_service("GoogleAdsService")
customer_id = "123-456-7890".replace("-", "")
query = "SELECT campaign.id, campaign.name, campaign.status FROM campaign ORDER BY campaign.id"
for batch in svc.search_stream(customer_id=customer_id, query=query):
    for row in batch.results:
        print(row.campaign.id, row.campaign.name, row.campaign.status.name)
```

REST: exchange the refresh token for an access token at `https://oauth2.googleapis.com/token` (`grant_type=refresh_token`), then `POST https://googleads.googleapis.com/vNN/customers/{customer_id}/googleAds:searchStream` with headers `developer-token`, `Authorization: Bearer <token>`, `login-customer-id` (if via MCC) and body `{"query": "..."}`. The response is a JSON array of result chunks. Keep the `request-id` response header for support.

## Common errors

| Error | Cause | Fix |
|---|---|---|
| `USER_PERMISSION_DENIED` | Access via a manager account but no login customer ID | Set `login_customer_id` to the manager ID; customer ID stays the client account |
| `DEVELOPER_TOKEN_NOT_APPROVED` | Pending token against a production account | Use a test manager + test client accounts, or apply for Explorer/Basic/Standard access |
| `CUSTOMER_NOT_ENABLED` / errors on manager IDs | Querying a cancelled account or a manager account for metrics | List enabled, non-manager clients first (query below) |
| `UNRECOGNIZED_FIELD`, `INVALID_ARGUMENT` | Field not selectable with that resource or version | Check field compatibility; repair the query, never treat as "no data" |
| Auth works in shell but not in the IDE | IDE doesn't inherit shell env | Put env vars in the MCP client config |

Don't bypass token checks or widen OAuth scopes beyond `adwords`; restrictions are server-side.

## Official Google Ads MCP server

Connects Claude/Cursor/Gemini to an account in natural language. **Read-only**: it cannot change bids, pause or create anything.

- Requirements: Python 3.12+, `pipx`, the five credentials above.
- Install: `pipx install google-ads-mcp`; verify `google-ads-mcp --help` (if not on PATH, try `~/.local/bin/google-ads-mcp` and reload the shell).
- Transport: **stdio**; the client launches it as a subprocess, no network port. Logs go to stderr.
- Claude Desktop config (macOS `~/Library/Application Support/Claude/claude_desktop_config.json`, Windows `%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "google-ads": {
      "command": "pipx",
      "args": ["run", "google-ads-mcp"],
      "env": {
        "GOOGLE_ADS_DEVELOPER_TOKEN": "...",
        "GOOGLE_ADS_CLIENT_ID": "...",
        "GOOGLE_ADS_CLIENT_SECRET": "...",
        "GOOGLE_ADS_REFRESH_TOKEN": "...",
        "GOOGLE_ADS_LOGIN_CUSTOMER_ID": "manager id if applicable"
      }
    }
  }
}
```

  Claude Code: `claude mcp add` with the same command and env. Restart the client after any config change. `spawn pipx ENOENT` = give the absolute path to `pipx`. Claude Desktop logs: `~/Library/Logs/Claude/mcp.log`.
- Tools: `list_accessible_customers` (no args; start here), `get_resource_metadata` (`resource`, e.g. `campaign`; lists selectable fields), `search` (`customer_id`, `query` as GAQL).
- Remote hosting (Cloud Run) is possible, but an MCP server holding your developer token must **not** be deployed publicly reachable without authentication; put it behind IAM or an authenticating proxy.
- Test: "List all campaigns with status and budget for account 1234567890."

## GAQL essentials

```sql
SELECT <resource and metric fields> FROM <resource>
WHERE <conditions> ORDER BY <field> [DESC] LIMIT <n>
```

- Date: `segments.date DURING LAST_30_DAYS` or `segments.date BETWEEN '2026-09-01' AND '2026-09-30'` (explicit dates are safer for reports).
- Money: `*_micros` ÷ 1,000,000. Impression share: decimals (0.35) or strings (`"< 0.10"`).
- Adding `segments.date` returns one row per day; adding match type or device multiplies rows. Aggregate by entity key (e.g. ad group + keyword text + match type) or drop the segment.
- Exclude `REMOVED` entities explicitly when you only want serving items; say so in the output.
- Use `get_resource_metadata` (MCP) or the API field reference to confirm a field is selectable with the resource.

### Query library

```sql
-- Enabled client accounts under a manager (run first)
SELECT customer_client.id, customer_client.descriptive_name, customer_client.status, customer_client.manager
FROM customer_client
WHERE customer_client.status = 'ENABLED' AND customer_client.manager = FALSE

-- Campaign performance
SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
       campaign_budget.amount_micros, metrics.impressions, metrics.clicks, metrics.cost_micros,
       metrics.conversions, metrics.conversions_value
FROM campaign
WHERE segments.date DURING LAST_30_DAYS AND campaign.status != 'REMOVED'
ORDER BY metrics.cost_micros DESC

-- Conversions by action and device (diagnose drops)
SELECT campaign.name, segments.conversion_action_name, segments.device, segments.date,
       metrics.conversions, metrics.conversions_value, metrics.cost_micros
FROM campaign
WHERE segments.date BETWEEN '{start}' AND '{end}'

-- Impression share
SELECT campaign.name, metrics.search_impression_share,
       metrics.search_budget_lost_impression_share, metrics.search_rank_lost_impression_share
FROM campaign
WHERE segments.date DURING LAST_30_DAYS AND campaign.advertising_channel_type = 'SEARCH'

-- Keywords with Quality Score
SELECT ad_group.name, ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
       ad_group_criterion.quality_info.quality_score, metrics.cost_micros, metrics.conversions
FROM keyword_view
WHERE segments.date DURING LAST_90_DAYS AND ad_group_criterion.status = 'ENABLED'
ORDER BY metrics.cost_micros DESC

-- Search terms (pull unfiltered; compare clicks to campaign total)
SELECT search_term_view.search_term, campaign.name, ad_group.name,
       metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
FROM search_term_view
WHERE segments.date DURING LAST_30_DAYS

-- Conversion action setup
SELECT conversion_action.name, conversion_action.status, conversion_action.category,
       conversion_action.primary_for_goal, conversion_action.counting_type, conversion_action.type
FROM conversion_action

-- Offline upload health
SELECT offline_conversion_upload_conversion_action_summary.conversion_action_name,
       offline_conversion_upload_conversion_action_summary.successful_event_count,
       offline_conversion_upload_conversion_action_summary.total_event_count,
       offline_conversion_upload_conversion_action_summary.status
FROM offline_conversion_upload_conversion_action_summary

-- Change history (max 30 days back, LIMIT ≤ 10000, no metrics allowed)
SELECT change_event.change_date_time, change_event.client_type, change_event.change_resource_type,
       change_event.change_resource_name, change_event.resource_change_operation, change_event.changed_fields
FROM change_event
WHERE change_event.change_date_time >= '{start}' AND change_event.change_date_time <= '{end}'
ORDER BY change_event.change_date_time DESC
LIMIT 10000
```

If the offline upload summary returns nothing, report that no offline uploads exist and stop that branch. `change_event.client_type` shows who changed things (UI, API, scripts, automated rules, recommendations); report the client type rather than guessing a person.

## Changing a live account

Default to read-only. A write needs all of:

1. Fresh read of current state with exact customer ID and resource IDs.
2. A preview: account, change type, entities (count + IDs), before → after per field, timing, expected impact, rollback step.
3. Explicit approval of **that** preview. A scope change means a new preview. Approval of batch 1 is not approval of batch 2.
4. Batches of ≤ 25 entities. Send with `validate_only=True` first where supported; explicit update masks; `partial_failure=True` only when partial success is acceptable.
5. Execute once, then read every changed resource back and compare with the approved diff. Report each entity as `verified`, `failed`, `partial failure` or `unknown` ("submitted" is not "verified").
6. Stop all further batches on any failure, drift or account-context change.

Prefer pause over remove; never bulk-delete. Without approved spend ceilings, make no budget writes.

## Data Manager API: offline conversions

The newer Google endpoint for sending conversions and events (Google Ads offline conversions, enhanced conversions for leads, store sales, GA4 events, Floodlight). Endpoint: `/v1/events/ingest` via `IngestionServiceClient`. Setup and auth live in Google's `data-manager-api-setup` guide.

Checklist:
- Destination: `operating_account` (account receiving data, with `account_type` such as `GOOGLE_ADS`), `login_account` if via manager or data partner, and `product_destination_id` = the conversion action ID as a **numeric string**, not a resource name.
- Events: `event_timestamp` in RFC 3339 (use the SDK timestamp type); `currency` (not `currency_code`); click IDs (`gclid`, `gbraid`, `wbraid`) inside `ad_identifiers`.
- User data: `UserIdentifier` with `email_address` / `phone_number` (not the Google Ads API's `hashed_email`), normalised and hashed with the utility library's `Formatter`.
- Consent: `CONSENT_GRANTED` / `CONSENT_DENIED` (not `GRANTED`), set per request or per event.
- Use `validate_only=true` while developing (and don't poll status for validate-only calls).
- A 200 response with `request_id` only means "received". Poll `retrieve_request_status` with exponential backoff starting ≥ 30 minutes later; read per-destination `SUCCESS` / `PARTIAL_SUCCESS` / `FAILED`, `error_info.error_counts` and `warning_info.warning_counts`. Skipping this is the most common mistake.
- Official samples: `googleads/data-manager-python|java|php|node|dotnet` (`ingest_events`). Migrating from the Google Ads API upload services: follow Google's field-mapping guide for offline conversions.
