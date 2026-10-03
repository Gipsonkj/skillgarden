# Skill Garden

A personal tool for Gipson. It is separate from the Skillkraft site and is
not deployed anywhere.

- **The page** (`skill-garden.html`) is published as a private claude.ai
  artifact: https://claude.ai/artifact/7BSDZCjKKKvM2q42HGcFxw. Its data (topics,
  skill versions, reels, proposed changes, run log) lives in that artifact's
  database, not in this repository.
- **The scout** reads `runbook.md` and follows it. In the claude.ai copy it is
  the Claude Code routine "Skill Garden morning scout" (still daily there until
  the artifact and routine are republished). The local app runs it once a week.
- **`seed/`** holds the starting v1 skills, test tasks and sources that were
  loaded into the database on 29 Sep 2026.

To change the page or the runbook, edit the file here, then republish it to
the same artifact URL (the runbook is published as the artifact's
`runbook.md` file).

## Super skills and the catalog

- **`superskills/<id>/`** holds 29 super skills, one per craft (website
  building, motion, ads, data…). Each is a short router `SKILL.md`, a
  `references/` folder with one distilled guide per capability, any scripts or
  templates kept as their authors wrote them, `CREDITS.md` (every source and its
  license) and `topic.json` (name, blurb, scout searches and test tasks).
- **`catalog/catalog.json`** lists every craft and its ranked sub-skills (name,
  purpose, repo, stars, license, trending, whether it may be redistributed).
  It is written by `_tools/make_catalog.py` in the SkillGarden library folder.
- **Explore** (the page's first tab) is the storefront: crafts, super skill
  downloads, install steps, ranked sub-skills with previews, a bundle builder
  and ⌘K search. Sub-skill files come from the SkillGarden library next to this
  repository (`../skills`, `../zips`, or `SKILLGARDEN_LIBRARY`). Skills with a
  non-commercial license or no reuse license are shown as links only.
- The weekly scout proposes a **new generation** of a super skill (changed
  reference files) as one candidate in Review. Approving it is what people
  download next.

## Running it on your own computer

`local/` has a copy that runs on your Mac instead of claude.ai: a small Node
server, the same page, and a scout that runs through Claude Code on your
machine. See `local/README.md`.
