# Game-ready assets and engine import

> Distilled from: blender-image-to-3d and its delivery-and-acceptance and rigging-animation references (majidmanzarpour/blender-game-skills, MIT); blender-director and its skill-routing reference (arjun988/blender-skills, MIT); web-3d-asset-pipeline (openai/plugins game-studio, MIT declared in plugin.json); scenario-blender-expert persona pipelines (scenario-labs/skills, MIT); threejs-aaa-graphics-builder technical-art (majidmanzarpour/threejs-game-skills, MIT).

A game-ready asset hits a budget, has clean topology where it bends, baked PBR maps, named parts, colliders, sockets, a rig when it moves, and arrives in the engine at the right size and orientation. Modelling technique is in [blender.md](blender.md); export optimisation in [gltf-pipeline.md](gltf-pipeline.md). Runtime playback of clips in Three.js is the motion-animation craft's job.

## 1. Brief before building

Answer these first; they set every later number.

| Question | Options | Sets |
|---|---|---|
| Role | Hero, standard, background | Triangles, texture size |
| Target | PC, console, mobile, web | Budget tier |
| Moves? | Static, rigged, animated | Topology, rig, clip list |
| Engine and format | Unity, Unreal, Godot, Three.js; GLB or FBX | Export settings |
| Pivot | Floor, grip, hinge, centre | Origin placement |
| Game camera | Distance, angle, on-screen height in pixels | How much detail is worth modelling |

Write a short production brief with these, the style, the pipeline phases and the budget, and show it before modelling.

## 2. Budgets (starting planning ranges, not guarantees)

| Asset | LOD0 tris | LOD1 / LOD2 | Textures | Material groups |
|---|---|---|---|---|
| Hero character | 60 to 100k | 15 to 30k / 5 to 10k | 2k set; 4k only for a proven close view | 3 to 6 |
| Standard character or enemy | 20 to 35k | 8 to 15k / 2 to 5k | shared 1 to 2k | 1 to 3 |
| Player vehicle | 60 to 120k | 20 to 40k / 5 to 10k | 2k body, shared parts | 3 to 6 |
| Traffic or prop vehicle | 10 to 25k | 4k / 1k | shared atlas | 1 to 2 |
| Architecture module | 0.5 to 5k per piece | silhouette variants | tiles plus trim sheet | 1 to 2 |
| Small prop | 0.3 to 3k | 0.1 to 1k | shared atlas 1 to 2k | 1 |
| Hero weapon | 10 to 30k | 3k / 1k | 2k unique | 1 to 2 |
| Environment piece | 2 to 20k | 0.5 to 5k / 0.2 to 1k | tileable plus detail normal | 1 |

Mobile and web sit at the low end or below. Engine vertex counts exceed Blender's because UV and normal seams split vertices: record the engine's numbers. Profile the worst realistic scene (crowd, effects), not one asset alone.

## 3. Topology, UVs, LOD

- Loops where the mesh bends (shoulders, elbows, knees, mouth), creases or changes material. Rigid parts can use controlled Decimate; hero faces, hands and hinges get deliberate loops. A uniform remesh of a sculpt is not deformation topology.
- Quads in the source, triangulated delivery; lock the triangulation before baking so shading doesn't shift.
- Cleanup: merge doubles, remove stray islands and zero-area faces, fix flipped normals. Open boundaries are fine on cloth, hair cards and decals; colliders must be closed.
- UVs: seams where they hide; unique space for faces and hero surfaces; trim sheets and tiling for large repeated surfaces; atlases for small props. One texel density per asset family (a 2k map over a 1.8 m character is about 1100 px per metre). Check padding at the lowest mip.
- LODs: keep head, shoulder, weapon, wheel and doorway silhouettes; drop small ornaments and merge material groups first. Tune transitions by screen size and check them in motion.

## 4. Bake and texture contract

- Bake high to low: normal, AO, plus base colour, roughness, metallic from the authored materials. Settings that hold up: cage extrusion about 1 percent of asset height, ray distance 2 to 3 percent, 16 px margin at 2k. Bake by named groups where projections cross (teeth, layered garments); keep glass and visors out of the bake sources.
- Default set per material: base colour (sRGB), tangent-space normal (Non-Color; OpenGL +Y green, flip green for DirectX engines such as Unreal and record it), roughness, metallic (only where there is metal), AO (optional), emissive (only where needed).
- Channel packing (ORM, MRA) is engine-specific: define it per engine and keep unpacked masters. glTF packs occlusion, roughness, metallic as R, G, B.
- Never bake directional lighting into base colour. Inspect normal bakes under a moving light.

