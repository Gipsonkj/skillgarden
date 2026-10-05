# Managing storyboard projects

> Distilled from: manage-storyboard-projects (Yuuhann1999/codex-storyboard, MIT), cinematic-director (wuwangzhang1216/DirectorSKILL, MIT), short-drama-storyboard and short-drama-write (zenstory-ai/drama-skills, MIT), baoyu-comic (JimLiu/baoyu-skills, MIT), short-drama-director (lixiaoxiao9888-create/manju-laoli-skill, MIT).

Use when a board lives longer than one chat turn: an episodic series, a multi-scene film, a client project with revisions, or a board stored in a storyboard app.

## 1. Folder layout (Markdown-first)

```text
<project>/
  NOTES.md                 brief, locks (model, ratio, deliverable), decisions, open items
  bible/
    style.md               Visual Theme block, tone plates, per-scene light sentences
    characters.md          identity strings, sheets, palettes, voice/tone notes
    locations.md           plates, room-coordinate light, era lock
    props.md               recurring props and their states
  episodes/EP001/
    script.md              scenes with stable IDs (EP001-SC001)
    beats.md               beat table (B1...)
    board.md               shot table (SHOT IDs, Source column → scene IDs)
    prompts/               one file per keyframe / clip prompt
    log/                   PROJ_SCnn_SHnn_log.md: every prompt sent, in order, with result notes
  assets/                  generated and supplied images, named by the convention below
```

One source of truth per fact: the script owns story facts, the bible owns identity and look, the board owns camera and timing. A visual board page or app view is compiled from these files; never edit the compiled view as if it were the source.

## 2. IDs and naming

- Scenes: `EP001-SC003`. Shots: `SC03_SH05` or `SHOT-03-05`. Beats: `B1`... Characters `CHAR-mei`, locations `LOC-shelter`, props `PROP-parcel`.
- IDs follow story order and never get reused. A split shot becomes `05a` and `05b`; a late insert is `05a`; never renumber the shots after it.
- Asset files: `PROJ_SCnn_SHnn_vNN_role.ext` (roles: ref-face, ref-fit, plate-wide, kf-first, kf-last, clip, clip-FAIL-<axis>, vo-<char>, amb, sfx-<name>, mus, cut). Versions are monotonic; sibling options are `v03a`/`v03b`.
- Keep failed takes, with the failed axis in the name (`clip-FAIL-face`): they document what not to repeat.
- Approval lives in the log, not in renamed files.

## 3. Reference states

Distinguish three things in a shot's reference column so nobody mistakes a plan for a file:

| Marker | Means |
|---|---|
| `IMG-...` | A prompt entry for an image that may not exist yet |
| `REF-...` | A real file, present in the project now, with its role (identity, outfit, location, composition, first frame, last frame, style) and what it must not control |
| `PLAN-...` | The user will attach this image in their own tool at generation time; no file in the project |

If a shot needs a reference and none exists, write "missing: <which character/location/first frame>" instead of pretending. Offer three routes in one message: add existing images to the project, generate them in the user's own tool (record a PLAN slot), or switch that shot to text-to-video. Only bind images whose content you have actually checked; a filename that looks right is not verification.

## 4. Revisions

- Read the current file before revising; if it differs from an earlier draft in the chat, the file wins and you say what differs.
- Keep untouched shot IDs. When you split, merge or change a shot's job, list which downstream prompts and clips are now stale; do not silently rewrite files the user did not name.
- After any change, check what it touches: setups and payoffs, who knows what, durations and total runtime, assets and references, aspect ratio. Report the knock-on effects with the change.
- Fix found gaps in the document directly; do not produce a separate "coverage table" just to prove you checked.

## 5. Working with a storyboard app

**Pick a tool**

| Situation | Use | Why |
|---|---|---|
| The user already uses or pays for a board app | That app | Their team, clients and comments already live there |
| Client-ready numbered frames, review links and an MP4 animatic, driven from Claude | Boords (§5a) | Official MCP connector (any plan, Free included) and a REST API |
| A film or video production that also plans shot lists from the script | StudioBinder (§5b) | Imports FDX, PDF, TXT and Fountain scripts per scene; no API, so Claude prepares files |
| Animation studio boards drawn by story artists, with an editorial round trip | Toon Boom Storyboard Pro (§5c) | Builds panels from a Final Draft script; exports EDL, AAF and XML |
| No budget, no account, someone will draw | Storyboarder (§5d) | Free and open source; reads Fountain |
| The session already exposes storyboard-app tools (Agent Storyboard MCP) | Those tools (§5e) | One-call create and update |
| No app at all | The Markdown files in §1 | The board table is the deliverable |
| Several are possible and the user hasn't said | Ask which one they log into | Building in the wrong account wastes the import |

