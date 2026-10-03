# From board to AI-video shot prompts (per model)

> Distilled from: cinematic-director (wuwangzhang1216/DirectorSKILL, MIT), video (smixs/visual-skills, CC-BY-4.0, by Serge Shima — attribution required), seedance-2-5-video-director (liyue-aigc/seedance-2-5-video-director, MIT), short-drama-director (lixiaoxiao9888-create/manju-laoli-skill, MIT), h3-storyboard (phileiny/h3-storyboard-skill, MIT), storytelling (fal-ai-community/skills, MIT), ai-video-storyboard (aicontentskills/ai-video-storyboard-skill, MIT).

This file turns approved board rows into copy-ready prompts. It does not run generations: submitting jobs, model routing by price, API calls, stitching and rendering belong to the **ai-video** super skill. Model facts below reflect the sources' snapshots (mid/late 2026); limits change, so check the tool's current UI or docs before promising a duration or reference count.

## 1. Universal rules (every model)

1. **Behaviour, not emotion.** "He is afraid" renders nothing. Write 2-4 observable cues: eyes drop, jaw locks, a swallow, fingers curl on the doorframe. More than four reads as overacting.
2. **One primary action + one camera behaviour + one environmental motion per clip.** No move at all is often best. A move plus a reframe is two shots.
3. **Every action has an end state.** "He turns until his profile is against the window, then stops." The end frame is where the model steers.
4. **Weight at the start.** Subject and action first, camera and light in the middle, style last.
5. **Full sentences, no tag spam.** Cut "cinematic, masterpiece, 8K, stunning, epic, dynamic camera, beautiful lighting". Each placeholder hides a missing decision.
6. **Invariants verbatim.** Identity string, wardrobe, light direction, location and era repeated identically in every prompt of the scene ([keyframes-and-consistency.md](keyframes-and-consistency.md)).
7. **No contradictions.** Still pond + flowing water; close-up + wide landscape.
8. **Describe consequences.** Tyres throw water curtains; the lid actually unscrews. A causal chain doubles as QA.
9. **Negation does not work in the positive prompt.** Video models are insensitive to "not" and sensitive to word roots: "the jade does not glow" produces glowing jade; "no smile" invites a smile; "no empty room" opens on an empty room. Rewrite as the positive: "matte dark-green stone, its natural colour", "lips pressed, mouth corners pulled down". Keep generic low-risk cleanup (watermark, text, extra fingers) in the negative field or a short closing exclusion list; name instances ("no plastic, no wristwatch"), never categories ("no modern objects").
10. **Explain intent once.** After the physical directive, one line of why ("she is not complaining; she is waiting for him to confirm what she already guessed") improves performance.
11. **Dialogue must fit.** Leave time for breath, listening and reaction. Shorten the line before forcing fast delivery. Reaction follows the trigger: no tears or blush before the line lands.
12. **Declare priorities when overloaded:** the subject that must survive, the shots that must appear, where the model may freestyle, the mandatory final frame.

## 2. Pick the prompt shape from the control surface

| Shape | When | Template |
|---|---|---|
| S1 motion-only | Image-to-video from an approved keyframe | `[Camera behaviour]. [Subject starts in visible state], then [one action with pace and direction]. [Environment reacts]. End with [final pose/composition]. Maintain [identity / costume / location / light direction].` |
| S2 full description | Text-to-video | `[Format/style]. [Subject with identity string]. [Location + era + time + atmosphere]. [Primary action]. [Size + lens + angle + move]. [Light source + direction + quality]. [Composition]. [Audio]. [Constraints].` |
| S3 keyframe pair | First + last frame | `Start from the first image and end on the second. Between them, [one continuous transformation]. Camera [path or locked]. Motion [eases in / constant / accelerates once]. Nothing else changes: [identity / costume / set / light] identical in both frames.` |
| S4 multi-shot timestamped | Model accepts several shots per generation | `Overall: [tone, identity and setting rules]` then one line per shot: `[00:00-00:03] Shot 1: [size/angle]. [action]. Camera [move]. [one light or sound cue]` |

