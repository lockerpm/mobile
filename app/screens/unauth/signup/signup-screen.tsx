import React, { useState, useEffect } from "react"
import { Linking, View } from "react-native"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { Layout, AutoImage as Image, Text, FloatingInput, Button } from "../../../components";
import { useMixins } from "../../../services/mixins"
import { color, commonStyles, fontSize } from "../../../theme"
import { APP_ICON, SOCIAL_LOGIN_ICON } from "../../../common/mappings"
import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { GOOGLE_CLIENT_ID, PRIVACY_POLICY_URL, TERMS_URL } from "../../../config/constants"
import { Checkbox } from "react-native-ui-lib"
import countries from '../../../common/countries.json'
import { AccessToken, LoginManager } from "react-native-fbsdk-next"


export const SignupScreen = observer(function SignupScreen() {
  const { user, uiStore } = useStores()
  const navigation = useNavigation()
  const { translate, notify } = useMixins()

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

  // ------------------------------ DATA -------------------------------

  const SOCIAL_LOGIN = {
    google: {
      icon: SOCIAL_LOGIN_ICON.google,
      handler: async () => {
        try {
          GoogleSignin.configure({
            webClientId: GOOGLE_CLIENT_ID
          })
          await GoogleSignin.signIn()
          const tokens = await GoogleSignin.getTokens()
          setIsLoading(true)
          const loginRes = await user.socialLogin({
            provider: 'google',
            access_token: tokens.accessToken
          })
          setIsLoading(false)
          if (loginRes.kind !== 'ok') {
            notify('error', translate('error.login_failed'))
          } else {
            onLoggedIn()
          }
        } catch (e) {
          __DEV__ && console.log(e)
          notify('error', e.toString())
        }
      }
    },

    facebook: {
      icon: SOCIAL_LOGIN_ICON.facebook,
      handler: async () => {
        try {
          await LoginManager.logInWithPermissions(['public_profile', 'email'])
          const res = await AccessToken.getCurrentAccessToken()
          setIsLoading(true)
          const loginRes = await user.socialLogin({
            provider: 'facebook',
            access_token: res.accessToken 
          })
          setIsLoading(false)
          if (loginRes.kind !== 'ok') {
            notify('error', translate('error.login_failed'))
          } else {
            onLoggedIn()
          }
        } catch (e) {
          __DEV__ && console.log(e)
          notify('error', e.toString())
        }
      }
    },

    github: {
      icon: SOCIAL_LOGIN_ICON.github,
      handler: () => {}
    }
  }

  // ---------------- COMPUTED ---------------------

  const formValidated = email && password && (password === confirmPassword) && fullname && agreed

  // ---------------- METHODS ---------------------

  const handleRegister = async () => {
    setIsLoading(true)
    const res = await user.register({
      email,
      password,
      country,
      confirm_password: confirmPassword,
      full_name: fullname,
      phone: phone ? phonePrefix + ' ' + phone : undefined
    })
    setIsLoading(false)
    if (res.kind === 'ok') {
      notify('success', translate('signup.signup_successful'), 5000)
      navigation.navigate('login')
    } else {
      notify('error', translate('error.invalid_data'))
    }
  }

  const onLoggedIn = async () => {
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
            color={color.palette.green}
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
          onPress={handleRegister}
          style={{
            width: '100%',
            marginTop: 30,
            marginBottom: 20
          }}
        />

        <View style={commonStyles.CENTER_VIEW}>
          <Text
            text={translate("common.or_login_with")}
            style={{ marginBottom: 5 }}
          />

          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            {
              Object.values(SOCIAL_LOGIN).map((item, index) => (
                <Button
                  key={index}
                  preset="ghost"
                  onPress={item.handler}
                  style={{ marginHorizontal: 10 }}
                >
                  <Image
                    source={item.icon}
                    style={{ height: 30, width: 30 }}
                  />
                </Button>
              ))
            }
          </View>
        </View>
      </View>
    </Layout>
  )
})
