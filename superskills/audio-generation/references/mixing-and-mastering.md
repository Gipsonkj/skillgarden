# Mixing, ducking, loudness and delivery

> Distilled from: hyperframes-audio (heygen-com/hyperframes, Apache-2.0), media-use (heygen-com/hyperframes, Apache-2.0), acestep (digitalsamba/claude-code-video-toolkit, MIT), asr-transcribe-to-text (daymade/claude-code-skills, MIT)

A mix is a set of relationships. Two tracks that sound fine alone can fight together; the
fix is rarely "turn one down", it is giving the contested frequencies to the track that needs them.

## 1. Levels that work

| Element | Level |
|---|---|
| Voice (dialogue, narration) | reference, normalize first |
| Music bed under voice | 18-24 dB below the voice (linear gain ~0.06-0.12); about -31 LUFS under a -16 LUFS voice |
| Music with no voice (title, montage) | full level, ~0.9 |
| SFX accents | ~0.3-0.4 of voice level (-8 to -10 dB) |
| Ambience under dialogue | 20-30 dB below the voice |

Remotion example: `<Audio src={vo} volume={1} />` + `<Audio src={bed} volume={0.12} />`.

### Loudness targets (integrated LUFS, true peak)

| Destination | Target |
|---|---|
| Podcast, web video, Apple Podcasts | -16 LUFS, -1 dBTP |
| YouTube, Spotify, social | -14 LUFS, -1 dBTP |
| Broadcast (EBU R128) | -23 LUFS, -1 dBTP |
| Mobile app UI sounds | consistent with each other, peaks <= -3 dBFS |

## 2. Diagnose before fixing

You often can't listen. Measure instead, and compare against something **inside the same
file**: the clean original if it exists, or the pauses (whatever is audible in a gap is
noise or room, not the voice). A single voice's absolute spectrum can't be judged: formants
vary +/-10 dB, fundamentals run 85-255 Hz, sentences fall 5-6 dB at the end. If there's no
reference and no silence, say the defect is ambiguous rather than guessing.

```bash
ffmpeg -i in.wav -af ebur128=peak=true -f null -  2>&1 | tail -12     # loudness + true peak
ffmpeg -i in.wav -af volumedetect -f null - 2>&1 | grep -E "mean|max"  # quick levels
ffmpeg -i in.wav -af silencedetect=n=-45dB:d=0.4 -f null - 2>&1 | grep silence_  # find pauses
```

## 3. Symptom -> fix

| It sounds like | Band | Fix |
|---|---|---|
| Hum, rumble, handling thumps | 20-80 Hz | high-pass at 80 Hz (`highpass=f=80`) |
| Boomy, too close to mic | 80-250 Hz | -4 dB at 200 Hz, Q 1.4 |
| Muffled, "behind cardboard" | 250-600 Hz | -3 dB at 250 Hz, Q 1.2 |
| Boxy small room | ~400 Hz | -3 dB at 400 Hz, Q 1.4 |
| Words hard to make out | 2-5 kHz | +2.5 dB at 3 kHz, Q 1, or carve the music bed |
| Harsh, tiring | 3-5 kHz | -3 dB at 3.2 kHz, Q 1.6 |
| Sibilant "s" | 5-10 kHz | a real de-esser; a static EQ cut dulls everything |
| Dull, closed | 10-20 kHz | gentle high shelf lift |
| Uneven word levels | - | compressor ~3:1, threshold -18 dB |
| Room tone between sentences | - | gate (it does not remove noise under speech) |
| Background noise under speech | - | voice isolation / denoise model, not EQ |
| Peaks clipping | - | limiter last, ceiling -1 dBTP |
| Voice and music fighting | 1-3 kHz | carve or sidechain-duck the bed, never EQ the voice |

