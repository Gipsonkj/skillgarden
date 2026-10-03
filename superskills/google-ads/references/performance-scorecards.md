> Distilled from: ads (coreyhaines31/marketingskills, MIT), paid-media-analysis (langchain-ai/paid-media-agent, Apache-2.0), google-ads-manager (claude-office-skills/skills, MIT), google-ads (jdrhyne/agent-skills, MIT), google-analytics-data-api-basics (google/skills, Apache-2.0), ads (AgriciDaniel/claude-ads, MIT)

# Performance reporting and scorecards

A report answers: are we hitting the business goal, what changed, why, and what we will do next. Numbers without that are a data dump.

## Set the frame first

- **Goal and primary metric** (CPA, ROAS, cost per qualified lead, revenue).
- **Window:** complete days only. "Last week" = most recent full Monday–Sunday; "last 30 days" ends on the last complete day, not today.
- **Comparison:** same number of days, same weekdays; flag holidays and promos. Year-over-year for seasonal businesses.
- **Timezone and currency** of the account. API cost is in micros: divide `cost_micros` by 1,000,000.
- **Conversion lag:** the last 3–14 days (depending on sales cycle) are under-reported. Say so or exclude them.
- If data ends inside the window, keep the window and name the missing days; don't silently shrink it.

## Validation before any number goes out

- [ ] Right account and customer ID
- [ ] Row totals reconcile to the account/campaign total
- [ ] No duplicated rows (e.g. keyword_view by date and match type)
- [ ] Conversions segmented by action; you know which ones are primary
- [ ] Same attribution model and window in both periods
- [ ] Missing data labelled "unavailable", never shown as 0
- [ ] Brand and non-brand reported separately

## Weekly scorecard (8 numbers)

Spend · conversions (or leads) · CPA/CPL · ROAS or conversion value · lead→qualified rate (from CRM) · cost per qualified lead/sale · Search impression share (with lost-to-budget and lost-to-rank) · top wasted search terms.

If these eight are healthy and trending right, the account is healthy. Everything else is diagnosis.

## Brand vs non-brand

Show **blended** at the top (true business efficiency) but **optimise and set targets on non-brand**. A low brand CPA mostly measures demand you already had; never present it as a win without an incrementality test (brand holdout or geo experiment).

## Template

```markdown
# Google Ads – <account> – <dates> vs <prior dates>

## Bottom line
<one or two sentences: on/off target, the main reason, the main action>

## Results
| Segment | Spend | Conv | CPA | Conv value | ROAS | Δ CPA vs prior |
|---|---|---|---|---|---|---|
| Brand | | | | | | |
| Non-brand | | | | | | |
| Shopping/PMax | | | | | | |
| **Total** | | | | | | |

## What changed and why
- Observation (number) → likely driver (evidence) → confidence (verified / inferred)

## Actions taken this period
| Date | Change | Reason | Result so far |

## Next actions
| Action | Owner | Expected effect | Check date | Rollback trigger |

## Caveats
Conversion lag, search-term coverage (disclosed X% of clicks), tracking changes, data gaps.
```

Write observation, meaning, driver, confidence and next action as separate statements. Every recommendation needs a measurement plan and a reversal condition.

## Comparing periods correctly

```
delta % = (current - prior) / prior
```

- Don't pool across big configuration changes; split the window at the change date.
- Small numbers: a CPA swing on 6 conversions is noise. Show counts next to rates.
- Attribute changes to the right cause: mix shift (more brand spend) can move blended CPA with no real efficiency change.

## Platform vs analytics vs CRM

| Source | Use for |
|---|---|
| Google Ads | Delivery diagnostics, bidding inputs (click-date attribution) |
| GA4 | On-site journey, cross-channel view (session-date, own attribution) |
| CRM / accounting | Accepted business value, the final truth |
| Experiments / holdouts | Incrementality |

Never sum platform-attributed conversions across platforms as if they were unique customers. Show them side by side with each platform's attribution window.

## Pulling data

- **UI:** Reports > predefined or custom reports; schedule a weekly email of the scorecard. Search terms: Insights & reports > Search terms.
- **Google Ads API / MCP:** GAQL patterns in [api-mcp-gaql.md](api-mcp-gaql.md).
- **Looker Studio:** native Google Ads + GA4 connectors for recurring dashboards.
- **GA4 Data API** (developer path): enable `analyticsdata.googleapis.com`, authenticate with `gcloud auth application-default login --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/analytics.readonly"`, install `google-analytics-data` (Python), and call `run_report` with a `properties/<id>` property, dimensions (`date`, `sessionSource`, `sessionMedium`, `sessionCampaignName`) and metrics (`sessions`, `keyEvents`, `totalRevenue`). If you get `INVALID_ARGUMENT` for a field combination, use `check_compatibility` or `get_metadata` to find valid pairs.

## Client-facing language

- Lead with the outcome in business terms ("23 qualified demos at $142 each, target $160").
- Volunteer limits first (coverage, lag, small samples); the client can see the same data.
- Dated claims: "as of the 2 March pull".
- If a client challenges a finding and they're right, concede plainly and move on.
