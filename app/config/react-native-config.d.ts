declare module "react-native-config" {
  export interface NativeConfig {
    IS_PROD: string

    BASE_URL: string
    QUICK_SHARE_BASE_URL: string
    GET_LOGO_URL: string
    WS_URL: string

    GOOGLE_CLIENT_ID_ANDROID: string
    GOOGLE_CLIENT_ID_IOS: string

    SHARED_KEYCHAIN_SERVICE: string
    SHARED_KEYCHAIN_ACCESS_GROUP: string

    GITHUB_CONFIG_REDIRECTURL: string
    GITHUB_CONFIG_CLIENTID: string

    RECAPTCHA_SITE_KEY: string
    RECAPTCHA_BASE_URL: string

    SSL_PINNING_HOST: string
    SSL_PINNING_PUB_KEY_1: string
    SSL_PINNING_PUB_KEY_2: string

    CF_ACCESS_CLIENT_ID: string
    CF_ACCESS_CLIENT_SECRET: string

    DSN_SENTRY: string

    APPS_FLYER_DEV_KEY: string
    APPS_FLYER_APP_ID: string

    CHATWOOT_WEBSITE_TOKEN: string
    CHATWOOT_BASE_URL: string
  }

  export const Config: NativeConfig
  export default Config
}
