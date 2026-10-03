# Shot language, blocking and continuity

> Distilled from: cinematic-director (wuwangzhang1216/DirectorSKILL, MIT), short-drama-storyboard (zenstory-ai/drama-skills, MIT), video (smixs/visual-skills, CC-BY-4.0, by Serge Shima), cinematography (fal-ai-community/skills, MIT), video-shots (eternityspring/reelbench-skills, Apache-2.0).

Function first, size second. If you cannot say what a shot is for, you do not have a shot.

## 1. Shot functions (the nine families)

| Function | Use | Fails when |
|---|---|---|
| Establishing | Location, scale, atmosphere | Geography is already clear: it becomes a postcard and kills pace |
| Relation | Power between bodies (two-shot, OTS) | You need a private thought; a two-shot cannot show it |
| Close-up | A decision, fear, realisation | Used on every line; the turn lands flat |
| Insert/detail | An object or clue carries story | The object is not story-relevant (B-roll) |
| Reaction | Consequence of an action or line | It repeats the emotion we just saw |
| Transition | Move time, place or register | Only pretty; no vector |
| Aftermath | Let the audience process | The scene needs urgency |
| Point-of-view | Bind us to one character's knowledge | No preceding look shot says whose eyes |
| Reveal | Change what the audience knows | The information was already visible |

Every shot must do at least one of three jobs: **change emotion, advance action, or raise pressure.** "Beautiful establishing shot" is not a job. A cut must bring new information, power, emotion, space or rhythm; a cut that changes nothing is deleted or merged.

## 2. Shot sizes (the ladder)

Six rungs: EWS 1 · WS 2 · MS 3 · MCU 4 · CU 5 · ECU 6. Judge size by how much of the frame the person fills, not by lens or depth of field. An over-the-shoulder is sized by the person being photographed.

| Size | Frame | Reads as |
|---|---|---|
| EWS | Figure under 1/8 of frame height | Geography, fate, smallness |
| WS | Full body plus environment | Body-to-space relation, blocking |
| MS | Waist up | Readable action and dialogue |
| MCU | Chest up | Performance with context; the dialogue default |
| CU | Head and shoulders | Thought, judgment, decision |
| ECU | Eyes, mouth, hands, object | Obsession, clue, pressure |

Cut rule: **on the same axis, jump at least two rungs; with a 30°+ angle change, one rung is enough.** A one-rung punch-in on the same axis reads as a glitch. Deliberate match cuts and bookend repeats are exempt.

AI note: image and video models are most reliable in the MS-CU band. EWS invents extra people and mangles distant faces; ECU melts teeth, eyes and finger counts. Budget the hard shots away from both extremes.

## 3. Angle and camera height

Set height first, angle second; most of the time keep the lens axis level.

| Height | Reads as |
|---|---|
| Floor 0-0.3 m | The world looms; dread, child or animal POV |
| Knee/waist 0.6-1.0 m | Monumental, authority, arrivals |
| Chest 1.2-1.4 m | Mild status gain |
| Eye 1.5-1.7 m | Peers, neutral |
| Above eye 1.8-2.2 m | Being assessed, institutional pressure |
| Overhead | System, ritual, fate; nobody has a face |

Angles: low = threat or authority; high = vulnerability or judgment; Dutch = instability (twice per sequence at most); OTS = confrontation; profile = withholding, a person mid-decision.

In shot-reverse-shot, put the camera at the **off-screen character's** eye height: shoot the seated one from the standing one's eyes and vice versa. Both singles at a neutral 1.6 m is technically correct and emotionally dead. Models ignore metres; write the visible consequence ("camera near floor level, table edge across the bottom of frame, ceiling visible behind him").

## 4. Camera movement

