> Distilled from: ads (coreyhaines31/marketingskills, MIT), ads (AgriciDaniel/claude-ads, MIT), google-ads (openclaudia/openclaudia-skills, MIT), google-ads (kostja94/marketing-skills, MIT), google-ads (arnabbagxd/brand-building-skills, MIT), google-ads-manager (claude-office-skills/skills, MIT), google-ads-api-account-diagnostics (google/skills, Apache-2.0)

# Bidding and budgets

Sources disagree on fixed conversion thresholds (30, 50, 100 a month). The rule used here: thresholds are **starting points**, not gates. Choose from objective, conversion volume, value quality and budget constraint, then confirm with the account's own history.

## Before touching bids

Fix measurement first. A bidder optimising toward a broken or junk conversion (page views, duplicate purchases, unqualified form fills) gets worse the better it works. Check [conversion-tracking.md](conversion-tracking.md) and that only real business outcomes are **primary** conversions.

## Strategy selection

| Goal | Strategy | Usually ready when | Notes |
|---|---|---|---|
| Traffic / learning on a brand-new campaign | Manual CPC or Maximize Clicks with a max CPC cap | No conversion data yet | Time-box it (2–4 weeks) |
| Most conversions within budget | Maximize Conversions (no target) | Primary conversion firing; 0–30 conv/month | Default starting point for most lead/sale campaigns |
| Hold an average CPA | Maximize Conversions **with target CPA** | ~30+ conv in 30 days per campaign (or portfolio) | Start target at or slightly above trailing 30-day actual CPA |
| Most value within budget | Maximize Conversion Value | Values accurate and varied | Ecommerce, value-scored leads |
| Hold a return | Maximize Conversion Value **with target ROAS** | ~30–50+ conv/month with reliable values | Start at or slightly below trailing ROAS |
| Visibility (brand defence) | Target Impression Share | Brand campaign, clear CPC cap | Set a max CPC limit |

Enhanced CPC is no longer offered on Search and Display campaigns; don't plan migrations around it. Labels and availability vary by campaign type, so check the account UI.

**Brand vs non-brand:** set targets from **non-brand** numbers. Brand CPA is cheap by construction; blending it in makes non-brand targets too loose. On brand, prefer manual/portfolio control or a tight target; Target ROAS on brand often overpays for clicks you'd win anyway.

## Setting and changing targets

- Derive targets from accepted economics (below) and mature account history, not from wishes. A target far tighter than current performance chokes delivery: Google simply stops bidding.
- Move targets in **10–15% steps**, then wait **1–2 conversion cycles** (at least 1–2 weeks; longer if conversion lag is long) before the next move.
- Change **one thing at a time**: never strategy and budget together.
- Every strategy switch or big target/budget change restarts learning (shown as "Learning" status). Don't judge or re-edit a campaign while it is learning, unless fixing a verified break (tracking down, broken URL, runaway spend).
- Use bid strategy simulators and Google Ads experiments (50/50 split) for strategy switches on important campaigns.
- Seasonality adjustments are for short, predictable conversion-rate spikes (sales of 1–7 days), not ordinary weekends.

## Budget mechanics

- Google can spend up to **2× the daily budget** on a single day; monthly spend is capped at about **30.4× daily**. A single-day overspend is normal.
- "Limited by budget" + good CPA: raising budget often lowers CPA, because constrained Smart Bidding underperforms.
- Raise budgets in steps of **≤ 20%**, 3–5 days apart, so delivery and learning stay stable. Prefer that over doubling.
- Give brand its own small budget; it rarely needs much.

## Economics

```
CPA                = spend / accepted conversions
ROAS               = conversion value / spend
break-even CPA     = contribution margin per conversion (or per closed deal × close rate for leads)
break-even ROAS    = 1 / contribution margin rate          (40% margin -> 2.5)
target CPA         = break-even CPA × (1 - desired profit share)
marginal CPA       = extra spend / extra conversions
MER                = total revenue / total ad spend         (business-level check)
lead value         = average deal value × lead-to-close rate
```

Scale until **marginal** CPA approaches break-even, not until average ROAS drops below an arbitrary preference. A ROAS falling from 10 to 5 while spend grows from $10k to $100k can be far more profit. Judge headroom on business-level results; optimise against non-brand.

## Impression share diagnosis

| Metric | High value means | Fix |
|---|---|---|
| Search lost IS (budget) | Money cap | Raise budget if marginal CPA is fine, or narrow targeting |
| Search lost IS (rank) | Ad Rank too low | Improve Quality Score components, assets, landing page; then bid |
| Low search IS on brand | Competitors or budget eating brand | Brand budget, Target Impression Share |

API values come as decimals (0.35 = 35%) or strings like `"< 0.10"`.

## Allocation across campaigns

1. Fund campaigns with proven positive marginal return first (brand, top non-brand themes).
2. Then bounded tests with a written hypothesis, decision date and stop rule. A common split is ~70% proven / ~30% tests during the first 2–4 weeks; record whatever split you choose and why.
3. Move money from the weakest **marginal** opportunity, not simply the worst average CPA.
4. Before any pause or cut: check conversion lag, tracking outages, sample size, lead quality and seasonality. Immediate containment is fine for runaway spend, policy problems, broken pages or corrupted tracking.

## Bid adjustments

On Smart Bidding, location, schedule and audience bid adjustments are ignored; device adjustments only act on the target in some strategies, and −100% still excludes a device. Use them only on Manual CPC/Maximize Clicks. For Smart Bidding, steer with targets, budgets, conversion values (value rules) and exclusions instead.

## Change packet (for any bid or budget proposal)

```
Campaign ID / name | current -> proposed | why (evidence + window) | expected effect
learning impact | verification date | rollback trigger and step
```

Never apply without the owner approving that exact change (see [api-mcp-gaql.md](api-mcp-gaql.md#changing-a-live-account)).
