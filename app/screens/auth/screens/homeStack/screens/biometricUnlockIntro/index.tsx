import { FC, useEffect, useState } from "react"
import { View, Image, TouchableOpacity, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import ReactNativeBiometrics from "react-native-biometrics"

import { Button, Screen, Text } from "app/components/cores"
import { useStores } from "app/models"
import { HomeScreenProps } from "app/navigators"
import { useCoreService } from "app/services/coreService"
import { useBiometricType, useToast } from "app/services/utils"

import { useAppLocale } from "@/i18n"
import { autofillKeyChain } from "@/utils/autofill.ios"

const FACEID = require("assets/images/intro/faceid.png")

const rn = new ReactNativeBiometrics()
export const BiometricUnlockIntroScreen: FC<HomeScreenProps<"biometricUnlockIntro">> = observer(
  ({ navigation }) => {
    const { cryptoService } = useCoreService()
    const { user } = useStores()
    const { notifyTx } = useToast()
    const { lang } = useAppLocale()
    const { isBiometricAvailable } = useBiometricType()

    // ----------------------- PARAMS ----------------------

    const [isLoading, setIsLoading] = useState(false)

    // ----------------------- METHODS ----------------------

    const handleUseBiometric = async () => {
      setIsLoading(true)
      const available = await isBiometricAvailable()

      if (!available) {
        notifyTx("error", "error:biometric_not_support")
        setIsLoading(false)
        return
      }

      const { success } = await rn.simplePrompt({
        promptMessage: "Verify FaceID/TouchID",
      })
      if (!success) {
        notifyTx("error", "error:biometric_unlock_failed")
        setIsLoading(false)
        return
      }

      await _updateAutofillFaceIdSetting()
      notifyTx("success", "success:biometric_enabled")
      user.setBiometricIntroShown(true)
      setIsLoading(false)
      navigation.replace("mainTab", { screen: "homeTab" })
    }

    const handleSkip = async () => {
      user.setBiometricIntroShown(true)
      navigation.replace("mainTab", { screen: "homeTab" })
    }

    const _updateAutofillFaceIdSetting = async () => {
      user.setBiometricUnlock(true)
      const hashPasswordAutofill = await cryptoService.getAutofillKeyHash()
      await autofillKeyChain.saveUserInfo({
        email: user.email || "",
        avatar: user.avatar || "",
        hashPass: hashPasswordAutofill || "",
        token: user.apiToken || "",
        language: lang || "en",

        faceIdEnabled: true,
        isFree: user.isFreePlan,
      })
    }

    // ----------------------- EFFECT ----------------------

    useEffect(() => {
      const handleBack = (e: any) => {
        if (!["POP", "GO_BACK"].includes(e.data.action.type)) {
          navigation.dispatch(e.data.action)
          return
        }

        e.preventDefault()
        navigation.navigate("mainTab", { screen: "homeTab" })
      }

      navigation.addListener("beforeRemove", handleBack)

      return () => {
        navigation.removeListener("beforeRemove", handleBack)
      }
    }, [navigation])

    // ----------------------- RENDER ----------------------

    return (
      <Screen
        safeAreaEdges={["top", "bottom"]}
        contentContainerStyle={styles.container}
        footer={
          <View style={styles.ph16}>
            <Button
              disabled={isLoading}
              loading={isLoading}
              tx={"biometric_intro:use_btn"}
              onPress={handleUseBiometric}
              style={styles.button}
            />

            <TouchableOpacity onPress={handleSkip} style={styles.later}>
              <Text preset="bold" tx={"biometric_intro:later_btn"} style={styles.centerText} />
            </TouchableOpacity>
          </View>
        }
      >
        <Image source={FACEID} resizeMode="contain" style={styles.logo} />

        <Text preset="bold" size="xl" tx={"biometric_intro:title"} style={styles.title} />

        <Text style={styles.desc} tx={"biometric_intro:desc"} />
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  button: {
    marginBottom: 10,
    marginTop: 30,
    width: "100%",
  },
  centerText: {
    textAlign: "center",
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  desc: { maxWidth: "90%", textAlign: "center" },
  later: {
    marginTop: 12,
    width: "100%",
  },
  logo: {
    height: 216,
    width: 242,
  },
  ph16: {
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 10,
    marginTop: 30,
    textAlign: "center",
  },
})
