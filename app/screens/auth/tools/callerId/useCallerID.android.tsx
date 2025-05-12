import { callerID } from "app/services/callerID/CallerID"
import { useEffect, useState } from "react"
import { PermissionsAndroid } from "react-native"

export const useCallerID = () => {
  const [isEnabledOverlayPermission, setEnabledOverlayPermission] = useState(false)

  // ---------------------------METHOD-----------------------
  const requestCallPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      ])

      const phoneStateGranted =
        granted["android.permission.READ_PHONE_STATE"] === PermissionsAndroid.RESULTS.GRANTED
      const callLogGranted =
        granted["android.permission.READ_CALL_LOG"] === PermissionsAndroid.RESULTS.GRANTED

      if (phoneStateGranted && callLogGranted) {
        return true
      } else {
        return false
      }
    } catch (err) {
      console.warn(err)
      return false
    }
  }

  const requestPermission = async () => {
    const result = await requestCallPermissions()
    if (result) {
      const isEnabled = await callerID.androidRequestOverlayPermission()
      setEnabledOverlayPermission(isEnabled)
    }
  }

  const checkEnabledOverlayPermission = async () => {
    const result = await requestCallPermissions()
    const isEnabled = await callerID.isOverlayPermissionEnabled()
    setEnabledOverlayPermission(isEnabled && result)
  }

  // ---------------------------EFFECT-----------------------

  useEffect(() => {
    checkEnabledOverlayPermission()
  }, [])

  return {
    isEnabledOverlayPermission,
    requestPermission,
  }
}
