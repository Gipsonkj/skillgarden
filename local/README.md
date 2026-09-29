# Skill Garden on your own computer

The same page as the claude.ai version, served from your Mac, with its own
copy of the data and a morning scout that runs on your machine.

## One-time setup

1. **Node.js**: if you don't have it, install the LTS version from
   https://nodejs.org.
2. **Claude Code**: the scout is Claude Code running in the background. If
   `claude` doesn't work in Terminal, install it from
   https://claude.com/claude-code, run `claude` once and sign in with your
   Max account.

## Start it

Double-click **Start Skill Garden.command**. The first time, macOS may say it's
from an unidentified developer: right-click the file, choose Open, then Open
again. A Terminal window opens and your browser shows
http://localhost:4747.

Or in Terminal, from this folder: `node server.mjs`

Keep the Terminal window open. The scout runs at 06:51 India time while it's
open. If your Mac was asleep then, it catches up within three hours. Close the
window to stop Skill Garden.

## Good to know

- **Your data** is in the `data` folder, one file per list. It started as a
  copy of the claude.ai version on 30 Sep 2026. The two copies don't sync.
- **Usage**: the scout uses the Claude account Claude Code is signed in to
  (your Max plan). It ignores an `ANTHROPIC_API_KEY` in your shell unless you
  start it with `SKILL_GARDEN_USE_API_KEY=1`.
- **What the scout may do**: read and write Skill Garden's data through
  `sg.mjs`, write files in `outbox`, search and read the web, and run trial
  helpers. Claude Code refuses everything else, including other commands and
  files elsewhere on your Mac.
- **Logs** of each run are in `logs`.
- **Only this computer** can open the page. The server listens on localhost
  and refuses requests from other websites.
- A different port: `PORT=5000 node server.mjs`. No morning scout:
  `node server.mjs --no-schedule`.
