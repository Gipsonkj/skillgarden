# Nano Banana prompting — the official structure

Distilled from Google's "Ultimate prompting guide for Nano Banana" (Gemini image
models). Read this BEFORE writing a still prompt. Everything here is the model
vendor's own guidance, not folklore.

## The two formulas

**Text-to-image, no reference:**

```
[Subject] + [Action] + [Location/context] + [Composition] + [Style]
```

> [Subject] A striking fashion model wearing a tailored brown dress, sleek boots.
> [Action] Posing with a confident, statuesque stance, slightly turned.
> [Location] A seamless, deep cherry red studio backdrop.
> [Composition] Medium-full shot, center-framed.
> [Style] Fashion editorial, medium-format analog film, pronounced grain, high
> saturation, cinematic lighting.

**With reference images:**

```
[Reference images] + [Relationship instruction] + [New scenario]
```

The **relationship instruction** is the part people skip and it is what makes
multi-reference work: say explicitly what each reference contributes.

> Using the attached sketch as the STRUCTURE and the attached fabric as the
> TEXTURE, transform this into a high-fidelity 3D armchair render. Place it in a
> sun-drenched minimalist living room.

## The rule that reverses common habit

**Never use negative framing.** The model does not reliably subtract.

| ✗ don't | ✓ do |
|---|---|
| "no cars" | "an empty street" |
| "without people" | "deserted" |
| "not blurry" | "sharp, crisp detail" |

This is the opposite of Wan/Seedance, which DO take a `negativePrompt`. Don't
carry the habit across models.

## Specificity beats adjectives

- Material, not category: "navy blue tweed", not "a suit jacket";
  "ornate elven plate armor etched with silver leaf", not "armor".
- Name the hardware: GoPro (immersive, distorted), Fujifilm (authentic colour
  science), disposable camera (raw nostalgic flash), macro lens (intricate detail).
- Name the lens behaviour: "low-angle, shallow depth of field (f/1.8)".
- Name the light: "three-point softbox", "chiaroscuro, harsh high contrast",
  "golden hour backlighting with long shadows".
- Name the stock: "1980s colour film, slightly grainy", "muted teal grade".

## Start with a strong verb

Open with the operation: *Redraw…*, *Transform…*, *Place…*, *Remove…*,
*Generate…*. It tells the model what job it is doing before it reads the detail.

## Consistency across shots

Up to **14 reference images** in one prompt. For a character who must stay the
same person across a cut, pass the same reference every time AND state the
relationship ("FIRST image is the subject — copy the face exactly").

## Editing an existing image

- **Semantic masking:** describe the region in words; be explicit about what must
  stay identical. "Keep the composition, lighting and every other element exactly
  the same; change only …"
- **Style transfer:** upload the photo, name the target style.

## Text in images

- Put the exact words in **quotes**: `the word "GLOW"`.
- Name the font: "bold white sans-serif", "Century Gothic", "heavy blocky Impact".
- You can specify per-line styling in one prompt.
- Localisation: write the prompt in English, name the target language for the
  rendered text.

Caveat from this project: generated lettering still fails often at small sizes
and in non-Latin scripts. For anything that must be legible, composite REAL type
over the image instead — see the end-card work in `beat-cut-films`.

## Aspect ratio and resolution

Supported: `1:1, 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9`
(Nano Banana 2 adds `1:4, 4:1, 1:8, 8:1`.) Resolutions 1K / 2K / 4K.

Project note: on the Gemini API the ratio goes in `generationConfig.imageConfig.aspectRatio`;
on a wrapper API that takes a `settings` object, pass it in `settings`, not top level (a
top-level ratio is silently ignored). State the ratio in the prompt text as well; it
measurably improves framing compliance.

## Do / don't

**Do:** narrative sentences over keyword lists; iterate conversationally;
quote text; specify material and camera; say what to preserve when editing.

**Don't:** negative framing; bare keyword strings; vague materials; omitting
composition and camera language.

## Pairing

Nano Banana for keyframes → Veo/Wan/Seedance for the motion between them. Use
Gemini itself to draft the prompt when the subject is complex.
