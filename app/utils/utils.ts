import isEqual from "lodash/isEqual"
import moment from 'moment'
import { Platform } from "react-native"

type ItemProps = {
  [key: string]: any
}

export const shouldRerenderItem = (ignoreProps: string[]) => {
  return (prev: ItemProps, next: ItemProps) => {
    const prevProps = Object.keys(prev)
    const nextProps = Object.keys(next)
    if (!isEqual(prevProps, nextProps)) {
      return false
    }
    const isPropsEqual = prevProps.reduce((val, key) => {
      if (ignoreProps.includes(key)) {
        return val
      }
      return val && isEqual(prev[key], next[key])
    }, true)
    return isPropsEqual
  }
}

export const getUrlParameterByName = (name: string, url: string) => {
  const regex = /[?&]([^=#]+)=([^&#]*)/g; const params = {}; let match
  while ((match = regex.exec(url))) {
    params[match[1]] = match[2]
  }
  return params[name] || ''
}


export class Logger {
  static getTime() {
    return moment().format('HH:mm:ss:SSS')
  }

  static debug(e: any) {
    const data = typeof e === 'object' ? JSON.stringify(e) : e
    __DEV__ && console.log(`[${Logger.getTime()}] (DEBUG) ${Platform.OS.toUpperCase()}: ${data}`)
  }

  static error(e: any) {
    __DEV__ && console.error(`[${Logger.getTime()}] (ERROR) ${Platform.OS.toUpperCase()}: ${e}`)
  }
}

export class DurationTest {
  name: string
  start: number
  lastTick: number

  constructor(name: string) {
    this.name = name
    this.start = Date.now()
    this.lastTick = this.start
  }

  tick(action: any) {
    Logger.debug(`${this.name}: ${action} took ${Date.now() - this.lastTick}ms`)
    this.lastTick = Date.now()
  }

  final() {
    Logger.debug(`${this.name} took total ${Date.now() - this.start}ms`)
  }
}

/**
 * A "modern" sleep statement.
 *
 * @param ms The number of milliseconds to wait.
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
