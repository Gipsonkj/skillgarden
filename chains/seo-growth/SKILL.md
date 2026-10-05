---
name: seo-growth
description: "Grow organic and AI search traffic from one request: a technical audit with fixes, keyword and intent research, topic clusters and internal links, writing or refreshing articles, schema and AI search signals, and a link plan, using the Skill Garden seo and content-creation super skills in order. Use when asked to improve SEO, rank higher, get cited in ChatGPT or AI Overviews, or plan a content engine for a site."
---

<!-- Generated from chain.json by local/chains.mjs. Edit chain.json, then run: node local/chains.mjs --write -->

# Rank in Google and AI search

Audit the site, fix what blocks ranking, then plan and write the content that Google and AI answers cite.

This is a **chain**: one request runs several Skill Garden super skills in order, each step using the guide written for it. It needs these super skills installed: `seo`, `content-creation`. With the Skill Garden plugin they are `skillgarden:<name>` (one that isn't in your skill list was switched off in the plugin: read its `superskills/<name>/SKILL.md`, two folders up from this skill's base directory); on the Skill Garden connector, read each guide with `get_guide`.

Ask like this: "Grow search traffic for <site> on <topic or product>."

## Before step 1: gather the inputs once

Ask only for what the request and the conversation don't already give you, in one message:

- The site and its most important pages
- Who searches and what they buy
- Competitors that rank above you
- Access you have: Search Console, analytics, the CMS
- How many articles a month you can publish

If something stays unknown, pick a sensible default, say which, and go on.

## Run the steps in order

For each step: load the named super skill, read the guides listed (and only those), do the step the way the guide says, and save the result as `seo-growth/<n>-<step>.md` in the working folder (or as a section of one document where files aren't available). Each step builds on the files before it. If the user asked for only part of the chain (a plan, a script, captions), run only the steps that produce it and say which you skipped. Don't stop between steps to ask "continue?". Stop only for a decision the user has to make, and say what it is.

### 1. Audit the site

- **Read:** `seo` → `references/audit.md`, `seo` → `references/technical.md`
- **Deliver:** Issues ranked by impact (crawling, indexing, speed, duplicates) with the fix for each.

### 2. Research keywords and intent

- **Read:** `seo` → `references/keywords-content.md`
- **Deliver:** Topic clusters with the intent, difficulty and the page that should rank for each.

### 3. Plan the structure and links

- **Read:** `seo` → `references/architecture-linking.md`
- **Deliver:** Hub and supporting pages, their URLs and the internal links between them.

### 4. Write or refresh the articles

- **Read:** `content-creation` → `references/long-form-articles.md`, `content-creation` → `references/humanize-ai-writing.md`
- **Deliver:** The first articles, written for the reader, with titles and meta descriptions.

### 5. Schema and AI search signals

- **Read:** `seo` → `references/schema.md`, `seo` → `references/ai-search.md`
- **Deliver:** JSON-LD per page type, AI crawler settings and passages written to be quoted.

### 6. Plan links and tracking

- **Read:** `seo` → `references/offpage-competitors.md`, `seo` → `references/tools-vendors.md`
- **Deliver:** A 90-day link plan and the reports to check each month.

## Finish

End with a short summary: what each step produced (file names), the decisions you made on the user's behalf, and the one thing to do first. Facts, numbers and claims come only from the user's inputs and the research step. Never invent results, testimonials or prices.
