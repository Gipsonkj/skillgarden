# Credits

The references in this skill are written fresh from the sources below. Scripts and templates are copied unchanged, each with its source licence beside it (`LICENSE.source-repo`).

| Skill | Repo | License | What was used |
|---|---|---|---|
| vercel-react-native-skills | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-native-skills) | MIT | RN rendering and list rules, animation on UI thread, native navigators, Pressable, image and memo guidance (no files copied; the folder has no licence file locally) |
| mobile-native | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/mobile-native) | MIT | Native-feel laws, navigation semantics, motion frequency gate, anti-slop counts (its persona directive left out) |
| expo-native-ui | [expo/skills](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-native-ui) | MIT | Expo Router screen rules, native tabs, headers, form sheets, library choices |
| expo-router | [expo/skills](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-router) | MIT | File-based routing, layouts, groups, typed routes, deep links |
| eas-app-stores | [expo/skills](https://github.com/expo/skills/tree/main/plugins/expo/skills/eas-app-stores) | MIT | EAS build and submit profiles, credentials, versioning, store states (feedback commands left out) |
| expo-dev-client | [expo/skills](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-dev-client) | MIT | Expo Go vs development builds, when to switch |
| expo-upgrade | [expo/skills](https://github.com/expo/skills/tree/main/plugins/expo/skills/expo-upgrade) | MIT | SDK upgrade order, dependency checks, cache clearing |
| react-native-best-practices | [callstackincubator/agent-skills](https://github.com/callstackincubator/agent-skills/tree/main/skills/react-native-best-practices) | MIT | Measure-first performance workflow: FPS, re-renders, startup, bundle, memory, native modules, 16 KB alignment |
| appllama-app-design-skill | [Appllama/appllama-skills](https://github.com/Appllama/appllama-skills/tree/main/skills/appllama-app-design-skill) | MIT | Design study and verification loop, per-screen checklist, full-motion pass (its commercial MCP mentioned only as optional) |
| upgrading-react-native | [callstackincubator/agent-skills](https://github.com/callstackincubator/agent-skills/tree/main/skills/upgrading-react-native) | MIT | Bare RN upgrade steps with Upgrade Helper, pods, Gradle |
| swiftui-expert-skill | [avdlee/swiftui-agent-skill](https://github.com/avdlee/swiftui-agent-skill/tree/main/skills/swiftui-expert-skill) | MIT | State ownership, modern API replacements, performance rules, Instruments workflow; copied `scripts/swiftui-expert-skill/` (record_trace.py, analyze_trace.py, instruments_parser/) |
| swiftui-pro | [twostraws/swiftui-agent-skill](https://github.com/twostraws/swiftui-agent-skill/tree/main/swiftui-pro) | MIT | Review checklist: deprecated APIs, accessibility, data flow, navigation |
| swiftui-ui-patterns | [dimillian/skills](https://github.com/dimillian/skills/tree/main/swiftui-ui-patterns) | MIT | App structure, tab/stack navigation, sheets, component patterns |
| swift-concurrency | [avdlee/swift-concurrency-agent-skill](https://github.com/avdlee/swift-concurrency-agent-skill/tree/main/skills/swift-concurrency) | MIT | Swift 6.2 approachable concurrency, actor isolation, Sendable, migration steps, diagnostics table |
| write-swift | [emilkowalski/skills](https://github.com/emilkowalski/skills/tree/main/skills/write-swift) | MIT | General modern-Swift style rules (its persona directive left out) |
| ios-simulator-skill | [conorluddy/ios-simulator-skill](https://github.com/conorluddy/ios-simulator-skill/tree/main/ios-simulator-skill/skills/ios-simulator-skill) | MIT | simctl recipes, accessibility-tree-first navigation, testing loop (scripts not copied: they need idb and depend on each other) |
| asc-release-flow | [rorkai/app-store-connect-cli-skills](https://github.com/rorkai/app-store-connect-cli-skills/tree/main/skills/asc-release-flow) | MIT | Release lanes, dry-run then confirm rule, TestFlight blockers, state reporting |
| flutter-apply-architecture-best-practices | [flutter/agent-plugins](https://github.com/flutter/agent-plugins/tree/main/skills/flutter-apply-architecture-best-practices) | BSD-3-Clause | MVVM + repository layering, feature checklist |
| flutter-build-responsive-layout | [flutter/agent-plugins](https://github.com/flutter/agent-plugins/tree/main/skills/flutter-build-responsive-layout) | BSD-3-Clause | Window-size breakpoints, constraint rules, orientation guidance |
| adaptive | [android/skills](https://github.com/android/skills/tree/main/jetpack-compose/adaptive) | Apache-2.0 | Window size classes, list-detail and supporting-pane scaffolds, large-screen rules |
| migrate-xml-views-to-jetpack-compose | [android/skills](https://github.com/android/skills/tree/main/jetpack-compose/migration/migrate-xml-views-to-jetpack-compose) | Apache-2.0 | Incremental XML-to-Compose migration steps and interop |
| android-cli | [android/skills](https://github.com/android/skills/tree/main/devtools/android-cli) | Apache-2.0 | `android` CLI commands for create, run, layout and screen capture (install step kept but marked "ask first") |
| argent-react-native-app-workflow | [software-mansion/argent](https://github.com/software-mansion/argent/tree/main/packages/skills/skills/argent-react-native-app-workflow) | Apache-2.0 | RN run/debug workflow, Metro and build-failure ladder |
| tauri-v2 | [nodnarbnitram/claude-code-extensions](https://github.com/nodnarbnitram/claude-code-extensions/tree/main/plugins/cce-tauri/skills/tauri-v2) | MIT | Tauri v2 project layout, commands, capabilities, error table, mobile notes |
| macos-spm-app-packaging | [dimillian/skills](https://github.com/dimillian/skills/tree/main/macos-spm-app-packaging) | MIT | SwiftPM Mac app packaging, signing, notarization, Sparkle steps; copied `templates/macos-spm-app-packaging/` (scripts + bootstrap) |
| convex-quickstart | [get-convex/agent-skills](https://github.com/get-convex/agent-skills/tree/main/skills/convex-quickstart) | Apache-2.0 | Quick Convex backend setup for Expo apps |

## Also see (not included)

- [ios-simulator-skill scripts](https://github.com/conorluddy/ios-simulator-skill) - semantic tap/type, accessibility audit, visual diff; need Facebook `idb`.
- [software-mansion/argent](https://github.com/software-mansion/argent) - full RN agent tool server (Metro status, component tree, logs).
- [expo/skills](https://github.com/expo/skills) - further Expo skills (UI libraries, animation, data fetching, deployment workflows) beyond the five used here.
- [rorkai/app-store-connect-cli-skills](https://github.com/rorkai/app-store-connect-cli-skills) - other `asc` skills (metadata sync, submission health, signing).
- [vercel-labs/agent-skills react-native-skills rule files](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-native-skills) - the full per-rule files.
- [android/skills](https://github.com/android/skills) - other Compose and tooling skills.
