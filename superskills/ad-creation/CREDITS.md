# Credits

All references are rewritten in our own words from the sources below. The script and template are copied unchanged, with their license beside them.

| Skill | Repo | License | What was used |
|---|---|---|---|
| ad-creative | https://github.com/coreyhaines31/marketingskills/tree/main/skills/ad-creative | MIT | Grounded-inputs corpus, angle categories, platform limits, hook system and diagnostic funnel, creative strategy loop and evidence tiers, Meta format tiers (which credit Dara Denney's public tier list), static templates, vertical video spec and creator formats, motion-video pipeline, chat-reveal ads, generative tool guide, AI-tell rules. Template `templates/ad-creative-coreyhaines/creative-review-template.html` copied as-is. |
| copywriting | https://github.com/coreyhaines31/marketingskills/tree/main/skills/copywriting | MIT | Headline formulas, "Now you can" test, CTA formula, AI-tells blacklist and caps |
| ads-create | https://github.com/AgriciDaniel/claude-ads/tree/main/skills/ads-create | MIT | Separating facts, approved claims and hypotheses; concept fields; no invented claims |
| ads-creative | https://github.com/AgriciDaniel/claude-ads/tree/main/skills/ads-creative | MIT | Creative audit inventory, fatigue from time-series only, keeping quality/compliance/performance separate |
| ad-creative | https://github.com/alirezarezvani/claude-skills/tree/main/marketing-skill/skills/ad-creative | MIT | Funnel-stage frameworks (PAS, BAB, FAB, AIDA, etc.), platform-framework fit, rejection triggers, quality checklist. Script `scripts/ad-creative-alirezarezvani/ad_copy_validator.py` copied as-is. |
| flux-3-product-ads | https://github.com/black-forest-labs/skills/tree/master/skills/flux-3-product-ads | MIT | Shot design rules, reverse-clip trick, evidence-gated copy, VO timing, deterministic assembly, QC and semantic gates |
| higgsfield-product-photoshoot | https://github.com/higgsfield-ai/skills/tree/main/higgsfield-product-photoshoot | MIT | Product-photo modes, mode selection, interview questions, CLI usage |
| meta-ads | https://github.com/boringmarketer/meta-ads-skill | MIT | Crop-safe band, native look, Advantage+ opt-out, Special Ad Categories, one-ad-set testing, launch paused |
| apify-ads-intelligence | https://github.com/apify/awesome-skills/tree/main/skills/apify-ads-intelligence | Apache-2.0 | Actor routing table, defaults, quirks for ad-library scraping |
| ad-creative-builder | https://github.com/aaron-he-zhu/aaron-marketing-skills/tree/main/ad/orchestrate/ad-creative-builder | Apache-2.0 | Angle matrix, message-match map, claim/policy pre-check, public ad library list |
| ad-library-teardown | https://github.com/scrapecreators/social-media-research-skills/tree/main/skills/ad-library-teardown | MIT | Teardown workflow, clustering, output template, ScrapeCreators endpoints |
| ugc-strategy | https://github.com/arnabbagxd/brand-building-skills/tree/main/skills/ugc-strategy | MIT | UGC creator brief, rates, rights and FTC disclosure, UGC ad formats |
| facebook-ads | https://github.com/openclaudia/openclaudia-skills/tree/main/skills/facebook-ads | MIT | Meta video structure, test priority and thresholds, naming convention, retargeting-ROAS caution |
| ads-copywriter | https://github.com/claude-office-skills/skills/tree/main/ads-copywriter | MIT | Cross-check of platform limits and RSA headline mix (its "#1"/"As seen in" templates were deliberately not adopted) |
| tiktok-ads | https://github.com/kostja94/marketing-skills/tree/main/skills/paid-ads/platforms/tiktok-ads | MIT | TikTok ad formats, audience, tracking and creative refresh notes |
| canva-skills (brand-check, edit-design, resize-for-social-media) | https://github.com/canva-sdks/canva-skills | Apache-2.0 | Claude Code plugin install, MCP config, brand-kit data gap, what the edit API can and can't change, commit-after-approval rule (`references/production-tools.md`) |
| adobe-for-creativity skills (adobe-create-social-variations, adobe-edit-quick-cut, adobe-resize-photos-and-videos) | https://github.com/adobe/skills/tree/main/plugins/creative-cloud/adobe-for-creativity | Apache-2.0 | MCP server URL from the plugin config, tool order for expand-then-crop, test-crop preview, reframe fallback, same-ratio video resize, soft Quick Cut duration (`references/production-tools.md`) |
| motion-creative-plugin | https://github.com/Motion-Creative/motion-creative-plugin | MIT | Plugin install commands and skill names only (`references/testing-iteration.md`) |

