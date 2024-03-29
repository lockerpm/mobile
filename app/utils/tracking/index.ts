import * as Sentry from '@sentry/react-native'
import appsFlyer from 'react-native-appsflyer'
import { APPS_FLYER_APP_ID, APPS_FLYER_DEV_KEY, DSN_SENTRY } from '../../config/constants'
import { Logger } from '../utils'

export const initSentry = () => {
  !__DEV__ &&
    Sentry.init({
      dsn: DSN_SENTRY,

      tracesSampleRate: 0.1,
    })
}

export const initAppFlyer = () => {
  !__DEV__ &&
    appsFlyer.initSdk(
      {
        devKey: APPS_FLYER_DEV_KEY,
        isDebug: true,
        appId: APPS_FLYER_APP_ID,
      },
      () => null,
      (error) => {
        Logger.debug(error)
      }
    )
}
