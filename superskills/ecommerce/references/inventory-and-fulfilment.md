# Inventory, reorders, orders and fulfilment

> Distilled from: inventory-planner with its velocity, seasonality, data-source, PO-drafting and gotchas references (anthropics/knowledge-work-plugins, Apache-2.0); shopify-products inventory and shopify-expert order and fulfilment examples (jezweb/claude-skills and jeffallan/claude-skills, MIT).

Stock is cash already spent. The two failures are running out of what customers want and sitting on what they don't; both show up in sales history before they hurt.

## 1. Data you need, per variant

| Field | If missing |
|---|---|
| SKU and name | Can't plan that item |
| Units sold by date (net of cancellations; returns netted into the period they were sold) | No velocity: flag it |
| Stock on hand **and the date it was counted** | Ask; a two-week-old count makes every stockout date two weeks wrong |
| Units already on order | Ask; this is the double-ordering trap |
| Unit cost (and price) | Report units only and say why |
| Vendor, lead time in days, pack size, minimum order | Ask once per vendor and remember |

Sources: the platform (orders with line items and inventory per location), the POS, the ERP, or a CSV. Report the column mapping back before using a CSV. Work at **variant level**: a shirt that sells in M and never in XL looks healthy as a product. Per location if stock isn't pooled. Bundles consume component stock: ask how components are tracked.

## 2. Velocity: two windows, two jobs

```
v7  = units sold in the last 7 days / days in stock in that window
v28 = units sold in the last 28 days / days in stock in that window
stockout_velocity = max(v7, v28)     # when it runs out: be pessimistic
sizing_velocity   = v28              # how much to buy: be sober
```

- Days with zero stock are **not** zero demand: divide by days the item was available, or the item that keeps selling out gets under-ordered forever.
- When v7 and v28 differ by more than 50%, look at the orders before believing either: one wholesale order of 40 units is not a trend. Offer the numbers with and without it.
- Mark promotion periods; they are not a baseline.
- Under 28 days of history: say "not enough history" for that SKU; don't annualise a week.
- Label which rate went into which number on every line.

## 3. Days of cover and urgency

```
days_of_cover = (on_hand + on_order) / stockout_velocity
buffer        = min(30, max(7, lead_time_days / 2))
```

| Condition | Status |
|---|---|
| cover < lead time | Too late: will stock out before an order lands; ordering now shortens the gap |
| cover < lead time + buffer | Order now |
| cover < 45 days | Order soon (next cycle) |
| 45 to 120 days | Fine |
| over 120 days | Overstock: not a reorder |

Zero-velocity items get **no** days of cover; they go straight to the slow-mover list. The exception is an item the owner says is seasonal: it goes on a dated watch list (decide-by date = season start minus lead time).

## 4. Reorder quantity

```
target    = (60 + lead_time_days) x sizing_velocity
order_qty = target - on_hand - on_order
```

- Never negative; below zero means enough is on hand or inbound.
- Round **up** to pack size unless that pushes cover past 90 days at the sizing rate; then round down and say so.
- Minimum order quantities are usually per vendor order, not per line: check the whole order first. If it still falls short, show the extra units, cost and days of stock needed to clear it, and let the owner choose; never pad silently.
- Show money on every line and a total per vendor: owners decide in cash, not units.

Worked line:

```
Filter 20x25x1   SKU FLT-2025
  Velocity   4.1/day (28d), 5.8/day (7d): running hot, spike is one week old
  On hand    38, none inbound    Cover 6.6 days at 5.8/day
  Lead time  3 days + 7-day buffer   Status ORDER NOW
  Target     (60 + 3) x 4.1 = 258    Order 220, rounded up to 6 cases of 40 = 240
  Cost       USD 888 at 3.70        Cover after landing about 68 days (under 90, so round up is fine)
```

## 5. Slow movers and dead stock

| Class | Rule | Suggested action |
|---|---|---|
| Zero velocity | No units in 28 days | Report cash tied up; never reorder |
| Overstock | Over 120 days of cover | Report excess units and value |
| Dead stock | No movement in 90 days | Clear, bundle or discount (margin-checked in [pricing-and-promotions.md](pricing-and-promotions.md)) |

Total the cash tied up in these: it is often the most useful number in the report. Stale reorder points in an ERP are context, not truth.

## 6. Seasonality

- Only adjust from data with about 400 days of history (a full year plus overlap). Compare the coming window with the same window last year; prefer category-level factors for thin SKUs.
- Show any factor above 3x or below 0.3x to the owner instead of applying it; check last year's window for stockouts that understate demand.
- With less history, ask the owner for a rough multiple and label the buy list "sized at 1.8x per your estimate, not from history".
- When the owner names the season's end, cap the order at the days left in the season and show both numbers.

## 7. Purchase orders and vendor emails

- One PO per vendor: number in the owner's series, dates, ship-to, lines (SKU, description, quantity, unit, unit price, extended), subtotal, freight, total, terms.
- Use the last known price and say how old it is; leave unknown prices blank.
- State vendor, lines and total, then ask. **No PO is placed and no vendor email is sent without the owner's explicit yes,** per vendor.
- Substitutions and partial shipments go back to the owner with the effect on cover; never accept a substitute part number for them.

## 8. Orders and fulfilment

- **Fulfil only paid orders** (or authorised, per the business's capture policy); hold orders the platform's fraud analysis flags for review.
- **Inventory changes from the order system**, not by hand: on Shopify set stock with `inventorySetQuantities` per inventory item and location with a reason, and let orders decrement it. Manual corrections get a reason and a note.
- Split shipments by location or availability deliberately and tell the customer; attach tracking numbers to the fulfilment so the platform sends the shipping notification.
- Watch the exceptions daily: unfulfilled paid orders past the promised dispatch time, address validation failures, failed payments and on-hold orders, carrier delays.
- Returns: a written window and condition rules; restock only after inspection; refund through the original payment method; record the reason code (size, damaged, not as described) and review reasons per product monthly.
- Order, customer and fulfilment writes on a live store (cancel, refund, edit, mark fulfilled) need the user's confirmation, one batch at a time.

## Checklist

- [ ] Stock count has an as-of date; inbound subtracted
- [ ] Velocity at variant level, stockout days excluded, spikes inspected
- [ ] Stockout on the higher rate, order size on the 28-day rate, both labelled
- [ ] Pack size, MOQ and 90-day ceiling applied and explained; every line costed
- [ ] Slow movers listed with cash tied up; nothing with zero velocity reordered
- [ ] Seasonality only with a year of history or the owner's stated estimate
- [ ] POs, vendor emails and live order changes approved by the user first
