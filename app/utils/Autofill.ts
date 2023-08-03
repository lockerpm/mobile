import { NativeModules, Platform } from "react-native";
import { IS_IOS } from "../config/constants";


const { RNAutofillServiceIos, RNAutofillServiceAndroid } = NativeModules


export const AutofillServiceEnabled: (callback: (a: boolean, androidNotSupport?: boolean) => void) => void = (callback) => {
  if (IS_IOS) {
    return RNAutofillServiceIos.isAutofillServiceActived(callback)
  }

  if (Platform.OS === 'android') {
    if (Platform.Version < 26) {
      // AutofillManager class added in API level 26
      // https://developer.android.com/reference/android/view/autofill/AutofillManager
      // crash on Android lower version
  
      // eslint-disable-next-line node/no-callback-literal
      return callback(false, true)
    }
  }
  // Android

  return RNAutofillServiceAndroid.isAutofillServiceActived(callback)
}

export const parseSearchText  = (bundle: string) => {
  const meaninglessSearch = ['com', 'net', 'app', 'package' , 'io']
  const _sp = bundle.split('.')
  let result = ''
  _sp.forEach(pt => {
    if (!meaninglessSearch.includes(pt)) {
      result += pt + ' '
    }
  })
  return result
}