# CAD and parametric modelling: build123d, OpenSCAD, STEP

> Distilled from: cad and its build123d-modeling, cad-brief, supported-exports, inspection-and-validation, snapshot-review and repair-loop references (earthtojake/text-to-cad, MIT); openscad (mitsuhiko/agent-stuff, Apache-2.0); gltf-transform CAD workflow notes (rawwerks/VibeCAD, MIT). Plus general knowledge of OpenSCAD and build123d.

Text-to-CAD: dimensioned, editable parts and assemblies written as code, exported as STEP for engineering and STL, 3MF or GLB for printing and the web. Printability and slicing are in [3d-printing.md](3d-printing.md); artistic, organic or game models belong in Blender ([blender.md](blender.md)).

## 1. Pick the tool

| Tool | Strength | Outputs | Use when |
|---|---|---|---|
| **build123d** (Python, OpenCascade kernel), here via the `cadgen` package of text-to-cad | True B-rep solids: exact fillets, chamfers, shells, lofts, assemblies, face and edge selection, measurement | STEP, STL, 3MF, GLB | Engineering parts, enclosures, anything that mates with other parts or goes to a CNC or machine shop |
| **OpenSCAD** | Simple CSG language, built-in Customizer parameters, huge maker community | STL, 3MF, OFF, AMF, PNG previews | Printable parametric parts, sharing on maker sites, quick boxes, brackets and holders |
| CadQuery / FreeCAD | Same kernel as build123d | STEP and meshes | The project already uses them |

Default to build123d for anything that needs STEP, exact fillets or assemblies; OpenSCAD for a quick printable, customisable part.

## 2. Interpret the request before modelling

- Write down only what's needed: units (millimetres unless told otherwise), coordinate convention (XY plane, +Z up), functional interfaces (hole patterns, mating faces, screw sizes), the controlling dimensions and the outputs.
- **Reference image:** reproducing a part vs using it as inspiration are different jobs. An unscaled photo sets proportions, not fit dimensions; ask for a real dimension when fit depends on it. Record inferred dimensions as assumptions.
- **Technical drawing:** read units, projection convention, revision and notes; map each view to model axes; keep multiplicity (`4X`), `TYP.`, threads, counterbores, countersinks and section depths. Explicit dimensions beat measured image proportions. Resolve conflicts instead of silently picking one.
- Ask only when a missing value materially changes the result (a mating interface, a required size). Otherwise proceed and list assumptions.

## 3. build123d with cadgen

A model is a plain Python script with a decorated function returning a build123d shape; decorators declare the outputs:

```python
from cadgen import build123d as bd
from cadgen import step, stl, glb

WIDTH, DEPTH, THICK = 40.0, 20.0, 6.0
HOLE_D = 3.4                      # M3 clearance

@step(out="../STEP/bracket.step")
@stl(out="../STL/bracket.stl")
@glb(out="../GLB/bracket.glb")
def bracket():
    body = bd.Box(WIDTH, DEPTH, THICK)
    for x in (-WIDTH / 2 + 6, WIDTH / 2 - 6):
        body -= bd.Pos(x, 0, 0) * bd.Cylinder(HOLE_D / 2, THICK)
    body.label = "bracket"
    return body

if __name__ == "__main__":
    bracket()
```

```bash
python -m pip install -r requirements.txt       # the cadgen pin from the original skill
python src/bracket.py                           # writes the declared outputs
cadgen stl build STEP/bracket.step              # one-off export from a saved STEP
cadgen step snapshot STEP/bracket.step tmp/review.png
```

