# Enzo desktop app (Tauri)

Build Enzo as a native **macOS** app (`.app` + `.dmg`) and **Windows** installer (`.exe` / `.msi`) from the same Vite + React frontend.

## Prerequisites

### All platforms

- **Node.js** 20+
- **Rust** (required for Tauri):

  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  source "$HOME/.cargo/env"
  rustc --version
  ```

### macOS (DMG on your MacBook)

- **Xcode Command Line Tools**:

  ```bash
  xcode-select --install
  ```

### Windows (.msi / .exe)

- **MSI** (WiX) must be built on **Windows** or GitHub Actions — not on macOS.
- **NSIS `.exe`** can be cross-built from macOS with `tauri:build:win:cross`.
- Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with **Desktop development with C++**
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually preinstalled on Windows 11)

### App metadata

Configured in `src-tauri/tauri.conf.json` and `Cargo.toml`:

| Field | Value |
|-------|--------|
| Publisher / org | Enculture |
| Developer | santhosh-patel |
| Copyright | Copyright © 2026 Enculture. Developed by santhosh-patel. |
| Bundle ID | `com.enculture.ai` |

## API URL (`.env`)

Same as web/Android — set before building:

```env
VITE_API_URL=https://enzo-backend-vrlm.vercel.app/api
```

See `.env.desktop.example`.

## Develop (hot reload)

```bash
cd Enzo-frontend
npm install
npm run tauri:dev
```

Opens a desktop window pointing at the Vite dev server.

## Build macOS `.dmg` (on your MacBook)

```bash
cd Enzo-frontend
npm install

# Apple Silicon Mac (M1/M2/M3) — default
npm run tauri:build

# Intel Mac only
npm run tauri:build -- --target x86_64-apple-darwin
```

**Output:**

| Artifact | Path |
|----------|------|
| `.app` | `src-tauri/target/release/bundle/macos/Enzo.app` |
| `.dmg` | `src-tauri/target/release/bundle/dmg/Enzo_0.1.0_aarch64.dmg` |

Open the `.dmg`, drag **Enzo** to Applications.

First build downloads Rust crates and can take **10–20 minutes**.

## Build Windows app

### On Windows — MSI (recommended)

```bash
cd Enzo-frontend
npm install
npm run tauri:build:win:msi
```

**Output:**

- `src-tauri\target\release\bundle\msi\Enzo_0.1.0_x64_en-US.msi` (or similar)

Copy to `release/windows/` after build if you want a fixed path.

### On macOS (cross-compile)

Install tooling once:

```bash
brew install nsis llvm lld
rustup target add x86_64-pc-windows-msvc
cargo install --locked cargo-xwin
```

Then build:

```bash
cd Enzo-frontend
npm install
export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
npm run tauri:build:win:cross
```

**Output:** `src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/Enzo_*_x64-setup.exe` (NSIS only — no MSI on macOS)

### GitHub Actions (MSI)

Push to `main`/`release` or run **Build Windows MSI (Tauri)** manually. Download the `enzo-windows-x64-msi` artifact.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run tauri:dev` | Desktop dev window + Vite |
| `npm run tauri:build` | Production bundle for current OS |
| `npm run tauri:build:mac` | macOS Apple Silicon build |
| `npm run tauri:build:win:msi` | Windows x64 MSI (on Windows only) |
| `npm run tauri:build:win:cross` | Windows x64 NSIS `.exe` from macOS |

## Backend / login

Desktop apps call your API over HTTPS. Ensure production backend allows your deployment URL if you use cookie-based auth.

For Vercel, keep `VITE_API_URL` ending with `/api`.

## Project layout

```
Enzo-frontend/
  src-tauri/          # Rust + Tauri config
    tauri.conf.json
    icons/            # App icons (from favicon.png)
  dist/               # Vite build (bundled into the app)
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `rustc` not found | Install Rust via rustup, restart terminal |
| macOS codesign / gatekeeper | For local testing: right-click app → Open. For distribution: Apple Developer ID signing |
| Blank window | Run `npm run build` then `npm run tauri:build` again |
| API errors | Check `.env` `VITE_API_URL`, rebuild |

## Version & bundle ID

Edit `src-tauri/tauri.conf.json` (`version`, `identifier`) and `src-tauri/Cargo.toml` before release.
