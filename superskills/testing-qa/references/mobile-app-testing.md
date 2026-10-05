# Mobile app testing: agent-driven UI flows, Flutter widget tests, Swift

> Distilled from: argent-test-ui-flow (software-mansion/argent, Apache-2.0), flutter-add-widget-test (flutter/agent-plugins, BSD-3-Clause), swift-testing-pro (twostraws/Swift-Testing-Agent-Skill, MIT)

Two kinds of work: driving a running app on a simulator/emulator to verify a flow (manual-style QA by an agent), and writing automated tests that live in the repo, including cross-platform Appium suites and real-device runs on BrowserStack.

## Pick a tool

| Need or situation | Tool | Why |
|---|---|---|
| The user already uses or pays for one (Maestro, Detox, Appium, a device cloud) | That one | Extend the existing flows |
| Check a flow right now on a simulator or emulator, by the agent | The interact -> screenshot -> verify loop below, with the host's simulator tool or an MCP | No test code; evidence per step |
| Replayable flows written fast, iOS and Android, no code | Maestro (YAML) | Simple flows, good for smoke runs |
| Tests in the app's own repo and language, fastest and most stable | XCUITest (iOS), Espresso or Compose testing (Android) | Native runners, run in Xcode/Gradle |
| React Native | React Native Testing Library for components; Detox or Maestro for E2E | See the React Native section |
| Flutter | Widget tests; `integration_test` for journeys | See the Flutter section |
| One suite for iOS and Android, tests in any WebDriver language, or an existing Selenium team | Appium (below) | W3C WebDriver for native, hybrid and mobile web |
| Real phones you don't have (models, OS versions) | BrowserStack App Automate (below) | Appium on real devices in the cloud; ask first, it runs on the user's plan |
| Not sure which devices matter or what CI runs | Ask the user | Device list and CI decide between local simulators and a cloud |

## Driving the app: interact -> screenshot -> verify loop

