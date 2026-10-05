> Written from the official docs of Firebase (Crashlytics, Cloud Messaging, CLI, MCP server), React Native Firebase, Expo and Sentry

# Crash reporting and push notifications

Vendor-specific (Google Firebase, Expo, Sentry). Ask before: creating a Firebase or Sentry project, running a paid cloud build, and sending any push beyond the user's own test device. The user creates and uploads keys (APNs `.p8`, service-account JSON, Sentry auth token) themselves; you never paste them into chat, code or the repo.

## 1. Pick a tool: crash reporting

| Situation | Use | Why |
|---|---|---|
| The user already uses or pays for one | That one | Crash history and alerts already live there |
| Free crash reports for iOS and Android, or Firebase is already in the app, or FCM push is coming too | Firebase Crashlytics (sections 3-5) | No cost on both Firebase plans; one project for crashes and push |
| Readable JS stack traces from release bundles, tracing or session replay | Sentry (section 8) | Its Expo plugin uploads source maps during EAS builds; free Developer plan is 1 user and 5k errors |
| Just need to read one crash on a simulator or emulator now | `testing-simulators.md` section 3b | No account; local logs and crash reports |
| A team or company account may already exist | Ask which dashboard they log into | Don't create a second project |

## 2. Pick a tool: push notifications

| Situation | Use | Why |
|---|---|---|
| The user already sends push through one | That one | Tokens and server code exist |
| Expo app, simplest path | Expo push service + `expo-notifications` (section 7) | No cost; Expo handles talking to FCM and APNs; EAS sets up the credentials |
| Firebase already in the app, topics needed, or Flutter / bare RN / native | Firebase Cloud Messaging (section 6) | No cost; HTTP v1 API from your server; topics |
| Expo app whose server already talks to FCM/APNs | `expo-notifications` `getDevicePushTokenAsync` | Gives the native device token for your existing sender |

Push needs a development build (never Expo Go) and, on iOS, a paid Apple Developer account.

## 3. Firebase project and CLI

```bash
npm install -g firebase-tools
firebase login                         # opens a browser; the user signs in
firebase projects:list
firebase projects:create               # ask first: creates a Google Cloud project
firebase apps:create IOS "My App" --bundle-id com.you.app
firebase apps:create ANDROID "My App" --package-name com.you.app
firebase apps:sdkconfig IOS <appId> -o GoogleService-Info.plist
firebase apps:sdkconfig ANDROID <appId> -o google-services.json
```

- `GoogleService-Info.plist` and `google-services.json` hold API keys that only identify the project; Firebase says keys restricted to Firebase services need not be secret, so these files may be committed. Service-account JSON, APNs `.p8` keys and Sentry tokens may not.
- CI: Application Default Credentials (recommended); `FIREBASE_TOKEN` from `firebase login:ci` is legacy.
- Crashlytics, FCM and App Distribution cost nothing on both the Spark and Blaze plans.

