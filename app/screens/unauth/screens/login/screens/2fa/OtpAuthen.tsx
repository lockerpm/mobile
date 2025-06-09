import React, { useState } from "react"
import { StyleSheet, TouchableOpacity, View } from "react-native"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { useAppLocale } from "app/services/context"
import { Text, Button, TextInput, Icon, Toggle, BottomModalContainer } from "app/components/cores"
import { useToast } from "app/services/utils"
import { User2FAMethod, User2FAPasswordConfig, User2FAPincodeConfig } from "app/static/types"
import { useLoggedIn } from "../../../hook/useLoggedIn"

type Props = {
  params:
    | {
        type: "password"
        credential: User2FAPasswordConfig
      }
    | {
        type: "pincode"
        credential: User2FAPincodeConfig
      }
  goBack: () => void
  method: User2FAMethod
}

export const OtpAuthen = ({ params, goBack, method }: Props) => {
  const { credential, type } = params
  const { user } = useStores()
  const { setApiTokens } = useHelper()
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [saveDevice, setSaveDevice] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // ------------------ Methods ----------------------
  const { onLoggedIn } = useLoggedIn()

  const handleAuthenticate = async () => {
    setIsLoading(true)
    if (type === "password") {
      const res = await user.login(
        {
          username: credential.username,
          password: credential.password,
          method: method.type,
          otp,
          save_device: saveDevice,
        },
        true,
      )
      if (res.kind === "ok") {
        if ("access_token" in res.data) {
          setApiTokens(res.data.access_token)
        }
        onLoggedIn()
      } else {
        notifyApiError(res)
      }
    } else {
      const res = await user.loginPinCode2FA({
        nonce: credential.nonce,
        code: credential.code,
        method: method.type,
        otp,
        save_device: saveDevice,
      })
      if (res.kind === "ok") {
        if ("access_token" in res.data) {
          setApiTokens(res.data.access_token)
        }
        onLoggedIn()
      } else {
        notifyApiError(res)
      }
    }

    setIsLoading(false)
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <BottomModalContainer style={styles.container}>
      <View style={styles.header}>
        <Icon icon="arrow-left" onPress={goBack} />
        <Text preset="bold" size="xl" text={translate("login.enter_code")} />
        <View style={styles.headerRightHolder} />
      </View>

      <Text
        text={
          method.type === "mail"
            ? translate("login.from_email", { email: method.data })
            : translate("login.from_authenticator")
        }
        style={styles.title}
      />

      <TextInput
        isError={!!errorMessage}
        helper={errorMessage}
        placeholderTx={"login.enter_code_here"}
        value={otp}
        onChangeText={(val) => {
          if (errorMessage) {
            setErrorMessage("")
          }
          setOtp(val)
        }}
        onSubmitEditing={handleAuthenticate}
      />

      <TouchableOpacity style={styles.saveDevice} onPress={() => setSaveDevice(!saveDevice)}>
        <Toggle variant="checkbox" value={saveDevice} onValueChange={setSaveDevice} />
        <Text tx="login.save_device" style={styles.saveDeviceText} />
      </TouchableOpacity>

      <Button
        loading={isLoading}
        disabled={isLoading || !otp}
        text={translate("common.authenticate")}
        onPress={handleAuthenticate}
        style={styles.button}
      />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
  },
  container: {
    paddingHorizontal: 16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerRightHolder: {
    height: 24,
    width: 24,
  },
  saveDevice: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 16,
  },
  saveDeviceText: {
    marginLeft: 8,
  },
  title: {
    marginBottom: 12,
    marginTop: 16,
  },
})
