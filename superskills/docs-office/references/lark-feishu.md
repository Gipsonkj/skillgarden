> Distilled from: lark-doc (larksuite/cli, MIT)

# Lark / Feishu cloud docs (vendor-specific)

For Lark (Feishu) Docx and Wiki pages through the official `lark-cli`. Route by the URL path or token (`/docx/`, `/wiki/`), not the domain.

## Setup

- Requires the `lark-cli` binary and an authorised identity. Run the command first; only handle auth (login, scopes) after an auth or scope error.
- Prefer acting as the user (`--as user`) for document operations.
- Local file references: `@./relative/path` inside the working directory, `@/absolute/path` elsewhere.

## Read: `docs +fetch`

```bash
lark-cli docs +fetch --doc "<url-or-token>"                                   # whole doc + open comments
lark-cli docs +fetch --doc <token> --scope outline --max-depth 3              # headings only
lark-cli docs +fetch --doc <token> --scope section --start-block-id <heading> --detail with-ids
lark-cli docs +fetch --doc <token> --scope keyword --keyword "deploy|release" --context-after 1
```

| Option | Values |
|---|---|
| `--doc-format` | `xml` (default), `markdown` |
| `--detail` | `simple` to read or summarise; `with-ids` to locate blocks; `full` before editing (ids, styles, references) |
| `--scope` | `outline`, `section`, `range` (`--start-block-id`/`--end-block-id`), `keyword`; omit for the whole document |

Read the smallest scope that answers the task.

## Edit: `docs +update`

Loop: observe (fetch with ids) → diagnose → plan the smallest safe patch → patch → fetch again to verify. Block ids can change after writes; always use ids from the latest fetch.

| Command | Use |
|---|---|
| `str_replace --pattern "old" --content "new"` | short inline text change (empty content deletes) |
| `block_replace --block-id X --content '<p>..</p>'` | rewrite one block, or a contiguous range with `--start-block-id`/`--end-block-id` |
| `block_insert_after --block-id X --content '<h2>..</h2><p>..</p>'` | add a section (`-1` = end, `0` = start) |
| `block_delete --block-id X` | remove blocks |
| `block_move_after --block-id X --src-block-ids A,B` | reorder |

Rules:
- Content is Lark document XML by default (`<h1>`-`<h9>`, `<p>`, `<ul><li>`, tables, callouts); replacement content must fit the parent container (list items stay `<li>`).
- Preserve tokenised blocks exactly: citations, images, embedded sheets, Base tables, whiteboards, synced blocks. Never replace them with plain text.
- Merge several changes to one block into one `block_replace`.
- Avoid `overwrite`: it can drop comments and unsupported resources. Use it only when the user asks for a full rebuild.
- New documents: `docs +create` with full content, or create then fill; media via `+media-insert`; history and rollback via `+history-list` / `+history-revert`.
- Drive-level actions (find, copy, permissions, comments) belong to `lark-cli drive`; copy a document with `drive files copy`, not by fetch-and-recreate.
- Direct link to a block: `<doc-url>#<block_id>` using an id from a fetch; never guess ids.

The writing guidance in document-design.md applies to Lark documents too.
