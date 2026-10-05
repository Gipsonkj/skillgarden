# Selling on marketplaces beside the store (Amazon)

> Written from Amazon's official Selling Partner API docs and API models (developer-docs.amazon, github.com/amzn), in this skill's own words. API versions and dates are as of October 2026: check the SP-API changelog before pinning.

Most store owners who sell on Amazon run it as a second channel: same products, separate listings, orders, stock and fees. This guide covers reading and changing that channel from Claude with the Selling Partner API (SP-API). Listing copy goes to `content-creation`; marketplace ads aren't covered here.

## 1. Pick a tool

| Need or situation | Use | Why |
|---|---|---|
| The seller already uses a tool or connector that syncs Amazon (an inventory app, a multichannel tool) | That tool | Two systems writing the same listings fight each other; ask what syncs Amazon today |
| A one-off look at orders, listings or stock | Seller Central reports, downloaded by the seller | No developer setup |
| Repeated pulls, reconciliations, bulk listing checks | SP-API as a private (self-authorised) app, section 2 | The seller's own data, no third party in between |
| Writing or debugging SP-API code, finding the right operation | Amazon's SP-API developer MCP, section 6 | Docs, schemas and code samples without credentials |

Other marketplaces (Etsy, eBay, Walmart, TikTok Shop) aren't covered yet: use their own official API docs and the same rules (section 7).

## 2. Access: a private app for the seller's own account

1. **Register as a private developer:** in Seller Central, Apps and Services > Develop Apps (or the Solution Provider Portal), choose the private developer option, and pick only the roles the job needs. Agreeing to Amazon's Acceptable Use and Data Protection policies is part of it. Four roles are restricted because they expose personal data (Direct-to-Consumer Shipping, Professional Services, Tax Invoicing, Tax Remittance): skip them unless the job needs buyer addresses.
2. **Self-authorise:** Develop Apps > Authorize app gives a refresh token. Only the account's primary user can do this; the seller does it, not Claude.
3. **Keep three secrets in environment variables** (client id, client secret, refresh token), never in chat or the repo.
4. **Get an access token** for each hour of work:

```bash
curl -s -X POST https://api.amazon.com/auth/o2/token \
  -d grant_type=refresh_token -d refresh_token="$SP_API_REFRESH_TOKEN" \
  -d client_id="$SP_API_CLIENT_ID" -d client_secret="$SP_API_CLIENT_SECRET"
# -> {"access_token": "...", "expires_in": 3600, ...}
```

Send it as the `x-amz-access-token` header. AWS IAM and Signature Version 4 signing are no longer required (since 2 October 2023).

**Endpoints:** `https://sellingpartnerapi-na.amazon.com` (North America and Brazil), `-eu`, `-fe` (Japan, Australia, Singapore). Sandbox: `https://sandbox.sellingpartnerapi-na.amazon.com` (and `-eu`, `-fe`), which returns mock responses; build there first. Marketplace ids include US `ATVPDKIKX0DER`, CA `A2EUQ1WTGCTBG2`, UK `A1F83G8C2ARO7P`, DE `A1PA6795UKMFR9`, JP `A1VC38T7YXB528`.

**Fees:** Amazon announced SP-API usage and annual fees and then said it will not move forward with them "at this time". Check developer.amazonservices.com before telling a seller what API access costs.

## 3. Orders

- **Use Orders API v2026-01-01.** v0 (`GET /orders/v0/orders`) is deprecated; integrations must migrate by 27 March 2027.
- `GET /orders/2026-01-01/orders` (searchOrders) needs `createdAfter` or `lastUpdatedAfter`; `marketplaceIds` is optional. `includedData` asks for extra blocks: `BUYER`, `RECIPIENT`, `PROCEEDS`, `EXPENSE`, `PROMOTION`, `CANCELLATION`, `FULFILLMENT`, `PACKAGES`, `TAX`, `PAYMENT`, `FULFILLMENT_ORDERS`. Request only what the job needs; buyer and recipient data are personal data.
- `GET /orders/2026-01-01/orders/{orderId}` for one order.
- Rates: searchOrders 0.0056 requests per second, burst 20 (about one call every three minutes after the burst); getOrder 0.5 per second, burst 30. For a month of history use a report (section 5) instead of paging orders.

```bash
curl -s "https://sellingpartnerapi-na.amazon.com/orders/2026-01-01/orders?createdAfter=2026-09-01T00:00:00Z&marketplaceIds=ATVPDKIKX0DER" \
  -H "x-amz-access-token: $SP_API_ACCESS_TOKEN"
```

