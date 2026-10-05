# Email templates: React Email, MJML and HTML quirks

> Distilled from: react-email and its STYLING, COMPONENTS and PATTERNS references (resend/react-email, MIT), email-html-mjml with its compilation and MJML references (framix-team/skill-email-html-mjml, MIT), email-template-builder (alirezarezvani/claude-skills, MIT), email-best-practices (resend/resend-skills, MIT), email-marketing-bible design sections (CosmoBlk/email-marketing-bible, MIT). Litmus notes in section 7 are from Litmus's own docs (CREDITS.md).

Use for "build this email in React Email", "MJML template", "responsive email", "email looks broken in Outlook", "Gmail clipped my email", "dark mode email", "email accessibility", "plain-text version", "email design system", "test in Litmus", "email previews across clients".

Visual direction (brand look, images) can come from `image-creation` or the brand's design system; this guide makes it render in inboxes.

## 1. Pick the substrate

Never hand-write table HTML from a prompt. Generate from a framework that compiles to inbox-safe HTML.

| Use | When |
|---|---|
| **React Email** | A React/TypeScript app sends the email (transactional, product email); you want typed props, a preview server and `render()` to HTML and plain text |
| **MJML** | Any stack, ESP template editors, marketing blasts, maximum Outlook support; output is a `.mjml` source plus compiled `.html` |
| **ESP drag-and-drop builder** | Marketers own it and it lives inside Klaviyo, Mailchimp and so on; keep a coded master for brand blocks |

Ready MJML examples ship with this craft in `templates/email-html-mjml/` (newsletter with dark mode, promo sale, order confirmation with a footer partial). Placeholders only: replace copy, URLs and brand.

## 2. Rules every email follows

