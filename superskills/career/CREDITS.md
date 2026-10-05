# Credits

The router and references are written in this skill's own words from the licensed sources below plus general hiring and interviewing practice. Nothing was copied from the Lenny skills' quoted newsletter text or benchmark figures. The one script and one template are copied unchanged with their licence beside them.

## Sources used

| Source | Repo | Licence | What was used |
|---|---|---|---|
| interview-coach | [noamseg/interview-coach-skill](https://github.com/noamseg/interview-coach-skill/tree/main) | MIT | Story bank, 5-dimension rubric, gap handling, prep pack, mock protocol, concerns, debrief, pitch, decode, salary and thank-you commands (interview-prep.md, technical-interviews.md, negotiation-and-offers.md, career-change.md, job-search-and-outreach.md) |
| job-application-assistant | [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search/tree/master/.claude/skills/job-application-assistant) | MIT | CV, cover-letter, writing-style, job-evaluation, application-forms, interview and LaTeX guides (resume-writing.md, tailoring-and-ats.md, cover-letters.md, job-search-and-outreach.md, resume-tools.md). Application-assistant content only |
| career-ops | [career-ops-hq/career-ops](https://github.com/career-ops-hq/career-ops/tree/main/.claude/skills/career-ops) | MIT | Mode overview, evaluation and tracker ideas, offer and interview modes as described in its router (resume-tools.md, job-search-and-outreach.md). Its portal scanning is only mentioned, with site terms stated |
| resume-builder | [reactive-resume/reactive-resume](https://github.com/reactive-resume/reactive-resume/tree/main/skills/resume-builder) | MIT | Reactive Resume JSON rules and application-tracking tools (resume-tools.md); schema copied to `templates/resume-builder/schema.md` |
| interview-system-designer | [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills/tree/main/engineering/skills/interview-system-designer) | MIT | `interview_planner.py` copied to `scripts/interview-system-designer/`; competency matrices, bias checklist and debrief method (hiring.md, technical-interviews.md) |
| job-post-builder | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/main/small-business/skills/job-post-builder) | Apache-2.0 | Intake, job post structure, interview guide and scorecard templates (hiring.md) |
| performance-review | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins/tree/main/human-resources/skills/performance-review) | Apache-2.0 | Self-review template, manager review and calibration notes (career-growth.md, hiring.md) |
| brag-sheet | [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main/skills/brag-sheet) | MIT | Action, result, evidence format, evidence ladder, backfill from git and PRs (career-growth.md, resume-writing.md) |
| review-resume | [phuryn/pm-skills](https://github.com/phuryn/pm-skills/tree/main/pm-toolkit/skills/review-resume) | MIT | Review criteria, bullet patterns, career-changer advice (resume-writing.md, tailoring-and-ats.md, career-change.md) |
| resume-tailor | [Paramchoudhary/ResumeSkills](https://github.com/Paramchoudhary/ResumeSkills/tree/main/skills/resume-tailor) | MIT | Job description analysis and tailoring steps (tailoring-and-ats.md) |
| resume-ats-optimizer | [Paramchoudhary/ResumeSkills](https://github.com/Paramchoudhary/ResumeSkills/tree/main/skills/resume-ats-optimizer) | MIT | ATS formatting rules (tailoring-and-ats.md); its "years only for gaps" advice was not used |
| career-changer-translator | [Paramchoudhary/ResumeSkills](https://github.com/Paramchoudhary/ResumeSkills/tree/main/skills/career-changer-translator) | MIT | Landing spots, transferable skills, translation tables (career-change.md, cover-letters.md) |
| resume-cover-letter | [jezweb/claude-skills](https://github.com/jezweb/claude-skills/tree/main/plugins/writing/skills/resume-cover-letter) | MIT | Resume and cover-letter structure, special circumstances (resume-writing.md, cover-letters.md, career-change.md, tailoring-and-ats.md) |
| job-search-strategist | [proyecto26/TheJobInterviewGuide](https://github.com/proyecto26/TheJobInterviewGuide/tree/main/.claude/skills/job-search-strategist) | MIT | Search phases, targeting, networking templates, skill-gap planning (job-search-and-outreach.md, cover-letters.md, career-change.md) |
| offer-toolkit-skill | [yanliudesign/offer-toolkit-skill](https://github.com/yanliudesign/offer-toolkit-skill/tree/main) | MIT | Behavioural-question, salary-negotiation and offer-comparison frameworks (interview-prep.md, negotiation-and-offers.md) |
| negotiating-compensation | [RefoundAI/lenny-skills](https://github.com/RefoundAI/lenny-skills/tree/main/skills/negotiating-compensation) | MIT | Negotiation principles and levers, paraphrased; no quotes or pay figures copied (negotiation-and-offers.md) |
| building-a-promotion-case | [RefoundAI/lenny-skills](https://github.com/RefoundAI/lenny-skills/tree/main/skills/building-a-promotion-case) | MIT | Promotion steps, gap action plan and packet idea, paraphrased; no quotes copied (career-growth.md) |
| leetcode-teacher | [jamesrochabrun/skills](https://github.com/jamesrochabrun/skills/tree/main/skills/leetcode-teacher) | MIT | Pattern map and practice levels (technical-interviews.md) |

Licence texts: `scripts/interview-system-designer/LICENSE` (MIT, Copyright (c) 2025 Alireza Rezvani) and `templates/resume-builder/LICENSE` (MIT, Copyright (c) 2026 Amruth Pillai). Apache-2.0 sources were distilled, not copied; no NOTICE file applies.

## Official docs (tool sections)

Docs, link-only reference, written in our own words. No third-party skill was used for these sections.

| Source | Used in |
|---|---|
| [Indeed MCP server docs](https://docs.indeed.com/mcp) and [Claude's Indeed connector listing](https://claude.com/connectors/indeed) | job-search-and-outreach.md section 10, negotiation-and-offers.md section 1 |
| [Claude's ZipRecruiter connector listing](https://claude.com/marketplace/connectors/ziprecruiter) and [ZipRecruiter's announcement](https://ziprecruiter-investors.com/news/news-details/2026/ZipRecruiter-Expands-AI-Powered-Job-Search-with-Claude-Integration/default.aspx) | job-search-and-outreach.md section 10 |
| [Use Google Workspace connectors (Claude Help Center)](https://support.claude.com/en/articles/10166901-use-google-workspace-connectors), [Google Workspace MCP servers](https://developers.google.com/workspace/guides/configure-mcp-servers), [Google Docs: download a file](https://support.google.com/docs/answer/49114) | job-search-and-outreach.md section 11 |
| [Greenhouse Job Board API](https://docs.greenhouse.io/job-board.html) and [Greenhouse job board URL](https://support.greenhouse.io/hc/en-us/articles/360020776251-Job-board-URL-for-Greenhouse-hosted-job-board) | tailoring-and-ats.md section 8 |
| [Lever Postings API](https://github.com/lever/postings-api) | tailoring-and-ats.md section 8 |
| [Ashby job posting API](https://developers.ashbyhq.com/docs/public-job-posting-api) | tailoring-and-ats.md section 8 |
| [Levels.fyi API and MCP access](https://www.levels.fyi/api-access/) | negotiation-and-offers.md section 1 |

## Also see (not included)

| Source | Why not included |
|---|---|
| [rendercv](https://github.com/rendercv/rendercv-skill/tree/main/skills/rendercv) | No licence on the skill repo; resume-tools.md only names the tool and points to its own docs |
| [job-application-agent](https://github.com/vaibhavarora14/job-application-agent/tree/main/skills/job-application-agent) | Link-only: it automates job sites and submits applications, against site terms |
| offer-toolkit-skill job-hunt part | Searches LinkedIn and job boards for the user; only the interview, negotiation and offer frameworks were used |
| ai-job-search scrapers and its web-research fetch fallback | Job-board and LinkedIn search scripts and a retry that spoofs a browser user agent; dropped under the security and platform rules |
| interview-coach `.claude/settings.json` | Pre-grants tool permissions; not copied |
| leetcode-teacher scripts | Problem generators that output pages loading third-party CDN assets; not needed, not copied |
| interview-system-designer `loop_designer.py`, `question_bank_generator.py`, `hiring_calibrator.py` | Larger scripts with overlapping output; linked under Go deeper instead |
| Indeed and Glassdoor scraping or browser adapters (inspizzz/job-search indeed-search, imoonkey/openweb indeed and glassdoor) | Automated access against the sites' terms; the guides use the official Indeed connector and user-pasted figures instead |
| tinyfish-io salary-market-scanner | Sends role and company queries to a third-party agent API and scrapes boards |
| Lenny skills' quoted newsletter text and benchmark pay figures | Verbatim third-party text and fast-dating numbers; paraphrased principles only |
