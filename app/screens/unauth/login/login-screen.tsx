import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "../../../models"
import { WebView, WebViewNavigation  } from 'react-native-webview';
import { Loading } from "../../../components";

export const LoginScreen = observer(function LoginScreen() {
  // Pull in one of our MST stores
  const { user } = useStores()

  // Pull in navigation via hook
  const navigation = useNavigation()

  // Params
  let tokenFlag = false
  const [isLoading, setIsLoading] = useState(false)

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
    if (token && !tokenFlag) {
      tokenFlag = true
      setIsLoading(true)
      user.saveToken(token)
      const isSuccess = await user.getUser()
      if (isSuccess) {
        navigation.navigate('lock')
      } else {
        navigation.navigate('onBoarding')
      }
    }
  }

  return isLoading ? (
    <Loading />
  ) : (
    <WebView
      source={{ uri: 'https://id.cystack.net/login?SERVICE_URL=%2F&SERVICE_SCOPE=pwdmanager' }}
      onNavigationStateChange={onWebViewNavigationStateChange}
    />
  )
})
