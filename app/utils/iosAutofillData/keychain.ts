import * as ReactNativeKeychain from "react-native-keychain"
import { IS_IOS, SHARED_KEYCHAIN_ACCESS_GROUP } from "../../config/constants"
import { Logger } from "../utils"
import {
  IosAutofillPassword,
  IosAutofillTemporaryPassword,
  IosAutofillUserInfo,
  IosStorekey,
} from "./iosAutofillType"

class IosKeychainService {
  public async saveUserInfo(data: IosAutofillUserInfo) {
    if (!IS_IOS) return

    await this.saveShared(
      IosStorekey.USER_INFO.service,
      IosStorekey.USER_INFO.username,
      JSON.stringify(data),
    )
  }

  public async savePassword(data: IosAutofillPassword) {
    if (!IS_IOS) return

    await this.saveShared(
      IosStorekey.PASSWORD.service,
      IosStorekey.PASSWORD.username,
      JSON.stringify(data),
    )
  }

  public async resetAll() {
    if (!IS_IOS) return

    await ReactNativeKeychain.resetGenericPassword()
  }

  // local autofill password creation
  public async saveTempPassword(data: IosAutofillTemporaryPassword) {
    if (!IS_IOS) return

    await this.saveShared(
      IosStorekey.TEMP_PASSWORD.service,
      IosStorekey.TEMP_PASSWORD.username,
      JSON.stringify(data),
    )
  }

  public async getTempPassword(): Promise<IosAutofillTemporaryPassword | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(IosStorekey.TEMP_PASSWORD.service)
    if (!res || !res.password) {
      return null
    }

    return JSON.parse(res.password)
  }

  public async resetTempPassword() {
    if (!IS_IOS) return

    await this.saveShared(IosStorekey.TEMP_PASSWORD.service, IosStorekey.TEMP_PASSWORD.username, "")
  }

  public async getUserInfo(): Promise<IosAutofillUserInfo | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(IosStorekey.USER_INFO.service)
    if (!res || !res.password) {
      return null
    }

    return JSON.parse(res.password)
  }

  public async getPasswords(): Promise<IosAutofillPassword | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(IosStorekey.PASSWORD.service)
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

export const iosKeyChain = new IosKeychainService()
