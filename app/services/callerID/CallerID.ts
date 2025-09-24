import { NativeModules, Platform } from "react-native"

const { CallerIDManager } = NativeModules

class CallerID {
  // Android 10+ request Call Screening Service
  public async androidRequestCallScreeningService() {
    if (Platform.OS !== "android") {
      console.warn("CallScreeningService is android-only.")
      return false
    }
    try {
      return await CallerIDManager.requestScreeningRole()
    } catch (err) {
      console.error("❌ Reload Error:", err)
    }
    return false
  }

  // Android 10+ check Call Screening Service
  public async androidCheckCallScreeningPermission() {
    if (Platform.OS !== "android") {
      console.warn("androidCheckCallScreeningPermission is android-only.")
      return false
    }
    try {
      return await CallerIDManager.isEnabledScreeningRole()
    } catch (err) {
      console.error("❌ Reload Error:", err)
    }
    return false
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
      console.log("✅ iosRefreshPIRParameters Success")
    } catch (err) {
      console.error("❌ iosRefreshPIRParameters Error:", err)
    }
  }
}

export const callerID = new CallerID()
