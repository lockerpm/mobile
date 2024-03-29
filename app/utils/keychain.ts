import * as ReactNativeKeychain from "react-native-keychain"
import { SHARED_KEYCHAIN_ACCESS_GROUP, SHARED_KEYCHAIN_SERVICE } from "../config/constants"
import { Logger } from "./utils"

export type AutofillDataType = {
  passwords: {
    id: string
    name: string
    uri: string
    username: string
    password: string
    isOwner: boolean
    otp?: string
  }[]
  email: string
  hashPass: string
  avatar: string
  faceIdEnabled: boolean
  language: string
  isDarkTheme: boolean
  isLoggedInPw: boolean
}

/**
 * Saves some credentials securely.
 *
 * @param username The username
 * @param password The password
 * @param server The server these creds are for.
 */
export async function save(username: string, password: string, server?: string) {
  if (server) {
    await ReactNativeKeychain.setInternetCredentials(server, username, password)
    return true
  } else {
    return ReactNativeKeychain.setGenericPassword(username, password)
  }
}

/**
 * Saves some credentials securely in shared keychain
 *
 * @param username The username
 * @param password The password
 */
export async function saveShared(username: string, password: string) {
  try {
    await ReactNativeKeychain.setGenericPassword(username, password, {
      service: SHARED_KEYCHAIN_SERVICE,
      accessGroup: SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    return true
  } catch (e) {
    Logger.error("saveShared: " + e)
    return false
  }
}

export async function loadShared() {
  try {
    const res = await ReactNativeKeychain.getGenericPassword({
      service: SHARED_KEYCHAIN_SERVICE,
      accessGroup: SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    return res
  } catch (e) {
    Logger.error("loadShared: " + e)
    return false
  }
}

/**
 * Loads credentials that were already saved.
 *
 * @param server The server that these creds are for
 */
export async function load(server?: string) {
  if (server) {
    const creds = await ReactNativeKeychain.getInternetCredentials(server)
    return {
      username: creds ? creds.username : null,
      password: creds ? creds.password : null,
      server,
    }
  } else {
    const creds = await ReactNativeKeychain.getGenericPassword()
    if (typeof creds === "object") {
      return {
        username: creds.username,
        password: creds.password,
        server: null,
      }
    } else {
      return {
        username: null,
        password: null,
        server: null,
      }
    }
  }
}

/**
 * Resets any existing credentials for the given server.
 *
 * @param server The server which has these creds
 */
export async function reset(server?: string) {
  if (server) {
    await ReactNativeKeychain.resetInternetCredentials(server)
    return true
  } else {
    const result = await ReactNativeKeychain.resetGenericPassword()
    return result
  }
}
