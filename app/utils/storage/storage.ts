// import AsyncStorage from "@react-native-async-storage/async-storage"
import { MMKV } from 'react-native-mmkv'

const storage = new MMKV()

export enum StorageKey {
  APP_CURRENT_USER = 'app__current_user',
  PUSH_NOTI_DATA = 'push_noti_data',
  ANDROID_AUTOFILL_SERVICE_DATA = 'android_autofill_service_data',
}

export type PushNotiData = {
  type: string
  url?: string
  data?: any
}

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export async function loadString(key: string): Promise<string | null> {
  try {
    // return await AsyncStorage.getItem(key)
    return Promise.resolve(storage.getString(key))
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
    // await AsyncStorage.setItem(key, value)
    await Promise.resolve(storage.set(key, value))
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
export function load(key: string): Promise<any | null> {
  return new Promise((resolve) => {
    const res = storage.getString(key)
    resolve(res ? JSON.parse(res) : null)
  })
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function save(key: string, value: any): Promise<boolean> {
  try {
    await Promise.resolve(storage.set(key, JSON.stringify(value)))
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
    await Promise.resolve(storage.delete(key))
  } catch {}
}

/**
 * Burn it all to the ground.
 */
export async function clear(): Promise<void> {
  try {
    // await AsyncStorage.clear()
    await Promise.resolve(storage.clearAll())
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
