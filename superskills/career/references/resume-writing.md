# Resume and CV content

> Distilled from: resume-cover-letter (jezweb/claude-skills, MIT), review-resume (phuryn/pm-skills, MIT), job-application-assistant CV guide (MadsLorentzen/ai-job-search, MIT), resume-builder (reactive-resume/reactive-resume, MIT), resume command of interview-coach (noamseg/interview-coach-skill, MIT), brag-sheet (github/awesome-copilot, MIT).

This guide is the words on the page: what goes in, in what order, and how each line earns its place. Tailoring to one posting and ATS checks are in [tailoring-and-ats.md](tailoring-and-ats.md). A designed PDF or Word layout belongs to docs-office; JSON for Reactive Resume and LaTeX CVs are in [resume-tools.md](resume-tools.md).

## 1. The truth rule (read first)

| Zone | Examples | What to do |
|---|---|---|
| OK | Reorder roles and bullets by relevance; use a standard synonym for the same work; lead with one aspect of a broad role; add context to a vague line | Do it |
| Flag | Merging academic and industry work into one claim that reads as all-industry; using the posting's exact term for work that was adjacent, not the same; "led" when the user co-led | Draft it, then ask: "This line is a stretch because X. Keep, soften or drop?" |
| Never | A skill, tool, title, employer, degree, certification, date or number the user did not give you; shortening dates to hide a gap or a short tenure; "we" work written as "I" | Refuse and offer the honest version |

**Interview backtrack test:** could the candidate explain this line in an interview without saying "well, what I actually meant was..."? If not, it fails.

Numbers: only numbers the user supplies or can show (dashboard, PR, report). If they have none, ask for a rough estimate they will stand behind, or keep the line qualitative. Never write a placeholder number that looks real; write `(number needed)` instead.

## 2. Gather before you write

Ask one thing at a time, only for what is missing:

1. Target role (title, level, company or type of company) and the posting if there is one
2. Region (US, UK, EU, AU/NZ, other): it changes length, photo and personal-data rules
3. Current resume, LinkedIn export or notes; for each role: employer, title, dates (month and year), location, what changed because they were there
4. Evidence: metrics, links, artefacts (PRs, papers, launches, awards)
5. Special circumstances: gap, career change, short tenure, over- or under-qualified, visa status, in-progress degree

Keep everything in one **master resume**: every role, every bullet ever written, every number with its source. Tailored versions are cut from it, never written fresh.

## 3. Regional conventions

| Element | US | UK / Ireland | AU / NZ | Much of continental Europe |
|---|---|---|---|---|
| Name | Resume | CV | CV or resume | CV |
| Length | 1 page under ~10 years' experience, 2 max | 2 pages | 2-3 pages | 1-2 pages; check the country |
| Photo, age, marital status | No | No | No | Sometimes expected (e.g. Germany): ask the user |
| Visa / work rights | Leave off unless asked | State if relevant | State if relevant (common) | State if relevant |
| Address | City, state | City | City, state | City |
| References | Omit | Omit | Omit, or 2 if asked | Omit |

Match spelling to the market (optimise vs optimize). When unsure about a country, say so and ask; do not guess local rules.

## 4. Section order

| Career stage | Order |
|---|---|
| Student or graduate (0-3 years) | Contact, summary (optional), education, projects, experience (internships, part-time, volunteer), skills |
| Mid-career (3-10 years) | Contact, summary, experience, skills, education, certifications |
| Senior or executive (10+ years) | Contact, summary, selected achievements (optional), experience, board or advisory roles, education, memberships |
| Career changer | See [career-change.md](career-change.md): summary that bridges, then relevant experience, keep dated chronology |

Contact block: name, email (as printed text), phone, city, LinkedIn URL, one portfolio or GitHub link if relevant. Professional email (firstname.lastname@...). Contact goes in the body, never only in a header or footer.

## 5. Summary (2-4 lines)

Formula: **[role identity] + [years and domain] + [one signature result or strength] + [what they want next]**.

- Weak: "Motivated professional with strong communication skills seeking a challenging role."
- Strong: "Operations manager with 8 years in retail logistics. Cut fulfilment cost 22% at a 40-store chain while holding on-time delivery. Looking to bring that discipline to a high-growth e-commerce team." (every number from the user)

