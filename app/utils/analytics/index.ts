import CookieManager from "@react-native-cookies/cookies"
import { getAnalytics, logEvent, logScreenView } from "@react-native-firebase/analytics"
import moment from "moment"
import DeviceInfo from "react-native-device-info"

import { Logger } from "../logger"
import { getUrlParameterByName } from "../utils"

const WHITELIST_HOSTS = ["https://locker.io", "https://id.locker.io", "https://staging.locker.io"]
const COOKIES_URL = "https://locker.io"
const TAGS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]

export enum AnalyticEvents {
  REGISTER_SUCCESS = "register_success",
  CREATE_MASTER_PW = "create_master_pw",
  ENTER_MASTER_PW = "enter_master_pw",
  COPY_OTP = "copy_otp",
  ADD_OTP = "add_otp",
  CREATE_PRIVATE_EMAIL = "create_private_email",
  BLOCK_PRIVATE_EMAIL = "block_private_email",
  CREATE_ITEMS = "create_items",
  SHARE_ITENS = "share_items",
  GENERATE_PASSWORD = "generate_password",
  PASSWORD_HEALTH = "password_health",
  DATA_BREACH_SCANNER = "data_breach_scanner",
  SCAM_REPORT = "scam_report",
  SCAM_LOOKUP = "scam_lookup",
  SCAM_DELETE_REPORT = "scam_delete_report",
  SCAM_ENABLE_CALLERID = "scam_enable_callerid",
}

export const setCookiesFromUrl = (url: string) => {
  if (!url || !WHITELIST_HOSTS.some((host) => url.startsWith(host))) {
    return
  }
  const values = new Array<string>(TAGS.length)
  let hasChange = false
  TAGS.forEach((t, index) => {
    const val = getUrlParameterByName(t, url)
    if (val && val.trim()) {
      hasChange = true
      values[index] = val
    }
  })
  if (hasChange) {
    Logger.debug(`Set cookies: ${JSON.stringify(values)}`)
    const now = moment()
    now.add(30, "days")
    TAGS.forEach((t, index) => {
      CookieManager.set(COOKIES_URL, {
        name: t,
        value: values[index],
        expires: now.toISOString(true),
      })
    })
  }
}

export const getUtmCookies = async () => {
  const cookies = await CookieManager.get(COOKIES_URL)
  const res = {}
  Object.keys(cookies).forEach((k) => {
    if (TAGS.includes(k)) {
      res[k] = cookies[k].value
    }
  })
  return res
}

export const getCookies = async (name: string) => {
  const cookies = await getUtmCookies()
  return cookies[name]
}

export const logRegisterSuccessEvent = async () => {
  const cookies = await getUtmCookies()
  const device_identifier = await DeviceInfo.getUniqueId()
  const analytics = getAnalytics()
  await logEvent(analytics, AnalyticEvents.REGISTER_SUCCESS, {
    ...cookies,
    device_identifier,
  })
}

// Create master pw
export const logCreateMasterPwEvent = async () => {
  const cookies = await getUtmCookies()
  const device_identifier = await DeviceInfo.getUniqueId()
  const analytics = getAnalytics()
  await logEvent(analytics, AnalyticEvents.CREATE_MASTER_PW, {
    ...cookies,
    device_identifier,
  })
}

export const trackScreenView = (screenName: string) => {
  if (__DEV__) {
    return
  }
  const analytics = getAnalytics()
  logScreenView(analytics, {
    screen_name: screenName,
    screen_class: screenName,
  })
}

export const logFirebaseEvent = async (event: AnalyticEvents, email: string) => {
  const device_identifier = await DeviceInfo.getUniqueId()
  const analytics = getAnalytics()
  await logEvent(analytics, event, {
    device_identifier,
    email,
  })
}
