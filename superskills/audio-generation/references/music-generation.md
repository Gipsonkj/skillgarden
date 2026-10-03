# Music generation: prompts, lyrics, structure

> Distilled from: music (elevenlabs/skills, MIT), minimax-music-gen (MiniMax-AI/skills, MIT), songwriting-and-ai-music (nousresearch/hermes-agent, MIT), acestep (digitalsamba/claude-code-video-toolkit, MIT), media-use (heygen-com/hyperframes, Apache-2.0)

Tool-specific commands are in `music-tools.md` (MiniMax, ACE-Step, Suno) and
`elevenlabs.md` (ElevenLabs Music). Local MusicGen is in `local-open-models.md`.

## 1. Decide what you are making

| Job | Vocals? | Length | Notes |
|---|---|---|---|
| Bed under a voiceover | no | voice length + 2-4 s | sparse, mid-tempo, no busy 1-3 kHz lead |
| Jingle / sonic logo | optional | 3-15 s | one hook, ends on the tonic |
| Song | yes | 1.5-4 min | structure tags, written lyrics |
| Scene score for video | no | per scene | match scene length and arc |
| Loop for app/game | no | 8-30 s, whole bars | seamless start/end |

If the user gives a one-liner ("sad piano piece"), infer type and go. Ask only when the type
(vocal / instrumental / cover) is truly ambiguous.

## 2. Write the prompt

Write a sentence like a brief to a session musician, not a bag of tags:

```
A [mood] [optional BPM] [genre + sub-genre] [song | instrumental].
[Vocal persona OR "Instrumental, led by ..."].
[Theme or scene].
[2-3 key instruments + production texture].
[Dynamic arc].
```

Example: "A warm, hopeful 100 BPM indie folk instrumental, evoking a sunny walk through a
small-town market. Bright fingerpicked acoustic guitar, light hand claps and a whistled
melody, close and dry production. Starts sparse, adds claps at the midpoint, ends on a
gentle ritardando."

Layers to cover (pick the ones that matter): genre/era, mood, instruments, timbre (warm,
crisp, punchy, lush), production (lo-fi, studio-polished, live room), vocal, arc.

Rules:
1. **No artist, band or song names.** Describe the sound ("1960s spy-thriller brass", not a
   franchise). Most APIs reject names; it is also the safe default. (One source suggests
   artist references help ACE-Step's vocal gender; use explicit vocal tags instead.)
2. **Describe the journey**, not just the genre: "whisper to roar to whisper" gives the model
   a performance map. This matters more than any single tag.
3. **Name 2-3 instruments precisely**, leave the rest to the model.
4. **No contradictions** ("calm" + "aggressive" in the same section).
5. **Prompt in English** for best results, even when lyrics are in another language. Signal
   lyric language through the vocal or genre ("Japanese female vocalist", "Mandopop ballad").
6. **Put BPM/key in structured params** when the tool has them (ACE-Step `--bpm`, MiniMax
   `--bpm`); otherwise write them in the prompt.
7. **Sparse prompts give variety, dense prompts give control.** If outputs sound samey,
   loosen the prompt, vary seeds, or vary BPM/key between scenes.
8. Use the negative/exclude field for what must not appear ("vocals", "heavy drums").

### BPM and key cheat sheet

| Feel | BPM | Typical key |
|---|---|---|
| Meditative, ambient | 50-72 | D major / modal |
| Ballad | 60-80 | minor for sad, major for warm |
| Mid groove, lo-fi, demo bed | 80-110 | F major |
| Corporate / product bed | 105-115 | C major |
| Upbeat launch, tech | 120-130 | G major |
| Driving, CTA, sport | 130-160 | E major |
| Tension / problem scene | 80-90 | A minor / D minor |

## 3. Vocal persona

Describe a character, not a gender: "a weathered torch singer, smoky alto with slight rasp,
starting fragile and building to full power". "Female vocal" alone is often ignored. Reinforce
it in two places: the style prompt and a tag before each lyric section (`[female vocal]`).
Duets: tag who sings each section (`[Verse 1 - male vocal]`, `[Chorus - duet, harmonies]`).

## 4. Write lyrics

Structure skeletons: ABABCB (verse/chorus/verse/chorus/bridge/chorus, most pop), AABA
(standards), AAA (folk storytelling). Energy map (0-10): intro 2-3, verse 5-6, pre-chorus 7,
chorus 8-9, final chorus 9-10. Contrast is the main tool: sparse before dense, quiet before loud.

- **Hook**: the title phrase, first or last line of the chorus. Repeat it.
- **Lines**: 6-10 syllables, matched across parallel lines. Stressed syllables matter more
  than the total count. Read it aloud; if you stumble, rewrite.
- **Rhyme**: mix perfect, family, assonance and slant rhymes. All-perfect sounds like a
  nursery rhyme.
- **Show, don't tell**: concrete images beat stated feelings.
- Avoid autopilot cliches and Yoda word order forced by rhyme.
- Never reproduce copyrighted lyrics, including for covers. Write original words on the theme.

### Tags and typography (Suno, ACE-Step, MiniMax, ElevenLabs plans all honor bracket tags)

- Structure: `[Intro] [Verse] [Pre-Chorus] [Chorus] [Bridge] [Instrumental] [Guitar Solo]
  [Build] [Drop] [Breakdown] [Outro] [End]`
- Performance: `[Whispered] [Spoken Word] [Belted] [Falsetto] [Harmonies] [Raspy]`
- Dynamics: `[Building Energy] [Explosive] [Quiet arrangement] [Slow Down]`
- 5-8 tags per section maximum. Always tag structure, or you get a flat verse/chorus loop.
- `UPPERCASE` = louder, more intense. `(parentheses)` = backing vocals. `lo-o-ove` = held note.
  `I... need... you` = dramatic pauses.

### Phonetics for AI singers

AI vocalists pronounce, they do not read. Spell numbers ("twenty four seven"), space acronyms
("A I"), respell tricky names, hyphenate syllables ("bio-en-gi-neer-ing"). Test unusual words
in a 30 s clip first: pronunciation cannot be fixed after generation.

### Parody / adaptation

Map the original first: syllables per line, rhyme scheme, stressed syllables, held notes.
Put new stressed syllables on the same beats (+/- 1-2 unstressed syllables allowed). On held
notes match the vowel sound. Keep a few original lines for recognizability.

## 5. Generate and iterate

1. Show the user a short preview (type, description, lyrics source) before spending credits on long or vocal tracks.
2. Generate 3-5 takes. Expect 3-5 generations per keeper.
3. Choose on the overall arc and hook first; fix sections later (repaint / inpaint / extend)
   instead of rerolling the whole song.
4. Lock the seed while you iterate on wording; change seeds when you want variety.
5. When extending, restate genre and mood, or the style drifts.
6. Keep earlier versions (`_v1`, `_v2`) for comparison.

## 6. Fit music to picture or voice

- Plan scene durations from the voiceover first, then generate to those lengths.
- One long bed across several scenes sounds more coherent than many short cues.
- Do not assume the track's first seconds are the best edit point: compare 5 s sections and
  start on a clean musical entrance; add a short fade-in and a longer fade-out.
- Under narration use instrumental only, and mix it 18-24 dB below the voice (see
  `mixing-and-mastering.md`). Vocal tracks only where the music is the point (title, CTA, montage).
- For a brand sound across a project: fix the seed and style text, vary only duration.
