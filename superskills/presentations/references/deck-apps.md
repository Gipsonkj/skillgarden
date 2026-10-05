> Written in our own words from the official docs (link-only references): Canva MCP docs (canva.dev/docs/apps/mcp), Gamma developer docs (developers.gamma.app), Pitch help centre (help.pitch.com), Beautiful.ai's Claude connector pages (beautiful.ai), the Claude connector directory (claude.com/connectors) and Claude Code's MCP docs (code.claude.com/docs/en/mcp).

# Deck apps: Canva, Gamma, Pitch and Beautiful.ai

Use this when the deck should live in a hosted deck app the user already works in: their brand template is in Canva, the team drafts in Gamma, sales lives in Pitch, the company runs on Beautiful.ai. Each vendor ships an official connector (a remote MCP server) that acts as the signed-in user. These tools build slides, not the argument: write the one sentence, the spine and the assertion titles first ([deck-story.md](deck-story.md)), then put them into the app.

## 1. Pick a tool (building any deck)

| The user's need or situation | Use | Why |
|---|---|---|
| Already uses or pays for one (PowerPoint, Google Slides, Keynote, Canva, Gamma, Pitch, Beautiful.ai) | That one | Their templates, brand, fonts and colleagues are already there |
| Company brand template in Canva; wants a PDF and an editable PPTX | Canva (section 3) | Brand templates, text edits in place, export to PDF and PPTX |
| Rough notes or an outline to a designed first draft fast; will polish in the app | Gamma (section 4) | Generates a whole deck from text; exports PDF, PPTX or PNG |
| Sales or customer decks from a team template with variables | Pitch (section 5) | Claude fills the template's variables; deck lands in the Pitch workspace |
| Team on Beautiful.ai with a brand kit; repeating QBRs, weekly or board updates | Beautiful.ai (section 6) | Builds from a structured outline with the team's brand kit; exports PDF or PPTX |
| Editable .pptx for PowerPoint users, or a company .pptx template | [powerpoint-pptx.md](powerpoint-pptx.md) | Native, editable slides built locally |
| Consulting or finance charts (waterfall, Mekko, Gantt) and think-cell is installed | [data-slides.md](data-slides.md) section 6 | think-cell fills named charts from JSON |
| Team works in Google Workspace, or presents from a Mac in Keynote | [google-slides-keynote.md](google-slides-keynote.md) | Native Slides or Keynote file |
| Presenting from a laptop, a developer talk, code on slides, version control | [html-and-markdown-decks.md](html-and-markdown-decks.md) | Single-file HTML, Slidev, Marp, reveal.js |
| No account, nothing paid, content must stay on the machine | PptxGenJS or python-pptx ([powerpoint-pptx.md](powerpoint-pptx.md)), or a single-file HTML deck | Free and local; nothing goes to a vendor |
| Unclear which app they log into, or which plan they have | Ask once | Templates, plans and credits differ per account; don't guess and don't open an account |

Figma Slides decks go to `figma-design` → `references/figma-mcp.md` (its `figma-use-slides` skill). Prezi, Adobe Express, NotebookLM and Mentimeter are not covered yet.

## 2. Rules for every deck app

