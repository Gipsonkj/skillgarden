# CAD and parametric modelling: build123d, OpenSCAD, Fusion, SketchUp, SOLIDWORKS, STEP

> Distilled from: cad and its build123d-modeling, cad-brief, supported-exports, inspection-and-validation, snapshot-review and repair-loop references (earthtojake/text-to-cad, MIT); openscad (mitsuhiko/agent-stuff, Apache-2.0); gltf-transform CAD workflow notes (rawwerks/VibeCAD, MIT). Plus general knowledge of OpenSCAD and build123d, and the official Autodesk Fusion (MCP server and API), SketchUp (Claude connector, Ruby API) and SOLIDWORKS API docs, link-only, in our own words.

Text-to-CAD: dimensioned, editable parts and assemblies written as code or built in the user's CAD app, exported as STEP for engineering and STL, 3MF or GLB for printing and the web. Printability and slicing are in [3d-printing.md](3d-printing.md); artistic, organic or game models belong in Blender ([blender.md](blender.md)).

## 1. Pick the tool

**Pick a tool**

| The user's need or situation | Tool | Why |
|---|---|---|
| Already works in, or pays for, one CAD app | That app | Their files, templates and colleagues are there; a part they can't open again is a dead end |
| Has Autodesk Fusion open with the Fusion MCP server on | Fusion (section 5) | Works in their live design (create, modify, inspect geometry); the API exports STEP and 3MF |
| Furniture, rooms, buildings, woodworking; wants a `.skp` | SketchUp connector or Ruby API (section 5) | Their modeller of choice; the connector makes new `.skp` files only |
| Company runs SOLIDWORKS on Windows | SOLIDWORKS macro or API (section 5) | Their parts and drawings live there; the route is a macro the user runs |
| Wants STEP, exact fillets or an assembly, no CAD app to hand | build123d (section 3) | Free, local, B-rep solids, scripted and repeatable |
| A quick printable or customisable maker part | OpenSCAD (section 4) | Free, local, Customizer parameters maker sites understand |
| The project already uses CadQuery or FreeCAD | That tool | Same kernel as build123d; don't switch the project's tool |
| Not clear which app the user will edit the part in later | Ask | The answer decides the tool; guessing makes a file they can't use |

No account needed: build123d (Apache-2.0), OpenSCAD (free software) and FreeCAD (open source) all run locally.

| Tool | Strength | Outputs | Use when |
|---|---|---|---|
| **build123d** (Python, OpenCascade kernel), here via the `cadgen` package of text-to-cad | True B-rep solids: exact fillets, chamfers, shells, lofts, assemblies, face and edge selection, measurement | STEP, STL, 3MF, GLB | Engineering parts, enclosures, anything that mates with other parts or goes to a CNC or machine shop |
| **OpenSCAD** | Simple CSG language, built-in Customizer parameters, huge maker community | STL, 3MF, OFF, AMF, PNG previews | Printable parametric parts, sharing on maker sites, quick boxes, brackets and holders |
| CadQuery / FreeCAD | Same kernel as build123d | STEP and meshes | The project already uses them |

With no CAD app of the user's own, default to build123d for anything that needs STEP, exact fillets or assemblies; OpenSCAD for a quick printable, customisable part.

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

## 5. Desktop CAD apps: Fusion, SketchUp, SOLIDWORKS

Rules for all three: work in the document the user has open, create new named bodies or groups, and never edit or delete ones you didn't make. Measure the result and look at a view of it before calling it done (section 6). Export to absolute paths you name. The files go to the user, never straight to a machinist or a printer.

### Autodesk Fusion (Fusion MCP server)

- **What it is:** Fusion's desktop app hosts a local MCP server that sends tool calls to the live session. It doesn't work with the Fusion web client and only runs while Fusion is open.
- **Turn it on:** Fusion Preferences > General > API, then tick "Fusion MCP Server (runs locally on this device)". This needs a recent Fusion release. The endpoint is `http://127.0.0.1:27182/mcp`. The default port is 27182 and can be changed in the same preferences; if it is, change the client URL to match.
- **Connect:** in Claude Desktop, go to Settings > Connectors > Add > Browse connectors and pick "Autodesk Fusion". It shows as type Desktop and needs no URL. Claude Code and other Streamable-HTTP clients add the URL: `claude mcp add --transport http autodesk-fusion http://127.0.0.1:27182/mcp`.
- **Auth:** none. Local servers are unauthenticated by design, so there is no key to store. Suggest the user turns the server off when they're not using it.
- **Check the link first:** the connector's Tool permissions list must be populated. A document must be open in Fusion. If the connection fails, check that a firewall isn't blocking the port. Tools are discovered at connection time and change between releases: read the list you have rather than assuming tool names.
- **Two different servers:** the "Autodesk Fusion Data MCP Server" (cloud, Fusion data) and "Fusion Compute MCP" (headless Fusion in the cloud) are separate products, not this one.
- **Units trap:** the API's internal length unit is the centimetre, with no exceptions. A bare `6` is 60 mm. Pass strings with units (`ValueInput.createByString("60 mm")`). Read lengths back as cm and volumes as cm³.
- **Keep it parametric:** `design.userParameters.add(name, ValueInput, units, comment)`. With a string input, the string stays the parameter's expression, and features given the parameter's name (`createByString("thick")`) follow it. A real number input is read in internal units, so `5` with length units means 5 cm.
- **Script route:** use this when a step has no MCP tool or the user wants a reusable script. They run it from Utilities > Add-Ins > Scripts and Add-Ins > Run; Fusion calls the script's `run(context)`.

