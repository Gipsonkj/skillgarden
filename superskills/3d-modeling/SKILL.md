---
name: 3d-modeling
description: Make and ship 3D models and scenes. Covers Blender (bpy scripts, headless runs, Blender MCP, modelling, materials, lighting, Cycles/EEVEE renders, export); Three.js scenes (renderer, cameras, PBR materials, HDR lighting, GLTF loaders) and React Three Fiber with drei; slow web 3D (draw calls, instancing, LOD); GLB optimisation (glTF Transform, Draco, Meshopt, KTX2); generative 3D (text or image to 3D with Meshy or Tripo, image to Three.js code); CAD and parametric parts (build123d, OpenSCAD, STEP, STL, 3MF); 3D printing checks, slicing and G-code with OrcaSlicer; OpenUSD, USDZ and Gaussian splats; game-ready assets (budgets, LODs, bakes, colliders, rigs) for Unity, Unreal and Godot. Triggers: "write a Blender script", "model this in 3D", "put a 3D model on my site", "optimize this GLB", "my three.js scene is slow", "turn this image into a 3D model", "design a printable bracket", "slice this STL", "convert this splat to USD". Animating a scene, clip or camera: motion-animation.
---

# 3D modeling

Covers making 3D things and getting them where they're used: modelling, materials, lighting and rendering in Blender; scenes on the web with Three.js and React Three Fiber; the GLB pipeline between them; models generated from images or text; dimensioned CAD parts and the path to a 3D printer; OpenUSD and Gaussian splats; and assets that drop into a game engine at the right size and budget. Animating scenes, clips and cameras belongs to the motion-animation craft; the web page around a canvas belongs to website-building.

## Core principles

1. **Brief in numbers before geometry.** Purpose, real-world size and units, budget (triangles, texture size, file size), target runtime and format. Write down defaults when the user is silent: 1 unit = 1 m (millimetres for CAD and print), Y up in glTF, GLB out.
2. **Big to small, gated.** Silhouette, then forms, then detail, then topology and textures. Each stage passes a render and a measurement before the next starts; detail on wrong proportions is wasted.
3. **Look at it.** No model, material, render or print file is done until you have rendered it and looked at the picture from several angles. A thumbnail or a passing script is not proof.
4. **Measure what you claim.** Dimensions, triangle and draw-call counts, file size, texture memory, frame time: report numbers with what was not checked.
5. **Scripts are idempotent and version-aware.** Check the Blender, three, R3F or build123d version first; scripts get-or-create by name, own what they make, and can be rerun safely.
6. **Fix the asset upstream.** Scale, pivots, orientation, names and materials are fixed in the source and the export, never patched in runtime code.
7. **GLB is the runtime contract.** Inspect, prune, weld, size textures to the screen, compress once (Meshopt or Draco for geometry, KTX2 for textures), round-trip and view in the target runtime.
8. **Budgets are set by the device and camera.** On the web: under about 100 draw calls, DPR capped at 2, shared materials, instancing, at most a few lights; on mobile, less. Measure in the worst view on a real target device.
9. **Paid generation needs a yes.** Meshy, Tripo and similar spend the user's credits: show the plan, the estimate and the balance, then ask. Keys never appear in chat, code or reports; submit once and resume, never resubmit blindly.
10. **Third-party tools: read before running.** BlenderMCP sends anonymous telemetry unless `DISABLE_TELEMETRY=true` is set: set it and say so. Run Blender headless with `--factory-startup`. Self-host Draco and KTX2 decoders and HDRIs in production.
11. **Never touch hardware or source files you don't own.** The agent slices but never sends to a printer; USD optimisation writes a new file, never over the source; Blender scripts only change objects they created.
12. **A single image can't show everything.** Hidden sides, true scale and exact geometry are inferred; list what was inferred instead of presenting it as fact.

## Plan the request

Work out what the request needs before opening a guide; most real requests need more than one.

1. **Split it into parts:** each thing the user needs at the end. A one-part request goes straight to the table below.
2. **Give each part its best source.** This craft's guides first; several is normal, read in the order the work happens. A part listed under "Other crafts" goes to that craft's guide, which goes deeper than any short version here. A part that needs a tool, API or edge case no guide covers goes to the original skill under "Go deeper".
3. **Say the plan in a line** before starting, then read only the guides it names. For example: "Product viewer for a shop page: `references/blender.md` → `references/gltf-pipeline.md` → `references/react-three-fiber.md` → `references/web-3d-performance.md`; slow turntable from `motion-animation` → `references/threejs-animation.md`; page budget from `website-building` → `references/performance-cwv.md`."
4. **Carry decisions forward.** The brief, tokens, copy and file names from earlier parts feed the later ones. When two guides disagree, follow the one written for that part and say so.
5. **Check the result** against "Done means" here and in every other craft you used.

**Opening another craft:** with the Skill Garden plugin, load the skill `skillgarden:<craft>` or read its guides beside this folder at `../<craft>/references/`; on the Skill Garden connector, call `get_super_skill` and `get_guide`. If that craft isn't installed, name it to the user and carry on with this one. For a request that spans three or more crafts, start with the planner: the skill `skillgarden:garden`, or `get_super_skill` with craft `garden` on the connector.

