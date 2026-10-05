# Shot lists, storyboard formats and timing

> Distilled from: cinematic-director (wuwangzhang1216/DirectorSKILL, MIT), short-drama-storyboard (zenstory-ai/drama-skills, MIT), video (smixs/visual-skills, CC-BY-4.0, by Serge Shima), ai-video-storyboard (aicontentskills/ai-video-storyboard-skill, MIT), storytelling (fal-ai-community/skills, MIT), h3-storyboard (phileiny/h3-storyboard-skill, MIT), film-storyboard-skill (rainlib/ai-storyboard, GPL-3.0 — ideas only, in our own words).

Build shot rows only after the beats exist ([story-structure.md](story-structure.md)) and the visual rules exist (style, light, identity: [keyframes-and-consistency.md](keyframes-and-consistency.md)). A shot list written before those is a list of pictures.

## 1. Pick the format by request size

| Request | Deliver | Ceiling |
|---|---|---|
| One prompt for one shot | The prompt + up to 3 lines of rationale | No table |
| One-line brief ("30 s ad for X") | Assumptions in one line, then a compact board | One screen |
| A scene or script | Beat table → full shot table | The pipeline |
| "Just give me the shots" | Compact 3-column table | No prompts |
| Pitch / animatic | Panel board (keyframe cards) | Panels + image prompts |
| Comic | Page/panel script ([comics-and-panels.md](comics-and-panels.md)) | Pages |

Over-production is the most common failure. Do not volunteer neighbouring deliverables; offer them in one line.

## 2. Full shot table

| # | Sec | Beat / function | Source | Frame content | Blocking start → action → end | Size / angle | Lens | Move | Light dir | Continuity anchors | Sound | Risk | Transition | Gen note |
|---:|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|

Column rules:

- **#**: story order, zero-padded, stable for the life of the project. A split becomes `04a`/`04b`; never renumber `05`.
- **Sec**: in-out inside the scene plus duration, `0:12-0:18 (6s)`.
- **Beat / function**: beat ID plus the one job, `B4 · irreversible delivery`. Empty = the shot should not exist.
- **Source**: the script scene ID (and a short quote of the action or line it carries). Every script scene must be covered by some shot or listed as deliberately skipped with a reason at the top of the board.
- **Frame content**: what an artist would draw: subject placement plus the 2-3 set or prop elements that must be in frame.
- **Blocking**: three states, the end named in words a generator can be held to. "He hesitates" is not an end state; "hand down at his thigh, still facing the door" is.
- **Size / angle**: one rung off the ladder plus a named height or degrees; camera heights in cm so they are not confused with focal lengths.
- **Move**: exactly one named move with distance and duration (`dolly-in 25 cm over 6 s`) or `locked`, with a reason either way.
- **Light dir**: key side relative to this camera, height, practical source, ratio, what the fill is.
- **Continuity anchors**: named items copied from the continuity bible, not invented per row.
- **Sound**: dialogue (with timing basis), SFX, ambience, music cue.
- **Risk**: band and scores from §6.
- **Gen note**: the one thing the generator will get wrong, the instruction that prevents it, and the split plan if it still fails.

Full template with a worked 5-shot scene: [../templates/cinematic-director/shot-plan-template.md](../templates/cinematic-director/shot-plan-template.md).

Compact variant (chat-width, first pass):

| # | Frame | Action → end state |
|---:|---|---|
| 01 | WS · 35mm · high +15° · locked · 4s | Climbs onto the landing, three steps, ends squared to the door, envelope at chest |

Ad/social variant (one block per shot): `## Shot N (start-end s) — Purpose` then Composition, Camera move, Lighting, Subject, Action, Audio, and a copy-ready prompt.

Short-drama/vertical rows add: who is on screen and where (every placed person must appear or be marked as exiting), line-by-line dialogue with delivery tone, and an end-state line that the next shot starts from.

## 3. Shot card (when one shot needs full direction)

Shot ID · Beat (what changes) · Emotion (as body behaviour) · Frame · Composition · Camera · Movement reason ("what changed?") · Action · Eye trace (first 0.3 s) · Duration · Cut type · Sound · Light/colour · Production note. An empty field is missing direction: fill it or drop the shot.

Three-detail rule for every shot: one **environmental pressure** (cold fridge light, wet asphalt, a buzzing tube), one **physical micro-action** (jaw locks, knuckles whiten, a swallow), one **sound or visual motif** tied to the piece's spine. Zero = filler; one = thin; strong shots carry all three. Establishing, transition and hero-product shots go lazy first.

