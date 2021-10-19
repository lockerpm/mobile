import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../models"
import { AutoImage as Image, Text, FloatingInput, Button } from "../../../components"
import { useMixins } from "../../../services/mixins"
import { commonStyles } from "../../../theme"
import { APP_ICON, SOCIAL_LOGIN_ICON } from "../../../common/mappings"
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { GOOGLE_CLIENT_ID } from "../../../config/constants"


type Props = {
  nextStep: (username: string, password: string, methods: { type: string, data: any }[]) => void
  onLoggedIn: () => void
  handleForgot: () => void
}


export const DefaultLogin = observer(function DefaultLogin(props: Props) {
  const { user } = useStores()
  const { translate, notify } = useMixins()
  const { nextStep, onLoggedIn, handleForgot } = props

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [username, setUsername] = useState(user.email || '')
  const [password, setPassword] = useState('')

  // ------------------ Methods ----------------------

  const handleLogin = async () => {
    setIsLoading(true)
    setIsError(false)
    const payload = { username, password }
    const res = await user.login(payload)
    setIsLoading(false)
    if (res.kind !== 'ok') {
      setIsError(true)
      notify('error', translate('error.login_failed'))
    } else {
      setPassword('')
      if (res.data.is_factor2) {
        nextStep(username, password, res.data.methods)
      } else {
        onLoggedIn()
      }
    }
  }

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
      handler: async () => {}
    },

    github: {
      icon: SOCIAL_LOGIN_ICON.github,
      handler: () => {}
    }
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <View style={{ alignItems: 'center', paddingTop: '10%' }}>
      <Image 
        source={APP_ICON.iconDark} 
        style={{ height: 63, width: 63, marginBottom: 10, marginTop: 30 }}
      />

      <Text
        preset="header"
        text={translate('login.title')}
        style={{ marginBottom: 20 }}
      />

      {/* Username input */}
      <FloatingInput
        isInvalid={isError}
        label={translate('login.email_or_username')}
        onChangeText={setUsername}
        value={username}
        style={{ width: '100%', marginBottom: 10 }}
      />
      {/* Username input end */}

      {/* Password input */}
      <FloatingInput
        isPassword
        isInvalid={isError}
        label={translate('common.password')}
        onChangeText={setPassword}
        value={password}
        style={{ width: '100%' }}
        onSubmitEditing={handleLogin}
      />
      {/* Password input end */}

      <View style={{ 
        width: '100%', 
        alignItems: 'flex-start',
        marginTop: 25,
        marginBottom: 20
      }}>
        <Button
          preset="link"
          text={translate("login.forgot_password")}
          onPress={handleForgot}
        />
      </View>

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || !(username && password)}
        text={translate("common.login")}
        onPress={handleLogin}
        style={{
          width: '100%',
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
  )
})
