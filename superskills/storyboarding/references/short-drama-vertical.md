# Short drama and vertical series

> Distilled from: short-drama-write and short-drama-storyboard (zenstory-ai/drama-skills, MIT), short-drama-director (lixiaoxiao9888-create/manju-laoli-skill, MIT), sw-story-structure (jtydhr88/screenwriting-skills, MIT), cinematic-director (wuwangzhang1216/DirectorSKILL, MIT). Several sources are Chinese-language; distilled here in English.

For vertical micro-drama (Douyin/Hongguo-style, ReelShort-style), AI comic dramas ("manju") and episodic shorts: episodes of roughly 1-3 minutes, 9:16, built to be watched to the end and to make the viewer swipe to the next episode.

## 1. Lock these before writing a line

Ask in one message only for what cannot be inferred; state the rest as assumptions.

| Lock | Options | Why it matters |
|---|---|---|
| Target video model | e.g. Seedance 2.5 / Seedance 2.0 / Kling 3.0 / MiniMax H3 / none yet | Max clip length, multi-shot syntax, first/last frame availability, audio markers all differ ([ai-video-prompts.md](ai-video-prompts.md)) |
| Aspect ratio | 9:16 (default for vertical platforms) / 16:9 / 21:9 | Changes staging, shot sizes and every prompt |
| Deliverable | Markdown script/board / visual board page / both | Avoid building what nobody asked for |
| Seam method (multi-segment) | End-state inheritance / hard cut with new angle / short transition shot | Each generation forgets the previous one |

Never silently default a model version when the user's pipeline depends on it; if unspecified and it matters, ask once. Default to prompts and documents only; do not generate images or video unless the user explicitly asks for that run.

## 2. Episode contract

Before scenes, write five lines: the viewing promise (revenge, romance tension, mystery), who wants what right now, the obstacle, what pays off in this episode, and the exit state (what the next episode inherits).

- Every scene changes information, power, relationship, emotion, physical state or risk. A scene that changes nothing is cut or merged.
- The **first beat is the hook** and must stand alone: a visible conflict, a frame that should not be possible, a hanging question, or the last beat of a peak. Text that must be read, a face that must be recognised or a line still to come do not count as a hook on their own.
- The hook's line or image lands inside the first 3-5 seconds. Compress any atmospheric opening to 4-5 s and put it in the same segment as the hook line.
- Enter where pressure is already active; show the state with an action, never by a character recapping the last episode.
- The ending completes the episode's function: a visible result, a redefined relationship, a reversal, or a stop on the peak. Serial shows usually end on a new pressure point. Do not undo an established cost right after the climax.
- Write the exact exit state: who is where doing what, who knows what, who holds what, injuries, clothes, light, weather, what can no longer be undone.

## 3. Emotion curve for a 3-minute episode (12 beats)

| # | Beat | Tension 0-10 |
|---:|---|---|
| 1 | Hook / first suspense | 3-4 |
| 2 | Conflict forces the hero to respond | 5-5.5 |
| 3 | First head-on clash, showing ability and cost | 6.5-7 |
| 4 | Standoff: pressure, verbal duel | 6.5-7 |
| 5 | Lull with an undercurrent, building toward the trap | 4-4.5 |
| 6 | Trap: the villain's card is played | 8-8.5 |
| 7 | Peak clash | 9-9.2 |
| 8 | Edge: wound, choice | 6-6.5 |
| 9 | Reversal / payoff (highest point) | 9.5+ |
| 10 | Settlement: truth out, enemy down | 8-8.5 |
| 11 | Aftershock: changed world, feelings land | 6.5-7 |
| 12 | Hook into the next episode | 4.5-5 |

Checks: at least two peaks at 9+, a real dip between them, no flat 5-6 stretch, beat 9 is the highest point.

## 4. Writing for the format

- Script markup: `# EP001 Title`, `## EP001-SC001 INT · Location · Time/weather`, `Name (delivery): line`, tags `[VO]` `[OS]` `[SFX]` `[ON-SCREEN TEXT]` `[CONTINUITY]` `[TRANSITION]`. Keep scene IDs stable; the board cites them.
- Dialogue pushes, dodges, tests or corners. After drafting, delete lines that give the actor nothing to do.
- Major supporting characters get their own strategy; functional extras stay simple. Do not bolt secrets or reversals onto them to satisfy a checklist.
- Do not invent precise numbers, records, procedures or devices the premise did not ask for; if a self-check grows a mechanism, remove it.
- Respect the author's own text when normalising an existing script; only fix what was named.
- **Voice-over and inner monologue:** VO+OS at most ~30% of the sound, roughly 60-80 Chinese characters (about 25-35 English words) per minute. During inner monologue the character's lips stay closed on screen; do not route OS through a model's lip-synced dialogue channel. VO adds contrast or cold perspective; it never narrates what the picture shows.
- Speaking pace for timing: Chinese 3.5-5 characters per second, English about 2.5 words per second, plus 0.3-0.8 s after a line for it to land. Estimate as a range and label it "text estimate" until real audio exists.