No objective statements, no adjectives without proof ("strategic thinker", "team player", "passionate"), no pronouns.

## 6. Experience bullets

**Shape.** One of these, whichever fits the evidence:
- XYZ: accomplished X, measured by Y, by doing Z (add S, the specific context, when it helps)
- CAR: challenge, action, result
- Action -> result -> evidence (good for internal docs and brag lists)

**Rules with numbers:**
- 4-6 bullets for the latest role, 3-4 for the one before, 2-3 for older roles; roles older than 10-15 years can shrink to a line or go
- Aim for 60% or more of bullets with a measurable result (%, money, volume, time, rank). The rest can carry an observable outcome ("adopted by 3 teams", "became the on-call runbook")
- Start with a strong verb that matches the real contribution; vary verbs. Verb choice signals level: built/implemented (IC), led/managed (manager), directed/scaled/established (director), only if true
- No "responsible for", "helped with", "assisted in", "involved in": they describe proximity, not contribution
- One idea per bullet, 1-2 lines, no first-person pronouns, consistent tense (past for past roles)
- Weave skills into bullets; a skills list without evidence carries little weight

**The "so what" ladder:** ask "so what?", then "why did that matter?", then "what changed because of it?" Stop when the answer is a business or user outcome.

| Weak | Strong (with user-supplied facts) |
|---|---|
| Worked on dashboards | Built a latency dashboard so on-call spots P95 spikes in under 2 minutes; now the team's default view |
| Improved product roadmap | Introduced quarterly planning reviews with sales and support; enterprise launches moved 6 months earlier |
| Fixed a bug in auth | Fixed a token-refresh race behind 401s on 12% of API calls (PR #247) |

**Quantifying without hard numbers:** ranges ("10-15 customers a week"), frequency ("weekly", "every release"), scope ("across 5 departments", "for 200 stores"), comparisons ("first time the team shipped on schedule"). All still need to be true.

## 7. Awkward facts, handled honestly

| Situation | Do | Don't |
|---|---|---|
| Employment gap | List real activity in the gap (study, freelance, caring, volunteering, projects); one plain sentence in the cover letter if needed | Stretch adjacent dates, switch to years-only just to hide months, invent a role |
| Long role, little visible output | Surface real secondary work; show phases ("first 6 months learning the domain, then owned X to delivery"); name what made the cycle long | Pad with invented projects |
| In-progress degree or certification | "In progress, expected June 2027" inside the entry itself, matching the summary and any availability note | A bare closed range (2025-2026) that reads as finished |
| Several roles at one employer | Employer once, each title as a sub-entry with its own dates (shows progression) | Merge into the highest title |
| Non-standard title | Official title, optionally a plain equivalent: "Product Owner (product manager scope)"; explain in interview | Replace it with a title never held |
| Over-qualified | Trim scope that scares the reader; address motivation in the letter | Remove real seniority to look junior |

## 8. What to leave off

"References available on request", objective statements, photos (unless the market expects them), date of birth, marital status, salary history or expectations, reasons for leaving, every job since school, high school once there is a degree, hobbies unless relevant to the role.

## 9. Review an existing resume

Report in this order, quoting their lines:
1. Two real strengths first.
2. Top 3 fixes by impact, each with a before -> after rewrite using only their facts.
3. Section-by-section notes: summary, each recent role, skills, education, structure, consistency (dates, tense, punctuation, spelling).
4. Lines that need a number or evidence: mark `(number needed)` and ask.
5. If a posting was given: hand over to [tailoring-and-ats.md](tailoring-and-ats.md) for keyword and order changes.

Six-second scan check: name, current title and employer, previous titles, dates and education should tell a clear story at a glance.

## 10. Checklist

- [ ] Every claim, title, date and number traces to the master resume or the user's own words
- [ ] Stretch lines flagged to the user, not silently kept
- [ ] Summary is specific; no unproven adjectives or pronouns
- [ ] Bullets lead with outcomes; about 60% carry a measurable result
- [ ] Regional conventions applied; length fits the market and seniority
- [ ] Dates as month and year ranges; in-progress items say so
- [ ] Contact details as plain text in the body
- [ ] Spelling, tense and formatting consistent throughout
