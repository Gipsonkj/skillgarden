# Retouch, cut out, resize and upscale in pro tools: Adobe, Canva, Photoroom, Topaz

> Written in our own words from the official docs of Adobe (Adobe for creativity, Firefly Services), Canva (canva.dev), Photoroom and Topaz Labs, and from Adobe's and Canva's own skills (adobe/skills and canva-sdks/canva-skills, both Apache-2.0). Facts checked in October 2026; tool lists, prices and limits move, so re-read the linked docs before relying on a number.

Use this guide when the user already pays for one of these tools, or when the job is finishing work on a real photo (cutout, new surface, crop to sizes, upscale) rather than making a new image. For generating new images, see `hosted-models-flux-replicate-fal.md`; for the edit-prompt rules (one change, keep list), see `editing-references-consistency.md`.

## 1. Pick the tool

| Job | First choice | Why |
|---|---|---|
| User already uses or pays for one of these | That one | No new account, key or bill |
| No account, free | Local tools: rembg, ImageMagick, Real-ESRGAN | Pickers that include them: `editing-references-consistency.md` §6 (cutouts), §7 (upscaling), `marketing-brand-images.md` §3 (sizes) |
| User says "use Adobe" / has Creative Cloud, works in claude.ai or Claude Desktop | Adobe for creativity connector (§2) | Photoshop, Lightroom, Express and Firefly tools in chat, files stay in Creative Cloud |
| Batch generate/fill/expand from code on an enterprise Adobe contract | Firefly Services API (§3) | Server-to-server API; needs an enterprise entitlement |
| Brand templates, layouts with type, resizing a design to many formats | Canva connector (§4) | Edits real Canva designs; resize and autofill on paid plans |
| Product cutout, new background or surface, shadow, exact output size | Photoroom (§5) | One call does cutout + background + shadow + size |
| Upscaling a real photo for print or a big screen | Topaz Gigapixel API (§6) | Precision upscalers that keep the source look |
| Upscaling a degraded or AI image with new detail | Topaz Wonder / Bloom (§6) | Generative upscalers; check faces and text after |

Rules for all of them:
- **Never overwrite the original.** Upload a copy, save every result under a new versioned name (`mug-feed-1080x1350-v1.jpg`).
- **Keys stay out of chat and the repo.** Connectors sign in with the vendor's own login. APIs read a key from an environment variable the user sets (`TOPAZ_API_KEY`, `PHOTOROOM_API_KEY`, `FIREFLY_SERVICES_CLIENT_ID` / `FIREFLY_SERVICES_CLIENT_SECRET`).
- **Spending, saving over a design, or posting needs a yes.** Before a paid batch, a Canva commit or anything that publishes, show the exact item (file, sizes, count, price) and wait for the user's yes. Posting to social accounts is not part of this craft: hand that to `social-media`.
- Resizing video goes to `ai-video` → `references/vendor-apis.md`.

## 2. Adobe for creativity connector (Photoshop, Lightroom, Express, Firefly)

**What it is.** Adobe's official connector for Claude: 50+ tools across Photoshop, Lightroom, Illustrator, Firefly, Premiere, Express, InDesign and Adobe Stock. It works in Claude chat (web and mobile), Claude Desktop and Cowork. Adobe's plugin is marked for the Claude desktop app only; in a terminal session prefer the APIs in §3, §5 and §6.

**Set up (the user does this).** Customize → Connectors → + → Browse connectors → search "Adobe for creativity" → Install, then sign in with an Adobe account. The plugin (Desktop) is under Browse plugins. Without signing in, guests get about 40 standard tools; signing in adds tools, higher usage limits and Creative Cloud storage, and a few tools need a paid Adobe plan. New connectors can't be installed from the iOS or Android apps. The server the plugin registers is `https://adobe-creativity.adobe.io/mcp`.

