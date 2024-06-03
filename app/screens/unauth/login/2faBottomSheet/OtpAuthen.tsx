import React, { useState } from 'react'
import { View } from 'react-native'
import { Checkbox } from 'react-native-ui-lib'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { Text, Button, TextInput, Icon } from 'app/components/cores'

type Props = {
  goBack: () => void
  method: string
  email?: string
  username: string
  password: string
  onLoggedIn: () => void
}

export const OtpAuthen = (props: Props) => {
  const { user } = useStores()
  const { colors } = useTheme()
  const { notify, setApiTokens, translate } = useHelper()

  const { goBack, method, email, username, password, onLoggedIn } = props

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [otp, setOtp] = useState('')
  const [saveDevice, setSaveDevice] = useState(false)

  // ------------------ Methods ----------------------

  const handleAuthenticate = async () => {
    setIsError(false)
    setIsLoading(true)
    const res = await user.login(
      {
        username,
        password,
        method,
        otp,
        save_device: saveDevice,
      },
      true
    )
    setIsLoading(false)
    if (res.kind === 'ok') {
      // @ts-ignore
      setApiTokens(res.data?.access_token)
      onLoggedIn()
    } else {
      notify('error', translate('error.login_failed'))
      setIsError(true)
    }
  }

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
        <Text preset="bold" size="xl" text={translate('login.enter_code')} />
        <View style={{ width: 24, height: 24 }} />
      </View>

      <Text
        text={
          method === 'mail'
            ? translate('login.from_email', { email })
            : translate('login.from_authenticator')
        }
        style={{
          marginBottom: 12,
          marginTop: 30,
        }}
      />

      <TextInput
        isError={isError}
        placeholder={translate('login.enter_code_here')}
        value={otp}
        onChangeText={setOtp}
        onSubmitEditing={handleAuthenticate}
      />

      <Checkbox
        value={saveDevice}
        color={colors.primary}
        label={translate('login.save_device')}
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
        text={translate('common.authenticate')}
        onPress={handleAuthenticate}
        style={{
          marginTop: 12,
        }}
      />
    </View>
  )
}
