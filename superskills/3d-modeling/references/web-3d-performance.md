# Web 3D performance and the polish pass

> Distilled from: three-best-practices rules (draw calls, memory, asset compression, Core Web Vitals, mobile) (emalorenzo/three-agent-skills, MIT); threejs-aaa-graphics-builder technical-art, authoring-recipes and visual-scorecard (majidmanzarpour/threejs-game-skills, MIT); threejs-fundamentals performance tips (CloudAI-X/threejs-skills, MIT stated in README); r3f-fundamentals (EnzeD/r3f-skills, MIT stated in README).

Use for "my three.js / R3F scene is slow, stutters, eats memory, or looks basic". Measure first, change one thing, measure again. The page around the canvas (LCP, bundle, hosting) is the website-building craft's job; this guide covers what happens inside the canvas plus loading it.

## 1. Measure

```js
console.log(renderer.info.render.calls, renderer.info.render.triangles,
            renderer.info.memory.geometries, renderer.info.memory.textures);
```

- Read these in the worst realistic view (the busiest camera angle, on the target phone), not an empty corner.
- Frame time: browser DevTools Performance panel, or `stats.js`/`r3f-perf` during development. GPU-bound (lower DPR helps) vs CPU-bound (fewer objects and draw calls help) decides the fix.
- Test on a mid-range phone or with CPU throttling; a desktop GPU hides almost everything.

## 2. Budgets (starting points, not laws)

| Metric, worst view | Desktop | Mobile |
|---|---|---|
| Draw calls | under 100 ideal, at most 300 | under 100 ideal, at most 150 |
| Triangles | at most 750k | at most 300k |
| Textures in memory | at most 60, about 256 MB | at most 40, about 128 MB |
| Shadow-casting lights | at most 2, map 2048 | 1, map 1024 |
| Pixel ratio cap | 2 | 1.5 to 2 |
| Post passes beyond render and output | at most 2 | 0 to 1 |

A single product viewer should sit far below these: one model, a handful of draw calls, under 100k triangles, GLB under about 5 MB (ideally under 1 MB). Document any deliberate overrun as a tradeoff.

## 3. Fixes in order of payoff

**Draw calls (usually the first bottleneck)**
1. Share materials: one material per look, reused.
2. `InstancedMesh` for identical repeats (trees, bolts, windows, crowd cards): N calls become 1. Set `instanceMatrix.needsUpdate` once after a batch, and recompute bounds when instances move a lot.
3. `BatchedMesh` for different geometries sharing one material.
4. Merge static geometry with `BufferGeometryUtils.mergeGeometries`.
5. Texture atlases or array textures so merged meshes can share a material.

**Pixels**
- Cap DPR (`Math.min(devicePixelRatio, 2)`); drop to 1.5 or 1 under load (`PerformanceMonitor`/`AdaptiveDpr` in drei).
- Antialiasing via the context (`antialias: true`) is cheaper than an SMAA/FXAA pass; skip MSAA when post-processing already smooths.
- Fewer full-screen passes: bloom only on authored emissive parts, no stacked effects you can't see.

**Render less**
- Static or mostly static viewer: render on demand (R3F `frameloop="demand"`; plain Three.js: render only when controls fire `change`).
- Pause the loop when the tab is hidden or the canvas is scrolled off-screen (IntersectionObserver).
- `matrixAutoUpdate = false` on static objects after placing them.
- Frustum culling is on by default; make sure bounding boxes are correct after editing geometry.

**Geometry and textures**
- LOD (`THREE.LOD`, drei `Detailed`) for objects that span large distances; add a distance gap so levels don't pop. Impostors or billboards far away.
- KTX2 textures stay compressed on the GPU: a 200 KB PNG can take 20 MB+ of VRAM once decoded. Use KTX2 (UASTC for normals and hero maps, ETC1S for the rest) and power-of-two sizes; 1024 or 512 on mobile. See [gltf-pipeline.md](gltf-pipeline.md).
- Draco or Meshopt geometry compression cuts download, not GPU cost; triangle count still matters.

