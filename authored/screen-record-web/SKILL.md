---
name: screen-record-web
description: Record a real screen recording of a website or logged-in web app on macOS — the actual macOS cursor gliding between elements, real clicks, real page loads, captured with screencapture. Use when asked to record the screen, make a screen capture / screen recording of a site or product, film a UI walkthrough or product tour, or get footage of an app for an ad or demo. Handles logged-in apps (a person signs in once) and full-screen takes. Not for generating or faking UI footage.
---

# Screen recording a web app, for real

Footage where the pointer on screen is **the actual macOS cursor**, the clicks
are **real clicks the page responds to**, and the video is macOS
`screencapture` — the same thing you would get hitting record yourself. Nothing
is drawn in afterwards, no cursor is composited, no UI is mocked up.

macOS only. No npm install: it drives Chrome over the DevTools Protocol using
node's built-in WebSocket, so it needs **node 22+**.

## How it works

| piece | what it does | why this way |
|---|---|---|
| `scripts/warp.c` | moves the real cursor | `CGWarpMouseCursorPosition` needs **no Accessibility permission**; posting synthetic clicks does |
| CDP `Input.dispatchMouseEvent` | delivers the clicks | so hover states light up and pages really navigate |
| `screencapture -v -C` | records, cursor included | `-C` is what puts the pointer in the frame |

The cursor is moved by one process and the clicks by another, so both are driven
from one script — that is the only way the timing holds together.

## Run it

Commands run from this skill's folder. Always start here. It checks node, clang, Chrome, ffmpeg, and the one that
bites — whether Screen Recording is actually permitted:

```bash
node scripts/record.mjs --doctor
```

A denied Screen Recording permission does **not** error. It writes a perfectly
normal, perfectly black video. `--doctor` catches it by measuring the *variance*
of a test capture, not its brightness — a dark-themed window is legitimately
near-black, but a denied capture has no variance at all. The fix is System
Settings → Privacy & Security → Screen & System Audio Recording → allow the app
running this, **then restart that app**.

For a logged-in app, open it once and let a person sign in:

```bash
node scripts/record.mjs --open https://example.com/dashboard
```

**Never type anyone's password, and never offer to.** Ask the human to sign in,
in the window that just opened. It is a throwaway profile at
`~/.screen-record-web/chrome-profile` that keeps the session, so this happens
once and every later take just runs. If a route lands on a login page the script
stops and says so rather than recording a signed-out take.

Then dry-run the route, and shoot it:

```bash
node scripts/record.mjs --route routes/example.json --check
node scripts/record.mjs --route routes/example.json --out ~/footage
```

`--check` resolves every label without recording. Use it — a label that only
resolves halfway through a take wastes the whole take.

Tell the person to keep their hands off the mouse while it rolls. A real cursor
is a shared resource.

## Writing a route

Start from `routes/example.json`:

```json
{
  "name": "example_tour",
  "url": "https://example.com/dashboard",
  "fullscreen": true,
  "cap": 75,
  "steps": [
    { "dwell": 1.4 },
    { "click": "View syllabus", "wait": 2.4 },
    { "scroll": 3, "by": 400, "gap": 1.0 },
    { "click": "Certificates", "exact": true, "wait": 3.1 }
  ]
}
```

- `click` / `move` — matched on the visible text of links, buttons and `[role]`
  equivalents. `"exact": true` stops `Chat` matching `Chatter`; use it for nav.
- `glide` seconds of cursor travel (default 0.62) and `settle` before the click
  (0.43). A cursor that lands and clicks in the same instant reads wrong.
- `scroll` n × `by` px with `gap` seconds — real wheel events.
- `wait` / `dwell` seconds. `cap` is the recorder's fixed length; make it
  comfortably longer than the route (see below) — the extra tail is trimmed.
- `fullscreen: true` fills the display with the window. `region: "display"`
  records the whole screen instead of just the window; the default (window) is
  what you want, because it keeps the Dock and menu bar out of every frame.

Output goes to `--out` or `out/` beside the route: `<name>.mp4` at 1920 wide,
plus `<name>_16x9.mp4` when the shape needs it. The raw Retina `.mov` is kept —
it is 2× and worth re-cropping from.

## Things that have each cost a take

- **Never use macOS fullscreen (the green button, or `windowState: fullscreen`).**
  It moves the browser to its own Space, so the instant focus returns to the
  terminal the recorder films *the foreground app instead* — you get a flawless
  75-second recording of your editor. This skill maximises an ordinary window
  instead. Same look, same Space.
- **So it checks.** Before rolling it compares the page's own screenshot against
  a still of the screen where the page should be, and aborts (exit 4) if they
  disagree. Trust that abort; it means something is covering the browser.
- **`screencapture` wants values glued to the flag.** `-V80`,
  `-R0,0,1728,1117`. Separated (`-V 80`) it silently does nothing useful.
- **It discards the file on SIGINT.** You cannot stop it early. Give it a fixed
  `-V` longer than the route and trim after; the script prints the real length.
- **It refuses to overwrite.** Delete the target first, or you get "Failed to
  save to final location" *after* the take has run.
- **`-R` is in points, output is Retina pixels.** A 1728×994 region gives a
  3456×1988 file. That is why downscaling to 1920 keeps the type crisp.
- **Cursor mapping is `screenY + (outerHeight - innerHeight) + y`.** In a window
  `screenY` is the window top; in fullscreen Chrome reports the *content* top
  with `outerHeight === innerHeight`. That one formula is right in both.
- **Every CDP call needs a timeout.** A call issued while the page is navigating
  can go unanswered for ever. Unbounded, the script hangs silently after the
  take and you lose the encode. All calls here time out at 20s.
- **Sidebars that collapse to icons** on focused/reading pages lose their text
  labels, so every later `click` misses. Keep routes on pages where the nav is
  expanded, and `--check` from the page you actually start on.
- **You cannot attach to an already-running Chrome.** The debugging port only
  exists if Chrome was launched with it, hence the separate profile. The
  person's everyday Chrome, tabs and session are never touched.

## Before the footage ships

Watch it back and look for other people. Logged-in apps put real names, real
messages, real email addresses and real payment rows on screen — chat rooms and
admin tables especially. Name the timecodes that contain them and let the owner
decide to cut, blur, or re-shoot without that stop. Do not quietly ship it, and
do not quietly drop a screen they asked for.

## When this is the wrong tool

For a **public** page with no login, a headless capture is better: drive Chrome
headless, script the scroll, and rebuild 60fps from `Page.startScreencast`
frames and their timestamps. Smoother, no permissions, no cursor, and it cannot
film the wrong window. Use this skill when the session *is* the point — a
pointer moving through a real, signed-in UI.
