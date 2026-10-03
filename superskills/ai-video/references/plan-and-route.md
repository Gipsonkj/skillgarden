# Plan and route a video

> Distilled from: hyperframes, general-video, faceless-explainer (heygen-com/hyperframes, Apache-2.0); video (coreyhaines31/marketingskills, MIT); video-use (browser-use/video-use, MIT); vox-director (Alisa0808/vox-director, MIT); video-editing (affaan-m/everything-claude-code, MIT); brag (latent-spaces/brag, MIT).

Route first, then plan, then build. A wrong route changes the deliverable; a wrong detail is a cheap fix.

## 1. Read project state before asking anything

| Found on disk | Do |
|---|---|
| `BRIEF.md` | Execute it. Ask nothing it already answers. |
| `hyperframes.json` or `STORYBOARD.md` | Resume from the files; ask at most one routing question. |
| `edit/project.md` (footage edit) | Summarize the last session in one sentence, ask whether to continue. |
| A specific edit request on an existing project | Make that edit only. No interview. |
| Nothing | Fresh creation: intake below. |

## 2. Intake: the fields that change the output

Ask one field per message, recommended option first with a one-line reason, and skip what the request already answers.

| Field | Rule |
|---|---|
| Subject / input | Brief, URL, script, footage, still image, music. Without it, ask what the video is about. |
| Message | One sentence: "This video tells [audience] that [message]." Don't storyboard until it is clear. |
| Destination | Sets aspect: TikTok/Reels/Shorts 1080x1920; feed 1080x1080 (or 1080x1350 for 4:5); YouTube/web/desktop 1920x1080. State the derivation. |
| Length | Recommend a range the material supports. Social promo 15 to 25 s; explainer 45 to 90 s; specialized workflows strongest at 30 to 90 s, up to about 3 min. |
| Narration | yes / minimal / no. Script pasted? Ask once: keep verbatim or restructure. |
| Language | Use the user's language and say so. Prompts to video models stay in English. |
| Look | User has brand/design spec, wants to pick by eye from 2 to 3 options, or doesn't care (you decide and say why). |

When three or more fields are open, propose one bundle instead of a quiz: "Reels: 9:16, 30 s, voiceover, captions, -14 LUFS. OK?"

A "just build it" / "surprise me" signal means: ask nothing more, state your choices with reasons, and still ask once before the final render.

## 3. Choose the production route

| Route | Use for | Avoid for | Read |
|---|---|---|---|
| **Code-rendered** (HyperFrames HTML/GSAP; Remotion if the user already uses it) | Exact text, brand, data, UI demos, kinetic type, explainers, templates, batch variants | Organic motion, photoreal people | hyperframes-workflows.md |
| **Generative video** (text/image-to-video) | B-roll, hero shots, camera moves, animating a still, scenes you can't film | Readable text, logos, real locations, specific products | generative-prompting.md, vendor-*.md |
| **Footage edit** (ffmpeg, transcript-driven) | Talking heads, interviews, tutorials, vlogs, long-to-short | Inventing visuals that don't exist | footage-editing-ffmpeg.md |
| **AI presenter / avatar** | Recurring updates, multilingual, explainers without filming | Authentic founder content, UI walkthroughs | vendor-heygen-avatars.md |
| **Hybrid** (most good work) | Generated plate + code text on top; footage + designed cards | | all of the above |

Rule: if the viewer must read it, it is set in code. Match frame rate and colour between layers.

### HyperFrames workflow routing (first match wins)

| Request | Workflow |
|---|---|
| Port existing Remotion source | remotion-to-hyperframes |
| Presentation / pitch deck | slideshow |
| Plain captions on existing talking-head footage | embedded-captions |
| Designed overlay cards on talking-head/interview footage | talking-head-recut |
| Beat-synced piece driven by a music track, no narration | music-to-video |
| Short (under ~10 s) unnarrated motion-first unit (logo sting, stat hit, lower third) | motion-graphics (see sibling `motion-animation`) |
| Explain a GitHub PR | pr-to-video |
| Promote a website/product/app from a URL | product-launch-video |
| Explain a topic/article with invented visuals | faceless-explainer |
| Anything else (montage, sizzle, footage remix, long piece) | general-video |

