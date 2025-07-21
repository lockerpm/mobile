import { FC, useState, useEffect, useCallback } from "react"
import { StyleSheet, View } from "react-native"
import DeviceInfo from "react-native-device-info"
import JailMonkey from "jail-monkey"
import { useStores } from "app/models"
import { Text, Screen } from "app/components/cores"
import { LockType } from "app/static/types"
import { useAppUpdate } from "./useAppUpdate"
import { useToast } from "app/services/utils"
import { idApi } from "app/services/api"
import { AppScreenProps } from "@/navigators"
import { MotionLoading } from "@/components/utils"

/**
 * Init screen for the app, checks if the device is rooted/jailbroken,
 * Don't need to wrap component with observer, It use data on store only once
 * @param param0
 * @returns
 */
export const SplashScreen: FC<AppScreenProps<"init">> = ({ navigation }) => {
  const { user, uiStore } = useStores()
  const { notifyApiError } = useToast()

  // -------------- PARAMS ---------------------
  const [isRooted, setIsRooted] = useState(false)

  /**
   * Check if the device is rooted/jailbroken
   * If it is, set isRooted state to true and show a message
   * @returns boolean
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const checkTrustFall = () => {
    const trustfall = JailMonkey.isJailBroken()
    setIsRooted(trustfall)
    return trustfall
  }

  const navigateToLogin = () => {
    navigation.replace("unAuthStack", {
      screen: "loginStack",
      params: {
        screen: "login",
        params: {
          email: user.email ?? "",
        },
      },
    })
  }

  /**
   * If user is not on-premise user, navigate to login screen
   * If user is on-premise user but not activated, navigate to login screen
   * If user is on-premise user and activated, navigate to lock screen
   * @returns
   */
  const navigateToOnPremiseLogin = async () => {
    if (user.email) {
      const res = await idApi.onPremisePreLogin({ email: user.email })
      if (res.kind === "ok") {
        if (res.data.length > 0 && res.data[0].activated) {
          navigation.replace("lock", {
            type: LockType.OnPremise,
            data: res.data[0],
            email: user.email,
          })
        }
      } else {
        notifyApiError(res)
      }
      return
    }
    navigateToLogin()
  }

  /**
   * If the user is not logged in,  navigate to the Login screen
   * If the user is logged in, it will navigate to the Lock screen with the type Individual
   * If the user is unauthorized, it will notify the user with an error and back to the Login screen
   */
  const navigateToNormalLogin = async () => {
    const userRes = await user.getUser()
    if (
      ["ok", "unauthorized", "timeout", "cannot-connect", "network-error"].includes(userRes.kind)
    ) {
      if (userRes.kind !== "ok") {
        notifyApiError(userRes)
      }
      navigation.replace("lock", { type: LockType.Individual })
    } else {
      navigateToLogin()
    }
  }

  const mounted = useCallback(async () => {
    // if (checkTrustFall()) {
    //   return
    // }

    if (!user.deviceId) {
      user.setDeviceId(await DeviceInfo.getUniqueId())
    }

    /**
     * If the user is not logged in, navigate to the Intro screen
     * If the Intro screen was showned, navigate to the OnBoarding screen
     */
    if (!user.isLoggedIn) {
      if (!uiStore.isShowedAppInto) {
        navigation.replace("unAuthStack", {
          screen: "intro",
        })
        return
      }

      navigation.replace("unAuthStack", {
        screen: "onBoarding",
      })
      return
    }

    /**
     * If the user is logged in, check if the user is a password manager
     * If the user is a password manager, navigate to the OnPremiseLogin or NormalLogin screen
     * If the user is not a password manager, navigate to the CreateMasterPassword screen
     */
    if (user.is_pwd_manager) {
      if (user.onPremiseUser) {
        await navigateToOnPremiseLogin()
      } else {
        await navigateToNormalLogin()
      }
      return
    }

    navigation.replace("unAuthStack", {
      screen: "createMasterPassword",
    })
  }, [])

  useAppUpdate()

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", mounted)
    return unsubscribe
  }, [navigation, mounted])

  return (
    <Screen disableAvoidkeyboard contentContainerStyle={$container}>
      {isRooted && (
        <View style={styles.rootContainer}>
          <Text tx={"error:rooted_device"} style={styles.centerText} />
        </View>
      )}
      {!isRooted && <MotionLoading />}
    </Screen>
  )
}

const $container = {
  flex: 1,
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: "center",
  },
  rootContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
})
