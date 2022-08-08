import { IS_IOS } from "../../config/constants"
import moment from 'moment'
import * as Sentry from "@sentry/react-native";

const PLATFORM = IS_IOS ? 'iOS': 'Android'


export class Logger {
  static getTime() {
    return moment().format('HH:mm:ss:SSS')
  }

  static debug(e: any) {
    const data = typeof e === 'object' ? JSON.stringify(e) : e
    __DEV__ && console.log(`[${Logger.getTime()}] (DEBUG) ${PLATFORM}: ${data}`)
  }

  static error(e: any, logSentry: boolean = true) {
    __DEV__ && console.error(`[${Logger.getTime()}] (ERROR) ${PLATFORM}: ${e}`)
    !__DEV__ && logSentry && Sentry.captureException(e)
  }
}