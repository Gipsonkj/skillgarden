# HyperFrames compositions and workflows

> Distilled from: hyperframes, general-video, music-to-video, faceless-explainer, talking-head-recut, hyperframes-core, hyperframes-cli, hyperframes-registry, hyperframes-studio (heygen-com/hyperframes, Apache-2.0); brag (latent-spaces/brag, MIT); video (coreyhaines31/marketingskills, MIT).

HyperFrames renders video from HTML. A composition is an HTML file whose elements declare timing with `data-*` attributes, whose animation timeline is seekable, and whose media playback is owned by the framework. It is the default for code-rendered video: plain HTML/CSS/GSAP, deterministic renders, Apache-2.0. Use Remotion only when the user already has a Remotion project or asks for it.

The upstream project ships its own skills (`/hyperframes`, `/hyperframes-core`, `/hyperframes-cli`, workflow skills). When they are installed, load them for the full contracts. This file is the working summary. Design spec, type, narration, beat and storyboard direction are in [hyperframes-creative-direction.md](hyperframes-creative-direction.md); keyframes and motion rules are in the sibling `motion-animation` super skill.

## Privacy and cost defaults (set before the first command)

| Thing | Default upstream | Do instead |
|---|---|---|
| Usage telemetry | On (anonymous counters, sandbox and agent fingerprint) | `npx hyperframes telemetry disable` once, or `HYPERFRAMES_NO_TELEMETRY=1`. Check with `telemetry status`. |
| `feedback` after renders | Upstream asks agents to send a rating after every render | Don't. `feedback`, `feedback --search-miss` and `--file-issue` post to a public HeyGen channel (`--file-issue` publishes the project). Only on the user's request. |
| `init` skill sync | Checks the installed HyperFrames skills against GitHub and updates the global set | Ask first; otherwise run with `HYPERFRAMES_SKIP_SKILLS=1` (`--skip-skills` is currently ignored). |
| `capture` vision captions | Sends captured images to Gemini or OpenRouter if `GEMINI_API_KEY`, `GOOGLE_API_KEY` or an OpenRouter key is in the environment | Pass `--skip-vision` unless the user agrees. DOM text is enough to plan. |
| `catalog --on-device` | Offers a ~33 MB model download | Plain `catalog --query` is local and sends nothing. Download only on a yes. |
| `cloud render`, `publish`, `auth` | Uploads the project zip to HeyGen; cloud renders cost credits | Only on request; state the cost. Lambda / Cloud Run only when the user owns that AWS / GCP setup. |

The CLI needs Node.js 22+ and FFmpeg. Run it as `npx hyperframes ...` unless the project has a wrapper script.

## CLI loop

| Step | Command | Notes |
|---|---|---|
| Usage/allowance | `npx hyperframes usage --json` | At start and before render. Unknown means say unknown, don't guess. |
| Scaffold | `npx hyperframes init "videos/<kebab-name>" --non-interactive --example=blank` | Name from the brief, never a timestamp. `--resolution portrait` (or `square`, `landscape-4k`), `--tailwind`, `--video clip.mp4`, `--audio track.mp3` (auto-transcribes; `--skip-transcribe`). `init` refuses a non-empty dir, so write `BRIEF.md` after. |
| From a URL | `npx hyperframes capture "<url>" -o ./capture --json --skip-vision` | Non-zero exit, `ok: false` or `capture/BLOCKED.md` is a hard stop. Retry into a fresh directory. |
| Search named looks | `npx hyperframes catalog --query "film grain" --json` | Before hand-building any named effect (glitch, CRT, confetti, chart, code window, device mockup). ~400 items; needs no project. Query in English even for non-English videos. |
| Install a block | `npx hyperframes add <name>` | Once, before any parallel work. Needs the network every time. |
| What's on the timeline | `npx hyperframes timeline --json` | Rows carry absolute `absStart`/`absEnd` and owning `file`, nested clips included. Cheaper than reading every file. |
| Fast lint | `npx hyperframes lint` | After the first HTML pass and structural changes. |
| Final gate | `npx hyperframes check` (`--snapshots`, `--json`) | Lint plus runtime, layout, motion and WCAG contrast. Must pass. Don't run a separate lint just before it. |
| Contact sheet | `npx hyperframes snapshot --at 2.5,7.1,12.0` | Scene midpoints. Writes `snapshots/contact-sheet.jpg`. `--zoom "#cta"` crops one element at 3x. |
| Preview | `npx hyperframes preview --background` | Hand over `http://localhost:<port>/#project/<dir-name>` (the hash matters), confirm HTTP 200, `preview --stop` when review ends. |
| Studio selection | `npx hyperframes preview --context --json --context-fields selection` | When the user says "this element". `no-selection` means ask them to click it. |
| Render | `npx hyperframes render --quality looks -o renders/video.mp4 --fps 30` | Only after approval. `draft` while iterating, `looks` (CRF 16, the default) for the first real encode, `delivery` for final. `--format webm` or `mov` keeps alpha, `gif` (no audio), `png-sequence`. `--docker` for byte-identical output. macOS: `PRODUCER_BROWSER_GPU_MODE=hardware`. |
| Batch | `npx hyperframes render --batch rows.json --output "renders/{name}.mp4" --strict-variables` | One render per row of variables; writes `manifest.json`. Not with `--variables`. |
| Compare | `npx hyperframes compare a/ b/ --at 4 --labels base,new --out compare.png` | Visual review only, max 16 variants; not a gate. `grade-compare` for colour grades. |
| Transcribe | `npx hyperframes transcribe audio.mp3 -d <dir> --json --model small.en` | Local Whisper, word-level, no key. `tts` and `remove-background` also run locally after a model download. |
| Environment | `npx hyperframes doctor --json \| jq -e '.ok'` | After a failure. `doctor` always exits 0, so gate on `ok`. `browser ensure` installs the bundled Chrome. |
| Pinned CLI | `npx hyperframes@latest upgrade --project . --check` | When a project pins an old version; verify with `check` after upgrading and name the versions. |

