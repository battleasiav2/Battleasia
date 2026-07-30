# BattleAsia App — Android Studio Build Guide (Full)

Build the Flutter player app (`battleasia-app`) to APK using Android Studio on Windows.

---

## 1. What you need installed

| Tool | Your machine (detected) | Notes |
|------|-------------------------|-------|
| **Flutter SDK** | `C:\Users\sumon\Downloads\flutter_windows_3.44.5-stable\flutter` | Must be on PATH **before** `C:\Windows\System32\flutter` |
| **Android Studio** | Installed (JBR 21) | With **Flutter** + **Dart** plugins |
| **Android SDK** | `C:\Users\sumon\AppData\Local\Android\sdk` | Licenses already accepted |
| **Node.js** | For local API only | `cd ..\api && npm run dev` |

Visual Studio C++ components are **not required** for Android APK (only for Windows desktop apps).

---

## 2. Fix PATH (important)

Your system has a wrong `flutter` at `C:\Windows\System32\flutter`. Fix it once:

### PowerShell (current session)

```powershell
$env:FLUTTER_ROOT = "C:\Users\sumon\Downloads\flutter_windows_3.44.5-stable\flutter"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:FLUTTER_ROOT\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;" + ($env:PATH -split ';' | Where-Object { $_ -notmatch 'System32\\flutter' }) -join ';'

flutter --version
where.exe flutter
```

`where.exe flutter` must show `...\Downloads\flutter_windows_3.44.5-stable\flutter\bin\flutter.bat` **first**.

### Permanent (User environment)

```powershell
[Environment]::SetEnvironmentVariable("FLUTTER_ROOT", "C:\Users\sumon\Downloads\flutter_windows_3.44.5-stable\flutter", "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$flutterBin = "C:\Users\sumon\Downloads\flutter_windows_3.44.5-stable\flutter\bin"
$androidPaths = @(
  "$env:LOCALAPPDATA\Android\Sdk\platform-tools",
  "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin"
)
$newPath = ($flutterBin, $androidPaths + ($userPath -split ';' | Where-Object { $_ -and $_ -notmatch 'System32\\flutter' }) | Select-Object -Unique) -join ';'
[Environment]::SetEnvironmentVariable("Path", $newPath, "User")
```

Restart Android Studio after this.

---

## 3. Android Studio SDK settings

### Flutter plugin

**File → Settings → Plugins** → search **Flutter** → Install (installs Dart too) → Restart.

### Flutter SDK path

**File → Settings → Languages & Frameworks → Flutter**

| Field | Value |
|-------|-------|
| Flutter SDK path | `C:\Users\sumon\Downloads\flutter_windows_3.44.5-stable\flutter` |

### Dart SDK path

**File → Settings → Languages & Frameworks → Dart**

| Field | Value |
|-------|-------|
| Dart SDK path | `C:\Users\sumon\Downloads\flutter_windows_3.44.5-stable\flutter\bin\cache\dart-sdk` |
| Enable Dart support | ✅ checked |

If you see **“Dart SDK is not configured”** in the editor, set the path above and click **Apply**.

---

## 4. Open the correct project folder

Open **only** this folder in Android Studio (not the repo root):

```
C:\Users\sumon\Desktop\battleasianew\battleasia-app
```

Wait for **Pub get** / indexing to finish.

Terminal inside Android Studio:

```powershell
flutter pub get
flutter doctor
```

---

## 5. Environment file (`.env`) — required for API URL

The app loads `.env` at startup and bundles it in the APK. **Hot reload does not update `.env`** — rebuild after changes.

Pre-made profiles in `battleasia-app/`:

| File | Use case | `API_BASE_URL` |
|------|----------|----------------|
| `.env.emulator` | Android Studio emulator + API on PC | `http://10.0.2.2:5050` |
| `.env.device` | Real phone + API on PC (same Wi‑Fi) | `http://192.168.0.105:5050` |
| `.env.production` | Release APK (live site) | `https://battleasia.gg` |

### Activate a profile

```powershell
cd C:\Users\sumon\Desktop\battleasianew\battleasia-app

copy .env.emulator .env      # emulator debug
# copy .env.device .env      # phone + local API
# copy .env.production .env  # live release APK
```

