# Skill Garden: outreach targets

Researched 6 Oct 2026, read-only. Nothing was submitted, posted, opened or signed up for. Every draft below waits for the owner to review it, rewrite it in their own voice and send it from their own account.

## Labels

- **Measured**: GitHub API, curl, or the target's own page, on 6 Oct 2026.
- **Reported**: a number a third-party page states that I did not verify.
- **Unknown**: no source.

## Facts every draft may use (all checked in the repo, 6 Oct 2026)

- 38 super skills, one per craft. Each is a router `SKILL.md` plus distilled guides, `CREDITS.md` and `topic.json`.
- 1,353 ranked community sub-skills in `catalog/catalog.json`.
- 10 chains: ai-agent, campaign, course-launch, job-search, landing-page, launch-video, mvp, sales-outreach, seo-growth, store-launch.
- The planner skill `superseed` is one entry point that picks the crafts for a request and plans multi-craft work.
- A weekly scout (Saturday) only **proposes** changes. Nothing reaches a super skill until a human approves it in Review.
- Licences: non-commercial or unlicensed skills are **link-only** and never copied. Every super skill has `CREDITS.md`.
- Install: `claude plugin marketplace add Gipsonkj/skillgarden` then `claude plugin install skillgarden@skillgarden`.
- `claude plugin validate .` passes (run 6 Oct 2026).
- Public site: https://skillgarden.gipsonkj.workers.dev (landing) and `/explore/` (browse every craft and ranked sub-skill).
- **Do not advertise the MCP connector as public.** `/mcp` returns 401 without a key.

## Fix before any outreach (owner's GitHub account)

List maintainers open the repo first. As of 6 Oct 2026 (Measured):

1. **`README.md` opens "A personal tool for Gipson… not deployed anywhere".** It is stale and contradicts the public site. Rewrite the top: what it is, the install lines, the site link, the counts above.
2. **No root `LICENSE`, and GitHub detects none** (`license: null`). Several lists show the licence, and hesreallyhim's bot reports it. Decide the licence for Skill Garden's own text, e.g. MIT like `authored/LICENSE`. Then state in the README that bundled third-party scripts and templates keep their own licences (already in `CREDITS.md`).
3. **Repo description, homepage and topics are all empty.** Suggested values are in `keyword-map.md`.
4. **0 stars, 0 forks; repo created 29 Sep 2026.** Several lists gate on age or stars (noted per target). Honest early adoption matters more than any single listing.
5. **Optional, owner's call:** test `npx skills add Gipsonkj/skillgarden --list`. The vercel-labs/skills README says skills declared in `.claude-plugin/marketplace.json` are discovered. Untested here, and it runs third-party npm code, so read it first per the project's security rule.

## Targets, ordered by expected value

### 1. skills.sh, which feeds claudemarketplaces.com (passive, no account)

- **URLs:** https://skills.sh · https://claudemarketplaces.com
- **How listing works:**
  - skills.sh runs a leaderboard, apparently fed by the `npx skills add <owner/repo>` CLI. The CLI README says it sends anonymous repo and skill identifiers for public repos. There is no submission form.
  - claudemarketplaces.com's about page says crawlers "sweep skills.sh, GitHub, and the MCP registries on a schedule". The editor reviews new and borderline entries by hand. Ranking uses installs and stars, and only skills "with demonstrated search demand" are promoted to search engines.
- **Activity (Measured, from their pages):**
  - skills.sh shows an "All Time (1,588,237)" leaderboard figure. It is unclear whether that counts skills or installs, since single skills show up to 3.7M installs.
  - claudemarketplaces.com appeared in **7 of 12** craft results checked in keyword-map.md.
  - Skill Garden is on neither: `skills.sh/gipsonkj/skillgarden` and the claudemarketplaces marketplace URL both return 404.
- **Fit:** high. This is the most direct route into the craft results we are absent from.
- **Action, no draft needed:** after the README fix, add a second install line to the README and site: `npx skills add Gipsonkj/skillgarden`. Installs by real users are what put it on the leaderboard. Do not inflate installs.

