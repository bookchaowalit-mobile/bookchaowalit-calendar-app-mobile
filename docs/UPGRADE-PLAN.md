# Upgrade Plan

## Current state

- Before this pass: **2/10** — Expo template scaffold with placeholder
  screens; CI masked every failure with `|| true`; lint failed; the app could
  not be bundled (missing `expo-asset`, `query-string`, outdated
  `expo-router`); `app.json` referenced icon files that do not exist.
- After this pass: **6/10** — real core feature, tested pure logic,
  honest CI, app bundles for Android.

## Backlog

### P0
- Add real app icons (`assets/icon.png`, `assets/adaptive-icon.png`) and
  reference them from `app.json` before any store build.

### P1
- Add component tests (jest-expo + @testing-library/react-native) for the
  main screen.
- Dark-mode palette (`userInterfaceStyle` is `automatic` but colors are
  hard-coded light).

### P2
- Sync with the web frontend's API once one exists.
- Upgrade Expo SDK (clears remaining `npm audit` findings in Expo tooling).

## Done in this pass

- Home tab is a month calendar (grid, navigation, today/event markers) with a per-day agenda and validated add/delete of events.
- Pure logic in `lib/` with Vitest unit tests (`npm test`).
- CI now runs `npm ci`, lint, typecheck, tests and an Android bundle export
  with no failure masking; EAS preview build is owner-triggered only and
  `eas.json` is committed.
- Added `eslint.config.js`, `typecheck`/`test`/`validate` scripts and a
  committed `package-lock.json`.
- Fixed dependencies so Metro can bundle (SDK 53-aligned `expo-router`,
  `react-native`, `expo-constants`; added `expo-asset`, `expo-font`,
  `query-string`).
- `app.json`: removed references to missing icon files; Android package id
  no longer contains hyphens (invalid for Android application IDs).
- Removed the placeholder Explore tab.

## Done in this pass (pass 2)

Score: 7/10 (was 6/10) — events now survive restarts; still no reminders/notifications or icons.

- Events persist via AsyncStorage (`@react-native-async-storage/async-storage` 2.1.2) through `lib/usePersistentState.ts` with a versioned codec; `isCalendarEvent` drops malformed entries (bad date/time, empty title) instead of failing the load (tested).
- Accessibility: add-event button names the selected date; profile links get link roles.
- Advisories: `overrides.postcss ^8.5.28` clears the high-severity PostCSS advisory in Expo metro-config (minor bump). Remaining `image-size` (metro, bundler-only), `uuid` (via `xcode`) and `decode-uri-component` (via `query-string@7`) need an Expo SDK major upgrade; deliberately not auto-fixed.
- Verified: typecheck, lint, 17 vitest tests, Android `expo export` bundle.

## Done in this pass (pass 3)

Score: 7.5/10 (was 7/10) — edge-case hunt in `lib/calendar.ts`.

- Bug: `validateEvent` only checked the `YYYY-MM-DD` shape, so "2025-02-30" was accepted and the event could never appear in the grid; `isRealDateKey` checks month length and leap years.
- Bug: "9:30" was rejected and would have sorted after "10:00" if stored; `normalizeTime` accepts "9:30", "09.30" and full-width digits and stores `HH:MM`.
- a11y: grid cells read "Tuesday 3 June 2025, 1 event" instead of "2025-06-03, 1 event(s)".
- Verified: typecheck, lint, 21 vitest tests, Android `expo export`.
