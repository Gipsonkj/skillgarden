# Higgsfield CLI (vendor-specific, paid)

> Distilled from: higgsfield-brandkit and higgsfield-youtube-thumbnail (higgsfield-ai/skills, MIT).

Use only when the user has (or wants) a Higgsfield account and asks for it. It is a paid, credit-based service. Everything else in this skill works without it.

## Setup (only with the user's permission)

- The vendor's install method pipes a remote shell script into `sh`. Do not run that on your own initiative: show the user the command from Higgsfield's official docs and let them run it, or get an explicit yes first.
- If `higgsfield account status` reports not authenticated or expired, ask the user to run `higgsfield auth login` themselves. Never handle their credentials.
- Model catalogs change: check a model's live contract before paid calls (`higgsfield model get <model> --json`).

## Command shape

| Operation | Command |
|---|---|
| Inspect a model | `higgsfield model get <model> --json` |
| Generate and wait | `higgsfield generate create <model> --prompt "..." --aspect_ratio 16:9 --resolution 4k --wait --json` |
| Long prompt safely | `higgsfield generate create <model> ... --wait --json < prompt.txt` |
| Resume a job | `higgsfield generate wait <job_id> --json` |
| Upload a file | `higgsfield upload create <path> --json` (local `--image` paths are auto-uploaded) |

Repeat `--image` once per reference; a completed job ID can be used as an `--image` input (reference prior outputs by ID instead of re-uploading). When 2+ references are passed, start the prompt with a manifest line: `IMAGE REFERENCES: image 1 = CHARACTER 1 face; image 2 = brand logo.`

## Which model for which job (as used by the source skills)

| Job | Model role |
|---|---|
| Main thumbnail / poster render | Nano Banana Pro at 4K |
| Surgical edit of a picked render (expression only, background only) | Seedream (v5 pro; fall back to v4.5 high) with the picked job ID as the only image |
| Text-bearing branded social graphic, 2D → 3D logo render, mockup branding | GPT Image 2 |
| Editable vector logo candidates | Recraft (SVG output) |
| Mockup base photos | Seedream |

Ratio caveats: if a model lacks 4:5, generate 3:4 with a centred safe area and crop (see banners guide); disclose ratio changes.

## Working rules

- One prompt per concept or variant; don't use batch counts for different ideas. Cap thumbnail sessions at ~16 generations.
- Write each final prompt to a file before generating; keep job IDs private but saved for edits.
- Inspect every result before presenting (identity match, no stray text, exact baked text, readable at ~120 px). If you can't inspect, say so.
- Never pass a style-reference image of someone else's thumbnail as `--image`; analyse it, don't copy it.
- Keep text, logos and exact typography deterministic (HTML/SVG/PPTX) whenever exactness matters; the image models are for imagery.
- Deliver result URLs with short labels (`shock / close-up`), not raw JSON.

The vendor skill also ships a large local brandbook builder (state file, PPTX/PDF brandbook); it is not included here. Follow the brand-kits guide for the same workflow without the service.
