# Credits

All sources are MIT licensed (license_ok = true, no NON-COMMERCIAL notes). References are distilled in our own words. Scripts and templates are copied unchanged, with the source repo's LICENSE beside them.

| Source skill | Repo | License | What was used |
|---|---|---|---|
| linkedin-marketing (bundle) | https://github.com/sergebulaev/linkedin-skills | MIT | Algorithm heuristics, voice rules, AI-tell list, comment and reply templates, filtering rules, interviewer question bank and story bank, employee-advocacy principles and governance, metrics taxonomy, benchmarks, untrusted-content rule, URN types. **Not used:** Apify scraping read layer, engager analytics, "pause 8-15 s to look human" and comment "seeding" advice, publishing scripts |
| linkedin-skills | https://github.com/alirezarezvani/claude-skills | MIT | Policy and account-safety rules, platform canon with confidence grading, operating agreement, forcing questions. **Script:** `scripts/linkedin-skills/linkedin_policy_gate.py` |
| linkedin-content | https://github.com/alirezarezvani/claude-skills | MIT | Hook and fold mechanics, formats canon, repurposing discipline, accessibility, post templates. **Script:** `scripts/linkedin-content/post_linter.py` |
| linkedin-profile | https://github.com/alirezarezvani/claude-skills | MIT | Profile architecture, headline and positioning. **Scripts:** `scripts/linkedin-profile/headline_scorer.py`, `about_section_builder.py`. **Template:** `templates/linkedin-profile/profile_worksheet.md` |
| linkedin-engagement | https://github.com/alirezarezvani/claude-skills | MIT | Comment strategy and tiers, outreach ethics and benchmarks, volume limits. **Scripts:** `scripts/linkedin-engagement/outreach_volume_guard.py`, `outreach_message_builder.py`. **Template:** `templates/linkedin-engagement/outreach_worksheet.md` |
| post-writer | https://github.com/charlie947/social-media-skills | MIT | Draft workflow, plan before writing, code-block hand-over |
| voice-builder | https://github.com/charlie947/social-media-skills | MIT | Interview batches, sample analysis, absence signals, voice.md structure |
| gemini-carousel | https://github.com/charlie947/social-media-skills | MIT | Slide brief, approval gate, per-slide prompt structure, 1080x1350 spec |
| hook-generator | https://github.com/charlie947/social-media-skills | MIT | Hook angle set, character-count discipline |
| linkedin-content-writer | https://github.com/microsoft/cat-agent-skills | MIT | Source boundary, grounding and certainty rules, preference order, conversation-scoped profile |
| connections-optimizer | https://github.com/affaan-m/ECC | MIT | Review-first network clean-up defaults only (its browser-control LinkedIn access is left out) |
| lead-intelligence | https://github.com/affaan-m/ECC | MIT | Signal-scoring weights, warm-path types, outreach-drafter writing rules, untrusted-content rules. **Not used:** `LINKEDIN_COOKIE` / browser-use LinkedIn profile access |
| li-post | https://github.com/Jakeschincariol/linkedin-agent-skill | MIT | Post shape, hook formula ideas and traps, never-publish default |
| linkedin-automation | https://github.com/sickn33/agentic-awesome-skills | MIT | Composio / Rube MCP official-API workflow, URN and image-upload pitfalls |
| linkedin-post-writer | https://github.com/sickn33/agentic-awesome-skills (vendored from sergebulaev/linkedin-skills) | MIT | Goal-first formula selection, formula skeleton ideas, AI-tell scrub |
| linkedin-profile-optimizer | https://github.com/paramchoudhary/resumeskills | MIT | Section checklist, resume vs LinkedIn sync, output format |
| linkedin-outreach | https://github.com/gooseworks-ai/goose-skills | MIT | Character caps, message-type writing guidance, signal types. **Not used:** CSV export for Dripify/Botdog/Expandi/PhantomBuster, multi-step drip sequences |
| linkedin-posts | https://github.com/kostja94/marketing-skills | MIT | Post types, SEO/GEO visibility of profile vs feed, image specs |
| linkedin-ghostwriting | https://github.com/samber/cc-skills | MIT | Interview checklist, hook frameworks, ABT body structure. **Overridden:** its "use Unicode bold" style rule (accessibility) |
| linkedin-content | https://github.com/openclaudia/openclaudia-skills | MIT | Pillar mix idea, carousel slide format, "what kills reach" list (its "Repost this" / "DM me keyword" CTAs rejected as bait) |
| linkedin-post | https://github.com/publora/skills | MIT | API-partner scheduler pattern, platform limits, API restrictions |

