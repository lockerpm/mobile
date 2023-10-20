import { Platform } from 'react-native'
import Config from 'react-native-config'

export const IS_IOS = Platform.OS === 'ios'

export const BASE_URL = Config.BASE_URL
export const QUICK_SHARE_BASE_URL = Config.QUICK_SHARE_BASE_URL
export const WS_URL = Config.WS_URL

// User custom
export const GET_LOGO_URL = Config.GET_LOGO_URL
export const TERMS_URL = Config.TERMS_URL
export const PRIVACY_POLICY_URL = Config.PRIVACY_POLICY_URL
export const HELP_CENTER_URL = Config.HELP_CENTER_URL
export const REPORT_VULN = Config.REPORT_VULN

// apple keychian
export const SHARED_KEYCHAIN_SERVICE = Config.SHARED_KEYCHAIN_SERVICE
export const SHARED_KEYCHAIN_ACCESS_GROUP = Config.SHARED_KEYCHAIN_ACCESS_GROUP

export const RECAPTCHA_SITE_KEY = ''
export const RECAPTCHA_BASE_URL = ''
// export const RECAPTCHA_SITE_KEY = Config.RECAPTCHA_SITE_KEY
// export const RECAPTCHA_BASE_URL = Config.RECAPTCHA_BASE_URL
