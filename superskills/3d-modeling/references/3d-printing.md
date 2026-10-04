# 3D printing: printability, slicing and G-code

> Distilled from: gcode and its `orca_presets.py` (earthtojake/text-to-cad, MIT); cad export notes (earthtojake/text-to-cad, MIT); openscad publishing notes (mitsuhiko/agent-stuff, Apache-2.0); meshy-3d-generation hand-off notes (meshy-dev/meshy-3d-agent, MIT). Printability rules of thumb are general FDM/resin practice; check them against the user's printer and material.

From a model to a file a printer can run. The agent prepares and checks files; it never sends anything to a printer. Modelling the part is in [cad-parametric.md](cad-parametric.md).

## 1. Make it printable (before slicing)

**Mesh health**
- Closed (watertight), manifold, consistent outward normals, no self-intersections, no zero-thickness walls, one shell per intended part. CAD exports from solids usually are; sculpted, scanned and AI-generated meshes usually aren't.
- Check in Blender with `scripts/scenario-blender-expert/bx_audit.py` (non-manifold edges, loose parts, flipped faces, self-intersections) or the slicer's repair report. Fix in the source when you can; a slicer's auto-repair is a last resort.
- Units: STL has none. Slicers assume millimetres; a part modelled in metres arrives 1000 times too small. 3MF carries units, prefer it.

**Design rules of thumb for FDM** (starting points; the printer, nozzle and material decide)

| Topic | Rule |
|---|---|
| Overhangs | Up to about 45 degrees from vertical prints without support; beyond that add support, a chamfer, or reorient |
| Bridges | Short horizontal spans bridge; long ones sag. Keep them short or add support |
| Walls | At least two perimeters thick (about 0.8 mm or more with a 0.4 mm nozzle); thin features under one line width vanish |
| Holes | Small vertical holes print undersized; model them slightly larger or drill out. Horizontal holes droop at the top; a teardrop shape prints clean without support |
| Fits between parts | Leave a clearance gap (often 0.2 to 0.5 mm for FDM, tune with a test print); the parametric box template uses 0.3 mm for its lid |
| First layer | A flat face on the bed; add a small chamfer (not a fillet) on bottom edges to counter elephant's foot |
| Strength | Layers are the weak direction: orient so loads run along the layers, not across them |
| Text and fine detail | Embossed or engraved text at least about 0.6 mm deep and a few millimetres tall |

**Resin (SLA/MSLA)** differs: hollow large parts and add drain holes, orient at an angle to reduce suction, plan supports on hidden faces, and account for post-cure.

**Orientation** is the biggest single decision: it sets supports, surface finish, strength and print time. Say which face goes down and why.

## 2. Pick the file to hand over

| Format | Use |
|---|---|
| 3MF | Default for modern slicers: units, multiple parts, colours and settings in one file |
| STL | Universal; millimetres assumed; geometry only |
| STEP | Some slicers (OrcaSlicer, PrusaSlicer, Bambu Studio) import it and tessellate cleanly; keep it for re-meshing at the right resolution |
| `.gcode` / `.gcode.3mf` | Printer-ready output of the slicer, tied to one printer, nozzle and material |

## 3. Slice with OrcaSlicer (headless)

OrcaSlicer is open source with built-in profiles for most FDM printers (Prusa, Bambu Lab, Creality, Voron and more).

- macOS: `brew install --cask orcaslicer`; the CLI is `/Applications/OrcaSlicer.app/Contents/MacOS/OrcaSlicer`. Windows and Linux: install a release from the OrcaSlicer GitHub; the command is `orca-slicer`.
- Its CLI needs complete presets: it doesn't fill in parent settings and only slices a process whose compatible printers name the printer. `scripts/gcode/orca_presets.py` (Python 3, no dependencies, reads and writes JSON only) writes complete presets from the user's own and OrcaSlicer's built-in profiles.

1. **Find the user's presets.** Prefer the ones they already print with; never invent a printer, nozzle or temperature: a wrong bed size or temperature can damage the printer.
   ```bash
   python scripts/gcode/orca_presets.py --list machine --match "MK4S"
   python scripts/gcode/orca_presets.py --list process --match "@MK4S 0.4"
   python scripts/gcode/orca_presets.py --list filament --match "PLA @MK4S"
   ```
2. **Write complete presets.**
   ```bash
   python scripts/gcode/orca_presets.py --printer "Prusa MK4S 0.4 nozzle" \
     --process "0.20mm SPEED @MK4S 0.4" --filament "Prusa Generic PLA @MK4S" --out presets
   ```
3. **Slice** (absolute `--outputdir`):
   ```bash
   <orca> model.3mf \
     --load-settings "presets/process.json;presets/printer.json" \
     --load-filaments presets/filament-1.json \
     --arrange 1 --slice 0 \
     --outputdir /abs/out --export-3mf model.gcode.3mf
   ```
   This writes `plate_1.gcode` and `model.gcode.3mf`. Inputs: `.stl`, `.3mf`, `.obj`, `.amf` (export STEP to STL or 3MF first for the CLI). Override one setting with `--<key-with-hyphens>=<value>`, for example `--layer-height=0.16`.

If no preset matches, or the user prefers to choose, open the model in the app instead (`open -a OrcaSlicer model.3mf` on macOS); the app also reads STEP.

## 4. Check before anyone prints

- Size fits the bed: `<orca> model.stl --info` prints the model's size.
- The slice used the right machine and material; OrcaSlicer writes its settings at the end of the G-code:
  ```bash
  grep -E '^; (printer_model|nozzle_diameter|filament_type|nozzle_temperature|hot_plate_temp|bed_temperature) =|printing time' /abs/out/plate_1.gcode
  ```
  Confirm they match the user's printer and material, and report the print time and filament use.
- Look at the slicer preview (layer view) when the part has overhangs, bridges or thin walls.

## 5. Hand off

- Any printer: give the user the `.gcode` or `.gcode.3mf` to print from their printer's app, its web interface (PrusaLink, OctoPrint, Mainsail, Fluidd) or an SD card. Don't upload or start prints yourself.
- Bambu Lab printers take the `.gcode.3mf`; text-to-cad has a bambu-labs sibling skill for that hand-off.
- Publishing a model (MakerWorld, Printables): STL or 3MF, at least one good isometric preview image, and a list of the customisable parameters (from `scripts/openscad/extract-params.sh --json` for OpenSCAD parts).

## Pitfalls

- STL in metres or inches arriving at the wrong scale.
- Invented printer or filament presets.
- Non-manifold AI or sculpt meshes sliced as-is (missing walls, spaghetti).
- Press fits modelled at nominal size with no clearance.
- Thin walls under one line width that disappear in the slice.

## Checklist

- [ ] Mesh closed, manifold, correct units; orientation chosen and explained
- [ ] Overhangs, walls, holes and clearances checked against the process
- [ ] User's real printer, process and filament presets used
- [ ] Sliced; settings in the G-code footer match; time and filament reported
- [ ] Files handed to the user; nothing sent to a printer
