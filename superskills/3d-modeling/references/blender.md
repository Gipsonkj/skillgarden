# Blender: scripting, Blender MCP, modelling, materials, lighting, rendering

> Distilled from: scenario-blender-expert and its bpy-reliability and blender-5.2-deltas references (scenario-labs/skills, MIT); blender-image-to-3d and its blender-5-notes and delivery references (majidmanzarpour/blender-game-skills, MIT); blender-director (arjun988/blender-skills, MIT); blender-web-pipeline (freshtechbro/claudedesignskills, MIT). Plus general knowledge of the Blender Python API.

Blender work is a loop, not one big script: build big to small, and at every stage render the model, measure it and fix it before adding detail. Export to GLB and glTF optimisation are in [gltf-pipeline.md](gltf-pipeline.md); game budgets, rigs and engine import in [game-assets.md](game-assets.md).

## 1. Pick the execution channel

| Channel | Use for | Rules |
|---|---|---|
| Live Blender over an MCP bridge | Interactive work: real sculpt or paint brushes, weight painting, viewport screenshots, the user watching | One short, idempotent script per call that returns a compact result dict. Get-or-create by name. Never touch objects you did not create. Save a stage backup after each stage. |
| Headless `blender -b` | Renders, audits, batch export, anything when no bridge is up | `blender -b [file.blend] --factory-startup --python-exit-code 1 -P script.py -- args`. Print a final machine-readable `RESULT ...` line. |

- **BlenderMCP** (the ahujasid add-on and server most Blender skills use) sends an anonymous usage record by default. Set `DISABLE_TELEMETRY=true` in the server's environment before first use, and tell the user. Other bridges exist (the official Blender Lab MCP, Qwen and CLI-Anything ports); read their docs for telemetry before installing.
- Always pass `--factory-startup` headless: without it the user's add-ons load, and some make network calls.
- Without `--python-exit-code 1` a failing script still exits 0.
- Never open your own GUI Blender window on the user's machine; live work goes through their running session, everything else headless, one Blender process at a time.
- Resolve the binary once: `$BLENDER_BIN`, then `blender` on PATH, then `/Applications/Blender.app/Contents/MacOS/Blender` on macOS.
- Check `bpy.app.version` first. These notes target 4.2 to 5.2; most tutorials and remembered code are 2.8x to 4.1 and break (section 3).

## 2. The expert loop

1. **Brief in numbers.** Purpose (still, film, web, game engine, print), budgets (tris, texture size, frame range), style, references, real-world size. Write it down; choose a documented default when the user is silent (1 unit = 1 m, Z up, subject facing -Y, GLB out).
2. **Plan stages.** Blockout, forms, detail, topology, UVs, materials, lighting, render or export. Never start with detail.
3. **Build one stage** with the smallest scripts that do it. Keep each stage in a numbered, re-runnable script (`build/02_blockout.py`) that deletes what it owns and rebuilds it, so reruns are safe.
4. **Gate the stage.** Run measurable checks (`scripts/scenario-blender-expert/bx_audit.py` for meshes) and render a review sheet (`scripts/scenario-blender-expert/bx_review.py`: silhouette, matcap, wire from front, side, three-quarter, low). Open the image and judge it. The review sheet is your orbit.
5. **Fix before advancing.** A problem found at blockout costs one script; after texturing it costs the stage.
6. **Deliver with evidence:** final renders, audit numbers, and what was not verified.

Never call a model, material or render done without having looked at a render of it.

## 3. Version traps that break remembered code

| Change | Since | Do this |
|---|---|---|
| Positional context dicts to operators removed | 4.0 | `with bpy.context.temp_override(object=ob, active_object=ob, selected_objects=[ob]):` |
| Principled BSDF v2: sockets renamed | 4.0 | Address inputs by name (`Emission Color`, `Emission Strength`, `Coat Weight`, `Transmission Weight`, `Specular IOR Level`). Emission Strength defaults to 0. |
| Colour space `Linear` renamed, `Raw` gone | 4.0 | `Linear Rec.709`; data maps (normal, roughness, metallic, AO) are `Non-Color` |
| AgX replaces Filmic as default view transform | 4.0 | Pick one view transform for a look and keep it for every comparison. `Standard` keeps saturated painted colours closer; AgX desaturates them. |
| OBJ/PLY Python importers removed | 4.0 | `bpy.ops.wm.obj_import`, `wm.ply_import`; Collada removed in 5.0 |
| Auto Smooth removed | 4.1 | `shade_smooth()` plus Smooth by Angle; voxel remesh output is flat until `shade_smooth()` |
| EEVEE id | 4.2 to 4.5 `BLENDER_EEVEE_NEXT`; 5.x `BLENDER_EEVEE` | Try both in `try/except TypeError` if the script must run on both |
| Most bundled add-ons moved to extensions | 4.2 | glTF, FBX, Cycles stay bundled; Node Wrangler and Rigify must be enabled |
| Brushes are assets; brush size is a diameter | 4.3 / 5.0 | `bpy.ops.brush.asset_activate(...)`; brush strokes fail headless and need a GUI session |
| Slotted actions; `action.fcurves` removed | 4.4 / 5.0 | `bpy_extras.anim_utils.action_get_channelbag_for_slot(action, slot)` |
| Compositor is a node group | 5.0 | `scene.compositing_node_group`, not `scene.node_tree` |
| Video output | 5.0 | Set `image_settings.media_type = 'VIDEO'` before `file_format = 'FFMPEG'` |
| Materials always use nodes | 5.0 | Don't set `use_nodes`; guard with `bpy.app.version < (5, 0, 0)` |
| Geometry Nodes modifier inputs | 5.2 | `getattr(mod.properties.inputs, identifier).value = v`; `mod["Socket_2"]` raises |