**Lights and shadows**
- Three or fewer active lights; environment lighting carries the rest.
- Shadows only on hero objects and big anchors; blob or contact shadows for small repeated props; fit the shadow camera tightly; `shadowMap.autoUpdate = false` when nothing moves.
- Point lights with shadows render six times; avoid them.
- Bake lighting into textures or lightmaps for static scenes (in Blender, then ship as maps).

**CPU per frame**
- Never allocate in the render loop (no `new Vector3()` per frame); reuse scratch objects.
- Cache results of expensive queries; don't call `getWorldPosition` for many objects every frame.
- Raycast against a short list of pickable meshes or proxies, only on pointer moves.
- Physics on a fixed step and in a worker if heavy.

**Memory**
- Dispose geometries, materials, textures and render targets when removing them; `renderer.dispose()` on teardown. In React, dispose in cleanup (R3F does it for declaratively created objects, not for `<primitive>`).
- Watch `renderer.info.memory` across route changes; it should return to baseline.
- Pool objects that spawn and despawn (projectiles, particles) instead of creating and disposing.

## 4. Loading and Core Web Vitals

- Don't let the 3D block the page: lazy-load the canvas and `three` itself with a dynamic `import()` when the section nears the viewport (IntersectionObserver).
- Show a poster image (a render of the model) in the canvas slot at its final size; it can be the LCP element and prevents layout shift. Swap to the live canvas when ready.
- Preload only the first, critical GLB (`<link rel="preload" as="fetch" crossorigin>`).
- Progressive: show a low-poly or low-res version first, swap in the full model when it arrives, and dispose the placeholder.
- Show real loading progress and a readable error state; respect `prefers-reduced-motion` for auto-rotation.
- Heavy setup (decoding, physics init) off the main thread where the library allows (Draco and KTX2 decoders already use workers).

## 5. Mobile

- DPR 1.5 or lower, shadows off or one small map, no transmission or heavy post.
- `mediump` precision in custom shaders where acceptable; avoid branching and `discard` (use `alphaTest`).
- Textures 512 to 1024; KTX2 matters most here.
- Touch: `touch-action: none` on the canvas only if it captures gestures, otherwise users can't scroll the page past it. Let the page scroll unless the user enters the 3D.
- Test thermal throttling: run for two minutes, frame rate often halves.

## 6. The polish pass (when it "looks basic")

Order matters: authored forms first, then materials, then lighting, then effects. Glow on primitives does not look premium.

1. **Forms.** Silhouette first: the subject should read as a dark shape. Combine primitives with extrusions, lathes, tubes, bevels and trim; detail where the camera looks.
2. **Material kit.** Named shared roles (`bodyPrimary`, `bodySecondary`, `trim`, `glass`, `emissiveSignal`, `groundContact`, `decalDark`/`decalLight`) reused across meshes. Contrast roughness and metalness, not only hue. `MeshPhysicalMaterial` only on hero details (glass, clearcoat).
3. **Lighting.** Key, fill, rim, an environment map for reflections, contact shadows to ground objects. Choose tone mapping and exposure on the real view.
4. **Surface detail.** Decals, panel lines, wear from shared small textures or canvas-generated trim sheets, not unique full-size images.
5. **Post, last.** Subtle bloom on emissive parts, light vignette, maybe grain; compare with post on and off and keep it only if it helps.

Score the result honestly in each area (art direction, hero, environment, materials, lighting, effects, UI, performance evidence): 1 basic, 2 premium stylised, 3 showcase. Fog, darkness, bloom or particles standing in for missing geometry is an automatic fail. Report renderer numbers with any claim of "premium".

## Checklist

- [ ] Baseline numbers from the worst view on a target device
- [ ] Bottleneck named (draw calls, fill rate, CPU, memory, download)
- [ ] One change at a time, measured after each
- [ ] Materials shared, repeats instanced, DPR capped, shadows limited
- [ ] Canvas lazy-loaded with a poster; decoders self-hosted; memory returns to baseline
- [ ] Before and after numbers reported with what was traded