**Chain order**: subtract (high-pass, mud cuts) -> level (compressor) -> relationships
(carve/duck the bed against the voice) -> character and space (saturation, reverb) -> limiter
last. A compressor before the high-pass wastes itself chasing rumble; anything after the
limiter is not bounded by it. Keep reverb/delay wet lower than sounds right solo, and only
on things that sit behind the voice.

Voice cleanup in one ffmpeg line:
```bash
ffmpeg -i vo.wav -af "highpass=f=80,equalizer=f=250:t=q:w=1.2:g=-3,acompressor=threshold=-18dB:ratio=3:attack=5:release=120,equalizer=f=3000:t=q:w=1:g=2.5,alimiter=limit=0.89" vo_clean.wav
```

## 4. Music under voice: carve and duck

A plain volume duck works but makes the music limp for the whole voiceover. Better: cut the
bed only in the voice's bands (about 250 Hz-2.5 kHz, deepest around 1.6 kHz) and only while
someone speaks, releasing slowly (300-600 ms) so the music doesn't snap back like a machine.
A strong carve is ~7 dB in those bands (~15 dB at 1.6 kHz) plus up to ~19 dB of level room.
If the bed sounds notched rather than quieter, the carve is too strong.

Rules: carve/duck the **bed** against the voices, never the voice against itself. Treat all
narration clips as one voice group, so a clip added later still ducks the bed. Keep SFX and
music out of that group, or the bed starts ducking under whooshes.

Sidechain duck with ffmpeg (bed = input 0, voice = input 1):
```bash
ffmpeg -i bed.wav -i vo.wav -filter_complex \
 "[1:a]asplit=2[vo][sc];\
  [0:a]volume=0.25,equalizer=f=1600:t=q:w=1:g=-6[bedeq];\
  [bedeq][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=500[bed];\
  [bed][vo]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.89[out]" \
 -map "[out]" mix.wav
```

## 5. Everyday ffmpeg recipes

```bash
# loudness normalize (two-pass is more accurate; one-pass shown)
ffmpeg -i mix.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 48000 mix_norm.wav
# join numbered TTS chunks (same format) without re-encoding
for f in chunks/*.wav; do echo "file '$PWD/$f'"; done > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy joined.wav
# insert 0.4 s gaps between dialogue lines: generate silence once and list it between files
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.4 gap.wav
# fade in 0.5 s, fade out the last 3 s of a 60 s bed
ffmpeg -i bed.wav -af "afade=t=in:d=0.5,afade=t=out:st=57:d=3" bed_f.wav
# crossfade two cues over 2 s
ffmpeg -i a.wav -i b.wav -filter_complex "[0][1]acrossfade=d=2:c1=tri:c2=tri" ab.wav
# trim to a section (start 12 s, 30 s long)
ffmpeg -ss 12 -t 30 -i track.mp3 -c:a pcm_s16le cut.wav
# loop a seamless ambience to 90 s
ffmpeg -stream_loop -1 -i amb.wav -t 90 amb90.wav
# put the final mix under a video
ffmpeg -i video.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest final.mp4
```

Sample rates: keep one rate per project (48 kHz for video, 44.1 kHz for music/podcast).
Resample once (`-ar 48000`), not at every step.

## 6. Delivery formats

| Use | Format |
|---|---|
| Editing / mixing masters | WAV 24-bit or 16-bit, 48 kHz |
| Podcast | MP3 128-192 kbps (mono speech can be 96 kbps) or AAC |
| Web/app playback | AAC/M4A 128 kbps or Opus 64-96 kbps |
| Archive | FLAC |
| Telephony / IVR | 8 kHz mu-law or A-law WAV |

Encode lossy formats once, at the end. Never re-encode MP3 to MP3.

## 7. Verify the mix

- Measure integrated loudness and true peak against the target.
- Listen (or transcribe) at the busiest moment: the voice must be legible over the bed.
- Check the bed comes back up between phrases and fades out instead of stopping dead.
- Check reverb/delay tails aren't cut by the end of the clip.
- Check the final file length matches the picture; no silent tail.
