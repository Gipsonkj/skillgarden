# Credits

This skill is distilled from the open-source skills below. Reference files are rewritten in our own words; the only file copied as-is is `scripts/social-media-manager/social_calendar_generator.py` (MIT, license copied beside it).

| Skill | Repo | License | What was used |
|---|---|---|---|
| social | https://github.com/coreyhaines31/marketingskills/tree/main/skills/social | MIT | Pillars, hooks, AI-tells list, repurposing maps, X ranking notes, platform limits, carousel frameworks, short-form video structures, listening rubric and curl recipes, reverse-engineering method |
| influencer-marketing | https://github.com/coreyhaines31/marketingskills/tree/main/skills/influencer-marketing | MIT | Creator models, tiers, vetting, deal terms, rate anchors, FTC disclosure, brief, attribution, compliant UGC creator program, ambassador design |
| last30days | https://github.com/mvanhorn/last30days-skill | MIT | Trend-research method only (query classification, keyword-trap reframes, source weighting, honest partial coverage); no code copied |
| xurl | https://github.com/openclaw/openclaw/tree/main/skills/xurl | MIT | xurl CLI commands and error handling |
| crosspost | https://github.com/affaan-m/ECC/tree/main/skills/crosspost | MIT | Crossposting rules, per-platform adaptation, banned phrases, untrusted-source rules |
| x-api | https://github.com/affaan-m/ECC/tree/main/skills/x-api | MIT | X API v2 auth modes, thread posting pattern, rate-limit headers, untrusted timeline rules |
| social-publisher | https://github.com/affaan-m/ECC/tree/main/skills/social-publisher | MIT | SocialClaw CLI flow (validate, apply, status) |
| social-media-content-calendar | https://github.com/NousResearch/hermes-agent/tree/main/optional-skills/creative/social-media-content-calendar | MIT | Campaign constraints, claim inventory, post states, handoff vs published |
| social-media-manager | https://github.com/alirezarezvani/claude-skills/tree/main/marketing-skill/skills/social-media-manager | MIT | Platform selection, pillar mix, audit checklist, response framework, engagement targets; calendar generator script (copied) |
| x-twitter-growth | https://github.com/alirezarezvani/claude-skills/tree/main/marketing-skill/skills/x-twitter-growth | MIT | X profile audit, cadence by account size, growth phases, thread rules |
| contagious | https://github.com/wondelai/skills/tree/main/contagious | MIT | STEPPS shareability check (framework from Jonah Berger, "Contagious") |
| x-marketing | https://github.com/sergebulaev/x-skills | MIT | X voice rules, hook shapes, thread length, character counting, Publora notes |
| social-content-engine | https://github.com/anthropics/knowledge-work-plugins/tree/main/small-business/skills/social-content-engine | Apache-2.0 | Standing calendar, cadence by team size, small-business theme mix, asset repurposing matrix, HubSpot staging and CSV fallback |
| tiktok-automation | https://github.com/sickn33/agentic-awesome-skills/tree/main/skills/tiktok-automation | MIT | Composio TikTok tool flow and pitfalls |
| youtube-automation | https://github.com/sickn33/agentic-awesome-skills/tree/main/skills/youtube-automation | MIT | Composio YouTube tool flow, quota and id pitfalls |
| thread-writer-sms | https://github.com/blacktwist/social-media-skills/tree/main/skills/thread-writer-sms | MIT | Thread formats and architecture, multi-part series per platform |
| higgsfield-youtube-thumbnail | https://github.com/higgsfield-ai/skills/tree/main/higgsfield-youtube-thumbnail | MIT | Thumbnail concept frameworks and checks (vendor commands not included) |
| youtube-seo | https://github.com/kostja94/marketing-skills/tree/main/skills/platforms/youtube | MIT | Title, description, tag and thumbnail rules |
| baoyu-post-to-x | https://github.com/jimliu/baoyu-skills/tree/main/skills/baoyu-post-to-x | MIT | Mentioned only as a risky route (browser automation of x.com); nothing copied |
| agent-reach | https://github.com/Panniantong/Agent-Reach | MIT | Mentioned only as a risky route (cookie-based access); nothing copied |

## Official tool docs (docs, link-only reference, written in our own words)

| Tool | Docs | Used in |
|---|---|---|
| Buffer (MCP, GraphQL API, limits, plans) | https://developers.buffer.com/guides/integrations/claude.html, https://developers.buffer.com/guides/your-first-post.html, https://developers.buffer.com/guides/posts-and-scheduling.html, https://developers.buffer.com/guides/api-limits.html, https://buffer.com/pricing | publishing-apis.md |
| Hootsuite (MCP servers, REST API) | https://blog.hootsuite.com/post-on-social-media-from-claude/, https://developer.hootsuite.com/docs/perch-mcp-server.md, https://developer.hootsuite.com/reference/schedulemessage-1.md, https://developer.hootsuite.com/docs/api-rate-limits.md | publishing-apis.md, listening-research.md |
| Sprout Social API | https://api.sproutsocial.com/docs/, https://sproutsocial.com/pricing/ | publishing-apis.md, listening-research.md |
| Facebook Pages API | https://developers.facebook.com/docs/pages-api/posts | publishing-apis.md |
| Threads API | https://developers.facebook.com/docs/threads/posts | publishing-apis.md |
| Meta Business Suite | https://www.facebook.com/business/tools/meta-business-suite | publishing-apis.md |
| LinkedIn Posts API (hand-off note only) | https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api | publishing-apis.md |
| YouTube Data API v3 | https://developers.google.com/youtube/v3/docs/videos/insert, https://developers.google.com/youtube/v3/docs/videos, https://developers.google.com/youtube/v3/determine_quota_cost | publishing-apis.md |
| TikTok Content Posting API | https://developers.tiktok.com/doc/content-posting-api-get-started, https://developers.tiktok.com/doc/content-posting-api-reference-direct-post, https://developers.tiktok.com/doc/content-posting-api-reference-upload-video, https://developers.tiktok.com/doc/content-posting-api-media-transfer-guide, https://developers.tiktok.com/doc/content-sharing-guidelines | publishing-apis.md |
| Meltwater (picker row) | https://community.meltwater.com/meltwater-it-resources-375/connect-meltwater-to-claude-it-guide-11712 | listening-research.md |
| Brandwatch Consumer Research API (picker row) | https://developers.brandwatch.com/docs/authenticate.md | listening-research.md |
| Linktree (one-line note) | https://linktr.ee/marketplace/developer | analytics-growth.md |
| Postiz (picker row: self-hosting) | https://docs.postiz.com | publishing-apis.md |
| Claude Code MCP setup (`claude mcp add`) | https://code.claude.com/docs/en/mcp | publishing-apis.md |

## Also see (not included)

- **postiz** (Postiz scheduler skill, 28+ channels, self-hostable): https://github.com/gitroomhq/postiz-agent/tree/main/skills/postiz (license not asserted; link only)
- **twitter-algorithm-optimizer**: https://github.com/ComposioHQ/awesome-claude-skills/tree/master/twitter-algorithm-optimizer (repo has no license; link only)
- xAI's open-sourced X ranking code: https://github.com/xai-org/x-algorithm
- Sibling super skills: `linkedin-automation`, `instagram-automation`
