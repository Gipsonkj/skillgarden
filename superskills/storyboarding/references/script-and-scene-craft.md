# Script and scene craft

> Distilled from: sw-scene-craft and sw-workflow (jtydhr88/screenwriting-skills, MIT), short-drama-write (zenstory-ai/drama-skills, MIT), script-writer (ailabs-393/ai-labs-claude-skills, MIT), video (smixs/visual-skills, CC-BY-4.0, by Serge Shima), cinematic-director (wuwangzhang1216/DirectorSKILL, MIT).

Use when writing or fixing the script that a board will be drawn from: a screenplay scene, a short-drama episode, an ad script or a YouTube script.

## 1. Script formats

| Format | Use for | Layout |
|---|---|---|
| Screenplay | Film, short film, drama | Scene heading `INT./EXT. LOCATION - DAY/NIGHT`, action in present tense, CHARACTER name above dialogue, (parenthetical) only when the reading would otherwise be wrong |
| Two-column A/V script | Ads, explainers, corporate, YouTube with B-roll | Left: VIDEO (what is seen). Right: AUDIO (VO, dialogue, SFX, music). One row per beat, with seconds |
| Short-drama Markdown | Vertical micro-drama episodes | `# EP001 Title`, scene heading `## EP001-SC001 INT · Location · Time/weather`, dialogue `Name (optional delivery): line`, tags `[VO]` `[OS]` `[SFX]` `[ON-SCREEN TEXT]` `[CONTINUITY]` `[TRANSITION]` |
| YouTube spoken script | Talking-head, explainer, listicle | Hook (first 5-10 s), intro (to ~45 s), sections with pattern interrupts, conclusion, one CTA |

Rules for any format:

- Action is present tense, concrete nouns, action verbs. No camera directions ("we see", "pan to") in a screenplay; those belong on the board.
- A new scene starts when place or time changes. Adding or removing a character or changing the dramatic goal can also start one.
- Give every scene a stable ID. Boards cite the ID in a Source column; renumbering breaks every reference.
- Production tags in short-drama scripts carry only facts that downstream steps would otherwise lose (an object still in a hand, a wet coat). Do not use a tag to restate what the action line already shows.

## 2. Designing one scene (five steps)

1. **Conflict.** Who drives the scene and what do they want right now (write it as "to ..."). What does the opposing force want? The two must collide head-on, not slide past each other.
2. **Opening value.** Mark the value at stake as + or - (trust +, safety -).
3. **Beats.** Break the scene into action/reaction units, each labelled with an "-ing" phrase for the subtext action ("pleading", "brushing off"). A new beat exists only when behaviour clearly changes.
4. **Closing value.** Mark it again. Same sign = non-event.
5. **Turning point.** Each beat should stack on the last until the value flips. A turn comes only from an action or a revelation. Its effects in order: surprise, curiosity, insight, new direction.

Also decide for each important character: the scene objective (stop when it is met), the tactic (flatter, threaten, reason, stall) and what they cannot say aloud.

Early warning of a bad scene: the same tactic repeated in new words. The four classic faults are no opposition, repeating beats, a turn that lands too early or too late, and on-the-nose writing.

## 3. Entering and leaving

- **Enter late, leave early.** Start as close to the conflict as possible; leave before it is fully resolved so tension carries into the next scene.
- Scene length mix: in a feature, roughly 40-60 scenes averaging about 2.5 minutes; pair short scenes with long ones. Shorten scenes as you run toward an act climax to earn the long pause at the reversal.
- **Transitions need a third element** shared or opposed between the two scenes: a gesture, an object, a line, a quality of light, a sound (waves to snoring). Note it on the board so the cut can be designed.
- Between two heavy scenes, a short low-conflict scene lets the piece breathe.

## 4. Action over talk

- Any action beats no action; action woven into the story beats any other action.
- Turn states into acts. "I'm sad" becomes he cries; then someone comforts or mocks him. A stalled script is characters sitting in inner states.
- Small physical business carries meaning cheaply on screen: a ring rolling under tables, cooking the same breakfast badly then well.
- Avoid static settings (phone calls, cars, restaurants, offices) unless the setting itself drives the conflict. **List a dozen alternative locations** for any scene and choose the one that makes the conflict harder or more revealing. Example: a confrontation in an office becomes the boss swimming laps while the detective shouts from the poolside.
- Play against the obvious: anger delivered with a gentle smile; love talked about through flowers.
- First ask "how would this scene work with no dialogue at all?"

## 5. Dialogue as action

- Each line must push, dodge, probe, corner or redefine the relationship. A line that does none of those is cut.
- After drafting, read every line and ask "what does the actor do with this?" If no action or expression comes out of it, cut it or replace it with behaviour. Do not apply this cut to text the author brought; respect their voice.
- Subtext comes from a gap in knowledge plus a risk. Give the audience enough evidence to infer what is unsaid.
- Swap test: cover the names. If two characters could say each other's lines, their voices are not distinct. Differentiate on vocabulary, sentence length, directness, rhythm and what each avoids.
- Break long speeches with action, not stacked lines.
- Information enters through a transaction someone wants something from, never as a reading to a person who already knows it.
- Voice-over and inner monologue only for what cannot be acted. "What can be acted is not said."

## 6. Detail, props and setting

- One concrete detail beats a general statement: not "expensive clothes" but "a double-breasted chocolate-brown suit". Not "a small midwestern town" but a named town.
- Necessary repetition of a detail is fine only when each appearance advances plot, conflict or character. Saying the same detail five times is showing off.
- A prop earns its place when it is the structural core, pushes the conflict, defines a character, symbolises fate or opens the theme. Strongest pattern: the object changes meaning several times, and each change is caused by **another person's action** on it at a value turn. If no one does anything to it in an appearance, cut that appearance.
- Visible beats said: "kill the duck to check the grain" works better with a knife on screen than as a line.
- Setting test: why here and now and not elsewhere? Pick the place that helps the theme, the character and the conflict. Avoid the reflex courtyard or living room.

## 7. Suspense and delay

- Three audience relations: mystery (audience knows less), suspense (equal), dramatic irony (audience knows more). Irony and suspense outlast mystery.
- Set up a question, answer it, and raise a new one before the old one closes.
- Delay before release: crouch before the jump. Build two or three layers of escalation, then drop the payoff. The bigger the build, the bigger the release, including comic deflation.

## 8. Short-form and ad scripts

- First 1-3 seconds: the hook is a problem, an oddity or the result itself. Never a logo or a greeting.
- One idea per beat. Pattern interrupt every 20-40 seconds in long YouTube scripts (a new visual, a question, a change of location).
- Curiosity gap: name what is coming before you show it.
- One CTA, at the end, in a frame that keeps the bottom UI-safe zone clear (see [short-drama-vertical.md](short-drama-vertical.md) for safe zones).
- Read-aloud pace for timing: English VO about 2.5 words per second (150 wpm) for conversational delivery, slower for emotional lines. Chinese dialogue 3.5-5 characters per second. Time the script against the target before boarding; cut repetition and restated conclusions first.

## 9. Scene checklist

1. Why here and now? Did you list a dozen alternative locations?
2. What value is at stake, and does it flip?
3. What does each character want, with which tactic, and is the opposition direct?
4. Any repeated beats? Is the turn an action or a revelation, and is it placed right?
5. Entered late and left early, before full resolution?
6. Any "nothing happens" passages (shaving, chit-chat, ordering food)?
7. Could it work without dialogue? Which small action can the camera enlarge?
8. Are details true, specific and visible, without repetition for show?
9. Does the scene end on a final image or action you can board?
