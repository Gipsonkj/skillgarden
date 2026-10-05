> Distilled from: tauri-v2 (nodnarbnitram/claude-code-extensions, MIT), macos-spm-app-packaging (dimillian/skills, MIT); Electron section written from the Electron and Electron Forge docs

# Desktop apps: Electron, Tauri v2 and SwiftPM macOS apps without Xcode

## Pick a tool

| Situation | Use | Why |
|---|---|---|
| The project already uses one of these (or electron-builder) | Keep it | A desktop shell rewrite is rarely worth it; fix what is there |
| A web app (JS/TS) for Windows, macOS and Linux, Node.js libraries in the backend, same Chromium on every OS | Electron (section 1) | Embeds Chromium and Node.js; one JS codebase |
| One web frontend shipped as a small desktop (and mobile) app, Rust backend | Tauri v2 (section 2) | Capabilities scope permissions per window; the same project also targets mobile |
| A native Mac app (SwiftUI), built and packaged from the command line | SwiftPM + `templates/macos-spm-app-packaging/` (section 3) | No Xcode project; scripts sign and notarize |
| A native Mac app with the full Xcode project workflow | Xcode; SwiftUI rules in `swiftui.md` | Apple's standard path |
| Unsure whether size or Node.js matters more, or which OSes ship | Ask the user | The answer picks Electron vs Tauri in one line |

## 1. Electron

Electron embeds Chromium and Node.js in the app binary, so one JavaScript codebase runs on Windows, macOS and Linux. Scaffold, package and publish with Electron Forge.

```bash
npx create-electron-app@latest my-app --template=vite-typescript   # or vite, webpack, webpack-typescript
cd my-app && npm start                                              # dev run
# existing Electron app:
npm install --save-dev @electron-forge/cli && npx electron-forge import   # adds start, package, make scripts
```

Three kinds of process:
- **Main** (one per app): Node.js, app lifecycle, creates `BrowserWindow`s, menus, dialogs, tray.
- **Renderer** (one per window): the web page; no Node.js access by default.
- **Preload**: runs before the page loads and exposes a narrow API with `contextBridge`. All renderer ↔ main traffic goes through it.

```js
// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('node:path')
const isOurPage = (frame) => !!frame && frame.url.startsWith('file://')   // match your own origin or custom protocol
ipcMain.handle('dialog:openFile', async (e) => {
  if (!isOurPage(e.senderFrame)) return null          // validate the sender of every IPC message
  const { canceled, filePaths } = await dialog.showOpenDialog({})
  return canceled ? null : filePaths[0]
})
app.whenReady().then(() => {
  const win = new BrowserWindow({ webPreferences: { preload: path.join(__dirname, 'preload.js') } })
  win.loadFile('index.html')
})

// preload.js: expose one function per action, never ipcRenderer itself
const { contextBridge, ipcRenderer } = require('electron/renderer')
contextBridge.exposeInMainWorld('electronAPI', { openFile: () => ipcRenderer.invoke('dialog:openFile') })

// renderer: const path = await window.electronAPI.openFile()
```

