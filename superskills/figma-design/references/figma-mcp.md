# Figma MCP, Figma's own skills and safe canvas writes

> Distilled from: figma-lint-design, figma-export-tokens, figma-import-tokens and the pack's `use_figma` conventions note (southleft/figma-console-mcp-skills, MIT); create-voice and create-component-md MCP adapter tables (redongreen/uSpec, MIT); figma-codegen (awdr74100/figwright, MIT); design-system and design-handoff connector notes (anthropics/knowledge-work-plugins, Apache-2.0). Plus general knowledge of the Figma MCP server.

## 1. Pick the bridge

| Bridge | What it does | Use when |
|---|---|---|
| **Figma MCP, remote** (`https://mcp.figma.com/mcp`, OAuth) | Reads design context, variables, screenshots, metadata; **writes** to the canvas through `use_figma`; creates files, FigJam diagrams | Default for Claude Code, Claude Desktop and the claude.ai Figma connector |
| **Figma MCP, desktop** (local server from the Figma desktop app, `127.0.0.1:3845`) | Reads the current selection; no canvas writes | Quick read of what the designer has selected, no OAuth |
| **figma-console MCP** (southleft, Desktop Bridge plugin) | Extra tools for variables, lint, parity, comments | The team already runs it; uSpec can use it too |
| **figwright MCP** (free, two-way) | `component_map`, `token_map`, design diffs | You want joins between Figma components/variables and the repo |
| Penpot / OpenPencil | Open-source tools, see [other-design-tools.md](other-design-tools.md) | The file is not in Figma |

Set it up in Claude Code with Figma's own plugin, which bundles the server config and Figma's skills:

