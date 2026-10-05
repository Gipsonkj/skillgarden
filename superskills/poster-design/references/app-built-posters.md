# Posters built in design apps: Adobe, Affinity, Figma

> Written in our own words from each vendor's official docs (Adobe for Claude and Adobe for Creativity, Photoshop and InDesign UXP, Illustrator help, Figma help and REST API, Affinity integrations). Links in `CREDITS.md`.

Use when the user works in Photoshop, Illustrator, InDesign, Adobe Express, Affinity or Figma, or when a printer or client wants native files from one of them. The poster rules don't change (`foundations.md`, print specs in `print-and-academic-posters.md`); this guide is how Claude gets the brief, exact copy and art into the app and a correct file out of it.

## 1. Pick the app

| Job | App | Why |
|---|---|---|
| Print poster or flyer with real typesetting, PDF/X for the printer, several sizes of one layout | InDesign | Page size, bleed, styles and PDF/X presets in one file |
| Vector poster where type and shapes are the image; logo lockups | Illustrator | Vector art at any size, CMYK document, PDF/X save |
| The photo layer: retouch, expand, upscale, colour-convert | Photoshop | Pixels; hand the result to InDesign/Illustrator for type |
| Fast template poster or social set, non-designer owner | Adobe Express (through the connector) or Canva (`canva.md`) | Templates, resize, social variations |
| Team works in Figma, screen-first poster, brand already in variables | Figma | Shared file; see section 6 for print limits |
| Desktop alternative to the Adobe trio, free for individuals | Affinity | One app for vector, photo and layout; scriptable |

Default for a print job: art from an image model or Photoshop → layout and type in InDesign (or Illustrator for a type-led poster) → PDF/X export → the checks in section 8.

## 2. Two ways Claude drives Adobe

| Route | Where it runs | Use for |
|---|---|---|
| **Adobe for Claude** connector (earlier called Adobe for creativity) | Claude on the web, Claude Desktop, Cowork and Claude Code; works inside the conversation, and the result can be continued in an Adobe app | Image edits, background removal or blur, crop/resize/expand, rendering a PSD, Express designs from templates, social variations |
| **Scripts Claude writes, the user runs** | The desktop app on the user's Mac or PC | Exact sizes, bleed, typesetting, PDF/X export, repeatable batches |

### 2a. Adobe for Claude connector

Setup on claude.ai or Claude Desktop, per Adobe's help page of 24 Sep 2026 (the connector was renamed from "Adobe for creativity" to "Adobe"): Customize → Plugins tab (Discover view) → install the Adobe plugin → on the plugin's Connectors tab choose Connect → sign in with an Adobe account or continue as a guest → type `/Adobe` in a chat. Adobe's older developer docs describe the earlier route (Customize → Connectors → + → Browse connectors → search "Adobe for creativity"), so search for either name. New connectors can't be installed from the mobile apps. Adobe says it is also available in Claude Code but gives no separate setup steps; if the Adobe tools aren't in the session's tool list, use the scripts route.

- **Access.** Guests get about 40 standard tools. Signing in with a free or paid Adobe account adds tools (for example Gen Expand and the video tools), Creative Cloud storage, higher limits and continuity between sessions. "Design from template" and "Social variations" need an Adobe ID. Adobe for Claude works on free and paid Claude plans; Cowork needs a paid plan.
- **Scope (Sep 2026).** Adobe lists 80+ tools across Acrobat, Express, Photoshop, Illustrator, Premiere, Lightroom, InDesign and Adobe Stock, and a layer-based editor for Express designs where images, copy, colours and fonts change independently. Adobe's docs don't list the tool names, so list the session's tools before planning.
- **Poster jobs it suits:** an Express poster or flyer from a template with the user's exact copy; expanding a photo to the poster ratio; removing a background; resizing one design into social sizes; rendering a PSD the user uploads. Results can be downloaded and continued in any Adobe app.
- **Limits.** Claude and Adobe both cap file sizes; if one is hit, compress the source (a TIFF as a high-quality JPEG). With Creative Cloud storage full, files can't be saved.
- **Gotchas.** Proof every word the connector sets, letter by letter, as for model text. Before anything that saves to shared storage, shares, publishes or uses paid generative features, show the exact item and wait for a yes.

### 2b. Scripts the user runs

| App | Script | File | How the user runs it | Needs |
|---|---|---|---|---|
| Photoshop | UXP script (modern JavaScript) | `.psjs` | File → Scripts → Browse, or drop the file on the Photoshop window outside any open document (or on the Dock icon on a Mac) | Photoshop 23.5+ |
| InDesign | UXP script | `.idjs` | Save into the Scripts Panel folder, open Window → Utilities → Scripts, double-click the script | InDesign 18.0 (2023)+ |
| Illustrator | ExtendScript (older JavaScript) | `.jsx` | File → Scripts → Other Script…, or install it in Illustrator's Scripting folder (shows under File → Scripts after a restart) | — |

Where to save `.idjs` files on a Mac: the app's `/Applications/Adobe InDesign <year>/Scripts` folder (may need admin rights), or the Scripts Panel folder inside `~/Library/Preferences/Adobe InDesign/Version <n>/<locale>/Scripts` (for example `Version 18.0/en_US`).

