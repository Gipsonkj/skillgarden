# Comics, webtoons and panel layouts

> Distilled from: baoyu-comic (JimLiu/baoyu-skills, MIT), short-drama-storyboard (zenstory-ai/drama-skills, MIT), cinematic-director (wuwangzhang1216/DirectorSKILL, MIT), video (smixs/visual-skills, CC-BY-4.0, by Serge Shima).

For comic pages, four-panel strips, vertical webtoons and educational/knowledge comics, especially when pages are rendered with an image model. Film boards and comics share shot language ([shot-language.md](shot-language.md)); comics add page layout, reading order and lettering.

## 1. Workflow

1. **Analyse the content.** Audience, core message per page, time span, which ideas need a visual metaphor.
2. **Choose art style × tone × layout** (table in §2). Record the choice at the top of the storyboard.
3. **Character definitions and sheet first.** Write each character (role, age, face shape, hair, eyes, build, distinguishing marks, default costume with colours, accessories, an expression range), then generate one reference sheet: front view, three-quarter view and an expression row (neutral, happy, focused, worried) on a white background with names under each figure. Every page depends on it.
4. **Page-by-page storyboard** (template §4).
5. **One prompt file per page,** saved before any generation (`prompts/01-page-slug.md`). The file is the reproducibility record and lets you switch image tools without rewriting.
6. **Generate** the character sheet first, then pages, in small batches. Retry a failed page once without touching pages that succeeded. Back up an existing page image before regenerating it.
7. **Assemble** (PDF, scroll strip). Regenerate single pages by number.

Ask the user only what changes the plan (style, page count, language, aspect). Offer partial runs: storyboard only; storyboard + prompts; images from existing prompts; regenerate pages N.

### Who draws the pages: pick a tool

