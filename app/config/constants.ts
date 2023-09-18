import { Platform } from 'react-native'
import Config from 'react-native-config'

export const IS_PROD = Config.IS_PROD === '1'

export const IS_IOS = Platform.OS === 'ios'

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

export const TERMS_URL = Config.TERMS_URL
export const PRIVACY_POLICY_URL = Config.PRIVACY_POLICY_URL
export const HELP_CENTER_URL = Config.HELP_CENTER_URL
export const MANAGE_PLAN_URL = Config.MANAGE_PLAN_URL
export const REPORT_VULN = Config.REPORT_VULN

export const SHARED_KEYCHAIN_SERVICE = Config.SHARED_KEYCHAIN_SERVICE
export const SHARED_KEYCHAIN_ACCESS_GROUP = Config.SHARED_KEYCHAIN_ACCESS_GROUP

export const GITHUB_CONFIG = {
  redirectUrl: Config.GITHUB_CONFIG_REDIRECTURL,
  clientId: Config.GITHUB_CONFIG_CLIENTID,
  scopes: ['user:email'],
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
}

export const RECAPTCHA_SITE_KEY = Config.RECAPTCHA_SITE_KEY
export const RECAPTCHA_BASE_URL = Config.RECAPTCHA_BASE_URL

// STAGING
export const CF_ACCESS_CLIENT_SECRET = Config.CF_ACCESS_CLIENT_SECRET
export const CF_ACCESS_CLIENT_ID = Config.CF_ACCESS_CLIENT_ID

// APP FLYER
export const APPS_FLYER_DEV_KEY = Config.APPS_FLYER_DEV_KEY
export const APPS_FLYER_APP_ID = Config.APPS_FLYER_APP_ID

// PERMISSIONS

export const TEAM_COLLECTION_EDITOR = ['owner', 'admin']
export const TEAM_CIPHER_EDITOR = ['owner', 'admin', 'manager']

// DATA

export const TEMP_PREFIX = 'tmp__'
export const MAX_MULTIPLE_SHARE_COUNT = 20
export const IMPORT_BATCH_SIZE = 1000
export const BACKGROUND_DECRYPT_FIRST_BATCH_SIZE = 50
export const BACKGROUND_DECRYPT_BATCH_SIZE = 500
export const BACKGROUND_DECRYPT_REINDEX_EVERY = 2
export const MAX_CIPHER_SELECTION = 10000
export const MASTER_PW_MIN_LENGTH = 8

// FAMILY

export const FAMILY_MEMBER_LIMIT = 6

// FREE

export const FREE_PLAN_LIMIT = {
  CRYPTO: 5,
  IDENTITY: 10,
  LOGIN: 100,
  PAYMENT_CARD: 5,
  NOTE: 50,
}

export const GEN = {
  MALE: 't',
  FEMALE: 'f',
  OTHER: 'o',
}
