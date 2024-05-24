import * as Sentry from '@sentry/react-native'
import {  DSN_SENTRY } from '../../config/constants'

export const initSentry = () => {
  !__DEV__ &&
    Sentry.init({
      dsn: DSN_SENTRY,

      tracesSampleRate: 0.1,
    })
}