## 5. Boarding vertical episodes

- 9:16 favours MS, MCU and CU. Wides need depth layers (foreground rail, mid subject, background figure) or a vertical subject; otherwise give the space its own closer shot.
- Stage people in depth, not side by side. Change size or angle only when attention or relationship changes.
- Keep faces, subtitles and key props inside the middle ~60% of frame height; platform UI covers the bottom ~20-35% and the top ~10-14%.
- Shot length comes from the sound timeline: each line at natural speed, listener reactions, then silent actions that must be seen. Split long lines across speaker and listener shots; never ask for faster delivery to fit a fixed length.
- Use at least three different shot lengths per segment; fast cuts on blows and reveals, long holds on the payoff line.
- Total length is content-driven: if the content is thin, let the episode come in shorter (up to ~25% under the script's nominal runtime) rather than stretching atmosphere shots.
- Dialogue coverage default: one line per shot, cut to the listener when a line lands, shot-reverse-shot on one axis, establish then settle at MS/MCU, CU only for the line that must land, inserts (phone screen, hand, ring, document) to break long speeches.
- Before each multi-shot segment write a **placement line**: every character present, where they stand, facing, what they hold. Everyone placed must appear in at least one shot of the segment or be written out ("exits through the door, frame-left"). People who did not move keep their position across segments.
- First shot of every segment: one named subject in the first clause. An opening empty shot must say so explicitly, at most one per segment.
- Keep the shot size honest: a close-up carries one local subject; a room-scale event (the roof leaking everywhere, fire spreading) needs MS or wider.
- Postures persist: after "sits up", later shots say "still sitting up" until a shot shows the change.
- Speaking shots name the eyeline target ("eyes on his face"). When a character handles a prop while talking, add "eyes not on the object" or the model stares at the prop.
- Prop handling must match the delivery: idle fiddling suits a teasing line; a verdict or a scream needs a clenched grip.
- Write delivery tone for every line in the line itself (`Name (cold, slow, clipped): "..."`): emotion colour, force, voice texture, rhythm; at most three words; never "happy/sad/angry". Sound words go in the line's tone slot, never in the picture description, or the model draws them on the face.

## 6. Segment seams

Each 4-15 s generation starts with no memory. At every seam choose:

1. **End-state inheritance (default for continuous drama):** write the last frame concretely (who, where, posture, prop and contact state, no "keep consistent" boilerplate) and use a still of it as the next segment's first frame or reference.
2. **Hard cut to a new angle and size (default for action):** the jump reads as an edit, not a glitch.
3. **A 1-2 s transition shot with a job:** mood shot under music, a sound that arrives before its picture, a time/place bridge. At most about three per episode.

Combine 1 and 2 for most dialogue drama. Keep workflow words ("inherit end state", "seam node") out of the prompt text itself.

## 7. Action scenes (15-second previs)

- Open on contact within the first 1.5 s; no static wind-up in models that cannot render it.
- One readable exchange per 2-3 s: attack, defence state (block, evade, absorb), consequence.
- Board geography first: who moves left-to-right, where the threat comes from, where the exit is. Keep it through every cut.
- Contact moments are where models fail: cut on the swing and land on the result, or use a body wipe past the lens. Put impact into sound.
- End on a held final frame (a pose, a fallen weapon, dust settling) that the next segment can inherit.
- Fantasy combat uses its own visual vocabulary (artifact, element, energy shape) rather than forcing real martial-arts physics.

## 8. Review before delivery

- Hook inside the first 5 s; at least two 9+ peaks; ending function delivered; exit state written.
- Every scene covered by shots or listed as skipped with a reason.
- Every placed character accounted for in each segment; no silent posture reversals.
- Dialogue fits its time with room to land; OS shots have closed mouths.
- No negated visual words in prompts ("not glowing" → describe the matte material).
- After any revision, re-check what the change touches (setups and payoffs, character knowledge, durations, assets, ratio), not just the edited line.
