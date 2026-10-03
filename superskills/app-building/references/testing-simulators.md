> Distilled from: ios-simulator-skill (conorluddy/ios-simulator-skill, MIT), appllama-app-design-skill (Appllama/appllama-app-design-skill, MIT), argent-react-native-app-workflow (software-mansion/argent, Apache-2.0), android-cli (android/skills, Apache-2.0)

# Running, testing and verifying on simulators and devices

A screen does not exist until you have seen it running. Stop at "cannot find a flaw", not "looks fine". Report what you verified on a simulator and what still needs a real device.

## 1. Simulator control (iOS, built-in `xcrun simctl`)

```bash
xcrun simctl list devices available            # pick a device
xcrun simctl boot "iPhone 16" && open -a Simulator
xcrun simctl install booted path/to/App.app
xcrun simctl launch booted com.example.app      # SIMCTL_CHILD_FOO=bar sets env vars for the app
xcrun simctl terminate booted com.example.app
xcrun simctl openurl booted "myapp://item/42"   # deep links
xcrun simctl io booted screenshot s.png
xcrun simctl io booted recordVideo --codec=h264 flow.mov   # Ctrl+C to stop
xcrun simctl ui booted appearance dark          # light | dark
xcrun simctl ui booted content_size extra-extra-extra-large   # Dynamic Type
xcrun simctl location booted set 52.52,13.40
xcrun simctl push booted com.example.app payload.apns
xcrun simctl privacy booted grant photos com.example.app
xcrun simctl get_app_container booted com.example.app data   # sandbox files, UserDefaults plist
xcrun simctl spawn booted log stream --predicate 'process == "MyApp"' --level debug
```

- Navigate by the **accessibility tree**, not by screenshots: it gives element type, label and frame for tens of tokens instead of thousands. Use screenshots for visual checks and bug reports. Good accessibility labels make the app both testable and accessible.
- Richer agent tooling exists if the user wants it (ask before installing): the `ios-simulator-skill` scripts (semantic tap/type by label, accessibility audit, visual diff, hang watcher; need Facebook `idb`), Software Mansion's Argent tools for React Native (Metro status, component tree, JS logs), and an `agent-device` CLI for React DevTools profiling.

## 2. Android emulator

```bash
emulator -list-avds && emulator -avd <name> &
adb devices
adb install -r app-debug.apk
adb shell am start -n com.example/.MainActivity
adb shell am start -a android.intent.action.VIEW -d "myapp://item/42"
adb exec-out screencap -p > s.png
adb shell screenrecord /sdcard/flow.mp4      # then adb pull
adb shell cmd uimode night yes               # dark mode
adb shell settings put system font_scale 1.3
adb shell uiautomator dump && adb pull /sdcard/window_dump.xml
adb shell input tap 540 1200 ; adb shell input text "hello" ; adb shell input keyevent KEYCODE_BACK
adb reverse tcp:8081 tcp:8081                # React Native: let the device reach Metro
```

Google's `android` CLI wraps much of this (`android layout`, `android screen capture --annotate`); see `android-compose.md`.

## 3. The verification loop (per screen, per flow)

1. Launch on the iOS simulator (primary) and an Android emulator.
2. Screenshot and **open it**: alignment, optical centring, spacing rhythm, truncation with long text.
3. Interact: tap every control, type overlong text, background and foreground the app, rotate if supported, rapid double-tap (no double navigation or double submit).
4. **Full-motion pass**: record the whole flow (`recordVideo` / `screenrecord`) covering every transition, every back path (chevron, iOS edge swipe, Android back), every sheet (present, drag, cancel mid-drag, dismiss), keyboard in and out, and an attempt to go back through each one-way door. Watch once at full speed for feel, then frame by frame for one-frame white or wrong-theme flashes, layout jumps, springs clipping into content, dropped frames.
5. Fix a few things, relaunch, re-check. Small batches; regressions hide in big ones.

**Per-screen checklist**
- [ ] Nothing clipped by the status bar or Dynamic Island; bottom actions clear the home indicator
- [ ] Light and dark screenshots inspected
- [ ] Largest Dynamic Type / font scale: no overlap or clipped labels
- [ ] Empty, loading, error states forced and checked
- [ ] Targets ≥ 44 pt / 48 dp; press states visible; keyboard never covers the focused field
- [ ] Background mid-flow → return: state intact; kill and relaunch: persisted state restored
- [ ] Reduce Motion on: spatial motion becomes fades
- [ ] 60 fps through transitions, **measured** on a release build (Perf Monitor, Instruments, Android profiler)

## 4. Automated tests

| Layer | iOS | Android | React Native / Expo | Flutter |
|---|---|---|---|---|
| Unit | Swift Testing (`@Test`, `#expect`) | JUnit + Kotlin coroutines test | Jest | `flutter test` |
| UI component | SwiftUI previews + snapshot tests | Compose UI tests, Preview screenshot tests | React Native Testing Library | widget tests |
| End-to-end | XCUITest | Espresso / UI Automator | Maestro or Detox | `integration_test` |

- Once a flow is stable, script its happy path (Maestro YAML is the quickest: launch, tap by text, assert visible, screenshot) so later changes re-verify for free.
- Xcode: `xcodebuild test -scheme App -destination 'platform=iOS Simulator,name=iPhone 16'`; parse the `.xcresult` for failures.
- Detox: `detox build -c ios.sim.release && detox test -c ios.sim.release`.
- Screenshot tests: run them, but let the user review diffs before re-recording references.

## 5. When the build or run fails

1. Read the project's own scripts first (`package.json`, Makefile, README); custom scripts beat defaults.
2. Simplest fixes first: clean build folder; reset Metro cache; `watchman watch-del-all`; reinstall node modules; `cd ios && pod install --repo-update`; `pod deintegrate` then install; `./gradlew clean`.
3. Open the workspace in Xcode / Android Studio for the full error when the CLI output is truncated.
4. After 2-3 failed attempts, stop and ask the user (env vars, signing, private registries, required Xcode version).
5. Write the working run recipe into the project notes.

## 6. Real devices

Simulators miss touch feel, real GPU and thermal behaviour, camera, push, and some keyboard behaviour. Before release: install a release build on at least one older phone per platform (TestFlight internal / Play internal testing), test with a slow network, and test with system font size and dark mode changed.
