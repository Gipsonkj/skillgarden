---
name: campaign
description: "Run a full marketing campaign end to end from one request: audience and competitor research, creative strategy and angles, hooks, organic social posts, paid ad copy and a testing plan, using the Skill Garden social-media, content-creation and ad-creation super skills in order. Use when asked to run, plan or build a campaign, a launch push, or 'posts plus ads' for a product, offer or event."
---

<!-- Generated from chain.json by local/chains.mjs. Edit chain.json, then run: node local/chains.mjs --write -->

# Marketing campaign

One ask runs a whole campaign: research, angles, hooks, posts, ads and a test plan, each step using the Skill Garden guide made for it.

This is a **chain**: one request runs several Skill Garden super skills in order, each step using the guide written for it. It needs these super skills installed: `social-media`, `ad-creation`, `content-creation`. With the Skill Garden plugin they are `skillgarden:<name>`; on the Skill Garden connector, read each guide with `get_guide`.

Ask like this: "Run a campaign for <product or offer>, aimed at <audience>, on <platforms>."

## Before step 1: gather the inputs once

Ask only for what the request and the conversation don't already give you, in one message:

- What is being promoted and the one action you want
- Who it is for
- Platforms and whether there is ad budget
- Facts you can use: numbers, proof, prices, dates
- Brand voice or a sample of past posts

If something stays unknown, pick a sensible default, say which, and go on.

## Run the steps in order

For each step: load the named super skill, read the guides listed (and only those), do the step the way the guide says, and save the result as `campaign/<n>-<step>.md` in the working folder (or as a section of one document where files aren't available). Each step builds on the files before it. Don't stop between steps to ask "continue?". Stop only for a decision the user has to make, and say what it is.

### 1. Research the audience and competitors

- **Read:** `social-media` → `references/listening-research.md`, `ad-creation` → `references/competitor-ad-research.md`
- **Deliver:** What the audience says in their own words, the angles competitors already run, and the gaps.

### 2. Pick the angles and write the brief

- **Read:** `ad-creation` → `references/creative-strategy.md`
- **Deliver:** A one-page brief: the offer, three to five angles ranked, proof for each, and the one you'd lead with.

### 3. Write the hooks

- **Read:** `social-media` → `references/hooks-and-voice.md`
- **Deliver:** Ten or more hooks across the chosen angles, in the brand voice.

### 4. Write the organic posts and calendar

- **Read:** `social-media` → `references/strategy-calendar.md`, `social-media` → `references/platform-playbook.md`, `content-creation` → `references/repurposing.md`
- **Deliver:** Posts for each platform and a two-week calendar.

### 5. Write the paid ads

- **Read:** `ad-creation` → `references/ad-copywriting.md`, `ad-creation` → `references/platform-specs.md`
- **Deliver:** Ad copy variants per angle that fit each platform's limits.

### 6. Plan the tests

- **Read:** `ad-creation` → `references/testing-iteration.md`
- **Deliver:** What to test first, the budget split, the metric and when to call a winner.

## Finish

End with a short summary: what each step produced (file names), the decisions you made on the user's behalf, and the one thing to do first. Facts, numbers and claims come only from the user's inputs and the research step. Never invent results, testimonials or prices.
