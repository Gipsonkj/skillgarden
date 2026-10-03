# Delivery and QA

> Distilled from: lanshu-create-ai-presenter-video qa-recovery (cclank/lanshu-create-ai-presenter-video, MIT); ffmpeg-skill (kajisho5/ffmpeg-skill, MIT); video-use self-eval (browser-use/video-use, MIT); brag step-4-deliver (latent-spaces/brag, MIT); hyperframes review loop (heygen-com/hyperframes, Apache-2.0); video-editing (affaan-m/everything-claude-code, MIT). `scripts/lanshu-create-ai-presenter-video/finalize_delivery.sh` is copied as-is (MIT, license beside it).

A video is done when the file probes right, decodes fully, measures right, looks right on a contact sheet and the user has seen a preview. Not before.

## 1. Platform specs (verify against the platform's current docs before a client delivery)

| Destination | Frame | Max length (typical) | Loudness | UI safe zone (top / bottom / right) |
|---|---|---|---|---|
| TikTok | 1080x1920, 9:16 | 10 min | -14 LUFS, TP ≤ -1 dBTP | 10% / 22% / 14%, plus 5% left |
| Instagram Reels | 1080x1920 (also 4:5, 1:1) | 90 s for Reels ads/templates; longer allowed for posts | -14 LUFS | 8% / 20% / 12% (Meta ad guidance: leave about 14% top and 35% bottom clear) |
| YouTube Shorts | 1080x1920 | 3 min | -14 LUFS | 6% / 18% / 12% |
| YouTube | 1920x1080 (4K 3840x2160) | 12 h | -14 LUFS | 5% title-safe border |
| X | 1280x720 or 1920x1080, also 1:1 | 140 s (standard accounts) | -14 LUFS | 5% border |
| LinkedIn | 1080x1080, 1920x1080, 4:5 | 10 min | -14 LUFS | 5% border |
| Facebook feed | 1920x1080, 4:5, 1:1 | 240 min | -14 LUFS | 5% border |
| Podcast / audio | n/a | n/a | -16 LUFS, TP ≤ -1 dBTP | n/a |
| Broadcast (EBU R128) | 1920x1080 | n/a | -23 LUFS | 5% action / 10% title |

Codec default: H.264 High, `yuv420p`, constant frame rate, AAC 48 kHz stereo (160 to 256 kbps), `+faststart`, BT.709 tags. Keep the source fps unless asked (24 cinematic, 30 social and screen, 60 for fast motion). Keep HDR only when the destination supports it; otherwise tone-map to SDR.

## 2. Export commands

```bash
# Social master from any render: even dims, CFR, BT.709, fast start, -14 LUFS (single pass; use two-pass below for tight targets)
ffmpeg -i render.mp4 -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p" -fps_mode cfr -r 30 \
  -c:v libx264 -preset slow -crf 18 -profile:v high -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart final.mp4

# Measure loudness and true peak
ffmpeg -hide_banner -i final.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
```

Two-pass loudnorm (accurate): run `loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json` once to measure, then pass `measured_I`, `measured_TP`, `measured_LRA`, `measured_thresh`, `offset` and `linear=true` in the second pass. "Normalized" audio can still clip, so check true peak. Don't push near-silent ambience (-40 LUFS or quieter) up to a speech target.

## 3. One-command finalize (when you have a rendered file with audio)

```bash
PROGRAM_LUFS=-14 bash scripts/lanshu-create-ai-presenter-video/finalize_delivery.sh renders/video.mp4 outputs my-video
```

It builds everything in a temp dir and publishes only if all checks pass:
- two-pass loudness to the target (default -16; set `PROGRAM_LUFS=-14` for social), ±0.5 LU, true peak ≤ -1 dBTP;
- `my-video-master.mp4` (CRF 16, slow, 256k AAC) and `my-video-share.mp4` (CRF 24, 160k), even dims, CFR, BT.709, fast start, metadata stripped;
- a full decode of both files;
- black-frame and freeze event counts (`blackdetect`, `freezedetect`);
- a 3x3 contact sheet at 0.2 s, eighths and the end;
- `my-video-delivery-report.json` with probes and measurements (machine paths removed).

