> Distilled from: appllama-app-design-skill (Appllama/appllama-app-design-skill, MIT), mobile-native (emilkowalski/skills, MIT), expo-native-ui (expo/skills, MIT)

# Native-feel design for mobile screens

The user will compare your screen with the best apps on their phone within seconds. These rules apply to any stack; code examples use Expo / React Native, and the SwiftUI and Compose guides carry their platform equivalents.

## 1. Study before you draw

Before designing a screen type (onboarding, paywall, settings, feed, checkout), look at how 10-30 shipping, top-ranked apps solved it: screenshots, Mobbin-style libraries, or a research MCP if the user has one connected (optional, some are paid). Take the **pattern**, not the pixels: layout skeleton, hierarchy, which control, where the primary action sits, how progress shows. Then build your own screen in your product's voice. Never copy a competitor 1:1.

## 2. Fidelity laws (breaking one is a finding, not a taste call)

1. **Semantic colours, both themes, day one.** System tokens (iOS `label`, `secondarySystemBackground`; Material dynamic colour). Every screen verified in light and dark before "done".
2. **Native controls over rebuilt ones**: Switch, Slider, segmented control, date picker, context menu, action sheet, share sheet, in-app browser. A rebuilt toggle 50 ms off reads as fake.
3. **One icon family**: SF Symbols on iOS, Material Symbols on Android. Filled variant for the active tab.
4. **Platform type ramp** (Large Title / Title / Headline / Body / Footnote). One display size per screen. Tabular numerals for anything that counts, times or prices. Data users may copy is selectable.
5. **Continuous corners** (squircles) on rounded rectangles; one radius scale stated as a rule ("buttons pill, cards 16, inputs 8").
6. **One elevation system.** Shadows only for things that float.
7. **Spacing on a 4 or 8 base**, `gap` over margins, scroll padding on the content container.
8. **Safe areas are part of the design**: content scrolls under the status bar/Dynamic Island with the intended treatment; bottom actions clear the home indicator; never hard-coded notch numbers.
9. **Titles belong to the navigator** (native large-title collapse on iOS), not a hand-rolled header.
10. **Haptics are punctuation**: selection tick on steps, light impact on snap, success/error on outcomes; same frame as the visual, one per action, never on scroll or in loops, never the only feedback.
11. **Numbers formatted like a product**: 1.4M, 38k, $4.99, localised dates.
12. **Tap targets ≥ 44 pt (iOS) / 48 dp (Android)**; contrast passes in both themes; Dynamic Type / font scale XL does not break layout.

## 3. Anti-slop counts (run before the first simulator pass)

