> Distilled from: presenter-notes (mohitagw15856/pm-claude-skills, MIT); presentation-creator speaker-notes and output-formats (mblode/agent-skills, MIT); tech-talk-outline (samber/developer-relations-skills, MIT); presenting-conference-talks (Orchestra-Research/AI-Research-SKILLs, MIT); html-ppt presenter mode (lewislulu/html-ppt-skill, MIT); public-speaking (RefoundAI/lenny-skills, MIT); ppt-master speaker-notes branch (hugohe3/ppt-master, MIT); scientific-slides timing guidelines (K-Dense-AI/scientific-agent-skills, MIT)

# Speaker notes

Notes fail at both extremes: a full script gets read aloud (the room hears reading in one sentence), and a blank pane loses the transitions, the timing and the one number that mattered. Working notes are **cue-grain** with a small verbatim set, timing marks and a Q&A crib. Write them after the slides exist and update them after every rehearsal.

## 1. Ask first

- The deck (notes attach to real slides; assertion titles half-write the cues).
- Slot length and stakes (a 10-minute board readout gets tighter marks than a 45-minute training; high stakes earn more verbatim capture).
- The presenter's failure mode, honestly: over-scripts and reads? Wings it and rambles? Freezes on numbers? Design the notes to compensate. Some speakers do want full sentences; give them, but bold the cue words so the eye can jump.
- The hard questions expected.

## 2. Per-slide cue notes

```
[7] Retries tripled load during the outage   (≈ 0:09)
Point: retries, not traffic, broke us
Beats: request graph (watch the red line) → why retries stacked → what the client did wrong
Exit: "So the fix wasn't more capacity. It was fewer retries."
```

- **Point** in 6 words or fewer: the one thing they must remember.
- **Beats** in order, as phrases: 2-3 prompts, an optional example or anecdote.
- **Exit**: the transition line to the next slide, verbatim.
- Cues where useful: (pause), (click), (show of hands), (emphasize), (scan room), "what to watch" before a chart or demo.
- By slide type: statement and question slides get the reasoning and implication (pause after a question before answering); data slides get the story the numbers tell and what surprised you; dividers get one line of framing; the recap touches each point once and adds the synthesis, it doesn't re-present.
- Length: 3-4 sentences or 3-5 phrases per slide for a live talk. A reading deck needs notes only where the slide isn't self-explanatory.

## 3. The verbatim set

Only these get full sentences, because paraphrasing them live breaks things:
- **Transitions**: the thread sentences that carry the arc from slide to slide.
- **Numbers with their exact caveats**: "$2.1M, excluding the pilot cohort". A garbled caveat becomes a correction email.
- **The open and the close**: the two moments nerves hit hardest. A nearly memorised first line buys composure; the close repeats the arrow and the ask.

## 4. Timing marks

- Mark where you should be at T/4, T/2 and 3T/4 ("T/2 @ slide 11 ≈ 0:15"), plus a clock time at each section boundary.
- Pre-decide the cuts: "behind at slide 9 → skip 11-12 (appendix holds them), say: 'the details are in the appendix; the short version is...'". Cutting live cuts the wrong thing.
- Mark the never-cut slides: hook, moment of realization, arrow, ask. Cut discussion before results; never skip the conclusion.
- Rough per-slide budgets for planning: lightning and spotlight 30-60 s; oral 45-90 s; invited 60-120 s; title and divider slides 15-30 s. Measure the speaker's real rate in rehearsal instead of trusting a table.

## 5. Q&A crib

5-8 likely questions, each with answer beats and the backup slide that answers it:

| Likely question | Answer beats | Backup |
|---|---|---|
| "Isn't the drop just seasonality?" | Same months last year flat; cohort split; control region | A3 |
| "What does this cost us?" | One-off 2 eng-weeks; no infra change | A5 |

Build it from real anticipated objections (the pillars a sceptic would attack, the numbers people will check, the "why didn't you do X?"). Backup slides go after the closing slide, numbered, with assertion titles too.

## 6. Narration scripts (recorded or TTS)

When notes will be read by a voice or recorded word for word, write prose, not cues: no bullets, labels or stage directions; one language; spell out numbers and symbols the voice would misread; cover every claim visible on the slide in the order it reveals, and say the takeaway of each chart rather than every value. Turning narration into video or audio: `ai-video` and `audio-generation`.

## 7. Where notes go

| Format | Notes slot |
|---|---|
| PowerPoint | Notes pane: PptxGenJS `slide.addNotes()`, python-pptx `slide.notes_slide.notes_text_frame.text` |
| Google Slides | The slide's speaker-notes shape (`speakerNotesObjectId`) |
| Keynote | Presenter notes (`slide.presenterNotes` in JXA) |
| Single-file HTML | Hidden `<div class="notes">` or an HTML comment |
| Slidev | HTML comment at the end of the slide; `[click]` markers sync with builds |
| Marp | HTML comment at the end of the slide; must not parse as `key: value` (it becomes a directive) |
| reveal.js | `<aside class="notes">` or a `Note:` line; `S` opens the speaker view |
| Beamer | `\note{...}` |

Never a text box on the slide. Export a notes copy (`marp --notes`, PDF with notes, or a Markdown file) for printing or a second device.

## 8. Notes document format

```markdown
# Presenter notes: <talk>, <T> min
## Per slide
**[n] <title>** (≈ m:ss) point: ... · beats: a → b → c · exit: "..."
## Verbatim set
Open: "..." · Close and ask: "..." · Numbers: "..."
## Timing marks
T/4 @ slide _ · T/2 @ _ · 3T/4 @ _ · Behind: skip [slides], bridge: "..."
## Q&A crib
| Question | Beats | Backup |
```

## Checklist

- [ ] Cue grain everywhere except the verbatim set
- [ ] Every transition verbatim; numbers carry exact caveats
- [ ] Timing marks, pre-decided skips and never-cut slides marked
- [ ] Q&A crib with backup slide numbers
- [ ] Notes in the format's notes slot, not on the slide
- [ ] One full rehearsal run from these notes, and the notes updated after it
