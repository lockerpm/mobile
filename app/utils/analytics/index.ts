import { getUrlParameterByName, Logger } from '../utils'
import CookieManager from '@react-native-cookies/cookies'
import moment from 'moment'
import analytics from '@react-native-firebase/analytics'
import DeviceInfo from 'react-native-device-info'

const WHITELIST_HOSTS = ['https://locker.io', 'https://id.locker.io', 'https://staging.locker.io']
const COOKIES_URL = 'https://locker.io'
const TAGS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

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
    now.add(30, 'days')
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

// Register success
export const logRegisterSuccessEvent = async () => {
  const cookies = await getUtmCookies()
  const device_identifier = DeviceInfo.getUniqueId()
  await analytics().logEvent('register_success', {
    ...cookies,
    device_identifier,
  })
}

// Create master pw
export const logCreateMasterPwEvent = async () => {
  const cookies = await getUtmCookies()
  const device_identifier = DeviceInfo.getUniqueId()
  await analytics().logEvent('create_master_pw', {
    ...cookies,
    device_identifier,
  })
}
