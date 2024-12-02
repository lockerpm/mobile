import { Text, Header, TextInput, Button } from "app/components/cores"
import { Checkbox } from "react-native-ui-lib"
import React, { useState } from "react"
import { View } from "react-native"
import Modal from "react-native-modal"
import { useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { useTheme } from "app/services/context"

interface Props {
  email: string
  isOpen: boolean
  onClose: () => void
  code: string
  nonce: string
  methods: { type: string; data: any }[]
  onLoggedIn: () => void
}
export const TwoFactorAuthentication = ({
  isOpen,
  onClose,
  nonce,
  methods,
  email,
  code,
  onLoggedIn,
}: Props) => {
  const { user } = useStores()
  const { setApiTokens, translate, notifyApiError } = useHelper()
  const { colors } = useTheme()

  const method = methods[0]

  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState("")
  const [saveDevice, setSaveDevice] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleAuthenticate = async () => {
    setIsLoading(true)
    const res = await user.loginPinCode2FA({
      nonce,
      code,
      method: method.type,
      otp,
      save_device: saveDevice,
    })
    setIsLoading(false)
    if (res.kind === "ok") {
      // @ts-ignore
      setApiTokens(res.data?.access_token)
      onLoggedIn()
    } else {
      setErrorMessage(notifyApiError(res, true))
    }
  }

  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      isVisible={isOpen}
      onModalHide={onClose}
      style={{ margin: 0, backgroundColor: colors.background }}
    >
      <Header leftIcon="arrow-left" titleTx="authenticator.title" onLeftPress={onClose} />
      <View
        style={{
          flex: 1,
          padding: 16,
        }}
      >
        <Text
          text={
            method.type === "mail"
              ? translate("login.from_email", { email })
              : translate("login.from_authenticator")
          }
          style={{
            marginBottom: 12,
          }}
        />

        <TextInput
          autoFocus
          isError={!!errorMessage}
          helper={errorMessage}
          placeholder={translate("login.enter_code_here")}
          value={otp}
          onChangeText={(val) => {
            if (errorMessage) {
              setErrorMessage("")
            }
            setOtp(val)
          }}
          onSubmitEditing={handleAuthenticate}
        />

        <Checkbox
          value={saveDevice}
          color={colors.primary}
          label={translate("login.save_device")}
          onValueChange={setSaveDevice}
          style={{
            marginVertical: 16,
          }}
          labelStyle={{
            color: colors.primaryText,
            fontSize: 16,
          }}
        />

        <Button
          loading={isLoading}
          disabled={isLoading || !otp}
          text={translate("common.authenticate")}
          onPress={handleAuthenticate}
          style={{
            marginTop: 12,
          }}
        />
      </View>
    </Modal>
  )
}
