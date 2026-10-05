# Penpot, Sketch and OpenPencil

> Distilled from: penpot-uiux-design and its setup and component references (github/awesome-copilot, MIT); open-pencil (open-pencil/skills, MIT). Sketch section written in our own words from Sketch's MCP server docs. Safety notes are this skill's own.

Use this when the design lives outside Figma: **Penpot** (open-source, browser-based, self-hostable), **Sketch** (Mac app with a built-in local MCP server) or **OpenPencil** (open-source editor and CLI that reads and writes `.fig` files). The craft rules in the other guides (tokens, specs, audits, hand-off) apply unchanged; only the tooling differs.

## Pick a tool

| Situation | Use | Why |
|---|---|---|
| The team already designs in one tool | That tool's bridge | The file and its library live there |
| A Figma file and a Figma seat | Figma MCP, see [figma-mcp.md](figma-mcp.md) | Richest bridge; writes through `use_figma` |
| A Sketch document on this Mac | Sketch MCP server (section 3) | Built into Sketch; reads and writes the open document |
| A Penpot file | Penpot MCP (section 1) | Open-source, self-hostable |
| A `.fig` file but no Figma seat, or a headless audit | OpenPencil (section 2) | Free CLI, works on the file directly |
| Unsure which app or file the user means | Ask | Several design apps can be open at once |

## 1. Penpot

**Bridge.** Penpot's MCP server (`penpot/penpot-mcp`; check the repo README for its current home) runs on your machine and talks to a plugin inside an open Penpot file:

| Part | Address |
|---|---|
| Plugin server (serves the plugin) | `http://localhost:4400` (load `http://localhost:4400/manifest.json` via Plugins > Load plugin from URL) |
| MCP server | `http://localhost:4401/mcp` (Streamable HTTP) or `/sse` |
| WebSocket to the plugin | port 4402 |

Setup is clone, `npm install`, `npm run bootstrap`, then `claude mcp add penpot -t http http://localhost:4401/mcp`. Ask before installing anything, and first try a tool call: if `penpot_api_info` answers, it is already running. Keep the plugin panel open; closing it disconnects the tools.

**Tools.** `execute_code` (JavaScript in the plugin context), `export_shape` (PNG/SVG for checking), `import_image`, `penpot_api_info` (API docs).

**API gotchas.**

| Gotcha | Do this |
|---|---|
| `width` / `height` are read-only | `shape.resize(w, h)` |
| `parentX` / `parentY` are read-only | The helper `penpotUtils.setParentXY(shape, x, y)` |
| Z-order | `insertChild(index, shape)`, not `appendChild` |
| Flex layout children | The children array is in **reverse** visual order for row and column layouts |
| Text after `resize()` | Reset `growType` to `auto-width` or `auto-height` |
| New boards overlap old ones | Find the rightmost board edge first and place new boards after it (about 100 px gap within a flow, 200 px between flows) |
| Exploring a file | `penpotUtils.shapeStructure()` and `penpotUtils.findShapes(predicate, penpot.root)` |
| CSS from a selection | `penpot.generateStyle(selection, { type: 'css', includeChildren: true })` |

**Tokens.** Penpot has native design tokens (with sets and themes, Tokens Studio-style JSON). Check what the team's Penpot version supports before promising round trips, and prefer importing the same DTCG files you'd use for Figma (see [design-tokens.md](design-tokens.md)). Penpot also publishes an AI kit (`penpot/penpot-ai-kit`, CC-BY-4.0) worth reading for current agent workflows.

## 2. OpenPencil

**What it is.** A desktop editor plus `openpencil` CLI and an MCP server (`@open-pencil/mcp`) that work on the running editor (app mode, no file argument) or headless on a `.fig` file (pass the path). It uses a Figma Plugin API-compatible runtime for `eval`.