Ambiguities: music as a bed doesn't make a music video; only a beat grid that drives the cuts does. Retiming, reordering, reframing or recolouring footage is a custom edit (general-video or ffmpeg). "I want a storyboard" changes the review process, not the route.

## 4. Pick a story structure

| Structure | Use when | Shape |
|---|---|---|
| Hook → payoff | One idea, safest default | Hook → context → build → payoff → button |
| Concept explainer | One idea people half-know | Name it → reveal mechanism layer by layer → implication |
| How-to / how it works | Ordered steps | Hook → what it is → 3 to 6 steps, one move each → benefit |
| Listicle | Parallel items | Promise → N items (3 is strongest) → recap/CTA |
| Problem-agitate-solve | Pain-aware ads | Problem → agitate → solve → proof → CTA |
| Before-after-bridge | The "after" sells | Before → after → bridge → CTA |
| Timeline | History, evolution | Start → events → turning point → present → takeaway |
| Man in a hole | Case study, comeback | OK → fall → deepen → climb out → better than before |
| Myth buster | Correcting a belief | Fact → myth → why it's wrong → what to believe |
| Launch / demo | Product | Hook → problem → solution → benefit → example → CTA |
| Tutorial | Teaching software | Intro → setup → steps → gotchas → recap |

Never paraphrase an article in paragraph order. Extract audience, gap, thesis (one line), spine (3 to 6 ideas), evidence (numbers, examples), landing. The thesis lands by beat 2.

## 5. Hooks (first 1.5 to 3 s)

Pick one: surprising statistic, rhetorical question, counterintuitive claim, pain validation, visceral metaphor, direct address ("If you've ever..."), mistake callout, outcome tease, pattern interrupt. The hook speaks the viewer's payoff, never the source text's headings.

## 6. Pacing numbers

| Duration | Beats | Beat length | Voiceover words (about 2.3 words/s) |
|---|---|---|---|
| 15 to 25 s promo | hook 2-3 s, reveal 2-4 s, 2-3 highlights, outro 2-4 s | 2 to 5 s | 35 to 55 |
| 30 s | 6 to 8 | 4 to 5 s | 70 to 80 |
| 60 s | 10 to 12 | 5 to 6 s | 130 to 150 |

- Proportions: hook 1 to 3 s, body 70 to 80%, payoff 10 to 20%, CTA 0 to 2 s.
- Generated shots run 3 to 6 s. Give a beat with 8 to 10 s of narration 2 shots (wide with headline, then a detail cut-in) so the picture cuts mid-sentence.
- Simple cards over voiceover: 5 to 7 s; complex diagrams 8 to 14 s; beat-synced accents 0.5 to 2 s.
- Endings: hard cut on the payoff (drives rewatches), a CTA of 2 s or less with 3 to 5 words, or a loop where the last line mirrors the first.

## 7. The beat sheet (the plan you get approved)

```
This video tells first-time founders that runway is a choice, not a number.
| # | t (s)    | beat type | on screen                  | motion / shot          | audio            | why                    |
|---|----------|-----------|----------------------------|------------------------|------------------|------------------------|
| 1 | 0.0-2.5  | hook      | "You have 9 months." (code)| slam in, hold          | hit on 0.0       | stakes in 2 s          |
| 2 | 2.5-7.0  | problem   | burn chart, i2v plate      | slow push-in           | VO line 1        | makes the pain concrete|
```

For footage edits the plan is prose: shape, take choices, cut direction, graphics plan, grade direction, subtitle style, length estimate (4 to 8 sentences). Wait for the user's yes.

## 8. Scope and cost guardrails

- Build exactly what was asked. A title card is not a title card plus three scenes and music. Offer extras; don't add them.
- Name expensive layers as you propose them (render minutes, sign-in, per-second API cost).
- Fire independent generations (images, TTS, music, clips) at the same time; build while they run.
- Batch visual checks into one contact sheet per phase. Every image you inspect costs context.
