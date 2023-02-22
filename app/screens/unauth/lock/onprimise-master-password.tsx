import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Alert, BackHandler, View } from "react-native"
import { AutoImage as Image, Button, Layout, Text, FloatingInput } from "../../../components"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { commonStyles, fontSize } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { APP_ICON } from "../../../common/mappings"
import MaterialCommunityIconsIcon from "react-native-vector-icons/MaterialCommunityIcons"
import { useCipherAuthenticationMixins } from "../../../services/mixins/cipher/authentication"
import { IS_IOS } from "../../../config/constants"
import ReactNativeBiometrics from "react-native-biometrics"
import { OnPremisePreloginData } from "../../../services/api"
import { LanguagePicker } from "../../../components/utils"

interface Props {
  data: OnPremisePreloginData
  email: string
  masterPassword: string
  setMasterPassword: (val: string) => void
}

export const LockByMasterPassword = observer((props: Props) => {
  const { masterPassword, setMasterPassword, data, email } = props
  const navigation = useNavigation()
  const { user, uiStore } = useStores()
  const { notify, translate, notifyApiError, color } = useMixins()
  const { logout, sessionLogin, biometricLogin } = useCipherAuthenticationMixins()

  // ---------------------- PARAMS -------------------------
  const [isScreenLoading, setIsScreenLoading] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [isBioUnlocking, setIsBioUnlocking] = useState(false)
  const [isError, setIsError] = useState(false)
  const [biometryType, setBiometryType] = useState<"faceid" | "touchid" | "biometric">("biometric")

  const [credential, setCredential] = useState({
    username: "",
    password: "",
    methods: [],
  })
  const [method, setMethod] = useState("")
  const [partialEmail, setPartialEamil] = useState("")

  // ---------------------- METHODS -------------------------

  const isAutofillAnroid =
    uiStore.isFromAutoFill || uiStore.isOnSaveLogin || uiStore.isFromAutoFillItem

  // ---------------------- METHODS -------------------------

  const handleLogout = async () => {
    setIsScreenLoading(true)
    await logout()
    setIsScreenLoading(false)
    navigation.navigate("login")
  }

  const handleUnlock = async () => {
    if (masterPassword) {
      setIsError(false)
      setIsUnlocking(true)
      const res = await sessionLogin(masterPassword, () => null, true)
      setIsUnlocking(false)
      if (res.kind === "ok") {
        setMasterPassword("")
        navigation.navigate("mainStack", { screen: "start" })
      } else if (res.kind === "unauthorized") {
        navigation.navigate("login")
      } else if (res.kind === "enterprise-lock") {
        Alert.alert("", translate("alert.enterprise_lock"), [
          {
            text: translate("common.ok"),
            style: "cancel",
            onPress: () => null,
          },
        ])
      } else if (res.kind === "enterprise-system-lock") {
        Alert.alert("", translate("alert.enterprise_system_lock"), [
          {
            text: translate("common.ok"),
            style: "cancel",
            onPress: () => null,
          },
        ])
      } else {
        setIsError(true)
      }
    } else {
      setIsError(true)
    }
  }

  const handleUnlockBiometric = async () => {
    if (!user.isBiometricUnlock) {
      notify("error", translate("error.biometric_not_enable"))
      return
    }
    setIsBioUnlocking(true)
    const res = await biometricLogin()
    setIsBioUnlocking(false)
    if (res.kind === "ok") {
      setMasterPassword("")
      navigation.navigate("mainStack", { screen: "start" })
    }
  }

  // Detect biometric type
  const detectbiometryType = async () => {
    const { biometryType } = await ReactNativeBiometrics.isSensorAvailable()
    if (biometryType === ReactNativeBiometrics.TouchID) {
      setBiometryType("touchid")
    } else if (biometryType === ReactNativeBiometrics.FaceID) {
      setBiometryType("faceid")
    }
  }

  // ---------------------- COMPONENTS -------------------------

  // -------------- EFFECT ------------------

  // Auto trigger face id / touch id + detect biometry type
  useEffect(() => {
    detectbiometryType()

    if (user.isBiometricUnlock) {
      handleUnlockBiometric()
    }
  }, [])

  // Handle back press
  useEffect(() => {
    const handleBack = (e) => {
      if (!["POP", "GO_BACK"].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()

      if (!IS_IOS && isAutofillAnroid) {
        BackHandler.exitApp()
        return
      }

      Alert.alert(translate("alert.logout") + user.email + "?", "", [
        {
          text: translate("common.cancel"),
          style: "cancel",
          onPress: () => null,
        },
        {
          text: translate("common.logout"),
          style: "destructive",
          onPress: async () => {
            await logout()
            navigation.navigate("login")
          },
        },
      ])
    }

    navigation.addListener("beforeRemove", handleBack)

    return () => {
      navigation.removeListener("beforeRemove", handleBack)
    }
  }, [navigation])

  // ---------------------- RENDER -------------------------

  const DefaultLogin = () => (
    <View style={{flex: 1}}>
      <View style={{ alignItems: "flex-end", marginTop: 8 }}>
        {isAutofillAnroid ? (
          <Button
            text={translate("common.cancel").toUpperCase()}
            textStyle={{ fontSize: fontSize.p }}
            preset="link"
            onPress={() => BackHandler.exitApp()}
          />
        ) : (
          <Button
            text={translate("common.logout").toUpperCase()}
            textStyle={{ fontSize: fontSize.p }}
            preset="link"
            onPress={handleLogout}
          />
        )}
      </View>
      <View style={{ alignItems: "center", paddingTop: "10%" }}>
        <Image source={APP_ICON.icon} style={{ height: 63, width: 63 }} />

        <Text preset="header" style={{ marginBottom: 10, marginTop: 25 }} tx={"lock.title"} />

        <Text style={{ textAlign: "center" }} tx={"lock.desc"} />

        {/* Current user */}
        <View
          style={{
            marginTop: 16,
            marginBottom: 16,
            borderRadius: 20,
            backgroundColor: color.block,
            flexDirection: "row",
            alignItems: "center",
            padding: 4,
          }}
        >
          {!!user.avatar && (
            <View style={{ borderRadius: 14, overflow: "hidden" }}>
              <Image
                source={{ uri: user.avatar }}
                style={{
                  height: 28,
                  width: 28,
                  backgroundColor: color.white,
                }}
              />
            </View>
          )}
          {!!data?.avatar && (
            <View style={{ borderRadius: 14, overflow: "hidden" }}>
              <Image
                source={{ uri: data.avatar }}
                style={{
                  height: 28,
                  width: 28,
                  backgroundColor: color.white,
                }}
              />
            </View>
          )}
          <Text
            style={{
              fontSize: fontSize.small,
              color: color.title,
              marginHorizontal: 10,
            }}
          >
            {user.email || email}
          </Text>
        </View>
        {/* Current user end */}

        {/* Master pass input */}
        <FloatingInput
          isPassword
          isInvalid={isError}
          label={translate("common.master_pass")}
          onChangeText={setMasterPassword}
          value={masterPassword}
          style={{ width: "100%" }}
          onSubmitEditing={handleUnlock}
        />
        {/* Master pass input end */}

        <Button
          isLoading={isUnlocking}
          isDisabled={isUnlocking || !masterPassword}
          text={translate("common.unlock")}
          onPress={handleUnlock}
          style={{
            width: "100%",
            marginTop: 20,
          }}
        />

        <Button
          // isLoading={isBioUnlocking}
          isDisabled={isBioUnlocking}
          preset="ghost"
          onPress={handleUnlockBiometric}
          style={{
            width: "100%",
            marginVertical: 10,
          }}
        >
          <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { marginHorizontal: 5 }]}>
            <MaterialCommunityIconsIcon
              name={biometryType === "faceid" ? "face-recognition" : "fingerprint"}
              size={20}
              color={color.textBlack}
            />
            <Text
              preset="black"
              text={translate(`common.${biometryType}_unlocking`)}
              style={{ marginLeft: 7 }}
            />
          </View>
        </Button>
      </View>
    </View>
  )

  return (
    <Layout isOverlayLoading={isScreenLoading}>
      <LanguagePicker />
    </Layout>
  )
})
