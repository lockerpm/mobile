# !!! Please do not change image resolution and filename

## Custom App Icon, App Bundle ID, In-App Logo Images for Self-hosted

Locker comes with a self-hosted version where you can easily customize configuration, icons, logos to create a new app.

This document helps you manage your own application Icon and Logo.

### App Bundle ID, App Name, Apple Team ID

We created an `env.js` file containing 3 variables indicating these configurations..

```js
const BUNDLE_ID = 'com.cystack.locker.selfhost'
const TEAM_ID = 'XXXXXXXXXX'
const APP_NAME = 'SHLocker'
```

By changing the values of these variables, you can automatically change the default application configuration.

### App Icon, Splah Screen

The `icon` folder contains application icons set for Android and iOS.

1. 'icons/android': contains res value for Android icon
2. 'icons/ios/app: contains xcode `appiconset` for App Icon and xcode `imageset` for splash screen
3. 'icons/ios/service: contains xcode `imageset` for logo in iOS autofill service

### App Logo

The `logo` folder contains all the locker logo images.

After replacing these assets and configuration in selfhost folder. Run this command in the root project:

```sh
yarn
```

## Update new app version

After making these changes. Every time you run `git pull` command to update the new application version. You just need to run:

```sh
yarn
```
