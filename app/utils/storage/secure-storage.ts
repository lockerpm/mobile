import RNSecureStorage, { ACCESSIBLE } from 'rn-secure-storage'


const options = {
	accessible: ACCESSIBLE.WHEN_UNLOCKED
}


/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export async function loadSecure(key: string): Promise<any | null> {
  try {
    const almostThere = await RNSecureStorage.get(key)
    return JSON.parse(almostThere)
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
    await RNSecureStorage.set(key, JSON.stringify(value), options)
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
    await RNSecureStorage.remove(key)
  } catch {}
}

/**
 * Check if exists
 */
export async function hasSecure(key: string): Promise<boolean> {
  try {
    const res = await RNSecureStorage.exists(key)
    return res
  } catch {
    return false
  }
}