Read the render summary's second line: `beginframe` vs `screenshot` capture, GPU mode, stage timings. `screenshot` with `software gpu` on Linux is the slow path. After rendering, check the file exists and is non-empty, then `ffprobe` duration (and fps) against the root `data-duration`.

## What `check` tells you

- A lint **error** skips the browser: `browserSkipped: true`, `0 sample(s)`, `0/0 text checks`. That is "nothing ran", not "clean". Fix lint errors first.
- Severity is persistence-aware: an issue seen at one sample (entrance/exit transient) is info; issues held across samples gate. Held `content_overlap` is an error.
- `sweep_static`: a 3 s+ composition with no change at any sample fails. A reveal that finishes early and then holds fails too; spread reveals or keep one element alive (a blinking caret), don't add fake drift.
- Contrast: 4.5:1 normal text, 3:1 large (24 px+, or 19 px+ bold). Each finding carries a `suggestedColor` in the same palette direction.
- Useful flags: `--samples 15`, `--at 1.5,4`, `--at-transitions`, `--strict` (gate warnings), `--caption-zone "x0=0;y0=.82;x1=1;y1=1;severity=error"`, `--frame-check`.
- Escape hatches, marked on the narrowest element: `data-layout-allow-overflow` (also silences clipping and panel checks for the whole subtree, so keep it small), `data-layout-allow-overlap` (not inherited), `data-layout-allow-occlusion`, `data-layout-allow-caption-zone`, `data-layout-ignore` (decorative only). Snapshot before adding one.

Motion intent can be asserted in a `*.motion.json` sidecar next to the composition; `check` finds it automatically:

```json
{ "duration": 6, "assertions": [
  { "kind": "appearsBy", "selector": "#headline", "bySec": 0.5 },
  { "kind": "before", "a": "#headline", "b": "#cta" },
  { "kind": "staysInFrame", "selector": ".card" },
  { "kind": "keepsMoving", "withinSelector": ".scene" } ] }
```

A selector that matches nothing fails loudly (`motion_selector_missing`). `keepsMoving` fails on a static window over `maxStaticSec` (default 2 s).

## Composition contract (what breaks renders)

**Two root forms.** A top-level `index.html` puts the root `<div data-composition-id>` straight in `<body>`, no `<template>` (wrapping it hides everything). A sub-composition file loaded by `data-composition-src` wraps everything in `<template>`, and its `<style>` and `<script>` go **inside** the template: the loader discards the file's `<head>`. Give the host slot, the inner root and the `window.__timelines` key the same id. Style a sub-composition root by `#root`, not a class.

**Root.** `data-composition-id`, `data-width`, `data-height`; the root itself is `width/height: 100%` (never hard-coded 1920px). Root `data-duration` is read once at compile time, so scripts and `--variables` can't change render length. It may be omitted when a timeline, finite CSS/WAAPI animation, Lottie or timed clips imply a length; it is required for Three.js and infinite animations.

