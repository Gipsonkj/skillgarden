> Distilled from: ad-creative (coreyhaines31/marketingskills, MIT), ads-creative (AgriciDaniel/claude-ads, MIT), ad-creative (alirezarezvani/claude-skills, MIT), facebook-ads (openclaudia/openclaudia-skills, MIT), meta-ads (boringmarketer/meta-ads-skill, MIT), ugc-strategy (arnabbagxd/brand-building-skills, MIT)

# Testing, iteration and creative fatigue

## Read the funnel, not the ROAS column

Each metric isolates one part of the ad. Fix that part, not the whole ad.

| Stage | Metric | Weak means | Fix |
|---|---|---|---|
| Stop | Thumbstop / 3-second view rate | Visual opening (and caption) | New first frame; keep the rest |
| Stay | Hold rate (3 s → 15 s or 50% view) | The on-ramp after the hook | Rework seconds 3-15 |
| Click | CTR | Promise, offer or proof unclear | Sharpen promise, CTA or proof |
| Convert | Post-click conversion rate | Page doesn't continue the ad | Fix message match or the claim |

- High thumbstop with collapsed hold or conversion means the hook attracts the wrong people. A clickbait winner scales into a conversion crater.
- ROAS says that something is broken; the funnel says what.

## Test design

- **One variable per test.** Visual opening OR on-ramp OR offer OR headline.
- Priority order on Meta: format (image / video / carousel) → hook / first line → audience → offer → CTA and headline.
- Put creative variants in one ad set so they share learning and budget. Use separate ad sets only for audience tests (identical creative).
- Run 7-14 days minimum, or 1,000+ impressions per variant before any verdict. Conversion-level confidence needs ~100 conversions per variant.
- Kill clear losers early: CPA 2x+ the target after 500+ impressions.
- Hooks: test 3-5 hooks on the same body (with rewritten on-ramps). Creators: 3-5 creators on the same brief.
- Tag every variant in `utm_content`; name ads `[Format]_[Concept]_[Version]`, ad sets `[Audience]_[Detail]_[Placement]`, campaigns `[Brand]_[Objective]_[Stage]_[Date]`.
- Retargeting ROAS is inflated (it reaches people already likely to buy). Judge creative scale-up on prospecting results.

## Fidelity ladder

Match production cost to evidence:
- **Hunch**: ship low-fi within 1-2 days (static, text-on-screen video, voice-over on B-roll, remix of existing footage).
- **Signal**: any funnel metric win, even one, on the low-fi version earns a better production.
- **Proven angle**: creator shoot, staged demo, full production.

| Production tier | Cost | What | For |
|---|---|---|---|
| T1 iteration | hours | New hook, caption or crop on an existing asset | Extending winners |
| T2 remix | days | New creative from existing footage, assets or AI generation | Decent evidence or a first signal |
| T3 production | weeks | New shoot, creators, full build | Own-account proof or a prior low-fi signal |

## Getting the performance data

### Pick a tool

| The user's need or situation | Use | Why |
|---|---|---|
| They already use a creative-analytics or BI tool | That one | Their tags, naming and reports are set up there. Ask which they use. |
| No tool, or a one-off review | A per-ad report exported from the ad platform, analysed here | Free; ask for the funnel metrics above, per ad |
| Meta account connected to Motion | Motion MCP (below) | Ranked creatives, AI tags, transcripts, demographics |
| TikTok results | TikTok for Business MCP reporting ([production-tools.md](production-tools.md)) | Motion's MCP covers Meta only |
| Is the winner real? | `data-analysis` → `references/experiments-causal.md` | Significance and an honest readout |

### Motion (creative analytics)

**For:** Meta advertisers who already pay for Motion. It ranks creatives, tags hooks, formats and angles, and keeps transcripts, so Claude reads the analysis instead of rebuilding it from a CSV.

