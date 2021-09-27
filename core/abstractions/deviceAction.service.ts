import { DeviceType } from '../enums/deviceType'
import { CipherView } from '../models/view/cipherView'

export interface DeviceActionService {
    deviceUserAgent: string
    deviceType: DeviceType
    
    toast: (text: string, longDuration?: boolean) => void
    launchApp: (appName: string) => boolean
    showLoadingAsync: (text: string) => Promise<void>
    hideLoadingAsync: () => Promise<void>
    openFile: (fileData: number[], id: string, fileName: string) => boolean
    saveFile: (fileData: number[], id: string, fileName: string, contentUri: string) => boolean
    canOpenFile: (fileName: string) => boolean
    clearCacheAsync: () => Promise<void>
    selectFileAsync: () => Promise<void>
    displayPromptAync: (title: string | null, description: string | null, text: string | null, okButtonText: string | null, cancelButtonText: string | null, numericKeyboard: boolean | false, autofocus: boolean, password: boolean) => Promise<string>;
    rateApp: () => void
    supportsFaceBiometric: () => boolean;
    supportsFaceBiometricAsync: () => Promise<boolean>;
    supportsNfc: () => boolean
    supportsCamera: () => boolean
    supportsAutofillService: () => boolean
    systemMajorVersion: () => number
    systemModel: () => string
    displayAlertAsync: (title: string, message: string, cancel: string, buttons: string[]) => Promise<string>
    displayActionSheetAsync: (title: string, cancel: string, destruction: string, buttons: string[]) => Promise<string>
    autofill: (cipher: CipherView) => void
    closeAutofill: () => void
    background: () => void
    autofillAccessibilityServiceRunning: () => boolean
    autofillAccessibilityOverlayPermitted: () => boolean
    autofillServiceEnabled: () => boolean
    disableAutofillService: () => void
    getBuildNumber: () => string;
    openAccessibilitySettings: () => void
    openAccessibilityOverlayPermissionSettings: () => void
    openAutofillSettings: () => void
    usingDarkTheme: () => boolean
    getActiveTime: () => number
    closeMainApp: () => void
    supportsFido2: () => boolean
}