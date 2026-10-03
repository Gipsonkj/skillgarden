# Design direction: from brief to a committed plan

> Distilled from: frontend-design (anthropics/skills, Apache-2.0), design-taste-frontend (leonxlnx/taste-skill, MIT), impeccable (pbakaus/impeccable, Apache-2.0), hallmark (nutlope/hallmark, MIT), interface-design (dammyjay93/interface-design, MIT), frontend-ui-engineering (addyosmani/agent-skills, MIT)

Most generated UI fails before the first line of code: the model skips the brief and reaches for its default look. This guide is the step that prevents that. Use it for any new page, screen, component set or redesign that is allowed to change the look.

## 1. Read the brief (2 minutes, before anything else)

Collect these signals. Write them down; do not hold them in your head.

| Signal | What to look for |
|---|---|
| Surface | Landing page, app screen, dashboard, docs, portfolio, email, one component |
| Audience | Who, where, doing what 5 minutes before and after. "Users" is not an answer |
| The one job | The verb: book a table, approve a payment, find the broken deploy |
| Vibe words | Words the user actually used: "calm", "Linear-like", "playful", "serious B2B" |
| References | Linked sites, screenshots, named competitors |
| Existing assets | Logo, brand colours, fonts, photography, an existing DESIGN.md or token file |
| Quiet constraints | Public sector, regulated, kids, accessibility-first audiences. These override taste |

If the project already has code, scan it first (fonts in `package.json` / layout files, colour tokens in `:root` or Tailwind theme, motion libraries, spacing scale, framework). Report what you will preserve before you change anything. Stomping on an established palette or font stack is the fastest way to lose the user.

## 2. Name the mode

The mode is about the visitor's success on *this surface*, not about the product.

| Mode | Visitor succeeds when they... | Examples | Design priority |
|---|---|---|---|
| Persuade | decide and act | Landing, pricing, campaign | Expression, one memorable moment, a clear CTA |
| Operate | finish a task | App UI, dashboard, settings, admin | Scanability, consistency, density, earned familiarity |
| Read | understand something | Docs, articles, help, changelog | Measure, hierarchy, calm |
| Experience | are inside the work | Portfolio, gallery, showcase | Let the work lead; the interface recedes |

A tool's landing page is Persuade; its settings page is Operate. Operate surfaces get a tighter type scale (ratio 1.125-1.2), 150-250 ms motion, no page-load choreography, and restrained colour.

## 3. State a one-line Design Read

Before code, write one sentence:

> Reading this as: *<surface> for <audience>, with a <vibe> language, leaning toward <system or aesthetic family>.*

Examples:
- "B2B SaaS landing for technical buyers, calm and precise, Tailwind + one grotesk + restrained motion."
- "Redesign of a council service site, trust-first, GOV.UK Frontend."

If the brief is genuinely ambiguous, ask **one** question ("closer to Linear-clean or editorial-magazine?"). If you can infer, do not ask: state your read and proceed, so the user can redirect.

## 4. Explore the subject before picking a look

Distinctive choices come from the subject's own world, not from a style catalogue. Produce four lists:

1. **Domain**: 5+ concepts, objects and words from this product's world (a bakery: crust, proof, flour dust, morning queue, paper bags).
2. **Colour world**: 5+ colours that exist there physically. Walk into the place in your head.
3. **Signature**: one element that could only belong to this product (a bakery's opening-hours "oven clock", a climbing gym's route-grade badges).
4. **Defaults to avoid**: the 3 obvious choices any model would make for this kind of page. Naming them is how you avoid them.

Test: hide the product name. Could someone still guess what it is for? If not, explore more.

## 5. Pick a real design system when the brief points to one

Do not hand-recreate an official system or fake one.

