# HyperFrames compositions and workflows

> Distilled from: hyperframes, general-video, music-to-video, faceless-explainer, talking-head-recut (heygen-com/hyperframes, Apache-2.0); brag (latent-spaces/brag, MIT); video (coreyhaines31/marketingskills, MIT).

HyperFrames renders video from HTML. A composition is an HTML file whose elements declare timing with `data-*` attributes, whose animation timeline is seekable, and whose media playback is owned by the framework. It is the default for code-rendered video: plain HTML/CSS/GSAP, deterministic renders, Apache-2.0. Use Remotion only when the user already has a Remotion project or asks for it.

The upstream project ships its own skills (`/hyperframes`, `/hyperframes-core`, `/hyperframes-cli`, workflow skills). When they are installed, load them for the full contracts. This file is the working summary.

## CLI loop

| Step | Command | Notes |
|---|---|---|
| Usage/allowance | `npx hyperframes usage --json` | At start and before render. Unknown means say unknown, don't guess. |
| Scaffold | `npx hyperframes init "videos/<kebab-name>" --non-interactive --example=blank --skill=<workflow>` | Name from the brief, never a timestamp. `init` refuses a non-empty dir, so write `BRIEF.md` after. |
| Refresh a workflow skill | `npx hyperframes skills update <workflow>` | Ask the user first; surface failures, don't rebuild from memory. |
| Environment | `npx hyperframes doctor` | Only after a failure. |
| Search named looks | `npx hyperframes catalog --query "film grain" --json` | Before hand-building any named effect (glitch, CRT, confetti, chart, device mockup). Around 400 blocks; needs no project. |
| Install a block | `npx hyperframes add <block>` | Install once, before any parallel work. |
| What's on the timeline | `npx hyperframes timeline --json` | Cheaper than reading every file. |
| Fast lint | `npx hyperframes lint` | After the first HTML pass and structural changes. |
| Final gate | `npx hyperframes check` (`--snapshots`) | Runs lint plus runtime, layout, motion and WCAG contrast. Must pass. |
| Contact sheet | `npx hyperframes snapshot --at 2.5,7.1,12.0` | Use scene midpoints. Writes `snapshots/contact-sheet.jpg`. |
| Preview | `npx hyperframes preview --background` | Hand the user the URL. |
| Render | `npx hyperframes render --quality draft|high -o renders/video.mp4 --fps 30` | Only after approval. macOS: `PRODUCER_BROWSER_GPU_MODE=hardware`. |
| Transcribe | `npx hyperframes transcribe audio.mp3 -d <dir> --json --model small.en` | Local Whisper, word-level, no key. |
| Publish | `npx hyperframes publish` | Private link by default; only on request. |
| Pinned CLI | `npx hyperframes@latest upgrade --project . --check` | When a project pins an old version; verify with `check` after upgrading and name the versions. |

## Composition contract (what breaks renders)

- Every timed element has `class="clip"` plus `data-start`, `data-duration` and `data-track-index`. Use `data-duration`, not `data-end`; `data-track-index`, not `data-layer`.
- Each composition registers one **paused**, seek-safe timeline on `window.__timelines["<id>"]`, built synchronously at load. No `async`, `setTimeout`, promises or `media.play()`.
- Deterministic: no `Math.random()` without a seed, no `Date.now()`, no network fetches at render time. All assets local (`assets/`, `public/`); absolute `/Users/...` paths silently fail.
- Animate transforms and opacity (`x`, `y`, `scale`, `rotation`, `opacity`), not `top/left/width/height`. Animate wrappers (`#video-wrap`), never the `<video>` element's size. Never animate `visibility`/`display` on a `.clip` (the framework owns it).
- Don't tween the same property on the same element from two timelines at once.
- `repeat: -1` only inside a finite root `data-duration`.
- Full-bleed backgrounds ride on their own full-duration clip layer, not on `#root` (the root background is clip-gated and dark content can land on black).
- Fonts: list concrete family names for body/global `font-family` (not a CSS variable) so the font resolver sees them; don't assume an unbundled display font exists in cloud renders. Assert the font loaded before rendering.
- Video clips: re-encode sources with a keyframe every frame-rate frames or they freeze on seek:
  `ffmpeg -i in.mp4 -c:v libx264 -crf 18 -g 30 -keyint_min 30 -pix_fmt yuv420p -movflags +faststart -c:a aac public/input.mp4`
