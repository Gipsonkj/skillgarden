# Generative 3D: image or text to 3D, and finishing the result

> Distilled from: img2threejs (img2threejs/img2threejs, Apache-2.0); blender-image-to-3d (majidmanzarpour/blender-game-skills, MIT); meshy-3d-generation (meshy-dev/meshy-3d-agent, MIT); threejs-3d-generator (majidmanzarpour/threejs-game-skills, MIT); scenario-blender-expert AI-mesh finisher pipeline (scenario-labs/skills, MIT); threejs-aaa-graphics-builder asset sourcing (majidmanzarpour/threejs-game-skills, MIT).

Three ways to get a 3D model from a picture or a sentence. Pick by what the user needs at the end, not by what is newest. Vendor commands are in [meshy-tripo.md](meshy-tripo.md).

## 1. Pick the route

| Route | What you get | Best for | Cost |
|---|---|---|---|
| **Hosted generator** (Meshy, Tripo, others) | A textured mesh (GLB/FBX) in minutes; optional auto-rig and clips | Props, characters, concept-to-asset, many variants | Paid credits per stage, the user's account and key |
| **Gated build in Blender from references** | A clean, measured, game-ready asset with UVs, bakes, rig and manifest | Hero assets that must match a reference, deform well, hit a budget | Time; local only |
| **Procedural rebuild in Three.js code** | A model built from primitives in TypeScript: parts named, explodable, animation-ready, no external file | Web scenes that need every part addressable; no external services allowed | Time; local only |
| **Open models run locally** (image-to-3D research models) | A mesh, quality varies | Experiments, offline or private data | GPU time; check each model's licence before commercial use |

Defaults: a quick prop or placeholder goes to a hosted generator; a hero asset that must match a reference or animate well goes to the gated Blender build (optionally starting from a generated mesh); a web scene that must stay code-only goes to the procedural rebuild.

Say what a single image cannot give you: hidden sides, true scale, exact geometry. Report inferred parts instead of presenting a guess as fact.

## 2. Spend rules for paid generation

- Generation costs credits on the user's account. Before the first paid call: state the plan (stages, formats, polycount), the estimate from the vendor's own planner or published price list with the date read, and the current balance, then ask.
- Work already approved proceeds stage by stage to the end of the agreed plan. A new cost (extra stage, second variant, rerun after a disappointing result) needs a new yes.
- Keys come from the environment or the vendor's login flow. Never print them, put them in chat, code, checkpoints or reports. Download URLs are signed and expire; download right after success.
- Submit once, keep the task ID, then wait. A timeout is not a failure; resume the same task. Never resubmit blindly after an uncertain submission; recover the ID first.
- Out of credits: stop new paid calls, keep what exists, tell the user.

## 3. Preparing the input

**Images**
- One subject, whole object visible, plain background, even light, no heavy perspective, no text or watermark. Cut out the background first (image-creation craft) if needed.
- Characters meant for rigging: full body, T-pose or A-pose, arms away from the body, legs apart, symmetric, no props or capes fusing limbs into the silhouette.
- Several consistent views (front, side, back) beat one view for shape. Generate a concept image first only when the user agrees to that extra step.

**Text prompts**
- Describe the object, material, silhouette features, style and use: "game-ready sci-fi crate, chamfered steel panels, yellow hazard stripes, strong readable silhouette, PBR materials, centred pivot, no text".
- Say the budget: low-poly target or face limit, texture resolution, format.

## 4. Check what came back

1. Look at the rendered preview (thumbnail) with your image reader before anything else. Is it the right subject, complete, textured when texture was asked for? A thumbnail says nothing about topology, watertightness or polycount; don't imply it does.
2. Inspect the file: triangle count, materials, texture sizes (`npx @gltf-transform/cli inspect model.glb`), scale and orientation in a viewer.
3. For characters, check the pose before paying for a rig, and validate the skeleton before paying for animations.
4. Report task IDs, settings, files, actual credits used (or "unknown"), and what was not checked.

