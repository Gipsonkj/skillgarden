> Distilled from: adaptive (android/skills, Apache-2.0), migrate-xml-views-to-jetpack-compose (android/skills, Apache-2.0), android-cli (android/skills, Apache-2.0)

# Native Android: Jetpack Compose, adaptive layouts, tooling

Vendor-specific (Google). Default stack for a native Android app: Kotlin, Jetpack Compose, Material 3, Navigation 3. Follow Material Design on Android; never dress it in iOS chrome. APIs marked experimental need the user's OK before you add them.

## 1. Tooling: the `android` CLI

Google's `android` CLI creates projects, runs apps, drives emulators and searches official docs. Installing it is a remote install script from dl.google.com (`curl -fsSL https://dl.google.com/android/cli/latest/<platform>/install.sh | bash`): official, but it is still a piped script, so **ask the user before installing**.

```bash
android create --list                                   # templates
android create empty-activity --name="My App" --output=./my-app
android sdk install platforms/android-35                # SDK packages
android emulator ...                                    # start/stop/list AVDs
android run                                             # build, deploy, launch
android docs <keywords>                                 # official docs search; use it for current APIs
android layout            # JSON of on-screen elements: text, resourceId, contentDesc, interactions, bounds, center
android layout --diff     # only what changed (keeps context small)
android screen capture -o s.png
android screen capture --annotate -o s.png
adb shell input $(android screen resolve --screen s.png --string "tap #34")
```

- Run `android layout --help` / `android screen --help` before driving a device.
- Use `layout` first; fall back to an annotated screenshot for WebViews and animations. Always look at the PNG before acting on it.
- Without the CLI: Android Studio, `./gradlew installDebug`, `adb shell input tap x y`, `adb exec-out screencap -p > s.png`, `adb shell uiautomator dump`.

## 2. Adaptive layouts (phones, foldables, tablets, desktop)

Prerequisites: all screens in Compose and navigation on Navigation 3. If not, migrate first (section 3 for Views; Navigation 3 migration is its own job).

1. **Lock the current UI with screenshot tests** across form factors before changing anything:
   ```kotlin
   @Preview(name = "Phone", device = Devices.PHONE, showBackground = true)
   @Preview(name = "Foldable", device = Devices.FOLDABLE, showBackground = true)
   @Preview(name = "Tablet", device = Devices.TABLET, showBackground = true)
   @Preview(name = "Desktop", device = Devices.DESKTOP, showBackground = true)
   annotation class FormFactorPreviews
   ```
   Use them with `@PreviewTest` (Compose Preview Screenshot Testing).
2. **Adaptive navigation**: replace the bottom bar's `Scaffold` with `NavigationSuiteScaffold` (bar on phones, rail on larger screens), items as `NavigationSuiteItem`s. If the bar hides in some states, keep that with `rememberNavigationSuiteScaffoldState()` and call `show()`/`hide()` from a `LaunchedEffect(isNavBarVisible)`.
3. **Multi-pane with Navigation 3 scenes** (not `ListDetailPaneScaffold`):
   - List-detail (mail, notes, messaging): add `androidx.compose.material3.adaptive:adaptive-navigation3`, create `rememberListDetailSceneStrategy()`, pass it to `NavDisplay(sceneStrategies = …)`, tag entries with `ListDetailSceneStrategy.listPane(detailPlaceholder = { … })` and `.detailPane()`. In two-pane mode the detail shows no back arrow and drops any full-screen mode.
   - Supporting pane: `rememberSupportingPaneSceneStrategy()` with `.mainPane()` / `.supportingPane()`.
   - Skip list-detail when the detail needs the full screen (media).
4. **Lists gain columns**: `LazyColumn` → `LazyVerticalGrid(columns = GridCells.Adaptive(minSize = 300.dp))`; staggered grids use `StaggeredGridCells.Adaptive`. Pick a minimum width at which an item is still clearly readable.
5. **App bars** per destination: `enterAlwaysScrollBehavior` (back on any scroll up) or `exitUntilCollapsedScrollBehavior` (back only at the top).
6. Build, run tests, run screenshot tests **without** updating references; let the user review the diffs and re-record.

Experimental (Compose 1.11+, `@OptIn(ExperimentalGridApi::class)`, ask first): non-lazy `Grid` with size-based column/row config, `FlexBox`, and `MediaQuery` for window size, pointer precision, keyboard and hardware capabilities. Check `android docs` for the current API.

Input beyond touch: support keyboard navigation and focus, mouse hover and right-click, and larger targets for coarse pointers (48 dp minimum).

## 3. Migrating an XML View to Compose (one layout at a time)

1. Pick the candidate (the user's, or a leaf layout with few dependencies).
2. Audit the layout: hierarchy, custom views, data binding, styles, where it is used.
3. Write a plan; get approval if the user is present.
4. Capture a baseline: user screenshot, or an existing/new screenshot test (UI Automator or Espresso).
5. Add Compose dependencies and the compiler plugin only if missing; sync.
6. Theming: only the minimum needed for this screen (Material 3 mapping, or match the custom design system); keep XML themes for interop and existing names.
7. Write the composable plus a `@Preview`.
8. Replace usages (`ComposeView` inside Views, `AndroidView` for Views inside Compose).
9. Compare preview with the baseline for layout and styling until they match; add a Compose UI test.
10. Delete the XML and its old tests only if nothing else references them.

## 4. Compose rules of thumb

- State hoisting: stateless composables take values and callbacks; state lives in a ViewModel exposed as `StateFlow`, collected with `collectAsStateWithLifecycle()`.
- `remember` / `rememberSaveable` for UI state that must survive recomposition / configuration change; `derivedStateOf` for values computed from fast-changing state.
- Lazy lists with stable `key`s; no heavy work in composition; side effects only in `LaunchedEffect`/`DisposableEffect`.
- Material 3 colour scheme with dynamic colour on Android 12+; typography and shapes from the theme, not literals.
- Edge-to-edge with window insets handled (`WindowInsets.safeDrawing`); predictive back supported.
- Release builds: R8 on; for apps targeting Android 15+, check 16 KB page alignment of native libraries (see `react-native-performance.md` for the zipalign check).

## Pitfalls

- Hard-coding phone-only layouts; a stretched single column on a tablet.
- Updating screenshot references yourself instead of letting the user review the diff.
- Migrating the whole XML theme to make one screen compile.
- Piping an install script to bash without asking.
