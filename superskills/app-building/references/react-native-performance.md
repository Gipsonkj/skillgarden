> Distilled from: react-native-best-practices (callstackincubator/agent-skills, MIT), react-native-skills (vercel-labs/agent-skills, MIT), appllama-app-design-skill (Appllama/appllama-app-design-skill, MIT)

# React Native performance: measure, fix one thing, re-measure

Never optimise on vibes. Every claim ends with a number from the same measurement before and after ("45 → 60 fps", "TTI 3.2 s → 1.8 s", "bundle 2.1 → 1.6 MB"). If the number did not move, revert and try the next fix.

## 1. Budgets

| Metric | Budget |
|---|---|
| Transition and gesture frame rate | 60 fps sustained in the main flow, on a release build, on the slowest supported device |
| Cold-start TTI, mid-tier device | < 2 s |
| Keystroke to echo | < 50 ms |
| FlashList at fling speed | no blank cells |
| JS bundle | watch the trend; investigate any +10% jump |

Measure only cold starts for TTI (skip warm and hot starts), with `react-native-performance` markers.

## 2. Triage order

| Priority | Area | Typical fix |
|---|---|---|
| Critical | FPS and re-renders | Virtualised lists, then targeted re-render fixes |
| Critical | Bundle size | Kill barrel imports, check heavy libraries |
| High | Startup (TTI) | Defer non-critical init, native navigation |
| High | Native work | Background threads, async Turbo Module methods |
| Medium-high | Memory | Effect cleanup, image recycling |
| Medium | Animations | Worklets on the UI thread |

## 3. Measuring

- **FPS**: Perf Monitor from the dev menu for a quick look; Flashlight for Android reports; Xcode Instruments (see `swiftui.md` for the trace scripts) or Android Studio CPU profiler for native.
- **Re-renders**: React DevTools Profiler (press `j` in Metro). Record exactly the slow interaction; look at the heaviest commits, slow components and re-render counts. Tree depth is not evidence. For release builds, attach DevTools via `@callstack/inspector`.
- Dev builds and Expo Go distort timing in both directions. Confirm on a release build before claiming.

## 4. Lists (fix these first)

- Anything long or growable: FlashList (or FlatList / Legend List), never `ScrollView` + `map`. This one swap fixes more jank than everything else combined.
- Item components wrapped in `memo`, receiving primitives (`name`, `avatarUrl`) rather than whole objects.
- One callback created at the list root, called with the item id; no per-item closures in `renderItem`.
- No inline style objects or functions in items; heavy formatting done before render, not inside each row.
- `getItemType` for mixed-row lists; `recyclingKey` on `expo-image` in rows; right-sized thumbnails.
- Check the FlashList version before flagging props (v2 dropped `estimatedItemSize`).

## 5. Re-renders and state

- Broad context or store read by leaves is the classic storm. Move to atomic state (Zustand selectors, Jotai atoms) so a change re-renders only its consumers.
- React Compiler (Expo SDK 54+ `"experiments": {"reactCompiler": true}`) once profiling shows cascades; watch for bailouts on hot components (mutations, non-plain patterns).
- `useDeferredValue` / `useTransition` for expensive derived UI behind fast inputs (filtering, search highlighting).
- Typing: uncontrolled `TextInput` (`defaultValue` + `onChangeText` into a ref or store), commit on submit or debounce.
- Do not add `useMemo`/`useCallback` or report "stale closure risk" without profiler evidence or a repro.
- Text always inside `<Text>`; `cond ? <X/> : null`, never `count && <X/>` (renders "0", and crashes on a raw string outside Text).

## 6. Animation

- Animate `transform` and `opacity` only; computed values via `useDerivedValue`.
- Gesture-driven animation stays on the UI thread as worklets with shared values; one `runOnJS`/`scheduleOnRN` call inside `onChange` is enough to ruin it (call it only at gesture end).
- Animated press states: `GestureDetector` + `Gesture.Tap()` with shared values, not `Pressable` `onPressIn` callbacks.
- No `entering` animations on recycled list rows; never animate a header's height (translate inside a fixed clip).
- A heavy destination screen committing during a transition stalls JS and hitches even UI-thread animations: defer its expensive work until the transition ends.

## 7. Startup and bundle

```bash
npx react-native bundle --entry-file index.js --bundle-output out.js \
  --platform ios --sourcemap-output out.js.map --dev false --minify true
npx source-map-explorer out.js --no-border-checks
ls -lh out.js          # record before and after
```

- Import from source files, not barrels (`@/components` index files).
- Replace JS polyfills with native SDKs where Hermes lacks nothing; remove Intl polyfills only after checking Hermes coverage.
- Defer analytics, heavy SDK init and below-the-fold data until after first paint; preload frequently opened expensive screens.
- Native navigation (`react-native-screens`, native stack and tabs) over JS navigators.
- Android: R8 in release (`minifyEnabled true`, `shrinkResources true`; it raises the cost of reverse engineering, it is not security). RN ≤ 0.78: disable JS bundle compression so Hermes can memory-map the bundle; RN 0.79+ already ships uncompressed.
- Remote chunk loading only from origins you control, pinned to the app release.

## 8. Native performance and Play requirements

- Heavy native work on background threads; prefer async Turbo Module methods; C++ for shared hot paths.
- **Android 16 KB page size**: apps targeting Android 15+ must support it on 64-bit devices. RN 0.79+ ships aligned binaries, but check third-party `.so` files: `zipalign -c -P 16 -v 4 app-release.apk`; update or replace misaligned libraries.

## 9. Memory

Symptom: memory grows while navigating back and forth. Take JS heap snapshots first (listeners, intervals and subscriptions missing cleanup in effects), then native tools (Instruments Leaks, Android Studio Memory Profiler).

## Pitfalls

- Memoising everything "for performance" without a profile.
- Measuring in Expo Go or a debug build and reporting it as the app's speed.
- A ScrollView with 500 rows.
- Treating R8 obfuscation as protection for secrets (secrets never belong in the app binary).
