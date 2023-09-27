import countries from 'app/static/countries.json'
import React, { useState, useEffect, useRef, useCallback, FC } from 'react'
import { Linking, Platform, TouchableOpacity, View } from 'react-native'
import { useStores } from 'app/models'
import { RootStackScreenProps } from 'app/navigators'
import { useHelper } from 'app/services/hook'
import { translate } from 'app/i18n'
import { useTheme } from 'app/services/context'
import { Checkbox } from 'react-native-ui-lib'
import Animated, { ZoomIn } from 'react-native-reanimated'
import { Screen, Text, Button, TextInput, Logo, Header } from 'app/components/cores'
import {
  CountryPicker,
  CountryCode,
  SocialLogin,
  RecaptchaChecker,
  IosPasswordlessOptions,
} from 'app/components/utils'
import { Passkey, PasskeyRegistrationResult } from 'react-native-passkey'
import { PasskeyRegistrationRequest } from 'react-native-passkey/lib/typescript/Passkey'
import { credentialCreationOptions, publicKeyCredentialWithAttestation } from 'app/utils/passkey'
import { IS_IOS, PRIVACY_POLICY_URL, TERMS_URL } from 'app/config/constants'
import { getCookies, logRegisterSuccessEvent } from 'app/utils/analytics'
import { Logger } from 'app/utils/utils'

export const SignupScreen: FC<RootStackScreenProps<'signup'>> = (props) => {
  const navigation = props.navigation
  const { colors } = useTheme()
  const { user } = useStores()
  const { notify, notifyApiError } = useHelper()

  // ---------------- PARAMS ---------------------

  const captchaRef = useRef(null)

  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullname, setFullname] = useState('')
  const [country, setCountry] = useState<CountryCode>('VN')
  const [agreed, setAgreed] = useState(false)

  const [isSignupWithPassword, setIsSignupWithPassword] = useState(false)
  const [isPasskeySupported, setIsPasskeySupported] = useState(true)

  const [isShowCreatePasskeyOptions, setIsShowCreatePasskeyOptions] = useState(false)
  const [isIcloudSelected, setIsIcloudSelected] = useState(true)

  const [showCountryPicker, setShowContryPicker] = useState(false)

  // ---------------- COMPUTED ---------------------

  const formValidated = isSignupWithPassword
    ? email && password && password === confirmPassword && fullname && agreed
    : email && fullname && agreed

  // ---------------- METHODS ---------------------

  const goBack = () => {
    props.navigation.goBack()
  }

  const navigateLogin = () => {
    props.navigation.navigate('login')
  }

  const getCaptchaToken = useCallback(async () => {
    return await captchaRef.current.waitForToken()
  }, [])

  const handleRegister = async (captchaToken: string) => {
    setIsLoading(true)
    const res = await user.register({
      email,
      password,
      country,
      confirm_password: confirmPassword,
      full_name: fullname,
      phone: undefined,
      request_code: captchaToken,
      scope: 'pwdmanager',
      utm_source: await getCookies('utm_source'),
    })
    setIsLoading(false)
    if (res.kind === 'ok') {
      logRegisterSuccessEvent()
      notify('success', translate('signup.signup_successful'), 5000)
      navigation.navigate('login')
    } else {
      notifyApiError(res)
    }
  }

  const handleRegisterWebauth = async (
    email: string,
    fullname: string,
    withSecurityKey?: boolean
  ) => {
    const resPassKeyOptions = await user.registerPasskeyOptions({
      email,
      full_name: fullname,
      algorithms: ['es256', 'rs256'],
    })
    if (resPassKeyOptions.kind === 'ok') {
      try {
        const requestJson: PasskeyRegistrationRequest = credentialCreationOptions(
          resPassKeyOptions.data
        )

        // @ts-ignore
        const result: PasskeyRegistrationResult = await Passkey.register(requestJson, {
          withSecurityKey,
        })

        const res = await user.registerPasskey({
          email,
          password: '',
          country,
          confirm_password: '',
          full_name: fullname,
          request_code: '',
          scope: 'pwdmanager',
          utm_source: await getCookies('utm_source'),
          response: publicKeyCredentialWithAttestation(result),
        })
        setIsLoading(false)
        if (res.kind === 'ok') {
          logRegisterSuccessEvent()
          notify('success', translate('signup.signup_successful'), 5000)
          navigation.navigate('login')
        } else {
          notifyApiError(res)
        }
      } catch (error) {
        // Handle Error...
      }
    } else {
      notifyApiError(resPassKeyOptions)
    }
  }

  const onRegisterWebauth = async () => {
    if (isIcloudSelected) {
      handleRegisterWebauth(email, fullname)
    } else {
      handleRegisterWebauth(email, fullname, true)
    }
  }

  const onLoggedIn = async (_newUser: boolean, _token: string) => {
    const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
    if (userRes.kind === 'ok' && userPwRes.kind === 'ok') {
      if (user.is_pwd_manager) {
        navigation.navigate('lock')
      } else {
        navigation.navigate('createMasterPassword')
      }
    }
  }
  const checkPasskeySupported = async () => {
    const res = await Passkey.isSupported()
    if (!res) {
      setIsPasskeySupported(false)
      setIsSignupWithPassword(true)
    }
  }

  // ---------------- EFFECT --------------------

  useEffect(() => {
    checkPasskeySupported()
  }, [])
  // ---------------- RENDER ---------------------

  const Footer = useCallback(
    () => (
      <View
        style={{
          margin: 12,
          marginBottom: 30,
        }}
      >
        <Text
          preset="label"
          style={{
            textAlign: 'center',
            marginVertical: 12,
          }}
        >
          {translate('signup.has_account') + ' '}
          <Text
            onPress={navigateLogin}
            style={{ color: colors.primary }}
            text={translate('common.login')}
          />
        </Text>
      </View>
    ),
    []
  )
  return (
    <Screen preset="auto" contentContainerStyle={{ paddingBottom: 20 }}>
      <RecaptchaChecker ref={captchaRef} />

      {IS_IOS && (
        <IosPasswordlessOptions
          isOpen={isShowCreatePasskeyOptions}
          onClose={() => {
            setIsShowCreatePasskeyOptions(false)
          }}
          title={translate('common.sign_up')}
          label={translate('passkey.sign_up.passkey_options')}
          isIcloudSelected={isIcloudSelected}
          setIsIcloudSelected={setIsIcloudSelected}
          action={async () => {
            setIsShowCreatePasskeyOptions(false)
            await onRegisterWebauth()
          }}
        />
      )}

      <Header leftIcon="arrow-left" onLeftPress={goBack} />

      <View style={{ paddingHorizontal: 20 }}>
        <Logo
          preset={'default'}
          style={{ height: 80, width: 70, marginBottom: 10, alignSelf: 'center' }}
        />
        <Text
          preset="bold"
          size="xl"
          text={translate('signup.title')}
          style={{ textAlign: 'center' }}
        />

        <TextInput
          isRequired
          animated
          label={translate('common.email')}
          value={email}
          onChangeText={setEmail}
        />

        {isSignupWithPassword && (
          <Animated.View entering={ZoomIn}>
            <TextInput
              animated
              isRequired
              isPassword
              label={translate('common.password')}
              onChangeText={setPassword}
              value={password}
            />
            <TextInput
              animated
              isRequired
              isPassword
              label={translate('signup.confirm_password')}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
            />
          </Animated.View>
        )}

        <TextInput
          animated
          label={translate('common.fullname')}
          value={fullname}
          onChangeText={setFullname}
        />

        <TextInput
          animated
          isRequired
          editable={false}
          label={translate('common.country')}
          value={countries[country] ? countries[country].country_name : ''}
          style={{
            color: colors.primaryText,
          }}
          onTouchStart={() => {
            setShowContryPicker(true)
          }}
        />

        <TermAndConditions agreed={agreed} setAgreed={setAgreed} />

        <Button
          loading={isLoading}
          disabled={isLoading || !formValidated}
          text={
            isSignupWithPassword
              ? translate('passkey.sign_up.signup_password')
              : translate('passkey.sign_up.continue_password')
          }
          onPress={() => {
            if (isSignupWithPassword) {
              getCaptchaToken().then(handleRegister)
            } else {
              setIsSignupWithPassword(true)
            }
          }}
          style={{
            width: '100%',
            marginTop: 30,
            marginBottom: 20,
          }}
        />

        {isPasskeySupported && (
          <Button
            preset="secondary"
            loading={isLoading}
            disabled={isLoading || !email || !fullname || !agreed}
            text={translate('passkey.sign_up.signup_passkey')}
            onPress={() => {
              if (Platform.OS === 'ios') {
                setIsShowCreatePasskeyOptions(true)
              } else {
                handleRegisterWebauth(email, fullname)
              }
            }}
            style={{
              width: '100%',
              height: 50,
              marginBottom: 12,
            }}
          />
        )}

        <SocialLogin onLoggedIn={onLoggedIn} />

        <Footer />

        <CountryPicker
          value={country}
          onValueChange={setCountry}
          isOpen={showCountryPicker}
          onClose={() => {
            setShowContryPicker(false)
          }}
        />
      </View>
    </Screen>
  )
}

