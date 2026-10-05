---
name: landing-page
description: "Plan, write, design, build and ship a landing page that converts from one request: the offer and copy, a design direction, the build, on-page SEO and schema, speed and accessibility checks, then deploy, using the Skill Garden content-creation, website-building, frontend-ui-design and seo super skills in order. Use when asked to make a landing page, sales page, waitlist page or product page for a launch."
---

<!-- Generated from chain.json by local/chains.mjs. Edit chain.json, then run: node local/chains.mjs --write -->

# Landing page that converts

From offer to a live page: copy, design direction, the build, search basics, speed checks and deploy.

This is a **chain**: one request runs several Skill Garden super skills in order, each step using the guide written for it. It needs these super skills installed: `website-building`, `content-creation`, `frontend-ui-design`, `seo`. With the Skill Garden plugin they are `skillgarden:<name>`; on the Skill Garden connector, read each guide with `get_guide`.

Ask like this: "Build a landing page for <product or offer>, aimed at <audience>, that gets them to <action>."

## Before step 1: gather the inputs once

Ask only for what the request and the conversation don't already give you, in one message:

- The offer and the one action the page asks for
- Who it is for and their biggest objection
- Proof you can use: numbers, customers, quotes you have permission to show
- Brand assets: logo, colours, fonts, screenshots
- Where it will be hosted and any stack you already use

If something stays unknown, pick a sensible default, say which, and go on.

## Run the steps in order

For each step: load the named super skill, read the guides listed (and only those), do the step the way the guide says, and save the result as `landing-page/<n>-<step>.md` in the working folder (or as a section of one document where files aren't available). Each step builds on the files before it. If the user asked for only part of the chain (a plan, a script, captions), run only the steps that produce it and say which you skipped. Don't stop between steps to ask "continue?". Stop only for a decision the user has to make, and say what it is.

### 1. Plan the page and write the copy

- **Read:** `website-building` → `references/plan-and-copy.md`, `content-creation` → `references/conversion-copy.md`
- **Deliver:** Section-by-section copy: headline, proof, objections answered and one call to action.

### 2. Pick the design direction

- **Read:** `frontend-ui-design` → `references/design-direction.md`, `frontend-ui-design` → `references/visual-system.md`
- **Deliver:** A one-line Design Read, the tokens (colour, type, spacing) and a wireframe per section.

### 3. Build the page

- **Read:** `website-building` → `references/stacks-astro-vue-static.md`, `website-building` → `references/nextjs-react.md`, `frontend-ui-design` → `references/components-and-states.md`
- **Deliver:** The working page in the stack that fits, with every state, responsive from 320 px.

### 4. Search basics and schema

- **Read:** `website-building` → `references/seo.md`, `seo` → `references/schema.md`
- **Deliver:** Title, description, headings, a social share image, JSON-LD and a sitemap.

### 5. Speed, accessibility and anti-slop check

- **Read:** `website-building` → `references/performance-cwv.md`, `website-building` → `references/quality-audit-and-testing.md`, `frontend-ui-design` → `references/anti-slop.md`
- **Deliver:** Core Web Vitals in the green, an accessibility pass and the fixes made.

### 6. Deploy

- **Read:** `website-building` → `references/deploy-netlify-cloudflare.md`, `website-building` → `references/deploy-vercel.md`
- **Deliver:** The live URL with the domain and analytics set up, and how to roll back.

## Finish

End with a short summary: what each step produced (file names), the decisions you made on the user's behalf, and the one thing to do first. Facts, numbers and claims come only from the user's inputs and the research step. Never invent results, testimonials or prices.