Rules:
- Keep meaningful dimensions as named constants; parameterised geometry in plain factory functions; the decorated model picks a configuration.
- Decorator `out=` paths are relative to the script; CLI paths are relative to the working directory.
- Geometry must not depend on time, random values, environment variables or the working directory. Every file a build reads is an input.
- Assemblies: call child models inside the parent and place results with `.moved()` or `Location * shape` (`.located()` replaces the location and can drop a rotation). Label occurrences meaningfully (`m3_screw:front_left`).
- Primitive alignment: `bd.Box` and `bd.Cylinder` are centred by default, but low-level `Solid.make_box` starts at a corner and `Solid.make_cylinder` at Z=0 (`align=None` keeps the raw datum, it doesn't mean centred). Set alignment deliberately when placement depends on it.
- Select edges for fillets and chamfers from the solid after its last operation, by geometry (normal, axis, position), not by stale handles. Don't silently shrink or drop a specified fillet in a retry loop; report it.
- Colour: native colours are linear RGB; use `cadgen.srgb("#2E3742")` for display hex. Named finishes (roughness, metalness) via the decorator's `materials` option feed the GLB export.
- Need a real purchasable part (screw, bearing, motor)? Search a STEP part catalogue before modelling a placeholder, and say when you used a placeholder. text-to-cad has a step-parts sibling skill for this.

The `cadgen` CAD Viewer runs locally (`cadgen viewer --host 127.0.0.1 --json --detach`, then open the URL it prints). It fetches studio HDRI images from a CDN; no model data leaves the machine.

## 4. OpenSCAD with the bundled tools

Write parameters at the top with Customizer comments, then modules:

```openscad
width = 50;            // [20:100] Width in mm
wall_thickness = 2;    // [1:0.5:5] Wall thickness in mm
rounded = true;        // Rounded corners
$fn = 64;              // circle resolution for export (lower while iterating)
```

| Script | Does |
|---|---|
| `scripts/openscad/validate.sh model.scad` | Parse and evaluate without rendering; fails on errors |
| `scripts/openscad/multi-preview.sh model.scad out/` | PNGs from iso, front, back, left, right, top |
| `scripts/openscad/preview.sh model.scad out.png [--camera=...] [--size=WxH]` | One preview |
| `scripts/openscad/extract-params.sh model.scad [--json]` | Lists Customizer parameters with ranges |
| `scripts/openscad/export-stl.sh model.scad out.stl [-D 'width=60']` | STL export with overrides |
| `scripts/openscad/render-with-params.sh model.scad params.json out.stl` | Render with a JSON parameter set |

Needs the `openscad` CLI (`brew install openscad` on macOS). A worked example to start from: `templates/openscad/parametric_box.scad` (box with lid, fit tolerance, rounded corners, grip).

OpenSCAD habits:
- `difference()` cutters should overshoot the material by a little (0.01 mm or more) to avoid zero-thickness skins.
- `hull()` is fast and good for rounded boxes; `minkowski()` is slow, use it sparingly and at low `$fn` while iterating.
- Keep `$fn` low while iterating and raise it for export.
- Recent OpenSCAD builds include a much faster geometry backend (Manifold); check `openscad --help` for a backend option on the installed version.
- Text: `text("ABC", size = 8)` then `linear_extrude`; name the font explicitly for reproducible output.

## 5. Verify every time

1. **Numbers:** measure the controlling dimensions on the saved geometry, not the source constants: bounding box, hole diameters and positions, wall thickness, clearances between assembled parts (build123d: `read_step`/`read_scene` and native measurements; OpenSCAD: `echo()` values and the exported mesh's bounding box). Check signed volume is positive per solid.
2. **Pictures:** render at least one snapshot after any visible change and look at it (`cadgen step snapshot`, or `multi-preview.sh`). Choose views that expose the features under review; add a section for internal geometry. Many errors (wrong boolean, floating parts, inverted features) only show in pictures.
3. **Topology:** closed, manifold, positive-volume solids for physical parts (unless the user asked for surfaces).
4. Report units, what was measured with thresholds, what wasn't tested, and the output files. A failed computation is not a pass.

## 6. Exports

| Format | For |
|---|---|
| STEP | Engineering hand-off, CNC, other CAD tools (exact geometry) |
| 3MF | Printing (units, colours, multiple objects in one file); preferred over STL by modern slicers |
| STL | Printing everywhere; no units (assume millimetres), no colour |
| GLB | Web viewers and AR; run through [gltf-pipeline.md](gltf-pipeline.md) (weld, then simplify, then compress) since CAD meshes are often denser than a web view needs |

Mesh tolerance sets facet density: tighter for print (`mesh_tolerance` around 4e-4 in the source's print variant), looser for drafts and web.

## 7. Repair loop

| Symptom | Check |
|---|---|
| Missing or invalid body | Profile closed? Zero thickness? Which operation first failed? |
| Hole or pocket missing | Cut depth, direction, through-condition, selector |
| Wrong size | Units, radius vs diameter, alignment, extrude direction |
| Fillet fails | Edge selection after the last operation, available local space, feature order |
| Loft twists or fails | Section winding, matching edge counts and order, self-crossing sections |
| Slow booleans | Time the operation; batch independent cuts; trim tool extents |

Fix in the source and rerun the failing check and anything it affects.

## Checklist

- [ ] Units, axes, interfaces and assumptions written down
- [ ] Tool chosen (build123d for STEP and exact features, OpenSCAD for quick printables)
- [ ] Dimensions as named parameters; geometry deterministic
- [ ] Saved geometry measured against the controlling dimensions
- [ ] Snapshot or multi-view previews looked at after each visible change
- [ ] Outputs exported in the formats the next step needs; limitations reported
