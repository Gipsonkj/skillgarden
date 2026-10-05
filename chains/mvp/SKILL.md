---
name: mvp
description: "Take a product idea to a deployed first version from one request: the job to be done and a short PRD, scope cut to the MVP, database schema and API, sign-in and payments, the screens, tests, a security pass and deploy with CI and monitoring, using the Skill Garden product-management, backend-databases, frontend-ui-design, testing-qa, security and cloud-devops super skills in order. Use when asked to build an MVP, a SaaS, a first version or a prototype real users can sign up to."
---

<!-- Generated from chain.json by local/chains.mjs. Edit chain.json, then run: node local/chains.mjs --write -->

# Build and ship an MVP

From idea to a live first version: spec, data model, sign-in and payments, screens, tests, security and deploy.

This is a **chain**: one request runs several Skill Garden super skills in order, each step using the guide written for it. It needs these super skills installed: `product-management`, `backend-databases`, `frontend-ui-design`, `testing-qa`, `security`, `cloud-devops`. With the Skill Garden plugin they are `skillgarden:<name>` (one that isn't in your skill list was switched off in the plugin: read its `superskills/<name>/SKILL.md`, two folders up from this skill's base directory); on the Skill Garden connector, read each guide with `get_guide`.

Ask like this: "Build an MVP of <product> for <users>, so they can <main job>."

## Before step 1: gather the inputs once

Ask only for what the request and the conversation don't already give you, in one message:

- The problem and who has it
- The one job the first version must do
- Must-haves (sign-in, payments, teams) and what can wait
- Stack or hosting you already use or prefer
- Deadline and budget for paid services

If something stays unknown, pick a sensible default, say which, and go on.

## Run the steps in order

For each step: load the named super skill, read the guides listed (and only those), do the step the way the guide says, and save the result as `mvp/<n>-<step>.md` in the working folder (or as a section of one document where files aren't available). Each step builds on the files before it. If the user asked for only part of the chain (a plan, a script, captions), run only the steps that produce it and say which you skipped. Don't stop between steps to ask "continue?". Stop only for a decision the user has to make, and say what it is.

### 1. Find the job and write the spec

- **Read:** `product-management` → `references/discovery-jtbd.md`, `product-management` → `references/prd-specs.md`
- **Deliver:** A one-page PRD: the job, the users, the success metric and what is out of scope.

### 2. Cut to the MVP

- **Read:** `product-management` → `references/prioritization.md`, `product-management` → `references/stories-and-tickets.md`
- **Deliver:** Ranked stories, the cut line and the order to build them.

### 3. Design the data and API

- **Read:** `backend-databases` → `references/postgres-schema.md`, `backend-databases` → `references/api-design.md`, `backend-databases` → `references/backend-architecture.md`
- **Deliver:** Tables with keys and constraints, migrations and the API endpoints.

### 4. Add sign-in and payments

- **Read:** `backend-databases` → `references/auth.md`, `backend-databases` → `references/stripe.md`
- **Deliver:** Working sign-up, sessions and roles, and Stripe Checkout with webhooks if it charges.

### 5. Build the screens

- **Read:** `frontend-ui-design` → `references/components-and-states.md`, `frontend-ui-design` → `references/react-shadcn-tailwind.md`
- **Deliver:** Each screen with its loading, empty, error and success states.

### 6. Test the key flows

- **Read:** `testing-qa` → `references/test-strategy.md`, `testing-qa` → `references/playwright-e2e.md`
- **Deliver:** A test plan and end-to-end tests for sign-up, the main job and payment.

### 7. Security pass

- **Read:** `security` → `references/threat-modeling.md`, `security` → `references/secrets.md`, `security` → `references/secure-coding.md`
- **Deliver:** Threats found and fixed, secrets out of the code, and the risks that remain.

### 8. Deploy with CI and monitoring

- **Read:** `cloud-devops` → `references/platform-choice.md`, `cloud-devops` → `references/ci-cd.md`, `cloud-devops` → `references/observability.md`
- **Deliver:** The live app, a pipeline that tests before it deploys, and alerts on errors.

## Finish

End with a short summary: what each step produced (file names), the decisions you made on the user's behalf, and the one thing to do first. Facts, numbers and claims come only from the user's inputs and the research step. Never invent results, testimonials or prices.
