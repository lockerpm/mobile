import React, { useState, useRef, useCallback } from "react"
import { StyleSheet, View } from "react-native"
import { Text, Button, Icon } from "app/components/cores"
import { useStores } from "app/models"
import { useTheme } from "app/services/context"
import { RecaptchaChecker, RecaptchaCheckerRef } from "app/components/utils"
import { useToast } from "app/services/utils"
import { AccountRecovery } from "app/static/types"

type Props = {
  methods: AccountRecovery[]
  onSelect: (email: string) => void
}

export const MethodSelection = (props: Props) => {
  const { user } = useStores()
  const { notifyApiError } = useToast()
  const { methods, onSelect } = props

  const captchaRef = useRef<RecaptchaCheckerRef>(null)

  // ------------------ Params -----------------------
  const [isLoading, setIsLoading] = useState("")

  // ------------------ Methods ----------------------

  const getCaptchaToken = useCallback(async () => {
    return await captchaRef.current?.waitForToken()
  }, [])

  const sendEmail = async (email: string) => {
    if (!isLoading) {
      setIsLoading(email)
      const token = await getCaptchaToken()
      const res = await user.resetPassword(email, "mail", token)
      if (res.kind === "ok") {
        onSelect(email)
      } else {
        notifyApiError(res)
      }
      setIsLoading("")
    }
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <View>
      <RecaptchaChecker ref={captchaRef} />

      <Text tx="forgot_password.select_method" style={styles.label} />

      {methods[0].data.map((item, index) => (
        <Button
          key={index}
          preset="secondary"
          disabled={!!isLoading}
          loading={isLoading === item}
          onPress={() => sendEmail(item)}
          style={styles.button}
        >
          <OptionContent title={item} />
        </Button>
      ))}
    </View>
  )
}

type OptionsParams = {
  title: string
}
const OptionContent = ({ title }: OptionsParams) => {
  const { colors } = useTheme()
  return (
    <View style={styles.optionsContainer}>
      <Icon icon={"envelope-simple"} color={colors.primary} />
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
})
