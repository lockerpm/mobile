import React, { FC, useEffect, useState } from "react"
import { Alert, Linking, View } from "react-native"

import VersionCheck from "react-native-version-check"
import dynamicLinks from "@react-native-firebase/dynamic-links"
import NetInfo from "@react-native-community/netinfo"
import DeviceInfo from "react-native-device-info"
import JailMonkey from "jail-monkey"

import { RootStackScreenProps } from "app/navigators/navigators.types"
import { useStores } from "app/models"
import { load, StorageKey } from "app/utils/storage"
import { Logger } from "app/utils/utils"
import { useAuthentication, useHelper } from "app/services/hook"
import { Text } from "app/components/cores"
import { Loading } from "app/components/utils"
import { observer } from "mobx-react-lite"
import { LoginMethod } from "app/static/types"
import { IS_IOS } from "app/config/constants"

export const InitScreen: FC<RootStackScreenProps<"init">> = observer((props) => {
  const { translate } = useHelper()
  const { user, cipherStore, uiStore } = useStores()
  const navigation = props.navigation

  const { boostrapPushNotifier } = useHelper()
  const { handleDynamicLink } = useAuthentication()

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
      navigation.navigate("lock", { type: LoginMethod.PASSWORD })
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

  const checkAppUpdate = () => {
    !__DEV__ &&
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
  }

  // Mounted
  const mounted = async () => {
    if (checkTrustFall()) {
      return
    }

    const connectionState = await NetInfo.fetch()

    // Setup basic data
    user.setLanguage(user.language)

    if (!user.deviceId) {
      user.setDeviceId(await DeviceInfo.getUniqueId())
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

    checkAppUpdate()

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

    const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
    if (
      ["ok", "unauthorized"].includes(userRes.kind) &&
      ["ok", "unauthorized"].includes(userPwRes.kind)
    ) {
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

  // ------------------ RENDER ---------------------

  return (
    <View style={{ flex: 1 }}>
      {isRooted && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <Text
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
