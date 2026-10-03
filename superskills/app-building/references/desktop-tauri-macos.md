> Distilled from: tauri-v2 (nodnarbnitram/claude-code-extensions, MIT), macos-spm-app-packaging (dimillian/skills, MIT)

# Desktop apps: Tauri v2 and SwiftPM macOS apps without Xcode

| Want | Use |
|---|---|
| One web frontend shipped as a small desktop (and mobile) app, Rust backend | Tauri v2 |
| A native Mac app (SwiftUI), built and packaged from the command line | SwiftPM + the bundled scripts in `templates/macos-spm-app-packaging/` |
| A native Mac app with the full Xcode project workflow | Xcode; SwiftUI rules in `swiftui.md` |

## 1. Tauri v2

```
src-tauri/
├── src/main.rs        # thin: fn main() { app_lib::run(); }
├── src/lib.rs         # ALL logic: commands, state, builder (mobile replaces main)
├── capabilities/default.json
├── tauri.conf.json
├── Cargo.toml         # [lib] name = "app_lib", crate-type = ["staticlib", "cdylib", "rlib"]
└── build.rs
```

```rust
// src-tauri/src/lib.rs
#[tauri::command]
async fn greet(name: String) -> Result<String, String> {   // owned types in async commands
    Ok(format!("Hello, {name}!"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])   // every command, or it silently fails
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

```ts
import { invoke } from "@tauri-apps/api/core";   // v2 path; @tauri-apps/api/tauri is v1
const msg = await invoke<string>("greet", { name: "World" });
```

**Rules**
- Tauri v2 denies everything by default: list every permission (core and each plugin's) in `capabilities/default.json` and reference it under `app.security.capabilities`.
- Commands return `Result<T, E>`; shared state through `.manage()` with `Mutex<T>`, read with the exact same `State<T>` type.
- Never block the main thread; async for I/O. Never hard-code paths; use `app.path()`.
- `build.devUrl` must match the frontend dev server port, and `beforeDevCommand` must start it (white screen otherwise).
- Set a strict CSP (`default-src 'self'`).
- Mobile: `rustup target add` the needed targets; check each plugin supports mobile.
- Updater: sign artifacts (`cargo tauri signer generate`) and serve updates over HTTPS only. Sidecars must be listed in `bundle.externalBin`.

| Error | Fix |
|---|---|
| "Command not found" | Add it to `generate_handler!` |
| "Permission denied" / plugin silently does nothing | Add the permission to the capability file |
| State panic | Use the exact managed type |
| IPC timeout | Remove blocking code from the async command |
| Works on desktop, fails on mobile | Desktop-only API or missing Rust target |

Commands: `npm run tauri dev`, `npm run tauri build`, `npm run tauri android dev`, `npm run tauri ios dev`.

## 2. SwiftPM macOS app, no Xcode project (bundled templates)

`templates/macos-spm-app-packaging/` (MIT, Thomas Ricouard) contains a starter app and the scripts to bundle, sign, notarize and publish it. Needs Xcode command-line tools.

1. **Bootstrap**: copy `templates/macos-spm-app-packaging/bootstrap/` to the new repo; rename `MyApp` in `Package.swift`, `Sources/MyApp/` and `version.env`.
2. **Scripts**: copy `package_app.sh`, `compile_and_run.sh`, `launch.sh` (and, for releases, `sign-and-notarize.sh`, `make_appcast.sh`, `setup_dev_signing.sh`, `build_icon.sh`) into the repo's `Scripts/`; `chmod +x Scripts/*.sh`.
3. **Develop**: `swift build`, `swift test`, then `Scripts/compile_and_run.sh` (kills the running app, repackages, launches).
4. **Package**: `APP_NAME=HelloApp BUNDLE_ID=com.you.hello Scripts/package_app.sh` builds per arch (`ARCHES="arm64 x86_64"` for universal), assembles `build/HelloApp.app`, copies resources and signs. `MENU_BAR_APP=1` makes a menu-bar-only app (`LSUIElement`). `MACOS_MIN_VERSION` defaults to 14.0.
5. **Check**: `ls -R build/HelloApp.app/Contents`; `file build/HelloApp.app/Contents/MacOS/HelloApp`.
6. **Stable dev signing** (so permissions survive rebuilds): `Scripts/setup_dev_signing.sh`.
7. **Release** (the user's credentials, provided as environment variables they set themselves; never typed by you): a Developer ID Application identity in `APP_IDENTITY`, plus `APP_STORE_CONNECT_API_KEY_P8`, `APP_STORE_CONNECT_KEY_ID`, `APP_STORE_CONNECT_ISSUER_ID`. Then `Scripts/sign-and-notarize.sh` (notarize, staple, zip).
   - Verify: `codesign -dv --verbose=4 build/HelloApp.app`, `spctl --assess --type execute --verbose build/HelloApp.app`, `stapler validate build/HelloApp.app`.
8. **Updates (optional, Sparkle)**: `Scripts/make_appcast.sh` with `SPARKLE_PRIVATE_KEY_FILE`; bump `BUILD_NUMBER` in `version.env` on every release (Sparkle compares `CFBundleVersion`).
9. **Publish (ask first)**: git tag, then `gh release create v<version> <zip> appcast.xml --notes-file <notes>`. Pushing a tag and publishing a release are public actions.

| Notarization failure | Fix |
|---|---|
| Asset already uploaded | Bump `BUILD_NUMBER`, repackage |
| Invalid code signing entitlements | Remove keys not in Apple's allowed set |
| Hardened runtime not enabled | `--options runtime` on every `codesign` call |
| Hangs, no result | `xcrun notarytool history`; refresh the API key |
| `stapler validate` fails right after success | Wait ~60 s, `xcrun stapler staple` again |

App icon: `Scripts/build_icon.sh` turns an Icon Composer file into `.icns` (needs full Xcode).

## Pitfalls

- Tauri logic in `main.rs` (breaks mobile).
- `&str` parameters in async Tauri commands.
- Shipping an unsigned or un-notarized Mac build to users (Gatekeeper blocks it).
- Reusing a build number.
