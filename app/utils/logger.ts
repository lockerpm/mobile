import { Platform } from "react-native"
import moment from "moment"

export class Logger {
  static getTime() {
    return moment().format("HH:mm:ss:SSS")
  }

  static debug(...e: any[]) {
    if (__DEV__) {
      console.log(`[${Logger.getTime()}] (DEBUG) ${Platform.OS.toUpperCase()}: `, ...e)
    }
  }

  static error(...e: any[]) {
    if (__DEV__) {
      console.error(`[${Logger.getTime()}] (ERROR) ${Platform.OS.toUpperCase()}: `, e)
    }
  }
}
