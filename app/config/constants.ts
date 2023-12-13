import { Platform } from 'react-native'
import Config from 'react-native-config'

export const IS_IOS = Platform.OS === 'ios'

export const BASE_URL = Config.BASE_URL
export const QUICK_SHARE_BASE_URL = Config.QUICK_SHARE_BASE_URL
export const WS_URL = Config.WS_URL


// apple keychian
export const SHARED_KEYCHAIN_SERVICE = 'W7S57TNBH5.com.cystack.locker.vincss'
export const SHARED_KEYCHAIN_ACCESS_GROUP = 'group.com.cystack.locker.vincss'

// User custom
export const GET_LOGO_URL = ''
export const TERMS_URL = ''
export const PRIVACY_POLICY_URL = ''
export const HELP_CENTER_URL = ''
export const REPORT_VULN = ''
export const RECAPTCHA_SITE_KEY = ''
export const RECAPTCHA_BASE_URL = ''