| Count | Must be |
|---|---|
| Distinct accent hues across the app | 1 (spent on primary action, active state, progress) |
| Grey families | 1 (warm or cool, never both) |
| Corner radii not in the stated scale | 0 |
| Emoji in UI chrome | 0 |
| Gradients or glass without a brand reason | 0 (purple/indigo glow CTAs, mesh heroes, confetti for minor events are the model's house style) |
| Labels for one intent ("Get started" vs "Begin") | 1 |
| Mixed typefaces inside one headline for "interest" | 0 |

Ship full state cycles: skeletons shaped like the final layout, composed empty states that say how to fill them, inline specific errors. A happy-path-only screen is unfinished.

## 4. Navigation semantics

Each transition answers: what is this destination, can the user come back, what does back do (chevron, iOS edge swipe, Android back).

| Situation | Use |
|---|---|
| Going deeper; user will return | push |
| Coming back would land in a stale state | replace / redirect |
| Finish a flow and land somewhere specific | dismiss-to that route |
| Self-contained multi-step task | modal with its own stack and Cancel/Done |
| Short interruption (picker, filters, options) | form sheet with detents, drag to dismiss |
| Immersive content (player, camera) | full-screen modal with explicit Close |
| Floating over a visible screen (confirm card, lightbox) | transparent modal overlay |
| Destructive confirm | action sheet |
| Item actions | native context menu |
| Share, web, photo picking | the system controller |

- **One-way doors leave the stack**: after sign-in (on a wall app), finished onboarding (Skip included), purchase, completed session, replace so back cannot re-enter. Android back from Home exits; it never shows Login. But keep the user's place: sign-in demanded by one action is a modal over that screen that completes the action; a paywall opened from a feature dismisses back to the unlocked feature.
- Back is blocked in only two cases: an irreversible request in flight (seconds, visible progress) and unsaved work in a modal (ask first). Transient in-screen state (selection mode, expanded search) consumes the first back.
- Tabs are peers: 3-5 items, labels always on, no slide between tabs, each keeps its own stack, re-tapping the active tab pops to root. Composer, player and checkout live above the tabs.
- Deep links land with a real stack beneath. Cold start: hold the splash until session state resolves; never flash Login before Home.
- A sheet that grows a second step was a modal; if a link could open it, it is a route.

## 5. Motion

- **Frequency gate first**: 100+ times a day (tab switch, back, keyboard, scroll) → platform default only; tens a day (press, row select) → under 150 ms, near-invisible; occasional (sheets, toasts) → standard; rare first-time moments → delight allowed. Deleting an animation is often the best move.
- Name the purpose in one word (feedback, continuity, state change, explanation, delight) or don't build it. Data being read never moves for style.
- **Finger involved → spring**: start from the live value, hand release velocity into the spring, pick the target from projected momentum, rubber-band past bounds, stay grabbable mid-flight. One spring vocabulary per app (e.g. critically damped ~400 ms to settle, slightly underdamped ~300 ms for sheets); bounce only when the gesture carried momentum.
- **Everything else**: under 300 ms, strong ease-out (`cubic-bezier(0.23, 1, 0.32, 1)`), never ease-in on entrances. Press-in feedback 100-150 ms: scale 0.97 on buttons and cards, background highlight (no scale) on list rows, opacity on bar buttons. Exits faster than entrances; enter from scale 0.95 + fade, never scale 0; menus grow from their trigger.
- Respect Reduce Motion: spatial motion becomes cross-fades.
- Bar: sustained 60 fps through the main flow on a **release build on the slowest supported device**. Dev builds and Expo Go hide real jank and add fake jank.

## 6. State that keeps screens calm

- Server state in TanStack Query (or the project's equivalent): cache, retry, optimistic updates. Never `useEffect` + `fetch`.
- Client state in a small atomic store (Zustand, Jotai); no giant app-state context.
- Ephemeral UI state stays local. Optimistic by default: reflect taps instantly, roll back visibly on failure.
- Uncontrolled text inputs for fast typing surfaces.
- Forms: labels above fields; correct keyboard type, autocomplete and text content type on every input (`oneTimeCode` for OTP); return key chains to the next field; validate on blur or submit, errors stay under the field until fixed; tested keyboard avoidance.

## 7. Perceived performance

Skeletons only where the shape is known; no full-screen spinner for a partial update; virtualised lists with stable keys; prefetch the next screen's data on press-in; right-sized images with blurhash/thumbhash placeholders.

## 8. Illustration and assets

One visual language for every illustration (same style, palette, lighting). Generate at the highest quality available and downscale to @1x/@2x/@3x, never upscale. Transparent or flat backgrounds matching the surface; any halo or wrong matte is a redo.

## 9. Definition of done, per screen

- [ ] Reference pattern named
- [ ] Navigation type and back behaviour stated for iOS and Android; one-way doors tested
- [ ] Light and dark screenshots inspected; safe areas checked
- [ ] Long content, empty, loading, error states forced and checked
- [ ] Full flow screen-recorded and scrubbed frame by frame (see `testing-simulators.md`); no wrong-theme or white frames; Reduce Motion respected
- [ ] Dynamic Type XL OK; targets ≥ 44 pt; contrast passes
- [ ] Anti-slop counts pass
