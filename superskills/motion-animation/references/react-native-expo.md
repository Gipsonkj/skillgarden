> Distilled from: animate-expo (SKILL.md + RECIPES.md) (emilkowalski/skills, MIT)

# React Native and Expo animation

Mobile changes three things: there is no hover, there are two runtimes (React Native/JS and the UI thread where worklets run), and the user's finger is on the element. The craft is keeping motion on the UI thread and handing gesture velocity into the animation.

## Hard rules

1. Frequency gate first (`motion-principles.md`). Tab switches, keyboard open/close, scrolling and settings toggles get no custom animation. **Tabs never slide**: they are peers, so `animation: 'none'`.
2. **Reanimated 4, not core `Animated`** for anything a finger touches.
3. Curves and spring configs come from the tables below, not invented.
4. Reduced motion ships with the animation.
5. Feel is judged on a **release build on the slowest device you support**. Expo Go, dev builds and the simulator hide the problems.

## Pick the tool (cheapest that fits)

| Need | Tool |
|---|---|
| State-driven change, no gesture (press, toggle, colour) | Reanimated CSS transition (`transitionProperty` in style) |
| Loop, multi-stage, or play-on-mount | Reanimated CSS animation (`animationName` keyframes) |
| Mount/unmount, list reflow | Layout animations: `entering`, `exiting`, `itemLayoutAnimation` |
| Finger- or scroll-driven, interruptible | `useSharedValue` + `Gesture` + `useAnimatedStyle` |
| Screen to screen | Expo Router native stack options. Never rebuild in JS |
| Sheet that is its own screen | `presentation: 'formSheet'` (real native sheet) |
| Tab bar | `NativeTabs` from `expo-router/unstable-native-tabs` |
| Context menu, peek | `Link.Menu` / `Link.Preview` (iOS) |
| Large-title collapsing header | `headerLargeTitleEnabled` (iOS) |
| Pull to refresh | `RefreshControl` |
| UI that follows the keyboard | `react-native-keyboard-controller` |
| Illustration, celebration, empty state | Lottie (`lottie-react-native`), never for UI state |
| Huge animated scene, freeform drawing | `@shopify/react-native-skia` |

Install with `npx expo install <pkg>` (matches the SDK): `react-native-reanimated react-native-worklets react-native-gesture-handler expo-haptics`. `babel-preset-expo` configures the worklets plugin; a bare RN project adds the plugin last in Babel config. Reanimated 4 needs the New Architecture. `GestureHandlerRootView` must wrap the app (root `_layout`) or gestures silently do nothing.

## Properties

- `transform` and `opacity` are free. `width`, `height`, `margin`, `padding`, `flex`, `top`, `left`, `gap` rerun layout for the node and its siblings every frame.
- Exception: an absolutely positioned element with no children (tab pill, progress fill) may animate `width`; `scaleX` would smear its corner radius.
- `transform` is an ordered array: `[{ translateY }, { scale }]`. Keep translate first.
- Never animate Android `elevation` or `BlurView` intensity: cross-fade the opacity of a pre-styled static layer.
- `translateY: '100%'` moves by the element's own height.
- No `scale(0)`: start at 0.95 + opacity 0.
- Text scales with system font size: never animate to a hard-coded height; measure with `onLayout` or use transforms.

## Spring or timing

**If a finger was involved, use a spring** and pass the gesture's velocity in. Everything else uses timing.

| Interaction | Reanimated spring |
|---|---|
| Default settle, no overshoot | `{ duration: 400, dampingRatio: 1 }` |
| Snap back after a drag | `{ duration: 400, dampingRatio: 0.8, velocity }` |
| Sheet, drawer | `{ duration: 300, dampingRatio: 0.8, velocity }` |
| Must not pass an edge | add `overshootClamping: true` |

```js
import { Easing } from 'react-native-reanimated';
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);      // enter/exit
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);  // on-screen movement
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1);    // iOS sheet
```

