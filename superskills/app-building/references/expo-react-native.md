> Distilled from: expo-native-ui (expo/skills, MIT), expo-router (expo/skills, MIT), expo-dev-client (expo/skills, MIT), expo-upgrade (expo/skills, MIT), upgrading-react-native (callstackincubator/agent-skills, MIT), react-native-skills (vercel-labs/agent-skills, MIT), argent-react-native-app-workflow (software-mansion/argent, Apache-2.0), convex-quickstart (get-convex/agent-skills, Apache-2.0)

# Expo and React Native: build, run, upgrade

Default cross-platform stack: Expo + Expo Router + TypeScript. APIs move every SDK: check the versioned docs (`docs.expo.dev/versions/v<sdk>/`) before writing config from memory.

## 1. Running the app

- **Try Expo Go first** (`npx expo start`, scan the QR). Most `expo-*` packages, Expo Router, Reanimated and Gesture Handler work there.
- **A development build is needed** for local native modules, Apple targets (widgets, app clips), third-party native modules not in Expo Go, config plugins, and testing remote push or universal links. It is the normal setup for any real app.
  ```bash
  eas build -p ios --profile development --local      # free, needs Xcode
  eas build -p android --profile development --local
  npx expo start --dev-client
  xcrun simctl install booted ./App.app     # simulator; adb install build.apk for Android
  ```
  Cloud EAS builds use the account's paid build minutes and device/TestFlight installs need a paid Apple Developer account: say so before starting one.
- Bare React Native: read `package.json` scripts first (custom `start:dev`, flavours) and use them. One Metro per port (`lsof -i :8081`); start Metro before the app; pass the device explicitly (`npx react-native run-ios --simulator="iPhone 16"`); on Android run `adb -s <serial> reverse tcp:8081 tcp:8081`.
- JS change → reload. Native code, pods or config change → rebuild. After 2-3 failed builds, stop and ask the user (env vars, Xcode version, private setup). Once the run recipe works, write it into the project's notes.

## 2. Project structure and navigation (Expo Router)

- Routes live in `app/`; nothing else does (components, hooks, utils go elsewhere). Kebab-case filenames. A route must match `/`. Remove old route files when restructuring.
- Stacks are defined in `_layout.tsx` with `Stack` from `expo-router/stack`; titles via the navigator (`Stack.Title` or `options.title`), never a hand-made text header. Large titles on iOS (`headerLargeTitleEnabled` in SDK 56+).
- Tabs: `NativeTabs` (system tab bar) with an SF Symbol and a Material icon for each trigger; each tab owns a stack. A shared group like `app/(index,search)/_layout.tsx` lets two tabs push the same screens.
- Presentations: `presentation: "modal"` for tasks; `presentation: "formSheet"` with `sheetAllowedDetents: [0.5, 1.0]` and `sheetGrabberVisible: true` for short interruptions. Prefer these over custom modal components.
- `<Link href>` for navigation; add `<Link.Preview>` and `<Link.Menu>` context menus on iOS where they help. Search via `Stack.SearchBar` / `headerSearchBarOptions`.
- One-way doors (signed in, onboarded, purchased): guard with `Stack.Protected` and `router.replace`. See `native-feel-design.md` for when to push, replace, present.
- SDK 56+: import React Navigation pieces from `expo-router/react-navigation`, never `@react-navigation/*` directly.

## 3. Library choices

| Need | Use | Not |
|---|---|---|
| Sheets, pickers, sliders, switches, menus, settings sections | `@expo/ui` (real SwiftUI / Compose, Expo Go on SDK 56+) | Rebuilt JS controls |
| Long or unknown-length lists | FlashList (or FlatList) | `@expo/ui` List (not virtualised), `ScrollView` + `map` |
| Images | `expo-image` (`recyclingKey` in lists, blurhash placeholder) | `<Image>` from RN, `<img>` |
| Icons | `expo-symbols` SF Symbols on iOS + Material on Android | `@expo/vector-icons` as the iOS default |
| Audio / video | `expo-audio`, `expo-video` | `expo-av` (deprecated) |
| Safe areas | `contentInsetAdjustmentBehavior="automatic"` on the root ScrollView/FlatList; `react-native-safe-area-context` | RN `SafeAreaView`, hard-coded insets |
| Colours | `Color` from `expo-router` (`Color.ios.label`, `Color.android.dynamic.onSurface`) centralised in `theme/colors.ts` with a web fallback | Hex tables per theme |
| Shadows | `boxShadow: "0 1px 2px rgba(0,0,0,0.05)"` | Legacy `shadow*` / `elevation` |
| Platform checks | `process.env.EXPO_OS` | `Platform.OS` |
| Storage | `expo-sqlite` (incl. `expo-sqlite/localStorage`), `expo-secure-store` for secrets | AsyncStorage for new code |
| Motion | Reanimated + Gesture Handler; keyboard UI via `react-native-keyboard-controller` | `Keyboard.addListener` + guessed timing |
| Server state | TanStack Query | `useEffect` + `fetch` |
| Blur / glass | `expo-blur`, `expo-glass-effect` | |

