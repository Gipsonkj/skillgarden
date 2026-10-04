# OpenUSD scenes and Gaussian splats

> Distilled from: omniverse-usd-performance-tuning and its briefing, composition-audit and optimization-tradeoffs references (NVIDIA/skills, Apache-2.0); omniverse-gaussian-splat-to-usd (NVIDIA-Omniverse/usd-convert-gsplat, Apache-2.0 code and CC-BY-4.0 docs; attribution: NVIDIA OpenUSD). Plus general knowledge of OpenUSD and 3D Gaussian splatting.

OpenUSD is the scene format of film, Omniverse, digital twins and Apple AR (USDZ). Gaussian splats are captured scenes made of millions of soft particles rather than triangles. Both are niche next to GLB: use them when the pipeline asks for them.

## 1. OpenUSD in five ideas

| Idea | What it means for you |
|---|---|
| **Stage and layers** | A scene is a stack of layers (`.usda` text, `.usdc` binary, `.usdz` zipped package). Stronger layers override weaker ones without editing them. |
| **References** | Bring an asset file into the scene at a path; edits on top stay separate from the asset. |
| **Payloads** | References that can be left unloaded, so huge scenes open fast and load parts on demand. |
| **Variants** | Switchable versions inside one asset (colour, LOD, configuration). Only the selected variant is composed. |
| **Instancing** | Mark repeated subtrees `instanceable` so they share one prototype in memory. |

Tools that come with OpenUSD: `usdview` (look), `usdcat` (convert or print `.usdc` as text), `usdchecker` (validate, including USDZ rules for AR), `usdzip` (package). Blender exports USD (`bpy.ops.wm.usd_export`) and imports it; check the exporter's options on the installed version.

**USDZ for Apple AR Quick Look:** one file, textures inside, metres, Y up, PBR materials; run `usdchecker --arkit file.usdz` before handing it over. For web AR on other platforms, GLB is the usual pair (`<model-viewer>` takes both).

## 2. When a USD scene is slow or heavy

The NVIDIA workflow, in brief. It needs NVIDIA Omniverse Kit or the standalone Usd Optimize tools for the heavy lifting; without them you can still audit and plan.

1. **Brief the job with intent, not counts.** Ask: what is the asset for, may the structure change, what must not change, and what quality is acceptable. State a quality budget ("keep surface detail to about 0.5 mm"), not a triangle target: in the source's measurements a triangle target lost 3.84 percent of the surface (up to 45 percent in some regions), while the tolerance brief lost none. Don't ask for a mesh count either: fusing materials into one mesh with many subsets produced 6,674 draw calls and 12 FPS against 50 FPS for the same geometry at 298 draws.
2. **Profile a baseline** (load time, memory, frame rate) before changing anything.
3. **Audit composition read-only:** root layer, default prim, layer count, sublayers, references, payloads and their load state, variant sets and selections, instanceable prims, unresolved asset paths, data-heavy `.usda` files. Don't flatten during the audit; selected variants don't prove the others are fine; unloaded payloads still matter.
4. **Pick the dominant lever by asset shape:**

   | Asset shape | Typical lever |
   |---|---|
   | Production line (unique stations, repeating fasteners deep inside) | Merge to named units |
   | Rack or repeated assemblies near the top | Instance the repeated subtrees |
   | Building or BIM export (already instanced, thousands of materials) | Deduplicate materials |

5. **Validate before and after** every change; optimise prototypes before stage-level operations.
6. **Write to a new output, never over the source** unless the user explicitly allows it.
7. **Profile again and report** the operations run, before and after numbers, and what wasn't changed.

Deployment tradeoff: many small layers help authoring and instancing but slow opening on high-latency storage; packaging components into a few library layers improved cold load about 2 to 2.5 times and halved memory in NVIDIA's case study. Benchmark on the real target.

CAD into USD: tessellation settings at conversion decide most of the later cost; convert at a stated tolerance, keep part names, and check instancing survived.

## 3. Gaussian splats

**What they are.** A 3D Gaussian splat scene stores millions of oriented, coloured, semi-transparent ellipsoids. It renders photoreal captured places and objects fast, but it isn't a mesh: no clean topology, no UVs, hard to edit or light, and big files.

**Getting one.** Capture overlapping photos or video around the subject (steady exposure, no motion blur), solve camera poses (COLMAP or a capture app), then train a splat with an open trainer or a capture service. Outputs are usually `.ply` (standard 3DGS layout) or compressed `.spz`.

**Showing one on the web.** Three.js-based splat renderers exist; check each library's licence and its supported formats. Keep files small: crop to the region of interest, prune low-opacity splats, and use a compressed format.

**Into OpenUSD with `usd-convert-gsplat`** (NVIDIA, install from its repo: `pip install ./source/python`, plus `./source/python[usd]` to write USD; SciPy for `--generateScales`):

```bash
usd-convert-gsplat -i scene.ply -o scene.usda
usd-convert-gsplat -i scene.spz -o scene.usdc
usd-convert-gsplat -i scene.ply -o scene.usda --rotate-x 180     # COLMAP Y-down data
usd-convert-gsplat -i scene.ply -o scene.usda --up-axis Z         # Z-up stage
usd-convert-gsplat -i scene.ply -o scene.usda --generateSh        # only RGB present, no f_dc
usd-convert-gsplat -i scene.ply -o scene.usda --generateScales    # no scale_0/1/2 present
```

- Input `.ply` (binary or ASCII, properties `x y z`, `scale_0..2`, `rot_0..3`, `opacity`, `f_dc_0..2`, optional `f_rest_*`) or `.spz`; output `.usd`, `.usda`, `.usdc` or `.usdz`.
- Writes `ParticleField3DGaussianSplat` prims (preferred schema in OpenUSD 26.03+; older builds use an Omniverse fallback). Scales are exponentiated from log scale, opacity is sigmoid-applied, quaternions normalised, display colour derived from the DC coefficients.
- Report the command, output path, orientation and up-axis choices, and any warnings. Failures are usually installation, missing optional dependencies, missing USD support, unsupported PLY properties or bad paths.

## Pitfalls

- Flattening a composed stage "to simplify" it and losing instancing and edit separation.
- Optimising with a triangle or mesh-count target instead of a tolerance.
- Overwriting the source stage.
- Treating a splat like a mesh (expecting UVs, collisions or relighting).
- Splats upside down: COLMAP-style data is Y down; rotate 180 degrees about X.

## Checklist

- [ ] Intent, allowed changes, protected properties and quality tolerance stated
- [ ] Baseline profiled; composition audited read-only
- [ ] Lever chosen from the asset's shape; validated before and after
- [ ] Output written to a new file; numbers and operations reported
- [ ] Splats: format, orientation, up-axis and size checked in the target viewer
