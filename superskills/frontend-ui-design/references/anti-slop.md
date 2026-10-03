# Anti-slop: the tells of generated UI and the gate before shipping

> Distilled from: frontend-design (anthropics/skills, Apache-2.0), hallmark (nutlope/hallmark, MIT), design-taste-frontend and redesign-existing-projects (leonxlnx/taste-skill, MIT), impeccable (pbakaus/impeccable, Apache-2.0), antislop-ui (miqdadbadjuber/anti-slop, MIT), baseline-ui (ibelick/ui-skills, MIT), frontend-ui-engineering (addyosmani/agent-skills, MIT)

A "tell" is a choice that appears whatever the subject. None is forbidden when the brief asks for it. Each is wrong when you reached for it because the axis was free. Recognising one means rewriting the element, not softening it.

## The five default "looks" models fall into

1. Warm cream background (around `#F4F1EA`) + high-contrast serif display + terracotta/clay accent (around `#D97757`).
2. Near-black background + one acid-green or vermilion accent.
3. Broadsheet: hairline rules, zero radius, dense newspaper columns.
4. SaaS card kit: identical rounded cards, one radius everywhere, the same soft grey shadow, gradient washes.
5. Template chrome: tracked uppercase eyebrow above every heading, `A · B · C` meta strings, `→` on every button, mono font for small labels.

For premium-consumer briefs (cookware, wellness, craft) the default is beige/cream + brass/ochre/oxblood + espresso text. Rotate away from it unless the brand genuinely is that.

## Tells by area

### Colour and surface
- Purple-to-blue or cyan-to-magenta gradients, including gradient text on headlines.
- More than one accent colour; accent covering more than about 5% of a viewport.
- Glow on several elements; glassmorphism on nav, cards and modals at once (cap: 1-2 elements).
- Pure `#000` / `#fff` as base surfaces (use tinted off-black / off-white), mixing warm and cool greys.
- A random dark section in a light page (or the reverse). One page, one theme.
- Decorative background grids, dot grids, blurred radial "orbs" behind the hero.
- Dark mode chosen because it "looks tech", not because of the audience.

### Layout and structure
- Hero -> 3 equal feature cards -> testimonials -> CTA -> 4-column footer, every time.
- Everything centred; hero with eyebrow + title + lede + CTA all on one centred axis.
- Three identical cards in a row as the page structure; cards nested in cards.
- The same layout family used twice on a page; more than 2 image/text zig-zags in a row.
- Bento grids with empty cells or where every cell is the same size and content type.
- "How it works" always 3 numbered steps; pricing always 3 towers with the middle one "Most popular".
- Logo bar of generic or invented companies under the hero.
- Uniform spacing everywhere (no rhythm), symmetric hero padding that floats the content.

### Typography
- Inter / Roboto / system font as the display face with no reason; Fraunces or Instrument Serif as the reflexive "premium" serif.
- One word in a headline set in italic, bold or accent colour for "interest".
- Eyebrow labels: small uppercase tracked text above section titles. Default is none; maximum one per three sections, stacked above the heading, never beside it.
- Section numbers (01 / 02 / 03) when the content is not a sequence.
- All-caps labels, Title Case On Every Heading, monospace as a "technical" costume.
- Headlines that wrap to 4 lines (a size error, not a copy error), buttons whose label wraps.

### Components and decoration
- Emoji as icons; sparkle/rocket/robot icons for "AI"; mixing two icon libraries.
- `→` or `↗` on every button; pill "New / Beta / AI-powered" badges with a glowing dot.
- Coloured left-border stripes on cards and callouts as decoration (fine only for real state).
- Decorative pulsing status dots; fake terminal windows; div-drawn fake dashboards; redrawn browser or phone frames.
- Modals for tasks that need neither interruption nor focus trapping.
- Sparklines, progress rings and soft rounded rectangles standing in for real content.

### Motion
- Fade-and-slide-up on every section; hover scale on every card; `transition: all`.
- Bouncy overshoot easing on buttons, modals and tooltips.
- Infinite loops (pulse, float, shimmer) on informational content.

### Copy and content
- "Elevate", "seamless", "unleash", "next-gen", "game-changer", "in the world of".
- Invented numbers ("10x faster", "trusted by 50,000 teams", "99.9% uptime").
- Fake-precise spec numbers the brand never claimed; perfectly round numbers (`50%`, `$100.00`).
- "Oops!" errors, exclamation marks in success messages, cute wordplay that doesn't parse.
- Em dashes and middle dots used as decoration in labels and headlines.

## The gate (run before handing back)

### Self-critique, 1-5 on six axes
Score the planned output. Anything below 3 triggers a revision pass before the checklist.

| Axis | Question |
|---|---|
| Philosophy | Is there a position this page takes, or is it just a layout? |
| Hierarchy | In 2 seconds, can you tell primary, secondary, tertiary? |
| Execution | Are contrast, focus rings, wrapping and spacing in spec? |
| Specificity | Does it look like *this* brief, not "a page that could be anyone"? |
| Restraint | Has everything that doesn't earn its place been removed? |
| Variety | Does it repeat the structure of the last page you built? |

### Checklist: every answer must be "no"
1. Is the display font a default (Inter, Roboto, Open Sans, Poppins, system) without a stated reason?
2. Is there a purple/blue gradient or gradient text?
3. Are there 3 equal icon-heading-text cards, or a card inside a card?
4. Is any card using a thick coloured side stripe as decoration?
5. Is the hero centred on every element, or does it overflow the first viewport?
6. Is any colour or font used outside the token set (`#hex` or `font-family` inline)?
7. Is any spacing value off the scale (e.g. `padding: 17px`)?
8. Is any prose wider than 75ch or narrower than 45ch?
9. Does any interactive element lack hover, focus-visible, active or disabled styles?
10. Is `transition: all` used, or any width/height/top/left/margin animated?
11. Is any motion missing a `prefers-reduced-motion` fallback?
12. Does any text, icon or focus ring fail contrast (4.5:1 text, 3:1 large text/UI)?
13. Does button text equal (or nearly equal) the button fill colour, or a dark section keep dark text?
14. Does the page scroll sideways anywhere from 320 to 1920 px?
15. Does any button, nav link or tab label wrap to two lines?
16. Is any metric, logo, testimonial or customer count invented?
17. Is there emoji used as an icon, or two icon libraries on one page?
18. Is there a placeholder name (John Doe, Acme) or lorem ipsum?
19. Is there a fake screenshot built from divs, or redrawn browser/phone/terminal chrome?
20. Are there eyebrows on more than one in three sections, or section numbers on non-sequences?

If any answer is yes, fix it before handing back. Then do the Chanel test: remove one decoration.

## Fix priority when cleaning up an existing page

1. Font swap (biggest visible gain, lowest risk).
2. Palette cleanup: one accent, one grey family, no pure black.
3. Hover, active and focus states.
4. Layout and spacing: max-width container, spacing scale, break symmetry where it is lazy.
5. Replace generic components (card rows, 3-tier pricing, accordion FAQ) with ones that fit the content.
6. Loading, empty and error states.
7. Final typography polish: balanced headings, measure, tabular numbers.
