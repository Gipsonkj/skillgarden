---
name: storyboarding
description: Pre-production for film, ads, social video, short dramas and comics: story structure and beat sheets, writing or fixing scripts (Final Draft, Fountain), shot lists and storyboard tables, shot sizes, angles and moves, character sheets and continuity, first and last frames, per-shot AI video prompts from a board (Seedance, Kling, Veo), comic and webtoon layouts, reference-video breakdowns, Boords and StudioBinder. Use for "storyboard this", "shot list", "beat sheet", "分镜" or "plan a 30s ad".
---

# Storyboarding

Turn a brief, script or reference video into a plan someone can execute with a crew or a generation queue: structure → script → beats → shot list → keyframes and consistency assets → per-shot prompts. This skill stops at the plan. Running video models, stitching and rendering belong to the **ai-video** skill; motion-graphics animation belongs to **motion-animation**.

## Core principles

1. **Story function first.** Every shot changes emotion, advances action or raises pressure. A shot with no job is deleted, not improved.
2. **Beats before shots.** A beat is a change in pressure with a named cause, not a camera change. Board only after the beats add up.
3. **Blocking before framing.** Decide where bodies are and move (distances in metres), then place the camera.
4. **Behaviour, not emotion.** Write what the body does (jaw locks, eyes drop, a swallow), 2-4 cues per emotional shift. "She is afraid" renders nothing.
5. **Every shot has a start state, one action and a named end state.** The end state is the next shot's start, or the cut must account for the gap.
6. **One dominant camera move per shot, or none.** Each move answers "what changed?". A move plus a reframe is two shots.
7. **Cut geometry:** same axis = jump two sizes; 30°+ angle change = one size is enough. Never cross the 180° line by accident; write screen side and gaze direction into every frame.
8. **Duration comes from content.** Lay the sound timeline (lines at natural speed, reactions, must-see actions) and derive shot lengths; never pad or squeeze to a round number. Vary shot lengths (at least three values per scene); the pause before the impact matters more than cut speed.
9. **Consistency is engineered, not requested.** A 30-50 word identity string pasted verbatim, character sheets and location plates made first, one style phrase for the whole piece, light written in room coordinates. Generators have no memory between generations.
10. **The keyframe is the control point.** Fix the still (start-state facts only) before spending video generations; derive last frames from approved first frames by editing.
11. **Concrete beats adjective soup.** Cut "cinematic, masterpiece, stunning, epic". Each shot carries an environmental pressure, a physical micro-action and a sound or visual motif. (One source told prompts to always end with "cinematic 1080p"; rejected: filler words steer nothing.)
12. **State positives; negation backfires in video prompts.** "Not glowing" draws a glow. Describe the wanted material or expression; keep only short, named cleanup exclusions.
13. **Score generation risk and split Red shots on paper.** Contact, handoffs, liquids, two people lip-syncing, falls: restage (cut before contact, show the aftermath) instead of hoping.
14. **Answer the size of the question.** One prompt request gets one prompt; a full script gets the pipeline. Ask at most one question, only when a wrong guess would waste the whole deliverable (target model for model-specific prompts, aspect ratio for a vertical-only campaign); otherwise state assumptions and proceed. (Some short-drama sources insist on blocking until model and ratio are chosen; we ask only when it changes the output.)
15. **Identity lives once per generation.** Repeat the full identity/style block in every separate generation; inside one multi-shot generation, put it once in the Overall block and never re-describe the character per segment.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "30-second vertical ad: `references/story-structure.md` → `references/shot-lists-and-boards.md` → `references/keyframes-and-consistency.md` → `references/ai-video-prompts.md`; keyframe stills from `image-creation` → `references/editing-references-consistency.md`; voiceover from `audio-generation` → `references/voiceover-tts.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:superseed`, or `get_super_skill` with craft `superseed` on the connector.

## Pick the right guide

Call a capability by naming the task, or say "use storyboarding: <capability>".

| Task | Read |
|---|---|
| Story shape, beat sheet, act breaks, beats per duration, emotion curve, 9-moment key board | [references/story-structure.md](references/story-structure.md), template [templates/cinematic-director/beat-sheet-template.md](templates/cinematic-director/beat-sheet-template.md) |
| Write or fix a script or scene, screenplay/A-V/YouTube formats, dialogue, scene design; read Final Draft `.fdx` or write Fountain, pick a script format | [references/script-and-scene-craft.md](references/script-and-scene-craft.md) |
| Shot sizes, angles, lenses, camera moves, composition, blocking, 180°/30° rules, eyelines, coverage, vertical framing | [references/shot-language.md](references/shot-language.md) |
| Shot list or storyboard table, shot cards, timing and shot counts, risk scoring, animatic panels, grid boards; drawing panels, pick a drawing tool (Photoshop, Storyboard Pro, AI keyframes) | [references/shot-lists-and-boards.md](references/shot-lists-and-boards.md), template [templates/cinematic-director/shot-plan-template.md](templates/cinematic-director/shot-plan-template.md) |
| Character sheets, identity strings, style lock, location plates, keyframe prompts, first/last frames, continuity bible | [references/keyframes-and-consistency.md](references/keyframes-and-consistency.md) |
| Board → AI video prompts per model (Seedance, Kling, Veo, MiniMax H3), segment seams, repair order | [references/ai-video-prompts.md](references/ai-video-prompts.md) |
| Vertical short drama / micro-drama / AI comic drama episodes | [references/short-drama-vertical.md](references/short-drama-vertical.md) |
| Comic pages, four-panel strips, webtoons, knowledge comics; pick who draws (Clip Studio Paint or an image model) | [references/comics-and-panels.md](references/comics-and-panels.md) |
| Break down a reference video into a measured shot list (拉片) | [references/reference-video-breakdown.md](references/reference-video-breakdown.md), script [scripts/video-shots/video-shots.mjs](scripts/video-shots/video-shots.mjs) |
| Project folders, IDs, asset naming, revisions; boards in a storyboard app, pick a board app (Boords, StudioBinder, Storyboard Pro, Storyboarder); animatic export to an editor (EDL/AAF/XML), handoff | [references/storyboard-projects.md](references/storyboard-projects.md) |

