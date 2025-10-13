import { NativeModules, Platform } from "react-native"

const { CallerIDManager } = NativeModules

class CallerID {
  public PAGE_SIZE = 30
  public async getAndroidCallLogsHistory(page: number) {
    if (Platform.OS !== "android") {
      console.warn("getAndroidCallLogsHistory is android-only.")
      return false
    }
    return await CallerIDManager.getCallLogs(page, this.PAGE_SIZE)
  }

  public async isOverlayPermissionEnabled() {
    if (Platform.OS !== "android") {
      console.warn("isOverlayPermissionEnabled is android-only.")
      return false
    }
    try {
      return await CallerIDManager.isOverlayPermissionEnabled()
    } catch (err) {
      console.error("❌ Reload Error:", err)
    }
    return false
  }

  public async androidRequestOverlayPermission() {
    if (Platform.OS !== "android") {
      console.warn("androidRequestOverlayPermission is android-only.")
      return false
    }
    try {
      return await CallerIDManager.requestOverlayPermission()
    } catch (err) {
      console.error("❌ Reload Error:", err)
    }
    return false
  }

  public async androidOpenOverlayPermissionSettings() {
    if (Platform.OS !== "android") {
      console.warn("androidOpenOverlayPermissionSettings is android-only.")
      return
    }
    try {
      await CallerIDManager.openOverlayPermissionSettings()
    } catch (err) {
      console.error("❌ Reload Error:", err)
    }
  }

  public async iosCheckExtensionIsEnabled() {
    if (Platform.OS !== "ios") {
      console.warn("iosCheckExtensionIsEnabled is iOS-only.")
      return false
    }
    try {
      return await CallerIDManager.isExtensionActived()
    } catch (err) {
      console.error("❌ Reload Error:", err)
    }
    return false
  }

  public async iosOpenSetting() {
    if (Platform.OS !== "ios") {
      console.warn("iosOpenSetting is iOS-only.")
      return
    }
    try {
      await CallerIDManager.openSetting()
    } catch (err) {
      console.error("❌ Reload Error:", err)
    }
  }

  public async iosResetExtension() {
    if (Platform.OS !== "ios") {
      console.warn("iosResetExtension is iOS-only.")
      return
    }
    try {
      await CallerIDManager.reset()
    } catch (err) {
      console.error("❌ iosResetExtension Error:", err)
    }
  }

  public async iosRefreshPIRParameters() {
    if (Platform.OS !== "ios") {
      console.warn("iosRefreshPIRParameters is iOS-only.")
      return
    }
    try {
      await CallerIDManager.refreshPIRParameters()
    } catch (err) {
      console.error("❌ iosRefreshPIRParameters Error:", err)
    }
  }
}

export const callerID = new CallerID()
