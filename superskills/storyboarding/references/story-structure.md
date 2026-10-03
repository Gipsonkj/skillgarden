# Story structure and beat sheets

> Distilled from: sw-story-structure (jtydhr88/screenwriting-skills, MIT), cinematic-director (wuwangzhang1216/DirectorSKILL, MIT), video (smixs/visual-skills, CC-BY-4.0, by Serge Shima), storytelling (fal-ai-community/skills, MIT), ai-video-storyboard (aicontentskills/ai-video-storyboard-skill, MIT), short-drama-director (lixiaoxiao9888-create/manju-laoli-skill, MIT), film-storyboard-skill (rainlib/ai-storyboard, GPL-3.0 — ideas only, restated in our own words; no text or templates copied).

Use this before any shot exists. Structure decides what the audience feels and when; shots only deliver it.

## 1. The units, smallest to largest

| Unit | What it is | Test |
|---|---|---|
| Beat | One change in the balance of pressure: an action and the reaction to it | State-in differs from state-out, and you can name who or what caused the change |
| Scene | Continuous time and place where a value turns (safe to unsafe, trust to doubt) | Write the value at the start and at the end. Same sign = exposition; cut it or fold the information elsewhere |
| Sequence | 2-5 scenes building to one peak, with one title ("the escape", "the proposal") | Each scene hits harder than the last |
| Act | Sequences ending in a major reversal | The reversal is bigger than any reversal before it |
| Story | Acts ending in a change that cannot be undone | The final change is absolute; earlier ones can reverse |

A beat is **not** a camera change, a location change or new stage business. A real beat survives being shot three different ways.

## 2. Pick a shape before beating

| Shape | Use for | Spine |
|---|---|---|
| Three-act (setup / confrontation / resolution, roughly 25/50/25) | Narrative film, drama, most ads with a character | Inciting incident by 10-12%, act-two break by 25%, midpoint 50%, low point 75%, climax in the last 20% |
| Save the Cat 15 beats (110-page model) | Feature or long-form outlines | Opening image (1), theme stated (5), setup (1-10), catalyst (12), debate (12-25), break into two (25), B story (30), fun and games (30-55), midpoint (55), bad guys close in (55-75), all is lost (75), dark night (75-85), break into three (85), finale (85-110), final image (110) |
| Kishotenketsu (setup / development / twist / conclusion) | Four-panel comics, fables, no-villain pieces, quiet ads | Panel or block 3 reframes the first two without a fight |
| Hook / Build / Payoff / CTA | Social video, TikTok/Reels default | Problem or oddity on screen in the first second, no logo first |
| Problem / Solution / Proof / CTA | Ads, explainers | Product appears only after the problem is felt |
| Atmosphere / Reveal / Climax / Logo | Brand film, mood piece | Longer holds, one slow reveal |
| Short-drama 12-beat curve | Vertical micro-drama episodes and arcs | See [short-drama-vertical.md](short-drama-vertical.md) |

Rules that every shape shares:

- The protagonist chooses to enter act two. Being dragged or waking up there is weaker.
- Setup longer than about 25% of runtime loses the audience.
- Act three must have more than two beats. "She knows what to do" plus "big fight" is a gap: go back to the setup's planted problems, the B story and the villain list.
- Final image is the opposite of, or a changed echo of, the opening image.
- The audience's top curiosity is a one-night treat; foreknowledge (they know, the character does not) lasts longer. Give the audience the key when dread or irony is the goal.

## 3. Beats per duration

| Target | Beats | Typical shots | Shape |
|---|---:|---:|---|
| 8-15 s (one clip, social) | 2-3 | 2-4 | One turn, no aftermath |
| 20-40 s (one scene) | 4-6 | 4-8 | Setup, escalation, turn, aftermath |
| 40-60 s (social short) | 6-8 | 8-14 | Setup, two escalations, turn, aftermath |
| 60-90 s (sequence) | 7-10 | 12-20 | Two escalations before the turn |
| 3-5 min (short film) | 18-30 | 40-90 | Split into 3-5 scenes, beat each separately |

Working rule: `beats = seconds / 5` up to 40 s, widen toward `/7` between 40 and 60 s, and past 60 s split into scenes of 20-40 s and beat each one. More than 12 beats in one table means you are beating a sequence; split first.

## 4. The beat table

