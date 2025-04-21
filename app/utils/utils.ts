import isEqual from "lodash/isEqual"
import moment from "moment"
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
  const regex = /[?&]([^=#]+)=([^&#]*)/g
  const params = {}
  let match
  while ((match = regex.exec(url))) {
    params[match[1]] = match[2]
  }
  return params[name] || ""
}

export class Logger {
  static getTime() {
    return moment().format("HH:mm:ss:SSS")
  }

  static debug(e: any) {
    const data = typeof e === "object" ? JSON.stringify(e) : e
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

export const relativeTime = function timeDifference(previous: number, lang = "en") {
  const current = Math.floor(Date.now())

  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const elapsed = current - previous

  const relative = {
    vi: {
      s: "Vài giây trước",
      m1: " phút trước",
      m2: " phút trước",
      h1: " giờ trước",
      h2: " giờ trước",
      d1: " hôm qua",
      d2: " ngày trước",
      mo1: " tháng trước",
      mo2: " tháng trước",
      y1: "Năm trước",
    },
    en: {
      s: "Seconds ago",
      m1: "A minute ago",
      m2: " minutes ago",
      h1: "An hour ago",
      h2: " hours ago",
      d1: "Yesterday",
      d2: " days ago",
      mo1: "A month ago",
      mo2: " months ago",
      y1: "Years ago",
    },
    zh: {
      s: "几秒钟前",
      m1: "一分钟前",
      m2: " 几分钟前",
      h1: "一小时前",
      h2: " 几小时前",
      d1: "昨天",
      d2: " 几天前",
      mo1: "一个月前",
      mo2: " 几个月前",
      y1: "几年前",
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

export const validateEmail = (email: string) => {
  // eslint-disable-next-line prefer-regex-literals
  const globalRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    "g",
  )
  return globalRegex.test(email)
}

export const momentRelativeTime = (lang: string) => {
  switch (lang) {
    case "vi":
      moment.locale("vi", {
        months:
          "tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12".split(
            "_",
          ),
        monthsShort: "Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12".split("_"),
        relativeTime: {
          future: "%s tới",
          past: "%s trước",
          s: "Vài giây",
          m: "1 phút",
          mm: "%d phút",
          h: "1 giờ",
          hh: "%d giờ",
          d: "1 ngày",
          dd: "%d ngày",
          M: "1 tháng",
          MM: "%d tháng",
          y: "1 năm",
          yy: "%d năm",
        },
        longDateFormat: {
          LT: "HH:mm",
          LTS: "HH:mm:ss",
          L: "DD/MM/YYYY",
          LL: "D MMMM [năm] YYYY",
          LLL: "D MMMM [năm] YYYY HH:mm",
          LLLL: "dddd, D MMMM [năm] YYYY HH:mm",
          l: "DD/M/YYYY",
          ll: "D MMM YYYY",
          lll: "D MMM YYYY HH:mm",
          llll: "ddd, D MMM YYYY HH:mm",
        },
        week: {
          dow: 1, // Monday is the first day of the week.
        },
      })
      break
    case "zh":
      moment.locale("zh", {
        months: [
          "一月",
          "二月",
          "三月",
          "四月",
          "五月",
          "六月",
          "七月",
          "八月",
          "九月",
          "十月",
          "十一月",
          "十二月",
        ],
        monthsShort: [
          "一月",
          "二月",
          "三月",
          "四月",
          "五月",
          "六月",
          "七月",
          "八月",
          "九月",
          "十月",
          "十一月",
          "十二月",
        ],
        relativeTime: {
          future: "%s 后",
          past: "%s 前",
          s: "几秒钟",
          m: "1 分钟",
          mm: "%d 分钟",
          h: "1 小时",
          hh: "%d 小时",
          d: "1 天",
          dd: "%d 天",
          M: "1 个月",
          MM: "%d 个月",
          y: "一年",
          yy: "%d 年",
        },
        longDateFormat: {
          LT: "HH:mm",
          LTS: "HH:mm:ss",
          L: "DD/MM/YYYY",
          LL: "D MMMM [年] YYYY",
          LLL: "D MMMM [年] YYYY HH:mm",
          LLLL: "dddd, D MMMM [年] YYYY HH:mm",
          l: "DD/M/YYYY",
          ll: "D MMM YYYY",
          lll: "D MMM YYYY HH:mm",
          llll: "ddd, D MMM YYYY HH:mm",
        },
        week: {
          dow: 1, // Monday is the first day of the week.
        },
      })

      break
    default:
      moment.locale("en")
  }
}


/**
 * A debounce utility function that ensures the callback is executed only once
 * during rapid successive calls within the specified delay.
 * This implementation includes a "leading" behavior, meaning it executes
 * immediately on the first call.
 *
 * @param fn - The callback function to be debounced
 * @param delay - The delay in milliseconds before allowing another execution
 * @returns A debounced version of the callback function
 */
export const debounce = (fn: () => void, delay: number) => {
  let timeout: NodeJS.Timeout
  let isLeading = true
  return () => {
    if (isLeading) {
      fn()
      isLeading = false
    }
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      isLeading = true
    }, delay)
  }
}