Do not pass `Color`/`PlatformColor` objects into Reanimated styles (they are not strings).

## 4. Screen rules

- Scrollable screens: the ScrollView (or list) is the first child of the route, with `contentInsetAdjustmentBehavior="automatic"`. A list-root screen gets no outer ScrollView.
- Padding and `gap` on `contentContainerStyle`, not on the ScrollView. Flexbox and `useWindowDimensions`, never `Dimensions.get()`.
- `borderCurve: 'continuous'` on rounded corners; `fontVariant: ['tabular-nums']` on counters; `<Text selectable>` on data and error messages.
- Every data screen has four states: loading, error, empty, content; never show "empty" while the first load is still running.
- `keyboardShouldPersistTaps="handled"` on forms and search results; the primary action is never under the keyboard.
- Every enabled control does its job: Save saves, search filters. No empty handlers or fake success alerts. Do not dismiss a form before its save succeeds; keep drafts on failure.
- Respect each platform: no FAB or ripple on iOS; no iOS chevrons, large-title text or iOS switches hand-built on Android.

Before calling a screen done: walk its main task including one failure and recovery, check back/dismiss, try long titles, missing images, no results and the largest system text size, and report what you ran and what you could not.

## 5. Upgrading Expo SDK

1. Read the target SDK's changelog. From SDK 55 or earlier, go straight to SDK 57 at `expo@57.0.9` or later (SDK 56 and early 57 have a Hermes V1 memory regression with Reanimated/Worklets). Do not tell users to switch Hermes versions.
2. `npx expo install expo@latest` → `npx expo install --fix` → `npx expo-doctor` (fix every finding).
3. Only if `ios/` or `android/` exist (not CNG): `npx expo prebuild --clean`, `cd ios && pod install --repo-update`, `cd android && ./gradlew clean`.
4. Migrate deprecated packages before removing them: `expo-av` → `expo-audio` (`useAudioPlayer`, `useAudioRecorder`) and `expo-video` (`VideoView` + `useVideoPlayer`); `expo-permissions` → per-package APIs; `expo-app-loading` → `expo-splash-screen`.
5. Housekeeping: delete `sdkVersion` from app.json; remove `newArchEnabled` (default now); enable React Compiler (`"experiments": {"reactCompiler": true}`, SDK 54+); install `react-native-worklets` (SDK 54+ with Reanimated); keep `expo-constants` when using expo-router; delete babel/metro configs that only hold defaults; review `expo.install.exclude` entries and `patches/`.
6. Rebuild the dev client, run the app on both platforms, test camera/audio/video and navigation.

## 6. Upgrading bare React Native

1. Current and target: `npm pkg get dependencies.react-native`, `npm view react-native dist-tags.latest`.
2. Fetch the template diff from rn-diff-purge (Upgrade Helper):
   `curl -L -f -o rn.diff "https://raw.githubusercontent.com/react-native-community/rn-diff-purge/diffs/diffs/<from>..<to>.diff"`, list files with `grep -n "^diff --git" rn.diff`.
3. Apply `package.json` changes and native file changes by hand (Podfile, Gradle, AppDelegate, MainApplication), keeping project customisations.
4. Triage every native dependency for compatibility with the target RN and React versions; align React (React 19: `use` instead of `useContext`, `Context` as provider, `forwardRef` removal).
5. If the app also uses Expo, apply the Expo SDK layer above.
6. Both platforms must build: `npx react-native build-android --mode debug --no-packager` and an `xcodebuild … -sdk iphonesimulator build`. Then click through the main flows.

## 7. React Native rule priorities

Lists first (virtualise, memoised items, stable callbacks, no inline objects, item types for mixed lists, light images); animations on `transform`/`opacity` with `useDerivedValue`; native stack and native tabs over JS navigators; Pressable over TouchableOpacity; native menus and modals; `onLayout` over `measure()`; text always inside `<Text>`; ternaries, not `&&`, with numbers; monorepos keep native dependencies in the app package with single versions. Details in `react-native-performance.md`.

## 8. Backend in a hurry (Convex)

If the user wants a backend with zero infrastructure, Convex fits Expo well. Rules that prevent most failures: all backend code under `convex/`; queries use `.withIndex()` with `.take(n)` or `.paginate()`, never an unbounded `.collect()`; import `query`/`mutation`/`action` from `./_generated/server` and `api` from `./_generated/api`; `"use node"` only in action-only files; HTTP handlers wrapped in `httpAction`; verify with `npx tsc --noEmit` and `npx convex dev --once` before calling it done. No extra Postgres or Express layers.

## Pitfalls

- Starting an EAS cloud build or dev client when Expo Go would do.
- Copying web habits: `div`, CSS files, Tailwind without NativeWind, `Platform.OS` everywhere.
- Shipping a screen tested only in light mode or only on iOS.
- Removing a "redundant" package that is a required peer (run `expo-doctor` after every removal).
