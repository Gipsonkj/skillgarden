# Credits

The router and references are written in this skill's own words from the licensed sources below plus general knowledge of Blender, Three.js, React Three Fiber, glTF, OpenSCAD, build123d, OpenUSD, 3D Gaussian splatting and FDM/resin printing. Scripts and the template are copied unchanged with their licence beside them.

## Sources used

| Source | Repo | Licence | What was used |
|---|---|---|---|
| blender-image-to-3d | [majidmanzarpour/blender-game-skills](https://github.com/majidmanzarpour/blender-game-skills/tree/main/skills/blender-image-to-3d) | MIT | `validate.py`, `roundtrip.py` copied to `scripts/blender-image-to-3d/`; gated build, budgets, bake contract, naming, rigs and clips (generative-3d.md, game-assets.md, gltf-pipeline.md) |
| scenario-blender-expert | [scenario-labs/skills](https://github.com/scenario-labs/skills/tree/main/skills/dcc/blender/scenario-blender-expert) | MIT | `bx_audit.py`, `bx_review.py` copied to `scripts/scenario-blender-expert/`; expert loop, Blender 4.x/5.x API traps, stage gates (blender.md) |
| blender-director | [arjun988/blender-skills](https://github.com/arjun988/blender-skills/tree/main/.claude/skills/blender-director) | MIT | Live Blender MCP workflow and skill routing (blender.md, game-assets.md). Depends on BlenderMCP, which sends anonymous telemetry unless `DISABLE_TELEMETRY=true` |
| blender-web-pipeline | [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills/tree/main/.claude/skills/blender-web-pipeline) | MIT | Blender to web export notes (gltf-pipeline.md) |
| threejs-fundamentals | [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-fundamentals) | MIT (stated in README; no LICENSE file) | Scene setup, cameras, renderer (threejs-scenes.md) |
| threejs-loaders | [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-loaders) | MIT (stated in README; no LICENSE file) | GLTF, Draco, KTX2, Meshopt and HDR loading (threejs-scenes.md) |
| threejs-materials | [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills/tree/main/skills/threejs-materials) | MIT (stated in README; no LICENSE file) | Material choice table (threejs-scenes.md) |
| r3f-fundamentals | [EnzeD/r3f-skills](https://github.com/EnzeD/r3f-skills/tree/main/skills/r3f-fundamentals) | MIT (stated in README; no LICENSE file) | Canvas, hooks, render loop, state rules (react-three-fiber.md) |
| three-best-practices | [emalorenzo/three-agent-skills](https://github.com/emalorenzo/three-agent-skills/tree/main/skills/three-best-practices) | MIT (stated in frontmatter and README; no LICENSE file) | Disposal, draw calls, instancing, mobile, R3F rules (web-3d-performance.md, react-three-fiber.md) |
| threejs-aaa-graphics-builder | [majidmanzarpour/threejs-game-skills](https://github.com/majidmanzarpour/threejs-game-skills/tree/main/skills/threejs-aaa-graphics-builder) | MIT | Polish pass and scorecard, technical-art budgets (web-3d-performance.md, game-assets.md) |
| threejs-3d-generator | [majidmanzarpour/threejs-game-skills](https://github.com/majidmanzarpour/threejs-game-skills/tree/main/skills/threejs-3d-generator) | MIT | Tripo API task types, rigging and retarget rules, observed costs (meshy-tripo.md) |
| meshy-3d-generation | [meshy-dev/meshy-3d-agent](https://github.com/meshy-dev/meshy-3d-agent/tree/main/skills/meshy-3d-generation) | MIT | Meshy CLI login, estimates, routes, lifecycle, print hand-off (meshy-tripo.md, 3d-printing.md) |
| img2threejs | [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs/tree/main) | Apache-2.0 | Image to procedural Three.js loop with correction limits (generative-3d.md) |
| web-3d-asset-pipeline | [openai/plugins](https://github.com/openai/plugins/tree/main/plugins/game-studio/skills/web-3d-asset-pipeline) | MIT (declared in plugin.json; no LICENSE file) | GLB as runtime contract, asset hand-off rules (gltf-pipeline.md, game-assets.md) |
| gltf-transform | [rawwerks/VibeCAD](https://github.com/rawwerks/VibeCAD/tree/main/plugins/gltf-transform/skills/gltf-transform) | MIT | glTF Transform commands, compression choices, CAD-to-web flow (gltf-pipeline.md, cad-parametric.md) |
| cad | [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad/tree/main/skills/cad) | MIT | cadgen model contract, request and drawing interpretation, verification, exports, repair loop (cad-parametric.md, 3d-printing.md) |
| gcode | [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad/tree/main/skills/gcode) | MIT | `orca_presets.py` copied to `scripts/gcode/`; OrcaSlicer headless slicing and G-code checks (3d-printing.md) |
| openscad | [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff/tree/main/skills/openscad) | Apache-2.0 (repo licence) | Shell tools copied to `scripts/openscad/`, `parametric_box.scad` copied to `templates/openscad/`; Customizer and preview workflow (cad-parametric.md) |
| omniverse-usd-performance-tuning | [NVIDIA/skills](https://github.com/NVIDIA/skills/tree/main/skills/omniverse-usd-performance-tuning) | Apache-2.0 | Intent briefing, composition audit, levers by asset shape, measured tradeoffs (openusd-and-splats.md) |
| omniverse-gaussian-splat-to-usd | [NVIDIA-Omniverse/usd-convert-gsplat](https://github.com/NVIDIA-Omniverse/usd-convert-gsplat/tree/main/skills/omniverse-gaussian-splat-to-usd) | Apache-2.0 (code) and CC-BY-4.0 (docs); attribution: NVIDIA OpenUSD | Converter commands, flags and input layout (openusd-and-splats.md) |

Licence texts: `scripts/scenario-blender-expert/LICENSE` (MIT, Copyright (c) 2026 Scenario), `scripts/blender-image-to-3d/LICENSE` (MIT, Copyright (c) 2026 Majid Manzarpour), `scripts/gcode/LICENSE` (MIT, Copyright (c) 2026 Thompson Labs LLC), `scripts/openscad/LICENSE` and `templates/openscad/LICENSE` (Apache-2.0 full text). Other Apache-2.0 and CC-BY-4.0 sources were distilled, not copied; no NOTICE file applies.

Every copied script was read before copying: none makes network calls, sends telemetry or reads cookies. `orca_presets.py` reads and writes JSON only.

Not copied, and why:
- Tripo's Python CLI (`threejs-3d-generator`): 72 KB vendor client; link in the router's Go deeper.
- img2threejs `forge` tooling and vision adapters: too large for a super skill; link in Go deeper.
- cadgen: a pip package with its own pin; cad-parametric.md says how to install it from the original skill.
- blender-web-pipeline scripts: `batch_export.py` uses `argv` before assigning it and some export parameters look out of date; the guidance was rewritten instead.
- blender-image-to-3d bake and delivery scripts: they depend on that skill's collection and manifest conventions; link in Go deeper.

## Also see (not included)

Link-only: telemetry by default, licence terms or no licence found. Nothing from them is copied or paraphrased here.

| Skill | Link | Why not included |
|---|---|---|
| improve-threejs | https://github.com/millionco/react-doctor | Its CLI sends crash and usage telemetry to Sentry by default; modified MIT licence forbids AI training and evaluation use |
| blender-to-unity | https://github.com/CoplayDev/unity-mcp | MCP for Unity sends anonymous telemetry to api-prod.coplay.dev by default; also needs BlenderMCP |
| BlenderMCP server | https://github.com/ahujasid/mcp-for-blender | MCP server, not a skill; sends anonymous telemetry unless `DISABLE_TELEMETRY=true` |
| sparkjs-skill | https://github.com/shi3z/sparkjs-skill | Web Gaussian splats; no licence found |
| rodin3d-skills | https://github.com/DeemosTech/rodin3d-skills | Official Hyper3D Rodin skill; no licence found |
| openscad_claude_skill | https://github.com/andreahaku/openscad_claude_skill | No licence found |
