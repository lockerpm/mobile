import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../models'
import { useMixins } from '.'
import { useCipherAuthenticationMixins } from './cipher/authentication'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { GOOGLE_CLIENT_ID, GITHUB_CONFIG } from '../../config/constants'
import { Logger } from '../../utils/logger'
import { LoginManager, AccessToken } from "react-native-fbsdk-next"
import { authorize } from 'react-native-app-auth'
import { appleAuth } from '@invertase/react-native-apple-authentication'


const { createContext, useContext } = React

// Mixins data
const defaultData = {
  googleLogin: async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: () => void
  }) => null,
  facebookLogin: async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: () => void
  }) => null,
  githubLogin: async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: () => void
  }) => null,
  appleLogin: async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: () => void
  }) => null
}


export const SocialLoginMixinsContext = createContext(defaultData)

export const SocialLoginMixinsProvider = observer((props: {
  children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal
  navigationRef?: any
}) => {
  const { user } = useStores()
  const { notifyApiError, notify, translate } = useMixins()
  const { setApiTokens } = useCipherAuthenticationMixins()

  // ------------------ METHODS ---------------------

  // Google
  const googleLogin = async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: () => void
  }) => {
    const { setIsLoading, onLoggedIn } = payload
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_ID
      })
      await GoogleSignin.signIn()
      const tokens = await GoogleSignin.getTokens()
      await _handleSocialLogin({
        provider: 'google',
        token: tokens.accessToken,
        setIsLoading,
        onLoggedIn
      })
    } catch (e) {
      setIsLoading && setIsLoading(false)
      Logger.error(e)
      notify('error', translate('error.something_went_wrong'))
    }
  }

  // Facebook
  const facebookLogin = async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: () => void
  }) => {
    const { setIsLoading, onLoggedIn } = payload
    try {
      let res = await AccessToken.getCurrentAccessToken()
      if (!res) {
        await LoginManager.logInWithPermissions(['public_profile', 'email'])
        res = await AccessToken.getCurrentAccessToken()
        if (!res) {
          setIsLoading && setIsLoading(false)
          notify('error', translate('error.something_went_wrong'))
          return
        }
      }
      await _handleSocialLogin({
        provider: 'facebook',
        token: res.accessToken,
        setIsLoading,
        onLoggedIn
      })
    } catch (e) {
      setIsLoading && setIsLoading(false)
      Logger.error(e)
      notify('error', translate('error.something_went_wrong'))
    }
  }

  // Github
  const githubLogin = async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: () => void
  }) => {
    const { setIsLoading, onLoggedIn } = payload
    try {
      const res = await authorize(GITHUB_CONFIG)
      if (!res) {
        setIsLoading && setIsLoading(false)
        notify('error', translate('error.something_went_wrong'))
        return
      }
      await _handleSocialLogin({
        provider: 'github',
        token: res.accessToken,
        setIsLoading,
        onLoggedIn
      })
    } catch (e) {
      setIsLoading && setIsLoading(false)
      Logger.error(e)
      notify('error', translate('error.something_went_wrong'))
    }
  }

  // Apple
  const appleLogin = async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: () => void
  }) => {
    const { setIsLoading, onLoggedIn } = payload
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL],
      })
      console.log(appleAuthRequestResponse)
      await _handleSocialLogin({
        provider: 'apple',
        token: appleAuthRequestResponse.identityToken,
        setIsLoading,
        onLoggedIn
      })
    } catch (e) {
      setIsLoading && setIsLoading(false)
      Logger.error(e)
      notify('error', translate('error.something_went_wrong'))
    }
  }

  // ------------------ PRIVATE METHODS ---------------------

  const _handleSocialLogin = async (payload: {
    provider: string
    token: string
    setIsLoading?: (val: boolean) => void
    onLoggedIn: () => void
  }) => {
    const { provider, token, setIsLoading, onLoggedIn } = payload

    setIsLoading && setIsLoading(true)
    const loginRes = await user.socialLogin({
      provider: provider,
      access_token: token
    })
    setIsLoading && setIsLoading(false)
    if (loginRes.kind !== 'ok') {
      notifyApiError(loginRes)
      notify('error', translate('error.login_failed'))
    } else {
      // @ts-ignore
      setApiTokens(loginRes.data?.access_token)
      onLoggedIn()
    }
  }

  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    googleLogin,
    facebookLogin,
    githubLogin,
    appleLogin
  }

  return (
    <SocialLoginMixinsContext.Provider value={data}>
      {props.children}
    </SocialLoginMixinsContext.Provider>
  )
})

export const useSocialLoginMixins = () => useContext(SocialLoginMixinsContext)
