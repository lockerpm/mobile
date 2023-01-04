import { NativeModules, Platform } from "react-native";
import { IS_IOS } from "../config/constants";


const { RNAutofillServiceIos, RNAutofillServiceAndroid } = NativeModules


export const AutofillServiceEnabled: (callback: (a: boolean, androidNotSupport?: boolean) => void) => void = (callback) => {
  if (IS_IOS) {
    return RNAutofillServiceIos.isAutofillServiceActived(callback)
  }


  // Android
  if (Platform.Version < 26) {
    // AutofillManager class added in API level 26
    // https://developer.android.com/reference/android/view/autofill/AutofillManager
    // crash on Android lower version

    // eslint-disable-next-line node/no-callback-literal
    return callback(false, true)
  }
  return RNAutofillServiceAndroid.isAutofillServiceActived(callback)
}