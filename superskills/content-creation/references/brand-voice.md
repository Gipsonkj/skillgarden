# Brand voice: extract it, document it, enforce it

> Distilled from: brand-voice (affaan-m/ECC, MIT), brand-voice-enforcement (anthropics/knowledge-work-plugins, Apache-2.0), copywriting-tone-of-voice-creator (samber/cc-skills, MIT), substack-ghostwriting voice matching (samber/cc-skills, MIT), writing-dna-skill (larashero3-dotcom/writing-dna-skill, MIT).

Use for "brand voice", "tone of voice guide", "write in our voice", "make this sound like us", "on-brand", "write like <me / this author>", "style guide for our content", "ghostwrite for", or before any multi-piece job where voice must stay consistent.

## Voice vs tone (the distinction that matters most)

**Voice** is who the brand is. It does not change across channels. **Tone** is how it speaks in a moment (formality, energy, technical depth) and flexes by channel, audience and situation. "Make our voice more casual for LinkedIn" is a tone change. Changing the voice itself is a rebrand; confirm before doing it.

## Pick the depth

| Need | Build | Samples needed | Time |
|---|---|---|---|
| Match one person for a few pieces | VOICE PROFILE (§1) | 5-20 real samples | minutes |
| Ghostwrite a series for a client | Voice guide with 10-15 markers (§2) | 3-5 sources, transcripts first | one session + 2-3 feedback rounds |
| Brand voice for a team or content factory | TONE.md (§3) | discovery interview + past content | one long session |
| Deep reproduction of an author or publication | Writing DNA (§4) | 20+ complete articles | long |

Then enforce with §5 on every piece.

## 1. VOICE PROFILE (fast)

**Source priority:** recent original social posts and threads → essays, newsletters, launch notes → outbound emails that worked → docs, changelogs, site copy. Prefer recent over old. Never use generic platform examples as source. If public "launch voice" and private "working voice" differ, record both.

**Extract:** sentence length and rhythm; compression vs explanation; capitalization; parenthetical use; how often and why they ask questions; how sharply claims are made; how often numbers, mechanisms and receipts appear; transitions; what they never do.

```text
VOICE PROFILE
Author: | Goal: | Confidence: low/med/high
Source set: 3+ named sources
Rhythm: ...
Compression: ...
Capitalization: ...
Parentheticals: ...
Question use: ...
Claim style: ...
Preferred moves: ...
Banned moves: (each observed in the sources or requested by the user)
CTA rules: ...
Channel notes: X: ... LinkedIn: ... Email: ...
```

Short bullets, not literary criticism. If sources conflict, name the split instead of averaging it. Reuse the confirmed profile for the rest of the session. Do not save personal voice fingerprints into a repo unless asked.

## 2. Ghostwriting voice guide

**Signal quality of sources, best first:** recorded calls or interviews (transcribed) → podcast/talk transcripts → raw social posts → Slack/internal messages → published posts (edited) → formal writing. Transcripts keep the verbal tics and rhythms that notes filter out.

**Process:** collect 3-5 sources; mark markers line by line; keep markers that appear in 2+ sources (single-source markers get a context note); write a test paragraph; ask pointed questions ("Would you say 'massive' here?", "Is this your metaphor?"), never "does this sound right?"; fold corrections into the guide. By draft 3 it should be stable.

**Markers to capture:** default synonyms ("big" vs "huge"), technical depth, speech fillers, forbidden words; average sentence length (count 10-15 sentences), fragments, rhetorical questions; paragraph length and variation; formality, humor style, confidence (hedged vs declarative); metaphor domain (sports, engineering, cooking); how they open and close.

**Pitfalls:** drifting back to your own voice after a few paragraphs (check per paragraph); over-polishing a rough, direct voice; mistaking "more professional" for "more like them"; anchoring on one source; adding things they never do (one exclamation mark from a person who never uses them breaks it).

## 3. TONE.md (team or brand)

Fill [templates/copywriting-tone-of-voice-creator/TONE-template.md](../templates/copywriting-tone-of-voice-creator/TONE-template.md). Keep section names stable; downstream writers and bots parse them.

**Discovery (ask in small batches):** brand category; markets and languages; content goal; primary audience; channels in scope; reading-age target; risk tolerance (safe / distinctive / boldly distinctive); 3-5 admired brands and 3-5 anti-references; founder voice weight; regulation (GDPR, HIPAA, FDA, SEC, FCA, ASA); taboo topics; existing brand book; localisation strategy. Regulated, political, religious, healthcare-professional, gaming and crypto brands: research the category norms first, do not apply consumer defaults.

