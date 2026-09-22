# CHT Plus (Android)

React Native (Expo) client for the [khagrachariPlusNackend](../khagrachariPlusNackend) backend,
live at **https://chtplus.xyz**. Package: `com.chtplus.bd`.

## What's in here

- Full consumer app: auth (email + Google), local services, blood donors, marketplace,
  matrimony/biodata, doctor appointments, coin wallet (view-only — buying coins opens the
  website, see "Coins & Play Store policy" below), chat, profile/social, push notifications,
  account deletion, in-app Privacy Policy.
- `src/api/*` — one module per backend resource, all typed against the real API contracts.
- `src/screens/*` — grouped by feature; `src/navigation` has the tab + stack setup.
- `assets/generate-icons.js` — regenerates the placeholder icon/splash from the `src-*.svg`
  files in `assets/` (uses `sharp`, `npm install --no-save sharp` first if it's not around).

Because this uses native modules (Google Sign-In, OneSignal push), **it cannot run in plain
Expo Go** — you need a dev client build. See "Running it" below.

## One-time setup before you can build

1. **EAS project**: run `npx eas init` (or `npx eas build:configure`) once, logged into an Expo
   account. This fills in `extra.eas.projectId` in `app.json` (currently a placeholder).
2. **Google Sign-In**: in Google Cloud Console, on the *same* OAuth client project as the
   `google_client_id` already configured on the backend (Admin → Settings → Google Sign-In):
   - Add an **Android** OAuth client with package `com.chtplus.bd` and your build's SHA-1
     (get it from `eas credentials` for an EAS build, or your local debug keystore for
     `expo run:android`).
   - The app itself doesn't need a new client ID — `useGoogleAuth` (`src/hooks/useGoogleAuth.ts`)
     fetches the existing web client ID from `/api/app-config` and uses it as `webClientId`,
     which is what the backend's `verifyIdToken` checks the token audience against.
3. **OneSignal**: nothing to configure here — the App ID also comes from `/api/app-config`
   (backed by the same Admin → Settings → Push notifications value the web app uses). Just make
   sure that's actually set on the backend.
4. **Real branding**: `assets/icon.png`, `android-icon-foreground.png`,
   `android-icon-monochrome.png` and `splash-icon.png` are a placeholder green "CHT" mark
   generated from `assets/src-icon-full.svg` etc. Swap in real artwork (or edit the SVGs and
   re-run `node assets/generate-icons.js`) before a store release.

## Running it

```bash
npm install
npx expo prebuild        # generates android/ (and ios/) native projects
npx expo run:android     # builds & installs a dev client on a device/emulator
```

or, without a local Android SDK, build a dev client with EAS (`eas build --profile development
--platform android`) and open the resulting APK/build on device, then `npx expo start` to serve JS.

## Coins & Play Store policy

Google Play requires apps to use Google Play Billing for digital perks purchased and consumed
inside the app. The backend's coin/subscription top-up is a manual bKash/Nagad flow, so this app
deliberately keeps that **out of the in-app UI**: the Wallet screen shows your balance and top-up
history read-only, and "Buy coins" opens `chtplus.xyz` in the system browser instead of a WebView.
Spending an existing coin balance (sponsoring a listing, unlocking a biodata) stays in-app since
that's not a purchase flow, just spending a balance you already have. If you decide to change
this later, that policy is the thing to re-check first.

## Known simplifications (given the scope of this build)

- Area/district pickers are a mix of free text and district-name selects; there's no full
  district → upazila cascading picker outside the biodata form (which does have the real one, to
  match the backend's Bangla `permanentDistrict`/`permanentUpazila` fields exactly).
- Dates (date of birth, last donation date) are typed as `YYYY-MM-DD` text rather than a native
  date picker, to avoid another native dependency — swap in
  `@react-native-community/datetimepicker` if you want a picker UI.
- No offline caching beyond React Query's in-memory cache; the app assumes a network connection.
- This was built and type-checked (`npx tsc --noEmit`, `npx expo-doctor`) but **not run on a
  device or emulator** in this environment — there's no Android SDK/emulator here to test
  against. Do a full pass on-device before shipping: register → onboarding → each module →
  book a doctor serial → chat → edit profile → delete account.
