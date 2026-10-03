> Distilled from: mobile-native (emilkowalski/skills, MIT)

# Web apps and PWAs that feel installed on a phone

When the "app" is a web app (or a PWA), most of the "feels like a website" problem lives in the platform layer: viewport, touch, scroll, safe areas, browser chrome. Almost every fix is one CSS declaration or meta tag. Use media queries for capability, never user-agent sniffing, and never JavaScript where CSS does it.

## 1. Symptom → fix

| Symptom | Fix | Why |
|---|---|---|
| Hover style stuck after a tap | All `:hover` rules inside `@media (hover: hover) and (pointer: fine)` | Touch fakes `:hover` on first tap and leaves it on |
| Grey/blue flash on tap | `html { -webkit-tap-highlight-color: transparent }`, then give every control an `:active` state | Loudest "website" tell |
| Bottom button hidden, layout too tall | `100dvh` for app shells and drawers; `100svh` (min-height) for heroes | `100vh` is the height with the URL bar collapsed |
| Page zooms into an input and stays zoomed | Inputs `font-size: 16px` minimum | iOS zooms on focus below 16px |
| Taps feel late | `touch-action: manipulation` on controls; feedback on `:active` / `pointerdown`, not `click` | Double-tap-zoom wait; feedback on release reads as lag |
| Pull-to-refresh or rubber band fights the app | `html, body { overscroll-behavior: none }`; inner scrollers `overscroll-behavior: contain` | Stops scroll chaining without blocking scroll |
| Content letterboxed or under the notch | `viewport-fit=cover` in the viewport meta + `padding: env(safe-area-inset-*)` on fixed headers, tab bars, sheets, toasts | Without the meta tag every `env()` value is 0 |
| Long-press selects a button label | `user-select: none; -webkit-user-select: none; -webkit-touch-callout: none` on controls only | Never on body: users copy addresses and order numbers |
| Horizontal carousel jitters the page | `touch-action: pan-y` on the carousel; `none` only on surfaces that own every axis; or native `scroll-snap-type: x mandatory` | Tells the browser which axis it keeps |
| Status bar colour wrong in one theme | One `<meta name="theme-color">` per `prefers-color-scheme`, matching the header colour | One value can't fit both schemes |

Press feedback: `transform: scale(0.97)` plus background change, 100-160 ms, ease-out.

## 2. Keyboards and inputs

`type="email"`, `type="tel"`, `inputmode="numeric"` (codes), `inputmode="decimal"` (amounts), `autocomplete` set, `autocapitalize="none"` and `autocorrect="off"` on usernames and codes, `enterkeyhint="send" | "search" | "done"` so the return key says what it does.

## 3. Baseline (ship before the first component)

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0a" />
<meta name="color-scheme" content="light dark" />
```

```css
html {
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
  overscroll-behavior: none;            /* drop for document-style pages */
}
input, textarea, select { font-size: 16px; }
button, a, [role="button"] {
  touch-action: manipulation;
  user-select: none; -webkit-user-select: none;
}
@media (hover: hover) and (pointer: fine) { /* every :hover rule lives here */ }
```

`interactive-widget=resizes-content` makes the Android keyboard shrink the layout like iOS does, so bottom-pinned inputs follow it. In Next.js set theme colours via the `viewport` export (`themeColor: [{ media, color }]`); if the theme toggles by class, update the meta tag on toggle.

## 4. PWA specifics

- Web app manifest: `name`, `short_name`, `start_url`, `display: "standalone"`, `theme_color`, `background_color`, icons at 192 and 512 px plus a maskable icon.
- iOS: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon` (180 px).
- Standalone mode changes the viewport, safe areas and status bar: test installed, not only in the browser.
- A service worker for offline shell and caching; never cache API responses that carry user data without an expiry.

## 5. Never ship

| Never | Instead |
|---|---|
| `user-scalable=no` or `maximum-scale=1` | 16px inputs (fix the cause; disabling zoom is an accessibility failure) |
| Ungated `:hover` | Capability media query |
| `100dvh` on a marketing hero | `100svh` (no shift mid-scroll) |
| `touchmove` + `preventDefault()` to stop overscroll | `overscroll-behavior` |
| `touch-action: none` on something users scroll past | `pan-x` / `pan-y` |
| UA or width sniffing to detect touch | `(hover)` / `(pointer)` queries; touch and mouse can coexist (iPad + trackpad) |

## 6. Test on hardware

None of these bugs reproduce in desktop device emulation. Run the dev server on `0.0.0.0`, open it on the phone by LAN IP, debug with Safari → Develop → device (iOS) or `chrome://inspect` (Android). Test an older phone, with the keyboard open, once in landscape, and installed if PWA is a target. Report which fixes you verified from code and which the user must confirm on a device.
