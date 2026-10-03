# HyperFrames creative direction

> Distilled from: hyperframes-creative, product-launch-video, hyperframes-studio (heygen-com/hyperframes, Apache-2.0).

The non-technical half of a HyperFrames video: which design spec rules, how video type and colour differ from the web, how to write narration, how to direct beats and plan rhythm, the storyboard the user reviews, data scenes and audio-reactive visuals. The composition contract and CLI are in [hyperframes-workflows.md](hyperframes-workflows.md); motion rules and keyframes are in the sibling `motion-animation` super skill.

Boundaries: don't override the technical contract, don't demand a design system for a one-line technical composition, and don't add scenes, narration, music, captions or transitions the request didn't ask for unless you propose them first.

## 1. The design spec

Read the first file that exists: `frame.md` → `design.md` → `DESIGN.md` (`frame.md` is always lowercase and wins for video). Load it once at the start; every later step uses that copy.

- **Frontmatter is normative**: `colors`, `typography`, `spacing`, `components`. Quote hex, family and weight verbatim; never round or invent.
- **Prose is context**: intent, when to use, constraints. Read it for judgment, not values.
- **Brand is strict, layout is yours.** Keep the hex values (including the background), families, weight relationships and Do's/Don'ts. Adapt sizes, spacing, decorative opacity, border weight and component treatment for video. A light canvas stays light.
- **Seed from a preset (optional).** The upstream skill ships 13 frame presets (editorial, neobrutalist, poster, risograph, picture-book and others), each a `FRAME.md` to copy as `frame.md` plus a showcase page to look at. When the user wants to choose, show 2 to 3 showcases in the browser and let them pick by eye.
- **Custom style**: name it after a designer, movement or cultural reference; write YAML tokens (2 to 5 colours, 2 to 3 type scales, radius, spacing, motion energy/easing/duration), one paragraph of feel and avoid-list, then components that reference the tokens.

**Adherence check after building**, before the preview: every hex in the HTML appears in the spec; families and weights match; radii, spacing density and shadow depth match what the spec declares; nothing from its "don't" list appears. With no spec, check that the same background, foreground and accent hold across every scene and that each lazy default below was a choice.

## 2. No spec: house style

1. **Interpret the prompt; generate real content.** A recipe shows real ingredients, a HUD real readouts.
2. **Declare bg, fg and one accent before any HTML.** Light for food, wellness and kids; dark for tech, cinema and finance. Same background across scenes. Tint neutrals toward the accent; avoid pure `#000`/`#fff`.
3. **Question the lazy defaults**: gradient text, left-edge accent stripes on cards, cyan-on-dark or purple-to-blue gradients and neon, identical card grids, everything centred with equal weight, the overused fonts in §4. Use one only when it is right for this content.

| Palette family | Use for |
|---|---|
| Bold / energetic | launches, social, announcements |
| Warm / editorial | storytelling, documentary, case studies |
| Dark / premium | tech, finance, luxury, cinematic |
| Clean / corporate | explainers, tutorials, presentations |
| Nature / earth | sustainability, outdoor, organic |
| Neon / electric | gaming, nightlife |
| Pastel / soft | fashion, beauty, wellness |
| Jewel / rich | luxury, events |
| Monochrome | dramatic, type-led |

Or derive from OKLCH: one hue, bg/fg/accent at different lightness. Mood to style: analytical → Swiss grid; premium → restrained modernist; raw or rebellious → deconstructed; loud launch → maximalist type; AI or speculative → data-driven generative; warm and personal → soft; festive consumer → folk colour; dramatic → dark cinematic.

## 3. Video is not a web page

| Element | Web | Video |
|---|---|---|
| Headline | 32-48 px | 64-120 px |
| Body | 14-16 px | 28-42 px |
| Label | 12 px | 18-24 px |
| Decorative opacity | 3-8% | 12-25% |
| Border | 1 px | 2-4 px |
| Padding | 16-32 px | 60-140 px |

- In-feed destinations (X, LinkedIn, Instagram feed) play small: body ≥ 32 px, headlines ≥ 90 px, data labels ≥ 24 px. Justify any font size under 24 px.
- **Layers, not slides**: a background treatment (radial glow, ghost type, grid, grain, colour panel), the midground message, and foreground details (rules, labels, data bars, registration marks). Roughly 6 to 10 visual roles suits a produced marketing frame; a lower third needs far fewer. Decoration must not become new claims or content.
- **Composition**: two focal points; hero text 60-80% of frame width; anchor to edges and use split or zoned layouts instead of centred-and-floating; structural rules and dividers animate well (`scaleX` 0 → 1).
- **Colour presence**: the accent must be visible (15-25% for atmosphere, full saturation on the focal). Light canvases need 2 px+ borders, stronger rules and some texture. No full-screen linear gradients on dark backgrounds: they band under H.264; use radial, solid, or solid plus a local glow.
- **Images never sit flat**: perspective tilt (`gsap.set(el, { transformPerspective: 1200, rotationY: -8 })`, not CSS `perspective()`), slow Ken Burns (`scale` 1 → 1.04 over the beat), device frame, or a key element lifted to its own depth.
- **Motion variety**: no more than 2 independent tweens with the same ease per scene; the slowest scene about 3x slower than the fastest; vary entry direction; offset the first animation 0.1-0.3 s from the scene start.

