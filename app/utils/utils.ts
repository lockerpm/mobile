import isEqual from 'lodash/isEqual'
import moment from 'moment'
import { Platform } from 'react-native'

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
  const regex = /[?&]([^=#]+)=([^&#]*)/g
  const params = {}
  let match
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

export const relativeTime = function timeDifference(previous: number, lang = 'en') {
  const current = Math.floor(Date.now())

  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const elapsed = current - previous

  const relative = {
    vi: {
      s: 'Vài giây trước',
      m1: ' phút trước',
      m2: ' phút trước',
      h1: ' giờ trước',
      h2: ' giờ trước',
      d1: ' hôm qua',
      d2: ' ngày trước',
      mo1: ' tháng trước',
      mo2: ' tháng trước',
      y1: 'Năm trước',
    },
    en: {
      s: 'Seconds ago',
      m1: 'A minute ago',
      m2: ' minutes ago',
      h1: 'A hour ago',
      h2: ' hours ago',
      d1: 'Yesterday',
      d2: ' days ago',
      mo1: 'A month ago',
      mo2: ' months ago',
      y1: 'Years ago',
    },
  }

  if (elapsed < msPerMinute) {
    return relative[lang].s
  } else if (elapsed < msPerHour) {
    const t = Math.round(elapsed / msPerMinute)
    return t === 1 ? relative[lang].m1 : t + relative[lang].m2
  } else if (elapsed < msPerDay) {
    const t = Math.round(elapsed / msPerHour)
    return t === 1 ? relative[lang].h1 : t + relative[lang].h2
  } else if (elapsed < msPerMonth) {
    const t = Math.round(elapsed / msPerDay)
    return t === 1 ? relative[lang].d1 : t + relative[lang].d2
  } else if (elapsed < msPerYear) {
    const t = Math.round(elapsed / msPerMonth)
    return t === 1 ? relative[lang].mo1 : t + relative[lang].mo2
  } else {
    return relative[lang].y1
  }
}
