# Penpot and OpenPencil

> Distilled from: penpot-uiux-design and its setup and component references (github/awesome-copilot, MIT); open-pencil (open-pencil/skills, MIT). Safety notes are this skill's own.

Use this when the design lives outside Figma: **Penpot** (open-source, browser-based, self-hostable) or **OpenPencil** (open-source editor and CLI that reads and writes `.fig` files). The craft rules in the other guides (tokens, specs, audits, hand-off) apply unchanged; only the tooling differs.

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

## 3. Safety for local design servers

| Rule | Why |
|---|---|
| Keep servers bound to `127.0.0.1` | Anyone on the network could otherwise drive your editor |
| Set `OPENPENCIL_MCP_AUTH_TOKEN` for the HTTP server; never set `OPENPENCIL_MCP_CORS_ORIGIN="*"` | Open CORS lets any web page you visit call the server |
| Scope file access with `OPENPENCIL_MCP_ROOT` to the project's design folder | `open_file` / `save_file` can otherwise reach any path |
| Ask before using tools that call outside services (OpenPencil's `stock_photo`, `fetch_icons`, `search_icons`) | They send your queries to third-party hosts |
| `eval` with `-o new.fig`, not `-w`, until the user has checked the result | Headless writes have no undo |
| Read install scripts before running them; never pipe a downloaded script straight into a shell | Project security rule |
