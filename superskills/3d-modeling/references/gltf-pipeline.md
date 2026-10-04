# glTF/GLB pipeline and optimisation

> Distilled from: web-3d-asset-pipeline (openai/plugins game-studio, MIT declared in plugin.json); gltf-transform (rawwerks/VibeCAD, MIT); blender-web-pipeline and its glTF export and optimisation references (freshtechbro/claudedesignskills, MIT); three-best-practices asset-compression and gltf-loading rules (emalorenzo/three-agent-skills, MIT); blender-image-to-3d export and round-trip scripts (majidmanzarpour/blender-game-skills, MIT). Plus general knowledge of the glTF Transform CLI.

GLB (binary glTF 2.0) is the shipping format for the web and a good default for engines. The goal is a predictable runtime asset, not whatever the modelling tool exported first. Runtime loader setup is in [threejs-scenes.md](threejs-scenes.md).

## 1. Default pipeline

1. **Clean the source** in Blender (or the CAD tool): apply transforms, consistent units (metres), pivots where interaction happens, stable meaningful names, shared materials, no hidden junk.
2. **Bake** procedural materials to image maps; glTF carries PBR metallic-roughness with maps, not node graphs.
3. **Export** GLB.
4. **Inspect** with glTF Transform.
5. **Optimise**: prune, dedupe, weld, simplify if needed, resize and compress textures, compress geometry.
6. **Validate**: round trip, view in the target runtime, check counts against the budget.
7. **Ship** with the matching decoders in the app.

Don't treat FBX, OBJ or `.blend` as the runtime contract, and don't let runtime code compensate for asset mistakes (rescaling, re-rotating, re-naming in JS) that should be fixed upstream.

## 2. Exporting from Blender

```python
bpy.ops.export_scene.gltf(
    filepath="/abs/out/product.glb",
    export_format="GLB",
    use_selection=True,          # export an explicit selection, not the whole file
    export_apply=True,           # apply modifiers (not with shape keys: apply on a copy, then export with False)
    export_yup=True,             # glTF is Y up
    export_animations=True,
    export_cameras=False, export_lights=False,
)
```

- Parameter names change between Blender versions. List the real ones first: `bpy.ops.export_scene.gltf.get_rna_type().properties.keys()`.
- Export an explicit selection or collection: ship meshes, deformation bones, sockets and intended clips; leave out references, high-poly sculpts, control rigs, cameras and lights unless the runtime needs them.
- Skip Draco in the exporter when you'll run glTF Transform afterwards; compress once, at the end.
- Use the exporter's custom-properties option only when the runtime reads `userData`.
- Batch: run headless over a folder, one file at a time, `blender -b file.blend --factory-startup --python-exit-code 1 -P export.py -- /abs/out`.

## 3. Inspect, then optimise with glTF Transform

Runs with no install through `npx @gltf-transform/cli` (or `bunx`). Always inspect first:

```bash
npx @gltf-transform/cli inspect model.glb
```

It lists scenes, meshes (vertices, primitives, mode), materials, textures (size, format, memory) and animations: you see what is actually heavy before choosing a fix.

One-command optimise with sensible defaults:

```bash
npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp
npx @gltf-transform/cli optimize in.glb out.glb --compress draco --texture-compress ktx2 --texture-size 1024
```

Step by step when you need control:

```bash
npx @gltf-transform/cli prune in.glb a.glb            # drop unused nodes, materials, textures
npx @gltf-transform/cli dedup a.glb b.glb             # merge duplicate accessors, materials, textures
npx @gltf-transform/cli weld b.glb c.glb              # merge duplicate vertices (do before simplify)
npx @gltf-transform/cli simplify c.glb d.glb --ratio 0.5 --error 0.001
npx @gltf-transform/cli resize d.glb e.glb --width 1024 --height 1024
npx @gltf-transform/cli webp e.glb f.glb              # or: ktx (needs the KTX-Software `toktx` tool installed)
npx @gltf-transform/cli meshopt f.glb out.glb         # or: draco
```

