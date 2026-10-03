---
name: storyboarding
description: Pre-production for film, ads, social video, short dramas and comics - turn an idea, script or reference video into a shootable or generatable plan. Use for story structure and beat sheets (three-act, Save the Cat, hook/build/payoff), writing or fixing scripts and scenes, shot lists and storyboard tables, shot sizes, angles, lenses, camera moves, blocking, 180-degree rule and continuity, timing and shot counts, animatic panels, character sheets, identity strings and continuity bibles for AI generation, first/last frames, turning a board into per-shot AI video prompts (Seedance, Kling, Veo, MiniMax H3), vertical short-drama episodes, comic and webtoon layouts, breaking down a reference video into a shot list, and managing storyboard projects. Triggers: "storyboard this", "shot list", "break into shots/beats", "分镜", "拆镜头", "拉片", "beat sheet", "make this script shootable", "keep my character consistent", "Seedance prompts from my board", "plan a 30s reel/ad", "comic page layout".
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

## Pick the right guide

Call a capability by naming the task, or say "use storyboarding: <capability>".

| Task | Read |
|---|---|
| Story shape, beat sheet, act breaks, beats per duration, emotion curve, 9-moment key board | [references/story-structure.md](references/story-structure.md), template [templates/cinematic-director/beat-sheet-template.md](templates/cinematic-director/beat-sheet-template.md) |
| Write or fix a script or scene, screenplay/A-V/YouTube formats, dialogue, scene design | [references/script-and-scene-craft.md](references/script-and-scene-craft.md) |
| Shot sizes, angles, lenses, camera moves, composition, blocking, 180°/30° rules, eyelines, coverage, vertical framing | [references/shot-language.md](references/shot-language.md) |
| Shot list or storyboard table, shot cards, timing and shot counts, risk scoring, animatic panels, grid boards | [references/shot-lists-and-boards.md](references/shot-lists-and-boards.md), template [templates/cinematic-director/shot-plan-template.md](templates/cinematic-director/shot-plan-template.md) |
| Character sheets, identity strings, style lock, location plates, keyframe prompts, first/last frames, continuity bible | [references/keyframes-and-consistency.md](references/keyframes-and-consistency.md) |
| Board → AI video prompts per model (Seedance, Kling, Veo, MiniMax H3), segment seams, repair order | [references/ai-video-prompts.md](references/ai-video-prompts.md) |
| Vertical short drama / micro-drama / AI comic drama episodes | [references/short-drama-vertical.md](references/short-drama-vertical.md) |
| Comic pages, four-panel strips, webtoons, knowledge comics | [references/comics-and-panels.md](references/comics-and-panels.md) |
| Break down a reference video into a measured shot list (拉片) | [references/reference-video-breakdown.md](references/reference-video-breakdown.md), script [scripts/video-shots/video-shots.mjs](scripts/video-shots/video-shots.mjs) |
| Project folders, IDs, asset naming, revisions, storyboard-app (MCP) projects, handoff | [references/storyboard-projects.md](references/storyboard-projects.md) |

Load only the file(s) the task needs.

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
