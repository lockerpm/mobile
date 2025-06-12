import * as ReactNativeKeychain from "react-native-keychain"
import { IS_IOS, SHARED_KEYCHAIN_ACCESS_GROUP } from "../../config/constants"
import { Logger } from "../utils"
import {
  IosAutofillPassword,
  IosAutofillTemporaryPassword,
  AutofillUserInfo,
  AutofillStorekey,
} from "./autofillType"

class KeychainService {
  public async saveUserInfo(data: AutofillUserInfo) {
    await this.saveShared(
      AutofillStorekey.USER_INFO.service,
      AutofillStorekey.USER_INFO.username,
      JSON.stringify(data),
    )
  }

  /**
   * Disable on android
   */
  public async savePassword(data: IosAutofillPassword) {
    if (!IS_IOS) return

    await this.saveShared(
      AutofillStorekey.PASSWORD.service,
      AutofillStorekey.PASSWORD.username,
      JSON.stringify(data),
    )
  }

  public async resetAll() {
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.USER_INFO.service,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.PASSWORD.service,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.TEMP_PASSWORD.service,
    })
  }

  // local autofill password creation
  public async saveTempPassword(data: IosAutofillTemporaryPassword) {
    if (!IS_IOS) return

    await this.saveShared(
      AutofillStorekey.TEMP_PASSWORD.service,
      AutofillStorekey.TEMP_PASSWORD.username,
      JSON.stringify(data),
    )
  }

  public async getTempPassword(): Promise<IosAutofillTemporaryPassword | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(AutofillStorekey.TEMP_PASSWORD.service)
    if (!res || !res.password) {
      return null
    }

    return JSON.parse(res.password)
  }

  public async resetTempPassword() {
    if (!IS_IOS) return

    await this.saveShared(
      AutofillStorekey.TEMP_PASSWORD.service,
      AutofillStorekey.TEMP_PASSWORD.username,
      "",
    )
  }

  public async getPasswords(): Promise<IosAutofillPassword | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(AutofillStorekey.PASSWORD.service)
    if (!res || !res.password) {
      return null
    }

    return JSON.parse(res.password)
  }

  // ---------------------------PRIVATE--------------------------------
  /**
   * Saves some credentials securely in shared keychain
   *
   * @param username The username
   * @param password The password
   */
  private async saveShared(service: string, username: string, password: string) {
    try {
      await ReactNativeKeychain.setGenericPassword(username, password, {
        service,
        accessGroup: SHARED_KEYCHAIN_ACCESS_GROUP,
      })
    } catch (e) {
      Logger.error(`saveShared  ${username}: ` + e)
    }
  }

  private async loadShared(service: string) {
    try {
      const credentials = await ReactNativeKeychain.getGenericPassword({
        service,
        accessGroup: SHARED_KEYCHAIN_ACCESS_GROUP,
      })
      return credentials
    } catch (e) {
      Logger.error(`loadShared : ` + e)
      return false
    }
  }
}

export const autofillKeyChain = new KeychainService()