| Task | Command |
|---|---|
| Overview | `openpencil info design.fig`, `openpencil tree design.fig --depth 2` |
| Find nodes | `openpencil find design.fig --name Button --type COMPONENT`, `openpencil query design.fig "//FRAME[@width < 300]"` |
| Variables | `openpencil variables design.fig --collection Colors --type COLOR` |
| Token audit | `openpencil analyze colors design.fig --similar --threshold 10`, `analyze typography --group-by size`, `analyze spacing --grid 8`, `analyze clusters --min-count 3` |
| Lint | `openpencil lint design.fig --json` |
| Export | `openpencil export design.fig --node 1:23 -s 2 -o button@2x.png`, `-f svg`, `-f pdf`, `-f jsx --style tailwind -o Card.tsx` |
| Scripted edit | `openpencil eval design.fig -o modified.fig -c '<plugin API code>'` (write to a new file; `-w` overwrites the source) |

MCP tools mirror this (read, create, modify, variables, analyze, export, `design_to_tokens`, `design_to_component_map`). Check versions: the tool list changes between releases.

Uses in this craft: audit a `.fig` file without a Figma seat (`analyze` + `lint`), pull variables into DTCG, export icons and assets, and generate a JSX starting point that you then rework with [design-to-code.md](design-to-code.md).

## 3. Sketch

**Bridge.** Sketch 2025.2.4 or later has a local-only MCP server, off by default. It is not in the Mac App Store build; the user needs the version from sketch.com.

| Step | How |
|---|---|
| Start the server | In Sketch: ⌘K, type "MCP", choose Start MCP Server; or Settings > General > MCP Server. Allow Local Network access if macOS asks |
| Address | `http://localhost:31126/mcp` (HTTP) |
| Claude Code | `claude mcp add --transport http sketch http://localhost:31126/mcp`, check with `claude mcp get sketch` |
| Claude Desktop | Settings > Extensions, search "Sketch", install, set tool permissions under Configure |
| Other port | `defaults write com.bohemiancoding.sketch3 mcpServerPortNumber -int 1234` (pick a free port in 1024-49151) and use it in the URL |

**Tools.** It works on the document currently open in Sketch.

| Tool | Use |
|---|---|
| `get_document_info` | Document id, file name, pages: the first call |
| `get_layer_tree_summary` | Text outline of the layers |
| `get_design_assets` | Symbols, text styles, layer styles, colours, templates: the inventory before any write |
| `get_symbol_overrides` | The overrides a symbol exposes: these become component props in code |
| `get_libraries` | Linked libraries |
| `get_screenshot` | A layer or the canvas, for intent and for checking writes |
| `get_guide` | Sketch's built-in reference guides; read before writing `run_code` scripts |
| `run_code` | JavaScript with the full SketchAPI, as a plugin would run it: multi-step, branching, error handling. **Writes** |

**Mapping to this craft.** Symbols are components and symbol overrides are their props; shared text and layer styles and colours play the part of styles and tokens. Inventory with `get_design_assets` before creating anything, and apply [design-to-code.md](design-to-code.md) and [design-tokens.md](design-tokens.md) as written. Sketch publishes its own agent skills (`sketch-design-to-code`, `sketch-design-from-reference`) in `sketch-hq/agents`; read them before installing.

**Gotchas.**
- `run_code` changes the open document directly. Duplicate the document or page first, say what the script will change, wait for a yes, then screenshot the result.
- The calls act on whichever document is active in Sketch. If several are open, ask the user to make the right one active.
- Connection fails: check System Settings > Privacy & Security > Local Network for Sketch (toggle it off and on), and that nothing else uses the port.

## 4. Safety for local design servers

| Rule | Why |
|---|---|
| Keep servers bound to `127.0.0.1` | Anyone on the network could otherwise drive your editor |
| Set `OPENPENCIL_MCP_AUTH_TOKEN` for the HTTP server; never set `OPENPENCIL_MCP_CORS_ORIGIN="*"` | Open CORS lets any web page you visit call the server |
| Scope file access with `OPENPENCIL_MCP_ROOT` to the project's design folder | `open_file` / `save_file` can otherwise reach any path |
| Ask before using tools that call outside services (OpenPencil's `stock_photo`, `fetch_icons`, `search_icons`) | They send your queries to third-party hosts |
| `eval` with `-o new.fig`, not `-w`, until the user has checked the result | Headless writes have no undo |
| Read install scripts before running them; never pipe a downloaded script straight into a shell | Project security rule |