```python
import adsk.core, adsk.fusion

def run(context):
    app = adsk.core.Application.get()
    design = adsk.fusion.Design.cast(app.activeProduct)
    V = adsk.core.ValueInput.createByString
    design.userParameters.add("thick", V("3 mm"), "mm", "plate thickness")
    root = design.rootComponent
    sk = root.sketches.add(root.xYConstructionPlane)
    # Point3D is in cm: 6.0 x 4.0 is 60 x 40 mm
    sk.sketchCurves.sketchLines.addTwoPointRectangle(
        adsk.core.Point3D.create(0, 0, 0), adsk.core.Point3D.create(6.0, 4.0, 0))
    ext = root.features.extrudeFeatures.addSimple(
        sk.profiles.item(0), V("thick"), adsk.fusion.FeatureOperations.NewBodyFeatureOperation)
    body = ext.bodies.item(0)
    body.name = "plate"
    bb = body.boundingBox                        # cm
    size_mm = [(bb.maxPoint.x - bb.minPoint.x) * 10,
               (bb.maxPoint.y - bb.minPoint.y) * 10,
               (bb.maxPoint.z - bb.minPoint.z) * 10]
    em = design.exportManager
    ok_step = em.execute(em.createSTEPExportOptions("/abs/out/plate.step"))
    ok_3mf = em.execute(em.createC3MFExportOptions(body, "/abs/out/plate.3mf"))
    app.userInterface.messageBox(f"size mm {size_mm}, step {ok_step}, 3mf {ok_3mf}")
```

- **Export:** `createSTEPExportOptions(filename, geometry)` takes a Component (the root component if you leave it out). `createC3MFExportOptions(geometry, filename)` takes a BRepBody, Occurrence or Component. STL uses `createSTLExportOptions`. Nothing is written until `exportManager.execute(options)`, which returns `True` on success.
- **Measure:** `body.boundingBox` (a BoundingBox3D with `minPoint` and `maxPoint`, in cm). `body.physicalProperties` gives volume in cm³ and mass in kg, calculated at low accuracy. `app.measureManager.measureMinimumDistance(a, b)` and `getOrientedBoundingBox(body, v1, v2)` cover gaps and rotated parts. Hole sizes come from the user's fastener standard as clearance sizes, not the nominal thread size.

### SketchUp

| Route | Use when | What to know |
|---|---|---|
| SketchUp connector for Claude (claude.ai) | A new model from a description or reference images | Needs a Trimble ID and a Claude account. Add it from Customize > Connectors > Connect your apps > SketchUp > Add > Connect. It builds by running Python against a live model, and gives back a thumbnail and a download link for the `.skp` |
| Ruby API in the user's SketchUp desktop app | Editing their existing model, exact construction, STL export | Extensions > Developer > Ruby Console; paste or load a script |

Connector limits: it creates new `.skp` files only and can't edit or render an existing one. It works in inches unless asked for metric. A free SketchUp entitlement makes up to 30 models; after that the user needs a paid subscription. Files aren't kept between sessions, so tell the user to download each one. Every iteration in the same chat saves a new versioned file. The preview is a static thumbnail, so they must open the file in SketchUp to check it. The tool names differ between Trimble's help page and the Claude directory listing, so read the tool list you actually have.

Ruby API. Lengths are stored internally in inches; write `600.mm` and SketchUp converts it. Wrap the changes in one undo step:

```ruby
model = Sketchup.active_model
model.start_operation("Shelf board", true)
group = model.active_entities.add_group
face = group.entities.add_face([0, 0, 0], [600.mm, 0, 0], [600.mm, 250.mm, 0], [0, 250.mm, 0])
face.pushpull(18.mm)
model.commit_operation
puts group.volume                    # positive only if the group is manifold (a solid)
model.export("/abs/out/shelf.stl", { units: "mm", format: "binary", selectionset_only: false })
```