Tool docs (link-only reference, written in our own words; nothing copied):

| Source | URL | Used for |
|---|---|---|
| LinkedIn Help: schedule a post | https://www.linkedin.com/help/linkedin/answer/a1347212 | Native scheduler for members (`publishing-official-api.md`) |
| LinkedIn Help: schedule a Page post | https://www.linkedin.com/help/linkedin/answer/a1419179 | Native scheduler for pages |
| LinkedIn Help: download your account data | https://www.linkedin.com/help/linkedin/answer/a566336 | Data archive steps and limits (`analytics.md`) |
| LinkedIn Help: creator analytics | https://www.linkedin.com/help/linkedin/answer/a704175 | Creator analytics export |
| LinkedIn Help: export Page analytics | https://www.linkedin.com/help/linkedin/answer/a551206 | Page analytics export |
| LinkedIn Sales Navigator | https://business.linkedin.com/sales-solutions/sales-navigator | Plans and features (`lead-research.md`) |
| Sales Navigator Help (export, search limits, saved searches, saving leads) | https://www.linkedin.com/help/sales-navigator/answer/a102031 , https://www.linkedin.com/help/sales-navigator/answer/a106030 , https://www.linkedin.com/help/sales-navigator/answer/a102024 , https://www.linkedin.com/help/sales-navigator/answer/a101025 | Limits and the no-export rule |
| Buffer developer docs (MCP, API, limits, media, character limits) and pricing | https://developers.buffer.com/guides/integrations/mcp.html , https://developers.buffer.com/reference.html , https://buffer.com/pricing | Buffer section |
| Hootsuite developer docs (Perch MCP, scheduling messages, rate limits) | https://developer.hootsuite.com/docs/perch-mcp-server , https://developer.hootsuite.com/docs/message-scheduling , https://developer.hootsuite.com/docs/api-rate-limits | Hootsuite section |
| Canva MCP docs (access, tools and rate limits, export, resize) | https://www.canva.dev/docs/apps/mcp/ , https://www.canva.dev/docs/apps/mcp/access/ , https://www.canva.dev/docs/apps/mcp/tools/ | Canva section (`carousels-documents.md`) |
| Claude Code MCP docs | https://code.claude.com/docs/en/mcp | `claude mcp add` and `/mcp` sign-in commands |

Read but not used: **linkedin-post-writer** (https://github.com/TaplioOfficial/taplio-linkedin-claude-skills, MIT). It requires the Taplio MCP, tells the agent to "STOP ... do not produce any output" without it, and tells the agent to rewrite an affiliate/UTM signup link. Nothing from it was copied.

## Also see (not included)

- LinkedIn User Agreement: https://www.linkedin.com/legal/user-agreement
- LinkedIn Professional Community Policies: https://www.linkedin.com/legal/professional-community-policies
- LinkedIn Help, Prohibited software and extensions: https://www.linkedin.com/help/linkedin/answer/a1341387
- LinkedIn Posts API docs: https://learn.microsoft.com/linkedin/marketing/community-management/shares/posts-api
- Full sergebulaev/linkedin-skills bundle (Publora publishing layer): https://github.com/sergebulaev/linkedin-skills
