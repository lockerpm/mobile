![Locker Password Manager](https://raw.githubusercontent.com/lockerpm/.github/main/images/locker4.png)

# Locker Mobile

Locker Mobile is a secure and user-friendly cross-platform application written in React Native, designed to allow users to store and manage their passwords and secrets on both Android and iOS devices.

## Getting Started

### Configure Git blame

We recommend that you configure git to ignore the Prettier revision:

```
git config blame.ignoreRevsFile .git-blame-ignore-revs

```

### Android/iOS Development

See the  [React native environment setup](https://reactnative.dev/docs/0.71/environment-setup) page to set up an Android and iOS development environment.

### Environment variables

We are using [Ignite](https://github.com/infinitered/ignite/tree/master) boilerplate. You can manually set your API endpoints and web socket settings by creating a `app/config/.env.production` file for production environment or `app/config/.env.staing` file for Staging environment with the following `app/config/.env.example` content.

### Build and Debug

```
git clone https://github.com/lockerpm/mobile.git
cd mobile
yarn
yarn ios | yarn android
```

## Contributing
Contributions to the Locker Mobile project are welcome! If you find any issues or want to suggest improvements, please feel free to open an issue or submit a pull request.

Before contributing, please review the [Contribution Guidelines](https://github.com/lockerpm/.github/blob/main/CONTRIBUTING.md).

## License
The Locker Mobile is open-source and released under the [GPLv3](./LICENSE) License. Feel free to use, modify, and distribute the code as per the terms of the license.
