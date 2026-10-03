# Credits

This super skill is distilled from the open-source skills below. Text was rewritten and merged; only the two scripts listed were copied as-is, with their licenses beside them.

| Skill | Repo | License | What was used |
|---|---|---|---|
| ads | https://github.com/coreyhaines31/marketingskills/tree/main/skills/ads | MIT | Intent ladder, account structure, match-type progression, negative mechanics, weekly search-terms ritual, bidding by volume, offline conversions, reading Google Ads data (withheld search terms, zero-in-N table, break-even CVR), 32-point audit checklist, audit guardrails, RSA output spec, brand vs non-brand, scorecard |
| analytics | https://github.com/coreyhaines31/marketingskills/tree/main/skills/analytics | MIT | GA4 setup, event naming, UTMs, GTM dataLayer patterns, GA4–Ads integration |
| ads | https://github.com/AgriciDaniel/claude-ads/tree/main/ads | MIT | Pass/fail/unknown scoring, evidence coverage bands, severity weights, mutation gate, recommendation safety, benchmark evidence ladder, budget maths, consent-mode modelling threshold, GAQL row-grain notes |
| ads-google | https://github.com/AgriciDaniel/claude-ads/tree/main/skills/ads-google | MIT | Google audit control areas and boundaries (no invented negatives, operation-capability check) |
| google-ads-api-account-diagnostics | https://github.com/google/skills/tree/main/skills/ads/google-ads-api-account-diagnostics | Apache-2.0 | Diagnostic workflows (conversion loss, impression share, low lead flow, offline upload health), GAQL examples, change_event limits |
| google-ads-api-mcp-setup | https://github.com/google/skills/tree/main/skills/ads/google-ads-api-mcp-setup | Apache-2.0 | MCP server install, stdio transport, client config, tools and troubleshooting |
| google-ads-api-quickstart | https://github.com/google/skills/tree/main/skills/ads/google-ads-api-quickstart | Apache-2.0 | Credential setup, client libraries, REST flow, common API errors |
| google-analytics-data-api-basics | https://github.com/google/skills/tree/main/skills/analytics/google-analytics-data-api-basics | Apache-2.0 | GA4 Data API enablement, auth scopes, run_report and compatibility checks |
| data-manager-api-event-ingestion | https://github.com/google/skills/tree/main/skills/ads/data-manager-api-event-ingestion | Apache-2.0 | Data Manager API ingestion checklist and gotchas |
| analytics-tracking | https://github.com/alirezarezvani/claude-skills/tree/main/marketing-skill/skills/analytics-tracking | MIT | Event taxonomy, key events, consent mode modes, debug stack and common tracking failures; `scripts/analytics-tracking/tracking_plan_generator.py` copied as-is |
| google-ads | https://github.com/openclaudia/openclaudia-skills/tree/main/skills/google-ads | MIT | RSA headline categories, copy rules, asset limits, PMax asset table, QS levers |
| search-term-miner | https://github.com/aaron-he-zhu/aaron-marketing-skills/tree/main/ad/research/search-term-miner | Apache-2.0 | Harvest / negate / move diff and n-gram waste report |
| keyword-research | https://github.com/openclaudia/openclaudia-skills/tree/main/skills/keyword-research | MIT | Search-intent classification signals |
| google-ads | https://github.com/jdrhyne/agent-skills/tree/main/skills/google-ads | MIT | Read-only default, mutation workflow (≤ 25-entity batches, validate_only, readback states), credential safety |
| google-ads | https://github.com/kostja94/marketing-skills/tree/main/skills/paid-ads/platforms/google-ads | MIT | PMax learning period and weekly health flags, competitor-campaign rules |
| google-ads | https://github.com/arnabbagxd/brand-building-skills/tree/main/skills/google-ads | MIT | Campaign-type guide, Shopping feed attributes, optimisation cadence |
| google-ads-manager | https://github.com/claude-office-skills/skills/tree/main/google-ads-manager | MIT | Keyword categories, report layout |
| google-ads-builder | https://github.com/mikefutia/google-ads-builder | MIT | URL-to-Search-campaign build flow, campaign.json schema; `scripts/google-ads-builder/render_report.py` copied as-is |
| google-ads-audit | https://github.com/itallstartedwithaidea/google-ads-skills/tree/main/skills/google-ads-audit | Apache-2.0 | Seven audit dimensions, severity levels, 30/60/90 plan |
| paid-media-analysis | https://github.com/langchain-ai/paid-media-agent/tree/main/workspace/skills/paid-media-analysis | Apache-2.0 | Window and comparison rules, validation checklist, "unavailable is not zero" |

Reviewed but not used for content: google-ads (nowork-studio/notfair-plugin, MIT) is a thin wrapper around a hosted MCP service with no standalone guidance.

## Also see (not included)

| Skill | URL | Why not included |
|---|---|---|
| google-ads-scripts (Google Ads Scripts / AdsApp guidance) | https://github.com/henkisdabro/wookstar-claude-plugins/tree/main/plugins/google-ads-scripts/skills/google-ads-scripts | Repo license not asserted (NOASSERTION); link only |
