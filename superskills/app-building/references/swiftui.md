> Distilled from: swiftui-expert-skill (avdlee/swiftui-agent-skill, MIT), swiftui-pro (twostraws/swiftui-agent-skill, MIT), swiftui-ui-patterns (dimillian/skills, MIT)

# SwiftUI (iOS and macOS)

Defaults for new apps: the latest iOS as deployment target unless the user says otherwise (gate newer APIs with `#available` and a fallback when supporting older OS versions), Swift 6.2+ with Approachable Concurrency and MainActor default isolation (see `swift-concurrency.md`), no UIKit and no third-party frameworks unless asked. Do not impose an architecture (MVVM, TCA); do keep business logic out of views so it is testable.

## 1. State and data flow

| Situation | Use |
|---|---|
| Local UI state owned by one view | `@State private var` |
| Child edits a parent's value | `@Binding` (only then) |
| Root-owned reference model (iOS 17+) | `@State` holding an `@Observable` class |
| Injected observable that needs bindings | `@Bindable` |
| Shared app service or configuration | `@Environment(Type.self)` |
| Feature-local dependency | Plain initialiser parameter |
| Legacy (iOS 16 and earlier) | `@StateObject` at the owner, `@ObservedObject` when injected |

- `@Observable` classes are `@MainActor` unless the module defaults to MainActor isolation.
- Avoid `ObservableObject`/`@Published`/`@EnvironmentObject` in new code (if unavoidable, `import Combine`).
- Never store a changing parent input in `@State` (it only seeds once).
- No `Binding(get:set:)` in `body`; bind to real state and react with `onChange(of:) { old, new in }` (never the one-parameter `onChange`).
- `@AppStorage` does not work inside an `@Observable` class.
- Numeric text input: `TextField("Score", value: $score, format: .number)` plus `.keyboardType(.numberPad / .decimalPad)`.
- Mutually exclusive presentations are one enum, not several booleans. `.sheet(item:)` over `.sheet(isPresented:)` when a model is selected; sheets own their actions and call `dismiss()`.
- Async work in `.task` / `.task(id:)` (auto-cancelled), not `onAppear`; explicit loading and error states.
- Custom environment/focus/transaction keys via `@Entry` with stable defaults (no `Date()`, `UUID()`, `Model()` as defaults; no closures in environment keys).
- SwiftData + CloudKit: no `@Attribute(.unique)`, every property optional or defaulted, all relationships optional.

## 2. Views

- Each `View` is an invalidation boundary: give it only the data it reads and keep fast-changing values near the smallest subtree that uses them.
- Split long bodies into separate `View` structs (one type per file), not computed properties or `@ViewBuilder` functions.
- Button actions and business logic go in methods or the model, not inline in `body`, `task` or `onAppear`.
- Keep initialisers trivial and `body` cheap: no sorting, filtering or formatter creation in `body`. Use `Text(date, format: .dateTime.day().month())` and `.currency(code:)` instead of stored formatters.
- Toggle modifier values with ternaries instead of `if/else` branches (preserves identity). Avoid `AnyView`.
- `ForEach` with stable identity: `Identifiable` models, never `.indices` or `\.offset`; a constant number of views per element; `List` rows are single views.
- `LazyVStack`/`LazyHStack` for large scrolling content.
- `#Preview` with self-contained mock data, no network.

## 3. Modern API (replace the left column)

| Old | Use |
|---|---|
| `foregroundColor()` | `foregroundStyle()` |
| `cornerRadius()` | `clipShape(.rect(cornerRadius:))` |
| `tabItem()` | `Tab("Home", systemImage: "house", value: .home)` with an enum selection |
| `.navigationBarLeading/Trailing` | `.topBarLeading/.topBarTrailing` |
| `overlay(Text(...), alignment:)` | `overlay(alignment:) { ... }` |
| `UIImpactFeedbackGenerator` | `.sensoryFeedback(.success, trigger: value)` |
| Manual `EnvironmentKey` | `@Entry` |
| `PreviewProvider` | `#Preview` |
| `GeometryReader` (often) | `containerRelativeFrame()`, `visualEffect()`, `onGeometryChange`, `Layout` |
| `showsIndicators: false` | `.scrollIndicators(.hidden)` |
| `Text + Text` | interpolation `Text("\(a)\(b)")` |
| `animatableData` by hand | `@Animatable` (with `@AnimatableIgnored`) |
| `.animation(.spring)` | `.animation(.spring, value: x)` (always with `value`) |
| Wrapped `WKWebView` (iOS 26+) | `WebView` (`import WebKit`) |
| `Image("avatar")` | `Image(.avatar)` when asset symbols are on |
| `TextEditor` (non full-screen) | `TextField(..., axis: .vertical).lineLimit(5...)` |

