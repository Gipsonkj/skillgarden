# Credits

The references in this skill are written fresh from the sources below. Scripts and templates are copied unchanged, each with its source licence beside it.

| Skill | Repo | License | What was used |
|---|---|---|---|
| auteur | [agiwhitelist/auteur](https://github.com/agiwhitelist/auteur/tree/main) | MIT | Commit sheet, banned defaults, category reflexes, house tells, motion numbers, layered hero, verification; copied `scripts/auteur/slopscan.mjs`, `scripts/auteur/shoot.mjs`, `templates/auteur/COMMIT-SHEET.md` |
| scroll-craft | [nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft/tree/main/plugins/nateherk-design/skills/scroll-craft) | MIT | Brief questions, journey beats, device kit, pacing, scrub-video encoding; ideas only (its paid asset-generation step is not included) |
| cro | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/main/skills/cro) | MIT | Conversion checklist order, page-type notes, review output format |
| seo-audit | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills/tree/main/skills/seo-audit) | MIT | Audit priority order, international SEO rules, schema-detection caveat, report format |
| seo | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills/tree/main/skills/seo) | MIT | Crawl controls, on-page rules, structured-data principles, AI crawler controls, llms.txt stance |
| core-web-vitals | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills/tree/main/skills/core-web-vitals) | MIT | Thresholds, evidence sources, LCP/INP/CLS diagnosis and fixes, speculation rules |
| web-quality-audit | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills/tree/main/skills/web-quality-audit) | MIT | Audit flow, tool routing, severity, accessibility floor, report format; copied `scripts/web-quality-audit/analyze.sh` |
| web-perf | [cloudflare/skills](https://github.com/cloudflare/skills/tree/main/skills/web-perf) | Apache-2.0 | DevTools MCP trace workflow, insight names, network checks, reporting rules |
| nextjs-on-cloudflare | [cloudflare/skills](https://github.com/cloudflare/skills/tree/main/skills/nextjs-on-cloudflare) | Apache-2.0 | vinext-first guidance for Next.js on Workers |
| vercel-react-best-practices | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) | MIT | Rule priorities: waterfalls, bundle, server, client data, re-render, rendering |
| deploy-to-vercel | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/deploy-to-vercel) | MIT | State checks and deploy decision flow (its upload script is not included) |
| vercel-optimize | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/vercel-optimize) | MIT | Metrics-first optimisation doctrine (pipeline scripts not included) |
| vercel-cli | [vercel/vercel](https://github.com/vercel/vercel/tree/main/skills/vercel-cli) | Apache-2.0 | Linking rules, CLI anti-patterns, env vars, logs, build-failure ladder |
| next-dev-loop | [vercel/next.js](https://github.com/vercel/next.js/tree/canary/skills/next-dev-loop) | MIT | `/_next/mcp` + agent-browser runtime verification loop |
| next-cache-components-adoption | [vercel/next.js](https://github.com/vercel/next.js/tree/canary/skills/next-cache-components-adoption) | MIT | Cache Components prerequisites, blocker classes, codemod and per-feature loop |
| nextjs-app-router-patterns | [wshobson/agents](https://github.com/wshobson/agents/tree/main/plugins/frontend-mobile-development/skills/nextjs-app-router-patterns) | MIT | Rendering modes table, file conventions, classic caching API |
| netlify-deploy | [netlify/context-and-tools](https://github.com/netlify/context-and-tools/tree/main/skills/netlify-deploy) | MIT | Deploy paths, netlify.toml contexts, secrets scanning, fix-forward rule |
| netlify-frameworks | [netlify/context-and-tools](https://github.com/netlify/context-and-tools/tree/main/skills/netlify-frameworks) | MIT | Build-time env rules, client prefixes, SPA catch-all footgun, framework build table |
| astro | [astrolicious/agent-skills](https://github.com/astrolicious/agent-skills/tree/main/skills/astro) | MIT | CLI, project structure, adapter deploy flow |
| vue-best-practices | [vuejs-ai/skills](https://github.com/vuejs-ai/skills/tree/main/skills/vue-best-practices) | MIT | Composition API defaults, split triggers, reactivity, SFC and data-flow rules |
| web-artifacts-builder | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/web-artifacts-builder) | Apache-2.0 | Single-file React deliverable approach and anti-slop defaults (init/bundle scripts not included) |
| webapp-testing | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) | Apache-2.0 | Reconnaissance-then-action Playwright pattern; copied `scripts/webapp-testing/with_server.py` |
| audit-website | [squirrelscan/skills](https://github.com/squirrelscan/skills/tree/main/skills/audit-website) | MIT | squirrelscan crawl modes, fix loop, score targets |
| cinematic-demo-sites | [Gipsonkj/skillgarden](https://github.com/Gipsonkj/skillgarden/tree/main/authored/cinematic-demo-sites) | MIT | Still → i2v → frame-sequence hero pipeline, still and Wan motion formulas, Wan call parameters and timeout/queue fixes, shot-not-generated still direction, identity and era rules, concat/xfade trap, hero and booking rules, Cloudflare Pages headless deploy (motion-and-scroll, deploy-netlify-cloudflare). Its "free" self-hosted endpoint is described as billed per GPU second; its showcase-page step and copy-protection deterrents were left out. |
| web-design-asset-stack | [Gipsonkj/skillgarden](https://github.com/Gipsonkj/skillgarden/tree/main/authored/web-design-asset-stack) | MIT | Four symptom-to-move composition fixes, pairing law, composition levers, studied site mechanisms (design-direction); library verdicts incl. Lenis caveats, free GSAP plugins, Vanta replacement, component-shop caution (stacks-astro-vue-static, motion-and-scroll) |

## Also see (not included)

- `next-partial-prefetching-adoption` and `next-cache-components-optimizer` in [vercel/next.js skills](https://github.com/vercel/next.js/tree/canary/skills): follow-ups after Cache Components adoption.
- [cloudflare/vinext agent skills](https://github.com/cloudflare/vinext/tree/main/.agents/skills): `migrate-to-vinext` for moving Next.js apps to Workers.
- The no-auth claimable deploy script in [deploy-to-vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/deploy-to-vercel): not bundled because it uploads the project to a Vercel endpoint and has no licence file beside it in the local copy.
- Full rule files (70 rules with code) in [vercel-labs/agent-skills react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices).
- The `squirrelscan` companion skill in [squirrelscan/skills](https://github.com/squirrelscan/skills) for CLI setup and published reports.