| Situation | Use | Why |
|---|---|---|
| The artist already draws in an app | That app; deliver the page storyboard and lettering text | Their brushes and habits are the fast path |
| A person draws comic pages or a webtoon | Clip Studio Paint (below) | Native frame borders, page management and webtoon export |
| Pages rendered by an image model | Steps 5-6 above; models in **image-creation** (`references/gemini-nano-banana.md`); [baoyu-comic](https://github.com/JimLiu/baoyu-skills/tree/main/skills/baoyu-comic) for batch runs | No drawing app needed |
| Unsure whether they have Clip Studio Paint PRO or EX | Ask | Multi-page files and batch export need EX |

**Clip Studio Paint.** Desktop drawing app, so Claude delivers the page storyboard (§4), a panel layout per page, the lettering text and any reference sheets; the artist draws.

- Panels: Layer → New Layer → Frame Border folder builds a frame from the page's inner border. Split it with the Divide frame border tool (vertical and horizontal gutter in Tool Settings) or Layer → Ruler/Frame → Divide frame border equally. Ready-made layouts sit in Material palette → Manga material. Frames are not in the DEBUT edition.
- Webtoon: View → Show on-screen area (webtoon) shows what a phone displays; set its ratio in View → On-screen area settings (webtoon). Write the scroll beats so each screenful lands one beat.
- Webtoon export: File → Export webtoon; Divide vertically cuts the strip every N pixels into separate images. Take N from the platform's upload spec, and ask the user for it rather than guessing.
- EX only: multi-page management (a `.cmc` management file plus one file per page, in a management folder), webtoon export by page range, as separate pages or as one continuous strip, and batch export: File → Export multiple pages → Batch export to BMP, JPEG, PNG, WebP, TIFF, Targa, PSD, PSB or PDF.
- Name pages and panels by the storyboard's IDs (`p03-panel2`) so feedback maps back to the script.

## 2. Style, tone and layout menus

| Art style | Look | Good for |
|---|---|---|
| Ligne claire | Clean uniform outlines, flat colour, realistic proportions | Biography, history, balanced explainers |
| Manga | Expressive eyes, speed lines, screentone, 5-7 heads tall | Tutorials, romance, action, tech explainers |
| Realistic | Painterly or photo-like rendering | Period pieces, food, lifestyle |
| Ink brush | Brush strokes, wash, negative space | Martial arts, classical settings |
| Chalk | Chalkboard texture | Classroom, concept teaching |
| Minimalist | Simple shapes, stick figures, spot colour | Allegories, four-panel strips, business insight |

Tones: neutral, warm, dramatic, romantic, energetic, vintage, action. Combine one art style with one tone; keep both fixed across the book.

| Layout | Panels/page | Use |
|---|---|---|
| Standard | 4-6 in a 2-3 column grid, Z reading order | Narrative and dialogue |
| Cinematic | 2-4 wide panels (3:1-4:1) | Establishing, landscapes, drama |
| Dense | 6-9 compact (3×3) | Technical explanations, timelines |
| Splash | One panel at 50-70% plus 2-3 small | Reveals, breakthroughs, chapter openers |
| Mixed | 3-7, deliberately irregular | Action and emotional arcs |
| Webtoon | 3-5 full-width panels stacked vertically, 20-40 px gaps | Mobile reading, step-by-step |
| Four-panel | Exactly 4 equal panels, 2×2, Z order | Single-concept strips (best on a 4:3 page) |

Content signals for defaults: tutorial or programming → manga + neutral + webtoon/dense with visual metaphors and no talking heads; pre-1950 history → realistic + vintage + cinematic; personal/mentor story → ligne claire + warm + standard; conflict or breakthrough → dramatic tone + splash; martial arts → ink brush + action + splash; romance/school → manga + romantic; fable or business allegory → minimalist + four-panel.

## 3. Panel craft

- **Panel size = weight.** Full page for the turning point, half page for important scenes, a third for standard beats, a quarter or smaller for quick progression. Vary sizes for rhythm; a page of identical panels reads flat unless the format is deliberately strict.
- **Per page:** 3-5 narrative panels, 1-2 concept diagrams, at most one narrator panel. End each page on a hook or a turn (the reader flips the page there).
- **Four-panel strips** follow setup / development / twist / conclusion: panel 3 holds the twist or insight; panel 4 the punchline or takeaway.
- **Shot variety:** each panel picks a size and angle with a reason (eye level, bird's eye, low angle, close-up, wide). Keep the 180° rule across panels in one scene; characters keep their screen side in a conversation.
- **Clear focal point** per panel, foreground/mid/background layers, intentional negative space. Action flows in reading direction (left to right for Western books; mind right-to-left manga if that is the target).
- **Abstract ideas as concrete images:** gradient descent as a ball rolling into a valley; data flow as particles in pipes; iteration as a spiral staircase; a breakthrough as a barrier shattering; uncertainty as forking paths in fog. Use a consistent symbol system through the book.
- **Webtoon pacing:** one beat per panel, whitespace between beats as time; alternate close-ups with wide explanation panels; elements may float between panels.
- **Vertical comic-drama keyframes** (AI comic dramas): use one shared style phrase for every frame of an episode and do not mix "photoreal" with "comic" or "illustration" words.

## 4. Page storyboard template

```markdown
## Page 3 / 12
Filename: 03-page-the-wrong-answer.png
Layout: standard · Narrative layer: main
Core message: the first attempt fails and shows why

### Panel 1 (1/3 page, top)
Scene: lab, night
Camera: wide, eye level
Characters: Ada at the bench, left third, facing right; Tom in the doorway, right edge
Environment: scattered notes, one desk lamp
Lighting: single warm lamp camera-left, room falls to dark
Text: caption bar "Three weeks later"; Ada (speech): "It should have converged."

### Panel 2 (1/6 page) ...

Page hook: Tom drops the printout on the bench, face down.
```

Then the full-page image prompt: character block (only the characters on this page, copied from the definitions), page content panel by panel, and a short consistency reminder.

## 5. Lettering and text

| Element | Shape | Use |
|---|---|---|
| Speech | Oval bubble, tail pointing at the speaker | Dialogue |
| Thought | Cloud with a bubble trail | Inner monologue |
| Narrator | Rectangle, slightly tinted | Commentary, explanation |
| Caption bar | Edge-mounted rectangle | Time, place, "Meanwhile" |
| Term label | Bold or accent colour | First use of a technical term |

- Keep text short; image models misspell long text. Prefer few, short lines per panel.
- Chinese text uses full-width punctuation.
- **Never fix wrong text by painting over a generated page** with code or image overlays. Regenerate with less text, generate textless art and letter it in a layout tool, or let the user choose among imperfect takes.
- Keep any watermark away from bubbles and key action.

## 6. Consistency on pages

| Situation | Strategy |
|---|---|
| Character sheet exists and the tool accepts reference images | Pass the sheet (compressed if large) with every page |
| Tool has no reference input | Paste the relevant character definitions into every page prompt |
| Reference upload fails | Compress to JPEG ~70% and retry; else fall back to inline descriptions |

- Use the same identity wording for a character on every page ([keyframes-and-consistency.md](keyframes-and-consistency.md)); do not let a page prompt paraphrase it.
- Supply user style or palette references either directly (as images) or as extracted traits appended to every page prompt.
- Do not base characters on existing copyrighted characters or real people unless the user owns the rights; describe original designs.

## 7. Done means

- Character sheet approved before any page.
- Every page has a core message, a layout, panel list with camera and text, and a page-end hook.
- Panel sizes vary with story weight; the turning point gets the biggest panel.
- Text is short enough to render, or left for post-lettering.
- One prompt file per page saved before generation.