In every app: build and check the full shot list first (Done means in [shot-lists-and-boards.md](shot-lists-and-boards.md)), show the exact project name, frame count and fields you will create, and wait for a yes before writing to the user's account. Keys stay in environment variables or the app's own sign-in; never print, log or save them.

### 5a. Boords

**Connector (preferred from Claude).** Boords runs an official MCP server at `https://app.boords.com/mcp` with OAuth sign-in, no API key. It is in beta and included on every plan, Free included, within the plan's limits.

- claude.ai or Claude desktop: in Boords, Settings → Team → Connections → Claude → Add to Claude, then Connect and approve.
- Claude Code: `claude mcp add boords --scope user --transport http https://app.boords.com/mcp`, then `/mcp` → boords → Authenticate in the browser.
- It can list, create and update projects; write scripts; create storyboards, including frames from a script; add, update, delete and reorder frames and attach images made elsewhere; manage the Asset Library and comments. Boords' own image generation, styles and webhooks are not available through it.
- Deletes ask for confirmation. A connection lapses after 90 days unused; then sign in again.

**REST API (for scripts and pipelines).** Base URL `https://app.boords.com/v1`.

- Auth: header `X-API-KEY` with a token created in Settings → Team → API (Admin or Manager role, paid plan, starts `bap_`, shown once). Read it from an env var such as `$BOORDS_API_KEY`. Optional `X-API-CLIENT: <tool name>` labels your changes in the activity log.
- Hierarchy: Teams → Projects → Storyboards → Frames → Comments. Teams, projects and storyboards have short text IDs (`p4k9az`); frames and comments have numeric IDs. Responses are `{ "data": {...} }`, lists add `meta.next_cursor`.
- Board from a shot table in one request: `POST /v1/storyboards` with a `frames` array. Each frame takes a `label` (its reference field) plus any custom fields you name, such as `action`, `sound`, `dialogue` or `duration`; Boords creates the field definitions. Keep `meta.field_key_map` from the response: it maps your field names to the generated field IDs you need for later updates.
- Images: the frame image endpoint takes a URL or base64; Boords resizes to the storyboard's aspect ratio. Use JPG or PNG generated at that ratio.
- Limits: 120 requests per minute per token (`X-RateLimit-Remaining`, and `Retry-After` on 429). Lists page with `limit` (max 100, default 25) and `cursor`; `updated_since` (ISO 8601) fetches only changes.
- Roles: only Admin and Manager can create and edit content through the API; Supermember can read and manage comments; Member is read-only.
- The full request bodies (other required storyboard fields, the image endpoint path) are in the reference at app.boords.com/api-docs. Read it before the first write; if you can't open it, ask the user to paste that section rather than guessing field names.

```bash
curl -s https://app.boords.com/v1/storyboards \
  -H "X-API-KEY: $BOORDS_API_KEY" -H "X-API-CLIENT: storyboarding" \
  -H "Content-Type: application/json" -d @storyboard.json
# storyboard.json: the reference's required fields plus
# "frames": [{"label": "01", "action": "...", "sound": "VO: ...", "duration": "3.5s"}, ...]
```

**Gotchas**

- Aspect ratio is chosen at creation and the in-app import says it cannot be changed later: Portrait 9:16, Landscape 16:9, Square 1:1, Social 4:5, TV 4:3, Widescreen 1.85:1, Anamorphic 2.4:1.
- In-app Import Script reads PDF, TXT, MD, CSV and HTML (not FDX), up to 2 MB, 250 pages or 60,000 words; scripts of 100+ scenes are split into groups of up to 80 scenes. For an `.fdx`, parse it yourself and send frames ([script-and-scene-craft.md](script-and-scene-craft.md) §1).
- A duration field is a note; the animatic plays from the timing set per frame in Boords itself, so set or check it there before exporting.
- Exports (Download menu): PDF, Word `.docx`, spreadsheet `.xlsx` (optionally with images and comments), image ZIP and animatic MP4 (both processed in the background and emailed), Google Slides images. The MP4 carries frame timing, added voiceover or audio, and subtitles; an After Effects export carries timings and audio for animation teams.

### 5b. StudioBinder

No API in its help centre, so Claude prepares the files and the user runs the imports.

- Script: Get Started → Import Script; accepts `.fdx`, `.pdf`, `.txt`, `.fountain` and more. The script needs scene numbers so scenes stay in sync; each scene then becomes available for storyboards and shot lists. A revision goes in from the screenplay page: ⋯ → Import Screenplay, compare versions, Update Script; StudioBinder then updates the shot list and storyboard from it.
- Images: (+) Add New → Add Frames → Add Images; JPG or PNG, kept around 150 KB each. Name files by shot ID so their order is obvious.
- Aspect ratio: the ⋯ menu → Aspect Ratio.
- Out: Generate PDF (choose scenes, grid and layout) or ⋯ → Export CSV. Read the CSV back to check every shot arrived.