| Element | Duration |
|---|---|
| Press feedback | 100–150 ms |
| Toggle, chip, small state | 150–200 ms |
| Sheet, modal, drawer | spring, ~300 ms perceived |
| Screen transition | platform default (iOS push ≈ 350 ms): don't override |

Never `Easing.in(...)` on UI. Bounce only when the gesture carried momentum.

## Keep it off the JS thread

- Never `setState` from a gesture or scroll handler. Shared value → `useAnimatedStyle`, React never re-renders.
- `scheduleOnRN(fn, ...args)` (from `react-native-worklets`, replaces deprecated `runOnJS`) belongs in `onEnd` or in a `useAnimatedReaction` at a threshold, never in `onUpdate`.
- Never read or write a shared value during render. Use `.get()` / `.set()` (React Compiler-safe) in worklets, handlers and effects.
- Helper functions called from a worklet start with `'worklet';` or they throw on device.
- Build layout-animation builders (`FadeInDown.duration(250)`) at module scope or in `useMemo`; wrap gestures in `useMemo` so a mid-drag recognizer isn't reattached.
- ProMotion iPhones cap at 60 fps unless `CADisableMinimumFrameDurationOnPhone: true` is in `expo.ios.infoPlist` (recent SDKs set it). Then the frame budget is 8 ms.

## Press, not hover

- Feedback on press-in, commit on press-out.
- `scale: 0.97` in ~120 ms with `EASE_OUT`, as a CSS transition on an `Animated.View` inside `Pressable`.
- Touch targets ≥ 44×44 pt (48 dp Android): use `hitSlop`, don't grow the visual. Add `pressRetentionOffset` (~16) so a drifting finger doesn't cancel.
- Android ripple only in a Material-styled app; otherwise the same scale on both platforms.

## Haptics

| Moment | Call |
|---|---|
| Value ticks past a step (picker, slider detent, segmented control) | `Haptics.selectionAsync()` |
| Snap home, detent catches, drag commits | `Haptics.impactAsync(ImpactFeedbackStyle.Light)` |
| Heavy landing, destructive action | `impactAsync(Medium)` |
| Success / failure | `notificationAsync(Success / Error)` |