Rules for every script:
- Write it into the project, show it, and say what it will change. Ask the user to save open documents first; scripts act on the live app.
- Put all inputs (sizes, copy, file paths) as constants at the top. Photoshop scripts can't take arguments yet; InDesign scripts get arguments only from InDesign Server or another script's `doScript`.
- Photoshop scripts have no network or process-launch access; files go through `require('uxp').storage.localFileSystem` (pickers such as `getFileForSaving`, or `getTemporaryFolder`).
- A script result set with `script.setResult()` is ignored when run from InDesign's Scripts panel, so check the document and the exported file, not a return value.
- Debug with Adobe's UXP Developer Tools (UDT 1.6+ for Photoshop scripts, 1.7+ for InDesign).

## 3. InDesign: layout, type and PDF/X

Builds an A3 poster with 3 mm bleed, a full-bleed photo frame, the exact copy, and a PDF/X export. Copy, fonts and paths come from the brief; nothing is invented.

```js
// poster-a3.idjs: run from InDesign's Scripts panel
const { app, ExportFormat, FitOptions } = require("indesign");
const ART = "/Users/me/poster/art/market-bg.png";        // the text-free background
const OUT = "/Users/me/poster/out/market-A3.pdf";
const COPY = ["SATURDAY MARKET", "Fresh sourdough from 8am", "Elm Street Square"];

const doc = app.documents.add();
const p = doc.documentPreferences;
p.facingPages = false; p.pagesPerDocument = 1;
p.pageWidth = "297mm"; p.pageHeight = "420mm";
p.documentBleedUniformSize = true; p.documentBleedTopOffset = "3mm";

const page = doc.pages.item(0);
const bg = page.rectangles.add();
bg.geometricBounds = ["-3mm", "-3mm", "423mm", "300mm"];   // [top, left, bottom, right], out to the bleed
bg.place(ART);
bg.fit(FitOptions.FILL_PROPORTIONALLY);

const sizes = [96, 40, 32];                                 // pt: headline ≥ 3× body
COPY.forEach((text, i) => {
  const f = page.textFrames.add();
  f.geometricBounds = [`${20 + i * 45}mm`, "20mm", `${60 + i * 45}mm`, "277mm"];   // 20 mm margins
  f.contents = text;
  const para = f.paragraphs.item(0);
  para.appliedFont = app.fonts.item("Arial");               // a font installed on this machine
  para.pointSize = sizes[i];
});

// Pick a PDF/X-4 preset by name; names differ between versions and installs.
let preset = null; const names = [];
for (let i = 0; i < app.pdfExportPresets.length; i++) {
  const it = app.pdfExportPresets.item(i); names.push(it.name);
  if (/X-4/.test(it.name)) preset = it;
}
if (!preset) throw new Error("No PDF/X-4 preset. Installed: " + names.join(", "));
doc.exportFile(ExportFormat.PDF_TYPE, OUT, false, preset);
```

- `pageWidth`, `pageHeight` and the bleed offsets take measurement strings with units (`"297mm"`, `"6p"`). `geometricBounds` is `[y1, x1, y2, x2]`, top-left then bottom-right.
- The PDF preset carries the colour conversion and PDF/X standard. A preset object also has `useDocumentBleedWithPDF`, `cropMarks`, `bleedMarks` and `standardsCompliance`; set crop marks only if the printer asks.
- Adobe's reference types the `place` and `exportFile` targets as `File` ("the path to the export file"). If a plain path string is rejected in the user's version, have them place the art and export with File → Export by hand, using the same preset.
- `app.fonts.item("Arial")` follows Adobe's own sample; for other families confirm the exact installed name, and check for missing fonts before export.
- For a series (A4, A3, A2), run the same script with different constants; keep type sizes proportional to the page.

## 4. Photoshop: the photo layer

Photoshop's place in a poster is the pixels: expand, retouch, upscale and colour-convert the background, then hand it to InDesign or Illustrator for the type.

```js
// prep-bg.psjs: open the generated background first, then run this
const { app, constants } = require("photoshop");
const { localFileSystem } = require("uxp").storage;

let doc = app.activeDocument;
// Generative upscale (Photoshop 27.2+): Firefly model, scale 2 or 4, on the selected layer(s).
// It is a generative feature: confirm with the user before running.
doc = await doc.generativeUpscale(constants.GenerativeUpscaleModel.FIREFLY, { scale: 2 });
// Only if the printer wants a CMYK image rather than a PDF/X conversion at export:
// await doc.convertProfile("Working CMYK", constants.Intent.RELATIVECOLORIMETRIC, true);
const entry = await localFileSystem.getFileForSaving("market-bg-print.psd");
await doc.saveAs.psd(entry);
```

