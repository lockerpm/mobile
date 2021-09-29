import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { Layout, AutoImage as Image, Text, FloatingInput, Button } from "../../../components";
import { useMixins } from "../../../services/mixins"
import { commonStyles } from "../../../theme"
import { APP_ICON } from "../../../common/mappings"
import { LoginManager } from 'react-native-fbsdk-next'
import { GoogleSignin } from '@react-native-google-signin/google-signin'


export const LoginScreen = observer(function LoginScreen() {
  const { user } = useStores()
  const navigation = useNavigation()
  const { translate, notify } = useMixins()

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // ------------------ Methods ----------------------

  const handleLogin = () => {

  }

  const handleForgot = () => {

  }

  const handleFBLogin = async () => {
    try {
      const res = await LoginManager.logInWithPermissions(['public_profile', 'email'])
      console.log(res)
      notify('success', 'ok')
    } catch (e) {
      console.log(e)
      notify('error', 'error')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      GoogleSignin.configure({
        webClientId: '31609893092-0etuuag1o662fpa0c6sap5v96lc44onb.apps.googleusercontent.com'
      })
      const res = await GoogleSignin.signIn();
      console.log(res)
      notify('success', 'ok')
    } catch (e) {
      console.log(e)
      console.log(Object.keys(e))
      console.log(e.message)
      console.log(e.code)
      notify('error', 'error')
    }
  }

  return (
    <Layout
      footer={(
        <View
          style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
            marginTop: 12,
            marginBottom: 24,
            justifyContent: 'center'
          }]}
        >
          <Text
            text={translate("login.no_account")}
            style={{
              marginRight: 8,
            }}
          />
          <Button
            preset="link"
            text={translate("common.sign_up")}
            onPress={() => navigation.navigate("signup")}
          />
        </View>
      )}
    >
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
          style={{ width: '100%' }}
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

        <Button
          isLoading={isLoading}
          isDisabled={isLoading || !(username && password)}
          text={translate("common.login")}
          onPress={handleLogin}
          style={{
            width: '100%',
            marginTop: 40
          }}
        />

        <Button
          text={'test'}
          onPress={handleFBLogin}
          style={{
            width: '100%',
            marginVertical: 10
          }}
        />

        <Button
          text={'test 2'}
          onPress={handleGoogleLogin}
          style={{
            width: '100%',
            marginVertical: 10
          }}
        />

        <Button
          preset="ghost"
          text={translate("login.forgot_password")}
          onPress={handleForgot}
          style={{
            width: '100%'
          }}
        />
      </View>
    </Layout>
  )
})
