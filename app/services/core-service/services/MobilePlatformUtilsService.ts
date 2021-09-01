import { PlatformUtilsService } from "../../../../core/abstractions"
import { DeviceType } from "../../../../core/enums"
import { Platform, Linking, Alert } from "react-native"
import Clipboard from '@react-native-clipboard/clipboard'
import ReactNativeBiometrics from 'react-native-biometrics'
import DeviceInfo from 'react-native-device-info'
import Toast from 'react-native-toast-message';

export class MobilePlatformUtilsService implements PlatformUtilsService {
  identityClientId: string

  authenticateBiometric(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      ReactNativeBiometrics.simplePrompt({ promptMessage: 'Authenticate' })
        .then((resultObject) => {
          const { success } = resultObject
          resolve(success)
        })
        .catch(() => {
          resolve(false)
        })
    })
  }

  copyToClipboard(text: string, options: any): void | boolean {
    Clipboard.setString(text)
  }

  getApplicationVersion(): Promise<string> {
    return Promise.resolve(DeviceInfo.getVersion());
  }

  getDefaultSystemTheme(): Promise<'light' | 'dark'> {
    return Promise.resolve('light');
  }

  getDevice(): DeviceType {
    switch (Platform.OS) {
      case 'ios':
        return DeviceType.iOS
      case 'android':
        return DeviceType.Android
      default:
        return DeviceType.Android
    }
  }

  getDeviceString(): string {
    return DeviceType[this.getDevice()].toLowerCase()
  }

  isChrome(): boolean {
    return false;
  }

  isDev(): boolean {
    return __DEV__;
  }

  isEdge(): boolean {
    return false;
  }

  isFirefox(): boolean {
    return false;
  }

  isIE(): boolean {
    return false;
  }

  isMacAppStore(): boolean {
    return false;
  }

  isOpera(): boolean {
    return false;
  }

  isSafari(): boolean {
    return false;
  }

  isSelfHost(): boolean {
    return false;
  }

  isViewOpen(): Promise<boolean> {
    return Promise.resolve(false);
  }

  isVivaldi(): boolean {
    return false;
  }

  launchUri(uri: string, options: any): void {
    Linking.canOpenURL(uri).then((supported) => {
      if (supported) {
        Linking.openURL(uri)
      } else {
        Alert.alert(`Don't know how to open: ${uri}`)
      }
    })
  }

  lockTimeout(): number {
    return 0;
  }

  onDefaultSystemThemeChange(callback: (theme: ("light" | "dark")) => unknown): unknown {
    return undefined;
  }

  readFromClipboard(options: any): Promise<string> {
    return Promise.resolve(Clipboard.getString());
  }

  // TODO
  saveFile(win: Window, blobData: any, blobOptions: any, fileName: string): void {
    throw new Error('Not implemented save file for now.');
  }

  showDialog(body: string, title: string | undefined, confirmText: string | undefined, cancelText: string | undefined, type: string | undefined, bodyIsHtml: boolean | undefined): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        body,
        [
          {
            text: confirmText,
            onPress: () => resolve(true)
          },
          {
            text: cancelText,
            style: "cancel",
            onPress: () => resolve(false)
          }
        ]
      )
    })
  }

  showPasswordDialog(title: string, body: string, passwordValidation: (value: string) => Promise<boolean>): Promise<boolean> {
    return Promise.resolve(false);
  }

  showToast(type: "error" | "success" | "warning" | "info", title: string, text: string | string[], options: any): void {
    Toast.show({
      type,
      text1: title,
      text2: text.toString()
    })
  }

  supportsBiometric(): Promise<boolean> {
    return new Promise<boolean>((resolve => {
      ReactNativeBiometrics.isSensorAvailable().then(({ available }) => {
        resolve(available)
      })
    }))
  }

  supportsDuo(): boolean {
    return false;
  }

  supportsSecureStorage(): boolean {
    return true;
  }

  supportsWebAuthn(win: Window): boolean {
    return false;
  }
}
