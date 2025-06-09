import React, { useState, useRef, useCallback } from "react"
import { StyleSheet, View } from "react-native"
import { Text, Button, Icon, BottomModalContainer } from "app/components/cores"
import { useStores } from "app/models"
import { useAppLocale, useTheme } from "app/services/context"
import { RecaptchaChecker, RecaptchaCheckerRef } from "app/components/utils"
import { useToast } from "app/services/utils"
import { User2FAMethod, User2FAPasswordConfig } from "app/static/types"

type Props = {
  credential: User2FAPasswordConfig
  onSelect: (method: User2FAMethod) => void
}

export const MethodSelection = (props: Props) => {
  const { user } = useStores()
  const { translate } = useAppLocale()
  const { notifyApiError } = useToast()
  const { credential, onSelect } = props

  const captchaRef = useRef<RecaptchaCheckerRef>(null)

  // ------------------ Params -----------------------

  const [sendingEmail, setIsSendingEmail] = useState(false)

  // ------------------ Methods ----------------------

  const getCaptchaToken = useCallback(async () => {
    return await captchaRef.current?.waitForToken()
  }, [])

  const sendEmail = async (data: any, captchaToken = "") => {
    setIsSendingEmail(true)
    const res = await user.sendOtpEmail(credential.username, credential.password, captchaToken)
    setIsSendingEmail(false)
    if (res.kind === "ok") {
      onSelect({
        type: "mail",
        data,
      })
    } else {
      notifyApiError(res)
    }
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <BottomModalContainer style={styles.container}>
      <RecaptchaChecker ref={captchaRef} />

      <Text preset="bold" size="xl" tx={"login.verify_your_identity"} style={styles.title} />

      <Text tx="login.select_method" style={styles.label} />

      {credential.methods.map((item, index) => (
        <Button
          key={index}
          preset="secondary"
          disabled={item.type === "mail" && sendingEmail}
          loading={item.type === "mail" && sendingEmail}
          onPress={() =>
            item.type === "mail"
              ? getCaptchaToken().then((token) => sendEmail(item.data, token))
              : onSelect(item)
          }
          style={styles.button}
        >
          {item.type === "mail" && (
            <OptionContent title={`Email ${item.data}`} icon="envelope-simple" />
          )}
          {item.type === "smart_otp" && (
            <OptionContent title={translate("common.authentication_app")} icon="device-mobile" />
          )}
        </Button>
      ))}
    </BottomModalContainer>
  )
}

type OptionsParams = {
  title: string
  icon: "envelope-simple" | "device-mobile"
}
const OptionContent = ({ title, icon }: OptionsParams) => {
  const { colors } = useTheme()
  return (
    <View style={styles.optionsContainer}>
      <Icon icon={icon} color={colors.primary} />
      <Text
        style={{
          color: colors.primary,
          marginLeft: 12,
        }}
        text={title}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 12,
    width: "100%",
  },
  container: {
    marginHorizontal: 16,
    paddingBottom: 16,
  },
  label: {
    marginBottom: 12,
  },
  optionsContainer: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    justifyContent: "flex-start",
    padding: 8,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
})
