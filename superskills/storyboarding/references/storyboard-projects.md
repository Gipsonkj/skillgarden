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

## 5. Working with a storyboard app (MCP)

If the session exposes storyboard-app tools (for example the Agent Storyboard MCP: `open_storyboard`, `create_storyboard_project`, `list_storyboard_projects`, `get_storyboard_project`, `update_storyboard_project`, `delete_storyboard_project`):

- Build the complete shot list first, then create the project in **one** call with title, aspect ratio and all shots. Do not create shots one at a time.
- Each shot carries: A-roll/B-roll, media type (image/video), duration, dialogue, a concrete visual prompt, generator (manual footage, image generation, code-rendered motion, programmatic video) and notes (edit, pacing, transition).
- Find projects with the list call and a title query; fetch a full project only when you need shot IDs or contents. Update in one call (append, update by ID, delete by ID).
- Do not invent timestamps before a voice track exists: use duration 0 and a note "duration set after recording"; with an aligned voice timeline, derive seconds from phrase boundaries.
- Deleting a project removes its media permanently: ask for explicit confirmation immediately before the delete call.
- Return the project URL and a short summary instead of repeating the whole table in chat.
- If the tools are not connected, say so; do not edit the app's data files directly.

## 6. Handoff to production

A board is ready to hand to generation (see the **ai-video** super skill for running models, stitching and rendering) when:

- Locks are recorded: model and version, aspect ratio, clip length limits, deliverable.
- Every shot has job, source, duration, start/end state, camera, light, sound, risk band and a prompt file.
- Identity strings, sheets, plates and the style lock exist and are referenced by ID.
- Red-risk shots are split or restaged.
- The prompt log template is in place so every attempt is recorded.