## Official documentation (facts only, in our own words)

No text copied; these are platform and tool facts restated in our own words (docs, link-only reference) in `references/platform-specs.md`, `references/production-tools.md`, `references/vendor-ad-library-apis.md` and `references/testing-iteration.md`.

| Source | URL | What was used |
|---|---|---|
| Google Ads Help: YouTube video ad formats | https://support.google.com/google-ads/answer/2375464 | Format lengths, skip rules, billing |
| Google Ads Help: video ad specs | https://support.google.com/google-ads/answer/13547298 | Aspect ratios, sizes, thumbnail spec |
| Google Ads Help: the ABCDs of effective video ads | https://support.google.com/google-ads/answer/14783551 | ABCD checklist, Connection first for Shorts |
| Google blog: social assets into YouTube ads (1 Oct 2026) | https://blog.google/products/ads-commerce/creating-assets-youtube-ads/ | Asset Studio repurposing; give assets time before rotating |
| Canva developers: Canva MCP server and tools | https://www.canva.dev/docs/apps/mcp/tools/ | Tool names, plan tiers, rate limits; resize, export, upload and generate behaviour |
| Canva developers: AI assistants quickstart | https://www.canva.dev/docs/apps/quickstart/ | MCP server URL |
| Claude connector directory: Canva | https://claude.com/marketplace/connectors/canva | Official connector listing and setup |
| Adobe for creativity: overview, getting started, FAQ | https://developer.adobe.com/adobe-for-creativity/ | Apps covered, setup steps, guest vs signed-in tools, plan and platform limits |
| CapCut Help: importing subtitles | https://www.capcut.com/help/how-to-import-subtitles | Caption import per app and file type |
| TikTok Ads Help: about CapCut | https://ads.tiktok.com/help/article/about-capcut?lang=en | Web vs desktop upload to TikTok Ads Manager |
| TikTok for Business blog: Symphony Creative Studio | https://ads.tiktok.com/business/en-US/blog/symphony-creative-studio | Studio URL, features, AI label, export |
| TikTok Ads Help: Agentic Hub and MCP server | https://ads.tiktok.com/resources/help/article/about-tiktok-for-business-agentic-hub-and-mcp-server?lang=en | MCP URLs, tool counts, auth |
| Claude connector directory: TikTok for Business | https://claude.com/marketplace/connectors/tiktok-for-business | Official connector listing |
| Motion Help: Motion MCP | https://help.motionapp.com/en/articles/14315735-motion-mcp | MCP URL, tools, Meta-only, read-only, roles, plans, sync delay |
| Meta Ad Library API | https://www.facebook.com/ads/library/api/ | Coverage and access steps |
| Meta Graph API: ads_archive and ArchivedAd | https://developers.facebook.com/docs/graph-api/reference/ads_archive/ | Parameters, values, fields, example request, error 613 |
| Claude Code docs: MCP | https://code.claude.com/docs/en/mcp | `claude mcp add --transport http` and `/mcp` sign-in |

## Also see (not included)

Link-only (no license file in the repo), so nothing was copied or paraphrased:

- ugc (fal.ai): https://github.com/fal-ai-community/skills/tree/main/skills/ugc
- commercial (fal.ai): https://github.com/fal-ai-community/skills/tree/main/skills/commercial
- competitive-ads-extractor (ComposioHQ): https://github.com/ComposioHQ/awesome-claude-skills/tree/master/competitive-ads-extractor
- ugc-video-auto (community Higgsfield workflow): https://github.com/AKCodez/higgsfield-claude-skills/tree/master/ugc-video-auto