## 5. Naming, colliders, sockets

- Prefixes: `CH_` character, `CR_` creature, `VH_` vehicle, `PR_` prop, `WP_` weapon, `AR_` architecture, `EN_` environment. Parts `CH_Knight_Body_LOD0`, bones `DEF-upper_arm.L`, sockets `SOCKET_hand.R`, colliders `COL_torso` (Unreal expects `UCX_` for convex collision), cutters `CUT_window`. No `.001` suffixes anywhere that ships.
- Colliders: simple closed proxies (boxes, capsules, convex hulls) independent of the visual mesh.
- Sockets: empties parented to the bone or part they follow, local +Y forward and +Z up for whatever attaches. Test each with its real attachment through the real animation.
- Pivots at hinges, wheel axles, door lines and turret rings.

## 6. Rigs and clips

- Keep control rig and deformation skeleton apart; ship only the deformation bones (`DEF-` prefix makes export filters trivial). Bake IK and constraints into the deform bones for delivery.
- One root at the ground origin, a recorded rest pose (A-pose or relaxed T-pose), no negative or mirrored scale, scale applied before binding.
- Weights normalised, four influences per vertex as the delivery target, rigid armour on one bone. Fix deformation in this order: joint placement, topology, weights.
- Never apply an Armature modifier as cleanup.
- Clips as individually named actions with deliberate ranges and a loop flag; events (hit, footstep, release) as pose markers converted to seconds. In-place locomotion tagged with its speed; root motion only if the game uses it.
- Minimum library by role: player (idle, locomotion in four directions, starts and stops, attack, dodge, hit, death), melee enemy (idle, move, attack anticipation, active, recovery, hit, death), vehicle (idle, suspension, doors; wheels spun by code), interactable (open, close, active, break).

## 7. Validate and export

```bash
blender -b --factory-startup --python scripts/blender-image-to-3d/validate.py -- \
  --blend PR_Lamp/PR_Lamp_master.blend --collections LOW,COLLISION,SOCKETS \
  --out PR_Lamp/review/validate.json --budget-tris 3000 --require-uv
```

`validate.py` fails (exit 1) on negative scale, unweighted or over-influenced vertices, open colliders, a blown triangle budget or missing UVs, and warns on unapplied transforms, doubles, loose geometry, n-gons, zero-area faces and `.001` names. Pass your own collection names.

Export an explicit selection (meshes, deform bones, sockets, colliders, intended clips) as GLB or FBX, then round-trip it with `scripts/blender-image-to-3d/roundtrip.py` (see [gltf-pipeline.md](gltf-pipeline.md)) and compare counts, bones, clip lengths and height with what you meant to ship.

## 8. Engine import notes

| Engine | Format | Watch for |
|---|---|---|
| Unity | GLB/glTF via a glTF importer package, or FBX (FBX for the Humanoid avatar workflow) | 1 unit = 1 m; check scale factor and forward axis on import; set up materials for the project's render pipeline |
| Unreal | FBX (glTF import exists too) | Centimetres: verify scale; `UCX_` colliders; DirectX normal maps (flip green) |
| Godot | glTF/GLB preferred | Import settings per file; colliders via naming suffixes or import options |
| Three.js / Babylon.js / PlayCanvas | GLB | Loader decoders for the compression used; see [threejs-scenes.md](threejs-scenes.md) |

Then import into a clean project of the target engine, view at the game camera under the game's lighting, and play every clip with the real attachments. Record the engine's measured counts.

## Checklist

- [ ] Production brief with role, target, budget, pivot, engine and camera shown before modelling
- [ ] Topology loops where it deforms; triangulation locked before bake; LODs keep silhouettes
- [ ] Baked maps with stated colour spaces, normal convention and packing
- [ ] Names, colliders, sockets and pivots per convention; no `.001`
- [ ] Rig clean (deform bones only, weights normalised, 4 influences); clips named with events
- [ ] `validate.py` exit 0, round trip matches, engine import checked at the game camera