| Move | Reads as | Fails when |
|---|---|---|
| Locked | Control, dread, ritual, comedy | Nothing moves inside the frame |
| Slow push-in | Pressure, realisation | Nothing changes in the performance during the push |
| Slow pull-back | Isolation, aftermath | Starts before the beat resolves |
| Pan / tilt | Reveal, link two ideas, vertical scale | A full frame-width pan in under ~5 s at 24 fps strobes |
| Tracking / follow | Journey, pursuit | Camera speed does not match subject speed |
| Handheld | Panic, immediacy | Used on a scene about control |
| Orbit / arc | Transformation, seduction | Used on a static conversation |
| Crane | Scale, release | Release not earned |
| Whip pan | Violent link, time jump | Departure and arrival not both designed |
| Dolly zoom | Ground giving way | More than once per film |

Every move answers "what changed?" If nothing changed, the camera is static. Good: "push-in starts on 'I don't know' and stops on her jaw locking." One dominant move per shot, or none. A move plus a reframe is two shots.

## 5. Lens

Focal length does not change perspective; distance does. Long lenses force distance and stack planes (compression); wide lenses allow closeness and fling planes apart (expansion).

| Intent | Focal length (full-frame) |
|---|---|
| Inside their panic | 18-24 mm, close, handheld |
| With them, not judging | 35-40 mm |
| Sympathy, confession | 85 mm |
| Trapped by the situation | 100-200 mm, something solid a few metres behind them |
| Being watched | 135-200 mm from a hiding place |
| The room has power over them | 14-24 mm, subject small, ceiling visible, camera not low |
| Irreconcilably apart | 85-135 mm singles, no two-shot |
| Truly together | 28-40 mm two-shot, shared focus |
| Ritual, institution | 24-35 mm, symmetrical |
| Inserts, hands, texture | 100 mm macro |

Keep lens and distance matched across a shot-reverse-shot pair unless the imbalance is the point; write the reason in the shot row.

## 6. Composition

- Headroom: 5-10% at MS; at CU put the eyes on the upper third and let the skull top leave frame.
- Lookroom scales with head turn: none frontal, about 60/40 at three-quarter, up to 2/3 of the width in front of a profile. Reversed lookroom is a deliberate suffocation device; use it more than once or not at all.
- Power in a two-person frame goes to whoever has more frame area, more height in frame, sharper focus, more lookroom and fewer obstructions. Change one variable and the power changes.
- Patterns: negative space (absence, threat), frame within frame (confinement), symmetry (ritual, deadness), foreground obstruction (secrecy), deep staging (hierarchy, needs three planes), leading lines (fate; must lead to the subject).
- One focal point per frame. Name where the eye lands in the first 0.3 s.

## 7. Blocking before framing

Decide what bodies do in space, then place the camera. For every person write start position, movement, end position, facing and eyeline.

Distance is dialogue. Write it in metres:

| Zone | Distance | Reads as |
|---|---|---|
| Intimate | 0-0.45 m | Love, threat, violence (eyeline decides which) |
| Personal | 0.45-1.2 m | Confession, negotiation between equals |
| Social | 1.2-3.6 m | Transaction, strangers; place a barrier object here |
| Public | 3.6 m+ | Address, authority, abandonment |

- Closing a zone = escalation; opening one = withdrawal. Crossing two zones in one move is a violence-level event, at most once per scene.
- Write `2.4 m → 0.6 m over 4 s`, never "moves closer".
- Power devices: height differential (standing over seated), a level break mid-scene (sitting, kneeling) as the beat itself, foreground dominance, stillness vs the one who must move, who stands between the other and the exit, turning away mid-line.
- Name each character's desire in space: who they move toward, away from, whom they corner, to whom they yield.

## 8. Continuity geometry

**Axis of action (180° rule).** Draw a line through the two people or along the travel direction; keep the camera on one side. A stays screen-left looking right, B screen-right looking left. With three people the axis belongs to the pair exchanging the beat; name it per row (`axis: ANNA-MARCO`). Legal ways across, cheapest first: a character crosses and redraws the line; the camera moves across on screen; a neutral shot on the axis; a cutaway; a re-establishing wide.

