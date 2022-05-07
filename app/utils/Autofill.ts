import { NativeModules } from "react-native";
import { IS_IOS } from "../config/constants";


const {RNAutofillServiceIos, RNAutofillServiceAndroid} = NativeModules


export const AutofillServiceEnabled: (callback : (Boolean) => void ) => void = (callback) => {
    if (IS_IOS) {
        return  RNAutofillServiceIos.isAutofillServiceActived(callback)
    }
    return RNAutofillServiceAndroid.isAutofillServiceActived(callback)
}