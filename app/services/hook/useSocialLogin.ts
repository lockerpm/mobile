import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin"
import { LoginManager, AccessToken, AuthenticationToken } from "react-native-fbsdk-next"
import { appleAuth } from "@invertase/react-native-apple-authentication"
import { getCookies, logRegisterSuccessEvent } from "../../utils/analytics"
import { useStores } from "app/models"
import { useHelper } from "./useHelper"
import { useToast } from "../utils"
import Config from "@/config"
import { Logger } from "@/utils/logger"
import { Platform } from "react-native"

export function useSocialLogin() {
  const { user } = useStores()
  const { setApiTokens } = useHelper()
  const { notifyTx, notifyApiError } = useToast()

  // Google
  const googleLogin = async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: (newUser: boolean, token: string) => void
  }) => {
    const { setIsLoading, onLoggedIn } = payload
    try {
      GoogleSignin.configure({
        webClientId: Config.GOOGLE_CLIENT_ID,
      })
      await GoogleSignin.signIn()
      const tokens = await GoogleSignin.getTokens()
      await _handleSocialLogin({
        provider: "google",
        token: tokens.accessToken,
        setIsLoading,
        onLoggedIn,
      })
    } catch (e: any) {
      if (setIsLoading) {
        setIsLoading(false)
      }
      Logger.debug("googleLogin: " + e)
      switch (e.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          break
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          notifyTx("error", "error:social_login.google.play_service_not_available")
          break
        default:
          notifyTx("error", "error:could_not_complete")
      }
    }
  }

  const getFacebookToken = async () => {
    if (Platform.OS === "ios") {
      const res = await AuthenticationToken.getAuthenticationTokenIOS()
      return res?.authenticationToken || null
    }
    if (Platform.OS === "android") {
      const res = await AccessToken.getCurrentAccessToken()
      return res?.accessToken || null
    }

    return null
  }

  // Facebook
  const facebookLogin = async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: (newUser: boolean, token: string) => void
  }) => {
    const { setIsLoading, onLoggedIn } = payload
    try {
      await LoginManager.logInWithPermissions(["email"])
      const token = await getFacebookToken()
      if (!token) {
        if (setIsLoading) {
          setIsLoading(false)
        }
        return
      }
      await _handleSocialLogin({
        provider: "facebook",
        token: token,
        setIsLoading,
        onLoggedIn,
      })
    } catch (e) {
      if (setIsLoading) {
        setIsLoading(false)
      }
      Logger.debug("facebookLogin: " + e)
      notifyTx("error", "error:could_not_complete")
    }
  }

  // GitHub
  const githubLogin = async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: (newUser: boolean, token: string) => void
    code: string
  }) => {
    const { setIsLoading, onLoggedIn, code } = payload
    await _handleSocialLogin({
      provider: "github",
      code,
      setIsLoading,
      onLoggedIn,
    })
  }

  // Apple
  const appleLogin = async (payload: {
    setIsLoading?: (val: boolean) => void
    onLoggedIn: (newUser: boolean, token: string) => void
  }) => {
    const { setIsLoading, onLoggedIn } = payload
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL],
      })
      await _handleSocialLogin({
        provider: "apple",
        token: appleAuthRequestResponse.identityToken ?? "",
        setIsLoading,
        onLoggedIn,
      })
    } catch (e: any) {
      if (setIsLoading) {
        setIsLoading(false)
      }
      Logger.debug("appleLogin: " + e)
      switch (e.code) {
        case "1001":
          break
        case "1000":
          notifyTx("error", "error:social_login.apple.could_not_complete")
          break
        default:
          notifyTx("error", "error:could_not_complete")
      }
    }
  }

  // Log out all service
  const logoutAllServices = async () => {
    await Promise.all([_logoutGoogle(), _logoutFacebook()])
  }

  // ------------------ PRIVATE METHODS ---------------------

  const _handleSocialLogin = async (payload: {
    provider: string
    token?: string
    code?: string
    setIsLoading?: (val: boolean) => void
    onLoggedIn: (newUser: boolean, token: string) => void
  }) => {
    const { provider, token, code, setIsLoading, onLoggedIn } = payload

    if (setIsLoading) {
      setIsLoading(true)
    }

    const loginRes = await user.socialLogin({
      provider,
      access_token: token,
      code,
      scope: "pwdmanager",
      utm_source: await getCookies("utm_source"),
    })

    if (setIsLoading) {
      setIsLoading(false)
    }
    if (loginRes.kind !== "ok") {
      notifyApiError(loginRes)
      await logoutAllServices()
    } else {
      if (loginRes.data.is_first) {
        logRegisterSuccessEvent()
      }
      const accessToken = loginRes.data.tmp_token || loginRes.data.token
      const res = await user.getPMToken(accessToken)

      if (res.kind !== "ok") {
        if (res.kind === "bad-data" && res.data.code === "1011") {
          notifyTx("error", "error:social_login.cannot_get_email")
        } else {
          notifyApiError(res)
        }
        await logoutAllServices()
      } else {
        setApiTokens(res.data?.access_token)
        onLoggedIn(loginRes.data.is_first ?? false, loginRes.data.token)
      }
    }
  }

  const _logoutGoogle = async () => {
    try {
      GoogleSignin.configure({
        webClientId: Config.GOOGLE_CLIENT_ID,
      })
      const isSignedIn = GoogleSignin.hasPreviousSignIn()
      if (isSignedIn) {
        await GoogleSignin.signOut()
      }
    } catch (e) {
      Logger.error("Log out Google: " + e)
    }
  }

  const _logoutFacebook = async () => {
    try {
      if (await AccessToken.getCurrentAccessToken()) {
        LoginManager.logOut()
      }
    } catch (e) {
      Logger.error("Log out Facebook: " + e)
    }
  }

  return {
    googleLogin,
    facebookLogin,
    githubLogin,
    appleLogin,
    logoutAllServices,
  }
}
