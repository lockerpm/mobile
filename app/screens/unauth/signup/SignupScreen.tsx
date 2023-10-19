import countries from 'app/static/countries.json'
import React, { useState, useRef, useCallback, FC } from 'react'
import { Linking, TouchableOpacity, View } from 'react-native'
import { useStores } from 'app/models'
import { RootStackScreenProps } from 'app/navigators'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { Checkbox } from 'react-native-ui-lib'
import { Screen, Text, Button, TextInput, Logo, Header } from 'app/components/cores'
import { CountryPicker, CountryCode, RecaptchaChecker } from 'app/components/utils'
import { PRIVACY_POLICY_URL, TERMS_URL } from 'app/config/constants'
import { getCookies, logRegisterSuccessEvent } from 'app/utils/analytics'
import { Logger } from 'app/utils/utils'
import { observer } from 'mobx-react-lite'

export const SignupScreen: FC<RootStackScreenProps<'signup'>> = observer((props) => {
  const navigation = props.navigation
  const { colors } = useTheme()
  const { user } = useStores()
  const { notify, notifyApiError, translate } = useHelper()

  // ---------------- PARAMS ---------------------

  const captchaRef = useRef(null)

  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullname, setFullname] = useState('')
  const [country, setCountry] = useState<CountryCode>('VN')
  const [agreed, setAgreed] = useState(false)

  const [showCountryPicker, setShowContryPicker] = useState(false)

  // ---------------- COMPUTED ---------------------

  const formValidated = email && password && password === confirmPassword && fullname && agreed

  // ---------------- METHODS ---------------------

  const goBack = () => {
    props.navigation.goBack()
  }

  const navigateLogin = () => {
    props.navigation.replace('login')
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
      navigation.replace('login')
    } else {
      notifyApiError(res)
    }
  }

  // ---------------- EFFECT --------------------

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
          text={translate('common.sign_up')}
          onPress={() => {
            getCaptchaToken().then(handleRegister)
          }}
          style={{
            width: '100%',
            marginTop: 30,
            marginBottom: 20,
          }}
        />
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
})

const TermAndConditions = ({
  agreed,
  setAgreed,
}: {
  agreed: boolean
  setAgreed: (val: boolean) => void
}) => {
  const { translate } = useHelper()
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
