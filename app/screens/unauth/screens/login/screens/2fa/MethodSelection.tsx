import { useState, useRef, useCallback } from "react"
import { ActivityIndicator, StyleSheet, View, ViewStyle } from "react-native"
import { Text, Icon, BottomModalContainer, PressableScale } from "app/components/cores"
import { useStores } from "app/models"
import { RecaptchaChecker, RecaptchaCheckerRef } from "app/components/utils"
import { useToast } from "app/services/utils"
import { User2FAMethod, User2FAPasswordConfig } from "app/static/types"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

type Props = {
  credential: User2FAPasswordConfig
  onSelect: (method: User2FAMethod) => void
}

export const MethodSelection = (props: Props) => {
  const { user } = useStores()
  const { themed } = useAppTheme()
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

      <Text preset="bold" size="xl" tx={"login:verify_your_identity"} style={styles.title} />

      <Text tx="login:select_method" style={styles.label} />

      {credential.methods.map((item, index) => (
        <View key={index} style={themed($button)}>
          {item.type === "mail" && (
            <OptionContent
              disabled={item.type === "mail" && sendingEmail}
              loading={item.type === "mail" && sendingEmail}
              title={`Email ${item.data}`}
              icon="envelope-simple"
              onPress={() => getCaptchaToken().then((token) => sendEmail(item.data, token))}
            />
          )}
          {item.type === "smart_otp" && (
            <OptionContent
              disabled={false}
              loading={false}
              title={translate("common:authentication_app")}
              icon="device-mobile"
              onPress={() => onSelect(item)}
            />
          )}
        </View>
      ))}
    </BottomModalContainer>
  )
}

type OptionsParams = {
  disabled: boolean
  loading: boolean
  title: string
  icon: "envelope-simple" | "device-mobile"
  onPress: () => void
}
const OptionContent = ({ disabled, loading, onPress, title, icon }: OptionsParams) => {
  const {
    theme: { colors },
  } = useAppTheme()
  return (
    <PressableScale disabled={disabled} onPress={onPress}>
      <View style={styles.optionsContainer}>
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
        {!loading && <Icon icon={icon} color={colors.primary} />}
        <Text style={styles.ml12} text={title} />
      </View>
    </PressableScale>
  )
}

const $button: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderWidth: 1,
  borderRadius: 12,
  borderColor: colors.primary,
  marginBottom: 12,
  width: "100%",
})

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    paddingBottom: 16,
  },
  label: {
    marginBottom: 12,
  },
  ml12: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 12,
  },
  optionsContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
})
