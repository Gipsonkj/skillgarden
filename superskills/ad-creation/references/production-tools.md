> Sources: official docs from Canva (canva.dev), Adobe (developer.adobe.com/adobe-for-creativity), TikTok for Business, CapCut help and Claude Code, written in our own words; workflow notes from canva-skills (canva-sdks/canva-skills, Apache-2.0) and adobe-for-creativity skills (adobe/skills, Apache-2.0).

# Production tools: design and editing apps for ad assets

Use this when the ads get made, resized or cut in an app the user already works in, and when finished assets go into TikTok Ads Manager. Generating images and video with models: [ai-ad-production.md](ai-ad-production.md). Sizes and safe zones: [platform-specs.md](platform-specs.md). Meta launch rules (create paused, check every placement preview): [meta-ads-creative.md](meta-ads-creative.md).

## Pick a tool

| The user's need or situation | Use | Why |
|---|---|---|
| They already use or pay for one of these apps | That one | Their brand kit, fonts and past ads live there. If you don't know which, ask before starting. |
| One design or template into every Meta/LinkedIn size, brand-kit check, team review | Canva connector | Resize, edit, brand kit and export through MCP. Resize and brand kits need Canva Pro or above. |
| Extend a product photo onto tall and wide canvases, subject-aware crops, Photoshop/Express/Premiere work | Adobe for creativity connector | Generative expand plus crops per platform. About 40 tools work without an Adobe sign-in. |
| A hand-cut UGC or TikTok edit with captions | CapCut, by hand (desktop or web) | Claude writes the script, shot list and caption file; the user edits and exports |
| AI video ad, avatar, dubbing or a hook refresh inside TikTok | TikTok Symphony Creative Studio | Open to every logged-in TikTok for Business user; exports straight to Ads Manager |
| No design app, or the layout must be exact across many variants | Code route: `poster-design` → `references/banners-social.md`; video templates in `ai-video` → `references/hyperframes-workflows.md` | Free, deterministic, no account |
| Generated product shots or video clips | [ai-ad-production.md](ai-ad-production.md) (Nano Banana, FLUX, Higgsfield, Veo) | Model-based, provider-agnostic rules |
| Finished assets into TikTok Ads Manager | TikTok for Business MCP, or upload by hand | Official connector, sign-in only |
| Many on-brand variants from a spreadsheet in Canva | `poster-design` → `references/canva.md` (bulk create) | Brand template autofill, covered there |

Anything that publishes, uploads to an ad account or spends money: show the exact item and wait for a yes.

## Canva

**For:** small teams whose ad statics already live in Canva. Pick it over Adobe when the job is layout, text and resizing rather than pixel editing.

**Connect.** Each person signs in with their own Canva account (OAuth); nothing to paste.
- claude.ai or Claude Desktop: add Canva's official connector from Claude's connector directory ("Add to Claude") and sign in.
- Claude Code: Canva's official plugin brings the MCP server (`https://mcp.canva.com/mcp`) and its skills: `/plugin marketplace add canva-sdks/canva-skills`, then `/plugin install canva@canva-skills`. Finish sign-in with `/mcp`.

**Tools that matter for ads** (names as Canva documents them; match by purpose if a host renames them):

| Job | Tool | Plan | Rate limit |
|---|---|---|---|
| Find a design | `search-designs`, `get-design`, `resolve-shortlink` | All | 100/min (shortlink: none) |
| Bring in the product photo | `upload-asset-from-url` (public HTTPS URL only) | All | 30/min |
| Start from a prompt | `generate-design` → `create-design-from-candidate` | All | 20/min |
| Start from a brand template | `search-brand-templates`, `create-design-from-brand-template` | Pro+ | 100/min, 20/min |
| Edit text and layout | `start-editing-transaction` → `perform-editing-operations` → `commit-editing-transaction` | All | 20, 50, 20/min |
| Resize | `resize-design` | Pro+ | 20/min |
| Brand kit | `list-brand-kits` | Pro+ | 100/min |
| Preview | `get-design-thumbnail` | All | 100/min |
| Export | `export-design` (PNG, JPG, PDF, MP4, GIF) | All | 20/min |

**Workflow: one product image → Facebook and Instagram ad set with a headline**

