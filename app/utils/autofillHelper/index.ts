/* eslint-disable n/no-callback-literal */
import { NativeModules, Platform } from "react-native"
const { RNAutofillServiceIos, RNAutofillServiceAndroid } = NativeModules

export enum AndroidAutofillServiceType {
  AUTOFILL,
  AUTOFILL_ITEM,
  SAVE_REQUEST,
}

export type AndroidAutofillServiceData = {
  type: AndroidAutofillServiceType
  lastUserPasswordID: string
  domain: string
  username: string
  password: string
}

export const AutofillServiceEnabled: (
  callback: (a: boolean, androidNotSupport?: boolean) => void
) => void = (callback) => {
  if (Platform.OS === "ios") {
    return RNAutofillServiceIos.isAutofillServiceActived(callback)
  }

  if (Platform.OS === "android") {
    // @ts-ignore
    if (Platform.Version < 26) {
      // AutofillManager class added in API level 26
      // https://developer.android.com/reference/android/view/autofill/AutofillManager
      // crash on Android lower version

      return callback(false, true)
    }
  }
  // Android
  return RNAutofillServiceAndroid.isAutofillServiceActived(callback)
}

export const parseSearchText: (bundle: string) => string[] = (bundle) => {
  if (!bundle) return []
  const meaninglessSearch = ["com", "net", "app", "package", "www"]
  const words: string[] = bundle
    .trim()
    .split(".")
    .filter((word) => word.length >= 3 && !meaninglessSearch.includes(word))

  if (words.length === 0) return []

  const results: string[] = []
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j <= words.length; j++) {
      const subarray = words.slice(i, j).join(".")
      results.push(subarray)
    }
  }
  results.sort((a, b) => {
    return a.length > b.length ? -1 : 1
  })

  return results
}
