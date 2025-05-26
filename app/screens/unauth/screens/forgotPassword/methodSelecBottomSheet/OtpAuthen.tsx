import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'
import { Text, Button, TextInput, Icon } from 'app/components/cores'

type Props = {
  goBack: () => void
  nextStep: (token: string) => void
  username: string
}

export const OtpAuthen = (props: Props) => {
  const { user, uiStore } = useStores()
  const { notify, notifyApiError, translate } = useHelper()

  const { goBack, username, nextStep } = props

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
      const urlArray = res.data.reset_password_url?.split('/')
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Icon icon="arrow-left" onPress={goBack} />
        <Text preset="bold" size="xl" text={translate('forgot_password.enter_code')} />
        <View style={{ width: 24, height: 24 }} />
      </View>

      <Text text={translate('forgot_password.enter_code_desc')} style={{ marginVertical: 20 }} />

      <TextInput
        animated
        isError={isError}
        label={translate('forgot_password.enter_code_here')}
        value={code}
        onChangeText={setCode}
        onSubmitEditing={handleRequest}
      />

      <Button
        loading={isLoading}
        disabled={isLoading || !code}
        text={translate('common.authenticate')}
        onPress={handleRequest}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      />

      <Button
        preset="secondary"
        disabled={!!remainingLockTime || sendingEmail}
        loading={sendingEmail}
        onPress={resendEmail}
        text={`${translate('forgot_password.resend_email')}${
          remainingLockTime ? ` (${remainingLockTime}s)` : ''
        }`}
        style={{
          width: '100%',
          marginTop: 15,
        }}
      />
    </View>
  )
}