1. **Get the image in.** `upload-asset-from-url` takes only a public HTTPS URL that returns 200 (otherwise the job fails with `fetch_failed`). A file on the user's machine: ask them to upload it to Canva, then work from that design or asset.
2. **Make the master with a text box.** The edit API can't add new text elements, so the headline needs a design that already has one: `generate-design` with a `query` brief, `design_type`, `asset_ids` (the product) and `brand_kit_id` returns candidates; show them, let the user pick, then `create-design-from-candidate`. Or start from one of their brand templates.
3. **Set the headline.** Start a transaction, `replace_text` on the headline element ("Calmer skin in 14 days"), `format_text` for size and weight, `position_element` if needed. Show the thumbnail and the list of changes, wait for a yes, then commit. Uncommitted edits are lost.
4. **Resize per placement.** `resize-design` with custom `width`/`height`: 1080×1080 (feed), 1080×1350 (feed 4:5), 1080×1920 (Stories, Reels). Each call makes a new copy and leaves the original alone; it rearranges the layout, so open every result and check the headline sits inside the safe band (y=220-1420 on 9:16) and nothing is cropped.
5. **Brand check.** `list-brand-kits`, then compare. The kit may come back as names and thumbnails only, without hex codes or fonts; then compare visually and ask the user for the palette and fonts rather than guessing. Report each item as on brand, off brand or can't verify.
6. **Fix what the API can.** Text colour, size, weight and style are editable; font family and background colour are not (tell the user to change those in the Canva editor).
7. **Export.** `export-design` as PNG or JPG per size (MP4 or GIF for motion). It runs as a job; download the files as soon as it finishes, because the signed links expire. Don't store or share those links.
8. **Into Meta.** Upload the exports in Ads Manager (or through the Meta route in [meta-ads-creative.md](meta-ads-creative.md)), create the ads paused, and let the user review every placement preview before anything goes live.

**Gotchas**
- Free plans get only a limited resize trial; running out returns `quota_exceeded`. Say so instead of retrying.
- Jobs are asynchronous (generate, resize, upload, export): check the status before using the result.
- If brand-kit calls fail with a missing-scope error, the user disconnects and reconnects the connector.
- Canva's own skills (`resize-for-social-media`, `brand-check`, `edit-design`, `bulk-create`) follow the same steps; use them when the plugin is installed.

## Adobe for creativity

**For:** Photoshop-grade work on real product photos and quick video resizes and cuts. Pick it over Canva when the source photo needs extending, reframing or retouching rather than a new layout. Adobe's connector covers 50+ tools across Photoshop, Lightroom, Illustrator, Firefly, Premiere, Express, InDesign and Adobe Stock.

**Connect.** claude.ai or Claude Desktop: Customize → Connectors → + → Browse connectors → search "Adobe for creativity" → Install. It works on any Claude plan; On Enterprise plans an admin must first enable third-party connectors (Organization settings → Skills). Setup can't be done from the iOS or Android apps. Adobe's setup docs cover claude.ai, Claude Desktop and Cowork; its official plugin config points at `https://adobe-creativity.adobe.io/mcp`.

**Sign-in.** About 40 tools work as a guest. Signing in with an Adobe ID (free or paid) adds tools, including generative expand and the video tools, plus Creative Cloud storage and higher limits; a few tools need a paid Adobe plan. Files save to Creative Cloud only when signed in and storage is free.

**Skills.** Adobe publishes official skills for this connector (`adobe-create-social-variations`, `adobe-resize-photos-and-videos`, `adobe-edit-quick-cut` and others) at github.com/adobe/skills. Without the Cowork plugin, add one via Customize → Skills → Create skill → Upload a skill.

**Workflow: one product photo → every feed and story size**

1. Call `adobe_mandatory_init` first; it returns the file rules for the session.
2. Get the file with the `asset_add_file` picker, or stage it with `asset_initialize_file_upload` → upload → `asset_finalize_file_upload`. Never pass a raw local path to an image or video tool.
3. Look at it (`asset_inline_preview`) and pick the crop focus: name the product for a product shot (`{ prompt: "serum bottle" }`), `"face"` for people.
4. Extend the original twice with `image_generative_expand`: once top and bottom (for 4:5 and 9:16), once left and right (for wide). Always expand from the original; chained expands degrade.
5. Crop each size with `image_crop_and_resize`; square comes straight from the original. For a big set, preview three test crops first (1080×1080, 1080×1350, 1200×627) and get a yes.
6. If expand isn't available on the user's plan (403), use `image_crop_and_resize` with `fit: "reframe"` and say so in the summary.

