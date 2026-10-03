# Keyframes, character sheets and continuity bibles

> Distilled from: cinematic-director (wuwangzhang1216/DirectorSKILL, MIT), short-drama-storyboard (zenstory-ai/drama-skills, MIT), short-drama-director (lixiaoxiao9888-create/manju-laoli-skill, MIT), baoyu-comic (JimLiu/baoyu-skills, MIT), video (smixs/visual-skills, CC-BY-4.0, by Serge Shima), h3-storyboard (phileiny/h3-storyboard-skill, MIT), ai-video-storyboard (aicontentskills/ai-video-storyboard-skill, MIT).

Generators have no memory between generations. Consistency is engineered by writing the same facts the same way every time, and by fixing stills before spending video generations. The keyframe is the control point: a video model mostly re-animates what the still already decided.

## 1. The style lock (write once per project)

A Visual Theme block at the top of the board, pasted into every image and video prompt:

- Palette: 3-5 named colours or hex values, plus accent rules ("red only as an accent").
- Lighting style and colour temperature per scene (one sentence each, verbatim in every prompt of that scene).
- Lens character (shallow vs deep focus, focal range).
- Medium/film look: one phrase only, the same for every frame ("35mm still photograph, moderate grain"). Never mix "realistic" with "illustration" or "comic" words across one episode; a single stray style word pulls some faces toward a different look.
- Motion language: locked / dolly only / handheld.

Generate one wide **tone plate** per scene first and approve it; feed it to later frames only as a reference for colour, light and texture, not composition.

## 2. Identity string (the cheapest consistency tool)

One noun phrase of **30-50 words**, pasted verbatim into every keyframe and video prompt for that character. Never paraphrase, shorten for a close-up or "improve" it between shots; copy, do not retype.

Recipe, in order:

1. Age as one number (not a range), plus ethnicity where it is a fact about the face.
2. Two or three face-structure facts (jaw, eye set, brow, nose, hairline).
3. Exactly one checkable landmark (a mole and its side, a scar and its length, a chipped tooth). This is the QC handle.
4. One hair spec (length, cut, parting or tie-up side).
5. One wardrobe anchor, last: garment, colour, material, one detail visible at a distance.

Never put in it: mood or beauty words, camera/lens/light words, celebrity lookalikes, age ranges, era words doing wardrobe's job ("period clothing"), memory instructions ("same as the reference"), any state that changes during the story (wet hair, a cut lip), or a second person.

Good (46 words): `MEI, 24, a Chinese woman with an oval face, thin straight eyebrows, a small mole below the left corner of her mouth, black hair cut blunt at the jaw and tucked behind her right ear, in an army-green cotton postal jacket with a red collar tab`

Bad: `a beautiful mysterious young woman with striking eyes, wearing period clothing, cinematic look`

For a Chinese-prompt tool, write one Chinese string and freeze it; translating ad hoc per shot is paraphrase and drifts. For realistic humans, add 3-4 concrete facial details and a skin-fidelity clause ("visible fine pores and natural skin texture") to avoid plastic AI skin.

## 3. Character sheet

Make one for any character in more than three shots, before any shot keyframe.

- Views: front, three-quarter, full profile, full-body front (some pipelines prefer a face close-up plus front/side/back full body). Neutral expression, arms at sides, no props.
- Flat even light, plain mid-grey background, all views on one ground line filling ~80% of canvas height. Neutral light stops the reference from dragging its lighting into shots.
- Use a wide (16:9) canvas; four views on a square leave faces too small to crop. If views disagree on one canvas, generate each view separately and compose the sheet.
- Record: height and head-to-body ratio, face shape, eyes, hair, build, landmark, default outfit with fabrics, accessories, a 3-colour HEX palette (primary, secondary, accent), and an expression range (neutral, happy, thinking, determined) described as muscles, not adjectives.
- Use the three-quarter head crop as the reference for close and medium shots, the full body for wides.
- Related characters (family, team): derive them from the lead's sheet. Share jaw or eye-set traits for relatives and at least one palette colour across a family or faction, so the cast looks like one production.
- For more than five characters, give each its own reference image; separate single-view images beat one multi-view collage.

## 4. Location plate and props

- Generate the empty location at the master angle first and approve it. Derive reverse and cross angles from it by instruction editing so shared surfaces carry over.
- Write light direction in **room coordinates** ("the single window is on the east wall, hard sun at 30° elevation"), then translate per camera. Writing "key from camera-left" for both a master and its reverse silently moves the window.
- Era lock: a positive clause of materials (whitewashed plaster, enamel basin) plus a short negative clause naming materials and processes (no moulded plastic, no printed logos, no stainless steel). Four to six negatives maximum.
- Props that appear in more than one shot get a record: object, which hand, orientation, fill level, state. If a recurring object has no record yet, describe it in identical words in every shot and flag it for a record.

## 5. Writing a keyframe prompt

Slot order (early tokens weigh more; each slot constrains the next):

1. Shot ID (traceability)
2. Size, angle, lens
3. Identity string, verbatim
4. Pose that implies action (expression as muscles: "jaw set, eyes narrowed, mouth closed")
5. Wardrobe and held props
6. Location and era
7. Light: named source, side, height, ratio written in words ("lit side about four times brighter")
8. Composition: where the subject sits and what fills the rest
9. Texture / medium (the style lock phrase)
10. Constraints: aspect ratio and a short list of named exclusions

