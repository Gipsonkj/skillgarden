# Carousels and document posts

> Distilled from: gemini-carousel (charlie947/social-media-skills, MIT), linkedin-content formats canon and accessibility guide (alirezarezvani/claude-skills, MIT), linkedin-content (openclaudia/openclaudia-skills, MIT), linkedin-posts (kostja94/marketing-skills, MIT), linkedin-post / Publora API restrictions (publora/skills, MIT), linkedin-marketing heuristics (sergebulaev/linkedin-skills, MIT).

ToS reminder: the deck is drafted here. The user uploads it by hand, or it is published through the official API after an explicit yes. No browser automation or unofficial posting tools ([tos-and-safe-automation.md](tos-and-safe-automation.md)).

On LinkedIn a "carousel" is usually a **document post**: a PDF uploaded through the Document option that readers swipe through. Multi-image posts show as a grid, and the API cannot create swipeable organic image carousels, so use a PDF.

## When to make one

Make a carousel only when **the sequence is the content**: steps, a before/after comparison, a framework, structured data. Test: if slide 1 plus the caption gives the reader the value, write a text post instead. Carousels score high on engagement rate in third-party data (🟡 roughly 1.7-2.3x reach compared with a single image), which is why people turn text posts into ten thin slides. Don't.

## Specs

| Item | Value |
|---|---|
| Slide size | 1080 x 1350 px (4:5 portrait). 1080 x 1080 is also fine; keep one size per deck |
| Slide count | 6-10. Most readers swipe 2 and leave |
| Text per slide | Headline 8 words or fewer, body 15 words or fewer (about 12 words total works best) |
| File | PDF with **selectable text** (not flattened images). LinkedIn limit is about 100 MB / 300 pages; check current help |
| Contrast | Body text 4.5:1, large text 3:1 (WCAG). Never carry meaning by colour alone |
| Readability | Readable on a phone at feed size without zooming. Minimum about 28 px body text on a 1080 canvas |
| Caption | A full post in its own right: hook within 140 characters, why to swipe, a real question |

## Slide plan

1. **Cover**: the hook, held to the same standard as a text hook. Large type. Visually different from body slides.
2. **Body slides (2 to N-1)**: one idea per slide, each understandable on its own. Put the payoff early, not on slide 9.
3. **Final slide**: a useful conclusion or next step. Add a CTA only for a real, user-approved offer or link. No "follow for more" bait.

Write the brief as a table: slide #, headline, body, visual (icon, diagram, chart, illustration). **Get the user's approval of the brief before producing any images or image prompts.** Keep every required fact. If the content needs more room, add slides rather than cutting facts to hit a word count.

## Image prompts (when slides are AI-generated)

One prompt per slide, with the same brand block repeated word for word in each:

```
LinkedIn carousel slide, 1080x1350 px (4:5).
Brand: primary #___, secondary #___, accent #___; headline font: ___; body font: ___; style: ___.
Slide N of M: <purpose>.
Headline: "<exact text>"   Body: "<exact text>"   Visual: <specific element>.
Layout: <headline position/size>, <body position>, <visual position>, <background>.
Constraints: exact 4:5, no watermark, no extra text, consistent with the other slides.
```

Image models garble text. Where text has to be exact, generate the visual without text and set the type in a design tool (Figma, Canva, Keynote or Slides, exported to PDF). Then check every export at full size and at feed size (about 360 px wide): exact wording, clipping, contrast, logos. Record anything not checked as pending.

If the project has a `brand-kit.md`, use its hex codes and fonts exactly.

## Accessibility

- Upload a real PDF so screen readers get a text layer.
- The caption should name what the deck covers, since LinkedIn shows no per-slide alt text for documents.
- For image posts, write alt text that says what the image shows: "Line chart: onboarding fell from 41 days in March to 4 in July", not "chart".

## Publishing note

Document posts can be uploaded by hand, or through the official API's Documents upload plus the Posts API ([publishing-official-api.md](publishing-official-api.md)). The API doesn't support mixing images with a video or document in one post, or rich text.

## Pitfalls

- Ten slides that carry two slides of content.
- Text baked into AI images that comes out misspelled.
- A cover slide that looks like the body slides.
- Hashtag or emoji walls on slides.
- A final "Repost this ♻️" slide. That's engagement bait.