**30° rule.** Consecutive shots of the same subject change angle by 30°+ or size by two rungs; best to change both, staying on the same side of the line.

**Screen direction.** A character exiting frame-right enters the next shot from frame-left. People approaching each other move in opposite screen directions; travelling together, the same direction. Exits toward or away from camera reset direction.

**Eyeline match.** Horizontal side, height and distance must agree. If A looks off-screen right, B looks off-screen left in the reverse. Taller or standing characters look down; seated ones look up. The foreground shoulder stays in the same corner across every setup of a pair; if it jumps corners, you crossed the line.

AI note: a model has no memory of the previous shot. Encode geometry as visible content in every keyframe: "Anna occupies the left third, three-quarter profile, looking off-screen right." Write travel as "walks from frame-left toward frame-right, exiting right", never "walks away". If an eyeline pair fights you, generate one two-shot and crop two singles from it.

## 9. Coverage patterns

| Pattern | Buys | AI adaptation |
|---|---|---|
| Master + singles | Edit freedom | Generate singles from the same keyframe world state, not from a re-description |
| Triangle (two singles + two-shot, one side) | Cuttable dialogue | Build all three keyframes from one source image; axis fixed |
| Oner | Unbroken pressure | Chain clips last frame → first frame; hide seams on a whip, body wipe or dark passage |
| Walk-and-talk | Momentum | Worst case for AI (leg swaps). 3-4 s, profile or frontal MS, cut on footfalls |
| OTS pair | Confrontation | Generate both from one two-shot keyframe |
| Insert cluster | Rhythm, rescue for any edit | Highest-yield AI shots; generate 3-5 per scene as insurance |

Dialogue default for a two-person beat: one wide, two singles, one two-shot, two inserts (six setups, expect to cut with four). Short-drama default: one line per shot, cut to the listener when a line lands, shot-reverse-shot along one axis, establish first then settle at MS/MCU, CU only for the line that must land, delete shots with neither line nor action, use inserts (phone, hand, ring) to break long lines.

## 10. Aspect ratio and vertical

| Ratio | Effect |
|---|---|
| 2.39:1 | Lateral staging; two faces in one frame |
| 16:9 | Safe default; states nothing |
| 4:3 | Vertical staging; one body fills the frame |
| 1:1 | Forces centring; bad for relationships |
| 9:16 | Depth staging only; single subject, huge, close |

Vertical (9:16) is a different grammar, not cropped 16:9:

- Stage in depth: near person low in frame, far person higher. Shoot slightly above eye level so the floor shows.
- Go one size tighter than you would at 16:9 (wide → medium, medium → MCU), but not tighter than CU by reflex.
- Eyes about one third from the top.
- Wide shots need a vertical subject (stairwell, tower, alley), a foreground layer in the bottom third, a tilt reveal, or a high angle.
- Change size or angle only when attention or relationship changes; a new cut must change at least one of size, angle or relationship.
- Keep faces and burned-in text inside the middle ~60% of frame height; platform UI covers roughly the top 10-14% and bottom 18-35%. Verify the current platform spec.

## 11. Lighting shorthand for boards

Per shot write: key source (a named practical where possible), its side relative to this camera, height, hard/soft, ratio (e.g. 5:1), and what the fill actually is. Light direction may not flip between shots of the same moment unless a source in the world changed; scan the column for flips before generating. One sentence of light and colour temperature per scene, repeated verbatim in every keyframe of that scene.

## 12. Transitions vocabulary

Hard cut, cut on action, match cut (shape or motion aligned), J-cut (sound leads), L-cut (sound trails), dissolve (time passing; also an honest repair), whip, wipe, body wipe past camera, fade to/from black, smash cut. Murch's priority when choosing a cut point: emotion > story > rhythm > eye-trace > 2D screen direction > 3D space.
