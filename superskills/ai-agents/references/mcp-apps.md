# MCP apps: interactive UI widgets in chat

> Distilled from: build-mcp-app (anthropics/claude-plugins-official, Apache-2.0), mcp-apps-builder (mcp-use/mcp-use, MIT), build-mcp-server (anthropics/claude-plugins-official, Apache-2.0)

An MCP app is a normal MCP server that also serves **UI resources**: HTML rendered in a sandboxed iframe inside the chat (Claude, ChatGPT and other hosts that implement the apps extension). The UI is additive; tools, resources and the wire protocol stay the same. Build the plain server first (mcp-servers.md).

## 1. Does this need a widget?

Add one only when a signal applies:

| Signal | Widget |
|---|---|
| Structured input the model can't reliably infer | Form |
| User must pick from a list the model can't rank (files, contacts, records) | Picker / table |
| Destructive or billable action needs an explicit click | Confirm dialog |
| Output is visual or spatial (chart, map, diff, preview) | Display |
| Long job the user wants to watch | Live progress |

Check elicitation first: yes/no, short enums and flat forms need no UI code. Widgets win for large searchable lists, previews, charts and live updates.

## 2. How a widget attaches (two registrations)

1. **Tool** declares `_meta.ui.resourceUri: "ui://widgets/picker.html"` and returns plain data (JSON text), never HTML.
2. **Resource** at that URI serves the HTML with MIME type `text/html;profile=mcp-app` (`RESOURCE_MIME_TYPE` from `@modelcontextprotocol/ext-apps/server`).

The host calls the tool, sees the URI, fetches the resource, renders it, and pipes the tool result into the iframe.

```typescript
registerAppTool(server, "pick_contact", {
  description: "Open an interactive contact picker. User selects one contact.",
  annotations: { title: "Pick Contact", readOnlyHint: true },
  inputSchema: { filter: z.string().optional() },
  _meta: { ui: { resourceUri: "ui://widgets/picker.html" } },
}, async ({ filter }) => ({
  content: [{ type: "text", text: JSON.stringify(await db.contacts.search(filter ?? "")) }],
}));
registerAppResource(server, "Contact Picker", "ui://widgets/picker.html", {},
  async () => ({ contents: [{ uri: "ui://widgets/picker.html",
                              mimeType: RESOURCE_MIME_TYPE, text: pickerHtml }] }));
```

## 3. Widget runtime (`App` from `@modelcontextprotocol/ext-apps`)

Set handlers before `await app.connect()`.

| Call | Direction | Use |
|---|---|---|
| `app.ontoolresult` | host → widget | Receive the tool's data |
| `app.ontoolinput` | host → widget | The arguments the model passed |
| `app.sendMessage({role:"user", content})` | widget → chat | "User picked X": visible message |
| `app.updateModelContext(...)` | widget → model | Silent state the model should know |
| `app.callServerTool({name, arguments})` | widget → server | Fetch more data (the only network path) |
| `app.openLink({url})` | widget → host | Outbound links (`window.open` is blocked) |
| `app.getHostContext()` / `onhostcontextchanged` | host → widget | Theme, CSS vars, size, display mode, safe-area insets |
| `app.requestDisplayMode({mode})` | widget → host | `inline` / `pip` / `fullscreen` |
| `app.downloadFile(...)` | widget → host | Host-mediated download |

**Bundle the ext-apps runtime into the HTML** at server start (read `@modelcontextprotocol/ext-apps/app-with-deps`, expose it on `globalThis`, replace a `/*__EXT_APPS_BUNDLE__*/` placeholder). Importing it from a CDN fails: the iframe CSP blocks the transitive fetches and the widget renders blank.

## 4. Sandbox limits

- No access to the host page DOM, cookies or storage.
- No fetches to arbitrary origins: route through `callServerTool`, or declare origins in the resource's `_meta.ui.csp` (`connectDomains`, `resourceDomains`, `baseUriDomains`; default is block-all; `frameDomains` restricted in Claude).
- Remote images are unreliable: inline them server-side as `data:` URLs.
- No popups or navigation: use `openLink`.

## 5. Design rules

- One widget, one job (a picker picks, a chart displays). Split a "sub-app" into several tools with focused widgets.
- Respect `hostContext.safeAreaInsets` and host theme variables; test light and dark.
- Use `autoResize: true` so iframe height follows content; cap scroll areas (about 300 px lists).
- Hide widget-only helper tools from the model with `_meta.ui.visibility: ["app"]`.
- Keep payloads small (paginate; send IDs + display fields, not whole records).
- Escape every value you put into `innerHTML`; data comes from users and APIs.
- Treat client-reported metadata as unverified; keep identity and workflow state request-scoped or in an external store, never in module globals.

## 6. Framework notes

- **mcp-use**: views live at `views/<name>/view.tsx`, bound with `view: { name }`; a view-bound tool needs `outputSchema` and matching `structuredContent`; import server APIs from `mcp-use`, React from `mcp-use/react`. Read the installed version's types before using any API; don't keep APIs the installed version lacks.
- **Local apps** (driving a desktop app or local disk): same widget mechanism over stdio, packaged as MCPB.

## 7. Test and ship

- Test in the real host (Claude.ai custom connector via a tunnel): this is the only way to exercise the real iframe sandbox and host context.
- Directory listing needs OAuth or authless, tool annotations, and 3–5 PNG screenshots of the widgets.
- Done means: widget renders in light and dark, survives an empty result and a 500-item result, every user action produces either a chat message or a model-context update, and no console CSP errors.
