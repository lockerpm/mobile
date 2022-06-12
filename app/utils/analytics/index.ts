import { getUrlParameterByName } from "../helpers"
import CookieManager from '@react-native-cookies/cookies'
import moment from 'moment'
import analytics from '@react-native-firebase/analytics'


const COOKIES_URL = 'https://locker.io'
const TAGS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content'
]


export const setCookiesFromUrl = (url: string) => {
  if (!url || !url.startsWith(COOKIES_URL)) {
    return
  }
  const values = TAGS.map(t => '')
  let hasChange = false
  TAGS.forEach((t, index) => {
    const val = getUrlParameterByName(t, url)
    if (val && val.trim()) {
      hasChange = true
      values[index] = val
    }
  })
  if (hasChange) {
    const now = moment()
    now.add(30, 'days')
    TAGS.forEach((t, index) => {
      CookieManager.set(COOKIES_URL, {
        name: t,
        value: values[index],
        expires: now.toISOString(true)
      })
    })
  }
}

export const getUtmCookies = async () => {
  const cookies = await CookieManager.get(COOKIES_URL)
  const res = {}
  Object.keys(cookies).forEach(k => {
    if (TAGS.includes(k)) {
      res[k] = cookies[k].value
    }
  })
  return res
}

export const logCreateMasterPwEvent = async () => {
  const cookies = await getUtmCookies()
  await analytics().logEvent('create_master_pw', cookies)
}

export const logPurchase = async () => {
  const cookies = await getUtmCookies()
  await analytics().logPurchase({
    ...cookies
  })
}
