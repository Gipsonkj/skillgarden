# Making it look shot, not generated

Learned the expensive way on a restaurant demo build (2026-08-10): five still rounds and a
1,500-credit video that the client rejected on sight as "ultra unrealistic". The fix was
never the video model. **It was the still.**

## The one-line diagnosis

Image-to-video is faithful. Feed it an AI-looking still and you get an AI-looking clip at
higher fidelity. If the clip reads as fake, **stop re-rendering video and go fix the still.**

## What makes a still read as AI

Every one of these was in the rejected still:

| Tell | Why it reads fake |
|---|---|
| Symmetrical composition, subject dead centre | Photographers stand where they can, not on the axis |
| Even light everywhere | Real rooms have one dominant source and real falloff |
| Every face resolved and pleasant | Background people are blurred, turned away, mid-blink |
| Everyone aware of camera | Candid means nobody is performing |
| Uniformly sharp front to back | A fast lens throws foreground and background out |
| Every surface equally detailed | Attention falls off; so does resolution |
| Props crammed in to signal the theme | "Turkish restaurant" ≠ every ornament at once |

## The formula that worked

Lead with identity lock (if a real person), then **direct it like a photographer, not a
prompt engineer**. Be specific about the apparatus — the model knows what these look like:

```
[identity lock: keep this person EXACTLY — same face, same age, no ageing, same <specific garments>]

A candid reportage photograph, <place>, <year>. <What they are doing, mid-action, not looking
at camera, not posed.>

Photographic direction, follow strictly:
- Shot on <film stock>, <format>, <focal length> at <wide aperture>. Visible grain, slight
  halation, imperfect white balance.
- ONE dominant light source: <direction and quality>. Everything away from it falls into
  genuine shadow. Do not light the room evenly.
- Shallow depth of field. <Subject> is sharp; foreground and background clearly out of focus.
- Off-centre, imperfect framing, as if the photographer stood <somewhere real>. <A foreground
  object> intrudes into the <corner>.
- Background people turned away, mid-conversation, faces blurred and unresolved. Nobody faces
  the camera. Nobody poses.
- Slight motion blur on <the moving thing>.
- Restrained props: <two or three>. Do not fill the frame with ornaments.

Documentary photojournalism. Not a render, not CGI, not symmetrical, not a promotional photo.
```

The negative clauses at the end matter as much as the positives. "Not symmetrical" and
"nobody poses" measurably changed the output.

### Era work
"Old" is ambiguous and will be read as *the person is old*. Say what you mean:
- to age the **place**: name the year and the period dress of the people in it
- to keep the **person** as-is: "no ageing at all" plus the garment list, every time
- "old but well-kept" needs saying explicitly, or you get grime, stains and a village kitchen

## Identity lock for a real person

Use **image-to-image with the photo as a reference**, never text description — a text
description invents a different face. Nano Banana 2 image-to-image, 16:9, 2K, 3 images per
batch holds a face across a total scene change.

A text-only still script **cannot** do this. Reference-image editing on the Gemini API needs
the photo as an `inline_data` part alongside the text part in the same request.

## Video: which endpoint

**Prefer the user's own RunPod Wan endpoint.** The client's verdict, unprompted: RunPod Wan
gives better results, Artlist "never properly". Artlist Wan 2.6 at 1080p cost 1,500 credits
and was rejected as looking AI-made; RunPod at 720p from a good still was accepted.

### RunPod executionTimeout — the real fix
81 frames at 1280×720 **fails at ~630 s with `executionTimeout exceeded`**, reproducibly.
Two ways out, in order of preference:
1. **Drop `length` to ~57** and keep 1280×720. Finishes inside the limit, full resolution.
2. Drop to 1024×576 at 81 frames. Completes (~360 s) but is visibly soft, and dies completely
   if you then push in on it.

If your Wan runner hardcodes `length: 81`, expose the parameter rather than
accepting the resolution drop.

## Camera moves: it depends entirely on the model

"Video models ignore camera-motion prompts" is true of **Wan 2.2 on RunPod** and false of the
current Seedance / Sora / Kling generation. Confirmed by the user 2026-08-10 with a Seedance
1.5 Pro job whose entire prompt was *"Change focus to the character while the camera zooms in
to an extreme close up of the character's face"* — and it did exactly that.

So:
- **Wan 2.2 (RunPod, free)** — no camera moves. One subtle subject motion + "slow, no cuts".
  Ask for a push-in and you get warping. Do the move in post with `zoompan`.
- **Seedance / Sora / Kling (paid)** — direct them like a DP. They execute pushes, tilts, rack
  focus and lens changes. A *real* move beats a post crop: true parallax, real focus falloff,
  and no resolution lost to cropping — which also removes the reason to pay for 4K.

### Prompt shape that gets photoreal results from these models
From two of the user's own working prompts (Seedance 2.0, Sora 2 Pro):
1. **Header line**: `Duration: Ns; aspect_ratio: X; style: <grade, film stock, grain, palette>`
2. **Timecoded beats**: `0.0–1.5s — HOLD: …` / `1.5–5.0s — SLOW PUSH IN: …` — name what the
   camera does in each.
3. **Optics per beat**: focal length, aperture, fps, shutter, rack focus, motion blur.
4. **Lighting as direction**: source, direction, quality, where the shadow falls.
5. **Physics**: cloth weight, wind, smoke turbulence, hair — say what moves and what does not.
6. **Notes line** at the end: `prioritise photoreal match to reference, keep <X>, avoid <Y>`.

This is the opposite of the Wan 2.2 rule and both are correct — match the prompt to the model.

### Post zoom, when you must
`zoompan` needs a 1080p source to survive a 2.4× push landing at 720p. Grade the clip toward
the real footage before the cut (`colorbalance=bs=…`, `eq=saturation=…:contrast=…`) or the
colour jump reads as a mistake. `colorbalance` has **no `ms` option** — only `rs/gs/bs`,
`rm/gm/bm`, `rh/gh/bh`.

**Never mix the concat demuxer with `xfade`.** `concat -c copy` leaves timestamps that make
xfade silently drop every input after the first — you get a film the length of clip one and no
error. Build the whole join as one `filter_complex`, and express a hard cut as a 1-frame
xfade (`duration=0.04`) so it lives in the same graph.

## Ask before you burn rounds

Four of five still rounds were spent discovering the brief: modern-glossy → aged the man when
they meant the era → village kitchen instead of a city restaurant → grimy when they wanted
clean. For a person-in-a-place still, settle these in one question first:

- the person: as they are, or aged?
- the place: which decade, and which city?
- condition: worn-in, or clean and well-kept?
- the people in the background: present-day or period dress?