- `Model#export(path, options)` picks the format from the file extension. The listed exporters include STL, OBJ, FBX, DAE, GLB, USDZ, 3DS, DWG/DXF and IFC. 3MF isn't listed: export STL and let the slicer make the 3MF. STL options are `:units` (`"model"`, `"inch"`, `"feet"`, `"mm"`, `"cm"`, `"m"`), `:format` (`"ascii"` or `"binary"`), `:selectionset_only` and `:swap_yz`.
- Check `face.normal` (the face's front direction) before a push-pull and `group.volume` after it, rather than trusting the sign of the distance.
- By hand: File > Export > 3D Model > STL. Binary is the default, and the units default to the model's. "Export Only Current Selection" exports one part per file. For printing, the model has to be a solid.

### SOLIDWORKS

- **Access:** a COM API on Windows only (64-bit Windows 11; Windows 10 is supported only by SOLIDWORKS 2025, not 2026 or 2027). Code runs as a VBA macro (`.swp`), a VB.NET or C# macro or add-in, or a standalone program that gets the `ISldWorks` object (CreateObject or GetObject; `new SldWorks.SldWorks()` in C#).
- **Route from Claude:** write the macro, and the user runs it with Tools > Macro > Run (or pastes it into Tools > Macro > New). For exact argument lists on their version, ask them to record the step once (Tools > Macro > Record) and build from the recorded calls. Have the macro print its measurements so the user can paste them back.
- **Units:** the API takes and returns metres, radians and kilograms, so 60 mm is `0.06`.
- **Calls that matter:** `ISldWorks.NewDocument` (from a template), `SketchManager.CreateCornerRectangle(x1, y1, z1, x2, y2, z2)` or `CreateCenterRectangle`, `FeatureManager.FeatureExtrusion3` (FeatureExtrusion2 is obsolete), `HoleWizard5`, `FeatureFillet3`.
- **Export:** `ModelDocExtension.SaveAs3` picks the format from the extension (`.step`, `.stl`, `.3mf`). The document must be the active one for STEP, IGES and STL. Set the STEP schema first: `swApp.SetUserPreferenceIntegerValue swStepAP, 214` (or 203). The 3D-print export (File > Print3D) writes STL, 3MF or AMF; the 3MF options include Include materials and Include appearances, and the 3MF and STL units come from the `swExportStlUnits` preference.
- **Measure:** `IBody2.GetBodyBox` returns 6 doubles in metres, but the docs call the values approximate and say not to use them for comparison, so confirm sizes with `IMeasure` or a mass-properties check. `IModelDocExtension.CreateMassProperty2` gives mass properties, and `IMeasure` reaches the measure tool.

## 6. Verify every time

1. **Numbers:** measure the controlling dimensions on the saved geometry, not the source constants: bounding box, hole diameters and positions, wall thickness, clearances between assembled parts (build123d: `read_step`/`read_scene` and native measurements; OpenSCAD: `echo()` values and the exported mesh's bounding box). Check signed volume is positive per solid.
2. **Pictures:** render at least one snapshot after any visible change and look at it (`cadgen step snapshot`, or `multi-preview.sh`). Choose views that expose the features under review; add a section for internal geometry. Many errors (wrong boolean, floating parts, inverted features) only show in pictures.
3. **Topology:** closed, manifold, positive-volume solids for physical parts (unless the user asked for surfaces).
4. Report units, what was measured with thresholds, what wasn't tested, and the output files. A failed computation is not a pass.

## 7. Exports

| Format | For |
|---|---|
| STEP | Engineering hand-off, CNC, other CAD tools (exact geometry) |
| 3MF | Printing (units, colours, multiple objects in one file); preferred over STL by modern slicers |
| STL | Printing everywhere; no units (assume millimetres), no colour |
| GLB | Web viewers and AR; run through [gltf-pipeline.md](gltf-pipeline.md) (weld, then simplify, then compress) since CAD meshes are often denser than a web view needs |

Mesh tolerance sets facet density: tighter for print (`mesh_tolerance` around 4e-4 in the source's print variant), looser for drafts and web.

## 8. Repair loop

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
- [ ] Tool chosen (the user's own CAD app first; build123d for STEP and exact features, OpenSCAD for quick printables)
- [ ] In a CAD app: API units handled (Fusion cm, SketchUp inches, SOLIDWORKS metres); only bodies you created were touched
- [ ] Dimensions as named parameters; geometry deterministic
- [ ] Saved geometry measured against the controlling dimensions
- [ ] Snapshot or multi-view previews looked at after each visible change
- [ ] Outputs exported in the formats the next step needs; limitations reported