**Clips.**
- `data-start` is what makes an element timed. Keep writing `class="clip"` (the scaffold's `.clip { position:absolute; inset:0 }` gives scenes their box, and lint warns without it), but not on `<video>`/`<audio>`.
- `data-duration` is required on divs and sub-composition hosts; images default to 3 s; media defaults to its source length. Use `data-duration`, not the legacy `data-end`.
- `data-track-index` is a Studio display lane only (legacy name `data-layer`). The render never reads it; clips on one track may overlap; front/back order is CSS `z-index`.
- The visible window is half-open: `[start, start + duration)`. Land an animation's end state slightly before the end, or its last frame never renders.
- Root-level timed children are auto-positioned absolute at 0,0. An untimed full-bleed background gets no layout and needs its own `position:absolute; inset:0`.
- A clip ending past the root `data-duration` is cut off: extend the root in the same edit.
- `data-hidden` hides an element in preview and render (Studio's eye icon), reversibly.

**Timeline.** Exactly one `gsap.timeline({ paused: true })` per composition, registered at `window.__timelines["<composition-id>"]`. Building inside `document.fonts.ready` is fine, but register **after** the tweens are added: an empty timeline registered early renders blank. Never `tl.play()`; never `master.add()` a sub-composition timeline (the runtime nests them). Inside sub-compositions use `fromTo`, not `from` (re-seeks replay cleanly). A sub-composition timeline can't reach elements in the host.

**Determinism.** No `Date.now()`, `performance.now()`, unseeded `Math.random()`, render-time network fetches, or hover/scroll/pointer state. `repeat: -1` only under a finite root `data-duration`; to end a loop early use `repeat: Math.max(0, Math.floor(duration / cycle) - 1)` (floor, not ceil). Don't tween one property on one element from two timelines.

**First-pass lint failures (write them right the first time).**
- CSS `transform` plus a GSAP tween of the same property (`gsap_css_transform_conflict`): centre with flex or `inset`, set the start inside `fromTo`, or use `xPercent`/`yPercent`.
- Never tween `display`, `visibility` or `autoAlpha` on a `.clip` (`gsap_animates_clip_element`); fade a child. Don't add scene-exit `visibility: hidden` sets: the runtime hides clips.
- No `crossorigin` on `<video>`/`<audio>` (hard error, no suppression).
- No `<video data-start>` inside an ancestor that also has `data-start` (wrong frames, then the clip vanishes). Time the wrapper or the video. Sub-composition hosts are exempt.
- Every `<audio>` (and timed `<video>`) needs an `id`; an id-less audio is never mixed, so the render is silent.
- A named `font-family` needs a local `@font-face` or a bundled family (see the creative-direction guide).

**Layout.** Build the visible end state in static HTML/CSS, then animate from/to it. Flex, grid, padding and `max-width` for content; `position:absolute` for layers and decoratives. No `<br>` in body text (let `max-width` wrap it). Transformed elements must be block-level and sized (`scaleX` on an inline span does nothing). Pulsing or overshooting decoratives need clearance at their peak size. Fit dynamic text with `window.__hyperframes.fitTextFontSize(text, { maxWidth, fontFamily, fontWeight })`.

**Backgrounds.** Put full-bleed grounds on their own full-duration layer (`position:absolute; inset:0`), not on `#root`: a root fill is dropped on the layered path (shader transitions, HDR), and dark content can land on black. For colour washes across scenes, use one untimed shared `#bg` driven by the timeline under transparent timed scenes.

**Media.**
- Footage with sound keeps it on the clip: `<video playsinline data-has-audio="true">`. Silent footage and b-roll: `muted`. A timed video with neither fails lint.
- A separate `<audio>` is only for other sound: music, voiceover, replacement audio, J and L cuts (then the video is `muted`).
- Never `play()`, `pause()` or seek media in code. Animate a non-timed wrapper, never the media element's size.
- `data-volume` is the static gain (`1` = 0 dB, up to `3.98`). Fades and ducking go in a `data-automation` volume lane (`t` in seconds from the clip start); never a lane and a `volume` tween on the same track.
- Media works at any nesting depth, including inside sub-compositions, with scene-local `data-start`.
- HEVC sources render fine; preview auto-proxies them.
- Re-encode sparse-GOP sources or they freeze on seek: `ffmpeg -i in.mp4 -c:v libx264 -crf 18 -g 30 -keyint_min 30 -pix_fmt yuv420p -movflags +faststart -c:a aac public/input.mp4`.

**Editing recipes** (consumed source = timeline duration × rate):

| Edit | How |
|---|---|
| Hard cut, trim, splice, reorder | Duplicate the source into several clips: `data-media-start` picks the source range, `data-duration` its length, `data-start` its place. Sound moves with each clip. Never keyframe source cuts. |
| Relative start | `data-start="intro"` = when `intro` ends; `"intro + 2"`, `"intro - 0.5"` (overlap for crossfades). Spaces around the operator are required: `intro-0.5` is read as an id, silently starts at 0. Typos and cycles also resolve to 0, so snapshot to confirm. |
| Constant speed | `data-playback-rate` 0.1 to 10. Speed ramp: a `rate` lane in `data-automation`, e.g. `{"version":1,"lanes":[{"target":"rate","points":[{"t":0,"v":1},{"t":2,"v":4}]}]}`. |
| Freeze | A still `<img class="clip">` for the hold, then another source range. Mid-source freezes need a pre-extracted still. |
| Crossfade | Overlap two clips by the fade length with opposing opacity envelopes on inner wrappers, plus opposing volume lanes. |
| Add media | Image: `data-duration` optional (3 s). Video/audio: `data-start` is enough. Start at the playhead or requested time, never a silent 0. Raise the root duration to cover it. |
| Swap a file | Change `src`, reset `data-media-start`, keep `data-duration` within the new file's length (probe it), keep the `id`. |
| Copy a group | Same `delta` added to every member's `data-start`, new unique ids, originals untouched. |
| Sound on an event in a sub-composition | Audio `data-start` = host `data-start` + local event time; re-derive after any retime. |

Clamp every end time to the probed media duration (Whisper's last word can overrun and leave a black tail).

**Variables and batch.** Declare on `<html>`: `data-composition-variables='[{"id":"title","type":"string","label":"Title","default":"Hello"}]'` (types string, number, color, boolean, enum with `options`). Bind without script: `data-var-text="title"`, `data-var-src="heroImage"`; every scalar is also a `--title` CSS variable on the root. Override per render with `--variables '{"title":"Q4"}'` (an object, not the array), per sub-composition instance with `data-variable-values`, and gate in CI with `--strict-variables`. Media with audio keeps a real fallback `src`.

**Tailwind** (`init --tailwind`): pinned `@tailwindcss/browser` v4, configured in a `<style type="text/tailwindcss">` with `@theme` and `@utility` (no `@config`/`@plugin`, no `tailwind.config.js`). No breakpoint, hover, focus or group variants, no `transition-*` for render-critical motion, write complete class tokens (no `bg-${color}-500`), and give bare `border` a colour. Compile to CSS for offline or locked-down renders.

## Architecture and project shape

| | Monolithic | Modular |
|---|---|---|
| Use for | One short scene | 3+ hard cuts, reused scenes, anything edited in Studio |
| Layout | `index.html` with inline `<section class="clip">` scenes | Thin `index.html` (slots, audio, near-empty root timeline) + one `compositions/<scene>.html` per scene |

Sub-composition patterns: a content scene (the default); host media driven by the main timeline at global time (when the media must sit in `index.html`); several beats sharing state merged into one file with internal phase divs; audio always at the root, with audio-reactive visuals reading pre-baked data. Prefix element ids inside a sub-composition with its scene id so ids stay unique across the assembled page.

```
videos/<project>/
  hyperframes.json    project config (registry URL, install paths, owning workflow)
  BRIEF.md            confirmed brief (workflow, flow, storyboard, aspect, length...)
  frame.md            design spec: palette, type, layout feel (from a preset, not invented)
  STORYBOARD.md       one "## Frame N" block per scene: status outline/built/animated, src, beat
  storyboard.html     optional static sketch sheet for review
  SCRIPT.md           locked narration (when narrated)
  audio_meta.json     voice files + word timings + BGM
  compositions/frames/NN-<id>.html   one scene per file
  index.html          assembled timeline
  snapshots/  renders/video.mp4
```

Long pieces (many cards over 30 s) split into chapter sub-compositions to keep each timeline small.

## Registry first

Blocks are standalone sub-compositions (own size, duration and timeline) installed to `compositions/<name>.html`; components are effect snippets with no size, installed to `compositions/components/<name>.html` (paths configurable in `hyperframes.json`).

1. Search by what the beat should do, in plain English: `catalog --query "reveal a headline one line at a time" --json`. Browse with `catalog --type block --tag social`. The README tables upstream are a sample; only an empty search means the registry lacks it.
2. `add <name>` (a tag installs every block with that tag). `add` only handles blocks and components; examples come from `init --example <name>`.
3. Wire a block as a host div with `data-composition-id` (equal to the block's internal id), `data-composition-src`, `data-start`, `data-duration` (at most the block's own), `data-width`/`data-height`. Position it with CSS on the host div.
4. Wire a component by pasting its HTML into your root, its CSS into your styles, its JS before your timeline code, and any timeline calls it documents. Read its comment header first.
5. Run `lint`. Use at most 2 shader-transition blocks per video; their internal shader name can differ from the block name.

When authoring a block for upstream, placeholder content carries no hue: four alpha steps of the composition's ink (72%, 45%, 18%, 8%) plus a 14% hairline; text never below the 72% step.

## Studio conventions (when a person edits the project)

- **Talk before you build.** A named change gets made. A felt note ("feels jolty") gets a cause found, the measurable thing changed and the change explained. A question gets an answer and no edit. "Don't change anything" means no file changes, even fixes. An idea gets a proposal added to the plan. Record plans in `STORYBOARD.md`, never overwriting locked frames.
- **Every scene is a sub-composition.** Nested markup left in the root becomes one opaque row that can't be trimmed.
- **One caption track**: a single host with `data-track-kind="captions"` carrying every caption group.
- **One element kind per track**: `data-track-kind="graphics"` on scene hosts, `captions` on the caption host; video and audio kinds come from the tag. Each kind gets its own `data-track-index`.
- **Safe zones** (wide and vertical): everything visible inside action-safe (90%, 5% inset per edge); captions and key content inside title-safe (80%, 10% inset). Two-up layouts keep each half inside title-safe. Guides live in the preview pane, never in the HTML.
- Check: `lint` clean, then Studio shows a base row, one row per scene host, one caption row and the audio rows.
- Optional trial `history` commands: `history begin --who <name> --label "<task>"` and `history --since mine` at the start of a turn, `history undo --who <name>` when a check fails or the person says it got worse, `history end` at the end.

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

Audio renders in the background while frames build. Up to about 6 short scenes build faster inline than with sub-agents (measured roughly 9 min inline vs 21 min dispatched). Beyond that, give each worker 2 to 3 scenes and launch all workers in one wave; workers never run the CLI (the assembled project doesn't exist yet). When an element crosses a frame boundary, give both workers the same numeric hand-off (position, scale, opacity, direction and speed at the cut).

## Review gates

1. **Plan in chat:** message sentence plus a frame table (frame, beat type, duration, on screen, why). Ask: approve? Sketches first or build straight away?
2. **Sketch sheet (optional):** static, fully styled layouts of each frame's key moment in `storyboard.html`; revise only the frames named. A confirmed sheet can be the deliverable.
3. **Build** on the confirmed layouts: dress them, don't redraw them.
4. **Final look:** after `check` passes, open the preview and ask "render now, or what changes?" Render only on a yes. In autonomous runs this is the one question you still ask ("preview first, or render?").

Autonomous is not silent: replace questions with visible decisions and short reasons, and deliver the contact sheet plus actual duration.

## Design and motion

Resolve the design source `frame.md` → `design.md` → `DESIGN.md` before writing HTML; with none, follow [hyperframes-creative-direction.md](hyperframes-creative-direction.md). Use named blueprints and rules rather than improvised motion; eases, staggers, keyframes and kinetic type come from `motion-animation`. House rules: entrances ease-out, exits ease-in, nothing the eye follows on linear; never reveal two independent elements at once; hold the final frame 1 s or more before the cut.

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| Tiny unstyled text top-left, canvas-sized icons | Sub-composition `<style>` in `<head>` | Move styles and scripts inside `<template>` |
| "Sub-composition timelines not registered after 45000ms", static frames | Host id ≠ inner `data-composition-id` | Same id on host, inner root and timeline key |
| Animation renders blank | Timeline registered before an async build finished | Register at the end of the callback |
| Silent render | `<audio>` without `id` | Add ids |
| Clip shows wrong frames, then vanishes | `<video data-start>` inside a timed wrapper | Time one of them only |
| Last pose never shows | End state lands exactly on `start + duration` | End slightly earlier |
| Frozen frame under overlays | Sparse-GOP source | Re-encode with `-g fps -keyint_min fps` |
| Black tail | Duration past media end | Clamp to probed duration |
| Text in fallback font | Font not bundled, not embedded, or CSS var in `font-family` | Bundled family or local `@font-face`; concrete names; assert `document.fonts.check` |
| Content invisible | Background on `#root` or an untimed layer with no size | Background on its own `inset:0` layer |
| `check` reports 0 samples | Lint error skipped the browser | Fix lint first |
| Small caption overflow (1 to 4 px) on caption words | Snug caption line-height | Known false positive; act only when a frame element is named |
| Render times out on a Mac | Software GPU | `PRODUCER_BROWSER_GPU_MODE=hardware` |
| Chrome dies at startup inside an agent sandbox (macOS) | Sandbox blocks Chromium | Deliver the checked composition and say rendering is blocked; render outside the sandbox, with `--docker`, or let the user run it. Don't build a substitute rasterizer. |
