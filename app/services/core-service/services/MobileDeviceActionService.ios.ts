import { DeviceActionService as DeviceActionServiceAbstraction } from "../../../../core/abstractions"
import { DeviceType } from "../../../../core/enums";
import { CipherView } from "../../../../core/models/view";

import { Platform } from 'react-native'


export class DeviceActionService implements DeviceActionServiceAbstraction {

  // --------- Requirements for autofill -------------

  systemMajorVersion() {
    return parseInt(Platform.Version.toString())
  };

  openAutofillSettings: () => void
  disableAutofillService: () => void
  openAccessibilitySettings: () => void
  openAccessibilityOverlayPermissionSettings: () => void
  autofillServiceEnabled: () => boolean
  autofillAccessibilityServiceRunning: () => boolean
  autofillAccessibilityOverlayPermitted: () => boolean

  // --------- Others-------------

  deviceUserAgent = 'mobile'
  deviceType: DeviceType = DeviceType.iOS

  toast: (text: string, longDuration?: boolean) => void
  launchApp: (appName: string) => boolean
  showLoadingAsync: (text: string) => Promise<void>
  hideLoadingAsync: () => Promise<void>
  openFile: (fileData: number[], id: string, fileName: string) => boolean
  saveFile: (fileData: number[], id: string, fileName: string, contentUri: string) => boolean
  canOpenFile: (fileName: string) => boolean
  clearCacheAsync: () => Promise<void>
  selectFileAsync: () => Promise<void>
  displayPromptAync: (title: string, description: string, text: string, okButtonText: string, cancelButtonText: string, numericKeyboard: boolean, autofocus: boolean, password: boolean) => Promise<string>
  rateApp: () => void
  supportsFaceBiometric: () => boolean
  supportsFaceBiometricAsync: () => Promise<boolean>
  supportsNfc: () => boolean
  supportsCamera: () => boolean
  supportsAutofillService: () => boolean
  systemModel: () => string
  displayAlertAsync: (title: string, message: string, cancel: string, buttons: string[]) => Promise<string>
  displayActionSheetAsync: (title: string, cancel: string, destruction: string, buttons: string[]) => Promise<string>
  autofill: (cipher: CipherView) => void
  closeAutofill: () => void
  background: () => void
  getBuildNumber: () => string
  usingDarkTheme: () => boolean
  getActiveTime: () => number
  closeMainApp: () => void
  supportsFido2: () => boolean
}