---
name: cinematic-demo-sites
description: "Turn a local business into a deployed, scroll-scrubbed cinematic demo website for ~€0. Covers the full pipeline — photoreal AI stills (Nano Banana) → image-to-video clips on a self-hosted RunPod Wan 2.2 endpoint (FREE) → ffmpeg crossfade + JPG frame sequence → scroll-hero HTML template → Cloudflare Pages deploy. Includes the exact still + motion prompting formulas that produce photoreal, non-warping results. Use when building a demo/marketing site with a full-bleed film hero that advances on scroll, or when prompting Nano Banana stills or Wan i2v clips for cinematic realism."
---

# Cinematic Demo Sites — the repeatable recipe

How to turn a business name into a deployed, scroll-scrubbed cinematic demo site for ~€0.
This skill is the method + the prompting that makes the video look good. It ships no code:
each step says what its script has to do, so you can write it for your own project.

## The effect
A one-page site whose hero is a **full-bleed film that advances as you scroll** — built from
3 AI stills animated into short clips, stitched into one continuous scrub. Below the hero: a
short story, 3 offer tiles, a contact/booking CTA. It feels expensive and personal, so the
owner thinks "that's my shop, I want this."

## Why the video looks so good (the core insight)
1. **Start from a real photo, not text.** Generate a photoreal still first (Nano Banana),
   then animate THAT still (Wan image-to-video). Video from a real photo stays photoreal;
   the food/room/face stays sharp. Text-to-video drifts and looks fake — never use it here.
   **Corollary: i2v is faithful, so it will faithfully animate an AI-looking still.** If a
   clip reads as fake, the still is at fault — re-render the still, not the video. When a
   real person, a period setting, or plain photorealism is involved, read
   `references/photoreal-people.md` BEFORE writing the still prompt; it has the shot-not-
   generated formula, the identity-lock method, and the RunPod timeout fix.
2. **Minimal, slow motion.** One gentle movement per clip ("slowly rotating", "steam rising",
   "turning her head slightly") + the words **"slow, no cuts"**. Big motion makes Wan warp
   (melting glass, extra fingers, morphing). Small motion never warps. The *cuts* carry the
   story, not the motion.
3. **Show detail as crisp stills, motion as ambience.** Food and fine detail read best barely
   moving; let the crossfades do the drama.
4. **It's on the user's own Wan endpoint → €0.** Only the 3 stills are paid.

## Pipeline (6 steps)
1. **Tokens** — palette (4–6 hex), display + body font, one signature idea, all derived from
   the subject's own world. Avoid AI-default looks (cream + terracotta serif; near-black +
   acid-green). Every business must feel distinct.
2. **Stills** — 3 photoreal stills via Nano Banana Pro on the Gemini API (key in
   `$GEMINI_API_KEY`; set it first), 16:9 = 1376×768 or 9:16 = 768×1376. See prompting formula below.
3. **Motion (Wan, FREE)** — animate each still into a ~5 s clip on the RunPod Wan 2.2 i2v
   endpoint. See motion formula + params below.
4. **Stitch** — normalise the 3 clips, crossfade (0.6 s), extract a **JPG** frame sequence
   (~85 frames) + poster, with one stitch script per aspect (16:9 and 9:16). ffmpeg
   only — many builds have no webp encoder, so always use mjpeg/JPG.
5. **Assemble** — inject tokens + real copy in the business's own language into a
   scroll-hero HTML template, driven by one config file per site (tokens and copy).
6. **Ship** — deploy to a new Cloudflare Pages project, then add a card to your own
   showcase page if you keep one.

## STILL prompting formula (Nano Banana)
`[specific subject with real props], [emotion/action], [warm | atmospheric | dramatic] light, cinematic photorealistic, 16:9`
- Food → append **"appetising, cinematic food photography"**. Rooms → **"moody atmospheric
  dramatic light"**. People → **"confident, warm light"**.
- 3 stills follow **heritage → craft → payoff**:
  1. the place / origin, wide and atmospheric
  2. the craft up close — hands, the core element (fire, blade, dough, the pour…)
  3. the result — the finished dish, or a happy person
- Be concrete with props and place; avoid logos and text-in-image.