**Conflict, resolved:** the creative guide wants slow ambient motion on every decorative; the launch-video doctrine bans "lazy breathing" and prefers stillness. Both hold in their place: background decoratives may drift or glow slowly; cards, text and the subject never breathe; a held read stays still, with at most a subtle low-amplitude jitter. Breathing content looks cheap and pulls the eye off the message.

## 4. Type for rendered video

- **Bundled families render offline with no warning**: Inter, Roboto, Open Sans, Lato, Nunito, Montserrat, Poppins, Outfit, Oswald, League Gothic, Archivo Black, Playfair Display, EB Garamond, Space Mono, IBM Plex Mono, JetBrains Mono, Source Code Pro, Noto Sans JP. Only their shipped weights exist (mostly 400/700/900); League Gothic and Archivo Black are 400 only. Helvetica/Arial map to Inter, Futura to Montserrat, Bebas Neue to League Gothic, Courier to JetBrains Mono.
- Any other Google font is fetched at build time with a lint warning, and the render fails if Google is unreachable in cloud renders. For anything that must render predictably, ship the font file with a local `@font-face`.
- **Overused as defaults** (fine when chosen on purpose): Inter, Roboto, Open Sans, Noto Sans, Lato, Nunito, Poppins, Outfit, Sora, Playfair Display, Cormorant Garamond, Bodoni Moda, EB Garamond, Cinzel, Prata, Syne. Bundled and distinctive: Montserrat, Oswald, League Gothic, Archivo Black and the four monos.
- Never pair two sans or two near-identical faces: serif + sans, sans + mono, or one family at two weights. One expressive font per scene. Weight contrast 300 vs 900, not 400 vs 700. Pick the register first (what physical object would carry this type?), then reject your first instinct.
- Tracking −0.03 to −0.05em on display sizes. On dark grounds use body weight ~350 and add 0.05-0.1 line-height. `font-variant-numeric: tabular-nums` on data. Text on screen 3 s must read in 2.

## 5. Narration

- About 2.3-2.5 words per second (15 s ≈ 35 words, 30 s ≈ 75, 60 s ≈ 150). The script should feel shorter than the video.
- Contractions, mixed sentence lengths, no brochure lines. Read it aloud.
- Write what the voice must say: "135+" → "more than one hundred thirty five", "$1.9T" → "nearly two trillion dollars", "10x" → "ten times", "API" → "A P I", "stripe.com" → "stripe dot com". The picture can show the exact figure while the voice rounds it.
- Product structure: hook → story → proof (real numbers, names) → CTA. A 15 s ad may be hook + proof + CTA.
- The opening line creates tension in 3 s: a bold claim, a provoking question, a contrast, or (sparingly) a number. "Welcome to…" or "Introducing our product" means start over. Vary the hook type between videos.

## 6. Story spine (narrated, story-driven pieces)

Not for music videos, wordless motion graphics, caption jobs on fixed footage or presenter-led decks.

1. The hook speaks the viewer's outcome ("40% faster cold starts"), never internal vocabulary (file names, feature lists, the article's headings, "23 files changed").
2. The value claim lands by beat 2; everything after is evidence. Self-check: delete the evidence beats and the value still stands; delete the value beats and it should collapse.
3. Present the plan as a proposal: "This video tells [audience] that [message]", then a frame table with a **Why** per frame traced to the message. A frame with no traceable why is cut.
4. Props come from the source: real file names, the product's own numbers, the article's own metaphor. If a prop could appear unchanged in another product's video, replace it.

## 7. Beat direction and rhythm

For each beat write: a **concept** (2-3 sentences: what world, what metaphor, what the viewer feels), **mood references** (movements or designers, not hex), a **verb for every element** (impact: slams, stamps, shatters; directional: slides, pushes, wipes; build: draws, fills, assembles, counts up; ambient: floats, drifts, orbits; mechanical: types on, snaps, locks in), **depth layers** (at least 2), the **transition out**, and **SFX cues**. If you can't name an element's verb, it isn't designed yet.

| Transition | Use for |
|---|---|
| Shader (WebGL) | the centrepiece reveal, logo or product unveil, moments the music or VO punctuates |
| CSS (push, zoom, blur, iris, blinds, light leak, glitch) | connective tissue, continuous camera-like moves |
| Hard cut | rapid lists, percussive edits on the beat, comic timing |

