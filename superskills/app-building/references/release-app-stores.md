> Distilled from: eas-app-stores (expo/skills, MIT), expo-dev-client (expo/skills, MIT), asc-release-flow (rorkai/app-store-connect-cli-skills, MIT), macos-spm-app-packaging (dimillian/skills, MIT)

# Shipping to TestFlight, the App Store and Google Play

Vendor-specific (Apple, Google, Expo). Store submission, review submission, production rollout and anything that spends money (cloud builds on a paid plan, developer memberships) need the user's explicit yes. Credentials (Apple ID password, API keys, service-account JSON) are entered or provided by the user; never type them yourself or commit them.

## 1. Before the first release

| Item | iOS | Android |
|---|---|---|
| Account | Apple Developer Program (paid, yearly) | Google Play Console (one-time fee) |
| App record | Create in App Store Connect (bundle ID must match) | Create the app in Play Console before the first upload |
| Automation credential | App Store Connect API key (`.p8`, key ID, issuer ID) | Google Cloud service account JSON, linked under Play Console → API access with release permission |
| Signing | Distribution certificate + provisioning profile (EAS can manage) | Play App Signing: you keep the upload key, Google holds the app signing key |
| Store listing | Name, subtitle, description, keywords, screenshots per device size, privacy policy URL, App Privacy answers, age rating, review contact + demo account | Title, short/full description, screenshots, feature graphic, privacy policy, Data safety form, content rating, target audience |

Versioning: iOS has a user-facing version (`CFBundleShortVersionString`, e.g. 1.2.3) and a build number (`CFBundleVersion`) that must increase on every upload; Android has `versionName` and an ever-increasing `versionCode`. Never reuse a build number.

## 2. Expo / React Native with EAS

```json
{
  "cli": { "version": ">= 16.0.1", "appVersionSource": "remote" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal", "autoIncrement": true },
    "production":  { "autoIncrement": true }
  },
  "submit": {
    "production": {
      "ios": { "ascAppId": "1234567890" },
      "android": { "serviceAccountKeyPath": "./google-service-account.json", "track": "internal" }
    }
  }
}
```

```bash
npx eas-cli@latest init              # link or create the EAS project
eas build:configure                  # create profiles, keep existing identifiers
eas credentials                      # certificates, profiles, keys (user completes prompts)
eas build -p ios --profile production
eas build -p android --profile production
eas build -p ios --profile production --auto-submit      # build + upload to App Store Connect
npx testflight                       # Expo shortcut to TestFlight
eas submit -p android --latest       # upload an existing build
eas build:list ; eas build:view <id>
eas submit:list -p ios --json ; eas submit:view <id> --json   # newer CLI versions
eas build:version:get                # remote version counters
```

- `appVersionSource: "remote"` + `autoIncrement` lets EAS own build numbers. For a native Swift app, confirm the archived `CFBundleVersion` actually used the counter.
- Add `google-service-account.json` and any `.p8` to `.gitignore`; in CI use secrets (base64 env vars).
- Local builds (`--local`) are free; cloud builds consume plan minutes.
- Automate later with EAS Workflows (build → submit → OTA update).

## 3. Know which state you actually reached

| Verified state | Proves | Next check |
|---|---|---|
| Build finished | An artifact exists | Right build ID, commit and store profile |
| Submission queued | An upload was scheduled | Follow the submission logs |
| Apple processing done | Apple accepted the binary | Export compliance, tester group assignment |
| Available to testers | Testers can install | Install on a device |
| Review approved and released | Public release | Only with the user's go |

Report the exact build ID, version and the furthest verified state. "Build succeeded" is not "it's on TestFlight".

## 4. TestFlight and App Review

- Internal testers: up to 100 team members, no review. External: up to 10,000, needs Beta App Review. Builds expire after 90 days.
- Common TestFlight blockers: a missing or expired agreement (only the Account Holder can accept it), wrong team or `ascAppId`, duplicate build number, app icon PNG with an alpha channel (flatten the default icon), export compliance unanswered.
- App Review checks: it works as described, follows the HIG, accurate content, privacy matches declarations, legal.
- Frequent rejections: crashes, placeholder or test content, missing demo login, missing privacy policy, incomplete metadata, too little functionality (guideline 4.2), in-app purchases that are not ready.
- Release timing: automatic on approval, scheduled, or manual. Expedited review exists for critical fixes and time-bound events.

## 5. App Store Connect from the command line (`asc` CLI)

Optional third-party CLI for staging and submitting versions. Rule: **always `--dry-run` first, compare the plan with the request, then re-run with `--confirm`.**

```bash
asc auth login                                      # or ASC_* env vars set by the user
asc validate --app "APP_ID" --version "1.2.3" --platform IOS --output table   # --strict to stop on warnings
asc release stage --app "APP_ID" --version "1.2.3" --build-id "BUILD_ID" \
  --metadata-dir "./metadata/version/1.2.3" --dry-run --output table          # then --confirm
asc review submit --app "APP_ID" --version "1.2.3" --build-id "BUILD_ID" --dry-run   # then --confirm
asc publish appstore --app "APP_ID" --ipa ./App.ipa --version "1.2.3" --submit --dry-run   # then --wait --confirm
```

Lanes: `release stage` (metadata + attach build, no submission) → `review submit`; or `publish appstore` from an IPA or local project. Do not mix lanes once a review submission exists; never create a second submission for the same version; stop at a failed validation instead of shipping a partial release. IAPs and subscriptions must be ready before submitting a version that sells them.

## 6. Google Play tracks

| Track | Use |
|---|---|
| `internal` | Up to 100 testers, minutes to available; first stop for every build |
| `alpha` (closed) | Invited testers |
| `beta` (open) | Anyone can join |
| `production` | Public; use a staged rollout (`inProgress` with a percentage), `halted` to pause |

Release status `draft` uploads without releasing. New personal developer accounts may have to run a closed test with a minimum number of testers for a set period before production access; check the current Play Console requirement.

Android release hygiene: AAB not APK for Play; target the required API level; R8 on; 16 KB page alignment for apps targeting Android 15+.

## 7. Native-only apps

- iOS (SwiftUI/UIKit): archive in Xcode or `xcodebuild archive` + `-exportArchive`, upload with Xcode Organizer, Transporter, EAS (native path) or `asc publish`. Verify the archive's version, build number and icon before uploading.
- Android: `./gradlew bundleRelease`, upload the `.aab` in Play Console or via the Play Developer API.
- Mac apps outside the App Store: Developer ID signing + notarization (`desktop-tauri-macos.md`).

## Pitfalls

- Submitting for review or rolling out to production because "ship it" was ambiguous: confirm the target (TestFlight internal? production?).
- Committing service-account JSON or `.p8` keys.
- Re-uploading the same build number.
- Telling the user it's live when only the upload finished.