### 5c. Toon Boom Storyboard Pro

Desktop app for animation boards. Claude prepares the script and images and can write scripts for the app; the artist draws.

- From Final Draft: File → New From Final Draft Script. Scene Heading makes scenes (or sequences when the script also has Shot elements), Action makes a new panel with the text in Action Notes, Character, Dialogue and Parenthetical go to the Dialogue caption, Transition makes a transition. Options: Combine successive elements, Include Element Number. Expect to merge or split panels by hand. Final Draft 7 or older needs an XML export via Tagger first.
- Script into captions of an existing project: in the Storyboard view menu, Import Caption (`.txt`, `.rtf`) or Import Final Draft Script (`.fdx`).
- Images straight into panels: File → Import → Images as Scenes reads names like `<Project>-A<act>-S<scene>-P<panel>-L<layer>.png` (`RocketRodeo-A1-S103-P1-LBackground.png`; `E#` for an end scene is optional). No spaces in names; use underscores. Name AI keyframes this way and they land in the right panels.
- Scripting: Qt Script (very similar to JavaScript), or in batch on a project: `StoryboardPro -scene Project.sboard -batch -compile Script.js`. Read any third-party script before running it.

### 5d. Storyboarder

Free, open-source drawing app from Wonder Unit (Mac, Windows, Linux) with dialogue, action, timing and shot-type fields per board, Fountain support, Photoshop integration, and export to Premiere, Final Cut and Avid, PDF contact sheets and GIFs. The latest stable release is v2.1.0 (September 2020; v3.0.0, February 2021, is marked pre-release), so check it runs on the user's OS before recommending it.

### 5e. Agent Storyboard MCP

If the session exposes storyboard-app tools (for example the Agent Storyboard MCP: `open_storyboard`, `create_storyboard_project`, `list_storyboard_projects`, `get_storyboard_project`, `update_storyboard_project`, `delete_storyboard_project`):

- Build the complete shot list first, then create the project in **one** call with title, aspect ratio and all shots. Do not create shots one at a time.
- Each shot carries: A-roll/B-roll, media type (image/video), duration, dialogue, a concrete visual prompt, generator (manual footage, image generation, code-rendered motion, programmatic video) and notes (edit, pacing, transition).
- Find projects with the list call and a title query; fetch a full project only when you need shot IDs or contents. Update in one call (append, update by ID, delete by ID).
- Do not invent timestamps before a voice track exists: use duration 0 and a note "duration set after recording"; with an aligned voice timeline, derive seconds from phrase boundaries.
- Deleting a project removes its media permanently: ask for explicit confirmation immediately before the delete call.
- Return the project URL and a short summary instead of repeating the whole table in chat.
- If the tools are not connected, say so; do not edit the app's data files directly.

## 6. Handoff to production

**Animatic out: pick a route**

| Board lives in | Export | Opens in |
|---|---|---|
| Whatever the editor already uses | Ask the editor which format they want | Their editor |
| Boords | Animatic MP4 (timing, audio, subtitles), or the image ZIP | Any player or editor |
| Storyboard Pro | File → Export → EDL/AAF/XML. XML: Final Cut Pro and Premiere, full fidelity. AAF: Avid, Premiere, Vegas; some slide and wipe transitions are converted. EDL: Final Cut Pro 7, Avid, Premiere; only the first four audio tracks, and a sound reused several times appears once | Editor timeline with panel clips |
| Storyboarder | Premiere, Final Cut or Avid export | Editor timeline |
| Photoshop panels | Render Video ([shot-lists-and-boards.md](shot-lists-and-boards.md) §7) | Any player |

Premiere imports Final Cut Pro 7 XML with File → Import (Adobe says a Final Cut Pro X `.fcpxml` must be converted first) and also reads AAF; Adobe says EDLs work best for simple timelines (one video track, two stereo audio tracks, no nested sequences), so prefer XML. Cutting, timing and delivering the animatic or final film belongs to **ai-video** (`references/footage-editing-ffmpeg.md`, `references/delivery-qa.md`).


A board is ready to hand to generation (see the **ai-video** super skill for running models, stitching and rendering) when:

- Locks are recorded: model and version, aspect ratio, clip length limits, deliverable.
- Every shot has job, source, duration, start/end state, camera, light, sound, risk band and a prompt file.
- Identity strings, sheets, plates and the style lock exist and are referenced by ID.
- Red-risk shots are split or restaged.
- The prompt log template is in place so every attempt is recorded.