## 4. Timing

**Shot count from duration.** `N = duration / ASL`. Reserve one anchor shot at 2-3× ASL and one shortest at 0.25-0.5× ASL. Distribute the rest so the median sits below the mean: about 15% long (1.5-3×), 40% near ASL, 45% short (0.4-0.8×). Reconcile to target ±1 s by trimming the near-ASL shots, never the anchor.

| Register | ASL |
|---|---|
| Contemplative long take | 15-40 s |
| Observational | 8-15 s |
| Conventional scene | 5-12 s |
| Suspense build | 3-6 s |
| Dialogue comedy | 2-5 s |
| Rapid action | 0.8-2.5 s |
| Product / sell | 0.8-2 s |
| Feed / vertical | 0.7-2 s |

**Duration comes from content, not arithmetic.** Lay the sound timeline first: each line at its natural speaking time (plus 0.5 s before speaking and ~1 s for the listener's reaction), then silent actions that must be seen. That timeline is the scene length; cut points go at speaker changes, listener reactions, inserts and action changes. Never shorten a shot and ask the actor to talk faster; split a long line across speaker and listener shots instead. If total content is thin, let the piece get shorter rather than stretching atmosphere shots (an atmosphere-only shot over ~5 s, or an atmosphere run over ~10 s, is padding).

**Rhythm ladders** (the pause before the impact matters more than cut speed):

```text
Slow-burn drama   4, 4, 3, 2, 1, pause, 2
Product arc       3, 2, 1.5, 1, 0.5 (macro), 2 (hero)
Anxiety build     2, 1, 1, 0.5, 0.5, 0.3, pause, 1
Impact            pause, 0.2 (flash), 2 (still aftermath)
```

Shot lengths in a scene should take at least three different values; identical lengths for most shots is a defect, not tidiness.

**One shot, one beat.** If a shot must carry more than two or three expression or action beats, split it into 2-3 s shots with one main beat each. Packing many beats into one long generated shot makes the model average them out and the face barely moves; the cut itself re-reads the character for the audience.

**AI handles.** Generated clips lose head and tail. Budget cut length + 1.5 s per kept take (+2.5 s for performance or dialogue). Fast cutting is expensive because the handle is paid per take; for montages, generate one 8-10 s continuous clip and harvest 3-4 non-adjacent fragments.

## 5. Coverage check (read columns before rows)

- Every beat has at least one shot; no beat has more shots than the turn beat.
- Every shot has exactly one job.
- Read the Frame column alone top to bottom: it should tell the story. Five variations on one picture = angles, not coverage.
- Read the Blocking column alone: each end state is the next row's start state, or the cut is doing work you can name.
- Count moving shots against the move budget (a calm drama scene: about one in five).
- Track screen direction down the page; the first reversal owes a neutral shot or cutaway.
- The scene has an orienting entry and an exit to leave on; not insert-to-insert.
- Adjacent sizes differ by two rungs on the same axis, or one rung with a 30°+ angle change.
- Light direction column has no unexplained flips.

## 6. Risk scoring for AI generation

Score each 0-3 in this order: Action / People / Camera / Duration / Interaction / Continuity.

| Dimension | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Action | Ambient (breath, cloth) | One whole-body action | Two chained, or one fine-motor | Precise action with required outcome (catch, pour, unlock) |
| People in frame | 0 | 1 | 2 | 3+ (partial bodies count) |
| Camera | Locked | One slow move | One fast or compound move | Move + reframe, or a move matched across a cut |
| Duration (kept) | ≤3 s | 4-5 s | 6-8 s | >8 s |
| Interaction | None | Touches static set | Manipulates a prop | Contact between subjects, a handoff, or a prop meeting a fixed feature (under a door, into a slot) |
| Continuity | Standalone | Matches one shot | Matches prior and next | Locked face plus progressive state (wet, blood, dirt) |

Bands: **Green 0-5** generate directly, batch 4 takes. **Amber 6-11** keyframe first (and last frame if available), simplify one dimension, iterate one variable at a time. **Red 12-18** do not attempt as written: at 12-14 split at the natural beat break; at 15-18 restage (move the action off-screen and show the reaction plus sound, or show only the aftermath). Override: Interaction 3 plus any other 3 is Red regardless of total. One Red in five shots is a plan; three is a wish.

Things current models do badly, so board around them: contact-driven cause and effect (a hand knocking over a cup), liquid volume, an object splitting in two, handoffs, stairs, running with a follow camera, fine hand work, leaving and re-entering frame, full 180° turns, two people lip-syncing in one clip, sitting down into furniture, falling. Standard fixes: cut before contact and show the result in the next shot; an arm sweeping past the lens as a cut point; keyframe the seated or fallen state and animate only the settle; write liquid with a hard boundary ("spread about a hand's width and stopped").

## 7. Panel boards and animatics

A panel is not a frame grab; it must carry a beat with no motion. Every panel needs: one readable beat (one sentence), one function tag, one emotion routed through body or object, and one implied motion.

Keyframe card fields: Panel ID · Timecode/hold · Function · Beat · Framing + lens · Subject the eye lands on in 0.3 s · Depth layers (FG job / MG job / BG job) · Implied camera (the move this still is the first frame of) · Light + palette · Emotion-via-object · Motion-as-still · Caption · Sound under the hold · Production note.

Motion in a still, pick one cue: directional blur smear (sharp subject, streaked world), frozen partial blur (one element blurred), streak frame (implied whip), posture vector (a pose that can only resolve forward), sharp subject on dissolved field, deliberate zero-blur freeze.

Panel density follows loudness: a quiet ritual beat = one held panel for 1.5-2.5 s; climbing pressure = 3 panels getting tighter and shorter; an impact = a burst of 3-9 short panels; never two bursts back to back; aftermath = one held panel. A 30 s spot lands around 18-26 panels.

Objects appear on a panel only when they change state (board the after-state). Hands appear only on a decision (name the verb: grip, release, sign).

### Drawing the panels: pick a tool

| Situation | Use | Why |
|---|---|---|
| The artist already draws in an app | That app | Speed comes from their own brushes and shortcuts |
| Animation studio boards with camera moves and an editorial round trip | Toon Boom Storyboard Pro ([storyboard-projects.md](storyboard-projects.md) §5c) | Panels, captions, animatic and EDL/AAF/XML export in one place |
| The artist lives in Photoshop | Photoshop (below) | One layer per panel; a rough animatic from the frame timeline |
| Comic pages or webtoons | Clip Studio Paint ([comics-and-panels.md](comics-and-panels.md) §1) | Native frame borders and webtoon export |
| Rough sketches for a client board | Boords' frame editor ([storyboard-projects.md](storyboard-projects.md) §5a) | Shapes, arrows and zoom, pan and tilt overlays on the frame |
| Free, no account | Storyboarder ([storyboard-projects.md](storyboard-projects.md) §5d) | Free and open source |
| Nobody draws: AI keyframes | **image-creation**: Nano Banana in `references/gemini-nano-banana.md`; Midjourney has no API and its terms forbid automating it, so Claude writes the prompts and the user runs them (`references/hosted-models-flux-replicate-fal.md`) | Rendering stills is that craft's job; this guide supplies the keyframe cards and identity strings |

**Photoshop.** Desktop app; Claude prepares the panel list, captions and file names and the user draws. For a rough animatic without an editor:

1. One layer (or layer group) per panel, named by shot ID, bottom to top in shot order.
2. Window → Timeline, choose Create Frame Animation, then Make Frames From Layers from the Timeline panel menu.
3. Select a frame and click the delay value under it to set its hold in seconds (Other... for a custom value such as 3.5); use the shot durations from the board.
4. File → Export → Render Video for a video or image sequence (Save for Web (Legacy) gives a GIF).

In Claude, Adobe's official **Adobe for creativity** connector (Customize → Connectors → Browse connectors; works as a guest with about 40 tools, sign in with an Adobe account for more and for work saved across sessions) gives 50+ tools across Photoshop, Lightroom, Illustrator, Firefly, Premiere, Express, InDesign and Stock. Use it for edits on images the user supplies (crops, retouch, resizing a cut for a platform), not as a board app.

## 8. Grid boards for multi-shot video models

Some models accept one image containing a numbered grid of panels as the shot order (Seedance 2.5 officially up to 15 panels). Use clean line art or stick figures with minimal text, then declare in the prompt that the grid gives order and rough composition only and that its line style, labels and placeholder figures must not be copied; supply appearance from separate character/scene references and describe each shot's time, composition, action and end state. Separate keyframe images align better than one grid. Details: [ai-video-prompts.md](ai-video-prompts.md).

## 9. Done means

- Every script scene has a shot or a recorded reason for skipping it.
- Every shot has one job, a start and an end state, one move or a reasoned none, a duration that fits its sound.
- Sizes, axis, screen direction and light pass the column check.
- Red shots are already split or restaged on paper.
- Durations sum to the target, and shot lengths vary.
