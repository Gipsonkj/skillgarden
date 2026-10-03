---
name: sales-outreach
description: "Plan and write a sales outreach sequence from one request: find and score leads from allowed sources, pick an angle per person, draft connection notes and messages, and plan follow-ups, using the Skill Garden linkedin-automation and content-creation super skills in order. Everything is drafted for the user to send by hand. Use when asked to run outreach, prospect, write cold messages or plan follow-ups for a product or service."
---

<!-- Generated from chain.json by local/chains.mjs. Edit chain.json, then run: node local/chains.mjs --write -->

# Sales outreach

From a target list to sent-by-hand messages and follow-ups, using the LinkedIn guides' research, message and safety rules.

This is a **chain**: one request runs several Skill Garden super skills in order, each step using the guide written for it. It needs these super skills installed: `linkedin-automation`, `content-creation`. With the Skill Garden plugin they are `skillgarden:<name>`; on the Skill Garden connector, read each guide with `get_guide`.

Ask like this: "Run outreach for <offer> to <type of buyer>."

## Before step 1: gather the inputs once

Ask only for what the request and the conversation don't already give you, in one message:

- The offer and why it matters to this buyer
- Who the buyer is (role, company type, size)
- Leads you already have, or where to look
- Proof: results, customers, numbers you can use
- Daily volume you are comfortable sending by hand

If something stays unknown, pick a sensible default, say which, and go on.

## Run the steps in order

For each step: load the named super skill, read the guides listed (and only those), do the step the way the guide says, and save the result as `sales-outreach/<n>-<step>.md` in the working folder (or as a section of one document where files aren't available). Each step builds on the files before it. Don't stop between steps to ask "continue?". Stop only for a decision the user has to make, and say what it is.

### 1. Research and score the leads

- **Read:** `linkedin-automation` → `references/lead-research.md`, `linkedin-automation` → `references/tos-and-safe-automation.md`
- **Deliver:** A short scored list with one public, relevant signal per person.

### 2. Pick the angle and proof

- **Read:** `content-creation` → `references/conversion-copy.md`
- **Deliver:** The pain, the promise and the proof to lead with, per segment.

### 3. Draft the messages

- **Read:** `linkedin-automation` → `references/outreach-messages.md`
- **Deliver:** A connection note and a first message per person, inside the character caps.

### 4. Plan the follow-ups

- **Read:** `linkedin-automation` → `references/comments-engagement.md`, `linkedin-automation` → `references/outreach-messages.md`
- **Deliver:** Two follow-ups per person with the day to send each, and when to stop.

## Finish

End with a short summary: what each step produced (file names), the decisions you made on the user's behalf, and the one thing to do first. Facts, numbers and claims come only from the user's inputs and the research step. Never invent results, testimonials or prices.
