# PromptVault Mobile

React Native (Expo) mobile app for PromptVault — syncs with the web app and Bubble desktop app using a Google Keep-style offline-first sync engine.

## Features

- **Offline-First**: Full read/write capability without internet, powered by WatermelonDB (SQLite)
- **Google Keep-Style Sync**: Lazy writes with background push/pull, last-write-wins conflict resolution
- **Unified Design**: Same color system, typography, and branding as the web app
- **PIN & Biometric Lock**: Secure your prompts with a 4-digit PIN or Face ID / fingerprint
- **Variable Templates**: Fill `{{variable}}` placeholders before copying
- **Dark/Light/System Theme**: Matches the platform color scheme
- **Pull-to-Refresh**: Instant manual sync from the prompt list
- **Background Sync**: Runs every 15 minutes when the app is backgrounded

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 52 |
| Navigation | Expo Router (file-based) |
| Offline DB | WatermelonDB (SQLite + JSI) |
| State | Zustand |
| Auth | expo-secure-store + expo-local-authentication |
| Networking | @react-native-community/netinfo |

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout (ThemeProvider + auth gate)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── lock.tsx        # PIN lock screen
│   └── (app)/
│       ├── _layout.tsx     # Drawer navigation
│       ├── index.tsx       # Prompt list (home)
│       ├── [id].tsx        # Prompt detail/editor
│       ├── search.tsx      # Search + filters
│       └── settings.tsx    # Settings screen
├── src/
│   ├── api/client.ts       # REST API client
│   ├── components/         # Reusable UI components
│   ├── db/                 # WatermelonDB schema & models
│   ├── stores/             # Zustand state stores
│   ├── sync/               # Sync engine + background tasks
│   └── theme/              # Design tokens & ThemeProvider
├── app.json                # Expo configuration
├── babel.config.js         # Babel (WatermelonDB plugin)
├── metro.config.js         # Metro (shared package resolve)
├── package.json
└── tsconfig.json
```

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode 15+ (for iOS simulator)
- Android: Android Studio with an emulator

### Install Dependencies

```bash
cd mobile
npm install
```

### Configure Server URL

The app connects to the PromptVault API server. Set the server URL in:
- **Settings screen** → Server section → enter your server URL
- Default: `http://localhost:2529`

For physical device testing, use your computer's LAN IP (e.g., `http://192.168.1.100:2529`).

### Run

```bash
# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## Sync Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Mobile App  │────▶│ Express API  │◀────│   Web App   │
│ WatermelonDB │     │   SQLite     │     │ localStorage│
└─────────────┘     └──────────────┘     └─────────────┘
                           ▲
                           │
                    ┌──────┴──────┐
                    │ Bubble App  │
                    │  (Desktop)  │
                    └─────────────┘
```

### Sync Flow
1. **Local write** → save to WatermelonDB immediately, mark as `created`/`updated`
2. **Push phase** → send pending local changes to server
3. **Pull phase** → fetch server changes via `GET /api/sync/changes?since=<timestamp>`
4. **Conflict resolution** → last-write-wins based on `updatedAt` timestamp
5. **Background sync** → every 15 minutes via `expo-background-fetch`
6. **Connectivity aware** → auto-syncs when device goes back online

### Delta Sync Endpoint

The backend exposes `GET /api/sync/changes?since=<timestamp>` which returns only records modified after the given timestamp, minimizing bandwidth:

```json
{
  "prompts": {
    "created": [...],
    "updated": [...],
    "deleted": [{ "id": "...", "deletedAt": 1234567890 }]
  },
  "folders": { ... },
  "serverTime": 1234567890
}
```
