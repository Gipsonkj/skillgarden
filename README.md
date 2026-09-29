# Skill Garden

A personal tool for Gipson. It is separate from the Skillkraft site and is
not deployed anywhere.

- **The page** (`skill-garden.html`) is published as a private claude.ai
  artifact: https://claude.ai/artifact/7BSDZCjKKKvM2q42HGcFxw. Its data (topics,
  skill versions, reels, proposed changes, run log) lives in that artifact's
  database, not in this repository.
- **The morning scout** is a Claude Code routine, "Skill Garden morning scout",
  that runs daily at 06:51 India time. It reads `runbook.md` from the artifact
  and follows it.
- **`seed/`** holds the starting v1 skills, test tasks and sources that were
  loaded into the database on 29 Sep 2026.

To change the page or the runbook, edit the file here, then republish it to
the same artifact URL (the runbook is published as the artifact's
`runbook.md` file).

## Running it on your own computer

`local/` has a copy that runs on your Mac instead of claude.ai: a small Node
server, the same page, and a scout that runs through Claude Code on your
machine. See `local/README.md`.