**Define:**
1. **NN/g four dimensions**, each placed on a scale: funny↔serious, formal↔casual, respectful↔irreverent, enthusiastic↔matter-of-fact. Lean clearly to one side on at least 3 of 4; all-neutral produces a bland voice.
2. **3-5 attributes in "X, never Y" form** ("Confident, never cocky"; "Plainspoken, not patronising"). Per attribute: one-line definition, "sounds like" sentence, "does not sound like" sentence, 3 do's, 3 don'ts, and one anti-example taken from the brand's own past copy (abstract anti-examples don't bite).
3. **Archetype** (optional, one of Jung's 12) as a shortcut, not a costume.
4. **Tone matrix:** rows = situations (launch, routine, win, complaint, crisis, apology, bad news, sales objection, sensitive topic), columns = channels; each cell: dominant tone + 2-3 forbidden tones. Writers use this more than anything else.
5. **Lexicon:** preferred terms (customers or members?), banned terms (more useful than power words, so make it non-empty), jargon policy, naming rules for product and competitors.
6. **Mechanics:** we/you, contractions (GOV.UK avoids negative contractions for non-native readers), Oxford comma, average sentence 15-20 words for general audiences, active voice default, sentence case, emoji policy, exclamation marks, dashes, numerals.
7. **Inclusive language** per market (Conscious Style Guide, APA guidelines).
8. **Channel sections**, one per channel in scope, with hard limits and tone shifts. Global do's and don'ts list at the end; examples library of before/after pairs.

**Validate:** 3-5 attributes; every attribute has a real anti-example; 3+ dimensions off-centre; banned list non-empty; one section per channel; pick 3 random do's and don'ts and ask "would a new writer know exactly what to do tomorrow?" Rewrite abstract ones as concrete sentences.

**Porting to a new channel:** keep attributes, re-derive 3 channel-specific do's and don'ts ("be concise" becomes "lead with the verb in the first 90 characters" on X), update that matrix column, then append a section or fork `TONE-<channel>.md` (ask which). Multi-locale brands: write the voice per locale (transcreation), never translate the English voice.

Don't borrow a famous voice wholesale ("sound like Oatly"). Use references to triangulate.

## 4. Writing DNA (deep author reproduction)

Needs **20+ complete articles** in `.md`/`.txt`, across periods and types. With fewer, call the result a demonstration, not a reliable model.

| Layer | Analyze | File |
|---|---|---|
| L1 Language | vocabulary, sentence-length distribution, punctuation, rhetoric, mixed-language habits | language-dna.md |
| L2 Structure | hook type and length → first turn → body architecture → transitions → closing, per content type (aim for 3+ patterns) | structure-patterns.md |
| L3 Topic logic | what triggers a piece, preferred angles, what they ignore | cognitive-framework.md |
| L4 Source strategy | which authorities, data, anecdotes, screenshots they trust | cognitive-framework.md |
| L5 Cognitive frames | recurring assumptions and values; 3+ non-obvious, evidence-backed propositions | cognitive-framework.md |
| L6 Visual style | image roles, placement rhythm, bold density, headings, color | visual-style-guide.md |

Also keep one `_meta/` JSON record per article (title, date, type, topic tags, hook type, structure pattern, source types, word count); cover 80%+ of the corpus. Integrate into a short `Writing-DNA.md`. Separate topic vocabulary from stable voice markers; frequency alone is not style.

**Before every piece in that style:** re-read all five files (not only the summary), then read the 5 raw articles closest in type and topic (most recent if more match) and state what they share in voice before drafting. Priority on conflict: the user's instructions for this piece > the structure pattern for this content type > language and visual rules > cognitive frames. Never carry the source's specific claims or facts into the new piece. Do not present the output as written by the original author.

## 5. Enforcement on every piece

1. Load guidelines: session context → `.claude/brand-voice-guidelines.md`, `TONE.md`, VOICE PROFILE → ask the user to paste or point to them.
2. Identify content type, audience, key messages, length/format.
3. Apply voice constants: the "we are / we are not" pairs, approved and banned terms. Let 2-3 attributes lead per piece; not every attribute at full volume.
4. Set tone from the matrix:

| Context | Formality | Energy | Technical depth |
|---|---|---|---|
| Cold outreach | Medium | High | Low |
| Enterprise proposal | High | Medium | High |
| Follow-up email (add new value each touch) | Medium | Medium | Low-medium |
| Social post | Low-medium | High | Low |
| Customer success / bad news | Medium | Warm | Medium |
| Internal comms | Low | Medium | Varies |

5. Write, then run [humanize-ai-writing.md](humanize-ai-writing.md). Where the voice profile and the generic AI-tell rules disagree (say the author really uses dashes), the profile wins.
6. Add 2-4 lines on which guidelines you applied and any place you adapted them. If the request conflicts with the guidelines, say so and offer: strict, adapted (default), or override.
