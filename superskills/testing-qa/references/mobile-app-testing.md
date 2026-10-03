# Mobile app testing: agent-driven UI flows, Flutter widget tests, Swift

> Distilled from: argent-test-ui-flow (software-mansion/argent, Apache-2.0), flutter-add-widget-test (flutter/agent-plugins, BSD-3-Clause), swift-testing-pro (twostraws/Swift-Testing-Agent-Skill, MIT)

Two kinds of work: driving a running app on a simulator/emulator to verify a flow (manual-style QA by an agent), and writing automated tests that live in the repo.

## Driving the app: interact -> screenshot -> verify loop

Works with whatever device-control tooling is available: an iOS Simulator / Android emulator MCP (Argent, the host's simulator tool), Maestro, or platform UI test runners. Tool names below are generic.

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
