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

export const TERMS_URL = Config.TERMS_URL
export const PRIVACY_POLICY_URL = Config.PRIVACY_POLICY_URL
export const HELP_CENTER_URL = Config.HELP_CENTER_URL
export const REPORT_VULN = Config.REPORT_VULN

export const SHARED_KEYCHAIN_SERVICE = Config.SHARED_KEYCHAIN_SERVICE
export const SHARED_KEYCHAIN_ACCESS_GROUP = Config.SHARED_KEYCHAIN_ACCESS_GROUP

export const RECAPTCHA_SITE_KEY = Config.RECAPTCHA_SITE_KEY
export const RECAPTCHA_BASE_URL = Config.RECAPTCHA_BASE_URL

// STAGING
export const CF_ACCESS_CLIENT_SECRET = Config.CF_ACCESS_CLIENT_SECRET
export const CF_ACCESS_CLIENT_ID = Config.CF_ACCESS_CLIENT_ID
