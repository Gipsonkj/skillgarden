# Thumbnails (YouTube, Shorts, video covers)

> Distilled from: higgsfield-youtube-thumbnail (higgsfield-ai/skills, MIT), youtube-thumbnail (charlie947/social-media-skills, MIT), design/social-photos (nextlevelbuilder/ui-ux-pro-max-skill, MIT).

A thumbnail is a poster that competes at ~120–320 px wide against a dozen others. It must read in under one second.

## 1. Specs

| Use | Size | Ratio | Notes |
|---|---|---|---|
| YouTube thumbnail | 1280×720 (min 640 wide) | 16:9 | < 2 MB, JPG/PNG. Bottom-right corner is covered by the duration badge. |
| Shorts / Reels / TikTok cover | 1080×1920 | 9:16 | Faces and text in the upper two-thirds; bottom ~20% is UI |
| Instagram video cover (grid) | 1080×1350 | 4:5 | Grid crops to ~3:4 centre |

## 2. Concept first: the information gap

The image raises a question the title answers. Never repeat the title in the image; complete or tease it.

Brainstorm **at least 5 concepts** across these frameworks, then keep the strongest gap with one focal subject:

| Framework | Realise it as |
|---|---|
| Posed portrait (default) | Face large, strong emotion, little background |
| Before / after | Two states of one subject, maximum contrast (split only when it is the concept) |
| Three-step progression | 3 panels: start → middle → end |
| Action shot | One intriguing mid-moment, uncrowded |
| Highlight a day | Any shot + big "DAY 87" badge (pick a day late in the arc) |
| Graphic | A simple familiar chart/diagram, non-photoreal |
| Landscape | Place is the hero, one small subject on a third |
| Map / aerial | Route or point highlighted |
| Product | Product as the answer to the title's question |
| Text callout | Arrow + one word, or the answer to the title |
| Repetition | Huge quantity of one object + a person for scale |
| Size difference | Giant vs tiny, both central to the story |
| Social UI / news chyron | Generic chat bubble, review card or lower-third (no real platform branding) |
| Amplified reality | One real element exaggerated, still plausible |
| Real frame | Best frame from the actual video when it is strong enough |

**Truthfulness rule:** exaggerate, never misrepresent. No invented results, people, screenshots, statistics or claims. Misleading thumbnails cost trust and retention.

## 3. Composition rules

- **One focal subject**; face fills **30–60%** of the frame, chest-up or closer, eyes sharp.
- **Emotion** on any face: shock, awe, curiosity, determination, smugness, laughter. Choose one per variant.
- **Two dominant colours**: brand colour + one high-contrast accent (yellow, red, cyan, acid lime `#D4FF3F`).
- **Subject/background separation**: rim light, colour contrast, blur or vignette.
- **Text: 2–4 words** (5 maximum), a hook not a sentence ("I FIRED MY TEAM", "DON'T DO THIS"). Never over the face. Cap height **12–18% of frame height**.
- Nothing important in the bottom-right corner (timestamp).
- Test at 120 px and 320 px wide; squint test for contrast.
- Keep a consistent style across a channel (same font, accent colour, face placement) for recognition.

## 4. Image prompt (photo/AI route)

Order:
1. Frame: "Bold, punchy YouTube thumbnail, 16:9, single unified frame, poster-grade, photoreal" (or a clean diagram brief for graphic concepts).
2. Scene: the exact truthful content.
3. Text: default "No text, no readable UI labels, no watermark."
4. Subject: large, foreground, 40–60% of frame, sharp face.
5. Key elements: only props that explain the gap.
6. Logo (if any): preserve exact shape and colours, away from faces.
7. Composition: hero on a power third, clear scale hierarchy, depth.
8. Background: vivid high-contrast colour field or environment, soft vignette.
9. Lighting: strong key light, soft fill, bright rim/hair light (only the rim may be coloured).
10. Grade: vivid, glossy, deep blacks, crisp highlights (restrain for calm/premium briefs).

Identity: when a real person's photo is supplied, pass it as a reference and ask for an exact identity match ("same bone structure, eyes, nose, jawline, skin tone, hairline; do not beautify"). Never put a person in a thumbnail without their photo and consent; if none is supplied, ask whether to use a generic character. A style-reference thumbnail is for analysis only: copy its energy, framing and palette, never its people or exact layout.

Variants: one prompt per concept/emotion (not a batch count), same references and settings, change only the concept or expression line. Cap a session at ~16 generations.

Surgical edits: change one thing per edit (expression only, background only, rim colour only) and state that everything else stays pixel-identical.

## 5. Text overlay (default: deterministic, not generated)

Generate the image clean, then add the headline as a separate layer so it is always legible and editable. Template with five proven presets and a canvas bake-to-PNG recipe: `templates/higgsfield-youtube-thumbnail/text-overlay-bake.md`.

The "punchy creator" stack:
| Trait | Value |
|---|---|
| Font | Anton (alternates: Bebas Neue, Oswald, Archivo Black; softer: Montserrat 900, Poppins 800) |
| Case / tracking | ALL CAPS, −0.01 to −0.02 em, line-height 0.9 |
| Stroke | 8–14% of cap size, drawn **under** the fill (`paint-order: stroke fill`; in canvas `strokeText` before `fillText`) |
| Shadow | hard offset shadow + soft blur |
| Fill | white, yellow→orange→red gradient, or acid lime |

Serif and script fonts clog under thick strokes: use 3–6% stroke or a soft shadow instead, and use scripts only for an accent line. Always wait for the web font to load before drawing, or you bake the fallback font.

Bake text into the generation only when the user explicitly asks; then check every character.

## 6. Prompt-only delivery (no image tool)

When there is no image tool, deliver:
```
THUMBNAIL BRIEF: <title>
Concept / framework: ...
Composition: face position, % of frame, gaze direction
Text: "<2–4 words>"  placement: ...
Palette: primary #..., accent #..., background #...
Supporting element: ...
Emotion: ...
```
plus the full image prompt in a code block, and say the image is not generated yet.

## 7. Checks

- [ ] Reads in < 1 s at ~120 px wide; face and hero element clear
- [ ] 2–4 words, spelled exactly, not over the face, not bottom-right
- [ ] Truthful to the video
- [ ] Identity matches supplied photo; no unconsented real people
- [ ] No stray text, watermarks or fake platform logos
- [ ] 1280×720 (or 1080×1920 / 1080×1350), < 2 MB