Works with whatever device-control tooling is available: an iOS Simulator / Android emulator MCP (Argent, the host's simulator tool, the Appium MCP below), Maestro, or platform UI test runners. Tool names below are generic.

1. **Pick the device.** List devices; prefer one already running. Boot one only if none is. On a physical device, launch the app first; inspection fails while it's backgrounded.
2. **Baseline.** Take a screenshot of the starting state. If the check is visual, save it at full scale as the comparison baseline.
3. **Find the target before tapping.** Use the accessibility/UI tree (`describe`, uiautomator dump) or, for React Native, the component tree with coordinates. Fall back to estimating from a screenshot only when the tree doesn't expose the element (some system dialogs), then verify immediately.
4. **Interact**: tap, swipe, type, hardware back. Long-press = ~800 ms hold.
5. **Verify with the right evidence:**

| Expected result is... | Evidence |
|---|---|
| Visual (layout, colour, clipping, overflow, text rendering) | Screenshot diff against the baseline |
| Structural (screen reached, element exists, label, selection, route) | UI / accessibility tree |
| Runtime (console errors, network calls, persistence, timing) | Device logs, network log, JS debugger, or a targeted test |
| Mixed | Collect each kind |

6. **Wait on the UI, don't sleep.** Block until an expected element is visible or a spinner is hidden. Transitional screenshots are not results.
7. **Repeat** for each step; report expected vs observed, evidence and verdict per step.

**Recovery**: missed tap -> re-read the tree, retry once with fresh coordinates; same miss twice -> stop and report the element as not found. Permission dialogs: read the tree first; tap one button at a time and verify.

**Credentials**: never type real passwords as plain text into the agent transcript. Use a secret placeholder that the tool resolves (for example an environment-variable reference) or a test account the user set up. Use test accounts only.

**Make it repeatable**: once a flow works, record it as a replayable script (the tool's flow recorder, or a Maestro YAML) so it can run again without the agent.

### Flow template

```
Goal: <feature> works
Evidence type: visual | structural | runtime | mixed
1. Navigate to a stable starting state -> screenshot (baseline if visual)
2. Find control in UI tree -> tap -> verify returned screenshot
3. Wait for <element> visible / <spinner> hidden
4. Verify: <tree check / diff / log check>
Verdict: pass | fail - expected X, saw Y, evidence <paths>
```

## Appium: cross-platform native automation

> Written from the official Appium, XCUITest driver, Appium MCP and BrowserStack docs (link-only, our own words); see CREDITS.md.

Appium 3 is a server plus per-platform drivers; tests talk to it over WebDriver from any client language.

**Install.** Node `^20.19.0 || ^22.12.0 || >=24.0.0` and npm 10+, then `npm install -g appium` (npm is the only supported installer). Drivers:

| Platform | Install | Needs |
|---|---|---|
| Android | `appium driver install uiautomator2` | `ANDROID_HOME` (SDK Platform + Platform-Tools), `JAVA_HOME` (a JDK); `adb devices` lists the emulator or phone |
| iOS | `appium driver install xcuitest` | macOS and Xcode; the driver aims to fully support the latest two major Xcode/iOS versions, and driver 10+ needs Appium 3 |
| Both at once | `appium setup` | Installs UiAutomator2, XCUITest (macOS only) and Espresso |

Check with `appium driver doctor uiautomator2` (or `xcuitest`): "0 required fixes needed" means ready. Start the server with `appium`; it listens on `http://127.0.0.1:4723/`, reachable only from the same machine.

**Capabilities.** `platformName` plus Appium-specific keys, each with the `appium:` prefix (write it even when the client would add it): `appium:automationName` (`UiAutomator2`, `XCUITest`), `appium:app` (path to the build), `appium:deviceName`, `appium:platformVersion`, `appium:udid` (one specific device), `appium:noReset`, `appium:newCommandTimeout`.

```python
# pip install Appium-Python-Client   (builds on the Selenium Python binding)
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait

options = UiAutomator2Options().load_capabilities({
    "platformName": "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": "Android",
    "appium:app": "/abs/path/app-debug.apk",
})
driver = webdriver.Remote("http://127.0.0.1:4723", options=options)
try:
    driver.find_element(by=AppiumBy.ACCESSIBILITY_ID, value="Sign in").click()
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((AppiumBy.ACCESSIBILITY_ID, "Home")))
finally:
    driver.quit()
```

Rules: find by accessibility ID first (the same hooks as `accessibilityIdentifier` / `testTag` above), XPath last; wait on elements, never sleep; one session per test, always `quit()`; put the app in a known state per test (launch arguments, a fresh install) instead of relying on test order.

**iOS real devices.** The driver installs WebDriverAgent (WDA) on the device. Simulators allow it; a real device must be trusted in Xcode, have Developer Mode on (iOS/iPadOS 16+), and WDA must be signed with the user's provisioning profile. Ask the user to do the signing in Xcode; never handle their Apple credentials.

### Appium MCP server

Official `appium-mcp` (Apache-2.0), a stdio server run with `npx appium-mcp@<version>` (pin a version) and `ANDROID_HOME` in its env; `CAPABILITIES_CONFIG` can point at a capabilities JSON. Tools include `select_device`, `appium_session_management`, `appium_find_element`, `appium_gesture`, `appium_screenshot`, `generate_locators` and `appium_generate_tests`, which fits the interact -> screenshot -> verify loop and then turns the flow into test code.

Leave two options off: `appium_ai` (enabled with `AI_VISION_ENABLED`) sends screenshots to whatever vision-model API `AI_VISION_API_BASE_URL` names, which is a third party; OpenTelemetry tracing (`APPIUM_MCP_OTEL_ENABLED`) is off by default, keep it so.

### Real devices on BrowserStack App Automate

Same account and `BROWSERSTACK_USERNAME` / `BROWSERSTACK_ACCESS_KEY` variables as the web side ([browser-automation.md](browser-automation.md#cloud-browsers-and-real-devices-browserstack)).

1. **Upload the build** (this sends the user's app binary to BrowserStack: show the file and wait for a yes). `.apk`, `.aab`, `.xapk` or `.ipa`; uploads are kept 30 days.
   ```bash
   curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
     -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
     -F "file=@build/app-debug.apk" -F "custom_id=ShopApp"
   # -> {"app_url": "bs://<id>", ...}
   ```
2. **Configure** `browserstack.yml`: `app: bs://<id>` (or a local path) and `platforms` entries with `deviceName`, `platformVersion`, `platformName`; `deviceName` and `platformVersion` accept regular expressions when any matching device will do.
3. **Run** with `pip install browserstack-sdk` and `browserstack-sdk python tests/test_login.py` (or `pytest`). The test code stays plain Appium.

## Flutter widget tests

Setup: `flutter_test` in `dev_dependencies`; tests in `test/`, files named `*_test.dart`. Run `flutter test test/todo_list_test.dart`.

| Step | Code |
|---|---|
| Define | `testWidgets('adds and removes a todo', (tester) async { ... });` |
| Build | `await tester.pumpWidget(const MaterialApp(home: TodoList()));` (wrap in `MaterialApp` / `Directionality` when the widget needs theme or text direction) |
| Find | `find.text('Submit')`, `find.byType(TextField)`, `find.byKey(const Key('submit'))`, `find.bySemanticsLabel('Delete')` |
| Assert | `expect(finder, findsOneWidget)`, `findsNothing`, `findsNWidgets(2)` |
| Interact | `await tester.tap(f)`, `await tester.enterText(f, 'Buy milk')`, `await tester.drag(f, const Offset(500, 0))` |
| Rebuild | `await tester.pump()` for one frame after a state change; `await tester.pumpAndSettle()` for animations and async UI |
| Long lists | `await tester.scrollUntilVisible(itemFinder, 500, scrollable: find.byType(Scrollable))` before interacting |
| Visual | `await expectLater(find.byType(Card), matchesGoldenFile('goldens/card.png'))`, generated with `flutter test --update-goldens` on one OS |

Rules:
- Assert the initial state, act, pump, assert the new state.
- Inject dependencies (repositories, HTTP clients) so tests use fakes, not the network.
- `pumpAndSettle` never settles with infinite animations (spinners); use `pump(const Duration(...))` there.
- Prefer finding by text or semantics label (what the user sees) over keys; add a `Key` when there's no stable text.
- Full-app journeys: `integration_test` package, run with `flutter test integration_test` on a device or emulator.

## iOS / Swift

- Unit and integration tests: Swift Testing (see [unit-runners-by-language.md](unit-runners-by-language.md)).
- UI tests: XCTest UI testing (`XCUIApplication`), finding elements by accessibility identifier or label; launch arguments to put the app in a known state (`app.launchArguments += ["-uiTesting", "-resetData"]`); wait with `waitForExistence(timeout:)`, never `sleep`.
- Set `accessibilityIdentifier` on controls that lack a stable label; accessibility labels double as test hooks and as VoiceOver quality checks.

## Android

- Unit tests: JUnit with Robolectric where Android classes are needed.
- UI: Espresso (Views) or Compose testing (`composeTestRule.onNodeWithText("Save").performClick()`, `assertIsDisplayed()`), with `testTag` when text isn't stable. Idling resources or `waitUntil` instead of sleeps.

## React Native

Component tests with React Native Testing Library (`render`, `screen.getByRole`, `fireEvent` / `userEvent`); E2E with Detox or Maestro; the agent loop above for exploratory verification.
