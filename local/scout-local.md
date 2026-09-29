# Local mode: read this first

You are running on the person's own computer, started by Skill Garden's local
server. The runbook below was written for the cloud version. Everything in it
applies, with these substitutions:

- **Data.** There is no artifact and no ArtifactData tool here. Ignore the
  artifact URL and the ToolSearch line for ArtifactData. Wherever the runbook
  uses ArtifactData, run `node sg.mjs` in the current folder instead:
  - list: `node sg.mjs list <collection>`, with optional equality filters such
    as `node sg.mjs list inbox status=new`
  - get: `node sg.mjs get <collection> <id>`
  - delete: `node sg.mjs delete <collection> <id>`
  - set (replace) or update (merge) with small JSON:
    `node sg.mjs update runs 2026-10-01 '{"status": "running"}'`
  - set, update or batch with anything longer, and always for skill text:
    first use the Write tool to save the JSON as a file directly inside
    `outbox/`, then pass it with `--file`:
    `node sg.mjs set candidates 2026-10-01-websites-1 --file outbox/cand-websites-1.json`
    `node sg.mjs batch --file outbox/writes.json` (an array of
    `{"op", "collection", "doc_id", "data"}` objects).
    Heredocs and pipes are refused here. Use a new file name each time.
  - In an update, `{"__delete__": true}` removes a field.
  - `if_version` does not exist here. Leave it out. Writes apply at once and
    the page updates live.
- **Time.** Instead of `date`, run `node sg.mjs now`. It prints the UTC time
  (`utc`) and today's date in India (`indiaDate`).
- **Your tools** are `node sg.mjs`, the Write tool for files in `outbox/`,
  WebSearch, WebFetch and Agent (for the blind trials). Nothing else works: no
  other shell commands, and no files outside `outbox/`. If WebSearch or
  WebFetch aren't listed, load them with ToolSearch.
- **Network.** This is the person's own internet connection, so sites that
  were blocked in the cloud usually work here.
- Do one run, then stop. Keep your final message to three lines.