Renderability test: could someone draw this frame without inventing any fact? Check each person's position and distance to others, body facing (not just gaze), hands and held props, foreground/mid/background contents, the one focal point, which side of the axis the camera is on, light source and quality, and what is unchanged from the previous shot (one line "same as previous shot except X" is enough). About 100-150 words in English covers it; extra words are usually restatements.

**Start-only rule.** A first-frame keyframe shows only facts true at the start of the shot. Anything that appears only through the action or at the end (the hand already on the rope, the door already open) is drift. If the workflow uses an end frame too, it shows only end-state facts. The end frame is a projection of the shot's planned end state, not a new decision; when they disagree, the frame is wrong.

**Static test.** Could a still photographer capture every fact at once? Move ordered verbs ("then", "finally"), expression changes, camera moves and changing weather to the motion prompt.

**Panel jobs.** A keyframe should imply a motion about to begin, show one just completed, deliver a reveal, state a power relationship or plant a clue. Pose techniques: weight on the back foot with the front heel lifted; mid-stride; coat hem lagging; gaze just outside the frame edge; an object in flight; a hand 5 cm from the handle.

**Single-subject anchor.** Open the prompt with one named subject. Never write "X and Y in the same frame" about one person's hand and face: models render two heads. Give every pronoun an owner ("her left hand", not "this hand"). Delete adjectives that describe processes a model cannot draw ("streaming", "slightly curled"); write the visible result ("raindrops hit the back of her hand and splash").

## 6. First and last frame pairs

Generate and approve the first frame, then derive the last frame from it by instruction editing ("Keep everything identical: same face, jacket, room, framing, grain. Change only this: his head is turned 30° left and his eyes are open.") or low-strength img2img. Never generate the last frame from scratch: it re-rolls every unstated variable and the video morphs between two worlds.

Pair-scope test: if more than one of {one body part moved, one object moved, one light changed} differs, it is two shots. Chain at most 2-3 edits from one master before regenerating from the master. Use pairs for clear state changes where the path does not matter (sitting down done, handoff done); if the path itself is the drama, split the shot instead of trusting interpolation.

## 7. Continuity bible

Walk these 15 axes twice per shot (when writing, when reviewing): face, hair, wardrobe per layer, props (hand, orientation, fill), wet/dirt/blood, injury/makeup, light direction, time of day, weather, geography, screen direction, eyeline, camera height, palette, lens feel.

Per shot record: screen direction, eyeline target (side and height), camera height, key light direction, each character's state (hair, wardrobe state, props in which hand), weather, time, start state, end state, must-match-previous, must-match-next.

**State-change ledger:** one row per shot, written before generation and corrected after approval: what changed in this shot, what carries into the next, what to verify there. Every tracked state moves at most one band between adjacent shots; a two-band jump reads as a missing shot, a reversal reads as a different day. Postures persist: once someone has sat up, later shots say "still sitting up" until a shot shows them lie back.

**Cast roster per segment:** everyone placed in a scene must appear at least once in each multi-shot segment (single, background figure, reaction) or be written out ("exits through the door, frame-left"). People silently vanishing between segments is the most common cross-segment error.

## 8. Reference binding

- Give every reference asset an explicit role in the prompt: what it defines (appearance, outfit, location, motion, voice, first frame) and what must not be taken from it ("do not use the image background", "do not use the people in this video").
- Bind each person individually ("The courier corresponds to Image 1; use only face, hair and clothing"), never "Images 1-4 are the four characters".
- One identity source per person. The same character in two states (before/after) needs two reference slots, each tied to its time range; budget re-rolls.
- Do not restate in text what a reference already fixes; describe and lock instead of reinventing costume, face or era.
- Reference strength: start mid-dial; lower one step if the shot inherits the sheet's flat light or neutral pose; raise one step if the face reads as a relative.
- Seeds reproduce only byte-identical prompts; use them to test one word, not as a consistency tool. Record them anyway.
- Real-person photos as references are blocked or risky on many platforms; photoreal generated characters are generally fine. Check the target tool's policy.

## 9. Asset naming

```text
PROJ_SCnn_SHnn_vNN_role.ext      shot assets          RAIN_SC02_SH04_v03_kf-first.png
PROJ_SCnn_vNN_role.ext           scene assets         RAIN_SC02_v01_amb.wav
PROJ_SUBJ-slug_vNN_role.ext      characters/places    RAIN_CHAR-mei_v02_ref-face.png
PROJ_SCnn_SHnn_log.md            every prompt sent for the shot, in order
```

Roles: ref-face, ref-body, ref-fit, plate-wide, kf-first, kf-last, kf-alt, clip, clip-FAIL-<axis>, vo-<char>, amb, sfx-<name>, mus, cut. Versions never reused; sibling options get letters (v03a, v03b). Approval lives in the log, not in a renamed file.

## 10. Keyframe QC before any video generation

- Identity string present and verbatim; landmark visible where the size allows.
- Face drift matters from medium-wide inward (head ≥15% of frame height) or on screen longer than ~1.5 s; below that, silhouette and wardrobe carry identity.
- Pose matches the shot's start state; no end-state facts leaked in.
- Light side matches the room-coordinate rule and the previous shot of the same moment.
- Axis side, gaze direction and screen position match the board.
- No unrequested text, logos, watermarks or extra people.
- If a fix is needed, edit the keyframe; do not hope the video model will repair it.
