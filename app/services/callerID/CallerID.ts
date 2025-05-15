import { Alert, NativeModules, Platform } from "react-native"
import RNFS from "react-native-fs"
import { callerData } from "./data"

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

  public async iosReloadCallDirectoryExtension() {
    if (Platform.OS !== "ios") {
      return
    }

    try {
      const result = await CallerIDManager.reloadCallDirectory()
      console.log("✅ Call Directory Reloaded:", result)
    } catch (err) {
      console.error("❌ Reload Error:", err)

      switch ((err as any).code) {
        case "EXTENSION_DISABLED":
          Alert.alert(
            "Extension Disabled",
            "Please enable the Call Directory extension in Settings → Phone → Call Blocking & Identification.",
          )
          break
        case "RELOAD_FAILED":
          Alert.alert("Reload Failed", "Something went wrong while reloading the extension.")
          break
        default:
          Alert.alert("Error", (err as any).message || "Unknown error occurred.")
      }
    }
  }

  public async iosCheckExtensionIsEnabled() {
    if (Platform.OS !== "ios") {
      console.warn("iosCheckExtensionIsEnabled is iOS-only.")
      return false
    }
    try {
      const result = await CallerIDManager.getExtensionStatus()
      return result === "ENABLED"
    } catch (err) {
      console.error("❌ Reload Error:", err)
    }
    return false
  }

  public async iosProcessAndSaveCSV() {
    if (Platform.OS !== "ios") {
      console.warn("Caller ID saving is iOS-only.")
      return
    }
    try {
      // Parse and reformat: keep only phone number and label
      const outputLines = []
      callerData.forEach((label, number) => {
        outputLines.push(`${number},${label}`)
      })

      // Convert to string
      const outputCSV = outputLines.join("\n")

      // Get App Group path
      const groupPath = await CallerIDManager.getSharedContainerPath() // ✅ now correct
      // Create the directory if it doesn't exist
      const exists = await RNFS.exists(groupPath)
      if (!exists) {
        await RNFS.mkdir(groupPath)
      }

      const targetPath = `${groupPath}/caller_ids.csv`

      // Write to shared container
      await RNFS.writeFile(targetPath, outputCSV, "utf8")

      console.log(`✅ caller_ids.csv saved to: ${targetPath}`)
    } catch (err) {
      console.error("❌ Error reading or saving CSV:", err)
    }
  }
}

export const callerID = new CallerID()