### 2. Anthropic plugin directory (official, plus the claude-plugins-community mirror)

- **URL:** https://claude.ai/directory/manage (also linked as clau.de/plugin-directory-submission). Docs: https://www.claude.com/docs/plugins/submit
- **How listing works:**
  - The **owner's claude.ai account** with GitHub connected submits through the developer portal: Submit new → Plugin bundle → repo URL, path and branch.
  - Then validation runs, a data-handling and compliance questionnaire, and an Anthropic security scan plus reviewer check.
  - A passing version must then be **Published** by the owner. The tracked branch is re-checked on a schedule.
  - PRs to `anthropics/claude-plugins-community` are closed automatically.
  - Only plans and roles allowed to submit can do so.
- **Activity (Measured):**
  - `anthropics/claude-plugins-official`: 37,431 stars, pushed 5 Oct 2026.
  - `anthropics/claude-plugins-community`: 4,475 stars, pushed 5 Oct 2026.
  - The official marketplace shows in every user's `/plugin` Discover tab (per the docs).
- **Fit:** high reach, with a quality and safety review that suits a licence-careful project. Expect the reviewer to look at:
  - the `Stop`/`SessionEnd` hooks: a usage log, off unless switched on, writing only to `~/.claude/skillgarden/usage/`;
  - bundled third-party scripts (e.g. `superskills/ai-agents/scripts/mcp-builder/`, `superskills/3d-modeling/scripts/openscad/`).
- **Before answering the questionnaire:** list which scripts make network calls and to which official APIs. I did not audit this. Answer only what you have verified.
- **Draft listing description:**
  > Skill Garden: 38 super skills for Claude, one per craft (SEO, video, backend, testing, design, finance and more). Each routes to short guides distilled from the best public community skills, with sources and licences credited in CREDITS.md; non-commercial sources are linked, not copied. Includes superseed, a planner that picks and combines crafts for multi-part requests, and 10 chains such as landing-page and seo-growth.

### 3. r/ClaudeAI

- **URL:** https://www.reddit.com/r/ClaudeAI
- **Rules (partly verified):**
  - Reddit blocked automated reads, so the sidebar rules could not be read. **Rule 7 ("Showcase requirements") wording is Unknown; read it before posting.**
  - Verified through mirrors of a mod post from 15 Apr 2026: project showcases on the main feed need **total karma ≥ 50**. Below that, posts are redirected to the pinned "Built with Claude: Project Showcase Megathread".
  - Flair "Built with Claude" exists (thehiveindex).
