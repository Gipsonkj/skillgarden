# Pricing, promotions and repricing

> Distilled from: dynamic-pricing-ecommerce (nexscope-ai/eCommerce-Skills, MIT; its closing vendor hand-off was left out); ecom health checks, benchmarks and recommended actions (takechanman1228/claude-ecom, MIT); shopify-catalog-audit price-anomaly flags (kgelster/awesome-ecom-skills, MIT).

Price on contribution, not on revenue. A discount that lifts orders but loses money on each one is a cost, not a win.

## 1. Unit economics first

```
Net revenue     = selling price - seller-funded discounts - refund allowance
Contribution $  = net revenue - COGS - variable selling costs
Contribution %  = contribution $ / net revenue
```

Variable selling costs: inbound freight, duties, packaging, pick and pack, shipping you pay, payment fees, marketplace or referral fees, affiliate commission, ad cost per order, returns handling.

**Price floor** when some fees are a percentage of price:

```
Floor = (unit cost + fixed variable costs + target contribution $) / (1 - percentage fee rate)
```

Example: cost 12.00, fixed costs 6.50 (pick, pack, shipping), target contribution 8.00, fees 15% of price: floor = 26.50 / 0.85 = 31.18.

Model at least a base case, a high-returns case, a high-ad-cost case and a promotion-stacking case. Keep any contractual or legal minimum (MAP, resale agreements) separate from the economic floor.

Label every input as **confirmed** (seen in an export or cost sheet), **assumption** or **unknown**. Don't invent costs, fees, elasticity or conversion.

## 2. Setting list prices

- Start from contribution at the floor, then position against value and the customer's reference price, not just a markup multiple.
- Use a small set of price tiers across the catalog (entry, core, premium); a single tier limits upsell paths.
- Show real prices only: a compare-at price must be a price you actually charged; a compare-at price at or below the price is a defect (catalog audits flag it).
- Round and format consistently per market; set market prices deliberately rather than relying only on currency conversion where margins are thin.

## 3. Promotion health

Default thresholds from the ecom engine (calibrate per category; fashion tolerates deeper events than electronics):

| Check | Pass | Watch | Fail |
|---|---|---|---|
| Average realised discount rate | under 15% and not rising more than 2 pt a month | 15-25% or rising 1-2 pt a month | over 25% or rising more than 2 pt a month |
| Share of orders with a discount | under 40% | 40-60% | over 60% |
| Discount depth trend | rising under 1 pt a month | 1-2 pt | over 2 pt |
| Category gross margin | no category negative | one at break-even | any category negative |
| Free-shipping threshold effect | over 10% AOV bump near the threshold | 5-10% | under 5% |

Rising depth and breadth together mean customers are being trained to wait for sales.

**Promo architecture instead of always-on discounts:**

- Fewer, clearer moments (seasonal events, launches, clearance) with start and end dates.
- Threshold offers (spend X, get Y) and bundles protect margin better than sitewide percentage cuts.
- Clearance segmented to aged or slow stock (see [inventory-and-fulfilment.md](inventory-and-fulfilment.md)), not the bestsellers.
- Decide stacking rules in advance: which discounts combine (on Shopify, discount combinations are set per discount), and model the worst stack against the floor.
- Every promotion gets a margin check before launch and a readout after: units, net revenue, contribution, new vs returning buyers, and what happened to full-price sales the weeks after.

## 4. Controlled repricing systems

For stores and marketplace sellers who want prices to move with demand, stock or season.

**1. Tier every SKU before automating anything.**

| Tier | When | Control |
|---|---|---|
| Auto-eligible | Reliable costs, stable identifiers, trusted signals, reversible changes | Bounded rules, logs, alerts, kill switch |
| Approval-required | Launches, thin margins, big steps, strategic products, sparse data | Human approves before publish |
| Manual-only | Missing costs, MAP or legal doubt, bundles, custom products, unstable feeds | Analysis only |

Uncertain SKUs go to the stricter tier.

**2. Register each signal** with source, freshness, coverage, failure mode and fallback:

- Demand: your own timestamped traffic, orders and units; separate price effects from ads, content, season and stock.
- Inventory: on hand, age, sell-through, lead time; a feed error is not a surplus.
- Season and events: explicit start, end and timezone.
- Competitor prices: only from data the user supplies or has a right to use (their repricing tool, marketplace reports, manual checks); normalised for pack size, condition, seller and delivered price; a single observation is a point in time. Don't scrape sites against their terms, and never follow the lowest offer automatically.
- Never personalise prices on protected characteristics or vulnerability; avoid gouging and anything resembling collusion.

**3. Write the rule matrix.** Each rule: scope, trigger with minimum duration, evidence gate (freshness), action (hold, raise, lower, ask), maximum step per change (absolute and percent), floor and ceiling, cooldown, precedence when rules conflict, approval level, recovery target.

**4. Simulate before enabling:** normal movement, competitor stockout or feed loss, an absurd competitor price, coupon stacking, high returns or a fee change, low and excess stock, a repeated undercutting loop, stale inputs. Report which rules fired, the resulting price and contribution, and whether any guardrail clipped the action. Without history, use labelled synthetic cases; don't pretend to backtest.

**5. Govern it:** least-privilege access, versioned rules, a log of every change (actor, reason, old and new price, signal snapshot), alerts on floor or ceiling contact and abnormal frequency, a circuit breaker that freezes or reverts, a manual override and an emergency stop. The system fails closed: missing input means hold the last approved price.

**6. Roll out in stages:** observe only, then shadow recommendations, then a small reversible pilot, then wider automation, each with keep, revise, pause and revert criteria agreed in advance.

## 5. Changing live prices

- Never publish a price, discount or repricing rule to a live store or marketplace without the user's explicit yes.
- Show the change set first: SKUs, old price, new price, contribution at the new price, and any that hit the floor.
- Keep the old prices exported for rollback; apply to a small batch first; read back.
- Check platform rules before launch (marketplace fair-pricing policies, reference-price rules in the target market): consumer-protection law on "was" prices differs by country.

## Checklist

- [ ] Contribution and floor computed per SKU with inputs labelled confirmed, assumption or unknown
- [ ] Compare-at prices real and higher than price
- [ ] Discount rate, breadth and depth checked against thresholds; stacking modelled
- [ ] Repricing: SKUs tiered, signals registered, rules bounded, simulated, logged, kill switch
- [ ] No scraping against site terms; no discriminatory or deceptive pricing
- [ ] Live price changes previewed, confirmed and reversible
