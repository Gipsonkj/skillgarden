# Credits

This super skill distills the sources below into new text. Nothing was copied verbatim except the files listed under "Copied as-is", which keep their original license file beside them. All sources are license_ok and carry no non-commercial restriction.

## Sources used

| Skill | Repo | License | What was used |
|---|---|---|---|
| humanizer | https://github.com/blader/humanizer | MIT | Pattern families, strongest-first catalog, draft/audit/final loop, modes, do-not-flag and preserve lists (humanize-ai-writing.md) |
| copywriting | https://github.com/coreyhaines31/marketingskills/tree/main/skills/copywriting | MIT | Intake, principles, page spine, headline formulas, CTA formula, "Now you can" test, Human Action Model, perception gap, AI-tells blacklist and self-check (conversion-copy.md, humanize-ai-writing.md) |
| copy-editing | https://github.com/coreyhaines31/marketingskills/tree/main/skills/copy-editing | MIT | Seven sweeps, expert panel scoring, quick-pass checks, plain-English swaps, content refresh matrix and cadence (copy-editing.md) |
| content-strategy | https://github.com/coreyhaines31/marketingskills/tree/main/skills/content-strategy | MIT | Searchable vs shareable, pillars and clusters, keyword stages, ideation sources, weighted scoring, 60/30/10 split, link-earning formats, distribution and ORB, platform half-lives (content-strategy.md, repurposing.md) |
| writing-shape | https://github.com/mattpocock/skills/tree/main/skills/in-progress/writing-shape | MIT | Shape loop, grounding, openings, form arguments, gap handling (writing-from-raw-material.md) |
| writing-fragments | https://github.com/mattpocock/skills/tree/main/skills/in-progress/writing-fragments | MIT | Fragment definition, leading word, file format and rhythm (writing-from-raw-material.md) |
| article-writing | https://github.com/affaan-m/ECC/tree/main/skills/article-writing | MIT | Core long-form rules, structure by type, quality gate (long-form-articles.md, newsletters.md) |
| brand-voice | https://github.com/affaan-m/ECC/tree/main/skills/brand-voice | MIT | Source priority, extraction list, VOICE PROFILE schema, persistence rules (brand-voice.md) |
| content-engine | https://github.com/affaan-m/ECC/tree/main/skills/content-engine | MIT | Repurposing flow, platform adaptation rules, quality gate (repurposing.md) |
| content-creation | https://github.com/anthropics/knowledge-work-plugins/tree/main/marketing/skills/content-creation | Apache-2.0 | Blog, email, landing, press release and case study structures, on-page SEO checklist, CTA placement (conversion-copy.md, long-form-articles.md, newsletters.md, content-strategy.md) |
| writing-dna-skill | https://github.com/larashero3-dotcom/writing-dna-skill | MIT | Six-layer distillation, metadata fields, pre-writing reading protocol, conflict priority (brand-voice.md §4). English docs only; promotional links omitted |
| brand-voice-enforcement | https://github.com/anthropics/knowledge-work-plugins/tree/main/partner-built/brand-voice/skills/brand-voice-enforcement | Apache-2.0 | Guideline loading order, voice-constant/tone-flex model, tone-by-context matrix, conflict handling (brand-voice.md §5) |
| avoid-ai-writing | https://github.com/wshobson/agents/tree/main/plugins/avoid-ai-writing/skills/avoid-ai-writing | MIT | Modes, context profiles, vocabulary tiers, rebuild threshold, no-new-accent guardrails, detection caveats (humanize-ai-writing.md) |
| content-production | https://github.com/alirezarezvani/claude-skills/tree/main/marketing-skill/skills/content-production | MIT | Three modes, brief guide, templates by intent, optimization gates, AI-citation readiness (long-form-articles.md, content-strategy.md); scripts and brief template copied as-is |
| ai-copywriter | https://github.com/mikiarlo3/ai-copywriter/tree/claude/humanizer-copywriting-skill-u5x4vd | MIT | Reader-feeling and simplest-explanation questions, intake, title/description/microcopy/subject rules, strategic-post outline (conversion-copy.md, long-form-articles.md) |
| sepia | https://github.com/Nanako0129/sepia/tree/main/skills/sepia | MIT | Professional-pass checklist ideas, edit ratio, calibration ("aim at the band"), tech-article and release-note domain rules (humanize-ai-writing.md, long-form-articles.md, copy-editing.md) |
| substack-ghostwriting | https://github.com/samber/cc-skills/tree/main/skills/substack-ghostwriting | MIT | Mode detection, intake and title/hook gate, email vs web formatting, Substack growth notes, voice-matching pipeline (newsletters.md, brand-voice.md §2) |
| copywriting-tone-of-voice-creator | https://github.com/samber/cc-skills/tree/main/skills/copywriting-tone-of-voice-creator | MIT | Voice vs tone, discovery batches, NN/g dimensions, "X, never Y" attributes, tone matrix, lexicon and mechanics, validation, channel porting (brand-voice.md §3); TONE template copied as-is |
| blog-writing-guide | https://github.com/getsentry/skills/tree/main/skills/blog-writing-guide | Apache-2.0 | Opening rule, reader-question structure, banned language, AI-pattern examples, title and closing rules, "would I share this?" test (long-form-articles.md); Sentry specifics generalized |
| newsletter | https://github.com/openclaudia/openclaudia-skills/tree/main/skills/newsletter | MIT | Archetypes, frequency, growth tiers, metrics table, welcome and re-engagement sequences, monetization and deliverability (newsletters.md) |
| content-repurposer-sms | https://github.com/blacktwist/social-media-skills/tree/main/skills/content-repurposer-sms | MIT | Source-to-derivative matrix, insight extraction and ranking, platform length rules, leverage ranking, anti-patterns (repurposing.md) |

