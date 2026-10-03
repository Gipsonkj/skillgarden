# Carousels: writing and visual design

> Distilled from: carousel-writer-sms (blacktwist/social-media-skills, MIT), instagram-marketing / ig-carousel-planner (sergebulaev/instagram-skills, MIT), social-carousel (nexu-io/open-design, Apache-2.0; series and stage design ideas only), instagram-post (publora/skills, MIT; API limits).

On Instagram, carousels are the format people save. Slide 1 decides whether anyone swipes. The last slide earns the save and the follow.

## Specs

| Item | Value |
|---|---|
| Size | **1080x1350 (4:5)** recommended. 1080x1080 (1:1) is fine. Never landscape. |
| Slides | API: **2-10**. The app allows up to 20 for manual posts. Aim for 6-10. |
| Ratio | Use the same ratio on every slide. Instagram crops the whole set to match the first slide. |
| Files | JPEG or PNG, sRGB, under 8 MB each |
| Mixed media | The Graph API accepts images and videos together. Some schedulers (Publora) reject mixed sets, so check the tool. |
| Caption | 2,200 characters. Only the first ~125 show before "more". |

## Choose the container first

| The idea is... | Use |
|---|---|
| One result, one number, one moment | Single image + caption |
| Fewer than 4 real points | Single image (don't pad a carousel) |
| A numbered list, a framework, a transformation, myths to correct | Carousel |
| Motion, a demo, face to camera | Reel (`reels-scripting.md`) |

## The universal spine

| Slide | Job | Text |
|---|---|---|
| 1 Cover | Make a promise and open a loop | 6-12 words. Include a number if it fits. Add a subtitle line that makes it concrete. |
| 2 | Your strongest point, or the context or "before" | Front-load value. Swipe-through falls with every slide. |
| 3 to N-1 | One point per slide | A bold header of 8 words or fewer, plus up to 30 words of body. Readable in 2 s. |
| N Payoff | A summary you could save on its own, plus one ask | The whole carousel on one slide, then "save this for..." or "send this to..." |

Rules:

- **Slide 1 is a promise, not a title.** "7 portfolio mistakes (most miss #4)" beats "Portfolio tips".
- **Write the cover last,** once you know what the carousel delivers.
- **Put the best point on slide 2 or 3, never on slide 10.**
- **Each slide ends with a reason to swipe:** a partial thought, a numbered tease ("...and #3 surprised me"), or a contrast.
- **One idea per slide.** More than 30 words means two slides.
- **Number list items** so the open loop pays off.
- **Never pad to 10.** A 5-point idea makes a 7-slide carousel (5 points plus cover and payoff).

## Formats and their main goal

| Format | Spine | Earns |
|---|---|---|
| Listicle | "N things that [payoff] (most miss #k)" → one item per slide with an example → recap + save | Saves |
| Framework / steal this | "The [named] framework I use to [result]" → one part per slide with the why → whole framework on one slide | Saves |
| Before/after | Slide 1 is the after (number or visual) → slide 2 is the before → concrete steps → result + follow | Saves, follows |
| Myth-buster | "N [topic] myths costing you [loss]" → Myth / Truth pairs → reframe + "send this to someone who still believes #1" | Sends |
| Data story | One surprising number per slide, plus a one-line insight | Saves, sends |
| Mini case study | Problem → approach → result → lesson | Follows, comments |

Pitfalls:

- **Vague steps** ("be consistent") kill the save.
- **Strawman myths** get called out in the comments.
- **A framework that is really just a renamed list** disappoints. Each part needs a reason to exist.

## Output format (copy)

```
---
Slide 1 (Cover)
Headline: ...
Subtitle: ...
---
Slide 2 (Context / strongest point)
Header: ...
Body: ... (<=30 words)
---
...
---
Slide N (Payoff)
Summary: ...
CTA: Save this for [specific moment] / Send this to [specific person]
---
Caption: [hook restated for the fold, 1-2 lines of context, CTA, 3-5 hashtags]
Alt text: [one line per slide]
```

## Visual design rules

- **Treat each slide as a billboard.** On a 1080 px wide slide:
  - headline at about 80-120 px
  - body at 40 px minimum (never under about 32 px)
  - line length under about 35 characters
- **Margins:** at least 80-100 px on every side. Keep the bottom about 120 px clear of key text, because the dots indicator and UI overlap there.
- **Consistency across the set:** one display font, one text font, the same margins, the same accent colour and one layout grid. A recurring element (slide counter "03/08", handle or wordmark) makes the slides read as a series.
- **Contrast:** at least 4.5:1 between text and background. Busy photos need a scrim or a solid block behind the text.
- **Series continuity:** headlines can read as one sentence across slides, and backgrounds can flow from one slide into the next. Each slide must still make sense on its own, because Instagram may resurface slide 2 to people who didn't swipe.
- **Cover:** high contrast, one focal element and the big number. Slide 1 is also the grid thumbnail.
- **Payoff slide:** design it as the screenshot people keep: a clean summary, then the ask.
- **Avoid:** walls of text, more than 2 fonts, a different look on every slide, a tiny handle as the only branding, emoji used as icons.

## Building and exporting the images

- **Hand-made:** Canva, Figma or Keynote at 1080x1350. Export PNG or high-quality JPEG.
- **As code:**
  1. Render one HTML/CSS page per slide at exactly 1080x1350, using `width/height` in px, inline CSS and local fonts or Google Fonts.
  2. Screenshot each slide with a headless browser at device scale 1 (for example Playwright `page.screenshot({clip})`).
  3. Check every file is under 8 MB and in sRGB.
- **Check the result:** view the slides at phone size (about 390 px wide) and read each one in 2 s.
- **Alt text:** write it per slide in the app's accessibility settings, or send `alt_text` per image through the API if your version supports it.
- **Publishing:** see `graph-api-publishing.md`. The API needs each slide at a public HTTPS URL.
  > ToS: official Graph API / Instagram API only (Business or Creator), user-approved actions, no bots or cold DMs, scraping is HIGH risk and never the default.

## Checklist

- [ ] Slide 1 makes a promise and opens a loop. The best point is on slide 2 or 3.
- [ ] One idea per slide, 30 words or fewer, readable in 2 s at phone size.
- [ ] Same ratio, fonts, margins and accent on every slide. Text clear of the bottom UI.
- [ ] The payoff slide works as a standalone saved summary, with exactly one ask.
- [ ] The caption hook fits in 125 characters, ends with 3-5 hashtags, and has alt text for each slide.