## MOTION prompting formula (Wan 2.2 image-to-video)
`[one subtle, specific motion taken from the still], slow, no cuts`
Real examples that worked:
- "the doner spit slowly rotating, meat glistening and dripping, heat-lamp glow, slow, no cuts"
- "steam gently rising off a fresh currywurst, close-up, slow, no cuts"
- "a woman with glossy styled hair turning her head slightly, warm light, slow, no cuts"
- "a Turkish grill platter, steam gently rising, warm light, slow push in, no cuts"

**Wan call params** (RunPod serverless `/run`, poll `/status/<id>`; auth is
`Authorization: Bearer $RUNPOD_API_KEY` on your own endpoint, so set that key first):
`prompt`, `image_base64` (RAW base64), `negative_prompt: "blurry, low quality, distorted,
warped, deformed, extra fingers, mutated hands"`, `cfg: 2.0`, `width`, `height`, `length: 81`,
`steps: 10`, `context_overlap: 48`. 16:9 → 1280×720, 9:16 → 720×1280. Output `{ video: <base64 mp4> }`.
Write two runners: one clip, and a batch (submit many → poll → save each). Give the poller a
window in minutes (default 40; use 150–180 for congested queues).

### Wan gotchas learned the hard way
- **Don't over-submit.** The endpoint has limited workers. 50+ jobs at once → most sit in
  queue past the poll deadline and get dropped ("saved 6/31, failed 0"). Submit in waves, or
  use a long poll window + a retry loop that re-renders only the
  still-missing clips until none remain.
- A poller launched with `nohup … &` survives, but its exit won't notify the harness; a plain
  tracked background task does. Prefer tracked background tasks so you know when it's done.
- `executionTimeout` at **81 frames / 1280×720 is reproducible, not occasional** (~630 s).
  Fix by dropping `length` to ~57 and KEEPING 720p — not by dropping resolution. A 1024×576
  clip survives but is visibly soft and collapses if you later push in on it.
- RunPod Wan endpoints return **base64, not a URL**.

## Design rules (non-negotiable)
- Full-bleed **canvas image-sequence**, NEVER a scrubbed `<video>` (stutters on iOS Safari).
- Mobile-first: `ResizeObserver` + `100dvh` (fixes the "shows half on phone" bug).
  `prefers-reduced-motion` → static poster.
- Real copy in the business's language (not translated English). One `<h1>`. Contact CTA in one tap.
- Appointment verticals (barber, spa, tattoo, dental, nails, salon, workshop, gym) → add a
  booking block: 3-step flow + mock day/time picker (selected highlighted, booked crossed
  out) → WhatsApp/tel CTA.
- Demo honesty: a "DEMO · <your studio>" badge + credit footer + copy-protection deterrents.
  Label a real business's concept demo as *not the official site*.

## Deploy (Cloudflare Pages) — headless auth is the tricky part
`wrangler`'s cached **OAuth login only works in an interactive TTY**. From a non-interactive
shell it errors ("necessary to set CLOUDFLARE_API_TOKEN"). Two working paths:
- **Best: a scoped API token.** `export CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=…` then
  `wrangler pages deploy` works headless.
- **PTY fallback:** wrap the call in `script -q /dev/null npx wrangler …` to fake a TTY — but
  this only works if the OAuth token is still valid (expired token → interactive re-login
  timeout).
`wrangler pages deploy` does **not** auto-create the project — run
`wrangler pages project create <slug> --production-branch=main` first (idempotent).
Production URL is the clean alias `https://<slug>.pages.dev` (the hash-prefixed URL in the
output is deployment-specific — use the clean one in showcase links).
Once there are several sites, script one command that deploys every built site.

## Sourcing when the usual keys are dry
Checked 2026-08-10: the direct **Nano Banana key can hit `429 RESOURCE_EXHAUSTED`** ("prepayment
credits are depleted" → top up at ai.studio), and a **RunPod FLUX Kontext endpoint used as a
backup was gone (404)**. For stills, top up the key.
For video, stay on the user's own RunPod Wan endpoint — they rated Artlist's video output
noticeably worse, and it cost 1,500 cr a clip at 1080p.

## Cost per site
3 stills (the only paid step) + 3 Wan clips (**€0**, own endpoint) + Cloudflare Pages (free)
= 3 image generations + ~30 min render. A batch of 5 ≈ 15 stills.

Read `references/nano-banana-prompting.md` BEFORE writing any still prompt — it has
the vendor's own two prompt formulas and the positive-framing rule (Nano Banana does
NOT subtract, so "no cars" must be written as "an empty street").

See `references/prompt-library.md` for a ready-to-use bank of still + motion prompts by
business type.