## Pick the right guide

| Task | Read |
|---|---|
| Blender: bpy scripts, headless runs, Blender MCP (telemetry off), 4.x/5.x API traps, modelling stages, materials, lighting, Cycles/EEVEE renders, turntables, mesh audit and review sheets | [references/blender.md](references/blender.md) + `scripts/scenario-blender-expert/` |
| Three.js scene: renderer, colour space, tone mapping, cameras and controls, GLTF/Draco/KTX2/Meshopt loaders, PBR and physical materials, HDR environment, lights and shadows, raycasting, disposal | [references/threejs-scenes.md](references/threejs-scenes.md) |
| React Three Fiber: Canvas, hooks, render loop, `frameloop="demand"`, useGLTF and gltfjsx, drei helpers, disposal, WebGPU | [references/react-three-fiber.md](references/react-three-fiber.md) |
| Slow, janky or memory-hungry web 3D; draw calls, instancing, LOD, DPR, mobile, lazy loading and CWV; "looks basic" polish pass and scorecard | [references/web-3d-performance.md](references/web-3d-performance.md) |
| Export from Blender to GLB, inspect and optimise with glTF Transform, Draco vs Meshopt, KTX2 vs WebP, size targets, round-trip validation | [references/gltf-pipeline.md](references/gltf-pipeline.md) + `scripts/blender-image-to-3d/roundtrip.py` |
| Image or text to 3D: choosing hosted, Blender or procedural route, spend rules, preparing inputs, checking and finishing a generated mesh, gated reference builds, image to Three.js code | [references/generative-3d.md](references/generative-3d.md) |
| Meshy CLI and Tripo API: login, estimates, routes, remesh, retexture, auto-rig and retarget rules, importing results | [references/meshy-tripo.md](references/meshy-tripo.md) |
| CAD part or assembly from a description, drawing or photo: build123d/cadgen, OpenSCAD with previews and Customizer parameters, STEP/STL/3MF/GLB export, measuring and repair | [references/cad-parametric.md](references/cad-parametric.md) + `scripts/openscad/`, `templates/openscad/parametric_box.scad` |
| Printability (overhangs, walls, holes, clearances, orientation), file choice, slicing with the OrcaSlicer CLI, checking G-code, hand-off | [references/3d-printing.md](references/3d-printing.md) + `scripts/gcode/orca_presets.py` |
| OpenUSD layers, references, payloads, variants, USDZ for AR, slow USD scenes, Gaussian splats and splat-to-USD conversion | [references/openusd-and-splats.md](references/openusd-and-splats.md) |
| Game-ready asset: brief, polycount and texture budgets, topology, UVs, LODs, bakes, naming, colliders, sockets, rigs and clip lists, validation, Unity/Unreal/Godot import | [references/game-assets.md](references/game-assets.md) + `scripts/blender-image-to-3d/validate.py` |

To use one capability directly, name the task, or say "use 3d-modeling: <capability>" (for example "use 3d-modeling: optimise this GLB for mobile").

## Bundled scripts and templates

| Path | Source (licence) | Runs in | Does | When |
|---|---|---|---|---|
| `scripts/scenario-blender-expert/bx_audit.py` | scenario-labs/skills (MIT) | Blender, headless or live | Mesh audit: quads, n-gons, poles, non-manifold, flipped, self-intersections, symmetry, fidelity to a high poly | Every topology gate; before printing or shipping a generated mesh |
| `scripts/scenario-blender-expert/bx_review.py` | scenario-labs/skills (MIT) | Blender | Silhouette, matcap, wire and normals contact sheet; playblast; turntable | Every modelling stage gate |
| `scripts/blender-image-to-3d/validate.py` | majidmanzarpour/blender-game-skills (MIT) | Blender headless | Pre-export checks with exit 1 on FAIL (scale, weights, colliders, tri budget, UVs) | Before exporting a game or web asset |
| `scripts/blender-image-to-3d/roundtrip.py` | majidmanzarpour/blender-game-skills (MIT) | Blender headless | Imports a GLB/FBX into a blank scene, reports what arrived, renders a clay frame | After every export |
| `scripts/openscad/*.sh` | mitsuhiko/agent-stuff (Apache-2.0) | Shell + `openscad` | Validate, multi-angle previews, parameter extraction, STL export | Every OpenSCAD model |
| `templates/openscad/parametric_box.scad` | mitsuhiko/agent-stuff (Apache-2.0) | OpenSCAD | Parametric box with lid and fit tolerance | Starting point for printable parametric parts |
| `scripts/gcode/orca_presets.py` | earthtojake/text-to-cad (MIT) | Python 3, no dependencies, JSON only | Lists and writes complete OrcaSlicer presets for its CLI | Before headless slicing |

Read a script's header before running it; each takes its arguments after `--` when run inside Blender.

## Other crafts

