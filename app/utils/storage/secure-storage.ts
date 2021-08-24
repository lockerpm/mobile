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
    if (__DEV__) {
      console.log(`Getting from SECURE key ${key}`)
    }
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
    if (__DEV__) {
      console.log(`Saving to SECURE key ${key}`)
    }
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
    if (__DEV__) {
      console.log(`Removing from SECURE key ${key}`)
    }
    await RNSecureStorage.remove(key)
  } catch {}
}

/**
 * Check if exists
 */
export async function hasSecure(key: string): Promise<boolean> {
  try {
    if (__DEV__) {
      console.log(`Checking from SECURE key ${key}`)
    }
    const res = await RNSecureStorage.exists(key)
    return res
  } catch {
    return false
  }
}