Check flags with `npx @gltf-transform/cli <command> --help`; they change between versions. Simplify with an error bound so it can't eat the silhouette, and look at the result.

## 4. Choosing compression

**Geometry**

| Method | Size | Decode | Animation and morphs | Use |
|---|---|---|---|---|
| Draco | Smallest geometry | Slower, needs decoder (WASM, workers) | Meshes only | Large static meshes, CAD, scans |
| Meshopt | Close to Draco, better after gzip/brotli | Fast | Also compresses animation and morph targets | Default for web, animated or skinned assets |
| Quantize only | Moderate | No decoder | Yes | Maximum compatibility |

**Textures**

| Format | Download | GPU memory | Use |
|---|---|---|---|
| KTX2 / Basis UASTC | Larger | Stays compressed | Normal maps, hero textures |
| KTX2 / Basis ETC1S | Smallest | Stays compressed | Base colour of secondary assets, environments |
| WebP / AVIF | Small | Fully decoded (a 200 KB image can be 20 MB+ of VRAM) | Simple pipelines, few textures |
| PNG | Large | Fully decoded | Only when lossless is required |

Size textures to how big they appear on screen: 2048 for a hero close-up, 1024 normal, 512 for mobile and small props. Power-of-two sizes mip cleanly.

## 5. Runtime side

- Whatever you compressed with, the app needs the decoder: `DRACOLoader`, `KTX2Loader` (with `detectSupport(renderer)`), `MeshoptDecoder`. Self-host the decoder files from the installed `three` version.
- R3F: `npx gltfjsx model.glb --transform --types` runs the same optimisation and emits a typed component.
- Check the file in a neutral viewer too (the Khronos glTF Sample Viewer or the glTF Transform web viewer) to separate asset problems from app problems.

## 6. Validate before shipping

- **Round trip:** import the export into a blank Blender and compare against what you meant to ship:

  ```bash
  blender -b --factory-startup --python scripts/blender-image-to-3d/roundtrip.py -- \
    --file out/product.glb --out review/roundtrip --expect-height 0.32
  ```

  It reports meshes, triangles, materials, images, bones, clips and bounds, renders a clay frame, and flags a height off by more than 1 percent. Exit code non-zero means look.
- **glTF Validator** (Khronos) for spec errors when another tool rejects the file.
- **In the target runtime:** scale, orientation (glTF is Y up, -Z forward for cameras), pivots, materials under the real lighting, clips playing, no missing textures.
- **Counts:** triangles, draw calls (one per mesh-material pair), texture memory against the budget in [web-3d-performance.md](web-3d-performance.md) or [game-assets.md](game-assets.md). Runtime vertex counts exceed modelling counts because UV and normal seams split vertices.

## 7. Size targets (starting points)

| Asset | GLB size |
|---|---|
| Small prop | under 100 KB |
| Product or character for the web | 0.5 to 1 MB, up to about 5 MB for a hero |
| Environment | 1 to 5 MB, streamed in parts if larger |

## 8. Pitfalls

- Compressing twice (Draco in Blender, then again in glTF Transform): slower, sometimes broken.
- KTX2 with no transcoder path set: textures silently black or the load fails.
- Simplifying before welding: cracks along UV seams.
- Unapplied scale: the model is 100x too big in the engine and physics break.
- Many unique materials from a CAD or AI export: merge them before shipping; each is a draw call.
- Texture sizes chosen by the source art, not by screen size.

## Checklist

- [ ] Transforms applied, units and pivots consistent, names stable
- [ ] Procedural materials baked; materials and textures deduplicated
- [ ] Inspected before and after; compression chosen per asset type
- [ ] Textures sized to screen use; KTX2 where the runtime supports it
- [ ] Round trip passed; viewed in the target runtime with the right decoders
- [ ] Final size, triangles, draw calls and texture memory reported