| Brief reads as | Use |
|---|---|
| UK public service | `govuk-frontend` |
| US public / trust-first | USWDS |
| Microsoft-style enterprise | Fluent UI |
| IBM-style analytics | Carbon |
| Shopify admin app | Polaris |
| Atlassian-style product | Atlaskit + tokens |
| You own the components, React | shadcn/ui (customised, never default state) |
| Indie / small-team SaaS | Tailwind v4 + your own tokens |

Rules: one system per project; do not import a system and override 90% of it; never claim an aesthetic trend (glassmorphism, bento, "liquid glass" on the web) is an official package.

## 6. Write the token plan (first pass)

Keep it compact:

- **Colour**: 4-6 named hex/OKLCH values with roles (canvas, surface, ink, muted ink, one accent, one danger). One accent per page.
- **Type**: one or two families and their roles, with a reason tied to the subject. Body 16-18 px, a ratio scale (1.2 for product UI, 1.25-1.333 for expressive pages).
- **Layout**: a one-sentence concept plus an ASCII wireframe; say whether content is left-aligned or centred and why.
- **Depth**: pick one strategy (borders only, subtle shadows, layered shadows, or tonal surface shifts) and commit.
- **Motion stance**: none / feedback-only / one authored moment.
- **Principles**: 2-3 lines on what makes *this* page specific.

Example ASCII wireframe:

```
[logo]                    [Menu] [Book]
-----------------------------------------
Fresh sourdough,          | photo of the
baked at 5 am in Leith    | morning bake
[Order for pickup]        |
-----------------------------------------
Today's bake (live list, 6 items, prices)
```

## 7. Review the plan against the defaults (second pass)

For each part of the plan ask: *would I produce this for any similar brief?* If yes, it is a default, not a choice. Change it and say what you changed and why. Check specifically against the tells in [anti-slop.md](anti-slop.md): the cream + terracotta serif look, near-black + acid accent, identical rounded cards, eyebrow labels on every section, purple-blue gradients, Inter-everywhere.

The brief always wins. If the user pins a look (even one on the tell list), follow it exactly. Freedom only applies to axes the brief left open.

## 8. Spend boldness in one place

Pick the one element that will be remembered (a headline treatment, a live demo, a photograph, an interaction) and keep everything around it quiet. Before shipping, remove one decoration ("take one accessory off").

## 9. Content is design

- Use real content from the brief. If none exists, write plausible, specific draft copy. No lorem ipsum, no "John Doe", no "Acme".
- Never invent metrics, logos, testimonials or customer counts. Use the user's numbers, a clearly labelled placeholder ("metric to confirm"), or a layout that doesn't need a number.
- Buttons name the action ("Save changes", not "Submit"); the same action keeps the same word through the flow ("Publish" -> "Published").
- Errors say what happened and how to fix it. Empty states invite the next action.
- Sentence case, plain verbs, no filler ("elevate", "seamless", "unleash", "next-gen").

## 10. Images

Pages that sell something need real visuals. In order: assets the user supplied; an image-generation tool the user has configured (generate at the section's aspect ratio); real photography placeholders such as `https://picsum.photos/seed/<descriptive-seed>/1600/1000`; or clearly labelled slots (`<!-- TODO: hero photo of the bakery counter, 1600x1200 -->`) plus a list of needed images in your reply. Never fake a product screenshot out of styled `<div>`s or redraw browser/phone chrome around it.

## Output of this step

A short block in your reply (or a DESIGN.md, see [design-md-and-prototypes.md](design-md-and-prototypes.md)):

```
Design read: ...
Mode: Persuade
Signature: ...
Tokens: canvas #F7F7F4, ink #1B1D1F, muted #5B6168, accent #0B6E4F, danger #B42318
Type: "Söhne" 400/600 for all roles, scale 1.25, body 17/1.6
Layout: left-aligned split hero, then full-width live menu, then map + hours
Depth: borders only. Motion: one hero reveal, feedback elsewhere.
Rejected defaults: centred hero over gradient, 3 feature cards, cream + serif
```

Then build, following [visual-system.md](visual-system.md) and [components-and-states.md](components-and-states.md).
