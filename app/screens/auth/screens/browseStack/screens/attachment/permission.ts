/* eslint-disable react-native/split-platform-components */
import { Platform, PermissionsAndroid, Alert, Linking } from "react-native"

import { useAppLocale } from "@/i18n"
import { Logger } from "@/utils/logger"

export const usePermission = () => {
  const { translate } = useAppLocale()

  const handleUserDeniedPermission = (type: string, onCancel?: () => void) => {
    Alert.alert(
      translate("file_attachment:permission_denied"),
      translate("file_attachment:permission_denied_desc", {
        type,
      }),
      [
        {
          text: translate("common:cancel"),
          onPress: onCancel,
          style: "cancel",
        },
        {
          text: translate("file_attachment:go_setting"),
          onPress: () => Linking.openSettings(),
        },
      ]
    )
  }

  async function requestStoragePermission() {
    if (Platform.OS === "android" && Platform.Version < 30) {
      try {
        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: translate("file_attachment:android_permission.title"),
            message: translate("file_attachment:android_permission.message"),
            buttonNeutral: translate("file_attachment:android_permission.button_neutral"),
            buttonNegative: translate("common:cancel"),
            buttonPositive: "OK",
          }
        )
        if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Logger.debug("Permission set to never ask again.")
          showSettingsAlert()
          return false
        } else if (status === PermissionsAndroid.RESULTS.DENIED) {
          Logger.debug("Permission denied.")
          showSettingsAlert()
          return false
        } else {
          Logger.debug("Permission granted.")
          return true
        }
      } catch (err) {
        console.warn(err)
        return false
      }
    }
    return true
  }

  function showSettingsAlert() {
    Alert.alert(
      translate("file_attachment:android_permission.allert_title"),
      translate("file_attachment:android_permission.allert_sub"),
      [
        { text: translate("common:cancel"), style: "cancel" },
        {
          text: translate("file_attachment:go_setting"),
          onPress: () => Linking.openSettings(),
        },
      ]
    )
  }

  return {
    requestStoragePermission,
    handleUserDeniedPermission,
  }
}
