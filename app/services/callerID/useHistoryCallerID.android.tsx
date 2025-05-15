import { useCallback, useEffect, useState } from "react"
import { PermissionsAndroid } from "react-native"

const requestHistoryCallPermissions = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    ])

    const contactGranted =
      granted["android.permission.READ_CONTACTS"] === PermissionsAndroid.RESULTS.GRANTED
    const callLogGranted =
      granted["android.permission.READ_CALL_LOG"] === PermissionsAndroid.RESULTS.GRANTED

    if (contactGranted && callLogGranted) {
      return true
    } else {
      return false
    }
  } catch (err) {
    console.warn(err)
    return false
  }
}

const checkHistoryCallPermissions = async (): Promise<boolean> => {
  try {
    const contactGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    )

    const callLogGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    )

    return contactGranted && callLogGranted
  } catch (err) {
    console.warn("Permission check error:", err)
    return false
  }
}
export const useHistoryCallerID = () => {
  const [isPermissionEnabled, setIsPermissionEnabled] = useState(false)
  const checkEnabledPermission = useCallback(async () => {
    const result = await checkHistoryCallPermissions()
    setIsPermissionEnabled(result)
  }, [])

  const requestEnabledPermission = useCallback(async () => {
    const result = await requestHistoryCallPermissions()
    setIsPermissionEnabled(result)
  }, [])

  useEffect(() => {
    checkEnabledPermission()
  }, [])

  return {
    isPermissionEnabled,
    requestEnabledPermission,
  }
}
