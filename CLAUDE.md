# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Locker Mobile — a cross-platform password manager built with React Native + Expo on top of the Ignite boilerplate. Vault encryption and domain logic come from a Bitwarden-derived `core/` layer.

## Common commands

Package manager is **yarn** (Node `>=20`). A `bun.lock` exists but the scripts and the `patch-package` postinstall assume yarn.

- `yarn` — install deps (runs `patch-package` via `postinstall`)
- `yarn start` — Metro dev server (`expo start --dev-client`)
- `yarn ios` / `yarn android` — Expo prebuild + native run
- `yarn android:release` — Android release build
- `yarn prebuild:clean` — regenerate `ios/` and `android/` from scratch; required after changing native deps or `app.config.ts` plugins
- `yarn compile` — TypeScript check (`tsc --noEmit -p .`)
- `yarn lint` / `yarn lint:check` — ESLint (fix / check)
- `yarn test` / `yarn test:watch` — Jest (`jest-expo` preset, setup at `test/setup.ts`)
- `yarn test:maestro` — E2E flows under `.maestro/flows`
- `yarn depcruise` / `yarn depcruise:graph` — dependency-cruiser audit / SVG+PNG graph of `app/`

To run a single Jest test: `yarn test path/to/file.test.ts` or `yarn test -t "test name"`.

## Environment files

Create `app/config/.env.production` or `app/config/.env.staging` from `app/config/.env.example` (consumed via `react-native-config`). These are not committed.

## Architecture

### Two source roots: `app/` and `core/`

- **`core/`** is a platform-agnostic domain layer (abstractions, enums, models, services). It has no React Native imports. Notable services: `CryptoService`, `CipherService`, `FolderService`, `CollectionService`, `SyncService`, `PolicyService`, `SearchService`, `ImportService`, `ExportService`, `SendService`, `AuditService`, `VaultTimeoutService`, `TokenService`, `UserService`, `ApiService`, `SettingsService`, `ContainerService`, `PasswordGenerationService`, `FileUploadService`.
- **`app/`** is the React Native side: UI (`components/`, `screens/`), navigation (`navigators/`), MobX stores (`models/`), platform services (`services/`), and utilities (`utils/`).

### The bridge

`app/services/coreService/index.tsx` is the single place that instantiates RN-specific platform services (`MobileStorageService`, `SecureStorageService`, `MobileCryptoFunctionService`, `MobilePlatformUtilsService`, `MobileLogService`, `MobileMessagingService`, `AttachmentService`) and wires them into the `core/` services through manual constructor DI. The resulting graph is exposed via a React context — use that context (not direct instantiation) to reach crypto/cipher/sync from screens.

### State

MobX-State-Tree. The single `RootStore` (`app/models/RootStore.ts`) composes `cipherStore`, `collectionStore`, `enterpriseStore`, `folderStore`, `toolStore`, `uiStore`, and `user`. Screens read via `useStores()` from `@/models`. Persistence and rehydration are set up in `app/app.tsx` through `useInitialRootStore` — the UI doesn't render until `rehydrated` is true.

### Navigation

React Navigation v7 native-stack in [app/navigators/AppNavigator.tsx](app/navigators/AppNavigator.tsx). Screens are grouped into three top-level stacks under `app/screens/`:

- `init/` — splash, lock (master-password / pin / biometric unlock)
- `unauth/` — login, register, forgot password
- `auth/screens/` — post-login app: `(tabs)`, `homeStack`, `browseStack`, `toolStack`, `menuStack`, `androidAutofillStack`, `modal`

Deep-link prefixes: `locker://` and `https://id.locker.io`. Global API response handling is wired in `app/navigators/useMonitorApiResponse.ts`.

### API layer

`app/services/api/` uses `apisauce` (`api.ts`, `apiConfig.ts`, plus per-resource files: `cipherApi.ts`, `folderApi.ts`, `userApi.ts`, `enterpriseApi.ts`, `toolApi.ts`, `attachmentApi.ts`, `idApi.ts`).

### Entry flow

`index.tsx` registers Node-style globals (`node-libs-react-native`, `react-native-quick-base64`, `react-native-get-random-values`) and the push-notification background handler, then mounts `app/app.tsx`. In `app/app.tsx`, `import "./utils/gestureHandler"` **must remain the first import**; the app then initializes Sentry and the Facebook SDK and only renders once fonts, i18n, navigation state, and the root store are all ready.

### Platform-specific code

Autofill is split into `app/utils/autofill.android.ts` and `app/utils/autofill.ios.ts` (Metro resolves by `.android` / `.ios` extension). Passkey / FIDO2 entry point: `app/utils/passkey.tsx`.

## Conventions

### Path aliases

Defined in both `tsconfig.json` and `babel.config.js` (`module-resolver`):

- `@/*` → `./app/*`
- `@assets/*` → `./assets/*`
- `core/*` → `./core/*`

Babel additionally remaps:

- `crypto` → `react-native-quick-crypto`
- `stream` → `readable-stream`

Don't import Node's `crypto` directly anywhere — use the alias or `expo-crypto`.

### TypeScript

`strict: true`, `noImplicitAny`, `noImplicitReturns`, legacy decorators enabled (for MobX). `allowJs: false` — don't add `.js` source files.

### i18n

Supported languages are `en` and `vi` (`app/i18n/en.ts`, `app/i18n/vi.ts`). Add new strings to both.

### Patched dependencies

`react-native-keychain@10.0.0` is patched via `patch-package` (see `patches/`). The `postinstall` script reapplies patches, so just run `yarn` after dep changes.

### Native rebuilds

Changes to native deps, `app.config.ts`, or expo config plugins require `yarn prebuild:clean` before the next `yarn ios` / `yarn android`.

## Security stance

This is a password manager. All vault data is end-to-end encrypted via `core/`'s `CryptoService`. Never log decrypted ciphers, secrets, or master keys, and don't bypass the lock flow in `app/screens/init/lock`.
