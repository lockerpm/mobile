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

export const parseSearchText = (bundle: string) => {
  if (!bundle) return ""
  const meaninglessSearch = ["com", "net", "app", "package", "io", "www"]
  const _sp = bundle.split(".")
  return _sp.filter((e) => !meaninglessSearch.includes(e)).join(".")
}
