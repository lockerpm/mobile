import React, { useState, useRef, useEffect } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { useStores } from 'app/models'
import { Passkey, PasskeyAuthenticationResult } from 'react-native-passkey'
import { PasskeyAuthenticationRequest } from 'react-native-passkey/lib/typescript/Passkey'
import { credentialAuthOptions, publicKeyCredentialWithAssertion } from 'app/utils/passkey'
import { IosPasswordlessOptions, SocialLogin } from 'app/components/utils'
import { useHelper } from 'app/services/hook'
import { Logo, Text, Button, TextInput } from 'app/components/cores'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { useTheme } from 'app/services/context'

type Props = {
  nextStep: (username: string, password: string, methods: { type: string; data: any }[]) => void
  onLoggedIn: (newUser: boolean, token: string) => Promise<void>
  handleForgot: () => void
}

enum METHOD {
  PASSKEY = 0,
  PASSWORD = 1,
  NONE = 2,
}

const IS_IOS = Platform.OS === 'ios'

export const LoginForm = ({ nextStep, onLoggedIn, handleForgot }: Props) => {
  const { user } = useStores()
  const { colors } = useTheme()
  const { notify, notifyApiError, setApiTokens, translate } = useHelper()

  // ------------------ Params -----------------------

  const passwordRef = useRef(null)

  const [isError, setIsError] = useState(false)
  const [username, setUsername] = useState('thinhnn@cystack.net')
  const [password, setPassword] = useState('Rongden123')
  const [loginMethodLoading, setLoginMethodLoading] = useState<METHOD>(METHOD.NONE)

  const [loginMethod, setLoginMethod] = useState<METHOD>(METHOD.NONE)
  const [passkeySupported, setPasskeySupported] = useState(false)
  const [showExtraPasskeyLogin, setShowExtraPasskeyLogin] = useState(false)

  const [isShowCreatePasskeyOptions, setIsShowCreatePasskeyOptions] = useState(false)
  const [isIcloudSelected, setIsIcloudSelected] = useState(true)

  // ------------------ Methods ----------------------

  const getLoginMethod = async () => {
    const res = await user.loginMethod(username)
    if (res.kind === 'ok') {
      if (res.data.webauthn) {
        setLoginMethod(METHOD.PASSKEY)
        if (IS_IOS) {
          setIsShowCreatePasskeyOptions(true)
        } else {
          await handleAuthWebauth()
        }
        setShowExtraPasskeyLogin(true)
        return
      }
      setLoginMethod(METHOD.PASSWORD)
    } else {
      notifyApiError(res)
    }
  }

  const handleLogin = async () => {
    setLoginMethodLoading(METHOD.PASSWORD)
    setIsError(false)

    const payload = { username, password }
    const res = await user.login(payload)
    setLoginMethodLoading(METHOD.NONE)
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

  const handleAuthWebauth = async (withSecurityKey?: boolean) => {
    setLoginMethodLoading(METHOD.PASSKEY)
    const resAuthPasskeyOptions = await user.authPasskeyOptions(username)
    if (resAuthPasskeyOptions.kind === 'ok') {
      try {
        const authRequest: PasskeyAuthenticationRequest = credentialAuthOptions(
          resAuthPasskeyOptions.data
        )
        // Call the `authenticate` method with the retrieved request in JSON format
        // A native overlay will be displayed
        const result: PasskeyAuthenticationResult = await Passkey.authenticate(authRequest, {
          withSecurityKey,
        })

        const res = await user.authPasskey({
          username,
          response: publicKeyCredentialWithAssertion(result),
        })

        if (res.kind === 'ok') {
          setPassword('')
          if (res.data.is_factor2) {
            nextStep(username, password, res.data.methods)
          } else {
            // @ts-ignore
            setApiTokens(res.data?.access_token)
            onLoggedIn(false, '')
          }
        } else {
          if (res.kind === 'unauthorized') {
            notify('error', translate('passkey.error.login_failed'))
          }

          setLoginMethod(METHOD.PASSWORD)
        }
        // The `authenticate` method returns a FIDO2 assertion result
        // Pass it to your server for verification
      } catch (error) {
        // Handle Error...
        if (error.error === 'UserCancelled') {
          notify('error', translate('passkey.error.user_cancel'))
        } else {
          notify('error', translate('error.something_went_wrong'))
        }
        setLoginMethod(METHOD.PASSWORD)
      }
    } else {
      notifyApiError(resAuthPasskeyOptions)
    }
    setLoginMethodLoading(METHOD.NONE)
  }
  const checkPasskeySupported = async () => {
    const res = await Passkey.isSupported()
    if (res) {
      setLoginMethod(METHOD.NONE)
      setPasskeySupported(true)
      return
    }
    setLoginMethod(METHOD.PASSWORD)
  }

  // ------------------------------ EFFECT -------------------------------

  useEffect(() => {
    checkPasskeySupported()
  }, [])

  // ------------------------------ RENDER -------------------------------

  return (
    <View style={{ marginTop: 56 }}>
      <View>
        {IS_IOS && (
          <IosPasswordlessOptions
            isOpen={isShowCreatePasskeyOptions}
            onClose={() => {
              setIsShowCreatePasskeyOptions(false)
              setLoginMethod(METHOD.PASSWORD)
            }}
            label={translate('passkey.login_passkey_options')}
            title={translate('common.login')}
            isIcloudSelected={isIcloudSelected}
            setIsIcloudSelected={setIsIcloudSelected}
            action={async () => {
              setIsShowCreatePasskeyOptions(false)
              await handleAuthWebauth(!isIcloudSelected)
            }}
          />
        )}

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
          onChangeText={(val) => {
            if (passkeySupported && loginMethod === METHOD.NONE) {
              setLoginMethod(METHOD.NONE)
              setShowExtraPasskeyLogin(false)
            }
            setUsername(val)
          }}
          onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
        />

        {/* Password input */}
        {loginMethod === METHOD.PASSWORD && (
          <Animated.View entering={FadeInUp}>
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
              loading={loginMethodLoading === METHOD.PASSWORD}
              disabled={loginMethodLoading !== METHOD.NONE || !(username && password)}
              text={translate('common.login')}
              onPress={handleLogin}
              style={{
                marginVertical: 16,
              }}
            />
          </Animated.View>
        )}
        {/* Password input end */}

        {loginMethod !== METHOD.PASSWORD && (
          <Button
            disabled={!username}
            text={translate('common.continue')}
            onPress={getLoginMethod}
            style={{
              marginVertical: 16,
            }}
          />
        )}

        {showExtraPasskeyLogin && (
          <Button
            preset="secondary"
            loading={loginMethodLoading === METHOD.PASSKEY}
            disabled={loginMethodLoading !== METHOD.NONE || !username}
            text={translate('passkey.login_passkey')}
            onPress={() => {
              if (Platform.OS === 'ios') {
                setIsShowCreatePasskeyOptions(true)
              } else {
                handleAuthWebauth(false)
              }
            }}
            style={{
              height: 50,
              marginBottom: 12,
            }}
          />
        )}

        <SocialLogin onLoggedIn={onLoggedIn} />
      </View>
    </View>
  )
}
