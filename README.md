# Hydroholic App

This repository contains the Hydroholic mobile app.

- `frontend/`: React Native app (Expo)
- `backend/`: Node backend

## Run the app on your Android phone (USB debugging, step by step)

These instructions are for someone running a React Native app for the first time.

## 1) Install required software on your computer

1. Install **Node.js LTS** (includes npm):
    - https://nodejs.org/
2. Install **Git**:
    - https://git-scm.com/downloads
3. Install **Android Platform Tools** (for `adb`):
    - https://developer.android.com/tools/releases/platform-tools
4. (Windows) Add the `platform-tools` folder to your PATH so `adb` works in terminal.
5. Install the **Java SDK** (version 21):
    - https://www.oracle.com/java/technologies/downloads/#jdk21-windows

Check installation in a terminal:

```bash
node -v
npm -v
adb version
java -version
```

## 2) Prepare your Android phone

1. Open **Settings > About phone**.
2. Tap **Build number** 7 times to enable Developer options.
3. Go to **Settings > Developer options**.
4. Enable:
    - **USB debugging**
5. Connect the phone to your computer with a USB data cable.
6. On the phone, allow the prompt: **"Allow USB debugging?"** and tap **Allow**.

## 3) Verify the phone is detected

Run:

```bash
adb devices
```

You should see your device with status `device`.

If you see `unauthorized`, unlock the phone and accept the USB debugging popup, then run `adb devices` again.

## 4) Important for Bluetooth: use a Development Build (not Expo Go)

This app uses native Bluetooth features.

- You must build and install a **development build** on your Android phone.

## 5) Install project dependencies

From the project root, run:

```bash
cd frontend
npm install
```

## 6) Build and install the Android app on your phone (USB)

In `frontend/`, run:

```bash
npx expo run:android
```

What this does:

- builds the native Android app
- installs it on your connected phone through `adb`

Wait until the build finishes and the app is installed.
### Possible errors:
- **ANDROID_HOME error**: you need to set the `ANDROID_HOME` environment variable to your Android SDK path. In Windows, you can set it in-place with: `set ANDROID_HOME=C:\Path\To\Android\Sdk`.
- **SDK Licenses not accepted**: you need to accept the Android SDK licenses by running `sdkmanager --licenses`. If `sdkmanager` is not found, download the command line tools from https://developer.android.com/studio#command-line-tools-only, extract it into the ANDROID_HOME folder and create the `latest` folder. Move all files and folders into it and run `sdkmanager --licenses` from the `cmdline-tools/bin` folder.

## 7) Start the Metro bundler for development client

After the app is installed, run:

```bash
npx expo start --dev-client
```

Then open the installed Hydroholic development app on your phone.

If needed, press:

- `a` to launch the dev client on the connected Android device

Expo/Metro will connect to your dev build and load the JavaScript bundle.

## 8) Keep developing

1. Edit files inside `frontend/app/`.
2. Save the file.
3. The app reloads automatically on the device (Fast Refresh).

## Common issues and quick fixes

- `adb` not found:
  - Re-check Android Platform Tools installation and PATH.
- Device not listed in `adb devices`:
  - Try another USB cable/USB port.
  - Set USB mode to **File transfer (MTP)**.
  - Revoke USB debugging authorizations and reconnect.
- Bluetooth features do not work in Expo Go:
  - This is expected. Use development build with `npx expo run:android`.
- Build fails on `npx expo run:android`:
  - Make sure Android SDK/Platform Tools are installed.
  - Accept Android licenses if prompted.
- Dev client does not open after pressing `a`:
  - Run `adb devices` again to confirm status is `device`.
  - Restart Metro: stop (`Ctrl + C`) and run `npx expo start --dev-client` again.

## Notes

- These steps run the mobile app (`frontend/`) only.
- First build can take several minutes.
- If your app screens require API calls, you may also need to start one backend (`backend/` or `backendmio/`) in a separate terminal.
