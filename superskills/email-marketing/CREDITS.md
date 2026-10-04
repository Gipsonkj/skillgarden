# Credits

The router and references are written in this skill's own words from the licensed sources below plus general knowledge of email standards (SPF, DKIM, DMARC, RFC 8058). MJML templates are copied unchanged with their licence beside them. No source script was copied.

## Sources used

| Source | Repo | Licence | What was used |
|---|---|---|---|
| emails | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/main/skills/emails) | MIT | Sequence lengths and timing, email type catalog (billing, trial, cancellation flows), copy length and AI-tell rules (sequences-and-lifecycle.md, campaigns-subject-lines-testing.md) |
| cold-email | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/main/skills/cold-email) | MIT | Cold email length, structure, subject lines, follow-up cadence, breakup rule, benchmarks (compliance-and-cold-email.md) |
| lead-magnets | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/main/skills/lead-magnets) | MIT | Formats, effort and conversion ranges, stage fit, gating, delivery, quality signals (strategy-and-list-growth.md) |
| react-email | [resend/react-email](https://github.com/resend/react-email/tree/canary/skills/react-email) | MIT | Component rules, Tailwind and styling limits, rendering, CLI, accessibility defaults (templates-and-html.md); SendGrid send example (sending-apis.md) |
| email-sequence | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/main/marketing/skills/email-sequence) | Apache-2.0 | Branching, exit and re-entry rules, suppression of support cases, benchmarks per sequence type, launch and event templates (sequences-and-lifecycle.md) |
| email-template-builder | [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills/tree/main/engineering-team/skills/email-template-builder) | MIT | Shared layout and project structure for template systems (templates-and-html.md, transactional-email.md) |
| resend | [resend/resend-skills](https://github.com/resend/resend-skills/tree/main/skills/resend) | MIT | Resend sends, batch, idempotency, broadcasts, topics, automations, webhooks, errors, sandbox addresses, warm-up tables (sending-apis.md, deliverability.md) |
| email-best-practices | [resend/resend-skills](https://github.com/resend/resend-skills/tree/main/skills/email-best-practices) | MIT | Consent capture, double opt-in, compliance by region, deliverability, transactional catalog, sending reliability, webhooks, list hygiene (several guides) |
| cloudflare-email-service | [cloudflare/skills](https://github.com/cloudflare/skills/tree/main/skills/cloudflare-email-service) | Apache-2.0 | Setup commands, binding vs REST field names, suppression behaviour, transactional-only scope (sending-apis.md) |
| amazon-ses | [aws/agent-toolkit-for-aws](https://github.com/aws/agent-toolkit-for-aws/tree/main/skills/specialized-skills/messaging-and-streaming-skills/amazon-ses) | Apache-2.0 | SES v2 rule, domain identity and MAIL FROM records, completion gate, sandbox options, production-access consent, DMARC alignment pitfall (sending-apis.md, deliverability.md) |
| deliverability-qa | [aaron-he-zhu/aaron-marketing-skills](https://github.com/aaron-he-zhu/aaron-marketing-skills/tree/main/email/setup/deliverability-qa) | Apache-2.0 | Authentication, reputation, placement and hygiene checks (deliverability.md); its scoring protocol and memory files were left out |
| subject-line-lab | [aaron-he-zhu/aaron-marketing-skills](https://github.com/aaron-he-zhu/aaron-marketing-skills/tree/main/email/engage/subject-line-lab) | Apache-2.0 | Truncation rule, spam-pattern table, emoji rule, inbox preview check (campaigns-subject-lines-testing.md) |
| ecommerce-email-marketing-builder | [nexscope-ai/eCommerce-Skills](https://github.com/nexscope-ai/eCommerce-Skills/tree/main/ecommerce-email-marketing-builder) | MIT | Ecommerce flows, triggers, timing and branches; segment rules (sequences-and-lifecycle.md, strategy-and-list-growth.md). Its promotional links and pre-ticked opt-in advice were left out |
| email-marketing | [arnabbagxd/Brand-building-skills](https://github.com/arnabbagxd/Brand-building-skills/tree/main/skills/email-marketing) | MIT | Campaign types, platform table, subject and preview lengths, test list (campaigns-subject-lines-testing.md, esp-platforms-and-analytics.md) |
| email-marketing-bible | [CosmoBlk/email-marketing-bible](https://github.com/CosmoBlk/email-marketing-bible/tree/main) | MIT | Agent send gates and pre-send checklist, engagement tiers, flow order, metrics and thresholds, attribution, law table, AI-era deliverability, cold email limits (several guides). Its model recommendations, seed-string design method and ESP recommendation by the author's own company were left out |
| postmark | [ActiveCampaign/postmark-skills](https://github.com/ActiveCampaign/postmark-skills/tree/main) | MIT | Message streams, endpoints and limits, templates and layouts, webhook security and retries, testing tools, warm-up and thresholds, transactional design, compliance (several guides) |
| twilio-sendgrid-deliverability-advisor | [twilio/ai](https://github.com/twilio/ai/tree/main/skills/sendgrid/twilio-sendgrid-deliverability-advisor) | MIT | Provider requirements table, thresholds, diagnosis order, warm-up and deferral facts, SEQ, blocklists (deliverability.md, sending-apis.md) |
| loops-email-sending-best-practices | [loops-so/skills](https://github.com/loops-so/skills/tree/main/skills/loops-email-sending-best-practices) | MIT | Subdomain and new-sender strategy, lifecycle program design, Loops caveats, consent on import (deliverability.md, esp-platforms-and-analytics.md, strategy-and-list-growth.md) |
| klaviyo-analyst | [thatrebeccarae/claude-marketing](https://github.com/thatrebeccarae/claude-marketing/tree/main/skills/klaviyo-analyst) | MIT | MCP connection and read-only mode, Smart Sending, exclusions, timing, segments, A/B sample sizes, four-phase audit, attribution window (esp-platforms-and-analytics.md, campaigns-subject-lines-testing.md) |
| email-html-mjml | [framix-team/skill-email-html-mjml](https://github.com/framix-team/skill-email-html-mjml/tree/master/email-html-mjml) | MIT | MJML rules, compilation and gotchas, dark-mode pattern (templates-and-html.md); example templates copied to `templates/email-html-mjml/` |

Licence text: `templates/email-html-mjml/LICENSE` (MIT, Copyright (c) 2026 Framix) covers `newsletter.mjml`, `promo-sale.mjml`, `order-confirmation.mjml` and `partials/footer.mjml`, copied unchanged. They contain only placeholder URLs (`example.com`, `cdn.example.com`) and Google Fonts links; nothing in them calls any other host. `basic-layout.mjml` was not copied (structure-only demo with third-party image hosts). Apache-2.0 sources were distilled, not copied; no NOTICE file applies.

Not copied: the klaviyo-analyst Python scripts (`analyze.py`, `klaviyo_client.py`; need pip packages and a Klaviyo API key, and the official read-only MCP covers the same audit), Resend's `fetch-all-templates.mjs` (convenience only), and the aaron-marketing-skills bundle's protocol, memory and connector files.

## Also see (not included)

Link-only: no licence found or licence terms that don't allow copying. Nothing from them is copied or paraphrased here.

| Skill | Link | Why not included |
|---|---|---|
| email-best-practices (standalone repo) | https://github.com/resend/email-best-practices | No LICENSE file; the MIT copy inside resend-skills was used instead |
| mailersend-skills | https://github.com/mailersend/mailersend-skills | No licence found |
| beehiiv-newsletter-advisor | https://github.com/beehiiv/beehiiv-newsletter-advisor | No licence found |
| agentmail-skills | https://github.com/agentmail-to/agentmail-skills | No licence found |
| designing-email-templates (PostHog) | PostHog's skills repo | No licence found; PostHog workflows only |
| email-template-builder (borghei) | borghei's skills repo | MIT plus Commons Clause |

Excluded on purpose (not linked): cold-outbound tooling built on inbox rotation and warm-up networks, skills built on scraping contact data, skills that route ESP access through a third-party broker, and low-substance or install-inflated repos. See the research notes for names.
