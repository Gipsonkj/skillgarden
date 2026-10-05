# Copy editing: sweeps, quick passes, refreshes

> Distilled from: copy-editing (coreyhaines31/marketingskills, MIT), sepia professional pass (Nanako0129/sepia, MIT), content-production optimization checklist (alirezarezvani/claude-skills, MIT).

Use when copy already exists: "edit this", "proofread", "polish", "tighten", "too wordy", "review my copy", "copy feedback", "refresh this page", "this content is outdated", "content audit".

## Ground rules

- Keep the core message and the author's voice. Every edit needs a reason you can state.
- One dimension per pass. A combined pass goes blind; separate passes catch more.
- Propose specific rewrites, not "improve clarity". Quote the weak passage, say why, show the fix.
- Prefer cutting and replacing over adding. Add only specifics the user supplied.
- Missing facts become `[NEED: ...]`, never invented numbers.
- The author decides. In collaborative edits, present findings per sweep, then wait for the updated copy.

## Choose the depth

| Situation | Do |
|---|---|
| Launch copy, pricing page, high-traffic landing page | All seven sweeps + expert panel |
| Sales page, email sequence, ads | Seven sweeps; panel recommended |
| Blog post, social, docs | Quick pass + AI-tell check |
| Small update | Quick pass only |
| Old page losing traffic | Refresh workflow (below) |

## The seven sweeps

Run in order. After each sweep, re-check the earlier ones so a later edit does not break them.

| # | Sweep | Ask | Typical fixes |
|---|---|---|---|
| 1 | Clarity | Can a cold reader understand every sentence? | Split sentences doing two jobs; fix unclear pronouns; define or cut jargon; one main idea per section; copy addresses "you" |
| 2 | Voice and tone | Does it sound like one brand throughout? | Fix casual→corporate drift, "we" vs "the company", stray humor; read aloud |
| 3 | So what | Does every claim answer "why should I care?" | Add the "which means..." bridge from feature to outcome |
| 4 | Prove it | Is every claim backed? | Attach testimonials with names, numbers with sources, guarantees; soften or cut "industry-leading", "trusted by thousands" |
| 5 | Specificity | Is it concrete? | "Save time" → "Save 4 hours a week"; "many customers" → "2,847 teams"; delete what cannot be made specific |
| 6 | Emotion | Does the reader feel the before and after? | Paint the before state, micro-stories, the reader's own words; never manipulative |
| 7 | Zero risk | Is every barrier near the CTA removed? | Answer objections next to the CTA; "No card required", "Cancel anytime", what happens after the click; replace vague "Contact us" with a clear next step |

## Expert panel (high-stakes copy)

1. Pick 3-5 personas for the copy type. Landing page: conversion copywriter, UX writer, target customer, brand strategist. Email: email specialist, copywriter, spam-filter analyst, target customer. Sales page: direct-response writer, skeptical buyer, editor, SEO specialist.
2. Each scores 1-10 in its area and lists concrete fixes.
3. Fix the lowest scores first, re-score.
4. Ship when every persona is 7+ and the average is 8+.

| Score | Meaning |
|---|---|
| 9-10 | Publish-ready |
| 7-8 | Minor tweaks |
| 5-6 | Clear gaps, another pass |
| 3-4 | Major revision |
| 1-2 | Rethink the approach |

## Quick pass

**Words.** Cut very, really, extremely, just, actually, basically, quite. "In order to" → "to". utilize → use, implement → set up, leverage → use, facilitate → help. Turn nominalizations back into verbs ("make a decision" → "decide"). Replace seamless/robust/innovative with the fact they stand for, not a synonym.

**Plain English swaps (sample):**

| Instead of | Write |
|---|---|
| approximately | about |
| commence / initiate | start |
| due to the fact that | because |
| prior to | before |
| in the event of | if |
| subsequently | later |
| sufficient | enough |
| with regard to | about |
| at this moment in time | now |

**Sentences.** One idea each; front-load the important word; usually 25 words or fewer; max 3 conjunctions; vary length.

**Paragraphs.** One topic; 2-4 sentences on the web; strong first sentence; white space.

**AI-tell check.** Run the catalog in [humanize-ai-writing.md](humanize-ai-writing.md): contrast reveals, negation lists, pile-ons, self-answered questions, colon reveals, stock openers, em dashes in short copy, more than one fragment or triad per section.

## Common problems

| Symptom | Fix |
|---|---|
| Wall of features | "which means..." after each one; keep 3-5 benefits |
| Corporate speak ("leverage synergies") | "How would a person say this?" |
| Opens with company history | Open with the reader's problem or outcome |
| Buried CTA | Early, obvious, repeated |
| "Customers love us" | Named quote, number, or case |
| "We help businesses grow" | Who, how, by how much |
| Speaks to everyone | Pick one audience |