**Video.** `video_resize` keeps the same ratio only (9:16 → 1080×1920, 720×1280; 16:9 → 1920×1080, 1280×720); a cross-ratio resize adds black bars, so reshoot or recut instead. `video_create_quick_cut` makes a highlight cut from long footage; its `target_duration` is a soft target and may overshoot, so it is wrong for exact trims.

**Gotchas**
- Generative expand invents pixels. Check the product itself is unchanged and no new text, labels or claims appeared ([ai-ad-production.md](ai-ad-production.md), rule 6).
- Upload size limits apply on both Claude's and Adobe's side; send a TIFF as a high-quality JPEG.
- Output URLs are time-limited: preview and download straight away.

## CapCut (manual workflow)

**For:** fast hand-edited UGC, founder and TikTok cuts. This route is manual: Claude prepares everything and the user edits in CapCut. For automated or code-driven edits, use `ai-video` → `references/footage-editing-ffmpeg.md` instead.

What Claude hands over:
1. The hook table (visual / spoken / caption) and on-ramp from [short-form-video-ugc.md](short-form-video-ugc.md).
2. A shot list: clip, in and out time, on-screen text, inside the 720×1200 safe band.
3. Captions as an `.srt` file in UTF-8:

```
1
00:00:00,000 --> 00:00:01,800
I almost returned this serum

2
00:00:01,800 --> 00:00:04,200
then day 14 happened
```

The user's steps:
- **Import captions.** Desktop: Captions → Add captions → Import file (`.srt` or `.txt`). Web: the Captions tab, `.srt` only. The mobile app can't import caption files; do it on desktop or web.
- **Set 9:16** for TikTok and Reels, then restyle captions to the native look in the short-form guide.
- **Export.** CapCut web has an "Upload to TikTok Ads Manager" button after export. Desktop saves a file; the user uploads it in TikTok Ads Manager, where it shows under "Videos".

## TikTok Symphony Creative Studio (manual workflow)

**For:** TikTok-native AI video. It lives at `ads.tiktok.com/creative/creativestudio` and is open to every logged-in TikTok for Business user. This route is manual: Claude writes the inputs and checks the outputs.

| Feature | Use it for |
|---|---|
| Generate TikTok ads | Product URL or details → draft videos |
| Avatar videos | AI presenters with set gestures and languages |
| Script generation | TikTok-style scripts from guided prompts or your text |
| Translation and dubbing | Voice-over into other languages, with lip-sync |
| Video editor | Captions, avatars, music and effects on existing clips |
| Refresh ads | New hooks or background music on a running ad |

- Claude's part: the brief, 3-5 hooks per the short-form guide, and the approved claims list. Paste these in; never let the tool invent claims.
- Output that meets TikTok's AI disclosure rules is labelled "AI-generated" automatically. Avatar ads are C-tier ([meta-ads-creative.md](meta-ads-creative.md)); test them, don't lead with them.
- Download the videos or export them straight to TikTok Ads Manager.

## TikTok for Business MCP (into Ads Manager)

**For:** campaign management, audiences, bidding, creative operations and performance reports on TikTok, from Claude. Official, hosted by TikTok.

**Connect.** No developer app or API key: the user signs in with TikTok for Business when prompted.
- claude.ai: add the official "TikTok for Business" connector from the connector directory.
- Claude Code: `claude mcp add --transport http tiktok-ads https://business-api.tiktok.com/open_mcp/tt-ads-mcp-flat`, then `/mcp` to sign in.

| Endpoint | Tools | When |
|---|---|---|
| `.../open_mcp/tt-ads-mcp-flat` | About 400 at once | TikTok's recommendation for Claude |
| `.../open_mcp/tt-ads-mcp-layer` | About 40 core, the rest found on demand | Smaller context budgets |

**Rules**
- Read first: list the advertiser accounts and confirm which one with the user.
- The server can write (campaigns, audiences, bidding, creative). Before any create, update or budget call, show the exact campaign, ad group and ad fields (copy, video, CTA, budget, schedule) and wait for a yes. One approval covers one call.
- Leave delivery to the user: they enable the ads in Ads Manager after checking the previews.
