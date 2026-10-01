# Calendar App — Mobile

React Native mobile app (Expo) for **Calendar App**.

Part of [Chaowalit Greepoke](https://bookchaowalit.com)'s 101 Portfolio Projects.

## Tech Stack

- **Framework:** Expo SDK 53 + Expo Router
- **Language:** TypeScript
- **Navigation:** Expo Router (file-based)
- **UI:** React Native + Ionicons

## Features

- **Month view** (home tab): six-week grid with previous/next month
  navigation, today highlighted and a dot on days that have events.
- **Day agenda**: tap a day to see its events (all-day first, then by time)
  and delete them.
- **Add events** with a title and optional 24-hour `HH:MM` time; input is
  validated.
- Events live in memory for now (`lib/calendar.ts` holds the pure logic);
  on-device persistence is the next backlog item.

## Getting Started

```bash
npm ci
npx expo start
```

## Validation

```bash
npm run validate   # expo lint + tsc --noEmit + vitest
npx expo export --platform android --output-dir dist   # bundle smoke check
```

Pure logic lives in `lib/` and is unit-tested with Vitest (`lib/*.test.ts`).
CI (`.github/workflows/build.yml`) runs all of the above and fails on errors;
the EAS preview build is owner-triggered (`workflow_dispatch`) and needs the
`EXPO_TOKEN` secret plus the committed `eas.json`.

## Build

```bash
# Android
npx eas build --platform android --profile preview

# iOS
npx eas build --platform ios --profile preview
```

## Related

- **Frontend:** [bookchaowalit-website/calendar-app-frontend](https://github.com/bookchaowalit-website/calendar-app-frontend)
- **Portfolio:** [bookchaowalit.com](https://bookchaowalit.com)

## License

MIT
