import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { WebView, WebViewNavigation  } from 'react-native-webview';
import { Loading } from "../../../components";
import { REGISTER_URL } from "../../../config/constants";

export const SignupScreen = observer(function SignupScreen() {
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
      const [getUserRes, getUserPwRes] = await Promise.all([
        user.getUser(),
        user.getUserPw()
      ])
      if (getUserRes && getUserPwRes) {
        if (user.is_pwd_manager) {
          navigation.navigate('lock')
        } else {
          navigation.navigate('createMasterPassword')
        }
      } else {
        navigation.navigate('onBoarding')
      }
    }
  }

  // Mounted
  useEffect(() => {
    if (!isScreenReady) {
      if (user.isLoggedIn) {
        user.logout().then(() => {
          setIsLoading(false)
          setIsScreenReady(true)
        })
      } else {
        user.clearToken()
        setIsLoading(false)
        setIsScreenReady(true)
      }
    }
  }, [isScreenReady])

  return isLoading ? (
    <Loading />
  ) : (
    <WebView
      source={{ uri: REGISTER_URL }}
      onNavigationStateChange={onWebViewNavigationStateChange}
    />
  )
})