| When the request also needs | Use |
|---|---|
| Animating the scene: GLTF clips, mixers, camera moves, procedural motion, deterministic 3D for video | `motion-animation` → `references/threejs-animation.md`, `references/motion-principles.md` |
| Scroll-driven 3D or a pinned, scrubbed 3D section on a page | `motion-animation` → `references/scroll-animation.md`, `references/gsap.md` |
| Textures, concept art or a clean reference image for image-to-3D, made with an image model | `image-creation` → `references/web-frontend-assets.md`, `references/editing-references-consistency.md` |
| The page that hosts the scene: stack, Core Web Vitals budget, deploy | `website-building` → `references/performance-cwv.md`, `references/nextjs-react.md`, `references/deploy-vercel.md` |
| UI around the canvas: controls, loading and error states, accessible alternatives | `frontend-ui-design` → `references/components-and-states.md`, `references/accessibility.md` |
| A 3D viewer inside a mobile app or a phone-first web app | `app-building` → `references/expo-react-native.md`, `references/mobile-web-pwa.md` |
| A turntable or product render cut into a finished video with captions and music | `ai-video` → `references/footage-editing-ffmpeg.md`, `references/delivery-qa.md` |
| Shot planning and camera language for a rendered 3D short | `storyboarding` → `references/shot-language.md`, `references/shot-lists-and-boards.md` |
| Visual regression tests that catch a broken 3D page | `testing-qa` → `references/playwright-e2e.md` |

## Go deeper (original skills)

The guides above distil these. Open one when a part needs its full detail, read it as reference, and read any script before running it.

| When you need | Original skill |
|---|---|
| The full gated image-to-game-asset pipeline: calibration, compare sheets with IoU, bake and export scripts, manifests | [blender-image-to-3d](https://github.com/majidmanzarpour/blender-game-skills/tree/main/skills/blender-image-to-3d) (MIT; needs Blender 5.x) |
| The complete Blender 5.2 API delta list, a GUI brush driver and 12 domain skills (sculpting, retopology, rigging, geometry nodes) | [scenario-blender-expert](https://github.com/scenario-labs/skills/tree/main/skills/dcc/blender/scenario-blender-expert) (MIT) |
| cadgen's model contract, local CAD Viewer, kinematics, animated GLB and sibling skills (printability, STEP parts, Bambu hand-off) | [cad](https://github.com/earthtojake/text-to-cad/tree/main/skills/cad) (MIT; Python 3.11+ and Chromium for snapshots) |
| Image to procedural Three.js with state gates, measurement scripts and optional local vision adapters | [img2threejs](https://github.com/img2threejs/img2threejs/tree/main) (Apache-2.0; large repo) |
| Tripo's checkpointed Python CLI: character pipeline, rig and clip validators | [threejs-3d-generator](https://github.com/majidmanzarpour/threejs-game-skills/tree/main/skills/threejs-3d-generator) (MIT; paid Tripo credits, `TRIPO_API_KEY`) |
| 120+ Three.js rules including TSL, WebGPU compute, WebXR, physics and audio | [three-best-practices](https://github.com/emalorenzo/three-agent-skills/tree/main/skills/three-best-practices) (MIT) |
| A shader cookbook, authoring recipes and scorecard anchor images for a premium browser-game look | [threejs-aaa-graphics-builder](https://github.com/majidmanzarpour/threejs-game-skills/tree/main/skills/threejs-aaa-graphics-builder) (MIT) |
| NVIDIA's full USD optimisation workflow with Usd Optimize operations, validators and report templates | [omniverse-usd-performance-tuning](https://github.com/NVIDIA/skills/tree/main/skills/omniverse-usd-performance-tuning) (Apache-2.0; needs Omniverse Kit or Usd Optimize) |

## Default workflow

1. **Brief.** Purpose, size and units, budget, runtime, format, deadline for quality vs speed. Confirm any paid generation and its estimate.
2. **Choose the route.** Blender, code (Three.js, R3F, build123d, OpenSCAD), hosted generation, or a mix. State the plan in a line.
3. **Check versions and tools.** Blender, three, R3F, drei, cadgen or OpenSCAD, slicer; BlenderMCP telemetry off.
4. **Build in gated stages.** Blockout, forms, detail, topology, materials; render and measure at each gate; fix before moving on.
5. **Export and optimise.** GLB through glTF Transform, STEP/3MF for CAD and print, USD where the pipeline needs it.
6. **Integrate.** Load in the target runtime with the right decoders, or slice for the user's printer, or import into the engine.
7. **Verify.** Renders from several angles, counts against the budget, round trip, target device or slicer preview.
8. **Report.** Files and paths, numbers, credits spent, what was inferred, what wasn't checked.

## Done means

- [ ] Brief with units, size, budget and target stated; assumptions and inferred parts listed
- [ ] Every stage gated by a render you looked at and a measurement
- [ ] Scripts idempotent and version-checked; no objects or files touched that you didn't create
- [ ] Assets fixed upstream: transforms applied, pivots, names, shared materials
- [ ] GLB optimised and round-tripped, or CAD measured, or print sliced with the user's real presets
- [ ] Runtime checked on a target device: draw calls, triangles, memory, frame time within budget
- [ ] Paid generation approved before spending; credits and task IDs reported; no keys exposed
- [ ] BlenderMCP telemetry disabled if used; decoders and HDRIs self-hosted for production
