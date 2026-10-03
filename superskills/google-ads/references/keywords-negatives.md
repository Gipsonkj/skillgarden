> Distilled from: ads (coreyhaines31/marketingskills, MIT), ads + ads-google (AgriciDaniel/claude-ads, MIT), search-term-miner (aaron-he-zhu/aaron-marketing-skills, Apache-2.0), keyword-research (openclaudia/openclaudia-skills, MIT), google-ads (openclaudia/openclaudia-skills, MIT), google-ads (arnabbagxd/brand-building-skills, MIT), google-ads-manager (claude-office-skills/skills, MIT), google-ads (jdrhyne/agent-skills, MIT)

# Keywords, match types, negatives and search-term mining

## Keyword research

Source keywords from how **buyers describe the problem**, not how you describe the product.

| Source | What it gives |
|---|---|
| Sales calls, support tickets, reviews | Real buyer language and objections |
| Search terms report (existing account) | What already converts — the best source there is |
| Google Keyword Planner (free in Google Ads) | Volume ranges, CPC bids, related ideas |
| Search Console | Queries that already bring organic traffic |
| Competitor ads and pages; SEO tools (Semrush, Ahrefs, SpyFu) | Gaps and competitor terms |

Steps:
1. Write 10–20 seeds across: product/category, problem, solution ("best X for Y"), competitor ("X alternative").
2. Expand with Keyword Planner; keep volume, top-of-page bid range and competition.
3. Tag every keyword by intent and drop or park the rest:

| Intent | Signals | Paid search use |
|---|---|---|
| Transactional | buy, price, quote, near me, hire, book, trial | Core non-brand; bid highest |
| Commercial | best, top, vs, alternative, review, for <use> | Non-brand or competitor; needs comparison proof |
| Navigational | your brand, brand + login/pricing | Brand campaign only |
| Informational | how to, what is, guide, examples, template | Usually negative; content/SEO territory |

4. Cluster into ad groups: 5–15 keywords that one promise and one landing page can answer.
5. A keyword with 50 searches a month and clear buying intent beats one with 5,000 and mixed intent.
6. Volume and CPC from tools are directional. Validate in Keyword Planner for the target geo before committing budget.

## Match types

| Type | Syntax | Matches | Use |
|---|---|---|---|
| Exact | `[crm software]` | Same meaning, including close variants | Proven terms, brand, tight control |
| Phrase | `"crm software"` | Searches that include the phrase's meaning (word order matters when it changes meaning) | Default workhorse for non-brand |
| Broad | `crm software` | Related searches, uses account signals | Discovery, only with Smart Bidding |

**Progression:**
1. Launch high-intent terms on **phrase + exact**.
2. Mine search terms weekly (below).
3. Add **broad only when all three hold**: about 30+ conversions a month in the campaign, Smart Bidding live, and a maintained negative list. Broad without these mostly buys irrelevant traffic.
4. Brand keywords stay exact/phrase. Broad on brand spends brand budget on loose matches.

Do not infer old "broad match modifier" intent from today's `BROAD` keywords; check change history and search terms instead.

## Negative keywords

### Mechanics (where most mistakes come from)

