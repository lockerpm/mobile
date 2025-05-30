import { IS_PROD } from "app/config/constants"
import { useAppLocale } from "app/services/context"
import { Logger } from "app/utils/utils"
import React from "react"
import { Alert, Linking } from "react-native"
import VersionCheck from "react-native-version-check"

/**
 * Hook to check for app updates
 * It checks if the app is in production mode and not in development mode.
 * If an update is needed, it shows an alert to the user with options to update now or later.
 */
export const useAppUpdate = () => {
  const { translate } = useAppLocale()

  const checkAppUpdate = () => {
    !__DEV__ &&
      IS_PROD &&
      VersionCheck.needUpdate()
        .then(async (res) => {
          const showAlert = () => {
            Alert.alert(
              translate("alert.update.title"),
              translate("alert.update.content", { version: res.latestVersion }),
              [
                {
                  text: translate("alert.update.later"),
                  style: "cancel",
                  onPress: () => null,
                },
                {
                  text: translate("alert.update.now"),
                  style: "destructive",
                  onPress: async () => {
                    Linking.openURL(res.storeUrl) // open store if update is needed.
                  },
                },
              ],
            )
          }

          const { currentVersion, latestVersion } = res
          try {
            if (parseFloat(currentVersion) < parseFloat(latestVersion)) {
              showAlert()
            }
          } catch (e) {
            if (res.isNeeded) {
              showAlert()
            }
          }
        })
        .catch((e) => {
          Logger.error(e)
        })
  }

  React.useEffect(() => {
    checkAppUpdate()
  }, [])
}
