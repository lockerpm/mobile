import { useCallback, useEffect } from "react"
import { Alert, Linking } from "react-native"
import VersionCheck from "react-native-version-check"
import Config from "@/config"
import { useAppLocale } from "@/i18n"
import { Logger } from "@/utils/logger"

/**
 * Hook to check for app updates
 * It checks if the app is in production mode and not in development mode.
 * If an update is needed, it shows an alert to the user with options to update now or later.
 */
export const useAppUpdate = () => {
  const { translate } = useAppLocale()

  const checkAppUpdate = useCallback(() => {
    if (__DEV__ || !Config.IS_PROD) {
      // Skip update check in development mode or if not in production.
      return
    }

    VersionCheck.needUpdate()
      .then(async (res) => {
        const showAlert = () => {
          Alert.alert(
            translate("alert:update.title"),
            translate("alert:update.content", { version: res.latestVersion }),
            [
              {
                text: translate("alert:update.later"),
                style: "cancel",
                onPress: () => null,
              },
              {
                text: translate("alert:update.now"),
                style: "destructive",
                onPress: async () => {
                  Linking.openURL(res.storeUrl) // open store if update is needed.
                },
              },
            ]
          )
        }

        if (res.isNeeded) {
          showAlert()
        } else {
          const { currentVersion, latestVersion } = res
          try {
            if (parseFloat(currentVersion) < parseFloat(latestVersion)) {
              showAlert()
            }
          } catch (e: any) {
            Logger.error(e)
          }
        }
      })
      .catch((e) => {
        Logger.error(e)
      })
  }, [])

  useEffect(() => {
    checkAppUpdate()
  }, [checkAppUpdate])
}