Chain animations with `withAnimation { … } completion: { … }`, not delays. Replace hard-deprecated APIs; during feature work only flag soft-deprecated ones. Adopt Liquid Glass only when the user asks.

## 4. Navigation and app wiring

- `TabView` with the `Tab` API; each tab owns a `NavigationStack` with its own path; route with an enum and `navigationDestination(for:)`.
- Large displays and iPad: `NavigationSplitView`; tab bar that becomes a sidebar via `.tabViewStyle(.sidebarAdaptable)`.
- iOS 27+: `.sidebarAdaptable` morphs between tab bar and sidebar on iPad, but on iPhone it stays a tab bar unless you opt in with `defaultTabBarPlacement(_:)`. Read `@Environment(\.isTabViewSidebarAvailable)` before showing UI that assumes a sidebar, and keep nested-tab content reachable in both forms. Gate with `#available`.
- Resizable windows and iPhone/iPad multitasking: no fixed device-sized frames, no hard-coded safe-area insets. Branch on size class (or `onGeometryChange` for a threshold), and never swap the container type during a resize (it throws away navigation state). Test the narrowest and widest sizes.
- Deep links: parse URL → route enum → push onto the right tab's path.
- Alerts and confirmation dialogs bound to an item when they concern a specific item.
- macOS: scenes (`WindowGroup`, `Settings`, `MenuBarExtra`), window styling and toolbars follow the platform; see `desktop-tauri-macos.md` for packaging.

## 5. Accessibility (hard requirements)

- Dynamic Type fonts (`.body`, `.headline`); custom sizes via `@ScaledMetric` (or `.font(.body.scaled(by:))` on iOS 26+). Test at the largest sizes.
- Every tappable is a `Button` (no `onTapGesture` unless location or count matters; then add `.accessibilityAddTraits(.isButton)`).
- Icon buttons keep a text label: `Button("Add User", systemImage: "plus", action: add)`, with `.labelStyle(.iconOnly)` if it must look icon-only. Same for `Menu`.
- Decorative images `Image(decorative:)` or `accessibilityHidden()`; meaningful ones get `accessibilityLabel`.
- Respect Reduce Motion (swap big motion for opacity) and Differentiate Without Color.
- Tap targets ≥ 44x44 pt; `accessibilityInputLabels` for buttons with changing labels.

## 6. Performance with Instruments (bundled scripts)

`scripts/swiftui-expert-skill/` records and analyses Instruments traces (Python 3, Xcode command-line tools).

```bash
python3 scripts/swiftui-expert-skill/record_trace.py --list-devices
# real device or the Mac: default SwiftUI template; Simulator: add --template "Time Profiler" (SwiftUI lane is empty there)
python3 scripts/swiftui-expert-skill/record_trace.py --device "<name|udid>" --attach "<AppName>" \
  --stop-file /tmp/stop-trace --output ~/Desktop/session.trace
touch /tmp/stop-trace        # when the user has finished exercising the app
python3 scripts/swiftui-expert-skill/analyze_trace.py --trace ~/Desktop/session.trace --json-only --top 10
```

- Scope to a moment: find it with `--list-logs --log-message-contains "loaded feed"` or `--list-signposts --signpost-name-contains "ImageDecode"`, then pass `--window START_MS:END_MS`.
- Read `main_running_coverage_pct` per hitch: < 25% means the main thread was blocked (waiting on I/O or a lock); ≥ 75% means CPU-bound work on main.
- `swiftui-causes.top_sources` shows why views keep updating; one wide source (an environment writer, a UserDefaults observer) often drives many hot views. `--fanin-for "<ViewName>"` ranks what invalidates a given view.
- Return a prioritised plan citing the evidence; edit code only if asked.
- Images: downsample `UIImage(data:)` to display size; take display scale from `@Environment(\.displayScale)`.

## 7. Review output format

Group findings by file: line, rule broken, short before/after. Skip clean files. End with a prioritised summary (accessibility and correctness before style). Report real problems only.

## Correctness checklist

- [ ] `@State` and `@FocusState` are `private`; `@Binding` only where the child writes
- [ ] Stable `ForEach` identity; constant views per element
- [ ] `.animation` always has `value:`
- [ ] Version-specific APIs gated with `#available` and a fallback
- [ ] No double-applied safe-area insets from `GeometryProxy`
- [ ] Previews use mock data
- [ ] Builds without warnings; light and dark, largest Dynamic Type and VoiceOver spot-checked in the simulator