For anything else, check the release notes for the running version before trusting an old operator, brush or property name.

## 4. bpy rules that keep scripts reliable

**Launch and structure**
- Parse script args after `--`. Wrap the body in `main()`; let exceptions propagate.
- Render flags in order: file, `-P`, `-E`, `-o`, `-F`, then `-f N` or `-a` last (a later `-o` is ignored).
- Headless has no 3D View area, no timers, no modal operators and no undo. `view3d.*` operators fail poll there.

**Data API before operators**
- Operators take no data arguments, fail on poll and are slow in loops (600 `primitive_monkey_add` took 4.2 s; 600 `objects.new` plus link took 0.015 s). Use `bpy.data` and bmesh; call an operator only when no data API exists, after checking `op.poll()`.
- Never assign `bpy.context.*`; set `view_layer.objects.active = ob` and `ob.select_set(True)`.

**References and names**
- Keep the object `new()` returns; the name you asked for may come back as `Name.001`.
- Re-fetch references after `mode_set`, bulk adds, undo or `remove()`.
- Iterate over `bpy.data.objects[:]` copies when the loop renames, links or removes.
- Tag owned data (`ob["agent_task"] = 1` or one owned collection) so reruns find and replace it.

**Mesh and evaluation**
- Build meshes with `me.from_pydata(verts, [], faces)` then `me.validate()`, or bmesh then `to_mesh()` and `free()`.
- BMesh: `ensure_lookup_table()` before indexing, `index_update()` after adding, `normal_update()` after moving vertices by hand. Guard topology walks with a step cap.
- `obj.data` ignores modifiers. Measure what renders through `obj.evaluated_get(depsgraph).to_mesh()` and always `to_mesh_clear()`.
- `matrix_world` is stale after moving things until `view_layer.update()`.
- Bulk vertex data: `foreach_get`/`foreach_set` with float32 numpy arrays on `mesh.attributes["position"]` (0.1 ms vs 105 ms for a Python loop on 491k vertices).
- Copy mathutils values you keep (`.copy()`); they are live references.

**Persistence**
- Datablocks with 0 users are not saved. Link new collections (`scene.collection.children.link(c)`) and objects into a collection in the view layer.
- Save with an absolute path, reopen and assert counts when the output matters.
- After a rerun, `bpy.data.orphans_purge(do_recursive=True)` should remove nothing new and no owned name should have a `.001` twin.

## 5. Modelling stages

| Stage | What goes in | Gate |
|---|---|---|
| Blockout | Primary masses as simple volumes; appendages (hands, doors, wheels) as separate rough objects; pivots and joint centres placed now | Silhouette and proportions from the reference camera; scale against a ruler object at real size |
| Forms | Secondary forms: panel breaks, armour, cloth masses. Organic: voxel remesh a fused base (about 1/200 of the height) and shape it. Hard surface: extrude, loft, spin, bevel with real panel gaps | Clay turntable; silhouette still matches the blockout |
| Detail | Tertiary detail last, only at a scale that survives the texture size and camera | Close-up renders |
| Topology | Clean low poly over the forms: loops where it bends, creases or changes material. Quads in source, triangulated delivery | `bx_audit.py`: n-gons 0 on anything subdivided, deformed or exported; studio character retopo sits at 99.9% quads; valence-6 poles are almost always a mistake |
| UVs | Seams where construction hides them; one texel density per asset family; checker render at joints | Checker render clean |

Keep the master non-destructive: modifiers live on the master and are applied only on the delivery copy. Keep negative and mirrored scale out of every hierarchy; apply scale and rotation on delivery meshes.

Naming that survives export: `PR_Lamp_Body_LOD0`, `MAT_PaintedSteel`, `COL_Body` for colliders, `SOCKET_hand.R`, collections like `REF`, `HIGH`, `LOW`, `EXPORT`. No `.001` names in anything that ships.

## 6. Materials

