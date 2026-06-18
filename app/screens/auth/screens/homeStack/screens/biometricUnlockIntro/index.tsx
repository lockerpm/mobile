import { FC, useEffect, useState } from "react"
import { View, Image, TouchableOpacity, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"

import { Button, Screen, Text } from "app/components/cores"
import { useStores } from "app/models"
import { HomeScreenProps } from "app/navigators"
import { useCoreService } from "app/services/coreService"
import { getDeviceAuthCapabilities, promptDeviceAuth, useToast } from "app/services/utils"

import { useAppLocale } from "@/i18n"
import { autofillKeyChain } from "@/utils/autofill.ios"

const FACEID = require("assets/images/intro/faceid.png")

export const BiometricUnlockIntroScreen: FC<HomeScreenProps<"biometricUnlockIntro">> = observer(
  ({ navigation }) => {
    const { cryptoService } = useCoreService()
    const { user } = useStores()
    const { notifyTx } = useToast()
    const { lang, translate } = useAppLocale()

    // ----------------------- PARAMS ----------------------

    const [isLoading, setIsLoading] = useState(false)
    const [hasBiometric, setHasBiometric] = useState(true)
    const [hasDevicePasscode, setHasDevicePasscode] = useState(false)

    // ----------------------- METHODS ----------------------

    const handleUseBiometric = async () => {
      setIsLoading(true)
      const { hasBiometric, hasDevicePasscode } = await getDeviceAuthCapabilities()

      if (!hasBiometric && !hasDevicePasscode) {
        notifyTx("error", "error:biometric_not_support")
        setIsLoading(false)
        return
      }

      const { success, error } = await promptDeviceAuth({
        promptMessage: translate("common:unlock_locker"),
        allowDeviceCredential: true,
        fallbackLabel: translate("common:use_device_passcode"),
      })
      if (!success) {
        if (error !== "user_cancel" && error !== "system_cancel") {
          notifyTx(
            "error",
            hasBiometric ? "error:biometric_unlock_failed" : "error:device_passcode_unlock_failed"
          )
        }
        setIsLoading(false)
        return
      }

      await _updateAutofillFaceIdSetting()
      notifyTx(
        "success",
        hasBiometric ? "success:biometric_enabled" : "success:device_passcode_enabled"
      )
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
      getDeviceAuthCapabilities().then((caps) => {
        setHasBiometric(caps.hasBiometric)
        setHasDevicePasscode(caps.hasDevicePasscode)
      })
    }, [])

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
            {(hasBiometric || hasDevicePasscode) && (
              <Button
                disabled={isLoading}
                loading={isLoading}
                tx={hasBiometric ? "biometric_intro:use_btn" : "biometric_intro:use_btn_passcode"}
                onPress={handleUseBiometric}
                style={styles.button}
              />
            )}

            <TouchableOpacity onPress={handleSkip} style={styles.later}>
              <Text preset="bold" tx={"biometric_intro:later_btn"} style={styles.centerText} />
            </TouchableOpacity>
          </View>
        }
      >
        <Image source={FACEID} resizeMode="contain" style={styles.logo} />

        <Text
          preset="bold"
          size="xl"
          tx={hasBiometric ? "biometric_intro:title" : "biometric_intro:title_passcode"}
          style={styles.title}
        />

        <Text
          style={styles.desc}
          tx={hasBiometric ? "biometric_intro:desc" : "biometric_intro:desc_passcode"}
        />
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