On older v0 code, buyer data needs a Restricted Data Token (`POST /tokens/2021-03-01/restrictedDataToken`, passed in place of the access token); v2026-01-01 drops that step. Either way, personal data must be deleted no later than 30 days after the order is delivered.

## 4. Listings and stock

- **Listings Items API 2021-08-01:** `GET`, `PUT`, `PATCH`, `DELETE` on `/listings/2021-08-01/items/{sellerId}/{sku}`; `GET /listings/2021-08-01/items/{sellerId}` searches. `PUT` and `PATCH` need `marketplaceIds` and a body. Rates: get and put 5 per second (burst 10), patch and delete 5 per second (burst 5).
- **Dry-run every write** with `mode=VALIDATION_PREVIEW`: Amazon validates the change and returns issues without saving it. Show the seller the SKU, the fields and old vs new values, wait for a yes, then send it without the mode, one SKU first.
- **Required attributes** per category come from the Product Type Definitions API (2020-09-01), as JSON Schema: read it before building a listing body.
- **FBA stock:** `GET /fba/inventory/v1/summaries?granularityType=Marketplace&granularityId=ATVPDKIKX0DER&marketplaceIds=ATVPDKIKX0DER` (one marketplace; `details=true` for the breakdown; `sellerSkus` up to 50; follow `nextToken`). Rate 2 per second, burst 2. Feed these numbers into reorder planning in [inventory-and-fulfilment.md](inventory-and-fulfilment.md) as a separate location.

## 5. Reports (bulk reads)

1. `POST /reports/2021-06-30/reports` with `reportType` and `marketplaceIds` (required), plus `dataStartTime` and `dataEndTime` for the period.
2. Poll `GET /reports/2021-06-30/reports/{reportId}` until `processingStatus` is `DONE` (or `CANCELLED`, `FATAL`).
3. `GET /reports/2021-06-30/documents/{reportDocumentId}` returns a download URL that expires after 5 minutes; if `compressionAlgorithm` is `GZIP`, decompress it.

Useful types: `GET_MERCHANT_LISTINGS_ALL_DATA` (all listings), `GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE_GENERAL` (orders placed in the period; `..._BY_LAST_UPDATE_GENERAL` for changes). createReport and getReportDocument run at 0.0167 per second (burst 15), so request a few big reports, not many small ones. Analyse them with [store-analytics.md](store-analytics.md), keeping Amazon as its own channel.

## 6. Amazon's SP-API developer MCP

`npx -y @amazon-sp-api-release/sp-api-dev-mcp sp-api-dev-assistant-mcp-server` (Node 20+). Tools: `sp_api_reference`, `sp_api_explore_catalog`, `sp_api_generate_code_sample`, `sp_api_migration_assistant` (for example v0 to v2026-01-01 orders), `sp_api_optimize`, and `sp_api_execute`, which makes **live** calls. Everything except `sp_api_execute` works with no credentials; that one reads `SP_API_CLIENT_ID`, `SP_API_CLIENT_SECRET`, `SP_API_REFRESH_TOKEN` (optional `SP_API_BASE_URL`, `SP_API_REGION`). Amazon labels it educational sample code. Leave the credentials out unless live reads are needed, and treat any write through `sp_api_execute` like section 4: preview, confirm, one item first.

## 7. Rules

- **Throttling:** each operation has a token bucket; a 429 is retryable, so back off and retry, and slow down when it repeats. `x-amzn-RateLimit-Limit` is returned on a best-effort basis only.
- **Least privilege:** only the roles and `includedData` blocks the job needs; no restricted roles for analysis.
- **Personal data** stays in the seller's systems, is deleted within 30 days of delivery, and never appears in reports to anyone else.
- **No scraping** Amazon pages for prices, reviews or rankings (core principle 14). Use the API or the seller's reports.
- **Writes** (prices, quantities, listing content, deletes) are previewed with `VALIDATION_PREVIEW`, confirmed by the seller and read back.

## Checklist

- [ ] Asked what already syncs Amazon before writing to listings
- [ ] Private app with minimal roles; secrets in environment variables; seller did the authorisation
- [ ] Orders on v2026-01-01; reports for bulk history
- [ ] Every listing write dry-run with `VALIDATION_PREVIEW`, confirmed, one SKU first, read back
- [ ] Personal data minimised and deleted within 30 days of delivery