**How to drive it** (tool names from Adobe's own skills):

| Step | Tool | Notes |
|---|---|---|
| Start | `adobe_mandatory_init` | Call first; it returns file-handling rules and tool routing for this account |
| Get the file in | `asset_add_file` (picker), then `read_widget_context` | The picker returns an empty list at first; the real URIs arrive after the user picks |
| No picker on this surface | `asset_initialize_file_upload` → PUT bytes → `asset_finalize_file_upload` | Only when init says egress is enabled |
| Straighten, tone, look | `image_auto_straighten`, `image_apply_auto_tone`, `image_apply_adjustments`, `image_list_presets` + `image_apply_preset` | |
| Find the subject | `image_select_subject` | Also drives crop focus |
| Background blur | `image_apply_lens_blur` (depth-aware) or `image_apply_effects` with `effect: "gaussianBlur"` | |
| Generative fill / expand | `image_fill_area`, `image_generative_expand` | Not exposed on every surface or plan; a 403 means no entitlement, and retrying won't help |
| Crop and resize | `image_crop_and_resize` | One call per output size |
| Show results | `asset_preview_file` | |
| Express designs | `search_design`, `fill_text`, `replace_image`, `change_background_color`, `download_design` | Template-based flyers and posts. Not every surface exposes every tool: `replace_image` is generative and Adobe's skill treats it as unavailable on Claude; `download_design` returns a PDF |

`image_crop_and_resize` options that matter:

```text
image_crop_and_resize({
  imageURI: <presigned CC URL from the picker>,
  options: { output: { width: 1080, height: 1350 },   // or a ratio string "4:5"
             fit: "reframe",                           // reframe | pad | extract
             focus: "subject",                         // or "face", "upper_body", { prompt: "the mug" }
             quality: 7 },
  outputFileType: "jpeg"                               // "png" when you need transparency
})
```

- `reframe` (default) takes the largest centred crop at the target ratio; `pad` letterboxes and fills the gap with white; `extract` crops tight to the subject and must not be combined with explicit `{width, height}` (it stretches).
- For a big ratio change (4:3 → 9:16), Adobe's skill expands the original first with `image_generative_expand` (e.g. `{ top: 960, bottom: 960 }`) and then reframes. Always expand from the original, never from an earlier expand. If expand returns 403, fall back to `reframe` and say so.
- Image tools only take Creative Cloud URIs, never a local path.
- Size limits exist on both the Claude and the Adobe side; for a large TIFF, send a high-quality JPEG instead.

**Recipe: clean product photo into feed, story and square (Adobe account).**
1. Plan in one line: what changes (clutter out, new surface), what stays (the product's shape, label, colour, light direction), the three sizes (1080×1350, 1080×1920, 1080×1080).
2. `adobe_mandatory_init`, then the picker. The original stays untouched in Creative Cloud; every tool returns a new file.
3. Clutter and background: if `image_fill_area` is available on this surface, use it for one region at a time (Adobe's own retouch skill treats it as absent on Claude). If not, do that edit with a model edit (GPT Image or Gemini, "Change ONLY the background…" from `editing-references-consistency.md`) or with Photoroom (§5), then bring the result back in.
4. Sizes: `image_crop_and_resize` once per size with `focus: { prompt: "the mug" }`. For 9:16 from a 4:3 source, expand first if the plan allows, otherwise `pad` and tell the user the bars are white.
5. `asset_preview_file` with all outputs, check at 100% (label, edges, shadow), then download and save with new names. Don't post anything.

## 3. Firefly Services API (enterprise)

**Access.** Only for Adobe enterprise customers: an Admin assigns "Firefly - Firefly Services" to the user in the Admin Console and gives them the Developer or System Administrator role. The project uses OAuth Server-to-Server credentials (Client ID and Client Secret). If the user has a personal Creative Cloud plan, use the connector in §2 instead.

**Token** (valid 24 hours; credentials come from the environment):

```bash
curl -s https://ims-na1.adobelogin.com/ims/token/v3 \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode grant_type=client_credentials \
  --data-urlencode "client_id=$FIREFLY_SERVICES_CLIENT_ID" \
  --data-urlencode "client_secret=$FIREFLY_SERVICES_CLIENT_SECRET" \
  --data-urlencode 'scope=openid,AdobeID,session,additional_info,read_organizations,firefly_api,ff_apis'
```

Every call to `https://firefly-api.adobe.io` sends `x-api-key: <client id>` and `Authorization: Bearer <token>`.

| Call | Endpoint | Key fields |
|---|---|---|
| Upload an input | `POST /v2/storage/image` | JPEG, PNG or WebP; returns `images[0].id`, valid 7 days |
| Generate | `POST /v3/images/generate-async` | `prompt`, `numVariations`, `size: {width, height}`, `seeds`, `style.presets`, `style.imageReference.source.uploadId` with `style.strength` 1-100 (default 50) |
| Expand to a new size | `POST /v3/images/expand-async` | `image.source.uploadId`, `size`, `numVariations` |
| Fill a masked area | `POST /v3/images/fill` | `image.source.uploadId`, `image.mask.uploadId`, `prompt` |
| Poll | `GET /v3/status/{jobId}` (the `statusUrl`) | `status`: `running`, `succeeded`, `failed`; results in `outputs[].image.url` with each `seed` |

```bash
curl -s https://firefly-api.adobe.io/v3/images/generate-async \
  -H "x-api-key: $FIREFLY_SERVICES_CLIENT_ID" -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"ceramic mug on a warm cream linen surface, soft window light from the left","numVariations":2,"size":{"width":2688,"height":1536}}'
# → {"jobId": "...", "statusUrl": "...", "cancelUrl": "..."}; poll statusUrl about once a second
```

- Rate limits per organisation: 4 requests per minute and 9,000 per day; a 429 means wait and retry.
- The same seed, prompt and settings give the same image; save `seed` from each output.
- Image5 (native 4 MP) runs on a newer `v4` generate endpoint with a different request shape. Read Adobe's "Migrating to Image5" page before switching; don't mix v3 and v4 fields.

## 4. Canva connector

**What it is.** Canva's official MCP server, `https://mcp.canva.com/mcp`, signed in with the user's Canva account. In claude.ai it is in the connectors directory (sign-in required); in Claude Code, install Canva's plugin, which registers the server and adds its skills:

```text
/plugin marketplace add canva-sdks/canva-skills
/plugin install canva@canva-skills
```

**Tools that matter here** (rate limits per minute; plan as listed by Canva):

| Tool | Limit | Plan |
|---|---|---|
| `generate-design` | 20 | all |
| `search-designs`, `get-design`, `get-export-formats` | 100 | all |
| `upload-asset-from-url` | 30 | all |
| `start-editing-transaction` / `perform-editing-operations` / `commit-editing-transaction` / `cancel-editing-transaction` | 20 / 50 / 20 / 20 | all |
| `resize-design` | 20 | Pro and above |
| `export-design` | 20 | all (plan affects output quality) |
| `autofill-design`, `create-design-from-brand-template`, `list-brand-kits` | 60 / 20 / 100 | Pro and above |

**Editing flow** (Canva's own edit skill): start a transaction with the `design_id` and show the returned thumbnail → one batched `perform-editing-operations` call (`replace_text`, `find_and_replace_text`, `format_text`, `update_fill` to swap an image, `insert_fill`, `delete_element`, `position_element`, `resize_element`, `update_title`) → show the new thumbnail and a plain list of changes → commit only after the user says yes. Uncommitted edits are lost; after a commit, the transaction id is dead.

What the edit API can't do: change the font family, add new text boxes, change background colours or gradients, add or reorder pages. Pages marked `is_responsive: true` accept only `update_title`, `replace_text`, `update_fill`, `delete_element` and `find_and_replace_text`. Say so and leave those changes to the Canva editor.

Typical use in this craft: generate or edit the photo elsewhere, upload it with `upload-asset-from-url`, place it in the user's brand template, `resize-design` for each placement, then `export-design` to PNG or JPG.

## 5. Photoroom (cutouts, new surfaces, shadows, exact sizes)

**Two routes.**
- **MCP** (`https://mcp.photoroom.com/mcp`): in claude.ai add it as a custom connector; in Claude Code run `claude mcp add --transport http Photoroom https://mcp.photoroom.com/mcp`. It signs in with the Photoroom account and creates its own key. One tool covers background removal, relighting, upscaling, shadows, AI backgrounds, virtual model and ghost mannequin. Up to 20 images at once in Claude; inputs up to 30 MB and 5,000 px on the long side.
- **API** with `x-api-key` from `PHOTOROOM_API_KEY`. Prefix the key with `sandbox_` while testing: free (1,000 calls a month, 100 a day) but watermarked.

**Image Editing API** (Plus plan, $0.10 per call however many edits it combines; the same call twice is billed twice): `POST https://image-api.photoroom.com/v2/edit`, multipart, file in `imageFile` (or `GET` with `imageUrl`). Output is the image bytes, PNG by default.

| Parameter | Values |
|---|---|
| `removeBackground` | `true` (default) / `false` |
| `background.color` | hex without `#` (`F3E9D7`) or a colour name; omit for transparent |
| `background.prompt` | an AI-generated scene; add header `pr-ai-background-model-version: background-studio-beta-2025-03-17` for the more photoreal model; `background.seed` for repeatable results |
| `shadow.mode` | `ai.auto-with-overrides` (current; needs header `pr-ai-shadows-model-version: 2026-04-15`); legacy `ai.soft`, `ai.hard`, `ai.floating` (no header) |
| `lighting.mode` | `ai.auto`, `ai.preserve-hue-and-saturation`, `ai.optimize-portrait` |
| `outputSize` | `originalImage`, `croppedSubject` or `WIDTHxHEIGHT` |
| `padding` | `0`-`0.49`, `"15%"` or `"100px"` |
| `export.format` | `png`, `jpeg`, `webp`, `avif` (JPEG has no transparency) |

```bash
# One placement per call: product on cream, soft shadow, 4:5 feed size
curl -s https://image-api.photoroom.com/v2/edit \
  -H "x-api-key: $PHOTOROOM_API_KEY" \
  -F imageFile=@mug-original.jpg \
  -F background.color=F3E9D7 -F shadow.mode=ai.soft \
  -F outputSize=1080x1350 -F padding=0.12 -F export.format=jpeg \
  -o mug-feed-1080x1350-v1.jpg
```

Repeat with `1080x1920` and `1080x1080` for story and square. Swap `background.color` for `background.prompt="on a warm cream linen tabletop, soft window light from the left"` when the user wants a real surface instead of a flat colour.

- Remove Background API (Basic plan) only cuts out: `POST https://sdk.photoroom.com/v1/segment`, file in `image_file`, with `format`, `bg_color`, `size`, `crop`. On a Basic plan, one Image Editing call uses 5 images of credit.
- Check credits with `GET https://image-api.photoroom.com/v2/account`. 401 = bad key, 403 = key not allowed or no credits, 429 = over 60 images a minute (back off).
- The `x-uncertainty-score` response header is `-1` when the image contains people and near `1` when the cutout is unsure: check those at 100%.

## 6. Topaz Labs API (Gigapixel, Wonder, Bloom)

**Access.** Create a key in the Topaz account portal (API Keys; it is shown once) and export it as `TOPAZ_API_KEY`. Calls go to `https://api.topazlabs.com/image/v1` with header `X-API-KEY`. Billing is in credits per output megapixel, not input. Try models first in the API Playground (`playground.topazlabs.com`).

**Pick the family:**

| Family | Endpoint | Use | Output MP per credit |
|---|---|---|---|
| Gigapixel (precision) | `/enhance/async` | Real photos, print; keeps the source look. `"Standard V2"` default, High Fidelity for clean pro photos, Low Resolution for tiny inputs, Art & CGI, Text & Shapes, Recover Faces, Transparent Image Upscale (keeps alpha) | 24 |
| Wonder (generative) | `/enhance-gen/async` | Degraded or compressed sources; adds detail. `"Wonder 3.5"` with `enhancementStrength` `low`/`medium`/`high` | 4 |
| Bloom (creative) | `/enhance-gen/async` | AI art and renders; invents new detail (Bloom 2) | 2 |
| Background removal | `/matting/async` | `model: "RemoveBG"`; `mode` `segmentation` (default, RGBA cutout) or `alpha` (mask) | 24 |

The `model` value is not always the display name (Standard 2 is `"Standard V2"`, High Fidelity 3 is `"Upscale High Fidelity V3"`); copy it from the model's page.

```bash
# Submit, poll every 2 s, then fetch the download URL
PID=$(curl -s -X POST https://api.topazlabs.com/image/v1/enhance/async \
  -H "X-API-KEY: $TOPAZ_API_KEY" \
  -F model="Standard V2" -F output_format=jpeg -F outputWidth=6000 \
  -F image=@hero-v3.jpg | jq -r .process_id)
curl -s -H "X-API-KEY: $TOPAZ_API_KEY" https://api.topazlabs.com/image/v1/status/$PID      # Completed | Failed | Cancelled
curl -s -H "X-API-KEY: $TOPAZ_API_KEY" https://api.topazlabs.com/image/v1/download/$PID    # {"url": ...}
```

- Gigapixel Standard 2 options: `faceEnhancement` (with `faceEnhancementStrength` and `faceEnhancementCreativity`, 0-1), `subjectDetection` (`foreground`/`background`/`all`), `sharpen`, `denoise`, `fixCompression` (0-1), `strength` (0.01-1; high looks unreal). Anything you leave out is set automatically; unknown fields are ignored, so a typo fails silently.
- Field names differ in style between pages (`output_format` in the quickstart, `outputWidth` / `outputHeight` on model pages). Copy them from the model's page.
- Limits: Standard 2 takes up to 512 MP in and gives up to 1,024 MP out; a request over 500 MB returns 413; 429 means back off exponentially.
- Generative upscalers (Wonder, Bloom) can change faces, labels and text. Use Gigapixel on product shots and real people, and check the result at 100%. Some models use other endpoints (Transparent Image Upscale is `/tool/async`); take the endpoint from the model's page too.
- Cost before a batch: count the output megapixels per image (6000×4000 = 24 MP = 1 Gigapixel credit; generative models cost more, see each model's table), show the total, wait for a yes.

## 7. Checks before hand-over

- [ ] Original untouched; every output saved under a new versioned name in the project
- [ ] Product shape, label and colour unchanged; cutout edges clean on light and dark; shadow falls the same way as the light
- [ ] Each placement at its exact pixel size; nothing important at the very top or bottom of the 9:16 frame, where the story UI sits (margins: `marketing-brand-images.md`)
- [ ] Upscales checked at 100% for invented detail on faces and text
- [ ] Paid calls, Canva commits and anything published were approved by the user first; nothing was posted
