import React, { useState, useEffect } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import {Text, Button, FloatingInput } from "../../../components"
import { useMixins } from "../../../services/mixins"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { commonStyles } from "../../../theme"
import { useStores } from "../../../models"


type Props = {
  goBack: () => void
  nextStep: (token: string) => void
  username: string
}


export const Step3 = observer(function Step3(props: Props) {
  const { user, uiStore } = useStores()
  const { translate, notify, color, notifyApiError } = useMixins()
  const { goBack, nextStep, username } = props

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [code, setCode] = useState('')
  const [remainingLockTime, setRemainingLockTime] = useState(0)
  const [sendingEmail, setIsSendingEmail] = useState(false)
  let countdown = null

  // ------------------ Methods ----------------------

  const handleRequest = async () => {
    setIsError(false)
    setIsLoading(true)
    const res = await user.resetPasswordWithCode(username, code)
    setIsLoading(false)
    if (res.kind !== 'ok') {
      setIsError(true)
      notify('error', translate('error.invalid_authorization_code'))
    } else {
      const urlArray = res.data.reset_password_url.split('/')
      nextStep(urlArray[urlArray.length - 1])
    }
  }

  const getRemainingLockTime = () => {
    return Math.max(Math.floor((uiStore.lockResendOtpResetPasswordTime - Date.now()) / 1000), 0)
  }

  const resendEmail = async () => {
    setIsSendingEmail(true)
    const res = await user.resetPassword(username, 'mail')
    if (res.kind === 'ok') {
      uiStore.setLockResendOtpResetPasswordTime(Date.now() + 60 * 1000)
      startInterval()
      setRemainingLockTime(getRemainingLockTime())
      notify('success', translate('forgot_password.resend_success'))
    } else {
      notifyApiError(res)
    }
    setIsSendingEmail(false)
  }

  const startInterval = () => {
    countdown = setInterval(() => {
      const remaining = getRemainingLockTime()
      if (remaining > 0) {
        setRemainingLockTime(remaining)
      } else {
        clearTimeout(countdown)
        setRemainingLockTime(0)
        uiStore.setLockResendOtpResetPasswordTime(null)
      }
    }, 1000)
  }

  // ------------------------------ EFFECT -------------------------------

  useEffect(() => {
    if (uiStore.lockResendOtpResetPasswordTime) {
      setRemainingLockTime(getRemainingLockTime())
      startInterval()
    } else {
      clearInterval(countdown)
    }
    return () => {
      clearInterval(countdown)
    }
  }, [])

  // ------------------------------ RENDER -------------------------------

  return (
    <View>
      <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
        <Button
          preset="link"
          onPress={() => goBack()}
          style={{ marginRight: 15 }}
        >
          <IoniconsIcon 
            name="md-arrow-back"
            size={26} 
            color={color.title} 
          />
        </Button>
        <Text
          preset="header"
          text={translate('forgot_password.enter_code')}
        />
      </View>

      <Text
        preset="black"
        text={translate('forgot_password.enter_code_desc')}
        style={{ marginTop: 20 }}
      />

      <FloatingInput
        isInvalid={isError}
        label={translate('forgot_password.enter_code_here')}
        value={code}
        onChangeText={setCode}
        onSubmitEditing={handleRequest}
        style={{ marginTop: 20 }}
      />

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || !code}
        text={translate("common.authenticate")}
        onPress={handleRequest}
        style={{
          width: '100%',
          marginTop: 30
        }}
      />

      <Button
        preset="outline"
        isDisabled={!!remainingLockTime || sendingEmail}
        isLoading={sendingEmail}
        onPress={resendEmail}
        text={`${translate('forgot_password.resend_email')}${remainingLockTime ? ` (${remainingLockTime}s)` : ''}`}
        style={{
          width: '100%',
          marginTop: 15
        }}
      />
    </View>
  )
})