## 5. Finishing a generated mesh (Blender)

Generated meshes are usually dense, triangulated, with baked-in lighting and messy UVs. To turn one into a production asset:

1. **Audit** with `scripts/scenario-blender-expert/bx_audit.py`: non-manifold edges, loose parts, flipped faces, self-intersections, triangle count.
2. **Clean:** merge by distance, remove loose bits, recalculate normals, fix scale (1 unit = 1 m) and pivot (ground contact), apply transforms.
3. **Retopologise** to the budget: controlled Decimate for rigid props, a hand-planned or remesh-and-shrinkwrap topology for anything that deforms (see [game-assets.md](game-assets.md)).
4. **UV and bake** from the generated mesh as the high poly onto the new low poly: normal, AO, base colour.
5. **Repaint** base colour where lighting is baked in (dark undersides, highlights); generated textures often carry fake shadows.
6. **Export** through [gltf-pipeline.md](gltf-pipeline.md).

A generated mesh is a static mesh: it has no skeleton however good it looks. Rig it (vendor auto-rig, or [game-assets.md](game-assets.md)) before promising animation.

## 6. Gated build from references in Blender

When the asset must match a reference closely:

1. **Brief from the images:** category, views (orthographic sheets for measuring; perspective concepts for detail only), real scale with evidence, 8 to 15 proportions to check, parts and pivots, materials by role, what is inferred, target engine and budget.
2. **Calibrate:** reference images as planes at real scale, a ruler at the target height, the game camera.
3. **Blockout, then forms, then topology, then UVs and bakes, then rig, then export**, each in a numbered re-runnable script.
4. **Gate every phase** with renders from the reference camera compared to the reference: silhouette overlap (IoU) at least 0.85 at blockout and 0.90 at forms, proportions within 5 percent then 2 percent. Write mismatches as measurements ("head 12 percent too tall"), fix constants, re-render.
5. **Deliver** with compare sheets, remaining deviations and the list of inferred parts.

The full pipeline with its scripts (calibration, compare sheets, bake, export with manifest) is the original blender-image-to-3d skill; see "Go deeper" in the router.

## 7. Procedural rebuild in Three.js (image to code)

For a code-only model built from a reference image:

1. **Analyse** the image: classify the object, decompose macro to meso to micro, map part relationships, name materials in PBR terms, list identity-defining features, flag what the view hides.
2. **Write a spec before code:** component hierarchy, primitive per part (lathe, extrude, tube, custom buffer), materials, pivots, sockets, a triangle budget and the 3 to 5 features that make it recognisable.
3. **Build pass by pass:** blockout, structure, form, material, lighting, interaction, optimisation. Touch only the current pass.
4. **Verify each pass** with screenshots from several angles (a turntable, not one frame) compared with the reference; fail the pass if an identity feature is wrong even when the overall look is close. Left and right parts are mirror images (negate X), not rotations; flip triangle winding on the mirrored side.
5. **Stop rules:** at most 3 correction rounds per pass and 6 in total; then report what still doesn't match.
6. Ship a factory function (`createLampModel()`) returning a named `Group`, with deterministic seeds for any noise.

The original img2threejs skill adds state gates, measurement scripts and optional local vision adapters; see "Go deeper".

## 8. Pitfalls

- Spending credits before showing the user the plan and estimate.
- Rigging a model that isn't in a clean T or A pose, or isn't fused into one mesh.
- Presenting a thumbnail as proof of a good mesh.
- Shipping a 300k-triangle generated mesh to a web page without retopology or simplification.
- Baked lighting in generated textures fighting the scene's real lights.
- Assuming an open model's weights allow commercial use.

## Checklist

- [ ] Route chosen for the end use; limits of a single image stated
- [ ] Paid stages, estimate and balance shown; user said yes
- [ ] Input image or prompt prepared for the route
- [ ] Preview looked at; file inspected; task IDs and credits reported
- [ ] Mesh cleaned, at budget, UV'd and baked before shipping
- [ ] Inferred parts and unverified properties listed
