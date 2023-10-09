/* eslint-disable n/no-callback-literal */
import { RootProp } from "../../app";
import { IS_IOS } from "../../config/constants";
import { save, StorageKey } from "../storage";
import { NativeModules, Platform } from "react-native";
const { RNAutofillServiceIos, RNAutofillServiceAndroid } = NativeModules


export const AutofillServiceEnabled: (callback: (a: boolean, androidNotSupport?: boolean) => void) => void = (callback) => {
  if (Platform.OS === 'ios') {
    return RNAutofillServiceIos.isAutofillServiceActived(callback)
  }

  if (Platform.OS === 'android') {
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
  const meaninglessSearch = ['com', 'net', 'app', 'package', 'io']
  const _sp = bundle.split('.')
  let result = ''
  _sp.forEach(pt => {
    if (!meaninglessSearch.includes(pt)) {
      result += pt + ' '
    }
  })
  return result
}

export const autofillParserAndroid = (params: RootProp) => {
  if (!IS_IOS) {
    const isLastFill = params.lastFill || 0
    const isFromAutoFill = params.autofill || 0
    const isSavePassword = params.savePassword || 0
    const autoFillDomain = params.domain
    const saveUserName = params.username
    const savePassword = params.password
    const lastUserPasswordID = params.lastUserPasswordID
    // Check autofill (Android)
    save(StorageKey.APP_FROM_AUTOFILL, {
      enabled: isFromAutoFill,
      domain: autoFillDomain,
    })

    // Check onSaveRequest (Android)
    save(StorageKey.APP_FROM_AUTOFILL_ITEM, {
      enabled: isLastFill,
      id: lastUserPasswordID,
    })

    // Check lastPasswordUsed (Android)
    save(StorageKey.APP_FROM_AUTOFILL_ON_SAVE_REQUEST, {
      enabled: isSavePassword,
      domain: autoFillDomain,
      username: saveUserName,
      password: savePassword,
    })
  }
}