import { getUrlParameterByName } from "../helpers"
import CookieManager from '@react-native-cookies/cookies'
import moment from 'moment'


const TAGS = [
  'utm_source',
  'utm_medium',
  'utm_campaign'
]


export const setCookiesFromUrl = (url: string) => {
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
      CookieManager.set('com.cystack.locker', {
        name: t,
        value: values[index],
        expires: now.toISOString()
      })
    })
  }
}