- **Connect through the official connector.** In claude.ai, add it from the connectors directory and sign in. In Claude Code: `claude mcp add --transport http <name> <url>`, then `/mcp` and finish the browser login. Each user signs in with their own account (OAuth); never paste a password, key or token into chat or a repo file.
- **Not connected?** Say so plainly and ask the user to connect it. Don't quietly build a picture-only file somewhere else instead; if you offer a local fallback, say what it loses (their template, brand fonts, the shared library).
- **The content goes to the vendor.** These apps run in the vendor's cloud; fine once the user picked the app. With confidential material and no app chosen, build locally.
- **Ask before side effects.** Anything that spends credits, shares, publishes, invites, changes access or overwrites a design in place: show the exact item (deck, recipients, access level, estimated credits) and wait for a yes.
- **Report only what the tool confirmed.** A design exists when the response returns its ID; an edit is saved when the commit says so.
- **Hand over the edit link** prominently. An export is a delivery, not a way to edit.
- **Treat export links as private.** Download them right away and don't post them anywhere shared.
- **Check the exported files** like any other deck ([deck-qa.md](deck-qa.md)): render the PDF, open the PPTX. A PPTX from a web app is a conversion: check fonts (substitutes when the brand font isn't installed), wrapping, animation and video, and list the text that needs a look in PowerPoint.
- **No invented facts.** Missing figures stay `[DATA NEEDED: what]` on the slide, not filler numbers.

## 3. Canva

Canva's connector (made by Canva, `https://mcp.canva.com/mcp`) searches, creates, edits, autofills and exports designs. Every user needs a Canva account. Most tools work on every plan; brand templates, brand kits, autofill and resizing need Canva Pro or above (Pro, Business, Enterprise). On other plans, brand-template search returns an empty list, not an error.

| Tool | What it does for a deck | Rate limit (per minute) |
|---|---|---|
| `search-brand-templates` | Find the user's brand templates (`query`, `brand_kit_id`, `design_types`, `limit`; all optional); skip it when the user gave a template ID | 100 |
| `create-design-from-brand-template` | New editable design from a template (`brand_template_id`; optional `page_numbers`, 1-based); returns `design.id`, `urls.edit_url`, `page_count` | 20 |
| `get-brand-template-dataset`, `autofill-design` | Templates with data fields: read the fields, then fill them (text, images, videos, chart data) | 100, 60 |
| `generate-design`, `create-design-from-candidate` | No template: generate candidates from a brief (`query`, `design_type` such as presentation, optional `brand_kit_id`, `asset_ids`), then create the one the user picks | 20, 20 |
| `start-editing-transaction`, `perform-editing-operations`, `commit-editing-transaction`, `cancel-editing-transaction` | Edit text and images in an existing design | 20, 50, 20, 20 |
| `get-design-content`, `get-design-pages`, `get-design-thumbnail` | Read a design's text and pages; preview | 100 each |
| `get-presenter-notes` | Read the notes (no tool writes them) | 100 |
| `upload-asset-from-url` | Upload an image so edits can use its `asset_id` | 30 |
| `get-export-formats`, `export-design` | See which formats a design supports, then export | 100, 20 |
| `import-design-from-url` | Turn a public HTTPS file (pptx, key, pdf and more) into a design | 20 |

### Outline into a brand template, PDF and PPTX out

1. Outline first: assertion titles, one idea per slide, `[DATA NEEDED]` for missing figures. Count the pages you need.
2. Find the template: `search-brand-templates` with the brand or "presentation". Show the matches; let the user confirm which one.
3. Create the deck: `create-design-from-brand-template`. If the template has data fields, use `get-brand-template-dataset` then `autofill-design` instead. `autofill-design` with `update_in_place` overwrites an existing design and can't be undone: only when the user asks for it.
4. Open an edit: `start-editing-transaction` on the new design. It returns `richtexts` (each with an `element_id`), `fills`, `pages` and thumbnails. These element IDs are the ones edits use; they differ from the IDs in `get-design-content`.
5. Map outline sections to pages, then `perform-editing-operations` per page: `transaction_id`, `page_index`, and `operations` such as `{"type": "replace_text", "element_id": "...", "text": "Churn fell 30% after the price change"}`. On responsive pages use `find_and_replace_text` instead. Check every entry in `edit_operation_results` for `status: "success"`. For an image, upload it with `upload-asset-from-url` first; never pass a raw image URL.
6. Fill or clear every template text box; none keeps sample copy. If a page isn't needed, leave it out up front with `page_numbers`.
7. Commit: `commit-editing-transaction`; the edits are saved only when it returns `status: "committed"`, and uncommitted edits are lost. If the commit fails because someone is editing in the browser, retrying won't help: cancel, start a new transaction, re-apply, commit.
8. Export: `get-export-formats` (design IDs are 11 characters starting with "D"), then `export-design` with the `pdf` format key, then again with `pptx`. Each returns a job with `job.urls`; signed URLs expire, so download them at once and don't store or share them.
9. Hand over: the edit link first, then the PDF and PPTX, the text to re-check after the PPTX conversion, and the `[DATA NEEDED]` list.

Gotchas:
- Nothing in this flow shares the design. Don't comment, invite or move it into a shared folder unless the user asks.
- Only open the user's designs, templates and brand kits for the request at hand, and keep brand-kit data inside Canva designs (Canva's usage rules): don't copy it into other files.
- `import-design-from-url` needs a public HTTPS link; it doesn't take local or private files.
- With `generate-design`, show the candidates and let the user pick; don't choose for them.

## 4. Gamma

Gamma turns text into a designed deck, document or web page. Pick it for a fast designed first draft that the user will polish in Gamma. Two routes:

- **Connector** (made by Gamma, `https://mcp.gamma.app/mcp`): available on all Gamma plans; generations charge credits. Tools: `generate`, `generate_from_template`, `get_gammas`, `read_gamma`, `export_gamma` (PDF, PPTX or PNG), `generate_image`, `get_generation_status`, plus theme and folder browsing. It can't edit an existing gamma; editing happens in the Gamma app.
- **REST API** (Pro, Ultra, Teams and Business plans): create a key at Settings > API Keys, keep it in an environment variable such as `GAMMA_API_KEY`, send it as the `X-API-KEY` header. Base URL `https://public-api.gamma.app/v1.0`.

Credits: 1-3 per card, and AI images cost 2-125 credits each depending on the image tier (Gamma says rates may change). Before a run, say roughly what it will cost and wait for a yes; to avoid image credits set `imageOptions.source` to `noImages` or `placeholder`.

