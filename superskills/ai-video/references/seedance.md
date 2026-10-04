# Seedance: prompting and running it

> Distilled from: higgsfield-ai-prompt-skill (OSideMedia, MIT): the higgsfield-seedance skill with its ENGINE-RULES and FAILURE-MODES files, higgsfield-seedance-2-5 with MODE-PLAYBOOKS (itself a summary of ByteDance's Dreamina Seedance 2.5 prompt guide), the seedance-vfx dialogue-timing and first-frame references, docs/Seedance 2 Skill.md and model-guide.md, in our own words with short adapted templates; host-specific features left out. bytedance-modelark (Gipsonkj/skillgarden, MIT) for real-account behaviour on ModelArk. Unlicensed repos are listed as further reading only.

ByteDance Seedance prompted for text-to-video (t2v), image-to-video (i2v), multi-reference, extension and edits, on any host (BytePlus ModelArk, Runway, fal, resellers). API calls, model ids, the error table and `scripts/bytedance-modelark/ark.py` live in vendor-apis.md. The generic formula, camera vocabulary and take discipline live in generative-prompting.md. This file covers what is specific to Seedance.

## Which version for which job

| Job | Version | Why |
|---|---|---|
| Volume i2v: b-roll, product motion, one move per clip | 1.5 Pro | Cheapest working i2v (~$0.13 per 720p 5 s on ModelArk, no audio) |
| Cheap drafts that still take references | 2.0 mini | About 2.0's reference surface at a budget price; 480p/720p only |
| 4K, multi-shot clips up to 15 s, up to 9 image refs | 2.0 | 4K exists only on 2.0 and only on hosts that expose it |
| Locked face or product, takes over 15 s, per-second direction | 2.5 | 4 to 30 s, 30 image refs, timeline prompts hold better |
| Change one thing inside a clip you already have | 2.5 edit | Keeps the master's timeline; bills by the master's full length |
| More footage before or after a clip | 2.5 extension | Forward or backward from the boundary frame |

Rule of thumb (ModelArk, Sep 2026): 1.5 Pro for volume; pay the ~9x for 2.5 only where a locked identity, a long take or per-second direction earns it.

## Limits (checked Sep 2026; verify in the vendor's console)

Limits differ by host. These come from ModelArk tests and one reseller's catalog of 26 Sep 2026.

| | 1.5 Pro | 2.0 | 2.0 mini | 2.5 |
|---|---|---|---|---|
| Duration | 4 to 12 s (some hosts: 4/8/12 only) | 4 to 15 s | 4 to 15 s | 4 to 30 s |
| Resolution | 480p, 720p, 1080p | 480p to 1080p, 4K on some hosts | 480p, 720p | 480p, 720p, 1080p |
| Aspect | 16:9, 9:16, 4:3, 3:4, 1:1, 21:9 | same, plus auto | same | same, plus auto |
| Inputs | Text, first frame | Up to 9 images, 3 videos, 3 audio (12 total) | As 2.0 | 30 images, 10 videos (30 s combined), 10 audio (30 s combined), 50 total |
| Audio | Native, lip-sync | Native | Native | Native |
| Seed | Check the host's schema | Not exposed | Check the host's schema | Not exposed on the hosts checked |

- Stable ranges on 2.5 are smaller than the caps: 1 to 8 distinct subjects in images, 1 to 5 in videos (5 to 10 s each), an edit source of 20 s or less with 1 to 5 reference images. Above that it still runs, with more re-rolls.
- Sizing goes in different places. On ModelArk 1.5 Pro it is flags appended to the prompt text (`--resolution 720p --duration 5 --ratio 9:16 --camerafixed true`). On 2.x it is request fields, and writing it into the prose does nothing.
- Audio is on by default and doubles the price on ModelArk ($0.26 vs $0.13 per 5 s on 1.5 Pro). Send `generate_audio: false` unless sound was decided.
- Auto-locked settings: an edit takes the source's ratio and length (±0.3 s); a first-frame job takes the first image's ratio; an extension takes the source's ratio (only its length is yours).
- ModelArk first-frame stills made with Seedream need a canvas of at least 3,686,400 px (`2560x1920`, `2560x1440`, `1920x2560`); smaller sizes are rejected.

## Prompt craft that applies to every version

- **Length.** A single shot does best at 50 to 80 words in three sentences: subject and action, camera and style, locks. Lead with whatever the shot lives on. Multi-shot briefs can run far longer if they are structured in labelled blocks; say each important thing once.
- **Complete scene.** Camera, subject, action, setting, style, light. A prompt with a whole scene in it passes the input filter far more often than a bare subject, because the filter reads intent.
- **Positive locks, no negative lists.** Seedance reads every token as something to render, so `negative: jitter, extra limbs` adds noise. Write what must be true: "Face stable. Two hands only. Lighting constant." A short "no X" inside a positive sentence is fine. Name an unwanted thing only when it is the model's default (slow motion in a fight, music under a dialogue scene).
- **Named things, not empty adjectives.** "Cinematic", "epic", "stunning" sample nothing. Name the light setup, the lens (as FOV: 84° wide, 47° normal, 29° portrait, 18° close portrait), the palette, the white balance in Kelvin.
- **Measurable words.** Speeds in km/h, fog in percent or metres, giant scale in human heights, left and right from the camera, masses in kg so falls read right.
- **Physics, not labels.** "Jaw sets, nostrils flare", not "looks angry". "Driven back into the car, metal buckling", not a blow-by-blow. Only what can be seen or heard.
- **"Fast" degrades.** Describe the physics of speed ("feet strike hard, full stride, arms pumping") and let one element carry it.
- **Homographs.** If a verb can look like two things, Seedance may pick the other one ("tearing" = ripping or crying; also shoot, draw, bolt, strike, snap). Use wording only one picture fits.
- **Engine rules.** No age words (describe role, clothing, action; the filter tightens sharply on anything that reads as a minor). At most 3 tracked characters. A character who leaves frame is gone for that shot. Anything off screen does not exist until shown. Avoid mirrors, puddles and blades in the same shot as the subject. Re-anchor positions after each cut.
- **English prompts.** Dialogue can be in any language (see Dialogue and audio).

## Text-to-video

Formula: `<subject> <primary action> in <scene>. <visual style>. <shot size, angle, movement or cuts>. <audio>.` Use only the slots the shot needs.

```
A courier in a soaked yellow parka pushes a cargo bike up a cobbled hill at night,
leaning into each step, rain bouncing off the crates. Wet sodium streetlight, 3200K,
deep shadows, light haze at 20 m. Medium tracking shot at 63°, camera moves alongside
at a steady 4 km/h, ending on the crest of the hill. One continuous shot.
Sound: rain on canvas, chain clicking, distant tram. No music.
```

## Image-to-video (first frame)

1. Lock the look as a still first (an image model; iterate the still, not the video). 2.0 and 2.5 expose no seed on the hosts checked, so re-running an approved draft is a new performance; the start frame is what carries a look into the final.
2. Prompt motion and camera only. Re-describing what the still shows gives the model two inputs for one subject, and it drifts.
3. Put the subject on a diagonal, already past centre. A dead-centre symmetric still gives the clip nowhere to travel.
4. If the prompt needs something the still does not show, say so: "the key is not visible in the first frame; it rises into frame in her right hand."
5. On ModelArk 2.5 with a first frame, leave `ratio` out; the output follows the image.

```
The cup is struck from the left; it slides 10 cm and spins once, coffee sloshing
up the inside wall and settling. The saucer stays still and unchanged. Camera static.
Sound effect: porcelain scrape, one clink.
```

## Multi-reference

Bind each reference in the prompt; the model will not infer which image is which. On ModelArk, `@Image1`, `@Video1`, `@Audio1` bind in the order of the request's `content` array. Dreamina's guide writes `@Image 1` with a space. Pick one form per project and never mix them.

Each reference line gets a role, what to use, what not to use, and how much must survive (full, partial, attribute-transfer onto a named target, or loose guide):

1. One line per subject. `@Images 1 to 4 are the four characters` is the classic failure.
2. With several subjects, group them (characters, props, scenes, motion and audio) and add "do not interchange these characters' appearance, clothing, positions or lines."
3. Several views of one subject: say they are one subject and "only one lamp appears throughout", or the model duplicates it.
4. Character sheets leak their grey backdrop and panel layout into the set: exclude them in the role line. Make one of the views a strong expression (wide smile, anger) so the model learns the teeth and facial movement, not just a resting face.
5. In the action lines on 2.5, name characters by name plus one visible marker, not by handle. A handle used as a sentence subject is how one character comes back as two.
6. Never mention a reference in a shot where that subject is absent; the model forces it into frame.
7. Restate small critical details in words (label colour, logo position, button count) even when the image shows them.
8. A reference video is motion and pacing by default, not identity. When it already carries the motion, list only what to inherit.
9. Every subject keeps its own identity reference even if it also appears in the location plate.

```
Mara corresponds to @Image1: use her face, hair and the rust-red rain jacket only;
do not use the grey backdrop or panel layout. The thermos corresponds to @Image2:
use its shape, matte green finish and white cap only; there is exactly one thermos.
@Image3 defines the bus shelter, wet glass and evening light; do not use the people in it.
Mara, red jacket, steps into the shelter, unscrews the white cap and pours, steam
rising into the cold air. Medium shot at 47°, slow push-in ending on the thermos label.
The thermos belongs only to Mara. Sound: rain on the roof, cap thread squeak. No music.
```

Keep the same slot order across a project (for example `@Image1` identity, `@Image2` costume, `@Image3` location) so nobody has to recheck which face is which at shot 40. If a reference and the text disagree, resolve it in the prompt ("@Image2 as costume, recoloured to navy").

## Per-second timelines (2.5)

The timeline is the main lever against drift on long 2.5 takes.

```
Photoreal handheld, referring to @Image1 as the kitchen and @Image2 as the cook.
0-3s: she cracks two eggs into the pan, whites spreading. Sound effect: sizzle.
3-6s: she tilts the pan; the eggs slide to the edge and stop. Sound effect: scrape.
6-8s: she sets the pan down; steam rises past the window. End: pan on the back burner.
One continuous shot, no cuts. Subtitles: none.
```

- Ranges are consecutive, non-overlapping and sum to the requested duration. They are a time budget, not frame-accurate edit points; beats may land either side of a boundary.
- One primary change per range, ending on a visible end state. Too little in a range invites inventions; too much gives cuts or dropped beats.
- Never ask for a frequency inside a second ("three blinks in one second").
- Time labels can read as cut instructions. For one take, say "one continuous shot, no cuts". For cuts, label them (`Shot 1 (0-3s) ... HARD CUT ... Shot 2 (3-8s)`) and add "cuts only at these points".
- For several events, use stages instead of timecodes: a goal line, then per stage an initial state, one primary event and an end state, closing with a consistency line.
- Split by job, not only by length: physics (a throw, a fall) and performance (a face) in one generation each come out half done. Make two prompts and cut them together.

## Extension and edits (2.5)

**Extension.** Align the boundary before describing anything new. Forward: "the first frame of the extension continues directly from the last frame of @Video1", then pose, props, camera and light continuity, then the new action. Backward: land the source's first frame as the explicit end state; "then connect to the source" lets later elements leak in early. Feed the last 3 to 4 s of the take as the video reference, not a still, so motion crosses the join. Match the source's resolution and duration. Chain at most 2 extensions (3 at the very most; about 60 s for one chain on 2.5), then restart from the original references. On hosts with no extend mode, attach the clip as a video reference and open with "The scene continues."

**Edit.** Name the source as the sole editing master, then the change, its scope and time range, and what to keep: "Edit @Video1. From 4 to 7 s only, change the blue light on the right wall to warm orange. Change only the wall light and the area it lights. Keep identity, clothing, motion, camera, dialogue and ambience from @Video1." For a replaced object add a timeline clause: it inherits every appearance, path, occlusion and exit of the original, and state the count ("exactly one lamp"). Audio categories (dialogue, language, music, SFX) edit independently. Say whether a change holds for the whole clip or a window. Person replacement on ModelArk (blurred face, verified asset, skeleton prompt) is in vendor-apis.md. If the shot should be rebuilt rather than patched, generate fresh with the old clip as a motion reference.

**First and last frame.** One role sentence per image ("@Image1 is the first frame ... @Image2 is the last frame"), never merged. Both images need the same aspect ratio, or the last frame stretches. Describe one continuous action between them. For 3 or more keyframes, "use @Image1 to @Image4 as keyframes in this order"; separate images align better than a grid.

## Dialogue and audio

- Speech goes in the audio clause only. Quoted subtext in the action ("a look that says 'you too?'") comes back spoken.
- On 2.5, brackets separate channels: `()` music, `<>` sound effects, `{}` dialogue, `【】` subtitles. Plain language works too. Never write `(no music)` inside the music bracket; list the diegetic sounds, then "No music." as plain text.
- For non-Chinese dialogue, put a language line before it: `Dialogue language: natural London English. The courier says: {You're late, the van left at six.}`
- Budget: about 2 words per second of window, at most 25 to 30 words in 15 s. Lines of 6 words or fewer in a 4 s solo shot came back padded with invented mumble; 8 to 12 words did not. Fill the window, script the silence (a pause, a door latch at 3.4 s), or cut the shot to the line.
- One speaker says the line once. Give every other visible face a true rest state ("lips at rest, eyes on her").
- To land a camera move on a word, anchor it twice: by meaning (`on the line "right in front of you"`) and by number (`at about 2.2 s`). Read the time off the source clip (frames ÷ fps, one decimal), leave 2 to 3 s for the payoff, and recompute if the runtime changes. If the two disagree, the line wins.
- Generated speech rarely holds lip-sync across clips. For narration use TTS on its own track; for music-led cuts see music-beat-cut.md.

## Camera and motion amount

Vocabulary is in generative-prompting.md (section 3). Seedance specifics:

- One dominant move per shot, plus at most a texture ("slow push-in, slightly handheld"). A compound move goes in sequence with times ("rises 0-3s, holds, pushes in 4-8s") or becomes two shots.
- Name the endpoint: what the frame shows when the move ends. A move that runs out of instruction drifts or reverses.
- On 1.5 Pro i2v, camera words were mostly ignored in a Sep 2026 batch. Use `--camerafixed true` for static, prompt one move alone and measure it, or push in later with ffmpeg.
- Write motion as a physical event in the scene ("the table is struck, dust jumps"). Violent verbs for action, never "slow" in a sports prompt. State what must survive ("stays still, unchanged in shape").
- Fill the clip in one direction: chain 2 to 3 connected actions along the same vector. A there-and-back is two shots.
- Detail follows shot size: micro-detail in close-ups, broad arcs in wides.
- Whip pans need at least 0.8 s of blur or they render as a hard cut. Keep each shot at one speed; cut between real time and slow motion.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Action plays, then rewinds | Short action, clip time left over | Chain 2 to 3 same-direction actions; name the camera endpoint |
| Cut lands before the result | Nothing says which state must be visible | Name the end state ("the lid seats flush and stays"); open the next shot on the result |
| Hands work, object never changes | Verb only, no mechanism | Write structure, anchor, force, material response, finished state; or cut around it |
| Extra or third hand | No ownership of hands | State headcount, owner and entry side of each hand; max 2 characters handling things |
| Gliding walk, same foot twice | Walk rendered as appearance | "Heel lands first, strict left-right alternation, one foot always on the ground" |
| Two shots of one walk at different speeds | Cross-references between prompts | Same absolute value in both ("camera tracks at 5 km/h, 2 m away") |
| Fight clips cut together choppy | Each clip re-guesses pose and tempo | Last frame of clip N is the first of N+1, mid-move; one timeline for the key move; "real-time speed" |
| Rooms widen, furniture appears | Environment invention | "The set contains only what the reference shows"; list absences |
| Two people end up the same height | Height equalisation | Real heights in every prompt ("she is 165 cm, he is 178 cm") |
| Hero shrinks to a dot in wides | Scale drift | "Stays the human-sized anchor in frame" |
| Neighbour object moves too | No physics, adjacency read as one | "The magnet stays on the fridge; only the photo moves" |
| Subject duplicated | Several views read as several subjects | "All views are one lamp; exactly one lamp throughout" |
| One character comes back as two | Handle used as sentence subject | Name plus visible marker in action lines; handles stay in the role map |
| Stray mumble around a short line | Audio fills dead air | Longer line, scripted silence, or a shorter shot |
| Shaky, unreadable camera | Stacked moves | One move, or timed phases |
| Wrong door, wrong hallway direction | Geometry under-specified | Camera position, layout and direction of travel before the action |
| Composition drifts after ~2 s | Seedance holds the still briefly | Timeline prompt; pick the window (below) |
| Choppy playback, repeated frames | Effective fps dropped | "Runs at 24 fps, no frame repeated"; dedupe only for b-roll |
| Wrong-direction action, rising column turns into a helix | Model's motion prior | Generate the opposite event and reverse with ffmpeg `-vf reverse` |
| Refused within seconds at submit | Input filter (prompt text and images) | Rewrite as a full scene, move the motion onto objects; never resubmit unchanged |
| Output moderation fails on identical input | Random output check | Resubmit unchanged once or twice |

## Picking the usable window, takes and cost

- The first ~1 s is often dead and the composition drifts after ~2 s. Never cut from frame 0.
- Score motion as the mean inter-frame luma delta: under 2 frozen, 2 to 4 weak, 4 to 8 good, over 8 violent. Choose windows by `motion - 0.75 * drift_from_frame0 - 0.12 * lateness`.
- Step through every take frame by frame; one bad frame rejects a hero shot. Mine rejected takes for 1 to 3 usable seconds before discarding them.
- A 480p draft validates the prompt (shot structure, blocking, filter pass, dialogue placement), not the take (performance, micro-timing, fine detail). Check fine detail at final resolution.
- Price before running (vendor-apis.md): about $0.13 per 720p 5 s on 1.5 Pro; $0.51 / $1.16 / $2.84 per 5 s at 480p / 720p / 1080p on 2.5; edits bill by the master's length (a 30 s 720p edit was ~$13.5). Show one finished clip before a batch; cap rejected takes per generative-prompting.md section 13.

## Safety

- Real faces are refused at submit on ModelArk, AI-made faces and reference videos included. Allowed routes there: a liveness-verified "Real human" asset of the consenting person, or the account's own recent outputs. Use them only for people who agreed, with consent on record.
- Never impersonate. No celebrity or public figure names, and no physical descriptions written to recreate a specific real person. No brand logos or franchise characters; use your own product shots or describe a generic item.
- Rewording is for false refusals (a harmless scene flagged over wording), never for getting restricted content through.
- Keep the key in the environment; see vendor-apis.md for the rules every vendor shares.

## Pre-flight checklist

- [ ] Version and mode fit the job; duration, resolution and aspect are inside that host's limits
- [ ] Audio decided (`generate_audio` set explicitly); cost stated and approved
- [ ] Complete scene; 50 to 80 words for one shot, or labelled blocks for a long brief
- [ ] i2v prompt is motion and camera only; things not in the frame are declared as absent
- [ ] Every reference has a role, an exclusion and a fidelity grade; one line per subject; no handle where the subject is absent
- [ ] Timeline ranges sum to the duration, each ends on a visible state; one-take or cut intent stated
- [ ] One camera move with an endpoint; motion fills the clip in one direction
- [ ] Positive locks for what must not change; no negative lists; no age words; no ambiguous verbs
- [ ] Dialogue only in the audio clause, sized to its window, language line present
- [ ] No real person without a consented route; no names, logos or lookalikes
- [ ] Plan for review: skip the first second, score motion, step through frames

## Further reading (link only, no licence)

These repos carry no licence, so nothing here is copied or paraphrased from them:
- https://github.com/songguoxs/seedance-prompt-skill (Seedance 2.0 prompt skill, Chinese)
- https://github.com/beshuaxian/higgsfield-seedance2-jineng (Seedance 2.0 genre prompt skills)