A 5 to 7 beat brand reel wants 1 to 2 shader transitions (hero reveal and CTA); more flattens them. Timing presets: instant 0.15 s, snappy 0.2, smooth 0.4, dramatic 0.5, gentle 0.6, luxe 0.7. Velocity-matched hand-off: exit on `power2.in`/`power3.in` with a blur ramp, enter on the matching `.out` with blur clearing, speeds within about 5% at the cut.

**Name the rhythm before building** ("hook-PUNCH-breathe-CTA", "fast-fast-SLOW-fast-SHADER-hold"), derived from the brand and the story, not from the duration: 15 s for an architecture firm and 15 s for a game are different rhythms. Sometimes hook, one feature, hold and CTA is the right 15 s.

**Prompt expansion** (multi-scene work): expand the request into `.hyperframes/expanded-prompt.md`: a style block quoting the spec's exact values, the rhythm, global rules, per-scene concept, mood, depth, choreography and transition, recurring motifs, and a negative list. Point the user to the file instead of pasting it, and build after they approve.

## 8. The storyboard and its review sheet

**Above the first `## Frame`** in `STORYBOARD.md` (sections after the last frame leak into it): message as a claim ("Close isn't final", not "About the inspector"), audience and arc, format (aspect, length, voiceover, music; content in the top ~83% when captions run), the **spine** (the one device threading every beat), brand tokens from a real capture with their source, a short ban list (name both motion failures: the slideshow and the screensaver), and one deliberately **held frame**.

| Beat field | Rule |
|---|---|
| Heading | `NN — Name (start–end, ~dur)`; sum the durations and check against the target |
| Length | 1.5-3.5 s; a beat to read ~3 s; a hand-off 1.5-2 s; a 5 to 7 word line 2-2.5 s |
| On screen | Concrete objects, counts, positions; every word verbatim in quotes |
| Voiceover | Verbatim, or `onscreen` for silent films; reveals land on the word that names them |
| Hero prop | What persists, and where it returns as a callback |
| Motion | Named moves with ease and duration; first visible motion within 0.2 s of the beat start |
| Seam out | Named transition and direction; one direction rule for the film (leftward by default) |
| Constraint | At least one "no …" per beat that could go generic |
| Why | The beat's job, traced to the message |

Real product proof is real: a capture, real command output, or a labelled placeholder until it arrives. Never approximate the launched product's UI.

**`storyboard.html`** (one self-contained file in the project root): header with title, version, one-line dek and a resolution/length/beat-count tag; three columns of 16:9 cells sized in `cqw` (`container-type: inline-size`), each with `id="frame-NN"`, the key moment drawn with real words, fonts and colours, a label row (`NN · NAME` / `id · start–end`), one or two sentences on what moves first, and a chip naming the seam; then a seam-map cell and a tokens cell. No motion, no scripts, no external assets: it must open from `file://`.

**Review round:** record notes verbatim under `## Changes from v1` and open questions under `## Still open`, bump the version, revise only the beats named, and list what is final under `## Locked`. Build only after the lock. After the build, regenerate the timing table from `index.html` (and the transcript) and update both files: every real film drifts from its board.

## 9. Data in motion

- Successive stats about one concept stay in one visual space; only the value changes. A new look signals a new concept.
- Every number gets visual weight: a fill bar, a ring, a colour shift, a shape sized to the value.
- No pie charts, multi-axis charts, 6-panel dashboards, gridlines, ticks or legends (2 to 3 related metrics side by side is fine). Build charts with GSAP + SVG/CSS, or a registry chart block, not a web chart library.

## 10. Audio-reactive visuals

Audio supplies timing and intensity; the visual idea comes from the content. Never equalizer bars, spectrum analyzers, waveforms, note clip-art, generic particles, rainbow cycling, strobing white or pulsing orbs.

1. Pre-extract per-frame data: `python3 scripts/hyperframes-creative/extract-audio-data.py track.mp3 --fps 30 --bands 16 -o audio-data.json` (needs ffmpeg and numpy; runs locally). Output: `{ fps, totalFrames, frames: [{ time, rms, bands: [...] }] }`, every band normalised 0-1 across the track, index 0 = bass.
2. Map: bass → `scale` pulse; treble → glow (`textShadow`, `boxShadow`); overall RMS → opacity, lift or background colour; mids → shape (`borderRadius`, width).
3. Sample every frame on the same paused timeline, not one long tween:

```js
for (let f = 0; f < AUDIO.totalFrames; f++) {
  tl.call(((fr) => () => draw(fr))(AUDIO.frames[f]), [], f / AUDIO.fps);
}
```

4. Text gets 3-6% scale variation and a soft glow; backgrounds and shapes can swing 10-30%. Corporate subtle, music video bold.
5. `textShadow` on a container of semi-transparent words draws a glowing rectangle: pulse the container's `scale`, glow only the active word.

The audio itself stays a root-level `<audio>`; the visual is a function of timeline time, never of `audio.currentTime` or a live Web Audio analyser. For cuts that follow the music, use a real beat grid ([music-beat-cut.md](music-beat-cut.md)).