It refuses to overwrite existing outputs and fails loudly on silent audio. Check every reported freeze against an intentional still.

## 4. Visual QA

- **Contact sheet at the right moments:** scene midpoints, every cut boundary (±1.5 s), first 2 s, last 2 s, the strongest musical hit. One sheet beats many single frames (each image you inspect costs context).
- Shade the platform safe zones on a frame and confirm no caption, CTA or face sits under the app UI.
- Look for: flashes or jumps at cuts, text over faces, washed-out text, overlapping captions, wrong overlay frames, grade drift between segments, fallback fonts, tofu glyphs, black bars that shouldn't be there, a frozen picture under overlays.
- No vision available? Say "pixels not inspected" rather than claiming a check you didn't do.
- For anything the user will publish (launch, ad), get one fresh-eyes critique: a sub-agent given only the render, the plan and the checklist, briefed to rank problems with timecodes and name the 5 fixes to do first.

## 5. Audio QA

- Integrated loudness and true peak on the final file (not just the sections).
- RMS per section (dialogue, music-only, end card): an end card 15 dB under dialogue, or SFX louder than speech, is a bug.
- No clicks at cuts (waveform spikes at boundaries), no doubled tracks or echo (video audio not muted under narration), no truncated tail.
- ASR the final narration once more if it was generated: no omissions, additions or wrong numbers.

## 6. Poster frame / thumbnail

Pick the strongest **settled** beat (text fully in, before exit), extract it at full resolution, and bake it in as frame 0 so every platform's auto-thumbnail shows it:

```bash
ffmpeg -ss 3.2 -i video.mp4 -frames:v 1 -q:v 2 poster.jpg
ffmpeg -y -i video.mp4 -i poster.jpg -filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]" \
  -map "[v]" -map 0:a? -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart video.poster.mp4
```

At 30 fps the poster shows for 1/30 s: invisible on playback, but it is what Slack, X and Discord grab. Keep `poster.jpg` for platforms that accept a custom thumbnail.

## 7. Approval gates

1. Checks pass (lint/check, probe, loudness).
2. Show the preview (Studio URL or a draft render) plus the contact sheet; ask one question: render now, or what changes?
3. Render the final only on a yes. Don't re-run checks after the final render unless something changed.
4. If the run worked well, offer once to save it as a reusable recipe or template.

## 8. Hand-off report (five lines)

```
Done: final.mp4 — 59.98 s, 1080x1920, 30 fps, H.264, AAC stereo, -14.1 LUFS / -1.3 dBTP
Steps: cut 0:12-1:12 -> reframe 9:16 crop -> captions (pop, karaoke) -> loudness -14 -> export reels
Check: reels spec pass; full decode ok; 0 black / 1 freeze (intended title hold)
Look: final_sheet.png (captions inside safe area, logo top-right)
Notes: source was VFR, conformed to 30 fps; voiceover is TTS voice "leo"; Runway cost about 120 credits
```

On failure, start with `Failed:` and quote the exact error. Never describe a fix you didn't run. Also hand over the plan, beat sheet or EDL and the project folder so edits are cheap.

## 9. Recovery quick table

| Problem | Fix |
|---|---|
| Interrupted remote job | Poll the saved task ID; resubmit only after a confirmed failure |
| Voice changes between sections | One TTS configuration; regenerate the odd section, re-normalize, re-ASR |
| Render louder than source | Video tracks not muted; mute them and re-run whole-program two-pass loudnorm |
| Presenter identity drifts between segments | One continuous source sliced by time; or lock seed, framing, light, and hold quiet edges |
| Mouth late, body fine | Keep motion plate; lip-sync repair with the locked audio |
| Captions misaligned after concat | SRT built in source time; rebuild in output time |
| Frozen picture under overlays | Re-encode the source with dense keyframes |
| Black tail | Clamp durations to the probed media length |
| Thumbnail is a blank intro frame | Bake the poster as frame 0 |
