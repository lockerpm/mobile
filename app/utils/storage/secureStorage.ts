import * as ReactNativeKeychain from "react-native-keychain"

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export async function loadSecure(key: string): Promise<any | null> {
  try {
    const almostThere = await load(key)
    if (almostThere.password) {
      return JSON.parse(almostThere.password)
    }
    return null
  } catch {
    return null
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveSecure(key: string, value: any): Promise<boolean> {
  try {
    await save(key, JSON.stringify(value), key)
    return true
  } catch {
    return false
  }
}

/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
export async function removeSecure(key: string): Promise<void> {
  try {
    await reset(key)
  } catch {}
}

/**
 * Check if exists
 */
export async function hasSecure(key: string): Promise<boolean> {
  try {
    const res = await load(key)
    return res.password !== null
  } catch {
    return false
  }
}

/**
 * Saves some credentials securely.
 *
 * @param username The username
 * @param password The password
 * @param server The server these creds are for.
 */
async function save(username: string, password: string, server?: string) {
  if (server) {
    await ReactNativeKeychain.setInternetCredentials(server, username, password)
    return true
  } else {
    return ReactNativeKeychain.setGenericPassword(username, password)
  }
}

/**
 * Loads credentials that were already saved.
 *
 * @param server The server that these creds are for
 */
async function load(server?: string) {
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
async function reset(server?: string) {
  if (server) {
    await ReactNativeKeychain.resetInternetCredentials(server)
    return true
  } else {
    const result = await ReactNativeKeychain.resetGenericPassword()
    return result
  }
}
