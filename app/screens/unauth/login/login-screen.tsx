import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { WebView, WebViewNavigation  } from 'react-native-webview';
import { Loading } from "../../../components";

export const LoginScreen = observer(function LoginScreen() {
  const { user } = useStores()
  const navigation = useNavigation()

  // Params
  const [isLoading, setIsLoading] = useState(true)
  const [isScreenReady, setIsScreenReady] = useState(false)

  // Helpers
  const getParamFromUrl = (name : string, url: string) => {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

  // Actions
  const onWebViewNavigationStateChange = async (state: WebViewNavigation) => {
    const token = getParamFromUrl('token', state.url)
    if (token && !user.token) {
      setIsLoading(true)
      user.saveToken(token)
      const [userRes, userPwRes] = await Promise.all([
        user.getUser(),
        user.getUserPw()
      ])
      if (userRes.kind === 'ok' && userPwRes.kind === 'ok') {
        if (user.is_pwd_manager) {
          navigation.navigate('lock', { skipCheck: true })
        } else {
          navigation.navigate('createMasterPassword', { skipCheck: true })
        }
      } else {
        navigation.navigate('onBoarding')
      }
    }
  }

  // Mounted
  useEffect(() => {
    if (!isScreenReady) {
      user.clearToken()
      setIsLoading(false)
      setIsScreenReady(true)
    }
  }, [isScreenReady])

  return isLoading ? (
    <Loading />
  ) : (
    <WebView
      source={{ uri: 'https://id.cystack.net/login?SERVICE_URL=%2F&SERVICE_SCOPE=pwdmanager' }}
      onNavigationStateChange={onWebViewNavigationStateChange}
    />
  )
})