**Connect** (OAuth with the user's Motion login; nothing to paste):
- claude.ai: Settings → Connectors → Add custom connector → `https://projects.motionapp.com/mcp` → Connect. An admin may need to add the connector to the workspace once first.
- Claude Code: `claude mcp add --transport http motion https://projects.motionapp.com/mcp`, then `/mcp` to sign in. Motion's official plugin adds its skills on top: `/plugin marketplace add Motion-Creative/motion-creative-plugin`, then `/plugin install motion-creative@motion-mcp`.

**Limits.** Meta only (no TikTok, YouTube or LinkedIn yet). Read-only: it never changes ads or settings. Only Owners, Admins and Collaborators can connect, not guests. Legacy and custom plans need an upgrade for MCP access. After a new ad account is connected, the first sync and tagging take a few hours.

| Step in this guide | Motion tool |
|---|---|
| Which workspace | `get_auth_context` |
| Rank winners and losers on the deciding metric | `get_creative_insights` |
| Read one ad: what it is, why it works | `get_creative_summary` |
| The spoken hook, with timings | `get_creative_transcript` |
| Who it works for | `get_demographic_breakdown` |
| The account's tag names (hook type, format, angle) | `get_glossary_values` |
| Brand positioning to stay on message | `get_workspace_brand` |
| Saved reports | `get_reports` |

Use it inside the iteration loop below: rank with `get_creative_insights`, judge concepts (group by tag, not single ads), read the transcripts of the top and bottom five, then write variations and new angles here. Motion's plugin skills (`/find-iterations`, `/write-hooks`, `/analyze-ad`, `/build-brief`) do parts of this; check their output against the funnel rules above.

## Iterating from performance data

1. Ask which metric decides (CTR, CVR, CPA, ROAS). Get at least 30 days of data with impressions, spend and the funnel metrics per ad.
2. **Winners**: what theme, hook type (problem / benefit / curiosity / proof), structure (question, statement, number), emotional driver, specificity and length do they share?
3. **Losers**: which themes fall flat; too generic, too long, wrong tone, wrong stage?
4. **Judge concepts, not ads.** Three executions of one concept failing means the concept is wrong; one failing means the execution was.
5. **Generate**: 3-5 variations on the winning pattern (same hook type, new angle; same driver, new example), plus 2-3 tests of an untried angle. Avoid patterns from the losers.
6. **Log it**:

```
## Iteration log, round N, {date}
Top performers: [ad, metric, value]
Winning patterns: ...
Metric wins (full-funnel losers with one strong metric): ...
New variations: N headlines, N descriptions, N videos
New angles tested: ...    Angles retired (and why): ...
```

Near-duplicate variations of a winner mostly compete with it for the same audience and teach nothing. Variations must look meaningfully different while keeping the message.

## Creative fatigue

- Diagnose fatigue from time-series data, never from age alone: falling CTR and thumbstop with rising frequency and CPM/CPA on the same audience over the same window.
- Falling month-over-month reach on Meta means the audience is saturated; add new formats (creator-fronted especially), not just new copy.
- Refresh by changing the first 3 seconds or the format before rewriting the whole concept.
- Keep creative quality, format compliance (specs, safe zones) and measured performance as three separate findings in any audit.
- There is no universal refresh cadence. Plan creative volume around how fast the account's own ads fatigue (TikTok usually fastest).

## Creative audit checklist

Inventory each asset by concept, hook, offer, format, placement, audience, date and performance window. Resizes of one ad are not separate concepts. Then check:
- Attention: does frame 1 stop the scroll? Is there a hook in 0-3 s?
- Clarity: one message; offer and brand evident.
- Native fit: right ratio per placement, captions, safe zones, crops simulated.
- Message match with the landing page.
- Accessibility: caption contrast, readable size, no information only in sound.
- Policy and disclosure: claims substantiated, AI and paid-partnership labels.
- Format coverage: are there S/A-tier scalers in the mix, or only supporting cast?

Output prioritised refresh or test briefs: hypothesis, audience, format, owner, success metric, evidence.

## Monthly retro

One file per month:

```
Winners: concept, funnel numbers, which element earned it
Losers: concept, where in the funnel it died, why we think so
Metric wins: losers with one strong metric (leads, not losses)
Learnings → written back into the concept backlog
Kills: concepts retired, reason
Next slate: draft for next month, evidence re-ranked
```

A retro that changes nothing in next month's plan was a meeting, not a retro.

## Common mistakes

- Judging before 1,000 impressions or 7 days.
- Changing several things at once and crediting the wrong one.
- Stopping the funnel read at thumbstop.
- Iterating on losers while the real problem (angle, offer, audience) goes untested.
- 100% of the slate on winner variations; when the winner fatigues, the pipeline is empty.