- **Activity:** about 1.2M members (Reported by thehiveindex.com; Reddit's own count not reachable).
- **Fit:** high. The audience is people who install skills.
- **Owner's account needed.** If karma is under 50, use the megathread.
- **Draft post** (flair: Built with Claude; rewrite in your own words):

  > **Title:** I turned 1,353 community Claude skills into 38 "super skills", one per craft (free plugin, sources credited)
  >
  > I kept installing skill after skill and losing track of which one was good for what. So I built Skill Garden: for each craft (SEO, video, backend & databases, testing, Figma, Google Ads… 38 in total) I ranked the public community skills, then distilled the useful parts into one super skill that routes Claude to a short guide for the task at hand.
  >
  > What's in it:
  > - 38 super skills + `superseed`, a planner that picks the crafts a request needs and plans the order when it needs several (e.g. a launch with a site, a video and ads)
  > - 10 chains (landing-page, seo-growth, mvp, job-search…)
  > - every source credited in CREDITS.md; non-commercial or unlicensed skills are linked, never copied
  > - a weekly scout that proposes updates, which I review by hand before anything changes
  >
  > How Claude helped: [say honestly which parts Claude Code did, e.g. ranking research, distilling guides, the site].
  >
  > Browse it without installing: https://skillgarden.gipsonkj.workers.dev/explore/
  > Install: `claude plugin marketplace add Gipsonkj/skillgarden` then `claude plugin install skillgarden@skillgarden`
  >
  > It's new, so I'd like to hear which crafts route badly or which good skills I've missed.

### 4. hesreallyhim/awesome-claude-code

- **URL:** https://github.com/hesreallyhim/awesome-claude-code
- **How listing works:**
  - Submit **only via the web-UI issue form** ("recommend-resource"). No PRs, and `gh` CLI submissions are not possible.
  - The resource must be **≥14 days old with ongoing commits, or have ≥100 stars**. One recommendation at a time.
  - "Resource recommendations must be created by human beings."
  - Descriptions are one line, descriptive, not a sales pitch, no emojis.
  - Best-effort review with no guarantee.
- **Activity (Measured):** 55,106 stars, pushed 5 Oct 2026, 1,215 open issues.
- **Eligibility:** first commit 29 Sep 2026, so eligible from **13 Oct 2026** (Measured from the GitHub API).
- **Fit:** high. It is a Claude Code plugin with skills.
- **Owner's account needed**, and the owner must fill in the form personally. Facts for the form (rewrite in your own words):
  - Name: Skill Garden. Link: https://github.com/Gipsonkj/skillgarden. Category: whichever the form offers for skills or plugins.
  - One-line description, for reference only: *Claude Code plugin with 38 per-craft super skills that route to guides distilled from ranked community skills, plus a planner that combines crafts; sources and licences credited, non-commercial sources linked only.*

### 5. Show HN

- **URL:** https://news.ycombinator.com/submit (rules: https://news.ycombinator.com/showhn.html)
- **Rules (Measured):**
  - The thing must be something people can try; reading material and sign-up pages don't count.
  - Remove barriers to trying it, and don't ask friends to upvote.
  - The title starts with "Show HN".
- **Comparables (Measured, HN Algolia, Show HN matching "claude skills"):**

  | Post | Points | Comments | Date |
  |---|---|---|---|
  | Godot game-building skills | 337 | 205 | Mar 2026 |
  | Chess analysis skill | 75 | 57 | 26 Sep 2026 |
  | Spec-driven development skill | 40 | 17 | May 2026 |
  | "A registry for curated, high quality Claude skills" | 9 | – | Jan 2026 |
  | "a way to find and install Claude skills" | 7 | – | Jun 2026 |
  | Video ad skills | 7 | – | Sep 2026 |

  Directory and registry posts score low. Concrete, surprising capability scores high.
- **Fit:** medium. Lead with something concrete you can try (superseed planning a multi-craft task) rather than "a directory".
- **Owner's account needed.**
- **Draft:**

  > **Title (79 chars):** Show HN: Skill Garden – 38 Claude Code super skills from 1,353 community skills
  >
  > **URL:** https://skillgarden.gipsonkj.workers.dev/explore/
  >
  > **Text:** There are thousands of public Claude skills, and most overlap or are thin. For 38 crafts I ranked what's out there (1,353 skills in total, all listed with source and licence) and distilled the useful parts into one router skill per craft, which loads a short guide only when the task needs it. A planner skill, superseed, picks the crafts a request needs and orders multi-craft work; 10 chains run common sequences (landing page, SEO growth, MVP).
  >
  > Things I'd like feedback on: whether routing beats installing many single skills in practice, and the licence handling. Non-commercial or unlicensed skills are linked, never copied; every craft has a CREDITS.md. A weekly scout proposes updates, but nothing changes without my review.
  >
  > Install: `claude plugin marketplace add Gipsonkj/skillgarden` and `claude plugin install skillgarden@skillgarden`. The site works without installing anything.

### 6. VoltAgent/awesome-agent-skills

- **URL:** https://github.com/VoltAgent/awesome-agent-skills
- **How listing works:**
  - PR adding one line at the end of the matching Community Skills subcategory: Marketing, Productivity and Collaboration, Development and Testing, Context Engineering, AI and Data, n8n Automation, or Other.
  - Description of **10 words or fewer**; author prefix required; PR title `Add skill: author/skill-name`.
  - **"Brand new skills that were just created are not accepted"**: it needs real community usage.
- **Activity (Measured):** 35,238 stars, pushed 5 Oct 2026; PRs merged on 28 Sep, 29 Sep (two), 2 Oct and 5 Oct 2026, so it is actively merging.
- **Fit:** high reach, but **wait** until there are real users and stars, or it will be declined.
- **Owner's account needed.**
- **Draft line (9 words):**
  ```markdown
  - **[Gipsonkj/skillgarden](https://github.com/Gipsonkj/skillgarden)** - 38 craft super skills distilled from ranked community skills
  ```

### 7. karanb192/awesome-claude-skills

- **URL:** https://github.com/karanb192/awesome-claude-skills
- **How listing works:**
  - PR adding a table row; descriptions ≤150 characters.
  - Requires a working `SKILL.md` with frontmatter, docs, commits in the last 6 months, open source, and no malicious code. Stars are a bonus, not a gate.
  - It has a **"Skill Collections"** table (`| Collection | Focus |`).
- **Activity (Measured):** 534 stars, pushed 2 Oct 2026, actively merging (several PRs merged 2 Oct 2026).
- **Fit:** good, with a low bar but small reach. A sensible first listing.
- **Owner's account needed.**
- **Draft row:**
  ```markdown
  | [Skill Garden](https://github.com/Gipsonkj/skillgarden) | 38 per-craft super skills distilled from 1,353 ranked community skills, plus a planner and 10 chains. |
  ```

### 8. BehiSecc/awesome-claude-skills

- **URL:** https://github.com/BehiSecc/awesome-claude-skills
- **How listing works:** fork → change → PR (or open an issue). No written quality bar. It has a "Collections" section (format: `- [name](url) - description`).
- **Activity (Measured):** 10,212 stars, pushed 21 Sep 2026; **last merged PRs 3 Jun 2026**, so merges are slow.
- **Fit:** good. The Collections section lists similar bundles ("317 skills, 65 agents…").
- **Owner's account needed.**
- **Draft line:**
  ```markdown
  - [Skill Garden](https://github.com/Gipsonkj/skillgarden) - 38 super skills, one per craft, distilled from 1,353 ranked community skills, with a planner that combines crafts and 10 chains.
  ```

### 9. r/ClaudeCode

- **URL:** https://www.reddit.com/r/ClaudeCode
- **Rules:** **Unknown** (Reddit blocked automated reads). Read the sidebar first.
- **Activity:** **Unknown.** A gummysearch page says 14k members, but it looks out of date.
- **Fit:** good, for a developer angle. Do not cross-post the r/ClaudeAI text on the same day.
- **Owner's account needed.**
- **Draft (different angle: context cost and routing):**

  > **Title:** One router skill per craft instead of 30 installed skills: how I kept the always-on cost down
  >
  > Every installed skill puts its description into context. I wanted coverage across 38 crafts without that cost, so each craft in Skill Garden is one short router SKILL.md (descriptions of about 70 words) that loads a distilled guide only when the task needs it. A planner, superseed, picks crafts for multi-part requests. The guides are distilled from 1,353 ranked community skills, credited per craft; non-commercial ones are linked, not copied.
  >
  > Repo and install: https://github.com/Gipsonkj/skillgarden. Happy to hear where routing picks the wrong guide.

  The "about 70 words" figure comes from the repo's 5 Oct 2026 commit "Shorter craft descriptions: about 70 words each". Re-check it before posting.

### 10. Product Hunt

- **URL:** https://www.producthunt.com (launch from the owner's maker account)
- **How listing works:** the maker posts a launch with name, tagline, description, media and first comment. Exact field limits: **verify in the launch form.** 60 characters for the tagline is commonly cited but was not verified here.
- **Comparable (Reported, hunted.space):** "Skills Janitor" (Claude Code skills tool), 13 Apr 2026: 224 upvotes, #4 of the day.
- **Fit:** medium. Product Hunt rewards polished visuals; the landing film and stills help.
- **Owner's account needed**, and launch day needs the owner present to reply.
- **Draft:**
  - Name: Skill Garden
  - Tagline (51 chars): *One Claude skill per craft, distilled from the best*
  - Description:
    > 38 super skills for Claude, one per craft, distilled from 1,353 ranked community skills. A planner picks the crafts a request needs. Sources and licences credited; non-commercial skills linked, not copied. Free Claude Code plugin.
  - First comment: why you built it, what "distilled" means, how the weekly scout plus your review works, and what feedback you want. No ranking or install-count claims.

### 11. ComposioHQ/awesome-claude-skills

- **URL:** https://github.com/ComposioHQ/awesome-claude-skills
- **How listing works:**
  - The CONTRIBUTING file asks for **skill folders added to the repo** (with a `SKILL.md` template, a real use case, tested across platforms).
  - The README categories also list external repos as `- [name](url) - description. *By [@author](url)*`.
- **Activity (Measured):** 76,552 stars, pushed 18 Sep 2026, 1,639 open issues and PRs; **last merged PRs 22 May 2026.**
- **Fit:** low. Merges are slow and the list is built around single skills, not bundles. Copying super skills into their repo would also mix licences, so don't.
- **Owner's account needed.**
- **Draft line, if trying:**
  ```markdown
  - [skillgarden](https://github.com/Gipsonkj/skillgarden) - Claude Code plugin with 38 per-craft super skills distilled from ranked community skills, plus a planner that combines crafts. *By [@Gipsonkj](https://github.com/Gipsonkj)*
  ```

### 12. travisvn/awesome-claude-skills

- **URL:** https://github.com/travisvn/awesome-claude-skills
- **How listing works:**
  - PR into "Collections & Libraries", format `- **[Name](link)** - description`.
  - **At least 10 GitHub stars or the PR is closed automatically.**
  - **PRs must not be generated or submitted with AI assistance.**
  - No SaaS wrappers; must be more than a single `SKILL.md`.
- **Activity (Measured):** 15,279 stars, pushed 28 Apr 2026, 851 open issues and PRs; **last merged PR 7 Jan 2026.** Effectively not merging.
- **Fit:** low today.
- **No draft provided:** their rules require the submission to be the owner's own work. Revisit after 10+ stars, writing the PR yourself from the facts at the top.

### 13. aitmpl.com (davila7/claude-code-templates)

- **URL:** https://www.aitmpl.com · https://github.com/davila7/claude-code-templates
- **How listing works:**
  - PR adding components (agents, commands, MCPs, settings, hooks) under `cli-tool/components/...`.
  - **Contributions are licensed MIT.**
- **Activity (Measured):** 32,398 stars, pushed 5 Oct 2026. The site shows 1,340,064 downloads and 270 component PRs (from its page).
- **Fit:** low. It wants single components, and contributing super skills would relicense third-party distilled content as MIT, which is not ours to do. Only wholly owner-authored, MIT-compatible pieces could go there, e.g. `authored/` skills. No draft.

### 14. Auto-indexed lists (no action)

- **quemsah/awesome-claude-plugins:** 1,403 stars. A crawler indexes plugin repos (43,082 indexed per its README, updated 5 Oct 2026) and shows the top 100 by stars. Skill Garden appears only with stars.
- **ccplugins/awesome-claude-code-plugins** (966 stars, pushed 12 Aug 2026) and **composio-community/awesome-claude-plugins** (1,933 stars, pushed 26 Jul 2026): PR-based plugin lists with lower activity. Optional later.

### 15. Newsletters

- No newsletter with a verified submission path was found. The search turned up "Claude Code for Non-Coders" (Substack), which fits the non-dev crafts, but no submission process was found.
- A "This week in Claude" weekly was mentioned in one search snippet but could not be verified.
- **Status: Unknown.** Revisit once there is a launch post to point to.

## Suggested sequence

1. **Now:** pre-outreach fixes (README, LICENSE, repo metadata) and the skills.sh install line.
2. **This week:** Anthropic directory submission; karanb192 PR; r/ClaudeAI post (or the megathread if karma is under 50).
3. **From 13 Oct 2026:** hesreallyhim issue form.
4. **After real users or stars:** Show HN; VoltAgent; BehiSecc; Product Hunt; r/ClaudeCode with the different angle.
5. **Revisit later:** travisvn (after 10+ stars, written by hand), ComposioHQ.
