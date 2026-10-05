---
name: job-search
description: "Run a job search end to end from one request: target roles, a rewritten CV and LinkedIn profile, tailoring per posting for ATS with cover letters, outreach to hiring managers, interview preparation and offer negotiation, using the Skill Garden career and linkedin-automation super skills in order. Use when asked to help find a job, rewrite a CV or resume, apply to roles, prepare for interviews or negotiate an offer."
---

<!-- Generated from chain.json by local/chains.mjs. Edit chain.json, then run: node local/chains.mjs --write -->

# Land a job

Target roles, a CV and profile that pass ATS, tailored applications, outreach to hiring managers, interview prep and the offer.

This is a **chain**: one request runs several Skill Garden super skills in order, each step using the guide written for it. It needs these super skills installed: `career`, `linkedin-automation`. With the Skill Garden plugin they are `skillgarden:<name>`; on the Skill Garden connector, read each guide with `get_guide`.

Ask like this: "Help me land a <role> job in <place or remote>."

## Before step 1: gather the inputs once

Ask only for what the request and the conversation don't already give you, in one message:

- Your current CV or work history
- Roles and companies you want
- Location, remote and visa needs
- Your salary floor and target
- Deadlines or interviews already booked

If something stays unknown, pick a sensible default, say which, and go on.

## Run the steps in order

For each step: load the named super skill, read the guides listed (and only those), do the step the way the guide says, and save the result as `job-search/<n>-<step>.md` in the working folder (or as a section of one document where files aren't available). Each step builds on the files before it. If the user asked for only part of the chain (a plan, a script, captions), run only the steps that produce it and say which you skipped. Don't stop between steps to ask "continue?". Stop only for a decision the user has to make, and say what it is.

### 1. Pick the target roles

- **Read:** `career` → `references/job-search-and-outreach.md`
- **Deliver:** Three target role types, the companies to aim at and a weekly search plan.

### 2. Rewrite the CV

- **Read:** `career` → `references/resume-writing.md`
- **Deliver:** A CV with results-led bullets, using only facts from your history.

### 3. Update the LinkedIn profile

- **Read:** `linkedin-automation` → `references/profile-optimization.md`
- **Deliver:** Headline, about section and experience rewritten for the target roles.

### 4. Tailor each application

- **Read:** `career` → `references/tailoring-and-ats.md`, `career` → `references/cover-letters.md`
- **Deliver:** A tailored CV and cover letter per posting that pass ATS keyword checks.

### 5. Reach the hiring managers

- **Read:** `career` → `references/job-search-and-outreach.md`, `linkedin-automation` → `references/outreach-messages.md`
- **Deliver:** Messages to hiring managers and for referrals, drafted for you to send.

### 6. Prepare for the interviews

- **Read:** `career` → `references/interview-prep.md`, `career` → `references/technical-interviews.md`
- **Deliver:** Stories for the likely questions, answers to the hard ones and questions to ask.

### 7. Negotiate the offer

- **Read:** `career` → `references/negotiation-and-offers.md`
- **Deliver:** Your number, the counter script and what else to ask for.

## Finish

End with a short summary: what each step produced (file names), the decisions you made on the user's behalf, and the one thing to do first. Facts, numbers and claims come only from the user's inputs and the research step. Never invent results, testimonials or prices.
