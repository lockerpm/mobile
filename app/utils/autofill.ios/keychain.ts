import { Platform } from "react-native"
import * as ReactNativeKeychain from "react-native-keychain"

import Config from "@/config"

import {
  IosAutofillPassword,
  IosAutofillTemporaryPassword,
  AutofillUserInfo,
  AutofillStorekey,
  IosAutofillTemporaryPasskey,
  IosAutofillOTP,
} from "./autofillType"
import { Logger } from "../logger"

const IS_IOS = Platform.OS === "ios"

class KeychainService {
  public async saveUserInfo(data: AutofillUserInfo) {
    const platformData = Platform.select({
      ios: data,
      android: {
        email: data.email,
        hashPass: data.hashPass,
      } as any,
      default: data,
    })
    await this.saveShared(
      AutofillStorekey.USER_INFO.service,
      AutofillStorekey.USER_INFO.username,
      JSON.stringify(platformData)
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
      JSON.stringify(data)
    )
  }

  public async resetAll() {
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.USER_INFO.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.PASSWORD.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.TEMP_PASSWORD.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.TEMP_PASSKEY.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.OTP.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.TEMP_OTP.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
  }
  // ---------------------------TEMP PASSWORD--------------------------------
  // local autofill password creation
  public async saveTempPassword(data: IosAutofillTemporaryPassword) {
    if (!IS_IOS) return

    await this.saveShared(
      AutofillStorekey.TEMP_PASSWORD.service,
      AutofillStorekey.TEMP_PASSWORD.username,
      JSON.stringify(data)
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
      ""
    )
  }
  // ---------------------------TEMP OTP--------------------------------
  // local autofill password creation
  public async saveOTP(data: IosAutofillOTP) {
    if (!IS_IOS) return

    await this.saveShared(
      AutofillStorekey.OTP.service,
      AutofillStorekey.OTP.username,
      JSON.stringify(data)
    )
  }

  public async getTempOTP(): Promise<IosAutofillTemporaryPassword | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(AutofillStorekey.TEMP_OTP.service)
    if (!res || !res.password) {
      return null
    }

    return JSON.parse(res.password)
  }

  public async resetTempPOTP() {
    if (!IS_IOS) return

    await this.saveShared(AutofillStorekey.TEMP_OTP.service, AutofillStorekey.TEMP_OTP.username, "")
  }

  // ---------------------------TEMP PASSKEY--------------------------------
  // Passkey
  public async getTempPasskey(): Promise<IosAutofillTemporaryPasskey | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(AutofillStorekey.TEMP_PASSKEY.service)
    if (!res || !res.password) {
      return null
    }

    return JSON.parse(res.password)
  }

  public async resetTempPasskey() {
    if (!IS_IOS) return

    await this.saveShared(
      AutofillStorekey.TEMP_PASSKEY.service,
      AutofillStorekey.TEMP_PASSKEY.username,
      ""
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
        accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
      })
    } catch (e) {
      Logger.error(`saveShared  ${username}: ` + e)
    }
  }

  private async loadShared(service: string) {
    try {
      const credentials = await ReactNativeKeychain.getGenericPassword({
        service,
        accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
      })
      return credentials
    } catch (e) {
      Logger.error(`loadShared : ` + e)
      return false
    }
  }
}

export const autofillKeyChain = new KeychainService()