Same frame as the visual cause; one per user action (never per frame, on scroll, or on entrances the user didn't cause); never the only feedback. From a worklet: `scheduleOnRN(Haptics.selectionAsync)`.

## Reusable worklets

```js
// Where a flick would come to rest (Apple's exponential-decay projection)
function project(velocity, decelerationRate = 0.998) {
  'worklet';
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}
// The further past the edge, the less the element follows
function rubberband(overshoot, dimension, c = 0.55) {
  'worklet';
  return (overshoot * dimension * c) / (dimension + c * Math.abs(overshoot));
}
```

## Recipes

**Press feedback**

```jsx
function PressableScale({ onPress, children }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable onPress={onPress} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}
      hitSlop={12} pressRetentionOffset={16}>
      <Animated.View style={[{ transform: [{ scale: 1 }], transitionProperty: 'transform',
        transitionDuration: '120ms', transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' },
        pressed && { transform: [{ scale: 0.97 }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
```

**Drag-to-dismiss sheet** (only when it must live inside a screen; otherwise `formSheet`)

```jsx
const y = useSharedValue(0), start = useSharedValue(0);
const pan = useMemo(() => Gesture.Pan()
  .activeOffsetY([-10, 10])
  .onStart(() => { start.set(y.get()); })                       // continue from where the eye saw it
  .onUpdate((e) => { const n = start.get() + e.translationY; y.set(n >= 0 ? n : rubberband(n, HEIGHT)); })
  .onEnd((e) => {
    if (y.get() + project(e.velocityY) > HEIGHT * 0.4) {         // velocity decides, not distance
      y.set(withSpring(HEIGHT, { duration: 300, dampingRatio: 1, velocity: e.velocityY, overshootClamping: true },
        (done) => { if (done) scheduleOnRN(onClose); }));
    } else {
      y.set(withSpring(0, { duration: 300, dampingRatio: 0.8, velocity: e.velocityY }));
      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);
    }
  }), [onClose]);
const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: y.get() }] }));
const backdrop = useAnimatedStyle(() => ({ opacity: interpolate(y.get(), [0, HEIGHT], [1, 0], Extrapolation.CLAMP) }));
```

**Swipe to delete**: `ReanimatedSwipeable` already handles swipe-to-reveal actions. For swipe-to-commit build a `Gesture.Pan().activeOffsetX([-10, 10])` (declare the axis or it steals vertical scroll), commit when `x + project(vx) < -THRESHOLD`, exit with `withTiming(-WIDTH, { duration: 200, easing: EASE_OUT })`, and let the list close the gap with `itemLayoutAnimation={LinearTransition.duration(200)}`.

**Collapsing header**: `useAnimatedScrollHandler` → `scrollY`; interpolate title opacity `[0, 60] → [1, 0]` and `translateY [0, -12]` with `Extrapolation.CLAMP` (required, or values go negative on long lists). Never animate the header's height; keep a fixed container and translate content inside it.

**List entrances**: `FadeInDown.duration(250).delay(index * 40)` memoised per row, 30–80 ms stagger. Never `entering` on rows of `FlatList`/`FlashList` (recycled rows re-fire while scrolling); animate the container or use `itemLayoutAnimation` for reflow.

**Keyboard-synced footer**: `KeyboardProvider` at the root, then `const { height } = useReanimatedKeyboardAnimation();` and `translateY: height.get()`. Never `Keyboard.addListener` + a timing guess.

**Tab indicator**: measure tab layouts with `onLayout` once; animate `translateX` and `width` of the absolutely positioned pill with `withTiming(…, { duration: 250, easing: EASE_IN_OUT })`; haptic on press.

**Toast**: `entering={FadeInDown.duration(300).easing(EASE_OUT)}`, `exiting={FadeOutDown.duration(250).easing(EASE_OUT)}`, positioned above `insets.bottom + 16`. Exit the way it entered, ~20% faster.

**Fire once at a threshold**: `useAnimatedReaction(() => pull.get() > T, (now, prev) => { if (now !== prev) scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light); })`.

## Screen transitions (Expo Router)

```jsx
<Stack screenOptions={{ animation: reduced ? 'fade' : 'default' }}>
  <Stack.Screen name="settings" options={{ animation: 'slide_from_right', animationMatchesGesture: true }} />
  <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
  <Stack.Screen name="filter" options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents', sheetGrabberVisible: true }} />
</Stack>
```

| Navigation | Option |
|---|---|
| Deeper in a hierarchy | `animation: 'default'` |
| Self-contained task that can be abandoned | `presentation: 'modal'` |
| Short interruption (picker, filter, share) | `presentation: 'formSheet'` + detents |
| Between tabs | `animation: 'none'` |
| Reduced motion | `animation: 'fade'` |

Set `animationMatchesGesture: true` with any custom animation so the iOS back swipe mirrors it. Android form sheets: max 3 detents, no grabber, no nested stacks or native headers; `fitToContents` needs explicitly sized content.

## Reduced motion

```jsx
const reduced = useReducedMotion();
withSpring(0, { duration: 300, dampingRatio: 0.8, reduceMotion: ReduceMotion.System });
```

Keep opacity and colour changes that explain state; drop translation, scale, parallax and overshoot. Screen transitions become `fade`.

## Never ship

`PanResponder` (use `Gesture.Pan()`), `setState` in gesture/scroll handlers, `runOnJS`, `scheduleOnRN` per frame, shared values read in render, core `Animated` for touch, animated layout properties (except childless absolute elements), animated `BlurView`/`elevation`, `entering` on virtualized rows, JS-rebuilt screen transitions, sliding tabs, `Easing.in` on UI, `scale(0)`, distance-only dismissal, hard stops at boundaries, haptics per frame or as the only feedback, judging feel in Expo Go.

## Output

The code, then a few lines: gate result (tier + purpose), ingredients (tool, properties, spring/curve + duration, thread), and what to try on a device (flick it, interrupt mid-flight, reverse it, run it on the slowest Android).