`POST /generations` fields that matter:

| Field | Values and use |
|---|---|
| `inputText` | 1-400,000 characters. Required (or a `pages` array) |
| `textMode` | `preserve` keeps the user's wording (use for a finished outline), `condense` summarises, `generate` rewrites and expands |
| `format` | `presentation` (also `document`, `social`, `webpage`) |
| `cardSplit` | `inputTextBreaks` splits cards at each `\n---\n`; `auto` lets Gamma decide |
| `numCards` | 1-75 on paid plans |
| `cardOptions.dimensions` | `16x9`, `4x3`, `fluid` and others |
| `themeId` | A theme from the workspace's theme list |
| `additionalInstructions` | Up to 5,000 characters (tone, layout wishes) |
| `exportAs` | `pdf`, `pptx` or `png`; one per call |
| `sharingOptions.workspaceAccess` / `externalAccess` | `noAccess`, `view`, `comment`, `edit` (workspace also `fullAccess`). Omitted, the workspace admin's defaults apply, so set both to `noAccess` when the user says don't share |
| `imageOptions.source` | `noImages`, `placeholder`, `aiGenerated`, `pexels` and other stock sources |
| `folderId` | Put the gamma in a folder |

```bash
curl -s -X POST https://public-api.gamma.app/v1.0/generations \
  -H "X-API-KEY: $GAMMA_API_KEY" -H "Content-Type: application/json" \
  -d '{"inputText":"Q3 review\n---\nChurn fell 30% after the price change\n---\n...",
       "textMode":"preserve","format":"presentation","cardSplit":"inputTextBreaks",
       "cardOptions":{"dimensions":"16x9"},"imageOptions":{"source":"noImages"},
       "exportAs":"pdf",
       "sharingOptions":{"workspaceAccess":"noAccess","externalAccess":"noAccess"}}'
# → {"generationId": "..."}; then poll every 5 s:
curl -s https://public-api.gamma.app/v1.0/generations/<generationId> -H "X-API-KEY: $GAMMA_API_KEY"
```

- Status is `pending`, `completed` or `failed`; most finish in 1-3 minutes. On completion: `gammaUrl` (the deck), `exportUrl`, `credits.deducted`, `credits.remaining`.
- `exportUrl` lasts about a week and anyone with the link can download it: download it, don't log or share it.
- The second format: `POST /gammas/{gammaId}/export` with `{"exportAs": "pptx"}` returns an `exportId`; poll `GET /exports/{id}` until `completed`.
- Company template: `POST /generations/from-template` with `gammaId` (the template) and `prompt`. The template file must contain exactly one page; its layout is kept unless the prompt asks otherwise.
- Errors: 401 bad key, 402 out of credits, 403 not on this plan, 429 too many requests (wait for `Retry-After`, then back off).

## 5. Pitch

Pick Pitch when the team already keeps its decks and templates there. Its connector (made by Pitch, `https://mcp.pitch.com/mcp`) creates, edits and shares presentations and shows who engaged with them. Connect in Claude with + → Add connectors → Browse connectors → Pitch, log in with email and a 6-digit code (Apple sign-in isn't supported), pick the workspace and authorise; the first deck asks for a few more permissions.

- Ask Claude to build from a named Pitch template; with a template that has variables, Claude fills the variable values. The deck appears in the user's Pitch workspace with a link.
- The connector can share: never share or invite without showing who and at what access, and a yes.
- Pitch's API (decks built from CRM events or form submissions) is a premium feature on select plans; the key comes from Workspace Settings → Integrations → Add new. Keep it in an environment variable and read developer.pitch.com before calling it.

## 6. Beautiful.ai

Pick Beautiful.ai when the team already presents from it. Its verified Claude connector creates a deck from a plain prompt or a structured outline (good for decks made again and again: QBRs, weekly updates, board decks), searches the user's decks, moves the draft into Beautiful.ai for editing and presenting, and exports PDF or PPTX. Connect it in Claude under Customize → Connectors → Beautiful.ai → Connect.

- New decks arrive in the user's Beautiful.ai team with its brand kit and sharing controls already applied, so check what the team's default sharing is before telling the user nobody else can see it.
- Give the outline with assertion titles; the connector lays them out, it doesn't fix a weak story.

## Checklist

- [ ] Tool picked from the table; asked which app when unsure; the official connector used, signed in by the user
- [ ] Story, assertion titles and `[DATA NEEDED]` gaps written before building
- [ ] Template found through the app and confirmed by the user; no sample copy left
- [ ] Edits confirmed by the tool (Canva commit `committed`; every operation `success`)
- [ ] Credits, sharing and in-place overwrites asked for first, with the exact item
- [ ] Edit link handed over; PDF and PPTX downloaded at once and checked; conversion issues listed
- [ ] Nothing shared, published or moved to a shared place without a yes