- `app.documents.add({ width, height, resolution, mode, fill })` makes a new canvas; with no options it is 7×5 in at 300 ppi, and missing fields default to 2100×1500 px, 300 ppi, RGB, white.
- `resizeImage(width, height, resolution)` scales pixels; `resizeCanvas(width, height, anchor)` adds room (for example to extend art into the bleed) without scaling.
- `convertProfile` accepts `"Working RGB"`, `"Working CMYK"`, `"Working Gray"`, `"Lab Color"` or a profile name, plus an intent (`PERCEPTUAL`, `RELATIVECOLORIMETRIC`, `SATURATION`, `ABSOLUTECOLORIMETRIC`).
- `createTextLayer({ contents, fontSize })` (Photoshop 24.2+) exists, but long copy, dates and prices belong in InDesign or Illustrator where they stay vector.
- Save as `.psd` (or `.psb` for very large posters) via `saveAs.psd` / `saveAs.psb`; `saveAs.jpg(entry, { quality: 12 }, true)` saves a full-quality copy.
- Batch PSD automation in the cloud (the Photoshop API in Adobe Firefly Services: background removal, smart-object replacement, actions) needs Firefly Services credentials; use it only when the user already has access.

## 5. Illustrator: vector poster and PDF/X save

Build the poster at the trim size with 3 mm bleed. A poster Claude built as SVG (`code-rendered-posters.md`) can be opened in Illustrator and saved the same way. The file for the printer comes from Illustrator's Save Adobe PDF dialog, following Adobe's Illustrator help:

1. File → Save As, choose Adobe PDF (*.PDF) as the type, then Save. (Save As replaces the open `.ai` file with the PDF; File → Export → Export As makes a PDF without that, but its default preset is aimed at small collaboration files.)
2. In the Save Adobe PDF dialog, pick a PDF/X preset, or choose a PDF/X format from the Standard menu. Illustrator supports PDF/X-1a (CMYK workflow), PDF/X-3 and PDF/X-4 (colour-managed, live transparency kept). Use the one the printer names.
3. Output category: set the PDF/X options. Marks & Bleed category: tick Trim Marks only if the printer asks, and tick Use Document Bleed Settings (or enter Bleed Top, Bottom, Left, Right).
4. Select Save PDF.

- A few presets (PDF/X-1a:2003 and PDF/X-3 (2003)) are installed but unavailable until moved from the Extras folder to the Settings folder (`/Library/Application Support/Adobe/Adobe PDF` on a Mac).
- Illustrator scripts are `.jsx` files (run as in section 2b). Write only calls the user's Illustrator scripting reference confirms, and use the Save As route above for the PDF.

## 6. Figma: poster frames and print export

Connecting Claude to Figma and writing to the canvas: `figma-design` → `references/figma-mcp.md` and `references/building-in-figma.md`. What a poster adds:

- **Frame size.** Build the frame at the destination size (1080×1350 for a 4:5 post). For print, Figma exports PNG/JPG at a multiplier (`2x`), a fixed width (`3508w`) or height (`4961h`); SVG and PDF export only at 1x.
- **Colour.** Figma exports with the file's colour profile (sRGB or Display P3). Its export docs mention no CMYK, bleed or crop marks. For a press PDF/X, rebuild the layout in InDesign, Illustrator or Affinity using the Figma export as art, or confirm with the printer that an RGB PDF is accepted.
- **Export from Claude without the MCP:** `GET https://api.figma.com/v1/images/:file_key?ids=<node-id>&format=png&scale=4` with header `X-Figma-Token` (a personal access token kept in an environment variable, scope `file_content:read`). `format` is `jpg`, `png`, `svg` or `pdf`; `scale` 0.01–4. It's a Tier 1 rate-limited endpoint, image links expire after 30 days, and anything over 32 megapixels is scaled down, so A2 at 300 ppi (≈ 35 MP) comes back smaller. Check the pixel size of what you download.

```bash
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/images/$FILE_KEY?ids=12:345&format=png&scale=4" | jq -r '.images[]'
```

## 7. Affinity

The Affinity AI Connector is Affinity's own MCP integration with Claude, free during its beta. It automates repetitive production tasks (naming layers, batch image edits), builds small tools with dialogs inside Affinity, and saves workflows as reusable scripts in Affinity's Scripting panel. Setup steps: https://affinity.studio/help/ai-connector-setup. Read any script it writes before saving it to the panel, and ask before batch edits on the user's files. Without the connector, deliver a print-ready PDF or SVG from this skill and let the user place it.

## 8. Checks before handover

- [ ] Document size equals trim size; bleed 3 mm (or the printer's spec) and art reaches it; text ≥ 5 mm inside trim
- [ ] Every word matches the brief letter by letter, in the app's file, not just in your script
- [ ] No missing or substituted fonts; `pdffonts` shows all fonts embedded
- [ ] `pdfinfo` page size matches (A3 = 841.89 × 1190.55 pt trim; larger with bleed boxes)
- [ ] Placed images ≥ 300 ppi at final size (150 ppi for large format viewed from over 1 m)
- [ ] PDF/X standard and colour handling are what the printer asked for
- [ ] Native file (`.indd`, `.ai`, `.psd`, the Affinity file, Figma link) delivered next to the PDF and PNG, with the scripts used
- [ ] You opened the exported PDF and looked at it at 100% and at thumbnail size