| # | Thread | Story function (verb) | State in | Δ pressure (agent) | Visual action | State out | Shot family | Sec |
|---:|---|---|---|---|---|---|---|---:|

- **Story function** is a job in verb form: "reveal that delivering the letter has a cost", never "sad moment".
- **Δ pressure** is a signed number on a 0-10 tension scale plus the agent that applied it (the character's own hand, another person, an off-screen sound, a deadline). A Δ of 0 is not allowed: merge the row.
- Track two curves when audience and character diverge (they know something he does not): write `-6 him / +1 us`.
- The running curve must add up: start value plus each Δ. A curve that does not sum is a mood board.
- **Visual action** uses only verbs a camera can photograph. No "realizes", "remembers", "feels".
- **Shot family** comes from the nine functions in [shot-language.md](shot-language.md): establishing, relation, close-up, insert/detail, reaction, transition, aftermath, point-of-view, reveal.
- **Sec** values sum to the target duration and become the shot plan's time budget.
- Beat IDs (B1, B2...) are the join key for the shot plan. Never renumber once shots reference them.

Full template with a worked 22-second example: [../templates/cinematic-director/beat-sheet-template.md](../templates/cinematic-director/beat-sheet-template.md).

## 5. Scene formula and five anchors (short pieces)

A scene exists only when all five are present:

```text
Scene = desire + obstacle + space geometry + controlled gaze + editing rhythm
```

Name each in one sentence before boarding. If you cannot, the scene is decoration.

For any piece under ~90 s, commit to exactly five anchors:

| Anchor | Example (30 s, guilt) |
|---|---|
| One main emotion | Guilt |
| One visual motif | His reflection in glass surfaces |
| One anchor object | A phone with one unread message |
| One break | He deletes the message |
| One final image | His face ghosted in the dark phone screen |

## 6. Default beat maps for short video

60-90 s dramatic piece (compress proportionally for 30 s or 15 s, but never drop the Crack or the Impact):

```text
0-5s    Hook          hero already in tension, no setup
5-15s   Context       where, who is near, what is at stake
15-30s  Pressure      hero tries to keep control
30-45s  Crack         a detail breaks the hero's position
45-60s  Acceleration  cuts shorten
60-75s  Impact        decision, break, confession or action
75-90s  Aftermath     silence or visual residue
```

Ad and social timings:

| Format | Shots | Map |
|---|---:|---|
| 15 s social ad | 3-4 | 0-2 hook, 2-6 context, 6-11 proof, 11-15 close with CTA-safe frame |
| 30 s commercial | 6 | 0-3 hook, 3-7 hero/product, 7-13 benefit, 13-20 proof, 20-27 strongest motion shot, 27-30 end frame |
| 60 s YouTube Short | ~12 | hook, three-act body, CTA |
| 90 s explainer | ~18 | problem, solution, how it works, results, CTA |

## 7. Key-moment board (for long scripts)

For a script that is too long to board shot by shot first:

1. Pick about nine key moments that carry the story: the inciting incident, each act break, the midpoint, the low point, the climax and the final image, plus one or two character-defining moments. Spread them; do not take four from act one.
2. Board those nine as single panels (a 3×3 grid). This is the pitch and the style test.
3. Expand only the moments that need it into 4-panel sequences that obey the 180-degree rule and keep identity text verbatim.
4. Then write the full shot plan.

## 8. Emotion curve check

Score each beat 0-10 for tension and plot it.

- At least two peaks at 9+, with a real dip (around 4-5) between them. Flat 5-6 for the whole piece is the most common failure.
- The opening beat is already above 3 and carries a conflict, not a mood.
- The biggest rise should land around 75-85% of runtime.
- The last beat may release the character while tightening the audience.

## 9. Structure diagnostics

| Symptom | Likely cause | Fix |
|---|---|---|
| "Nothing happens" | Scenes with no value turn | Mark +/- at the start and end of each scene; delete the ones that do not flip |
| Saggy middle | One complication repeated | Each complication must cost more than the last; add a midpoint that reverses fortune |
| Ending feels unearned | Climax not set up | Plant the tool, skill or flaw in act one; pay it off in act three |
| Too many characters | Every scene needs a fresh face | Merge characters until each one has a job only they can do |
| Pretty but empty ad | No causal spine | Pick the arc first (§2), then lay beats on it |
