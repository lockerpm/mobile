import { load, reset, save } from '../keychain'



/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export async function loadSecure(key: string): Promise<any | null> {
  try {
    const almostThere = await load(key)
    return JSON.parse(almostThere.password)
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
  } catch { }
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