### Start local API (emulator / device profiles)

```powershell
cd C:\Users\sumon\Desktop\battleasianew\api
npm install
npm run dev
```

Demo login (after seed): `player@battleasia.local` / `Player@123456`

### Real phone + local API checklist

- Phone and PC on **same Wi‑Fi**
- PC IP in `.env.device` (default `192.168.0.105` — run `ipconfig` if changed)
- Windows Firewall allows **port 5050**
- `network_security_config.xml` already allows that IP for HTTP

---

## 6. Run on emulator (Debug)

1. **Tools → Device Manager** → Create/start an Android Virtual Device (AVD)
2. Ensure `.env` = emulator profile (`copy .env.emulator .env`)
3. Start local API: `npm run dev` in `api/`
4. Select the emulator in the device dropdown
5. Click **Run ▶** (or `Shift+F10`)

---

## 7. Run on real phone (Debug)

1. Enable **Developer options** + **USB debugging** on the phone
2. Connect USB → allow debugging prompt
3. `copy .env.device .env` (update IP if needed)
4. Start local API on PC
5. Select phone in device dropdown → **Run ▶**

Or install APK manually (see section 8) after building.

---

## 8. Build APK (Release)

### Before build — choose `.env`

```powershell
cd C:\Users\sumon\Desktop\battleasianew\battleasia-app

# Local testing on phone with PC API:
copy .env.device .env

# OR live production APK (any phone with internet):
copy .env.production .env
```

### Option A — Android Studio UI

1. **Build → Flutter → Build APK**
2. Wait for Gradle (first time can take 10–20 minutes)

### Option B — Terminal (recommended)

```powershell
cd C:\Users\sumon\Desktop\battleasianew\battleasia-app
flutter clean
flutter pub get
flutter build apk --release
```

### APK output path

```
battleasia-app\build\app\outputs\flutter-apk\app-release.apk
```

Copy to phone and install (enable **Install unknown apps** if needed).

Upload this APK via **Admin panel** if you use the in-app update feature.

---

## 9. Language toggle (en / bn)

Built-in: header **EN** / **বাং** button. Translations in `assets/translations/`.

---

## 10. Troubleshooting

### “Dart SDK is not configured”

Set Dart SDK path (Section 3) → Apply → Restart Android Studio.

### `flutter` runs wrong version / command fails

Fix PATH (Section 2). Remove or ignore `C:\Windows\System32\flutter`.

### `Because battleasia_app requires SDK version...`

Already fixed in `pubspec.yaml`: `sdk: ">=3.8.1 <4.0.0"`. Run `flutter pub get`.

### App opens but login/API fails

- Wrong `.env` for target (emulator needs `10.0.2.2`, phone needs PC IP or production URL)
- Local API not running (`npm run dev` in `api/`)
- Changed `.env` without rebuild → run `flutter clean` then build again

### Gradle / build slow or fails

```powershell
cd battleasia-app\android
.\gradlew clean
cd ..
flutter clean
flutter pub get
flutter build apk --release
```

### Waiting for another flutter command to release the startup lock

Close other terminals running Flutter, or delete:

```
C:\Users\sumon\Downloads\flutter_windows_3.44.5-stable\flutter\bin\cache\lockfile
```

---

## 11. Quick command cheat sheet

```powershell
# Setup PATH (session)
$env:FLUTTER_ROOT = "C:\Users\sumon\Downloads\flutter_windows_3.44.5-stable\flutter"
$env:PATH = "$env:FLUTTER_ROOT\bin;" + $env:PATH

# Project
cd C:\Users\sumon\Desktop\battleasianew\battleasia-app
copy .env.production .env
flutter pub get
flutter build apk --release

# Local API
cd C:\Users\sumon\Desktop\battleasianew\api
npm run dev
```

---

## 12. Project paths reference

| Item | Path |
|------|------|
| Flutter app | `battleasia-app/` |
| API | `api/` |
| Active env | `battleasia-app/.env` |
| Release APK | `battleasia-app/build/app/outputs/flutter-apk/app-release.apk` |
| Live site | https://battleasia.gg |
