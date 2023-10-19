import React, { useState, useRef } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'
import { Logo, Text, Button, TextInput } from 'app/components/cores'
import { useTheme } from 'app/services/context'

type Props = {
  nextStep: (username: string, password: string, methods: { type: string; data: any }[]) => void
  onLoggedIn: (newUser: boolean, token: string) => Promise<void>
  handleForgot: () => void
}

export const LoginForm = ({ nextStep, onLoggedIn, handleForgot }: Props) => {
  const { user } = useStores()
  const { colors } = useTheme()
  const { notify, notifyApiError, setApiTokens, translate } = useHelper()

  // ------------------ Params -----------------------

  const passwordRef = useRef(null)

  const [isError, setIsError] = useState(false)
  const [username, setUsername] = useState('thinhnn@cystack.net')
  const [password, setPassword] = useState('Rongden123')
  const [loginLoading, setLoginLoading] = useState(false)

  // ------------------ Methods ----------------------

  const handleLogin = async () => {
    setIsError(false)
    setLoginLoading(true)
    const payload = { username, password }
    const res = await user.login(payload)
    setLoginLoading(false)
    if (res.kind !== 'ok') {
      setIsError(true)
      if (res.kind === 'unauthorized' && res.data) {
        const errorData: {
          code: string
          message: string
        } = res.data
        switch (errorData.code) {
          case '1001': {
            notify('error', translate('error.wrong_username_or_password'))
            break
          }
          case '1003': {
            notify('error', translate('error.account_not_activated'))
            break
          }
          default: {
            notify('error', errorData.message)
          }
        }
      } else {
        notifyApiError(res)
      }
    } else {
      if (res.data.is_factor2) {
        nextStep(username, password, res.data.methods)
      } else {
        setPassword('')
        // @ts-ignore
        setApiTokens(res.data?.access_token)
        onLoggedIn(false, '')
      }
    }
  }

  // ------------------------------ EFFECT -------------------------------

  // ------------------------------ RENDER -------------------------------

  return (
    <View style={{ marginTop: 56 }}>
      <View>
        <Logo
          preset={'default'}
          style={{ height: 80, width: 70, marginBottom: 10, alignSelf: 'center' }}
        />

        <Text
          preset="bold"
          size="xl"
          text={translate('login.title')}
          style={{ marginBottom: 20, textAlign: 'center' }}
        />

        <TextInput
          animated
          isError={isError}
          label={translate('login.email_or_username')}
          value={username}
          onChangeText={setUsername}
          onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
        />

        <TextInput
          ref={passwordRef}
          animated
          isRequired
          isPassword
          isError={isError}
          label={translate('common.password')}
          onChangeText={setPassword}
          value={password}
          onSubmitEditing={handleLogin}
        />
        <View
          style={{
            width: '100%',
            alignItems: 'flex-start',
            marginTop: 12,
          }}
        >
          <TouchableOpacity onPress={handleForgot}>
            <Text text={translate('login.forgot_password')} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Button
          loading={loginLoading}
          disabled={loginLoading || !(username && password)}
          text={translate('common.login')}
          onPress={handleLogin}
          style={{
            marginVertical: 16,
          }}
        />
      </View>
    </View>
  )
}
