# Redesigning an existing interface

> Distilled from: redesign-existing-projects and design-taste-frontend (leonxlnx/taste-skill, MIT), impeccable (pbakaus/impeccable, Apache-2.0), hallmark (nutlope/hallmark, MIT), frontend-design (anthropics/skills, Apache-2.0), extract-design-system (arvindrk/extract-design-system, MIT)

A redesign improves what's there with the stack that's there. It is not a rewrite.

## First decide: preserve or overhaul

| Signal | Mode |
|---|---|
| Established brand (logo, palette, fonts used across product and marketing) | Preserve: refine within the brand |
| User says "keep the feel", "clean this up", "make it more polished" | Preserve |
| User says "redesign", "it looks generic / like AI made it", "start fresh" | Overhaul the look, keep content and IA |
| Product UI people use daily | Preserve layout and muscle memory; fix states and consistency |

Report the mode and what you will keep before you change anything. If unsure, ask one question.

## Scan -> diagnose -> fix

1. **Scan.** Framework, styling method (Tailwind v3 or v4, CSS modules, styled-components, vanilla), component library, icon set, fonts, colour tokens, motion library, spacing scale. Read `package.json` and the global stylesheet. If the brand lives on a live site, read its computed tokens (fonts, colours, radii) from the rendered page or the CSS rather than guessing.
2. **Diagnose.** Walk the audit below and list every generic pattern, weak point and missing state, with file locations.
3. **Fix** in the priority order below, in small reviewable steps, checking the page still works after each.

## Diagnostic audit

| Area | Look for |
|---|---|
| Typography | Default font with no reason, flat hierarchy (size only), body wider than 75ch, Title Case headings, no tabular numbers in data |
| Colour and surface | Several accents, oversaturated colours, pure black/white, warm and cool greys mixed, purple-blue gradients, glow everywhere |
| Layout | Everything centred, three equal cards as structure, uniform padding, no max-width, sections that all look the same |
| Interactivity and states | Missing hover/focus-visible/active/disabled, no loading/empty/error, no pressed feedback, `transition: all` |
| Content | Lorem ipsum, invented stats or logos, "Elevate/seamless" copy, "Submit" buttons, "Oops" errors |
| Components | Hand-rolled dropdowns and modals, generic pricing towers, accordion FAQ by default, emoji icons |
| Icons | Two icon families, inconsistent stroke widths and sizes |
| Code quality | Hard-coded colours and spacing, `z-[9999]`, duplicated class strings, inline styles |

**Often forgotten** (add if missing): footer links to privacy and terms; a way back from every page; a custom 404; client-side validation; a skip link; consent banner where legally required; favicon and social preview image; `<title>` and meta description per page.

## Fix priority

1. **Font swap**: biggest visible gain, lowest risk.
2. **Palette cleanup**: one accent, one grey family, tinted near-black/near-white, contrast pairs checked.
3. **Hover, active and focus states**: makes it feel alive and usable.
4. **Layout and spacing**: container max-width, spacing scale, break lazy symmetry, vary section rhythm.
5. **Replace generic components** with ones that fit the content (a comparison table instead of three pricing towers when plans differ in detail; a real product screenshot instead of a div mock).
6. **Loading, empty and error states**: makes it feel finished.
7. **Typography polish**: balanced headings, measure, tabular numbers, tracking on display sizes.

## Upgrade techniques

- **Type**: pair a characterful display face with a quiet body face, or one variable family with real weight contrast. Tighten display tracking slightly; increase size contrast between levels.
- **Layout**: left-align content that's meant to be read; use asymmetric splits (7/5, 8/4) instead of 6/6; let one section break the grid on purpose.
- **Surface**: replace decorative shadows with one depth strategy; replace gradient washes with a tinted neutral surface and one accent.
- **Motion**: remove section fade-ups; keep press feedback and one authored moment. See [motion-and-microinteractions.md](motion-and-microinteractions.md).
- **Imagery**: real photography or product screenshots beat illustrations and abstract blobs.

## Rules

- Work with the existing stack. Don't migrate frameworks or styling libraries.
- Don't break existing functionality; check after each change.
- Check the dependency file before importing anything new; give the install command if needed.
- Check the Tailwind version before touching config (v4 has no `tailwind.config.js` theme by default).
- On MUI, Ant Design, Bootstrap or Sass, change the look through the library's theme layer: [component-library-theming.md](component-library-theming.md).
- No framework? Use vanilla CSS with custom properties.
- Keep each change focused and reviewable. Show before/after for visible changes.
- Run the [anti-slop.md](anti-slop.md) gate and [accessibility.md](accessibility.md) checks on the result.
