> Distilled from: flutter-apply-architecture-best-practices (flutter/agent-plugins, BSD-3-Clause), flutter-build-responsive-layout (flutter/agent-plugins, BSD-3-Clause)

# Flutter: layered architecture and adaptive layouts

Use Flutter when the team already knows Dart or needs one UI codebase across iOS, Android, web and desktop with pixel control. Material 3 by default; Cupertino widgets or platform-adaptive constructors (`Switch.adaptive`) where the iOS feel matters.

## 1. Layers

| Layer | Contains | Rules |
|---|---|---|
| UI: Views | Lean widgets | Only UI logic (animation, layout, simple routing); all data comes from the ViewModel |
| UI: ViewModels | State + user actions | `ChangeNotifier` (or `Listenable`); expose immutable state; repositories injected via constructor |
| Domain (optional) | Use cases | Only when logic is complex or shared across ViewModels |
| Data: Repositories | Single source of truth | Turn API models into domain models; caching, offline sync, retries |
| Data: Services | Stateless wrappers | HTTP clients, local DB, platform plugins; return raw models or `Result` |

Never mix rendering with fetching. Views never call services.

```
lib/
├── data/{models,repositories,services}/
├── domain/{models,use_cases}/
└── ui/
    ├── core/                 # shared widgets, theme, typography
    └── features/<feature>/{view_models,views}/
```

## 2. Adding a feature (in order)

1. Immutable domain models (`freezed` or `built_value`).
2. Service for the external API.
3. Repository: consumes services, returns domain models, caches.
4. Use case only if the logic is complex or cross-repository.
5. ViewModel: injected repositories, immutable state, command methods; `notifyListeners()` on change; set loading flags in `try/finally`.
6. View: `ListenableBuilder` (or `AnimatedBuilder`) on the ViewModel; loading, empty, error and content states.
7. Register service, repository and ViewModel in DI (`provider` or `get_it`).
8. Unit-test ViewModel and repository; loop until green: `flutter test`.

## 3. Adaptive layout rules

- Decide by **available window space**, never by device type or orientation. Apps run in resizable windows, split screen and picture-in-picture.
  - Whole window: `MediaQuery.sizeOf(context)`.
  - Space the parent gives you: `LayoutBuilder` and `constraints.maxWidth`.
  - Do not switch layouts on `OrientationBuilder`/`MediaQuery.orientationOf` near the root.
- Constraints go down, sizes go up, parent sets position. Distribute with `Expanded` (fill remaining) and `Flexible` (up to a limit, `flex` ratios).
- Breakpoint: `maxWidth > 600` → large layout (e.g. `Row` with a 250 px navigation side panel, `VerticalDivider`, `Expanded` content); otherwise the phone layout. Use `NavigationBar` on compact widths and `NavigationRail` on wide ones.
- Do not let content stretch: wrap lists, forms and text in `Center` → `ConstrainedBox(constraints: BoxConstraints(maxWidth: 800))`.
- Lists become grids on wide windows: `GridView.builder` with `SliverGridDelegateWithMaxCrossAxisExtent` so the column count follows width.
- Always `ListView.builder` / `GridView.builder` for long or unknown-length lists.
- **Do not lock orientation**: it letterboxes on foldables and fails Android large-screen quality tiers. If the business insists, read physical size from the `Display` API, because `MediaQuery` misreports in compatibility mode.
- Support mouse, trackpad and keyboard: hover states, shortcuts, focus traversal, sensible target sizes (48 dp).

Verify by resizing the window (desktop or web target) through the breakpoint and fixing every overflow (yellow-black stripes) at each size.

## 4. Platform and release notes

- Run: `flutter run -d <device>`; list devices with `flutter devices`; `flutter doctor` for toolchain problems.
- Use `SafeArea` or `MediaQuery.paddingOf` for insets; respect text scale (`MediaQuery.textScalerOf`).
- Release builds: `flutter build ipa` (then Transporter, Xcode or the App Store Connect CLI) and `flutter build appbundle` (upload the `.aab` to Play). Store steps in `release-app-stores.md`.
- Performance: profile mode (`flutter run --profile`) plus DevTools; never judge speed in debug mode.

## Pitfalls

- Business logic in `build()`.
- `if (isTablet)` checks based on device model.
- One giant ViewModel per app; keep one per screen/feature.
- A form stretched to 1,900 px wide on desktop.
