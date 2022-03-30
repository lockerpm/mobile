import React from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../models'
import { useMixins } from '.'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { GOOGLE_CLIENT_ID, GITHUB_CONFIG } from '../../config/constants'
import { Logger } from '../../utils/logger'
import { LoginManager, AccessToken } from "react-native-fbsdk-next"
import { authorize, logout } from 'react-native-app-auth'
import { appleAuth } from '@invertase/react-native-apple-authentication'
import { saveSecure, loadSecure, removeSecure } from '../../utils/storage'


enum StorageKeys {
  GITHUB_ID_TOKEN = 'SOCIAL_LOGIN__GITHUB__ID_TOKEN'
}

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
  }) => null,
  logoutAllServices: async () => null
}


export const SocialLoginMixinsContext = createContext(defaultData)

export const SocialLoginMixinsProvider = observer((props: {
  children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal
  navigationRef?: any
}) => {
  const { user } = useStores()
  const { notifyApiError, notify, translate, setApiTokens } = useMixins()

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
      Logger.error('googleLogin: ' + e)
      switch (e.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          break
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          notify('error', translate('error.social_login.google.play_service_not_available'))
          break
        default:
          notify('error', translate('error.could_not_complete'))
      }
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
        await LoginManager.logInWithPermissions(['email'])
        res = await AccessToken.getCurrentAccessToken()
        if (!res) {
          // notify('error', translate('error.something_went_wrong'))
          setIsLoading && setIsLoading(false)
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
      Logger.error('facebookLogin: ' + e)
      notify('error', translate('error.could_not_complete'))
    }
  }

  // GitHub
  const githubLogin = async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: () => void
  }) => {
    const { setIsLoading, onLoggedIn } = payload
    try {
      const res = await authorize(GITHUB_CONFIG)
      if (!res) {
        setIsLoading && setIsLoading(false)
        // notify('error', translate('error.something_went_wrong'))
        return
      }
      saveSecure(StorageKeys.GITHUB_ID_TOKEN, res.idToken)
      await _handleSocialLogin({
        provider: 'github',
        token: res.accessToken,
        setIsLoading,
        onLoggedIn
      })
    } catch (e) {
      setIsLoading && setIsLoading(false)
      Logger.error('githubLogin: ' + e)
      switch (e.code) {
        case 'authentication_failed':
        case 'authentication_error':
        case 'access_denied':
          break
        case 'token_refresh_failed':
          notify('error', translate('error.social_login.github.token_refresh_failed'))
          _logoutGitHub()
          break
        case 'registration_failed':
          notify('error', translate('error.social_login.github.registration_failed'))
          break
        case 'browser_not_found':
          notify('error', translate('error.social_login.github.browser_not_found'))
          break
        case 'service_configuration_fetch_error':
          notify('error', translate('error.social_login.github.service_configuration_fetch_error'))
          break
        default:
          notify('error', translate('error.could_not_complete'))
      }
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
      await _handleSocialLogin({
        provider: 'apple',
        token: appleAuthRequestResponse.identityToken,
        setIsLoading,
        onLoggedIn
      })
    } catch (e) {
      setIsLoading && setIsLoading(false)
      Logger.error('appleLogin: ' + e)
      switch (e.code) {
        case '1001':
          break
        case '1000':
          notify('error', translate('error.social_login.apple.could_not_complete'))
          break
        default:
          notify('error', translate('error.could_not_complete'))
      }
    }
  }

  // Log out all service
  const logoutAllServices = async () => {
    await Promise.all([
      _logoutGoogle(),
      _logoutFacebook(),
      _logoutGitHub()
    ])
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
      if (loginRes.kind === 'bad-data' && loginRes.data.code === '1011') {
        notify('error', translate('error.social_login.cannot_get_email'))
      } else {
        notifyApiError(loginRes)
      }
      await logoutAllServices()
    } else {
      // @ts-ignore
      setApiTokens(loginRes.data?.access_token)
      onLoggedIn()
    }
  }

  const _logoutGoogle = async () => {
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_ID
      })
      const isSignedIn = await GoogleSignin.isSignedIn()
      if (isSignedIn) {
        await GoogleSignin.signOut()
      }
    } catch (e) {
      Logger.error('Log out Google: ' + e)
    }
  }

  const _logoutFacebook = async () => {
    try {
      if (await AccessToken.getCurrentAccessToken()) {
        LoginManager.logOut()
      }
    } catch (e) {
      Logger.error('Log out Facebook: ' + e)
    }
  }

  const _logoutGitHub = async () => {
    try {
      const idToken = await loadSecure(StorageKeys.GITHUB_ID_TOKEN)
      if (idToken) {
        await logout(GITHUB_CONFIG, {
          idToken,
          postLogoutRedirectUrl: ''
        })
        removeSecure(StorageKeys.GITHUB_ID_TOKEN)
      }
    } catch (e) {
      Logger.error('Log out GitHub: ' + e)
    }
  }

  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    googleLogin,
    facebookLogin,
    githubLogin,
    appleLogin,
    logoutAllServices
  }

  return (
    <SocialLoginMixinsContext.Provider value={data}>
      {props.children}
    </SocialLoginMixinsContext.Provider>
  )
})

export const useSocialLoginMixins = () => useContext(SocialLoginMixinsContext)
