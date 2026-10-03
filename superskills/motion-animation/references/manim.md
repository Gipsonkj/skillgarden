> Distilled from: manim-video (nousresearch/hermes-agent, MIT), manimce-best-practices (adithya-s-k/manim_skill, MIT)

# Manim (Community Edition)

Programmatic explainer animation in Python: math, algorithms, equations, data stories, architecture build-ups, 3Blue1Brown-style video. One Python file, rendered offline to video. For narration-heavy multi-tool video production (stock footage, AI clips, editing), hand off to the ai-video super skill; for shot planning, storyboarding.

**Version check first.** `from manim import *` and the `manim` CLI = Community Edition (this file). `from manimlib import *` and `manimgl` = the 3b1b fork, with different APIs (`Tex(R"...")`, `InteractiveScene`). Don't mix tutorials across them.

Setup (the user installs; don't install for them): Python 3.10+, `pip install manim`, LaTeX (MacTeX / texlive) for `MathTex`, ffmpeg. `manim checkhealth` verifies.

## Should this be animated at all?

Animate when something unfolds over time ("first X, then Y, then Z"), parts assemble, states are compared, or a spatial relationship changes. Show a static, well-labelled figure when the viewer would explain it by pointing at parts of one picture.

**Geometry before algebra**: show the shape, then the equation, so the formula feels earned.

## Pipeline

```
PLAN (plan.md) -> CODE (script.py) -> RENDER (-ql drafts) -> STITCH (ffmpeg) -> AUDIO (optional) -> REVIEW
```

1. **Plan.** Write the narration first, then mark visual beats: each beat (something changes on screen) is one `self.play()`. Name the misconception the video corrects and the "aha" moment. Pick one palette and type scale for the whole video.
2. **Code.** One `Scene` class per scene, each independently renderable; shared colour/font constants at the top.
3. **Render drafts** at `-ql`, stills with `-s` for layout checks; final at `-qh`.
4. **Stitch** scene clips with the ffmpeg concat demuxer (all clips must match resolution, fps, codec).
5. **Review** stills against the plan before rendering high quality.

```python
from manim import *

BG, PRIMARY, SECONDARY, ACCENT = "#1C1C1C", "#58C4DD", "#83C167", "#FFFF00"

class S1_Intro(Scene):
    def construct(self):
        self.camera.background_color = BG
        title = Text("Why does this work?", font_size=48, color=PRIMARY, weight=BOLD)
        self.play(Write(title), run_time=1.5, subcaption="Why does this work?")
        self.wait(1.0)
        self.play(FadeOut(title), run_time=0.5)
```

```bash
manim -ql script.py S1_Intro S2_Core        # draft 854x480 @15fps
manim -ql -s script.py S2_Core              # last frame as PNG: instant layout check
manim -qh script.py S1_Intro S2_Core        # 1080p60 final (-qk for 4K)
manim -ql --format=gif script.py S1_Intro   # GIF output
manim -ql --disable_caching script.py S2_Core
printf "file 'media/videos/script/1080p60/S1_Intro.mp4'\nfile 'media/videos/script/1080p60/S2_Core.mp4'\n" > concat.txt
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy final.mp4
```

## Pacing (the common failure is too fast)

| Moment | `run_time` | `self.wait()` after |
|---|---|---|
| Title / intro | 1.5 s | 1.0 s |
| New equation | 2.0 s | 2.0 s |
| Transform / morph | 1.5 s | 1.5 s |
| Supporting label | 0.8 s | 0.5 s |
| Key insight | 2.5 s | 3.0 s |
| Clean-up fade | 0.5 s | 0.3 s |

Vary tempo: dense passages faster, insights slower. Every reveal gets a wait.

## Visual language

- **Opacity layering**: primary 1.0, context ~0.4, structure (axes, grids) ~0.15. Never everything at full brightness.
- At most 5–6 elements in focus; split scenes or dim the rest.
- Palette per video, not per scene; vary the dominant colour, layout and entry animation between scenes so it doesn't feel templated.
- Type scale: title 48, heading 36, body 30, label 24, caption 20; nothing under 18.
- `to_edge(..., buff=0.5)` or more so text doesn't clip.
- Fonts: if proportional fonts render with odd spacing, switch to a clean font you have installed (monospace is a safe fallback). `Text` has no `letter_spacing` argument; use `MarkupText('<span letter_spacing="6000">…</span>')` (Pango units, 1/1024 pt).

## Animation vocabulary

| Need | Manim |
|---|---|
| First appearance | `Create` (strokes), `Write` (text/math), `FadeIn(m, shift=UP*0.3)`, `GrowFromCenter`, `DrawBorderThenFill` |
| Change into something else | `Transform`, `ReplacementTransform`, `FadeTransform`, `TransformMatchingTex` / `TransformMatchingShapes` |
| Draw attention | `Indicate`, `Circumscribe`, `Flash`, `ShowPassingFlash`, `Wiggle` |
| Continuous relationship | `ValueTracker` + `add_updater` / `always_redraw` |
| Leave | `FadeOut`, `Uncreate`, `ShrinkToCenter` |
| Static context | `self.add()` (no animation) |
| Property change | `m.animate.shift(RIGHT).set_color(RED)` (chain in one `.animate`) |
| Sequence / stagger | `Succession`, `AnimationGroup(..., lag_ratio=0.2)`, `LaggedStart(*anims, lag_ratio=0.3)` |

Rate functions: `smooth` (default ease-in-out), `linear` (rotations, tracker sweeps, anything continuous), `rush_into` / `rush_from` (ease-in / ease-out), `there_and_back`, `there_and_back_with_pause`, `double_smooth`. Use `linear` for steady motion and constant rotation; the default `smooth` makes repeated moves feel stop-start.

## Correctness rules

- **Raw strings for LaTeX**: `MathTex(r"\frac{1}{2}")`; `"\f"` is a form feed. Colour parts with `substrings_to_isolate` / `set_color_by_tex`, or split the expression into separate string args.
- After `Transform(a, b)`, `a` is what's on screen (now shaped like `b`); use `ReplacementTransform` when you want to keep referring to `b`. Don't `Write` new text on top of old text; transform or fade the old one out.
- A mobject must be added (or created) before `.animate` on it does anything visible.
- Never pass the same mobject twice in one `play()`; chain the changes.
- Updaters fight animations on the same property: `m.suspend_updating()` around the `play`, then `resume_updating()`.
- `always_redraw` rebuilds every frame (expensive); use `add_updater` when only position/value changes. Updated mobjects still need `self.add()`.
- Grouping: `VGroup` holds vector mobjects; if mixing types raises `TypeError: Only values of type VMobject…`, use `Group`. Clear a scene with `self.play(FadeOut(Group(*self.mobjects)))`. If `Group.save_state()` raises `NotImplementedError`, save/restore individual mobjects or use `FadeIn(..., shift=..., scale=...)`.
- Set `self.camera.background_color` in every scene (or once in config).

## Graphs, data, algorithms

- `Axes(x_range=[0, 10, 1], y_range=[0, 5, 1])`, `axes.plot(lambda x: ...)`, `axes.c2p(x, y)` to place things, `axes.get_area(...)`, `axes.get_vertical_line(...)`, `get_secant_slope_group` for tangents; `NumberPlane` for transformations.
- Sweep a parameter: `t = ValueTracker(0)`, `dot = always_redraw(lambda: Dot(axes.c2p(t.get_value(), f(t.get_value()))))`, then `self.play(t.animate.set_value(5), run_time=4, rate_func=linear)`.
- Counters: `DecimalNumber` with an updater. Bars grow from the baseline; serious data doesn't bounce.
- Algorithms: build the data structure once, then animate each step (highlight, swap, move) as one beat with a short caption.

## Camera and 3D

- `MovingCameraScene`: `self.play(self.camera.frame.animate.scale(0.5).move_to(target))` to zoom/pan; save and restore the frame to return.
- `ThreeDScene`: `self.set_camera_orientation(phi=70*DEGREES, theta=-45*DEGREES)`, `self.move_camera(...)`, `self.begin_ambient_camera_rotation(rate=0.2)` / `stop_ambient_camera_rotation()`; `Surface(lambda u, v: ..., resolution=(24, 24))` (lower resolution renders faster); keep labels flat to the camera with `add_fixed_in_frame_mobjects`.

## Narration

`manim-voiceover` syncs animation lengths to TTS: subclass `VoiceoverScene`, `with self.voiceover(text="…") as tracker: self.play(..., run_time=tracker.duration)`; bookmarks (`<bookmark mark="x"/>`, `self.wait_until_bookmark("x")`) cue beats mid-sentence. Otherwise render silent and mux audio with ffmpeg. Add `subcaption=` to plays so captions export alongside.

## Debugging

1. Render a still (`-s`) for layout. 2. Render only the broken scene. 3. Temporarily replace `play` with `add` to see the end state. 4. `print(m.get_center())`. 5. `--disable_caching` or delete `media/` for stale output. Blurry = you're looking at `-ql`.

## Done means

Narrative and beats planned before code; one palette and type scale across scenes; every reveal followed by a wait; no clipped or overlapping text (checked on stills); equations render (raw strings); final rendered at `-qh` and stitched clips share resolution/fps.
