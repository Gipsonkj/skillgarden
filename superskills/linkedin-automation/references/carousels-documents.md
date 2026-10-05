# Carousels and document posts

> Distilled from: gemini-carousel (charlie947/social-media-skills, MIT), linkedin-content formats canon and accessibility guide (alirezarezvani/claude-skills, MIT), linkedin-content (openclaudia/openclaudia-skills, MIT), linkedin-posts (kostja94/marketing-skills, MIT), linkedin-post / Publora API restrictions (publora/skills, MIT), linkedin-marketing heuristics (sergebulaev/linkedin-skills, MIT). Canva MCP details from Canva's developer docs, in our own words.

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

## Make the slides

### Pick a tool

| The user's situation | Use | Why |
|---|---|---|
| Already designs in a tool (Canva, Figma, Keynote, Google Slides) | That one | Their brand files and templates are there. Ask which if you don't know |
| No design tool, wants Claude to build the deck | Canva through its MCP server (below) | Free Canva account works; Claude generates, edits and exports the PDF |
| Brand kit or brand templates must be applied | Canva Pro or above, through the MCP | Brand kits, brand templates and resizing need a paid plan |
| Illustrated slides from an image model | The image prompts below, then set the type in a design tool | Models garble text; see `image-creation` for the visuals |
| No account at all | Keynote, Google Slides or PowerPoint, exported to PDF | Free; Claude writes the slide brief, the user lays it out |

### Canva (Canva MCP)

- **Access:** remote MCP server `https://mcp.canva.com/mcp`. Each user signs in to their own Canva account by OAuth, and sees only their own designs. In claude.ai, add Canva from the connectors list; in Claude Code, `claude mcp add --transport http canva https://mcp.canva.com/mcp`, then `/mcp` to sign in. No API key is involved.
- **Plans:** generating, editing, searching, exporting and commenting work on every plan. `resize-design`, autofill, brand kits (`list-brand-kits`) and brand templates need Pro or above; Free gets a limited resize trial.
- **Rate limits:** `generate-design`, `create-design-from-candidate`, `export-design`, `resize-design` and the editing-transaction start and commit calls are 20 a minute each; anything without its own limit shares a cap of 300 a minute per user.

Flow for a document post, after the user approves the slide brief:

1. `generate-design` with the brief (size 1080 x 1350, slide count, exact headline and body per slide, brand colours). It returns candidates. **Show them and let the user pick**; don't choose for them.
2. `create-design-from-candidate` turns the pick into an editable design.
3. Fix wording with `start-editing-transaction`, `perform-editing-operations`, `commit-editing-transaction` (or `cancel-editing-transaction`). Check every slide's text with `get-design-content` against the brief.
4. Give the user the design's edit link so they can review and adjust it in Canva.
5. `get-export-formats` to confirm PDF is offered, then `export-design` with that `format`. The download links expire, so fetch the file at once and don't store or share the link.

Gotchas: Free exports are standard quality; a design with premium elements can fail export with `license_required`. `resize-design` makes a copy at a preset `design_type` or a custom `width` and `height` and returns `quota_exceeded` when the allowance is spent. Open the exported PDF and check the text is selectable before it goes anywhere.

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