```bash
claude plugin install figma@claude-plugins-official
# or the server alone:
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

Then run `/mcp` and authenticate. Never paste a personal access token into chat or a file in the repo.

**Plan limits.** Starter-plan users and View/Collab seats get only a handful of read calls per month (6 at the time of writing). Dev and Full seats on paid plans are rate-limited per minute like the REST API. Write tools are currently exempt (beta). On a small quota: one `get_metadata`, then targeted `get_design_context` calls; never loop reads.

**Client allowlist.** The remote server, the only one that can write, accepts sign-in only from clients on Figma's allowlist (the MCP catalog at figma.com/mcp-catalog; Claude Code, Claude Desktop, Cursor, VS Code with Copilot and Codex are on it, and Figma approves new ones slowly through a request form). From an unlisted client, sign-in or client registration fails. Don't set the OAuth client name to a listed client's: it sidesteps Figma's access control and can stop working without notice. Instead, pick one and say which: read through the desktop server (selection only, no writes); write through a bridge that doesn't use the remote server (figma-console or figwright); or run the write step from a listed client. Tell the user canvas writes aren't available on the desktop server, and that they can request allowlisting for their client.

**REST vs Plugin API.** Figma's Variables REST endpoint is Enterprise-only (403 elsewhere). Reading variables through `use_figma` (the Plugin API inside the file) works on every plan, so the scripts in this skill use that route.

## 2. When to load Figma's official skills

Figma ships skills with its plugin (repo `figma/mcp-server-guide`, governed by the Figma Developer Terms, so they are not copied here). If the plugin is installed, load the matching skill **before** the tool call it guards; this super skill then supplies the design-system judgement around it. If it is not installed and the task needs canvas writes, suggest installing it.

| Task | Figma skill to load | This skill adds |
|---|---|---|
| Any `use_figma` write (nodes, variables, components) | `figma-use` | [building-in-figma.md](building-in-figma.md) naming and structure |
| Implement a frame as code (`get_design_context`) | `figma-design-to-code` | [design-to-code.md](design-to-code.md) checks and verify loop |
| Push a page or screen into Figma | `figma-generate-design` | Reuse-first plan, token binding |
| Create variables or a component library in Figma | `figma-generate-library` | [design-tokens.md](design-tokens.md) tiers, names, modes |
| Code Connect mappings (`.figma.ts`) | `figma-code-connect` | Prop names that match the spec API |
| New Design, FigJam or Slides file | `figma-create-new-file` | — |
| FigJam boards, Slides decks, diagrams | `figma-use-figjam`, `figma-use-slides`, `figma-generate-diagram` | — |
| Shaders, generative plugins, SwiftUI | `figma-shaders`, `figma-generative-plugins`, `figma-swiftui` | — |

## 3. Read a file without wasting calls

1. **Parse the URL.** `figma.com/design/<fileKey>/<name>?node-id=12-345` gives `fileKey` and node `12:345` (hyphen becomes colon). Branch URLs (`/design/<fileKey>/branch/<branchKey>/...`) use the `branchKey` as the file key.
2. **Map before you drill.** `get_metadata` returns ids, names, types and boxes cheaply. Use it to list sections of a large page.
3. **Ground each section.** `get_design_context` per section node at full detail. Never depth-cap a whole page: you lose the inside of every card. If a call is too big, split by section; don't retry the same call.
4. **Tokens.** `get_variable_defs` for the variables and styles a node uses. It reports the default mode only; read all modes through a `use_figma` script (`scripts/figma-export-tokens/read-variables.js`).
5. **Look last.** `get_screenshot` for visual intent and for checking your own writes. Values come from data, never from the picture.

## 4. Rules for `use_figma` scripts

Every script in `scripts/` already follows these. Follow them when you write your own.

1. Plain JavaScript with top-level `await` and a final `return`. No async IIFE wrapper, no `figma.closePlugin()`.
2. Only the returned value comes back (JSON-serialised). `console.log` output is lost. `figma.notify()` throws.
3. Return the id of every node or variable you create or change, so later calls can find, check or undo it.
4. Put inputs in `const` declarations at the top of the script; there is no message object.
5. Colours are 0-1 floats: `{ r: 1, g: 0, b: 0 }` is red. Variable colour values include `a`.
6. Load fonts before any text change: `await figma.loadFontAsync({ family, style })`.
7. Each call starts on the first page. Switch with `await figma.setCurrentPageAsync(page)`. To scan all pages, loop over `figma.root.children` and switch to each; `loadAllPagesAsync` is not available here.
8. Use async getters (`getNodeByIdAsync`, `getLocalVariablesAsync`, `getVariableByIdAsync`) and `await` every promise.
9. Reading a property a node type lacks (`children`, `fills`, `layoutMode`, `paddingLeft`, `cornerRadius`...) **throws**; `node.fills || []` does not help. Check `node.type` or `'fills' in node` first, or wrap in `try`.
10. Alias targets can sit in collections the local listing does not return. Fall back to `getVariableByIdAsync(id)` so raw `VariableID:` strings never leak into output.
11. A failed script applies nothing. Read the error, fix, re-run. Don't stack retries.
12. Return summaries (counts plus a slice) for big files, not thousands of nodes.

Hex helper to paste into scripts that take hex input:

```js
function hex(h) {
  h = String(h).replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const n = i => parseInt(h.slice(i, i + 2), 16) / 255;
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 };
}
```

## 5. Write safely

| Rule | Why |
|---|---|
| Inventory first: list existing styles, variables, components and pages before creating anything | Duplicates are the most common agent mess in a library |
| Find-or-create by name (and saved id); never blind-create | Re-running a step must not double the library |
| One concern per call (collections, then variables, then aliases, then components) | Smaller atomic failures, easier review |
| Ask before deleting, renaming modes or variables, detaching instances, or writing to a published library | Other files depend on them; renames break consumers |
| Large changes on a Figma branch or a duplicate file | The designer reviews and merges, not you |
| Screenshot the result and compare with intent | Plugin writes succeed silently even when the layout is wrong |
| Several files open? Name the file you mean | Some bridges act on whichever file was used last, so a read and a write can land in different files |

Some source skills say never ask the user anything; the stricter rule wins here: confirm before destructive or shared-library writes, because those changes reach other people's files.

## 6. Pitfalls

- Treating `get_variable_defs` output as complete: it shows the default mode only.
- Reading hex from a screenshot when the node has a bound variable.
- Writing text without loading the font: the script fails and nothing is applied.
- Forgetting `setCurrentPageAsync` when a node from an earlier call lives on another page (`findAll` and `characters` then fail).
- Burning a Starter quota on exploratory reads.
- Spoofing a listed client's name to get past the remote server's allowlist.
