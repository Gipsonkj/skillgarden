---
name: course-launch
description: "Build and launch an online course from one request: learning outcomes and backward design, course structure, lessons and checks, slides or video, production and platform, a sales page and a launch email sequence, using the Skill Garden course-design, presentations, ai-video, content-creation and email-marketing super skills in order. Use when asked to create a course, cohort, workshop or training programme, or to turn notes or expertise into a course and sell it."
---

<!-- Generated from chain.json by local/chains.mjs. Edit chain.json, then run: node local/chains.mjs --write -->

# Create and sell an online course

Turn what you know into a course: outcomes, structure, lessons, slides or video, the platform, a sales page and launch emails.

This is a **chain**: one request runs several Skill Garden super skills in order, each step using the guide written for it. It needs these super skills installed: `course-design`, `presentations`, `ai-video`, `content-creation`, `email-marketing`. With the Skill Garden plugin they are `skillgarden:<name>` (one that isn't in your skill list was switched off in the plugin: read its `superskills/<name>/SKILL.md`, two folders up from this skill's base directory); on the Skill Garden connector, read each guide with `get_guide`.

Ask like this: "Create a course on <topic> for <learners>, and plan its launch."

## Before step 1: gather the inputs once

Ask only for what the request and the conversation don't already give you, in one message:

- The topic and what learners can do at the end
- Who the learners are and what they already know
- Material you have: notes, talks, videos, documents
- Format: self-paced or cohort, video or text
- Price, where you'll sell it and your email list size

If something stays unknown, pick a sensible default, say which, and go on.

## Run the steps in order

For each step: load the named super skill, read the guides listed (and only those), do the step the way the guide says, and save the result as `course-launch/<n>-<step>.md` in the working folder (or as a section of one document where files aren't available). Each step builds on the files before it. If the user asked for only part of the chain (a plan, a script, captions), run only the steps that produce it and say which you skipped. Don't stop between steps to ask "continue?". Stop only for a decision the user has to make, and say what it is.

### 1. Set the outcomes

- **Read:** `course-design` → `references/objectives-and-backward-design.md`
- **Deliver:** Measurable outcomes and how each one will be checked.

### 2. Structure the course

- **Read:** `course-design` → `references/course-structure.md`, `course-design` → `references/materials-to-course.md`
- **Deliver:** Modules and lessons in order, and what each builds on.

### 3. Write the lessons and checks

- **Read:** `course-design` → `references/lesson-plans.md`, `course-design` → `references/explanations.md`, `course-design` → `references/assessments-and-feedback.md`
- **Deliver:** Lesson plans with explanations, examples, practice and a quiz or task per module.

### 4. Make the slides or videos

- **Read:** `presentations` → `references/slide-design.md`, `ai-video` → `references/explainers-and-promos.md`
- **Deliver:** Slides per lesson and a plan for each video.

### 5. Produce and publish

- **Read:** `course-design` → `references/course-production-and-platforms.md`
- **Deliver:** The platform, the recording setup and the course built there.

### 6. Write the sales page

- **Read:** `content-creation` → `references/conversion-copy.md`
- **Deliver:** Sales page copy: promise, outcomes, curriculum, proof, price and FAQ.

### 7. Launch emails

- **Read:** `email-marketing` → `references/sequences-and-lifecycle.md`, `email-marketing` → `references/campaigns-subject-lines-testing.md`
- **Deliver:** A launch sequence (warm-up, open cart, reminders, close) with subject lines.

## Finish

End with a short summary: what each step produced (file names), the decisions you made on the user's behalf, and the one thing to do first. Facts, numbers and claims come only from the user's inputs and the research step. Never invent results, testimonials or prices.