S4 rules: identity, wardrobe and palette live only in the Overall block; re-describing a character inside a segment recasts them. No emotion words inside segments. Timestamps are continuous, non-overlapping and sum to the clip length.

Do not describe what an input image already shows in S1; describe motion. Do not invent features a model does not expose (camera-control UI, last-frame slot, negative field); find out which it has: text-to-video, image-to-video, last frame, reference binding, camera controls, native audio, duration range, multi-shot, extend, seed, negative field, video-to-video.

## 3. Splitting the board into generations

- Most clips are 4-15 s. Default split when the model cannot multi-shot: 10 s = 2 × 5 s, 30 s = 6 × 5 s, 60 s = 12 × 5 s.
- Clip length defaults: 3-5 s for character performance, 3-4 s for fine hand work, 8-12 s for environment or product motion with no legible face.
- Within one generation, one primary state change per time window, and windows of 3 s or more where timing must be honoured.
- **Seams between generations** (each generation forgets the last). Pick per seam: (1) end-state inheritance: write the previous segment's last frame concretely (who, where, posture, prop state) and feed a still of it as the next segment's first frame or reference; (2) a hard cut with a changed angle and size so the jump reads as an edit; (3) a 1-2 s transition shot with a job (atmosphere, a sound bridge, a time jump), at most about three per episode. (1)+(2) is the default for continuous drama.
- Open every segment with one named subject in the first clause, not with environment, or the model may open on an empty set.

## 4. Seedance (ByteDance; Dreamina/Jimeng, API)

**2.0 / 1.x.** Several shots inside one 5-15 s generation using cut markers: `Shot 1. ...` `Cut to. ...` `Camera cut to. ...`. 2-3 shots per 5 s clip; hard cap about 5 shots per generation; size duration to shot count (4 shots need 10-15 s). Every shot shares an anchor (character, location or lighting recipe) with its neighbours. Parameters in older pipelines are appended (`--resolution 1080p --duration 5 --camerafixed false --seed 42`). Characters bind with `@img1`-style references plus the identity block. 2.0 has no first/last-frame mode in some pipelines; references lock appearance only. If cuts smear into one continuous take, put a guard paragraph at the very top: "This must be a clearly edited multi-shot sequence with visible cuts. Do not generate one continuous take. Each shot has a different angle and framing. Keep the same face, clothing, hair and build in every shot."

5 s micro-arc scaffold: 0.0-0.8 establish (insert or ECU), 0.8-1.6 action (MS), 1.6-2.5 turn (new framing), 2.5-3.6 reaction (tight CU), 3.6-5.0 climax/final image.

**2.5.** 4-30 s single pass (30-180 s in Long Video mode), up to 30 images + 10 videos (≤30 s total) + 10 audio clips (≤30 s total); timestamps honoured to the second. Duration, ratio and resolution are set in the UI/API, not in the prompt (Long Video restates them at the top). Prompt order: asset declaration → one-line summary (subject + place + event + style + camera idea) → plot by timeline → audio → global continuity and bans. Markers: music `( )`, sound effect `< >`, dialogue `{ }`, on-screen text `【 】`. Dialogue formula: language + accent + delivery + speaker + `{line}`. Re-mention an asset where it matters. Stage structure: `[Stage n] Continue from previous: <unchanged>. Primary event: <one action>. End state: <visible state>.` Specific prohibition lists beat generic ones ("no exaggerated crying, no fast cuts, no BGM, no premature tears"). Transitions: add "no rigid cutting, no objects appearing out of thin air"; gate effects that must not fire early ("only after 25 s, triggered by the click").

Multi-grid storyboard mode (2.5): declare `@Image 1` as the complete ordered board, each panel one full shot, read left to right, top to bottom, and not a character or style reference. Map separate character, prop and scene references. Then per shot: time, composition, camera height/framing, action, spatial relation, end state. Close with global style, physics, continuity, prohibitions. Simple line or stick-figure boards work best; independent keyframe images align better than one grid.