**Layout**
- Single column, 600 px wide (React Email's `Container` caps at 37.5em, about 600 px). Premium minimal layouts can go narrower (around 470-520 px).
- Layout with tables (`role="presentation"`) or framework rows and columns. No flexbox, no grid; media queries are unreliable in many clients.
- Inline the critical styles (colour, font size, padding) as attributes or inline CSS; some clients strip `<style>` blocks.
- Web fonts with a fallback stack (`Inter, Arial, sans-serif`); Outlook falls back to Times New Roman otherwise.
- No JavaScript, forms or video players: they are blocked. A "copy" button or toggle is decoration only.

**Size and images**
- Keep the HTML under **102 KB** or Gmail clips it behind "View entire message" (and can hide the unsubscribe link with it). Minify at build.
- Images: PNG, JPG or GIF on an absolute HTTPS URL (a CDN you control). Avoid SVG and WEBP. Each under ~200 KB, total under ~800 KB.
- Never put the headline, offer or CTA only in an image. Many clients block images by default, and inbox summaries read live text.
- Fixed width and height for logos and icons; `width: 100%; height: auto` for content images.

**Content and accessibility**
- `lang` (and `dir`) on the root; a `<title>`; one `h1`, then headings in order.
- `alt` on every image: describe meaningful images, `alt=""` for decorative ones. **A linked image is never decorative**: its alt says where the link goes.
- Text contrast 4.5:1 or better; body text 16 px; tap targets at least 44 x 44 px.
- Link text names the destination ("Read the report", not "click here").
- Always send a **plain-text part** (accessibility, some clients, spam filters).
- Preview text set explicitly ([campaigns-subject-lines-testing.md](campaigns-subject-lines-testing.md)).

**Footer (marketing)**: unsubscribe link, preference link if any, sender's physical postal address, why they are receiving it. Transactional email carries company name and address but no marketing unsubscribe ([transactional-email.md](transactional-email.md)).

## 3. Dark mode

Clients either leave colours alone, partly invert them, or fully invert them; you control little.
- Declare support: `<meta name="color-scheme" content="light dark">` and `<meta name="supported-color-schemes" content="light dark">`.
- Use safe neutrals: `#121212` rather than pure `#000000`, `#F1F1F1` rather than pure `#FFFFFF`, so forced inversion is less harsh. (One React Email example uses black; the softer neutral is the safer default.)
- Set explicit text and button colours everywhere; never rely on inherited defaults.
- Logos: transparent PNG with a light outline or padding, or swap a dark-mode logo with `@media (prefers-color-scheme: dark)` (supported in Apple Mail and some others, ignored in many). Avoid pure white logos on transparency.
- Test in dark mode on iOS Mail, Gmail app and Outlook before shipping.

## 4. React Email

```sh
npm i react-email          # or: npx create-email@latest (starter project)
npx email dev --dir emails --port 3000   # preview server
```
(Installing is the user's call; ask before adding packages.)

```tsx
import { Html, Head, Preview, Body, Container, Heading, Text, Button, Tailwind, pixelBasedPreset } from 'react-email';

export default function ResetEmail({ name, resetUrl }: { name: string; resetUrl: string }) {
  return (
    <Html lang="en">
      <Tailwind config={{ presets: [pixelBasedPreset], theme: { extend: { colors: { brand: '#1F5EFF' } } } }}>
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Preview>Reset your password. This link expires in 1 hour.</Preview>
          <Container className="mx-auto p-5 bg-white">
            <Heading as="h1" className="text-2xl text-gray-900">Reset your password</Heading>
            <Text className="text-base text-gray-800">Hi {name}, use the button below. It works once and expires in 1 hour.</Text>
            <Button href={resetUrl} className="bg-brand text-white px-5 py-3 rounded block text-center no-underline box-border">Reset password</Button>
            <Text className="text-sm text-gray-600">Didn't ask for this? You can ignore this email.</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
ResetEmail.PreviewProps = { name: 'Ada', resetUrl: 'https://example.com/reset/abc' };
```

**Rules**
- Tailwind with `pixelBasedPreset` (clients do not support `rem`). `<Head />` goes inside `<Tailwind>`.
- No `sm:`/`md:` responsive prefixes, no `dark:`/`light:` selectors, no flex or grid classes.
- `Button` always gets `box-border`. Borders always state a style (`border-solid`); for one side, `border-none border-l border-solid`.
- `<Preview>` is the first element inside `<Body>`. Use `Container` once; `Section`, `Row`, `Column` inside it.
- Images go in `emails/static/` for preview and use a production base URL in production; ask for the real CDN URL, never hard-code `localhost`.
- Props are typed; add `PreviewProps` with realistic data. Do not write `{{mustache}}` variables in the JSX; if an ESP needs them, put the mustache strings in `PreviewProps` only and export.
- Render: `await render(<Email {...props} />)` for HTML and `await render(<Email {...props} />, { plainText: true })` for text. The Resend SDK accepts `react:` and renders both.
- Export static HTML for an ESP: `email export --outDir out --plainText --dir emails`.
- Ask before writing: brand colour (hex), logo (PNG/JPG), tone, production asset URL.

**Shared layout:** build one `EmailLayout` (logo header, content slot, footer with address and links) and compose every template from it, plus a `Button` component. Keep i18n strings in typed locale files and pass `lang`/`dir` per locale.

## 5. MJML

```bash
npx mjml welcome.mjml -o dist/welcome.html --config.minify=true --config.validationLevel=strict
```
- Node 20+. Never install MJML globally; use `npx` or a project dev dependency (`npm install -D mjml`, with the user's agreement).
- Always deliver both the `.mjml` source and the compiled `.html`. Judge success by the exit code, not by the presence of the file (a failed rebuild leaves the old one in place).

**Engineering rules**
1. All content sits in `mj-column` inside `mj-section`; sections do not nest (use `mj-wrapper` to group).
2. 600 px default; column widths auto-split or must sum to 100%. Use `mj-group` to stop side-by-side items (social icons, logo rows) stacking on mobile, and `gutter` on the section for spacing.
3. Outlook: `mj-font` plus a fallback stack; background images only on `mj-section` or `mj-hero` (VML), with `background-size`, keyword positions and a fallback `background-color`.
4. Gmail: critical styles as component attributes; `<mj-style inline="inline">` for custom CSS.
5. If one column in a section sets `vertical-align`, set it on every column in that section.
6. Accessibility: `lang` on `<mjml>`, `mj-title`, `alt` on every `mj-image` and social element; heading roles via `mj-html-attributes`, not attributes on `mj-text`.
7. Reuse styles with `mj-attributes` (`mj-all`, `mj-class`).
8. Use `mj-hero` for full-bleed heroes. Skip `mj-accordion` and `mj-carousel` (poor support).

**Gotchas**
- **`mj-include` is off by default in MJML 5.** Without `--config.allowIncludes true` (and `--config.includePath` for partials outside the template folder) the include is silently dropped, strict validation still passes and the exit code is 0. Grep the output for a known plain-text string from the partial.
- Templating: `{{firstName}}` passes through untouched. Block tags with `<` or `>` (`{% if x < 5 %}`) need `<!-- htmlmin:ignore -->` around them. Keep templating tags out of `mj-style` (minify fails the build); put `mj-raw` between sections, not between components inside a column.
- MJML 5 minify keeps a single space between tags; MJML relies on `font-size:0` on parent cells to avoid column gaps. Add `--config.minifyOptions '{"collapseWhitespace":"all"}'` if stacking appears.
- `mj-text` and other ending tags hold raw HTML; you cannot nest MJML components inside them.

## 6. Merge tags and personalisation

- Every merge field has a fallback (`{{ first_name | default: "there" }}` in Liquid-style ESPs, a default prop in React Email). Test with an empty profile.
- Merge fields inside `href` need defaults too, or links break.
- Variable names are often case-sensitive (Resend templates use triple braces and exact keys); copy them from the ESP, do not guess.

## 7. Test before it ships

**Pick a rendering tool.** Ask which testing tool the team has before suggesting one.

| The user's situation | Use | Why |
|---|---|---|
| Already pays for Litmus or Email on Acid | That one | Screenshots across many clients without owning the devices |
| No testing tool, no budget | Real test sends to Gmail (web and app), Outlook, Apple Mail and iOS, light and dark | Free, and shows what real inboxes do |
| Wants client screenshots plus spam and authentication checks in one place | Litmus | Previews & QA plus Spam Testing on emails sent to its test address |
| Building an editor or product that needs previews by API | Litmus Instant API | Only if Litmus grants partner access (see below) |

**Litmus.** For most accounts there is no API route: Claude prepares the email and the test send, and reads the results the user shares.
- Get the email in by sending a test from the ESP to the user's own Litmus test address (each full-access user has one; find it under Test your email on the Home or Emails page). Litmus builds the previews from it, and it shows what subscribers get. Pasting HTML is quicker but gives no spam results; ESP sync, where the plan has it, keeps the Litmus copy in step with the ESP.
- Previews & QA shows client previews and pre-send checks: inbox envelope, subject line, UTM checks, images-off view and load time.
- Spam Testing runs 8 checks, among them DMARC, DKIM, blocklists and BIMI, only on mail that arrived at the test address. It needs a Plus or Enterprise plan.
- A test send is still a send: show the exact email and the test address, and wait for a yes.
- Instant API (`https://instant-api.litmus.com/v1`) is for partners; Litmus grants access case by case. Auth is HTTP basic with the API key as the username and an empty password. `POST /emails` (`html_text`, `plain_text`, `subject`) returns an `email_guid`; `GET /emails/{email_guid}/previews/{client}` returns screenshot URLs, usually within about 10 seconds (Outlook clients 3-7 seconds). Emails are kept 48 hours. Keep the key in an env var.

1. Compile or render with strict validation; check the HTML size (under 102 KB).
2. Send a real test with real merge data to Gmail (web and app), Outlook (desktop and web), Apple Mail and iOS, in light and dark mode. A rendering service (table above) covers more clients if the team has one.
3. Images off: is the message still clear?
4. Click every link; check UTMs and that no placeholder URL is left.
5. Screen reader or accessibility check on headings, alt text, link names; contrast check.
6. Plain-text part present and readable.
7. Marketing: unsubscribe link, physical address and `List-Unsubscribe` headers present in the received message.

## Checklist

- [ ] Built from React Email, MJML or the ESP builder, not hand-written tables
- [ ] 600 px single column, inline critical styles, fallback fonts, no flex/grid/JS
- [ ] Under 102 KB; images PNG/JPG on HTTPS, sized and compressed
- [ ] Headline and CTA in live text; preview text set; plain-text part included
- [ ] `lang`, title, one h1, alt on every image, 4.5:1 contrast, 44 px tap targets
- [ ] Dark mode tested with safe neutrals and explicit colours
- [ ] Merge tags have fallbacks; MJML includes verified in the output
- [ ] Real test send checked across clients, light and dark
