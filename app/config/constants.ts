import { Platform } from "react-native"
import Config from "react-native-config"

export const IS_PROD = Config.IS_PROD === "1"

export const IS_IOS = Platform.OS === "ios"

export const LOGIN_URL = Config.LOGIN_URL
export const REGISTER_URL = Config.REGISTER_URL
export const BASE_URL = Config.BASE_URL
export const QUICK_SHARE_BASE_URL = Config.QUICK_SHARE_BASE_URL
export const GET_LOGO_URL = Config.GET_LOGO_URL
export const WS_URL = Config.WS_URL

// SENTRY LOG
export const DSN_SENTRY = Config.DSN_SENTRY

// SERVICES

export const GOOGLE_CLIENT_ID = IS_IOS
  ? Config.GOOGLE_CLIENT_ID_IOS
  : Config.GOOGLE_CLIENT_ID_ANDROID

export const SHARED_KEYCHAIN_SERVICE = Config.SHARED_KEYCHAIN_SERVICE
export const SHARED_KEYCHAIN_ACCESS_GROUP = Config.SHARED_KEYCHAIN_ACCESS_GROUP

export const GITHUB_CONFIG = {
  redirectUrl: Config.GITHUB_CONFIG_REDIRECTURL,
  clientId: Config.GITHUB_CONFIG_CLIENTID,
  scopes: ["user:email"],
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
}

export const RECAPTCHA_SITE_KEY = Config.RECAPTCHA_SITE_KEY
export const RECAPTCHA_BASE_URL = Config.RECAPTCHA_BASE_URL

// STAGING
export const CF_ACCESS_CLIENT_SECRET = Config.CF_ACCESS_CLIENT_SECRET
export const CF_ACCESS_CLIENT_ID = Config.CF_ACCESS_CLIENT_ID

// APP FLYER
export const APPS_FLYER_DEV_KEY = Config.APPS_FLYER_DEV_KEY
export const APPS_FLYER_APP_ID = Config.APPS_FLYER_APP_ID

// VIN SSO AUTHEN
export const VIN_AUTH_ENDPOINT = Config.VIN_AUTH_ENDPOINT
export const VIN_AUTH_CALLBACK = Config.VIN_AUTH_CALLBACK

// Chat woot
export const CHATWOOT_WEBSITE_TOKEN = Config.CHATWOOT_WEBSITE_TOKEN
export const CHATWOOT_BASE_URL = Config.CHATWOOT_BASE_URL
