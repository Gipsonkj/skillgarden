---
name: launch-video
description: "Make a short launch or promo video end to end from one request: script, shot list and storyboard, production plan and route (AI generation, editing or motion), captions and delivery checks, then the post and caption for social, using the Skill Garden storyboarding, ai-video and social-media super skills in order. Use when asked to make a launch video, promo, reel or short ad video for a product or feature."
---

<!-- Generated from chain.json by local/chains.mjs. Edit chain.json, then run: node local/chains.mjs --write -->

# Launch video

Script, storyboard, produce and post a short launch video, from the first line to the caption.

This is a **chain**: one request runs several Skill Garden super skills in order, each step using the guide written for it. It needs these super skills installed: `storyboarding`, `ai-video`, `social-media`. With the Skill Garden plugin they are `skillgarden:<name>`; on the Skill Garden connector, read each guide with `get_guide`.

Ask like this: "Make a launch video for <product or feature> for <platform>."

## Before step 1: gather the inputs once

Ask only for what the request and the conversation don't already give you, in one message:

- What is launching and the one thing viewers should remember
- Platform, length and aspect ratio
- Assets you have: screen recordings, footage, logo, music
- Tools you can use for generation or editing
- Voice: narrated, captions only, or on-camera

If something stays unknown, pick a sensible default, say which, and go on.

## Run the steps in order

For each step: load the named super skill, read the guides listed (and only those), do the step the way the guide says, and save the result as `launch-video/<n>-<step>.md` in the working folder (or as a section of one document where files aren't available). Each step builds on the files before it. Don't stop between steps to ask "continue?". Stop only for a decision the user has to make, and say what it is.

### 1. Write the script

- **Read:** `storyboarding` → `references/script-and-scene-craft.md`
- **Deliver:** A script with a hook in the first two seconds and one idea per scene.

### 2. Shot list and storyboard

- **Read:** `storyboarding` → `references/shot-lists-and-boards.md`
- **Deliver:** A numbered shot list with framing, motion and on-screen text.

### 3. Plan and produce the video

- **Read:** `ai-video` → `references/plan-and-route.md`
- **Deliver:** The production route per shot and the prompts or edit steps to make it.

### 4. Captions and delivery checks

- **Read:** `ai-video` → `references/captions-talking-head.md`, `ai-video` → `references/delivery-qa.md`
- **Deliver:** Captions and a checklist pass for the platform's specs.

### 5. Write the post

- **Read:** `social-media` → `references/short-form-video.md`, `social-media` → `references/hooks-and-voice.md`
- **Deliver:** The caption, first comment and posting notes.

## Finish

End with a short summary: what each step produced (file names), the decisions you made on the user's behalf, and the one thing to do first. Facts, numbers and claims come only from the user's inputs and the research step. Never invent results, testimonials or prices.