const TermAndConditions = ({
  agreed,
  setAgreed,
}: {
  agreed: boolean
  setAgreed: (val: boolean) => void
}) => {
  const { colors } = useTheme()
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 10,
      }}
    >
      <Checkbox
        value={agreed}
        color={colors.primary}
        onValueChange={setAgreed}
        style={{
          marginVertical: 7,
          marginRight: 12,
        }}
        labelStyle={{
          color: colors.primaryText,
          fontSize: 16,
        }}
      />
      <TouchableOpacity onPress={() => setAgreed(!agreed)}>
        <Text>
          {translate('signup.agree_with') + ' '}
          <Text
            color={colors.primary}
            text={translate('signup.terms')}
            onPress={() => {
              Linking.canOpenURL(TERMS_URL)
                .then((val) => {
                  if (val) Linking.openURL(TERMS_URL)
                })
                .catch((e) => Logger.error(e))
            }}
          />
          <Text text={' ' + translate('common.and') + ' '} />
          <Text
            text={translate('signup.conditions')}
            color={colors.primary}
            onPress={() => {
              Linking.canOpenURL(PRIVACY_POLICY_URL)
                .then((val) => {
                  if (val) Linking.openURL(PRIVACY_POLICY_URL)
                })
                .catch((e) => Logger.error(e))
            }}
          />
        </Text>
      </TouchableOpacity>
    </View>
  )
}
