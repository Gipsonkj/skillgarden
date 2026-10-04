> Distilled from: ad-creative (coreyhaines31/marketingskills, MIT), ad-creative (alirezarezvani/claude-skills, MIT), ad-creative-builder (aaron-he-zhu/aaron-marketing-skills, Apache-2.0), meta-ads (boringmarketer/meta-ads-skill, MIT), facebook-ads (openclaudia/openclaudia-skills, MIT), ads-copywriter (claude-office-skills/skills, MIT); YouTube facts from Google Ads Help, in our own words

# Platform specs: character limits, sizes, safe zones

Platforms truncate or reject copy that runs over. Count every line before you deliver. These numbers drift with platform updates: treat them as the working default and confirm in the ad manager preview before launch.

## Counting rules

- Count characters, not words. Spaces and punctuation count.
- Emoji and full-width (CJK) characters can count as 1 or 2. Check in the platform UI.
- A URL in an X post costs 23 characters, so usable copy is about 257.
- Dynamic keyword insertion (`{KeyWord:Default}`) can overflow. Make the default fit.
- Never break a hard limit to keep an idea. Cut the idea.
- Show the count next to every line you deliver: `"Stop building reports by hand" (29)`.
- Run `scripts/ad-creative-alirezarezvani/ad_copy_validator.py` on the final set (see [ad-copywriting.md](ad-copywriting.md)).

## Google Ads

**Responsive Search Ads (RSA)**

| Element | Limit | Count |
|---|---|---|
| Headline | 30 | 3 min, 15 max |
| Description | 90 | 2 min, 4 max |
| Display path | 15 each | 2 fields |
| Final URL | none | 1, same domain as display URL |

- Google shows up to 3 headlines and 2 descriptions, in any order. Every headline must read alone and next to any other.
- Pin only for legal or brand-mandated lines. Pinning cuts the combinations Google can test.
- Ad Strength "Good"/"Excellent": fill all 15 headlines, make each distinct, put the main keyword in 3+.
- 15-headline mix: 3-4 keyword, 3-4 benefit, 2-3 proof, 2-3 CTA, 1-2 differentiator, 1 brand.
- 4-description mix: benefit + proof; feature + outcome; proof + CTA; offer + CTA.

**Performance Max**: headlines 30 (3-15), long headlines 90 (1-5), descriptions 90 (1-5, one of them 60 max), business name 25.

**Responsive Display**: short headline 30, long headline 90, description 90, business name 25. Needs images too (see sizes below).

## Meta (Facebook, Instagram)

| Element | Visible | Hard max | Notes |
|---|---|---|---|
| Primary text | ~125 | 2,200 | Cut off at "See more". Hook goes in the first 125. |
| Headline | ~27-40 | 255 | Under the image. Keep the offer in view. |
| Description | ~30 | 255 | Often hidden on mobile. Optional. |
| Carousel card headline | 40 | | Per card, 2-10 cards |
| Carousel card description | 20 | | Optional |
| Stories/Reels overlay text | keep under ~72-90 | | Overlay is the copy |
| Lead form greeting headline | 60 | | Description 360, privacy text 200 |

- Right-column placement shows only the headline.
- The old "20% text on image" rule is gone, but text-light images still tend to win. Put copy in the text fields.

## LinkedIn

| Format | Element | Limit |
|---|---|---|
| Sponsored content | Intro text | 150 visible, 600 max |
| | Headline | 70 recommended, 200 max |
| | Description | 100 recommended, 300 max |
| Carousel | Intro 255, card headline 45, 2-10 cards | |
| Message ad | Subject 60, body 1,500 (first 500 matter), CTA 20 | |
| Conversation ad | Intro 500, CTA 25 per button (max 5), branch body 500 | |
| Text ad | Headline 25, description 75 | |

## TikTok

| Element | Limit |
|---|---|
| In-feed ad text | 80 recommended, 100 max |
| Display name | 40 |
| Spark Ads caption | the original post's caption |
| CTA button | preset list (Shop Now, Learn More, Download, Sign Up) |
| Video length | 5-60 s; 9-30 s is the working range |

Branded hashtags in ad text are restricted. Keep on-screen hook text to ~40 characters so it reads in the first 1-2 seconds.

## X (Twitter)

Post text 280 (about 257 usable with a link), card headline 70, card description 200. Use 0-2 hashtags; for ads 0 is often better.

## YouTube (Google Ads video)

