# Extracting data from websites

> Distilled from: firecrawl-agent (firecrawl/skills, ISC), browser-use (browser-use/browser-use, MIT), agent-browser (vercel-labs/agent-browser, Apache-2.0), playwright-cli (microsoft/playwright-cli, Apache-2.0), browser (browserbase/skills, MIT)

Getting structured data (prices, listings, tables, docs) out of web pages, once or on a schedule.

## 1. Cheapest route first

| Route | Use when | Cost |
|---|---|---|
| Official API, export, RSS, sitemap | Exists | Lowest, most stable |
| `curl` / fetch + parse HTML | Static pages | Low |
| Hidden JSON the page loads (network tab) | JS-rendered page backed by an XHR/fetch endpoint | Low; check terms |
| Browser CLI (playwright-cli, agent-browser, browser-use) | Needs JS, clicks, pagination, login the user already has | Medium |
| Scraping API single-page `scrape` (Firecrawl etc.) | Messy pages, need clean markdown | Paid per page |
| Autonomous extraction agent (`firecrawl agent`) | Multi-page navigation you can't script cheaply | Highest; minutes per job |

## 2. Rules

1. **Respect the site.** Check robots.txt and terms of service; don't scrape behind logins you weren't given, don't collect personal data you don't need, throttle (≥1 s between requests, low concurrency), identify your client honestly.
2. **No anti-bot evasion.** Don't solve CAPTCHAs, rotate residential proxies or use stealth modes to defeat blocking. Blocked → tell the user and look for an API/export.
3. **Define the schema first**: field names, types, required fields, one example row. Extraction without a schema returns freeform text that drifts.
4. **Write to files**, not into context: `-o data/products.json`; inspect with `jq`/`head`.
5. **Validate the output**: count rows vs what the page shows, nulls per field, types, duplicates, a few spot-checks against the live page.
6. **Paginate deliberately**: detect the last page; cap pages; record the source URL per row.
7. **Record provenance**: source URL and fetch timestamp on every row.
8. **Cap spend** on paid APIs (`--max-credits`) and say what a run costs.
9. Scheduled scrapes: dedupe by a stable key, diff against the last run, alert on schema change or zero rows instead of writing garbage.

## 3. Browser extraction

```bash
playwright-cli open https://example.com/catalog
playwright-cli snapshot --depth=4                     # find the list container
playwright-cli eval "[...document.querySelectorAll('.product')].map(p => ({name: p.querySelector('h2')?.textContent.trim(), price: p.querySelector('.price')?.textContent.trim()}))" --raw > page1.json
```
- Prefer `eval` returning JSON over reading snapshots row by row.
- For "load more"/infinite scroll: click or scroll, wait for the item count to grow, stop when it doesn't.
- Watch the network panel (`network` command / DevTools) for a JSON endpoint; calling it directly is faster and more accurate.

## 4. Firecrawl agent (paid API)

```bash
firecrawl agent "extract all pricing tiers" --wait --json -o .firecrawl/pricing.json
firecrawl agent "extract products" --schema '{"type":"object","properties":{"name":{"type":"string"},"price":{"type":"number"}}}' \
  --urls "https://example.com/shop" --max-credits 200 --wait --json -o .firecrawl/products.json
firecrawl agent "<job-id>" --wait --poll-interval 10 --timeout 300   # resume polling a job
firecrawl agent "<job-id>" --cancel
```
- Single page → use `scrape` instead (faster, cheaper). Agent runs take 2–5 minutes and cost more.
- Always pass `--schema` for predictable output and `--urls` to focus it.
- Done when the output file holds valid JSON answering the request (or you intentionally returned a job ID).
- Before an agent run, the CLI can search a catalogue of ready-made providers for common datasets; use one only if its input contract fits exactly.
- Don't send task details to the vendor's feedback endpoints on the user's behalf.

## 5. Checklist

- [ ] Cheapest viable route chosen; API/export checked first
- [ ] robots.txt/terms respected; no CAPTCHA or bot-check bypass; throttled
- [ ] Schema defined; output in a file with source URL + timestamp per row
- [ ] Row counts, nulls, duplicates and spot-checks verified
- [ ] Paid runs capped and cost reported