- Hard cut/trim of footage: duplicate the source into several clips; set the source range with `data-media-start` + `data-duration` and placement with `data-start`. Sound stays on the clip (`data-has-audio="true"`).
- Constant `data-playback-rate` is render-safe; speed ramps go in a `rate` lane of `data-automation`.
- Clamp every end time to the media duration (Whisper's last word can overrun and leave a black tail).

## Project shape

```
videos/<project>/
  BRIEF.md            confirmed brief (workflow, flow, storyboard, aspect, length...)
  frame.md            design spec: palette, type, layout feel (copied from a preset, not invented)
  STORYBOARD.md       one "## Frame N" block per scene: status outline/built/animated, src, blueprint/rules, beat
  SCRIPT.md           locked narration (when narrated)
  audio_meta.json     voice files + word timings + BGM
  compositions/frames/NN-<id>.html   one scene per file (sub-compositions)
  index.html          assembled timeline
  renders/video.mp4
```

Use one file for a short single scene; sub-compositions for 3+ hard cuts or reused scenes. Long pieces (many cards over 30 s) split into chapter sub-compositions to keep each timeline small.

## Production loop (dependencies, not strict steps)

| Stage | Needs | Produces |
|---|---|---|
| Blocks & assets | approved plan | registry blocks installed, user media staged, logos/images resolved |
| Audio | locked script, music mood | voice + word timings + BGM; when BGM plays under voice, carve or duck the bed |
| Frames | design spec + plan | `compositions/frames/NN-*.html`, built at their most visible moment first, then animated |
| Duration sync | word timings | scene durations set to real voice length (never hand-edit synced values) |
| Assembly | frames | `index.html` with scenes on tracks |
| Transitions | index | scene handoffs (cut, crossfade, wipe, shader) |
| Captions | word timings + index | caption track, last |
| Verify | all above | `check` passing + contact sheet |
| Deliver | approval | render, optional publish |

Audio renders in the background while frames build. Up to about 6 short scenes build faster inline than with sub-agents (measured roughly 9 min inline vs 21 min dispatched). Beyond that, give each worker 2 to 3 scenes and launch all workers in one wave; workers never run the CLI (the assembled project doesn't exist yet).

## Review gates

1. **Plan in chat:** message sentence plus a frame table (frame, beat type, duration, on screen, why). Ask: approve? Sketches first or build straight away?
2. **Sketch sheet (optional):** static, fully styled layouts of each frame's key moment in `storyboard.html`; revise only the frames named. A confirmed sheet can be the deliverable.
3. **Build** on the confirmed layouts: dress them, don't redraw them.
4. **Final look:** after `check` passes, open the preview and ask "render now, or what changes?" Render only on a yes. In autonomous runs this is the one question you still ask ("preview first, or render?").

Autonomous is not silent: replace questions with visible decisions and short reasons, and deliver the contact sheet plus actual duration.

## Design before HTML

Resolve the design source in order `frame.md` → `design.md` → `DESIGN.md`. With none, before writing HTML: name the concept angle in one sentence, choose an embeddable font pairing, and define the focal element, edge anchors, supporting detail and background treatment. When the user wants to choose, show 2 to 3 preset showcases in the browser and let them pick by eye, not from names.

## Motion inside compositions

Use named blueprints and rules from the animation library rather than improvised motion. Get eases, staggers and kinetic type from the sibling `motion-animation` super skill. House rules that hold across sources: entrances ease-out, exits ease-in, nothing the eye follows on linear; never reveal two independent elements at once; hold the final frame 1 s or more before the cut.

## Audio-reactive treatment (optional)

Pre-extract per-frame RMS/band energy and sample it synchronously in the timeline: hero glow breathes with bass, a card gains presence on hits. No equalizer bars or waveform clip-art, no strobing text, and never claim beat sync without a real beat grid (see music-beat-cut.md).

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| Frozen frame under overlays | Sparse-GOP source | Re-encode with `-g fps -keyint_min fps` |
| Black tail | Duration past media end | Clamp to probed duration |
| Text in fallback font | Font not loaded or CSS var in `font-family` | Concrete family names, assert `document.fonts.check` |
| Content invisible | Background on `#root` | Background on its own clip layer |
| `gsap_animates_clip_element` lint | Tweening visibility/display on a clip | Animate opacity/autoAlpha on an inner wrapper |
| Small caption overflow (1 to 4 px) on caption words | Snug caption line-height | Known false positive; act only when a frame element is named |
| Render times out on a Mac | Software GPU | `PRODUCER_BROWSER_GPU_MODE=hardware` |
