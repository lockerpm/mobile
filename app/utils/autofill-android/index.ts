import { RootProp } from "../../app";
import { IS_IOS } from "../../config/constants";
import { save, StorageKey } from "../storage";



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