**Firebase MCP server** (runs locally with the CLI's login): `claude mcp add firebase npx -- -y firebase-tools@latest mcp` (add `--dir <abs path>` to point at the folder with `firebase.json`, `--only <groups>` to limit tools), or the plugin: `claude plugin marketplace add firebase/firebase-tools` then `claude plugin install firebase@firebase`. Read tools: `crashlytics_get_report`, `crashlytics_get_issue`, `crashlytics_list_events`, `crashlytics_batch_get_events`. `crashlytics_update_issue` changes state and `messaging_send_message` sends a real push: show the exact call and wait for a yes.

## 4. Crashlytics on Expo / React Native

React Native Firebase uses native SDKs, so it does not run in Expo Go; use a development build (`expo-react-native.md`). The Firebase JS SDK has no Crashlytics for mobile.

```bash
npx expo install expo-dev-client @react-native-firebase/app @react-native-firebase/crashlytics expo-build-properties
```

```json
{
  "expo": {
    "ios": { "googleServicesFile": "./GoogleService-Info.plist", "bundleIdentifier": "com.you.app" },
    "android": { "googleServicesFile": "./google-services.json", "package": "com.you.app" },
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/crashlytics",
      ["expo-build-properties", { "ios": { "useFrameworks": "dynamic" } }]
    ]
  }
}
```

- iOS linking: on React Native 0.75+ RN Firebase pulls the Firebase Apple SDK through Swift Package Manager, which needs `useFrameworks: "dynamic"`. Need static? Pass `{ "ios": { "disableSPM": true } }` to the `@react-native-firebase/app` plugin and use `"static"` (with `forceStaticLinking: ["RNFBApp", ...]`). Never mix the default SPM mode with static frameworks.
- Rebuild natively after any plugin change: `npx expo prebuild --clean`, then `npx expo run:ios` / `npx expo run:android`, or an EAS development build (ask if it uses paid minutes).

```ts
import { getCrashlytics, log, recordError, setAttributes, setUserId, crash,
  setCrashlyticsCollectionEnabled } from '@react-native-firebase/crashlytics';
const c = getCrashlytics();
log(c, 'checkout opened');                       // breadcrumb sent with the next report
await setAttributes(c, { plan: 'pro' });          // never emails, names or tokens
try { await pay(); } catch (e) { recordError(c, e as Error); }   // caught errors keep their JS stack
// test button, release build only: crash(c)
```

`firebase.json` at the project root:

```json
{ "react-native": {
    "crashlytics_auto_collection_enabled": false,
    "crashlytics_javascript_exception_handler_chaining_enabled": false } }
```

- Auto-collection off + `setCrashlyticsCollectionEnabled(c, true)` after the user agrees is the opt-in pattern. Leave it on only when the privacy policy covers it.
- Chaining off avoids a second, stack-less native crash for every JS crash in release builds (RN Firebase recommends JS crashes on, chaining off).
- Crashlytics is off in debug builds; `"crashlytics_debug_enabled": true` turns it on while setting up.
- NDK crash capture is on by default (it catches crashes in native code such as Yoga); readable NDK frames need symbol upload (section 5).

**Readable stack traces**
- Android: the Crashlytics config plugin adds the Gradle plugin, which uploads the R8/ProGuard mapping file whenever the build makes one (`mappingFileUploadEnabled` turns that off per build type).
- iOS: Debug Information Format must be "DWARF with dSYM File" in every configuration. If the console's dSYM tab reports missing dSYMs, upload them there (drag and drop) or with `<Pods>/FirebaseCrashlytics/upload-symbols -gsp GoogleService-Info.plist -p ios <dSYMs folder>`. A custom Xcode 15+ run script needs the dSYM, `Info.plist`, `GoogleService-Info.plist` and executable paths listed as input files.

**Prove it works** (on a build without a debugger attached; the Xcode debugger blocks reports)
1. Install a release (or non-debugger) build; launch it from the home screen, not from Xcode.
2. Tap the test button that calls `crash(c)`. Relaunch: reports are sent on the next start.
3. Within about five minutes the crash shows in the Crashlytics console (or `crashlytics_get_report` via MCP). iOS: run once with `-FIRDebugEnabled` in the scheme arguments and look for "Completed report submission" in the log.
4. Check the top frame shows your function and file, not an address: that is the symbol check.
5. Remove or hide the test button before release.

## 5. Crashlytics on Flutter and native Android

- Flutter: `flutter pub add firebase_crashlytics && flutter pub add firebase_analytics`, `flutterfire configure`, then in `main()` after `Firebase.initializeApp()`: `FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;` and `PlatformDispatcher.instance.onError = (e, s) { FirebaseCrashlytics.instance.recordError(e, s, fatal: true); return true; };`. Builds with `--split-debug-info` need `firebase crashlytics:symbols:upload --app=<FIREBASE_APP_ID> <symbols dir>`.
- Native Android: `plugins { id 'com.google.firebase.crashlytics' }` plus `implementation platform('com.google.firebase:firebase-bom:<version>')` and `implementation 'com.google.firebase:firebase-crashlytics'`; test with `throw RuntimeException("Test Crash")`, then relaunch. NDK symbols: `firebaseCrashlytics { nativeSymbolUploadEnabled true }` in the release build type.
- Native iOS: same dSYM rules as section 4.

## 6. Firebase Cloud Messaging (FCM)

**Client, React Native / Expo**
- `npx expo install @react-native-firebase/messaging` (bare RN: add it, then `pod install`).
- iOS: the user uploads an APNs authentication key (`.p8`) in Firebase console → Project settings → Cloud Messaging, with its Key ID (at least one of development/production). The app needs the Push Notifications capability and the remote-notification background mode; in Expo config: `"ios": { "entitlements": { "aps-environment": "production" }, "infoPlist": { "UIBackgroundModes": ["remote-notification"] } }`.
- Android 13+ (API 33): request `POST_NOTIFICATIONS` at runtime or nothing shows. RN Firebase's own permission APIs are deprecated; use `expo-notifications` or `react-native-permissions` for the prompt.
- Devices: iOS simulators do not receive cloud messages (on Apple Silicon simulators RN Firebase does not even register for a token); use a real iPhone. Android: Android 6.0+ with the Play Store, or an emulator image with Google APIs.

```ts
import { getMessaging, getToken, onMessage, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
const m = getMessaging();
const token = await getToken(m);                  // send to your server, tied to the signed-in user
onMessage(m, async (msg) => { /* app open: no banner is shown, render your own */ });
// index.js, outside any component:
setBackgroundMessageHandler(m, async (msg) => { /* background / quit */ });
```

Notification messages show automatically in background and quit states; data-only messages there need `contentAvailable: true` (iOS) and `priority: 'high'` (Android).

**Client, Flutter**: `flutter pub add firebase_messaging`; on iOS call `await FirebaseMessaging.instance.getAPNSToken()` and continue only when it is non-null, then `requestPermission(provisional: true)`, `getToken()`, and listen to `onTokenRefresh`.

**Server send (HTTP v1)**

```
POST https://fcm.googleapis.com/v1/projects/PROJECT_ID/messages:send
Authorization: Bearer <OAuth 2.0 access token, scope https://www.googleapis.com/auth/firebase.messaging>
{ "message": { "token": "DEVICE_TOKEN", "notification": { "title": "Order shipped", "body": "Arrives Thursday" } } }
```

- Tokens come from Application Default Credentials on Google Cloud, or a service-account JSON pointed to by `GOOGLE_APPLICATION_CREDENTIALS` on the server only, never in the app or repo.
- Targets: `token`, `topic` or `condition` (device groups are deprecated). One app instance can join up to 2,000 topics; one message can target up to 5 topics; never put private data in a topic.
- Limits: 600k messages per minute per project; Android up to 240 per minute and 5,000 per hour to one device; over quota returns `429 RESOURCE_EXHAUSTED`, so back off and retry.
- **Sending:** to the user's own test token is fine once they say so. Anything to a topic, a list or real users: show the exact payload and target and wait for a yes.

## 7. Expo push service

```bash
npx expo install expo-notifications expo-constants
```

- Needs a development build (push is not in Expo Go). Test on a real device, an Android emulator with Google Play services, or an iOS Simulator on Xcode 14+.
- Credentials: Android needs FCM V1 credentials added through EAS; iOS needs a paid Apple account, and EAS offers to create the APNs key during the first build setup (the user completes the prompts).
- Token: `await Notifications.getExpoPushTokenAsync({ projectId })`, with `projectId` read through `expo-constants`.
- First test: paste the token into the push tool at expo.dev/notifications.
- Server: `POST https://exp.host/--/api/v2/push/send` with `{ "to": "ExponentPushToken[...]", "title": "...", "body": "...", "data": {} }`; up to 100 messages per request, 600 notifications per second per project. Each send returns tickets; fetch receipts from `https://exp.host/--/api/v2/push/getReceipts` about 15 minutes later (cleared after 24 hours) to catch dead tokens. Turn on the optional push access token and send it as `Authorization: Bearer` from the server.
- No cost. Same sending rule as FCM: exact payload and audience shown, then a yes.

## 8. Sentry (React Native / Expo)

Needs Expo SDK 50+. Bare React Native: `npx @sentry/wizard@latest -i reactNative` edits project files, so review its diff before keeping it.

```bash
npx expo install @sentry/react-native
```

```json
["@sentry/react-native/expo", { "url": "https://sentry.io/", "project": "my-app", "organization": "my-org" }]
```

```js
// metro.config.js
const { getSentryExpoConfig } = require('@sentry/react-native/metro')
module.exports = getSentryExpoConfig(__dirname)
```

```ts
import * as Sentry from '@sentry/react-native';
Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, sendDefaultPii: false, tracesSampleRate: 0.2 });
export default Sentry.wrap(RootLayout);
```

- `SENTRY_AUTH_TOKEN` goes in `.env.local` (git-ignored) or an EAS secret, set by the user. With the plugin and Metro config in place, source maps upload automatically during EAS Builds and local release builds (Debug IDs tie bundle to map). After `eas update`, upload with `npx @sentry/expo-upload-sourcemaps dist`.
- Sentry's sample sets `sendDefaultPii: true`; keep it `false` unless the privacy policy covers sending user data.
- Native symbols outside the plugin: `sentry-cli debug-files upload -o <org> -p <project> <path>` for dSYMs, `sentry-cli upload-proguard <mapping.txt>` for Android; both read `SENTRY_AUTH_TOKEN`.
- Verify on a release build: a test button with `Sentry.captureException(new Error('Sentry test'))`, and `Sentry.nativeCrash()` for the native side; confirm the JS frame shows your source file.
- Sentry MCP (OAuth sign-in on first use): `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp/<org>/<project>` to search and read issues.
- Plans: free Developer plan (1 user, 5k errors); Team from $26/month billed annually. Upgrading spends money: ask.

## 9. Privacy and release

- Crash data, push tokens and analytics are collected data: declare them in App Privacy and the Play Data safety form (`release-app-stores.md` section 1), and match what the SDK actually sends.
- Don't put names, emails or tokens in crash attributes, logs or user IDs; use an opaque ID.
- Say what could not be verified: a push on a real iPhone, a crash from a store build, symbol upload from a CI build.

## Done means

- [ ] Tool choice stated in one line (and why)
- [ ] Test crash seen in the dashboard from a release build, with your own function names and file in the top frames, on both platforms
- [ ] A push received on a real device in foreground, background and killed states, and tapping it opens the right screen
- [ ] Android 13+ permission prompt and iOS permission prompt shown at a sensible moment, not on first launch
- [ ] No service-account JSON, `.p8` or auth token in the repo or app bundle; test crash button removed
- [ ] Privacy forms updated for crash and push data