| Negative type | Blocks | Does not block |
|---|---|---|
| Negative broad `free trial` | Queries containing **all** the words in any order | "free" alone; plurals/misspellings (negatives don't expand to close variants) |
| Negative phrase `"free trial"` | Queries containing those words in that order | "trial free" |
| Negative exact `[free trial]` | Only that exact query | Anything longer |

Add plural and misspelled forms yourself; negatives do not match close variants.

### Levels

| Level | Use for |
|---|---|
| Account-level / shared lists | Universal junk, brand-safety terms, your brand (attach to non-brand campaigns) |
| Campaign | Intent that belongs to another campaign (route brand, competitor, problem terms) |
| Ad group | Sculpting between sibling ad groups |

### Starter lists: only after checking against the business

Common candidate themes, to be **checked against the search terms report and the offer before applying**:
- Jobs: jobs, careers, salary, hiring, internship, resume
- Education: course, training, certification, tutorial, student, pdf
- Research intent: what is, how to, meaning, definition, examples
- Free/cheap/DIY/used — only if the business never sells that (a "free trial" SaaS must not negate "free")
- Category collisions (selling sales engagement? negative "employee engagement")
- Support/existing customers: login, help, support, forum — in non-brand campaigns
- Your brand — in every non-brand campaign

**Rule:** for an existing account, never deliver a negative list from imagination. Ask for the search terms report, then run an **overblocking review**: for each candidate, would it block a query that has converted, or a plausible buyer query? If yes, use a narrower match type or skip it. Negative the clearly wrong, not the merely uncertain.

## Search terms are a sample

Google hides low-volume queries. On small accounts 50–65% of clicks often have no disclosed term.

```
disclosed clicks = sum(clicks in search terms report)
total clicks     = campaign clicks, same window
withheld share   = (total - disclosed) / total
```

State the ratio with every waste claim ("of 13 disclosed clicks out of 33"). Pull the report **unfiltered** first; `clicks > 0` filters plus low row limits hide most of the picture. Nothing recovers withheld queries — analytics can show what visitors did, never what they typed.

## The weekly mining loop

Run per campaign, weekly for active accounts, monthly for small ones. Required columns: search term, match type, campaign, ad group, impressions, clicks, cost, conversions (and value). **If the conversion column is missing, stop; never negate on clicks alone.**

1. **Harvest winners.** Converting terms that are not keywords yet → add as exact/phrase to the matching ad group, or create an ad group if no theme fits. State the threshold (for example ≥2 conversions, or ≥1 at below-target CPA).
2. **Cut waste.** Terms with real spend and zero conversions that are irrelevant to the offer → negative, with match type and level. State your cost floor. Use the break-even check below before calling a relevant term "waste".
3. **Fix drift.** Phrase/broad pulling adjacent-but-wrong meanings → tighten match type or negative the drift word.
4. **Route.** A good term in the wrong place (brand in non-brand, competitor in generic) → add it where it belongs and negative it where it doesn't.
5. **N-gram report.** Split non-converting terms into 1-, 2- and 3-word tokens, sum cost per token, rank. Recurring high-cost tokens that never convert ("free", "jobs", a wrong product type) become shared-list negatives.

### Is it waste or just unmeasured?

```
break-even CVR = CPC / target CPA
```

Zero conversions in N clicks only rules out conversion rates at or above (95% confidence):

| Clicks | Rules out CVR ≥ | Verdict |
|---|---|---|
| 5 | 45% | Nothing; zero is expected |
| 10 | 26% | Still nothing |
| 30 | 10% | Can start doubting a strong CVR |
| 50 | 6% | Meaningful for high-intent search |
| 100 | 3% | Underperforming if break-even CVR > 3% |

If break-even CVR is below the range the clicks can rule out, the term is unmeasured, not failing. Irrelevant terms can be cut at any volume; relevant terms need data.

### Output: maintenance diff

```
ADD     | term | match | -> campaign / ad group | evidence (conv, CPA, period)
NEGATE  | term | match | level (shared/campaign/ad group) | cost, clicks, conv | reason
MOVE    | term | from -> to | reason
N-GRAM  | token | total cost | queries | conversions
Coverage: disclosed X of Y clicks (Z%) for <dates>
```

Apply nothing to a live account without approval (see [api-mcp-gaql.md](api-mcp-gaql.md#changing-a-live-account)).

## Keyword hygiene checks

- Keywords with zero impressions for 30+ days: low volume, too-strict match, or blocked by a negative. Pause or merge.
- Same keyword + match type in two campaigns: check which actually serves before calling it duplication.
- Quality Score below 5 on high-spend keywords: fix the weakest component (expected CTR, ad relevance, landing page) before raising the bid.
- Brand queries leaking into non-brand (or generic queries into brand) inflate one and hide the other's real cost.
