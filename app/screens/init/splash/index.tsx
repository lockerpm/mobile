import React, { FC, useState } from "react"
import { StyleSheet, View } from "react-native"
import NetInfo from "@react-native-community/netinfo"
import DeviceInfo from "react-native-device-info"
import JailMonkey from "jail-monkey"
import { useStores } from "app/models"
import { Text } from "app/components/cores"
import { MotionLoading } from "app/components/utils"
import { observer } from "mobx-react-lite"
import { RootStackScreenProps } from "app/navigators/navigators.types"
import { useAppLocale, useTheme } from "app/services/context"
import { LockType } from "app/static/types"
import { useAppUpdate } from "./useAppUpdate"
import { LanguageSupportType } from "app/i18n"

export const SplashScreen: FC<RootStackScreenProps<"init">> = observer(({ navigation }) => {
  const { setLanguage } = useAppLocale()
  const { colors } = useTheme()
  const { user } = useStores()

  // ------------------ METHODS ---------------------

  const [isRooted, setIsRooted] = useState(false)

  // ------------------ METHODS ---------------------

  // Check jailbreak/rooted
  const checkTrustFall = () => {
    const trustfall = JailMonkey.isJailBroken()
    setIsRooted(trustfall)
    return trustfall
  }

  // Create master pass or unlock
  const goLockOrCreatePassword = () => {
    if (user.is_pwd_manager) {
      if (user.onPremiseUser) {
        navigation.replace("lock", { type: LockType.OnPremise })
      } else {
        navigation.replace("lock", { type: LockType.Individual })
      }
    } else {
      navigation.replace("unAuthStack", {
        screen: "createMasterPassword",
      })
    }
  }

  // Mounted
  const mounted = async () => {
    if (checkTrustFall()) {
      return
    }
    const connectionState = await NetInfo.fetch()

    // Setup basic data
    setLanguage(user.language as LanguageSupportType)

    if (!user.deviceId) {
      user.setDeviceId(await DeviceInfo.getUniqueId())
    }

    // Logged in?
    if (!user.isLoggedIn) {
      if (!user.introShown) {
        user.setIntroShown(true)
        navigation.replace("unAuthStack", {
          screen: "intro",
        })
      } else {
        navigation.replace("unAuthStack", {
          screen: "onBoarding",
        })
      }
      return
    }

    // Network connected?
    if (!connectionState.isConnected) {
      goLockOrCreatePassword()
      return
    }

    if (user.onPremiseUser) {
      const res = await user.onPremisePreLogin({ email: user.email })
      if (res.kind === "ok") {
        if (res.data[0].activated) {
          navigation.replace("lock", {
            type: LockType.OnPremise,
            data: res.data[0],
            email: user.email,
          })
        } else {
          navigation.replace("unAuthStack", {
            screen: "loginStack",
          })
        }
        return
      }
    }

    const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
    if (
      ["ok", "unauthorized"].includes(userRes.kind) &&
      ["ok", "unauthorized"].includes(userPwRes.kind)
    ) {
      goLockOrCreatePassword()
    } else {
      navigation.replace("unAuthStack", {
        screen: "loginStack",
      })
    }
  }
  // ------------------ EFFECTS ---------------------
  useAppUpdate()

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      mounted()
    })

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe
  }, [navigation])

  // ------------------ RENDER ---------------------

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isRooted && (
        <View style={styles.rootContainer}>
          <Text tx={"error.rooted_device"} style={styles.centerText} />
        </View>
      )}
      {!isRooted && <MotionLoading />}
    </View>
  )
})

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
