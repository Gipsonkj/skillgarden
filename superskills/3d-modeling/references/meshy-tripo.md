# Meshy and Tripo: commands, costs, rigging

> Distilled from: meshy-3d-generation and its setup, pipelines and delivery references (meshy-dev/meshy-3d-agent, MIT); threejs-3d-generator and its API notes and Three.js integration reference (majidmanzarpour/threejs-game-skills, MIT).

Vendor specifics for the hosted route in [generative-3d.md](generative-3d.md). Both call only the vendor's official API with the user's own account, and every generation costs paid credits: show the plan and estimate and get a yes before the first paid call. Versions, prices and model names below are as of the sources (mid 2026); check the vendor's current docs before relying on them.

## Meshy (official CLI)

**Runner and login**
- Use an installed `meshy` CLI, or the pinned package: `npm exec --yes --package=meshy-cli@0.4.0 -- meshy ...`. Pin the version; it is Meshy's own npm package.
- Log in with `meshy auth login --device`: show the verification URL and code to the user, wait for that same session to finish, then check `meshy auth status`. The browser approval stays with the user. An existing `MESHY_API_KEY` in the environment also works and takes priority over a browser login.
- Never print tokens, device codes or signed URLs; never read or copy the credential file.
- Add `--output-schema v1 --format json --no-update-check` to business commands and read the JSON, not progress text.

**Cost first**
```bash
meshy make "MODEL_DESCRIPTION" --dry-run --output-schema v1 --format json --no-update-check   # estimate, spends nothing
meshy balance --output-schema v1 --format json --no-update-check
```
The dry run covers text-to-model and image-to-model chains; for other stages quote the published price list (docs.meshy.ai) with the date. After a task finishes, report `consumed_credits` or say "unknown". Exit code 9 means insufficient credit: stop.

**Pick the route**

| Want | Command |
|---|---|
| Model from text | `text-to-3d create --mode preview`, then `--mode refine --preview-task-id ID` only if texture is wanted |
| Model from a photo | `image-to-3d create --image-url PATH --should-texture true --enable-pbr true` |
| Low-poly on a budget | `image-to-3d --model-type smart-topology --target-polycount N` (100 to 15,000 triangles) |
| Several consistent views | `multi-image-to-3d create --image-urls "FRONT,SIDE,BACK"` |
| LOD chain or poly budget | `remesh create --input-task-id ID --target-polycount N`, once per level; never regenerate |
| New look | `retexture create --input-task-id ID --text-style-prompt "..."` |
| Other format or real size | `convert create --target-formats fbx,obj`; `resize create --resize-height 0.15` (metres) |
| Rig a humanoid | `rigging create --input-task-id TEXTURED_ID --height-meters 1.7` (textured, A or T pose, at most 300,000 faces); walking and running clips come with it |
| Custom clip | `animation-catalog list --search wave`, then `animate create --rig-task-id ID --action-id ID` |

**Lifecycle**
1. `create ... --async` once; read `result.submission.task_id`.
2. `meshy project init --root ROOT --name JOB --task-id ID --task-type RESOURCE` to keep the lineage.
3. `meshy RESOURCE wait ID --timeout 600 --project DIR`: it polls for you. Say what is running; a timeout (exit 8) is not a failure, run the same wait again.
4. Download only what's needed: `meshy download --task-json DIR/task_ID.json --list`, then `--model-format glb --output PATH` (or `--asset thumbnail.primary` for the free preview). Expired URLs: `meshy download --resource RESOURCE --task-id ID`; don't regenerate.
5. Hand over the file path in backticks, the preview (or "no preview"), the task IDs and project folder, and the credits used.

For printing, Meshy has a separate printing skill (meshy-3d-printing); hand the whole job to it or to [3d-printing.md](3d-printing.md).

## Tripo (official API)

- Base URL `https://api.tripo3d.ai/v2/openapi`, bearer auth with `TRIPO_API_KEY`. Create with `POST /task`, poll `GET /task/:id`. Final states: `success`, `failed`, `banned`, `expired`, `cancelled`, `unknown`. Download URLs expire within minutes.
- Task types: `text_to_model`, `image_to_model`, `multiview_to_model`, `texture_model`, `stylize_model` (voxel, LEGO-like and others), `conversion` (format, `face_limit`), `highpoly_to_lowpoly`, `animate_prerigcheck`, `animate_rig`, `animate_retarget`.
- The original skill's Python CLI (`threejs_3d_asset.py`) wraps all of this with checkpoints that record task IDs immediately and never auto-retry paid submissions; use it rather than hand-rolled calls when available (see "Go deeper").

**Rigging rules learned the hard way (June 2026 measurements in the source)**
- Generate characters as one fused mesh: keep `quad` and `generate_parts` off (parts disable texturing; quad forces FBX).
- Run `animate_prerigcheck` first (free); use its detected `rig_type`. `riggable=false` means regenerate with a clearer pose.
- Humanoids rig with `v1.0-20240301` (anatomical skeleton with twist bones); creatures with `v2.5-20260210`. The v2.x limb-chain rigger produced asymmetric skeletons on every humanoid test mesh.
- Validate the skeleton before paying for animations: left and right limb chains present with matching depth (5/5 or 6/5 is healthy; 9/4 or a 1-bone leg is broken). Auto-rigging is nondeterministic: retry the rig task before regenerating the model.
- `animate_retarget` takes the **rig** task ID. v1.0 rigs: one preset per task, `--out-format fbx` (the GLB bake of v1.0 retargets collapses limbs), and omit the model version. v2.5 creature rigs export GLB fine and batch up to 5 presets (returned as `NlaTrack`, `NlaTrack.001`... in request order).
- Never set `animate_in_place`: it corrupts the bake. Keep root motion and strip the root translation in the engine.
- Observed costs in the source (June 2026, check current pricing): prerigcheck 0, rig about 25, retarget about 10 per clip, detailed text-to-model about 30 credits. Out of credit returns HTTP 403 code 2010: stop and tell the user.

## Bringing results into Three.js

- Load GLB with `GLTFLoader`; FBX clips from v1.0 retargets with `FBXLoader`, or convert FBX to GLB offline in Blender.
- Normalise scale and centre from the bounding box once, then fix it in the asset (Blender or glTF Transform) rather than in runtime code.
- Map batched clips by index and rename them after import.
- Check clip names and counts in `gltf.animations` before wiring a mixer; playback itself is the motion-animation craft's job.
- Keys and generation calls never go into browser code. Generate offline, ship files.

## Checklist

- [ ] Estimate, balance and plan shown; user approved the spend
- [ ] Login via the vendor's flow or env key; nothing secret printed
- [ ] One submission per stage; task IDs kept; waits resumed, not resubmitted
- [ ] Preview looked at; character pose checked before rig; rig validated before clips
- [ ] Files downloaded promptly; credits used reported