**Security rules** (from Electron's own checklist)
- Keep the defaults: `nodeIntegration` off (since v5), `contextIsolation` on (since v12), renderer `sandbox` on (since v20). Never turn them back on to make `require` work; move the code to main or preload.
- Expose specific functions through `contextBridge`, never the whole `ipcRenderer`. Check `e.senderFrame` (its `origin`) in every `ipcMain.handle`.
- Set a Content-Security-Policy (`<meta http-equiv="Content-Security-Policy" content="default-src 'none'">`, then allow only what the page needs, e.g. `script-src 'self'`). Load remote content over HTTPS only; never disable `webSecurity` or enable `allowRunningInsecureContent`.
- Limit navigation and new windows: in `app.on('web-contents-created')`, handle `will-navigate` (parse with `new URL()`, `preventDefault()` unless the origin is yours) and `setWindowOpenHandler` (return `{ action: 'deny' }`; open vetted links with `shell.openExternal`, never untrusted strings).
- Prefer a custom protocol over `file://`; switch off fuses you don't need (e.g. `runAsNode`).
- Stay on a supported Electron: the latest three stable majors are supported, and a new major ships every 8 weeks.

**See it running** with Playwright's Electron support (experimental, over CDP):

```js
import { test, expect, _electron as electron } from '@playwright/test'
test('launches', async () => {
  const app = await electron.launch({ args: ['.'] })
  expect(await app.evaluate(async ({ app }) => app.isPackaged)).toBe(false)   // runs in main
  const win = await app.firstWindow()
  await win.screenshot({ path: 'home.png' })
  await app.close()
})
```

Run with `npx playwright test`; check both themes and every window, as for mobile.

**Package, sign, update**
- `npm run make` runs `electron-forge package` then the makers; installers land in `out/make/`, the packaged app in `out/<name>-<platform>-<arch>/`. Makers live in `forge.config.js` (`@electron-forge/maker-squirrel` gives Windows `Setup.exe` + `.nupkg` + `RELEASES`; `maker-dmg`, `maker-zip` and others for macOS/Linux).
- Signing is required for users to open the app safely on macOS and Windows, and for auto-update. Forge signs and notarizes in the package step:

```js
// forge.config.js (the user sets these env vars themselves; never commit the .p8)
module.exports = {
  packagerConfig: {
    osxSign: {},                                   // @electron/osx-sign default entitlements
    osxNotarize: {
      appleApiKey: process.env.APPLE_API_KEY,      // path to the App Store Connect .p8
      appleApiKeyId: process.env.APPLE_API_KEY_ID,
      appleApiIssuer: process.env.APPLE_API_ISSUER,
    },                                             // or appleId + appleIdPassword (app-specific) + teamId, or keychainProfile
  },
  publishers: [{ name: '@electron-forge/publisher-github',
    config: { repository: { owner: 'me', name: 'my-app' }, draft: true } }],   // GITHUB_TOKEN from env
}
```

- Windows: Azure Artifact Signing (formerly Trusted Signing) is the cheapest route and removes SmartScreen warnings; otherwise an EV certificate on a hardware module. Configure with `windowsSign` (`@electron/windows-sign`).
- Auto-update: `npm install update-electron-app`, then `require('update-electron-app')()` in main; it checks at startup and every ten minutes against update.electronjs.org (free; macOS and Windows only; needs a public GitHub repo with builds on GitHub Releases, and signed macOS builds). Private repo or own bucket: `updateElectronApp({ updateSource: { type: UpdateSourceType.StaticStorage, baseUrl: 'https://...' } })`.
- **Publish (ask first):** `npm run publish` uploads to GitHub Releases; in GitHub Actions grant `permissions: contents: write`. Keep `draft: true` and let the user release it.
- Projects on electron-builder: config in `electron-builder.yml` or the `build` key of `package.json`, `npx electron-builder --mac --win --linux`, updates via `electron-updater`. Keep it rather than switching to Forge.

| Symptom | Fix |
|---|---|
| `require is not defined` in the page | Expected with Node off; move the call to main, expose it via preload |
| `window.electronAPI` is undefined | `webPreferences.preload` path wrong, or the preload threw; check the main-process console |
| Links open inside the app window | Add `setWindowOpenHandler` and `will-navigate` guards |
| Auto-update never fires on Linux / unsigned Mac build | update.electronjs.org serves macOS and Windows only, and macOS builds must be signed |

## 2. Tauri v2

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

## 3. SwiftPM macOS app, no Xcode project (bundled templates)

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

- Electron: exposing `ipcRenderer` or Node APIs to the page, or re-enabling `nodeIntegration` to "fix" an error.
- Electron: publishing a release or update feed before the user said yes; an unsigned build that users cannot open and that never updates.
- Tauri logic in `main.rs` (breaks mobile).
- `&str` parameters in async Tauri commands.
- Shipping an unsigned or un-notarized Mac build to users (Gatekeeper blocks it).
- Reusing a build number.
