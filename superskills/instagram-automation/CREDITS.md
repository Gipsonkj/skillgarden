# Credits

This super skill is a distillation written in our own words. Only sources with a permissive license and no non-commercial clause were used. Scripts in `scripts/ig-reel/` are copied as-is, with their source license next to them.

| Skill | Repo | License | What was used |
|---|---|---|---|
| instagram-automation | https://github.com/sickn33/agentic-awesome-skills/tree/main/skills/instagram-automation | MIT | Composio/Rube MCP tool map, two-phase publishing, publishing-limit check, insights pitfalls (`graph-api-publishing.md`, `analytics.md`) |
| social-publisher | https://github.com/affaan-m/ECC/tree/main/skills/social-publisher | MIT | SocialClaw validate → apply → status flow; rules for treating fetched content as untrusted (`graph-api-publishing.md`, `tos-and-safe-automation.md`) |
| viral-instagram-reels | https://github.com/vyralcontent/content-skills/tree/main/skills/viral-instagram-reels | MIT | Sends-first principles, Reels hook craft, Trial Reels, originality/audio, caption-as-search, Insights metrics, diagnose-flop order, readout worksheet (`reels-scripting.md`, `captions-hashtags-ctas.md`, `analytics.md`) |
| instagram-marketing (incl. ig-caption-writer, ig-carousel-planner, ig-hashtag-strategist, ig-content-planner, ig-profile-optimizer, ig-humanizer, ig-audience-insights, ig-repurposer) | https://github.com/sergebulaev/instagram-skills | MIT | Hook formulas, slide architecture, hashtag sizing, pillars and weekly plan, profile scorecard, voice/AI-tell scrub, signal weights, Publora media flow (several references) |
| reels-scripting | https://github.com/charlie947/social-media-skills/tree/main/skills/reels-scripting | MIT | Reference-Reel analysis checklist, script rules, comment-trigger conditions (`reels-scripting.md`, `dms-and-comments.md`). Its Apify scraping step was not adopted as a default. |
| ig-reel | https://github.com/Jakeschincariol/instagram-agent-skill/tree/main/skills/ig-reel | MIT | Reel shape, safe-zone numbers, on-screen text rules. **Copied as-is:** `scripts/ig-reel/hookscore.py`, `beats.py`, `hooks.json` (+ `LICENSE.source-repo`) |
| carousel-writer-sms | https://github.com/blacktwist/social-media-skills/tree/main/skills/carousel-writer-sms | MIT | Carousel zones, formats, slide output format, Instagram specs (`carousels.md`) |
| caption-writer-sms | https://github.com/blacktwist/social-media-skills/tree/main/skills/caption-writer-sms | MIT | Caption anatomy, length guide, CTA patterns, alt text (`captions-hashtags-ctas.md`) |
| instagram | https://github.com/sickn33/agentic-awesome-skills/tree/main/skills/instagram | MIT | Graph API endpoints, scopes, rate limits, account types, confirm-then-execute and audit-log pattern, best-times idea (Portuguese docs; paraphrased). Scripts not copied. |
| apify-influencer-brand-collabs | https://github.com/apify/awesome-skills/tree/main/skills/apify-influencer-brand-collabs | Apache-2.0 | Analysis method only (direction detection, engagement formula, URL parsing, presentation). Its scraping pipeline is described as HIGH risk, not recommended (`influencer-research.md`). |
| social-carousel | https://github.com/nexu-io/open-design/tree/main/design-templates/social-carousel | Apache-2.0 | Series-continuity and consistent-token design ideas (`carousels.md`). Template not copied. |
| instagram-post | https://github.com/publora/skills/tree/main/skills/instagram-post | MIT | Publora MCP/REST flow, API media limits, troubleshooting (`graph-api-publishing.md`, `carousels.md`) |
| instagram-scraper | https://github.com/gooseworks-ai/goose-skills/tree/main/skills/social/capabilities/instagram-scraper | MIT | Named only, as an example of a HIGH-risk scraping option. No content or code copied. |
| canva-skills (resize-for-social-media, edit-design, bulk-create) | https://github.com/canva-sdks/canva-skills | Apache-2.0 | Canva MCP tool names, MCP server URL and plugin install commands (`carousels.md`). Nothing copied. |

## Official docs (link-only references, written in our own words)

