import React, { useState, useEffect, useRef, useCallback } from "react"
import { Linking, View } from "react-native"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { Layout, AutoImage as Image, Text, FloatingInput, Button, RecaptchaChecker } from "../../../components";
import { useMixins } from "../../../services/mixins"
import { color, commonStyles, fontSize } from "../../../theme"
import { APP_ICON, SOCIAL_LOGIN_ICON } from "../../../common/mappings"
import { IS_IOS, PRIVACY_POLICY_URL, TERMS_URL, IS_PROD } from "../../../config/constants"
import { Checkbox } from "react-native-ui-lib"
import countries from '../../../common/countries.json'
import { useSocialLoginMixins } from "../../../services/mixins/social-login"
import { SocialSignedUpModal } from "./social-signup-modal"
import { GitHubLoginModal } from "../login/github-login-modal"
import { getCookies, logRegisterSuccessEvent } from "../../../utils/analytics"


export const SignupScreen = observer(() => {
  const { user, uiStore } = useStores()
  const navigation = useNavigation()
  const { translate, notify, notifyApiError } = useMixins()
  const { googleLogin, facebookLogin, githubLogin, appleLogin } = useSocialLoginMixins()

  const captchaRef = useRef(null)

  // ---------------- PARAMS ---------------------

  const [isScreenLoading, setIsScreenLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullname, setFullname] = useState('')
  const [country, setCountry] = useState('VN')
  const [phone, setPhone] = useState('')
  const [phonePrefix, setPhonePrefix] = useState('+84')
  const [agreed, setAgreed] = useState(false)

  const [token, setResetPWToken] = useState("")
  const [account, setAccount] = useState(null)
  const [showSocialSignedUpModal, setShowSocialSignedUpModal] = useState(false)

  const [showGitHubLogin, setShowGitHubLogin] = useState(false)

  // ------------------------------ DATA -------------------------------

  const SOCIAL_LOGIN: {
    [service: string]: {
      hide?: boolean
      icon: any
      handler: () => void
    }
  } = {
    apple: {
      hide: !IS_IOS,
      icon: uiStore.isDark ? SOCIAL_LOGIN_ICON.appleLight : SOCIAL_LOGIN_ICON.apple,
      handler: () => {
        return appleLogin({
          setIsLoading,
          onLoggedIn
        })
      }
    },

    google: {
      hide: !IS_PROD,
      icon: SOCIAL_LOGIN_ICON.google,
      handler: () => {
        return googleLogin({
          setIsLoading,
          onLoggedIn
        })
      }
    },

    facebook: {
      hide: !IS_PROD,
      icon: SOCIAL_LOGIN_ICON.facebook,
      handler: () => {
        return facebookLogin({
          setIsLoading,
          onLoggedIn
        })
      }
    },

    github: {
      hide: !IS_PROD,
      icon: uiStore.isDark ? SOCIAL_LOGIN_ICON.githubLight : SOCIAL_LOGIN_ICON.github,
      handler: () => {
        setShowGitHubLogin(true)
      }
    }
  }

  // ---------------- COMPUTED ---------------------

  const formValidated = email && password && (password === confirmPassword) && fullname && agreed

  // ---------------- METHODS ---------------------

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
      phone: phone ? phonePrefix + ' ' + phone : undefined,
      request_code: captchaToken,
      utm_source: await getCookies('utm_source')
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

  const onLoggedIn = async (newUser: boolean, token: string) => {
    setIsScreenLoading(true)
    const [userRes, userPwRes] = await Promise.all([
      user.getUser(),
      user.getUserPw()
    ])
    setIsScreenLoading(false)
    if (userRes.kind === 'ok' && userPwRes.kind === 'ok') {
      if (user.is_pwd_manager) {
        navigation.navigate('lock')
      } else {
        navigation.navigate('createMasterPassword')
      }
    }
  }

  // ---------------- WATCHERS --------------------

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (uiStore.selectedCountry) {
        const item = countries[uiStore.selectedCountry]
        if (item) {
          setCountry(uiStore.selectedCountry)
          setPhonePrefix(item.country_phone_code)
        }
        uiStore.setSelectedCountry(null)
      }
      setResetPWToken("")
      setAccount(null)
      setShowSocialSignedUpModal(false)
    });

    return unsubscribe
  }, [navigation])


  // ---------------- RENDER ---------------------

  return (
    <Layout
      isOverlayLoading={isScreenLoading}
      footer={(
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            marginTop: 12,
            justifyContent: 'center'
          }]}
        >
          <Text
            text={translate("signup.has_account")}
            style={{
              marginRight: 8,
            }}
          />
          <Button
            preset="link"
            text={translate("common.login")}
            onPress={() => navigation.navigate("login")}
          />
        </View>
      )}
    >
      {/* Modal */}
      <GitHubLoginModal
        isOpen={showGitHubLogin}
        onClose={() => setShowGitHubLogin(false)}
        onDone={(code) => {
          githubLogin({
            setIsLoading,
            onLoggedIn,
            code
          })
        }} />

      <RecaptchaChecker
        ref={captchaRef}
      />
      {/* Modal end */}
      <View style={{ alignItems: 'center', paddingTop: '10%' }}>
        <Image
          source={APP_ICON.iconDark}
          style={{ height: 63, width: 63, marginBottom: 10, marginTop: 30 }}
        />

        <Text
          preset="header"
          text={translate('signup.title')}
          style={{ marginBottom: 20 }}
        />

        {/* Username input */}
        <FloatingInput
          isRequired
          label={translate('common.email')}
          onChangeText={setEmail}
          value={email}
          style={{ width: '100%', marginBottom: 10 }}
        />
        {/* Username input end */}

        {/* Password input */}
        <FloatingInput
          isPassword
          isRequired
          label={translate('common.password')}
          onChangeText={setPassword}
          value={password}
          style={{ width: '100%', marginBottom: 10 }}
        />
        {/* Password input end */}

        {/* Confirm Password input */}
        <FloatingInput
          isPassword
          isRequired
          label={translate('signup.confirm_password')}
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          style={{ width: '100%', marginBottom: 10 }}
        />
        {/* Confirm Password input end */}

        {/* Full name input */}
        <FloatingInput
          isRequired
          label={translate('common.fullname')}
          onChangeText={setFullname}
          value={fullname}
          style={{ width: '100%', marginBottom: 10 }}
        />
        {/* Full name input end */}

        {/* Country input */}
        <Button
          preset="link"
          onPress={() => {
            navigation.navigate('countrySelector', { initialId: country })
          }}
        >
          <FloatingInput
            isRequired
            editable={false}
            label={translate('common.country')}
            value={countries[country] ? countries[country].country_name : ''}
            style={{ width: '100%', marginBottom: 10 }}
            onTouchStart={() => {
              navigation.navigate('countrySelector', { initialId: country })
            }}
          />
        </Button>
        {/* Country input end */}

        {/* Aggreed */}
        <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
          width: '100%',
          justifyContent: 'flex-start',
          marginTop: 10
        }]}>
          <Checkbox
            value={agreed}
            color={color.primary}
            onValueChange={setAgreed}
            style={{
              marginVertical: 7
            }}
            labelStyle={{
              color: color.text,
              fontSize: fontSize.p
            }}
          />
          <Button
            preset="link"
            onPress={() => setAgreed(!agreed)}
            style={{ flex: 1 }}
          >
            <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
              paddingLeft: 15,
              flexWrap: 'wrap',
              width: '100%'
            }]}>
              <Text
                text={translate('signup.agree_with') + ' '}
              />
              <Button
                preset="link"
                text={translate('signup.terms')}
                onPress={() => Linking.openURL(TERMS_URL)}
              />
              <Text
                text={' ' + translate('common.and') + ' '}
              />
              <Button
                preset="link"
                text={translate('signup.conditions')}
                onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
              />
            </View>
          </Button>
        </View>
        {/* Aggreed end */}

        <Button
          isLoading={isLoading}
          isDisabled={isLoading || !formValidated}
          text={translate("common.sign_up")}
          onPress={() => {
            getCaptchaToken().then(handleRegister)
          }}
          style={{
            width: '100%',
            marginTop: 30,
            marginBottom: 20
          }}
        />

        <View style={commonStyles.CENTER_VIEW}>
          <Text
            text={IS_PROD ? translate("common.or_login_with") : ""}
            style={{ marginBottom: 5 }}
          />

          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            {
              Object.values(SOCIAL_LOGIN).filter(item => !item.hide).map((item, index) => (
                <Button
                  key={index}
                  preset="ghost"
                  onPress={item.handler}
                  style={{ marginHorizontal: 10 }}
                >
                  <item.icon height={40} width={40} />
                </Button>
              ))
            }
          </View>
        </View>
      </View>
    </Layout>
  )
})
