---
name: store-launch
description: "Launch or relaunch an online store from one request: platform choice, catalog and product pages, product images, checkout, payments and the launch offer, welcome and abandoned-cart emails, first paid ads and the numbers to watch, using the Skill Garden ecommerce, image-creation, email-marketing and ad-creation super skills in order. Use when asked to start a Shopify or WooCommerce store, put products online, or lift a store's conversion."
---

<!-- Generated from chain.json by local/chains.mjs. Edit chain.json, then run: node local/chains.mjs --write -->

# Launch an online store

Pick the platform, write product pages that sell, make the product shots, then set up checkout, emails and the first ads.

This is a **chain**: one request runs several Skill Garden super skills in order, each step using the guide written for it. It needs these super skills installed: `ecommerce`, `image-creation`, `email-marketing`, `ad-creation`. With the Skill Garden plugin they are `skillgarden:<name>`; on the Skill Garden connector, read each guide with `get_guide`.

Ask like this: "Launch an online store for <products>, selling to <customers> in <countries>."

## Before step 1: gather the inputs once

Ask only for what the request and the conversation don't already give you, in one message:

- The products, prices and margins
- Who buys and why
- Countries, currency and shipping
- The platform you have or prefer
- Product photos and brand assets you have
- Ad budget for the launch

If something stays unknown, pick a sensible default, say which, and go on.

## Run the steps in order

For each step: load the named super skill, read the guides listed (and only those), do the step the way the guide says, and save the result as `store-launch/<n>-<step>.md` in the working folder (or as a section of one document where files aren't available). Each step builds on the files before it. If the user asked for only part of the chain (a plan, a script, captions), run only the steps that produce it and say which you skipped. Don't stop between steps to ask "continue?". Stop only for a decision the user has to make, and say what it is.

### 1. Choose the platform and set it up

- **Read:** `ecommerce` → `references/platform-choice.md`
- **Deliver:** The platform, theme and apps, with the reasons and the monthly cost.

### 2. Write the product pages

- **Read:** `ecommerce` → `references/catalog-and-feeds.md`, `ecommerce` → `references/product-pages-and-cro.md`
- **Deliver:** Product titles, descriptions, variants and a page layout that sells.

### 3. Make the product images

- **Read:** `image-creation` → `references/marketing-brand-images.md`, `image-creation` → `references/editing-references-consistency.md`
- **Deliver:** Product and lifestyle shots, consistent across the catalog, at the store's sizes.

### 4. Checkout, payments and the launch offer

- **Read:** `ecommerce` → `references/checkout-and-payments.md`, `ecommerce` → `references/pricing-and-promotions.md`
- **Deliver:** Payment methods, shipping and tax settings, and the launch offer.

### 5. Welcome and abandoned-cart emails

- **Read:** `email-marketing` → `references/sequences-and-lifecycle.md`, `email-marketing` → `references/deliverability.md`
- **Deliver:** Welcome, abandoned-cart and post-purchase emails with timing, set up to reach the inbox.

### 6. The first ads

- **Read:** `ad-creation` → `references/meta-ads-creative.md`, `ad-creation` → `references/ad-copywriting.md`
- **Deliver:** Ads for the best sellers in three angles.

### 7. Measure and improve

- **Read:** `ecommerce` → `references/store-analytics.md`, `ad-creation` → `references/testing-iteration.md`
- **Deliver:** The five numbers to watch each week and the first tests to run.

## Finish

End with a short summary: what each step produced (file names), the decisions you made on the user's behalf, and the one thing to do first. Facts, numbers and claims come only from the user's inputs and the research step. Never invent results, testimonials or prices.