## Tool docs (publishing-tools.md, copy-editing.md, content-strategy.md)

Docs, link-only reference, written in our own words; nothing copied.

| Source | URL | Used for |
|---|---|---|
| WordPress REST API handbook (posts, media, categories, tags, authentication, pagination, global parameters, modifying responses) | https://developer.wordpress.org/rest-api/ | WordPress draft, media, terms and scheduling flow |
| WordPress post statuses | https://wordpress.org/documentation/article/post-status/ | Meaning of `future` and the other statuses |
| WP-CLI `wp post create` | https://developer.wordpress.org/cli/commands/post/create/ | WP-CLI route |
| WordPress MCP Adapter | https://github.com/WordPress/mcp-adapter | What the adapter exposes (GPL-2.0-or-later; facts only, no text used) |
| Yoast REST API | https://developer.yoast.com/customization/apis/rest-api/ | Read-only SEO fields |
| HubSpot blog posts, tags, blog settings, Files API, private apps, usage limits, MCP | https://developers.hubspot.com/docs/api-reference/cms-posts-v3/guide | HubSpot draft, schedule and push-live flow |
| Google Drive API (uploads and conversion, folders, comments, fields) | https://developers.google.com/workspace/drive/api/guides/manage-uploads | Markdown to Google Doc, reading comments |
| Google Workspace CLI README and gws skills | https://github.com/googleworkspace/cli | `gws` commands (Apache-2.0; commands only) |
| Notion API (create page, query data source, authorization, request limits) and Notion MCP | https://developers.notion.com/ | Notion page and calendar routes |
| Grammarly developer docs (Writing Score, AI Detection, OAuth credentials, first request) | https://developer.grammarly.com/ | Grammarly checker flow |

Not used: makenotion/skills `notion-cli` (MIT), because its installer pipes a download into a shell; WordPress/agent-skills (GPL), link only.

## Copied as-is

| File | From | License file beside it |
|---|---|---|
| scripts/content-production/content_quality_gates.py, content_scorer.py, seo_optimizer.py | alirezarezvani/claude-skills (content-production) | scripts/content-production/LICENSE.source-repo (MIT) |
| templates/content-production/content-brief-template.md | alirezarezvani/claude-skills (content-production) | templates/content-production/LICENSE.source-repo (MIT) |
| templates/copywriting-tone-of-voice-creator/TONE-template.md | samber/cc-skills (copywriting-tone-of-voice-creator) | templates/copywriting-tone-of-voice-creator/LICENSE.source-repo (MIT) |

## Also see (not included)

| Skill | URL | Why not included |
|---|---|---|
| content-research-writer | https://github.com/ComposioHQ/awesome-claude-skills/tree/master/content-research-writer | Repo has no license file; link only, nothing copied or paraphrased |
| humanizer-zh | https://github.com/op7418/humanizer-zh | MIT, but Chinese-only rules; use it for Chinese text |
| lieflat-less-ai-tone | https://github.com/larashero3-dotcom/lieflat-less-ai-tone | Companion to writing-dna-skill (MIT); its rules are written in Chinese and target Chinese prose |
| social-media super skill | (SkillGarden: superskills/social-media) | Posting, scheduling, platform strategy and analytics live there |
