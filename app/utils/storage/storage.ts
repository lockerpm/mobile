import AsyncStorage from "@react-native-async-storage/async-storage"

export const storageKeys = {
  USER_INFO_KEY: 'user_info',
  USER_TOKEN_KEY: 'user_token',
  APP_SHOW_INTRO: 'app__show_intro',
  APP_SHOW_BIOMETRIC_INTRO: 'app__show_biometric_intro'
}

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export async function loadString(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key)
  } catch {
    // not sure why this would fail... even reading the RN docs I'm unclear
    return null
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveString(key: string, value: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export async function load(key: string): Promise<any | null> {
  try {
    // if (__DEV__) {
    //   console.log(`Getting from ASYNC STORAGE key ${key}`)
    // }
    console.log(key)
    const almostThere = await AsyncStorage.getItem(key)
    console.log(key + ' ok')
    return JSON.parse(almostThere)
  } catch (e) {
    console.log(e)
    return null
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function save(key: string, value: any): Promise<boolean> {
  try {
    // if (__DEV__) {
    //   console.log(`Saving to ASYNC STORAGE key ${key}`)
    // }
    await AsyncStorage.setItem(key, JSON.stringify(value))
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
export async function remove(key: string): Promise<void> {
  try {
    // if (__DEV__) {
    //   console.log(`Removing from ASYNC STORAGE key ${key}`)
    // }
    await AsyncStorage.removeItem(key)
  } catch {}
}

/**
 * Burn it all to the ground.
 */
export async function clear(): Promise<void> {
  try {
    await AsyncStorage.clear()
  } catch {}
}

/**
 * Check if exists
 */
export async function has(key: string): Promise<boolean> {
  try {
    const val = await load(key)
    return val !== null
  } catch {
    return false
  }
}
