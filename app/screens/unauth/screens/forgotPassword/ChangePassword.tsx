import React, { useState } from 'react'
import { View } from 'react-native'
import { Button, TextInput } from 'app/components/cores'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'

type Props = {
  nextStep: () => void
  token: string
}

export const ChangePassword = (props: Props) => {
  const { user } = useStores()
  const { notify, notifyApiError, translate } = useHelper()
  const { nextStep, token } = props

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // ------------------ Methods ----------------------

  const handleSubmitNewPassword = async () => {
    setIsError(false)
    setIsLoading(true)
    const res = await user.setNewPassword(password, token)
    setIsLoading(false)
    if (res.kind !== 'ok') {
      notifyApiError(res)
    } else {
      notify('success', translate('forgot_password.password_updated'))
      nextStep()
    }
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <View>
      <TextInput
        isPassword
        animated
        isError={isError}
        label={translate('forgot_password.new_password')}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        animated
        isPassword
        isError={isError || (password && confirmPassword && password !== confirmPassword)}
        label={translate('forgot_password.confirm_new_password')}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button
        loading={isLoading}
        disabled={isLoading || !(password && confirmPassword === password)}
        text={translate('common.submit')}
        onPress={handleSubmitNewPassword}
        style={{
          width: '100%',
          marginTop: 40,
        }}
      />
    </View>
  )
}
