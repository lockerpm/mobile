import { useEffect, useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { StyleSheet, TextInput, TextStyle, View } from "react-native"

import { useToast } from "@/services/utils"
import { ThemedStyle } from "@/theme"
import { Logger } from "@/utils/logger"
import { getTOTP } from "@/utils/totp"
import { useAppTheme } from "@/utils/useAppTheme"

import { PasswordOtp } from "../../passwordOtp/PasswordOtp"

type Props = {
  value: string
  placeholder: string
  onChange: (val: string) => void
  onFocus: () => void
  onBlur: () => void
}

export const OTPField = (props: Props) => {
  const { value, onChange, placeholder, onFocus: propsFocus, onBlur: propsBlur } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { notifyTx } = useToast()

  const [isOtp, setIsOtp] = useState(false)

  const onBlur = async () => {
    propsBlur()
    try {
      const otp = await getTOTP({ secret: value })
      if (!otp) {
        notifyTx("error", "authenticator:invalid_key")
        return
      }
    } catch (e) {
      Logger.error("OTPInput", "onBlur", e)
      notifyTx("error", "authenticator:invalid_key")
      return
    }
    setIsOtp(true)
  }

  const init = async () => {
    if (!!value) {
      const otp = await getTOTP({ secret: value })
      if (!!otp) {
        setIsOtp(true)
      }
    }
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.label}
        selectionColor={colors.primary}
        style={themed($input)}
        onFocus={propsFocus}
        onBlur={onBlur}
      />
      {isOtp && <PasswordOtp hideName data={value} />}
    </View>
  )
}

const $input: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.title,
  fontSize: 16,
  paddingVertical: 10,
  flex: 1,
  marginRight: 8,
})

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
  },
})
