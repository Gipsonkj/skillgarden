---
name: websites
description: Plan, write and build landing pages and small websites with AI coding tools. Use when asked to make a website, landing page, portfolio, or to improve an existing page's design or copy.
---

# Websites

A landing page has one job and one main action. Most AI-built pages fail on the words and the defaults, not the code. Write the copy first, choose the look on purpose, then build.

## Order of work

1. **Brief**: who it's for, the one action (buy, book, sign up, call), and what makes this offer different. Ask if it's missing.
2. **Section plan**: list the sections and what each one proves. Usually: hero, proof, how it works, offer or pricing, questions, final call to action.
3. **Copy**: write every word before building. Use real names, prices, places and dates, never placeholder text.
4. **Look**: pick type, colour and spacing tokens that suit this subject.
5. **Build**: semantic HTML, then style, then only the JavaScript that's needed.
6. **Check** at 360px wide and on a desktop, then run a Lighthouse audit.
7. **Deploy** and test the live link on a phone.

## The hero

- A headline that states the concrete outcome for the visitor, in under 10 words. "Fresh Onam sadya boxes, delivered in Kochi" beats "Welcome to our website".
- A supporting line that answers "for whom" or "how".
- One primary button with a verb ("Pre-order for Onam"). An optional secondary link.
- A real visual of the product, place or result. No abstract blobs.

## Avoid the generic AI look

These defaults make a page look machine-made. Don't use them unless the brief asks:
- a purple-to-blue gradient hero
- every section centred
- Inter as the only typeface without a reason
- emoji as section icons
- the same rounded card with a shadow on every block
- vague copy like "innovative solutions" or "unlock your potential"

Instead, take the colours, textures and vocabulary from the subject itself.

## Design tokens

- A type scale with a clear ratio (for example 1.25), and body text at 16–18px with a line height of 1.5–1.7.
- Line length of about 60–75 characters.
- A spacing scale in steps of 4 or 8px. Lay out with flex or grid and `gap`.
- 3–5 colours as CSS variables, with light and dark themes if the audience expects it.
- At most two font families. Load them with `font-display: swap`.

## Quality floor

- **Accessibility**: text contrast at least 4.5:1, visible focus states, alt text on images, a real `<button>` for actions, labels on form fields.
- **Performance**: size images properly and use modern formats (WebP or AVIF). Aim for Largest Contentful Paint under 2.5 seconds on mobile, and don't load a framework for a static page.
- **Mobile**: nothing scrolls sideways at 360px, and tap targets are at least 44px.
- **SEO basics**: a unique `<title>`, a meta description, an Open Graph image, and one `<h1>`.
- **Forms**: a form needs somewhere to send data (a form service, a backend, or a WhatsApp or email link). Say so if none exists.

## Deploy

- Static pages: Vercel, Netlify or Cloudflare Pages, all free for small sites.
- Connect a custom domain and check that HTTPS works.
- After deploying, open the live URL on a phone and click every button.

## Checklist before handing over

- [ ] Headline says the concrete outcome in under 10 words
- [ ] One primary action, repeated at the end
- [ ] No placeholder or generic copy anywhere
- [ ] Works at 360px with no sideways scroll
- [ ] Contrast, focus states and alt text are in place
- [ ] Live link tested on a phone