| Format | Length | Viewer control | Billing |
|---|---|---|---|
| Skippable in-stream | No max; under 3 min recommended | Skip after 5 s | CPV: a 30 s view, or the whole ad if shorter |
| Non-skippable in-stream | 15-60 s, by campaign subtype | No skip | Target CPM |
| Bumper | 6 s max | No skip | Target CPM |
| In-feed video | No max | Thumbnail + text; plays when clicked | Per click to watch |
| Shorts | Under 60 s recommended | Swiped away at any moment | CPV, CPM or engagement |

- Sizes: 1920×1080 (16:9), 1080×1920 (9:16), 1080×1080 (1:1) recommended; 1280×720, 720×1280 and 480×480 are the minimums. Upload all three ratios so no placement letterboxes. Thumbnail 1280×720, JPG/PNG/GIF, under 2 MB.
- **Write for the skip.** Skippable in-stream must land the brand and the one promise before the skip button appears at 5 s. A bumper carries one idea and one line, nothing else. Shorts can be swiped from frame 1, so open like an organic Short, not a TV spot.

**Google's ABCDs** (its checklist for YouTube creative):

| Letter | Do |
|---|---|
| Attention | Start inside the story, tight framing, brisk pacing; bright, high-contrast picture; supers (on-screen text) and audio carry the message together |
| Branding | Brand or product in the opening seconds and again through the spot; say the brand in the voice-over as well as showing it; use more than the logo (colour, sound, pack) |
| Connection | People using the product; one focused message in plain words; humour, surprise or intrigue |
| Direction | One specific CTA on screen and spoken in the VO ("Start your free trial", not "Learn more") |

For Shorts, Google puts Connection first: talent using the product the way a creator would, tight framing, native feel over polish (same rules as [short-form-video-ugc.md](short-form-video-ugc.md)). Unlike Meta feed, voice-over carries real weight here: brand and CTA both go in the audio, and captions still go on for muted plays.

**Repurposing.** Google Ads Asset Studio (Gemini-based) can turn existing social assets, photos or a landing-page URL into YouTube videos. Treat its output like any generated ad: preview every video, check each on-screen claim ([ai-ad-production.md](ai-ad-production.md)), and give new assets time to gather data before rotating them out.

## Cascade for multi-platform sets

Write the tightest version first, then expand:
1. Google headline (30) forces the core message.
2. Meta headline (40) adds a word or two.
3. Meta primary text (125 visible) adds the hook and value.
4. LinkedIn intro (150) adds context and proof.

## Image sizes

| Placement | Ratio | Size (px) |
|---|---|---|
| Meta feed | 1:1 | 1080×1080 |
| Meta feed portrait | 4:5 | 1080×1350 |
| Meta/IG Stories, Reels | 9:16 | 1080×1920 |
| Meta carousel | 1:1 | 1080×1080 |
| Google Display landscape | 1.91:1 | 1200×628 |
| Google Display square | 1:1 | 1200×1200 |
| LinkedIn feed | 1.91:1 or 1:1 | 1200×627 / 1200×1200 |
| TikTok, Shorts | 9:16 | 1080×1920 |
| X feed | 16:9 | 1200×675 |
| X card | 1.91:1 | 800×418 |
| Pinterest pin | 2:3 | 1000×1500 |

Put the target size and ratio in every generation prompt so nothing needs cropping later.

## Safe zones

**Vertical video (TikTok + Reels worst case, 1080×1920 canvas)**

| Edge | Keep clear | What covers it |
|---|---|---|
| Top | 220 px | Tabs, account row |
| Bottom | 500 px | Caption, music, CTA stack |
| Left | 180 px | Symmetry |
| Right | 180 px | Like/comment/share rail |

Result: a 720×1200 text-safe band from y=220 to y=1420. All captions and key visuals go inside it.

**One 9:16 asset reused in Meta feed**: feed crops instead of letterboxing. 4:5 removes ~285 px from top and bottom; 1:1 removes ~420 px. Keep identifier, message and CTA as one block inside y=420 to y=1500 so it survives every crop. Simulate the crops (any image tool: crop the centre 1080×1350 and 1080×1080) and then check the Ads Manager per-placement preview.

## Video defaults

- 1080×1920, 30 fps, MP4 (H.264, AAC) for vertical.
- Feed video: 1:1 or 4:5 beats 16:9 on mobile.
- Meta feed under 60 s; Stories/Reels ads under 15 s work best.
- Captions on: most feed video plays muted.
- Loudness for finished spots: about -16 LUFS integrated, true peak -1.5 dBTP (see [ai-ad-production.md](ai-ad-production.md)).
