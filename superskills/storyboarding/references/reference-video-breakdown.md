# Breaking down a reference video into a shot list

> Distilled from: video-shots (eternityspring/reelbench-skills, Apache-2.0). The bundled script `scripts/video-shots/video-shots.mjs` (with `report.css` and `report.js`) is copied as-is under Apache-2.0; see `scripts/video-shots/LICENSE.source-repo`.

Use when the user gives a finished video (an ad, a short-drama episode, a trailer, a viral reel) and wants its shot list: to copy its rhythm, study its coverage, or rebuild it as a new storyboard. The core idea: **cut points and durations are measured by code, never guessed by the model.** The model only judges size, function, camera move, frame description and rhythm role, and code checks those judgments.

## 1. Requirements

- `node` 18+ (standard library only, no npm install) and `ffmpeg` + `ffprobe` on PATH.
- If either is missing, say so and stop; do not estimate cut times by eye as a substitute. Do not install anything without the user's go-ahead.
- No speech recognition: dialogue comes only from burned-in subtitles visible in frames. No face recognition: cast IDs (P1, P2) are assigned by hand.

`S` below = the absolute path of this skill's `scripts/video-shots` folder. Keep the three files together; `render` inlines the CSS and JS.

## 2. Steps

**0. Scope.** Whole film (default) or one section (trim it with ffmpeg first). Purpose: imitation (weight frame and camera notes), edit rhythm study (weight durations and functions), or ad inventory (weight product and text-card shots). The table structure is the same.

**1. Seed the working file** (cut points fixed here):

```bash
cd <output dir>
node S/video-shots.mjs seed <video> --track track.json --title "<title>" --lang en > shots.json
```

Read the stderr summary (duration, fps, cut count). Average shot over ~10 s with obviously too few shots → re-run with `--threshold 0.15` (dark, slow or same-angle dialogue films). Far too many shots → raise toward `0.4` or merge later. Re-running costs seconds.

**2. Extract keyframes and contact sheets:**

```bash
node S/video-shots.mjs frames shots.json --video <video>
node S/video-shots.mjs sheet shots.json --cols 4 --rows 6
node S/video-shots.mjs sheet shots.json --cols 4 --rows 6 --pick b
```

Each shot gets `frames/S01a.jpg` (at 15%) and `S01b.jpg` (at 85%). Sheet "a" shows content; comparing "a" with "b" shows camera movement. Read the sheets first and open single frames only for unclear shots.

**3. Fill the judgment fields** in batches of up to 25 shots (one sheet), in this order: size → category → camera → frame → rhythm. Also fill `subjects` (cast IDs), `onscreenText`, `audio` (burned-in dialogue with speaker). Edit only these fields; `start`, `end`, `seconds`, `motion`, `seedCuts`, `meta` are machine evidence and the validator flags changes.

**4. Fix missed or extra cuts.** Dissolves and dark-to-dark cuts are missed; handheld shake and flashes create false cuts. If frame a and frame b show two different scenes, a cut was missed.

```bash
node S/video-shots.mjs recut shots.json --track track.json --split 63.5 --merge 45.97 > shots.new.json && mv shots.new.json shots.json
```

Shots are renumbered and re-measured; added cuts are logged in `manualCuts`. Split or merged shots have their labels cleared: re-extract frames and re-judge them.

**5. Validate (do not skip):**

```bash
node S/video-shots.mjs validate shots.json --track track.json --frames frames --lang en
```

About fifteen code gates (the count differs between the tool's help text and its docs): continuous timeline from 0 to the end, durations consistent, sequential IDs, enum vocabularies, frame descriptions specific (8+ English words, no vague words, not starting with "This shot"), no duplicate descriptions, cast match, category evidence (dialogue needs audio, text card needs on-screen text, reaction needs a subject, empty shot has no people), **camera claims vs measured motion** (claiming a push or pan while pixels barely changed is blocked), cuts must come from detection or `manualCuts`, keyframes present, rhythm notes complete. Fix and re-run until it passes. A skipped gate is not a pass; report it.

**6. Render and report:**

```bash
node S/video-shots.mjs render shots.json --md --track track.json --lang en > shots.md
node S/video-shots.mjs render shots.json --html --track track.json --video <path to video relative to report> --lang en > shots-report.html
```

The HTML report is one offline file: synced player, rhythm strip, searchable shot table with first/last frames, distributions, cast and QC results. Report in one sentence: shot count, average shot length, cuts per minute, dominant sizes and moves, longest and shortest shots, report path, how many cuts were added or merged, skipped gates, open hints.

## 3. Vocabularies (enums the validator accepts)

| Field | Values |
|---|---|
| size | `none` (black, pure text card, graphics), `extreme-wide`, `wide`, `medium-wide`, `medium`, `medium-close`, `close`, `extreme-close` |
| category | `establishing`, `subject`, `dialogue`, `reaction`, `insert`, `pov`, `empty`, `product`, `text-card`, `transition`, `archive` |
| camera | `static`, `push-in`, `pull-out`, `zoom-in`, `zoom-out`, `pan-left`, `pan-right`, `tilt-up`, `tilt-down`, `truck-left`, `truck-right`, `pedestal-up`, `pedestal-down`, `tracking`, `arc`, `whip-pan`, `handheld`, `shake`, `rack-focus`, `micro-push`, `roll`, `drone` |
| transitionIn | `cut` (default), `dissolve`, `fade-in`, `fade-out`, `whip`, `match-cut`, `wipe`, `morph` |
| rhythm (optional; all shots or none) | `hook`, `setup`, `build`, `beat`, `turn`, `payoff`, `breath`, `close` |

Judging tips:

- Size is how much of the frame the person fills, not lens or blur. An over-the-shoulder is sized by the person being filmed, usually medium-close.
- One category per shot: the job the editor would miss most if the shot were deleted. Size and category are independent (a talking ECU is `dialogue`, a fight wide is `subject`).
- Camera: first ask "did the whole frame move?" If only people move, it is `static`. Push/pull changes perspective; zoom does not. When a shot has two moves, name the dominant one and note the other; if both matter, it probably needs a split.
- When unsure, pick the most conservative value and write the doubt in `note`. A confident wrong label is worse than a flagged one.
- Frame descriptions must let someone find the shot: who is where in frame, doing what, light source, foreground/background. Rhythm notes say what the viewer gets at that moment ("0.9 s in: a running back, no face yet: where is she going?"), not "very engaging".

## 4. From breakdown to new board

1. Keep the measured skeleton: shot count, duration pattern, size and category distribution, where the hook, turn and payoff fall.
2. Replace content beat by beat with the new story; keep each shot's function and rhythm role.
3. Rewrite frame descriptions as keyframe prompts for the new characters ([keyframes-and-consistency.md](keyframes-and-consistency.md)) and camera moves as motion prompts ([ai-video-prompts.md](ai-video-prompts.md)).
4. Do not copy identifiable shots, characters or dialogue from someone else's film; borrow structure and rhythm, not expression.