- Get-or-create: `mat = bpy.data.materials.get(n) or bpy.data.materials.new(n)`. Find nodes by type (`n.type == "BSDF_PRINCIPLED"`), never by display name (names are translated in non-English UIs).
- Set inputs by name; add nodes with `nt.nodes.new("ShaderNodeTexNoise")`; link by socket name. On multi-type nodes (Mix) use socket identifiers.
- Image textures: colour maps sRGB, data maps `Non-Color` (set it before writing pixels).
- Start from a role (painted steel, worn leather, glass, skin) with a roughness range that matches it. Edge wear follows construction and contact, not a white outline on every edge. Never bake directional lighting into base colour.
- Metals need an environment to reflect; a black metal render is usually missing lighting, not a bad material.
- Procedural node materials don't survive glTF export. Bake them to image maps first (base colour, normal, roughness, metallic, AO) for web or engine delivery; see [game-assets.md](game-assets.md) for bake settings.
- Matching a painted concept: sample the median sRGB of the same region in the reference and a render under fixed review lights, and adjust albedo until they agree. Test one hypothesis at a time on a small render border.

## 7. Lighting and rendering

- **Lights:** a key that defines form, a fill that keeps the shadow side readable, a rim to separate the subject from the background, plus an HDRI world for reflections. For product shots, a large soft key and a reflector card read cleaner than many small lights.
- **Engines:** Cycles for final stills and accurate glass, metal and GI; EEVEE for fast previews and stylised work; Workbench for review sheets (no GPU needed). EEVEE can't shade Principled Hair; give such materials separate EEVEE and Cycles outputs.
- **Colour management:** AgX by default; `Standard` for painted or brand-exact colours. Pick it once per project.
- **Apple Silicon Cycles:** enable only the METAL device. Adding the CPU made frames about twice as slow in the source tests.
- **Animation renders:** `render.use_persistent_data = True` when only the camera or a few objects move. Write numbered frames and skip frames that exist, so a long render can be stopped and resumed; encode with ffmpeg at the end.
- **Turntable:** `bx_review.turntable(obj, "/abs/out/turn.mp4", frames=72)` for a quick Workbench spin; a final Cycles turntable is a camera on an empty rotating 360 degrees over the frame range.
- CLI render example: `blender -b scene.blend --factory-startup --python-exit-code 1 -P setup.py -E CYCLES -o /abs/out/frame_#### -F PNG -f 10`.

## 8. Bundled scripts

| Script | Does | Run |
|---|---|---|
| `scripts/scenario-blender-expert/bx_audit.py` | Quads %, n-gons, poles, non-manifold, loose, duplicates, flipped faces, self-intersections, boundary loops, symmetry %, fidelity to a high poly; `verdict(report)` lists problems | `blender -b f.blend --python bx_audit.py -- --object Name [--high Sculpt] [--json out.json]`, or `import bx_audit` in a live session |
| `scripts/scenario-blender-expert/bx_review.py` | Contact sheet (silhouette, matcap, wire, normals) from fixed views in a temporary scene; `playblast`, `turntable` | `blender -b f.blend --python bx_review.py -- --objects A,B --out /abs/dir [--views front,right,threequarter] [--modes silhouette,matcap,wire]` |
| `scripts/blender-image-to-3d/validate.py` | Pre-export checks: negative scale, unapplied transforms, doubles, n-gons, `.001` names, missing UVs, weights, open colliders, tri budget; exit 1 on FAIL | See [game-assets.md](game-assets.md) |
| `scripts/blender-image-to-3d/roundtrip.py` | Imports a GLB or FBX into a blank Blender, reports what arrived, renders a clay frame | See [gltf-pipeline.md](gltf-pipeline.md) |

In a live session: `import sys; sys.path.append("<craft>/scripts/scenario-blender-expert"); import bx_audit, bx_review`.

## 9. Pitfalls

- Writing detail on top of wrong proportions. Silhouette first, always.
- Trusting the viewport: an object hidden only with `hide_render` still shows in the user's viewport. Hide helpers for both.
- `bpy.data.node_groups["Geometry Nodes"]` returns the first group, not the one you just made; take `obj.modifiers[-1].node_group`.
- Brush strokes and `paint.mask_flood_fill` headless: they fail poll or crash Blender. Use a GUI session or edit mesh data directly.
- Applying an Armature modifier as "cleanup": it bakes a pose and breaks the rig.
- Copying export snippets with removed parameters: check the running exporter's options with `bpy.ops.export_scene.gltf.get_rna_type().properties.keys()`.

## Checklist

- [ ] Version checked; channel chosen; BlenderMCP telemetry disabled if used
- [ ] Brief in numbers written; stages planned
- [ ] Each stage scripted, idempotent, gated by an audit and a review sheet you looked at
- [ ] Master non-destructive; delivery copy has applied transforms and clean names
- [ ] Materials by role, data maps Non-Color, procedural materials baked before export
- [ ] Final renders, numbers and unverified items reported
