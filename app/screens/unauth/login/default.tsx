import React, { useState, useRef } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../models"
import { AutoImage as Image, Text, FloatingInput, Button } from "../../../components"
import { useMixins } from "../../../services/mixins"
import { commonStyles } from "../../../theme"
import { APP_ICON, SOCIAL_LOGIN_ICON } from "../../../common/mappings"
import { useSocialLoginMixins } from "../../../services/mixins/social-login"
import { IS_IOS } from "../../../config/constants"


type Props = {
  nextStep: (username: string, password: string, methods: { type: string, data: any }[]) => void
  onLoggedIn: () => void
  handleForgot: () => void
}


export const DefaultLogin = observer((props: Props) => {
  const { user, uiStore } = useStores()
  const { translate, notify, notifyApiError, setApiTokens } = useMixins()
  const { googleLogin, facebookLogin, githubLogin, appleLogin } = useSocialLoginMixins()
  const { nextStep, onLoggedIn, handleForgot } = props

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [username, setUsername] = useState(user.email || '')
  const [password, setPassword] = useState('')
  const passwordRef = useRef(null)

  // ------------------ Methods ----------------------

  const handleLogin = async () => {
    setIsLoading(true)
    setIsError(false)
    const payload = { username, password }
    const res = await user.login(payload)
    setIsLoading(false)
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
      setPassword('')
      if (res.data.is_factor2) {
        nextStep(username, password, res.data.methods)
      } else {
        // @ts-ignore
        setApiTokens(res.data?.access_token)
        onLoggedIn()
      }
    }
  }

  // ------------------------------ DATA -------------------------------

  const SOCIAL_LOGIN: {
    [service: string]: {
      hide?: boolean
      size?: number
      marginBottom?: number
      icon: any
      handler: () => void
    }
  } = {
    apple: {
      hide: !IS_IOS,
      size: 34,
      marginBottom: 4,
      icon: uiStore.isDark ? SOCIAL_LOGIN_ICON.appleLight : SOCIAL_LOGIN_ICON.apple,
      handler: () => {
        return appleLogin({
          setIsLoading,
          onLoggedIn
        })
      }
    },

    google: {
      icon: SOCIAL_LOGIN_ICON.google,
      handler: () => {
        return googleLogin({
          setIsLoading,
          onLoggedIn
        })
      }
    },

    facebook: {
      icon: SOCIAL_LOGIN_ICON.facebook,
      handler: () => {
        return facebookLogin({
          setIsLoading,
          onLoggedIn
        })
      }
    },

    github: {
      icon: uiStore.isDark ? SOCIAL_LOGIN_ICON.githubLight : SOCIAL_LOGIN_ICON.github,
      handler: () => {
        return githubLogin({
          setIsLoading,
          onLoggedIn
        })
      }
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
        onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
      />
      {/* Username input end */}

      {/* Password input */}
      <FloatingInput
        outerRef={passwordRef}
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
            Object.values(SOCIAL_LOGIN).filter(item => !item.hide).map((item, index) => (
              <Button
                key={index}
                preset="ghost"
                onPress={item.handler}
                style={{ marginHorizontal: 10 }}
              >
                <Image
                  source={item.icon}
                  style={{ 
                    height: item.size || 30, 
                    width: item.size || 30,
                    marginBottom: item.marginBottom || 0
                  }}
                />
              </Button>
            ))
          }
        </View>
      </View>
    </View>
  )
})
