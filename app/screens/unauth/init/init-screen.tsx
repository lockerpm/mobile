import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Loading, Text } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { load, StorageKey } from "../../../utils/storage"
import NetInfo from "@react-native-community/netinfo"
import DeviceInfo from "react-native-device-info"
import { IS_IOS, IS_PROD } from "../../../config/constants"
import { Alert, BackHandler, Linking, View } from "react-native"
import { useMixins } from "../../../services/mixins"
import JailMonkey from "jail-monkey"
import { commonStyles } from "../../../theme"
import { useCipherAuthenticationMixins } from "../../../services/mixins/cipher/authentication"
import dynamicLinks from "@react-native-firebase/dynamic-links"
import { Logger } from "../../../utils/logger"
import VersionCheck from "react-native-version-check"
import Intercom from "@intercom/intercom-react-native"

export const InitScreen = observer(() => {
  const { user, cipherStore, uiStore } = useStores()
  const navigation = useNavigation()
  // const theme = Appearance.getColorScheme()
  const { boostrapPushNotifier, translate } = useMixins()
  const { handleDynamicLink } = useCipherAuthenticationMixins()

  // ------------------ METHODS ---------------------

  const [isRooted, setIsRooted] = useState(false)

  // ------------------ METHODS ---------------------

  // Handle go back
  const handleBack = (e) => {
    e.preventDefault()
    if (!IS_IOS) {
      BackHandler.exitApp()
    }
  }

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
        navigation.navigate("lock", { type: "onPremise" })
      } else {
        navigation.navigate("lock", { type: "individual" })
      }
    } else {
      navigation.navigate("createMasterPassword")
    }
  }

  // Check if open from autofill to select a list
  const checkAutoFill = async () => {
    if (IS_IOS) return false

    const autoFillData = await load(StorageKey.APP_FROM_AUTOFILL)
    if (autoFillData && autoFillData.enabled) {
      uiStore.setDeepLinkAction("fill", autoFillData.domain || "")
      uiStore.setIsFromAutoFill(true)
      return true
    }

    uiStore.setIsFromAutoFill(false)
    return false
  }

  // Check if open from autofill to select a SINGLE item
  const checkAutoFillItem = async () => {
    if (IS_IOS) return false

    const autoFillData = await load(StorageKey.APP_FROM_AUTOFILL_ITEM)
    if (autoFillData && autoFillData.enabled) {
      uiStore.setDeepLinkAction("fill_item", autoFillData.id || "")
      uiStore.setIsFromAutoFillItem(true)
      return true
    }

    uiStore.setIsFromAutoFillItem(false)
    return false
  }

  // Check if open from autofill to save new item
  const checkOnSaveLogin = async () => {
    if (IS_IOS) return false

    const loginData = await load(StorageKey.APP_FROM_AUTOFILL_ON_SAVE_REQUEST)
    if (loginData && loginData.enabled) {
      uiStore.setDeepLinkAction("save", {
        domain: loginData.domain,
        username: loginData.username,
        password: loginData.password,
      })
      uiStore.setIsOnSaveLogin(true)
      return true
    }

    uiStore.setIsOnSaveLogin(false)
    return false
  }

  // Mounted
  const mounted = async () => {
    if (checkTrustFall()) {
      return
    }

    await Intercom.logout()

    const connectionState = await NetInfo.fetch()

    // Setup basic data
    user.setLanguage(user.language)

    if (!user.deviceId) {
      user.setDeviceId(DeviceInfo.getUniqueId())
    }
    cipherStore.setIsSynching(false)

    // uiStore.setIsDark(false)

    // Reload FCM
    if (connectionState.isConnected) {
      await boostrapPushNotifier()
    }

    // Check autofill
    const isAutoFill = await checkAutoFill()

    // Check autofillItem
    const isAutoFillItem = await checkAutoFillItem()

    // Check savePassword
    const isOnSaveLogin = await checkOnSaveLogin()

    // Check App update
    !__DEV__ &&
      IS_PROD &&
      VersionCheck.needUpdate()
        .then(async (res) => {
          if (res.isNeeded) {
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
        })
        .catch((e) => {
          Logger.error(e)
        })

    // Check dynamic link
    const link = await dynamicLinks().getInitialLink()
    if (link) {
      Logger.debug(`DYNAMIC LINK INIT: ${JSON.stringify(link)}`)
      if (link.url) {
        const isNavigated = await handleDynamicLink(link.url, navigation)
        if (isNavigated) {
          return
        }
      }
    }

    // Logged in?
    if (!user.isLoggedIn) {
      if (!user.introShown && !isAutoFill && !isOnSaveLogin && !isAutoFillItem) {
        user.setIntroShown(true)
        navigation.navigate("intro")
      } else {
        navigation.navigate("onBoarding")
      }
      return
    }

    // Network connected? || Is autofill?
    if (!connectionState.isConnected || isAutoFill || isOnSaveLogin || isAutoFillItem) {
      goLockOrCreatePassword()
      return
    }

    // Session validated?
    if (!user.isLoggedIn) {
      navigation.navigate("login")
      return
    }

    if (user.onPremiseUser) {
      const res = await user.onPremisePreLogin(user.email)
      if (res.kind == "ok") {
        if (res.data[0].activated) {
          navigation.navigate("lock", {
            type: "onPremise",
            data: res.data[0],
            email: user.email,
          })
        }
        return
      }
    }

    const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])

    if (userRes.kind === "ok" && userPwRes.kind === "ok") {
      goLockOrCreatePassword()
    } else {
      navigation.navigate("login")
    }
  }
  // ------------------ EFFECTS ---------------------

  // NOTE: dont change this effect to navigation onFocus or it will mess up handleDynamicLink
  useEffect(() => {
    mounted()
  }, [])

  // Back handler
  useEffect(() => {
    navigation.addListener("beforeRemove", handleBack)
    const unsubscribe = navigation.addListener("focus", () => {
      setTimeout(() => {
        if (uiStore.firstRouteAfterInit) {
          navigation.navigate(uiStore.firstRouteAfterInit)
          uiStore.setFirstRouteAfterInit(null)
        }
      }, 1000)
    })
    return () => {
      unsubscribe()
      navigation.removeListener("beforeRemove", handleBack)
    }
  }, [navigation])

  // ------------------ RENDER ---------------------

  return (
    <View style={{ flex: 1 }}>
      {isRooted && (
        <View style={[commonStyles.CENTER_VIEW, commonStyles.SECTION_PADDING]}>
          <Text
            preset="black"
            text={translate("error.rooted_device")}
            style={{
              textAlign: "center",
            }}
          />
        </View>
      )}
      {!isRooted && <Loading />}
    </View>
  )
})