## Content refresh

**Triggers:** traffic falling on a page that used to work, stats older than 12 months, product or pricing changed, competitors updated, the page is not being cited by AI search.

**Passes:** freshness (dates, stats, examples, dead features) → accuracy (claims, links, pricing) → voice (current brand) → search (intent shifted? new questions? add "Last updated: <date>") → proof (newer testimonials, data) → structure (add tables, FAQ, scannable blocks).

| Signal | Action |
|---|---|
| Message valid, details stale | Refresh |
| Voice changed a lot | Refresh + voice rewrite |
| Angle or audience shifted | Full rewrite |
| Structure no longer matches search intent | Full rewrite |
| Only stats and links | Light refresh |

**Cadence:** pricing/product pages quarterly or on change; comparison pages every 3-6 months; high-traffic posts every 6 months; evergreen guides yearly; low-traffic pages only when data shows an opportunity.

## Checker tools: Grammarly and the bundled scripts

Checkers flag; the sweeps above decide. Never accept a tool's rewrite that changes a fact, the voice or the claim.

**Pick a tool**

| The user's need or situation | Use | Why |
|---|---|---|
| Their team already runs a checker (Grammarly, a house linter) | That one, and ask for its report | Their score is the one reviewers will judge by |
| Free, no account, any draft | The quick pass and AI-tell check above, plus the bundled scripts in [long-form-articles.md](long-form-articles.md) (readability, gates, SEO) | Local, no network, nothing leaves the machine |
| A Grammarly Writing Score for a batch of documents, and the org has Grammarly Enterprise or Education | Grammarly Writing Score API (below) | Returns an overall score plus clarity, correctness, engagement and delivery |
| Client asks "does this read as AI?" | The humanize audit in [humanize-ai-writing.md](humanize-ai-writing.md) first; Grammarly's AI Detection API (beta) only if they already have access | Detector scores are probabilistic; fix the tells, don't chase a number |
| Grammarly on a personal or Pro plan | The user pastes the draft into Grammarly themselves and sends back the flagged lines | API credentials are only for Enterprise and Education admins |

**Grammarly APIs (Enterprise and Education only).** An admin creates OAuth 2.0 credentials in the Admin panel → Organization → Configurations → OAuth 2.0 credentials, ticking the API to allow. Keep the client ID and secret in `GRAMMARLY_CLIENT_ID` and `GRAMMARLY_CLIENT_SECRET`, never in chat. The documents go to Grammarly's servers, so confirm the user may share the draft before sending it.

```bash
TOKEN=$(curl -s -X POST https://auth.grammarly.com/v4/api/oauth2/token \
  -d grant_type=client_credentials -d client_id="$GRAMMARLY_CLIENT_ID" \
  -d client_secret="$GRAMMARLY_CLIENT_SECRET" -d scope="scores-api:read, scores-api:write" | jq -r .access_token)

# 1. ask for an upload slot
curl -s -X POST https://api.grammarly.com/ecosystem/api/v2/scores \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -H 'user-agent: API client' -d '{"filename": "draft.docx"}'      # → score_request_id, file_upload_url
# 2. upload within 120 seconds (no auth header; the URL is pre-signed)
curl -T draft.docx "$FILE_UPLOAD_URL"
# 3. poll until status is COMPLETED or FAILED
curl -s https://api.grammarly.com/ecosystem/api/v2/scores/$SCORE_REQUEST_ID \
  -H "Authorization: Bearer $TOKEN" -H 'Accept: application/json' -H 'user-agent: API client'
```

- Files: `.doc`, `.docx`, `.odt`, `.txt`, `.rtf`; up to 4 MB and 100,000 characters; at least 30 words, or the result is `COMPLETED` with a null score. Results are kept 30 days. Rate limits: 10 POSTs and 50 GETs a second.
- `score` holds `general_score`, `engagement`, `correctness`, `delivery` and `clarity`, each from 0 to 1 (0.86, not 86). Report them with the sweep findings, not instead of them.
- AI Detection (beta): same flow at `https://api.grammarly.com/ecosystem/api/v1/ai-detection` with the `ai-detection-api:read` and `ai-detection-api:write` scopes; returns `average_confidence` and `ai_generated_percentage` (0-1). Plagiarism Detection is also in beta.

## Edit report format

```
Goal / audience / action: ...
Sweep findings (per sweep): quoted passage → why → rewrite
Panel (if run): persona scores, top 3 fixes
Final copy
Open items: [NEED: ...]
```

Final checks: no typos, consistent formatting, links work, core message intact, no fact added that the user did not supply.
