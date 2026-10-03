# Skill Garden: how to use it

## 1. Start the app

Double-click `local/Start Skill Garden.command`, or in Terminal:

```bash
cd ~/Desktop/Claude/SkillGarden/skillgarden-app/local && node server.mjs
```

Open http://localhost:4747 and keep that window open. To have it start by
itself when you log in, run `bash install-login-item.sh` once from the same
folder (`--remove` undoes it).

The 29 super skills are already loaded. If you change a super skill folder by
hand, load it again with `node import-superskills.mjs` while the app runs.

## 2. Find what you need

- **Explore** is the catalog: 29 crafts, each with one super skill and its
  ranked sub-skills (best first, with stars, license and author).
- **⌘K** (or `/`) searches every craft and all 706 skills, and runs actions
  like "Download all super skills".
- **Preview** opens any guide or sub-skill in a side panel before you download.
- **Bundle**: press "+ Bundle" on super skills and sub-skills, then download
  them together as one zip with a README.
- Skills marked **Link only** have a non-commercial license or no license that
  allows sharing. Open them at the source instead.

## 3. Install a super skill

**Claude Code** (every project):

```bash
unzip ~/Downloads/motion-animation.zip -d ~/.claude/skills/
```

For one project only, unzip into that project's `.claude/skills/`. Start a new
session afterwards.

**claude.ai**: Settings → Capabilities → Skills → upload the zip, then turn it
on.

To install all 29 at once, download "all super skills" and unzip that file
into `~/.claude/skills/` the same way.

## 4. Use it in a session

You don't have to name it. Ask normally ("animate this modal so it feels
snappy") and Claude loads the matching super skill from its description. The
router then opens only the guide your task needs.

To be explicit:

- `Use the motion-animation skill: <task>`
- Name a capability to steer it: `Use website-building, deploy to Vercel`
  or `Use google-ads, audit my search campaign`.
- Each craft page lists its capabilities under "What it can do" and two
  "Try asking" examples.

A sub-skill works the same way: unzip its folder into `~/.claude/skills/`. You
only need a sub-skill when you want that author's full version, scripts
included. The super skill already carries the best of each one.

## 5. Weekly updates

- Every Sunday at 06:51 India time (03:21 your time) the scout checks
  skills.sh, skillsmp.com, the GitHub repos in each super skill's CREDITS.md
  and the web for new and trending skills, one craft at a time.
- For each craft it may write one **new generation** of the super skill,
  test it against the current one in blind trials, and leave the winner in
  **Review**. Nothing changes until you press Add there.
- After you approve, Explore and every download serve the new version.
  Re-download it (or reinstall the bundle) to get it in your sessions.
- The Mac must be awake with Skill Garden running on scout day. If it wasn't,
  the scout catches up the next time the app runs and a week has passed.
- **Run scout now** starts a run straight away. It uses your Claude plan, so
  a full run over 29 crafts takes a while.
- Pause it from the Scout log tab.

## 6. Safety notes

- Third-party scripts inside skills are copied as their authors wrote them.
  Read a script before you run it. About 38 library skills contain
  `curl … | sh` installers (mostly vendor CLIs).
- `qiaomu-mondo-poster-design` was removed: its scripts sent an API key and
  your prompts to third-party gateways. Skills that need care are marked
  "Read the note before use" in Explore, for example `last30days` (asks during
  setup to read your browser's X cookies; say no unless you need X), `notebooklm` (drives your Google
  account through browser cookies), `media-use` (anonymous usage telemetry,
  can be turned off), the sickn33 Instagram skill (uploads images to public
  Imgur) and the Convex skill (sends transcripts to Convex).
- The scout won't propose a change that adds a `curl … | sh` line, cookie
  reading, telemetry, a spoofed request origin or a removed skill; Review
  blocks it.
- Trading skills default to paper/testnet and never place a real order
  without your confirmation, one order at a time. None of them is investment
  advice.

## 7. Restart or stop

Stop: close the Terminal window (or `bash install-login-item.sh --remove` if
you installed the login item). Start again with step 1.