Extension: always say whether new footage goes **before** the source (ends on its first frame) or **after** it (starts from its last frame); describe only the new interval. Edit: location + exact target + add/remove/replace + time, and list everything that must not change.

## 5. Kling (Kuaishou)

**3.0:** up to 6 shots and 15 s per generation with native audio and lip-sync. Five layers: Scene → Characters → Action → Camera → Audio. Declare characters first with labels and reuse the label in every shot: `[Character A: late 40s, grey-streaked beard, navy peacoat]`. Each shot line needs framing + subject + motion; empty shot lines collapse into one take. Dialogue: unique labels, anchor the line to an action ("pulls a folded note from his pocket and reads aloud: ..."), tone inside the tag (`[Character A, raspy deep voice]: "We're out of time."`), and a visible transition between two speakers' lines or they overlap.

**1.x-2.x:** one continuous take per clip; Element Binding with 3-4 reference images for identity; Motion Brush for per-region motion. The negative field takes plain nouns, not "no X": `blurry faces, distorted hands, extra fingers, watermark, subtitles, text overlay`. Keep it short.

## 6. Veo (Google)

Veo 3.x: 4, 6 or 8 s clips with native audio and lip-sync; 3.1 adds image-to-video first frame and reference ingredients. 50-200 words; subject and camera first. Dialogue: lead-in verb + quotes or colon (`He whispers: "Don't move."`), delivery modifiers before the verb, at most ~8 s of speech per clip. Label sound with `Audio:` / `SFX:`. Structured JSON prompts (scene-by-scene fields) reduce concept bleed when continuity is strict.

## 7. MiniMax H3 (open weights, ComfyUI)

- One shot holds one or two expression beats. A 7 s close-up with nine beats came out frozen; three 2-3 s shots with one beat each performed. Split rather than pile up.
- A line of dialogue makes the model give that shot more time, stolen from other shots; keep continuity-critical background shots out of the same generation as dialogue, or run both versions.
- Never write "nothing changes" (it freezes or contradicts). Say what holds and why.
- Make the moving body part the grammatical subject: "her wrist turns, knuckles lift over the fold, fingertips land" plus "the palm never leaves the cover"; otherwise the prop moves by itself. Start with the hand already touching the prop.
- Sizes as crop relations ("cropped at mid-chest, top of head just inside frame"), not fractions (a requested 2/3 came back at about half).
- Do not name objects that must not appear; the name invites them.
- Multi-person shots establish relationships only; give each speaking line its own single shot.

## 8. Worked example (board row → S1 prompt)

Row: MCU, 50 mm, eye level, locked, 5 s. Courier faces the door; right hand rises, knuckles stop 3 cm short, then lowers to his thigh. Key from a bulb high camera-left.

```text
Locked camera, medium close-up at eye level. The courier stands squared to the dark door, envelope held
up in his left hand. His right hand rises toward the wood and his knuckles stop about three centimetres
short, hold for one second, then lower until the hand rests against his thigh. Dust drifts in a cold
window shaft behind him; his breath shows faintly. End with his hand at his thigh, still facing the door.
Maintain [identity string], grey padded jacket, cap pushed back, hard bulb light from high camera-left.
Avoid: knocking, hand touching the door, text, watermark.
```

Bad: `Cinematic tense moment, courier hesitates at the door, dramatic lighting, emotional, masterpiece.`

## 9. Repair order when a clip fails

Diagnose before rewriting: asset mismatch → prompt overload (too many actions/moves) → weak action (a pose, not a motion) → missing endpoint → bad camera logic → continuity gap between shots → tool mismatch. Then climb the cost ladder and stop at the first rung that works: edit the prompt → change a parameter → regenerate → rebuild the keyframe → video-to-video pass (when only the look is wrong) → re-plan the shot → fix in the edit (trim, cutaway, dissolve) → cut the shot. After three failed generations of one shot, change the shot, not the prompt: shorter, closer, simpler, split, first/last frame, off-screen with a reaction, or an insert.