| Tool | Docs | Used for |
|---|---|---|
| Meta Business Suite | https://www.facebook.com/business/help/942827662903020, https://www.facebook.com/business/help/609176706604372, https://www.facebook.com/business/help/1170295510042639 | Desktop and mobile scheduling steps, Planner (`graph-api-publishing.md`) |
| Buffer | https://developers.buffer.com/guides/integrations/mcp.html, https://developers.buffer.com/guides/authentication.html, https://developers.buffer.com/guides/your-first-post.html, https://developers.buffer.com/guides/posts-and-scheduling.html, https://developers.buffer.com/guides/api-limits.html, https://developers.buffer.com/reference.html, https://support.buffer.com/en-us/articles/scheduling-instagram-posts-reels-stories-and-notifications-3XA98S9Q5p | MCP and GraphQL API, Instagram fields, rate limits, Instagram publishing rules (`graph-api-publishing.md`, `analytics.md`) |
| Metricool | https://metricool.com/metricool-mcp-claude/, https://help.metricool.com/faqs-about-the-metricool-mcp-1i3w0, https://pypi.org/project/mcp-metricool/, https://help.metricool.com/schedule-and-post-on-instagram-6b6q5, https://metricool.com/pricing/ | Connector setup, tools, plan limits, Instagram auto-publish rules (`graph-api-publishing.md`, `analytics.md`) |
| ManyChat | https://help.manychat.com/hc/en-us/articles/14281316989724-Instagram-Post-and-Reel-Comments-trigger, https://help.manychat.com/hc/en-us/articles/14281290924444-How-to-connect-Instagram-to-Manychat, https://help.manychat.com/hc/en-us/articles/14281308423452-Instagram-automation-troubleshooting, https://help.manychat.com/hc/en-us/articles/25800197498652-Free-plan | Comment trigger, private reply, connection, limits, Free plan (`dms-and-comments.md`) |
| Canva Connect API | https://www.canva.dev/docs/connect/api-reference/exports/create-design-export-job/, https://www.canva.dev/docs/connect/api-reference/exports/get-design-export-job/, https://claude.com/connectors/canva | Export endpoint, fields, limits, URL expiry; connector tools (`carousels.md`) |
| Claude Code MCP | https://code.claude.com/docs/en/mcp | `claude mcp add` scopes and `claude mcp login` / `/mcp` OAuth sign-in (`graph-api-publishing.md`) |
| Hootsuite | https://www.hootsuite.com/integrations/mcp, https://blog.hootsuite.com/post-on-social-media-from-claude/, https://help.hootsuite.com/hc/en-us/articles/1260804249750-Create-an-Instagram-post-story-or-reel, https://developer.hootsuite.com/docs/using-rest-apis, https://developer.hootsuite.com/docs/message-scheduling, https://developer.hootsuite.com/docs/uploading-media | Perch and Nest MCP servers and connector setup, Instagram direct vs notification publishing and limits, REST scheduling and media upload (`graph-api-publishing.md`, `analytics.md`, `dms-and-comments.md`) |
| Sprout Social | https://api.sproutsocial.com/docs/, https://api.sproutsocial.com/docs/changelog/ | Auth, metadata, media upload, draft-only publishing, Instagram limits, analytics and messages endpoints, rate limits, Instagram metric changes (`graph-api-publishing.md`, `analytics.md`, `dms-and-comments.md`) |
| Later | https://later.com/instagram-scheduler/auto-post/, https://later.com/instagram-scheduler/schedule-instagram-reels/ | Auto publishing scope, notification publishing for Stories, Reel scheduling steps (`graph-api-publishing.md`) |
| Linktree | https://linktr.ee/link-in-bio/instagram, https://linktr.ee/help/en/articles/5434089-how-to-add-your-linktree-url-to-your-instagram-bio, https://linktr.ee/help/en/articles/5434178-understanding-your-insights, https://linktr.ee/help/en/articles/5707122-download-a-csv-of-your-insights-activity, https://linktr.ee/help/en/articles/9758234-use-instagram-auto-reply-to-automatically-share-links-with-your-audience | Adding the link to Instagram, Story link sticker, Insights by plan, CSV export, Instagram auto-reply setup and DM caps (`content-strategy.md`, `analytics.md`, `dms-and-comments.md`) |

## Also see (not included)

These have no license, so they are linked only and nothing was copied or paraphrased:

- instagram (moboutrig/instagram-claude-skill): https://github.com/moboutrig/instagram-claude-skill
- social-media-carousel (inference-sh/skills): https://github.com/inference-sh/skills/tree/main/guides/social/social-media-carousel
