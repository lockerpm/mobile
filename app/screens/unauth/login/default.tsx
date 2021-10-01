import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../models"
import { AutoImage as Image, Text, FloatingInput, Button } from "../../../components";
import { useMixins } from "../../../services/mixins"
import { commonStyles } from "../../../theme"
import { APP_ICON, SOCIAL_LOGIN_ICON } from "../../../common/mappings"
import { LoginManager } from 'react-native-fbsdk-next'
import { GoogleSignin } from '@react-native-google-signin/google-signin'


type Props = {
  navigation: any
}


export const DefaultLogin = observer(function DefaultLogin(props: Props) {
  const { user } = useStores()
  const { translate, notify } = useMixins()
  const { navigation } = props

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // ------------------ Methods ----------------------

  const handleLogin = async () => {
    setIsLoading(true)
    setIsError(false)
    const payload = { username, password }
    const res = await user.login(payload)
    if (res.kind !== 'ok') {
      setIsError(true)
      notify('error', translate('error.login_failed'))
    } else {
      if (res.data.is_factor2) {

      } else {
        await Promise.all([
          user.getUser(),
          user.getUserPw()
        ])
        if (user.is_pwd_manager) {
          navigation.navigate('lock')
        } else {
          navigation.navigate('createMasterPassword')
        }
      }
    }
    setIsLoading(false)
  }

  const handleForgot = () => {

  }

  // ------------------------------ DATA -------------------------------

  const SOCIAL_LOGIN = {
    google: {
      icon: SOCIAL_LOGIN_ICON.google,
      handler: async () => {
        try {
          GoogleSignin.configure({
            webClientId: '981402643553-rco2fb2lhbbpeihjt81p7pk86rs6tull.apps.googleusercontent.com'
          })
          const res = await GoogleSignin.signIn();
          console.log(res)
          notify('success', 'ok')
        } catch (e) {
          notify('error', 'error')
        }
      }
    },

    facebook: {
      icon: SOCIAL_LOGIN_ICON.facebook,
      handler: async () => {
        try {
          const res = await LoginManager.logInWithPermissions(['public_profile', 'email'])
          console.log(res)
          notify('success', 'ok')
        } catch (e) {
          console.log(e)
          notify('error', 'error')
        }
      }
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
        source={APP_ICON.icon} 
        style={{ height: 63, marginBottom: 40, marginTop: 30 }}
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