Load only the file(s) the task needs.

## Other crafts

| When the request also needs | Use |
|---|---|
| Running the video models, cutting and delivering the clips once the board is approved | `ai-video` → `references/vendor-apis.md`, `references/footage-editing-ffmpeg.md`, `references/delivery-qa.md` |
| Rendering the character sheets, location plates and keyframe stills | `image-creation` → `references/editing-references-consistency.md`, `references/prompting-fundamentals.md` |
| Voiceover, music and sound effects laid on the timeline | `audio-generation` → `references/voiceover-tts.md`, `references/music-generation.md`, `references/sound-effects.md` |
| Motion-graphics scenes (kinetic type, animated diagrams) instead of filmed or generated shots | `motion-animation` → `references/motion-principles.md`, `references/hyperframes-animation.md` |
| Ad angles, hooks and platform specs behind an ad storyboard | `ad-creation` → `references/creative-strategy.md`, `references/short-form-video-ugc.md`, `references/platform-specs.md` |
| Captions, hashtags and platform norms for a Reel, TikTok or Short | `social-media` → `references/short-form-video.md`, `references/platform-playbook.md` |
| The board as a deck or PDF for client sign-off | `presentations` → `references/html-and-markdown-decks.md`, `references/powerpoint-pptx.md`, `references/deck-qa.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| The director's book, sound plans and style overlays; the bundled templates link to its files | [cinematic-director](https://github.com/wuwangzhang1216/DirectorSKILL/tree/main) (MIT) |
| Auditing and splitting prompts for more generators (Runway, Sora) and director treatments | [video](https://github.com/smixs/visual-skills/tree/main/video) (CC-BY-4.0; attribution to Serge Shima required) |
| Seedance 2.5 long and exact-timeline videos, transitions and acted dialogue in full | [seedance-2-5-video-director](https://github.com/liyue-aigc/seedance-2-5-video-director/tree/main) (MIT; Chinese-first) |
| A feature, stage play or series from premise to revision, with saved state and a story bible | [sw-workflow](https://github.com/jtydhr88/screenwriting-skills/tree/main/plugins/screenwriting/skills/sw-workflow) (MIT; install the screenwriting plugin) |
| An industrial short-drama pipeline with multi-agent roles for Seedance 2.x and MiniMax H3 | [short-drama-director](https://github.com/lixiaoxiao9888-create/manju-laoli-skill/tree/main/short-drama-director) (MIT; Chinese-language) |
| Batch-generating the panel images once a comic page is planned | [baoyu-comic](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-comic) (MIT; needs the baoyu-image-gen backend) |

## Default workflow

1. **Intake.** Format, target duration, aspect ratio, target model/tool (if any), genre, existing assets. State assumptions in one line; ask at most one question.
2. **Shape and beats.** Pick the structure, write the beat table with pressure deltas and seconds that sum to the target (story-structure).
3. **Script pass** if the text is not yet shootable: value turns, enter late/leave early, dialogue as action (script-and-scene-craft).
4. **Visual rules.** Style lock, per-scene light sentence, identity strings, which characters/locations need sheets and plates (keyframes-and-consistency).
5. **Blocking and shot list.** Positions and movement, then rows with job, source, start→action→end, size/angle, lens, move, light, sound, duration (shot-language, shot-lists-and-boards).
6. **Column check and risk scoring.** Sizes, axis, screen direction, light, durations; split or restage Red shots.
7. **Keyframes and prompts** only if asked or needed: keyframe prompts, then the model-specific clip prompts (ai-video-prompts). Hand off to **ai-video** for generation.
8. **Record** decisions and IDs in the project files for anything longer than one turn (storyboard-projects).

## Done means

- Every script scene is covered by shots or listed as skipped with a reason.
- Every shot has one job, a start and named end state, one move or a reasoned none, a duration that fits its sound.
- Adjacent shots clear the cut geometry; no accidental line crossing; light direction consistent within a moment.
- Durations sum to the target (±1 s) and shot lengths vary.
- Identity strings and style phrase are identical in every prompt of the scene; no emotion words or negated visual words in prompts.
- Red-risk shots are already split or restaged.
- The output is the size the user asked for.
