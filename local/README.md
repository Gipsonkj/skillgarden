# Skill Garden on your own computer

The same page as the claude.ai version, served from your Mac, with its own
copy of the data and a weekly scout that runs on your machine.

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

Keep the Terminal window open. The scout runs once a week, on Sunday at 06:51
India time, while it's open, and works through the active topics one at a
time. If the Mac was asleep or the app was closed then, it catches up the next
time the app is running once a week has passed. Close the window to stop Skill
Garden.

## Load the 30 super skills

With Skill Garden running, in a second Terminal window from this folder:

    node import-superskills.mjs

It adds each folder in `../superskills` as a topic with its files, and switches
off the three starter topics they replace (Websites, Motion graphics, AI
posters; their history stays). Run it again after you change a super skill by
hand; unchanged topics are skipped. `--inactive` imports them with the scout
off.

## Reading reel videos (optional)

Drop a reel's video file in Reel inbox → Video, or press **Add video** on a
reel. Skill Garden transcribes it with Whisper and grabs six stills, all on this
Mac, then deletes the video and keeps the text and stills in `media/`. One-time
setup:

    brew install ffmpeg openai-whisper

Restart Skill Garden afterwards. `SKILL_GARDEN_WHISPER_MODEL=small` uses a
bigger Whisper model. whisper.cpp also works: `brew install whisper-cpp` and
set `WHISPER_MODEL` to a ggml model file.

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
- A different port: `PORT=5000 node server.mjs`. No weekly scout:
  `node server.mjs --no-schedule`.
- **The library**: Explore reads sub-skills from the SkillGarden folder this
  repository sits in (`../skills`, `../zips`). Point elsewhere with
  `SKILLGARDEN_LIBRARY=/path/to/SkillGarden node server.mjs`. It is read-only.
- **Start at login** (optional): `bash install-login-item.sh` adds a macOS
  login item that starts Skill Garden when you log in;
  `bash install-login-item.sh --remove` takes it away. The Mac still has to be
  awake on scout day.
