import React from 'react'
import ReactNativeBiometrics from 'react-native-biometrics'
import { KdfType } from '../../../../core/enums/kdfType'
import { useStores } from '../../../models'
import { useCipherDataMixins } from './data'
import { useCoreService } from '../../core-service'
import { delay } from '../../../utils/delay'
import { saveShared } from '../../../utils/keychain'
import { observer } from 'mobx-react-lite'
import { color, colorDark } from '../../../theme'
import moment from 'moment'
import DeviceInfo from 'react-native-device-info'
import { useMixins } from '..'
import { Logger } from '../../../utils/logger'
import { SymmetricCryptoKey } from '../../../../core/models/domain'
import { remove, removeSecure, StorageKey } from '../../../utils/storage'
import { useSocialLoginMixins } from '../social-login'
import Intercom from '@intercom/intercom-react-native'


const { createContext, useContext } = React


// Mixins data
const defaultData = {
  // Methods
  sessionLogin: async (masterPassword : string) => { return { kind: 'unknown' } },
  biometricLogin: async () => { return { kind: 'unknown' } },
  logout: async () => {},
  lock: async () => {},
  registerLocker: async (masterPassword: string, hint: string, passwordStrength: number) => { return { kind: 'unknown' } },
  changeMasterPassword: async (oldPassword: string, newPassword: string) => { return { kind: 'unknown' } },
  clearAllData: async (dataOnly?: boolean) => {}
}


const CipherAuthenticationMixinsContext = createContext(defaultData)

export const CipherAuthenticationMixinsProvider = observer((props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
  const { uiStore, user, cipherStore, folderStore, collectionStore, toolStore } = useStores()
  const {
    cryptoService,
    userService,
    folderService,
    cipherService,
    collectionService,
    platformUtilsService,
    messagingService,
    tokenService
  } = useCoreService()
  const { notify, translate, notifyApiError } = useMixins()
  const { logoutAllServices } = useSocialLoginMixins()

  // TODO: don't know why, but crash if comment this line
  const { syncAutofillData } = useCipherDataMixins()

  // ------------------------ DATA -------------------------

  const isDark = uiStore.isDark
  const themeColor = isDark ? colorDark : color

  // -------------------- AUTHENTICATION --------------------

  // Login vault using API
  const _loginUsingApi = async (key: SymmetricCryptoKey, keyHash: string, kdf: number, kdfIterations: number, masterPassword?: string) => {
    // Session login API
    const res = await user.sessionLogin({
      client_id: 'mobile',
      password: keyHash,
      device_name: platformUtilsService.getDeviceString(),
      device_type: platformUtilsService.getDevice(),
      // device_identifier: await storageService.get('device_id') || randomString(),
      device_identifier: DeviceInfo.getUniqueId()
    })
    if (res.kind === 'unauthorized') {
      notify('error', translate('error.token_expired'))
      return { kind: 'unauthorized' }
    }

    if (res.kind !== 'ok') {
      if (res.kind === 'bad-data') {
        if (res.data.code === '1008') {
          notify('error', `${translate('error.login_locked')} ${moment.duration(res.data.wait, 'seconds').humanize()}`)
        } else {
          notifyApiError(res)
        }
        return res
      }

      notify('error', translate('error.session_login_failed'))
      return res
    }

    // Setup service
    messagingService.send('loggedIn')
    await tokenService.setTokens(res.data.access_token, res.data.refresh_token)
    await userService.setInformation(tokenService.getUserId(), user.email, kdf, kdfIterations)
    await cryptoService.setKey(key)
    await cryptoService.setKeyHash(keyHash)
    await cryptoService.setEncKey(res.data.key)
    await cryptoService.setEncPrivateKey(res.data.private_key)

    // setup service offline
    if (masterPassword) {
      const autofillHashedPassword = await cryptoService.hashPasswordAutofill(masterPassword, key.keyB64)
      await cryptoService.setAutofillKeyHash(autofillHashedPassword)
      // await syncAutofillData();
    }

    return { kind: 'ok' }
  }

  // Session login
  const sessionLogin = async (masterPassword: string): Promise<{ kind: string }> => {
    try {
      await delay(200)

      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000
      const key = await cryptoService.makeKey(masterPassword, user.email, kdf, kdfIterations)
      
      // Offline compare
      if (uiStore.isOffline) {
        const storedKeyHash = await cryptoService.getKeyHash()
        if (storedKeyHash) {
          const passwordValid = await cryptoService.compareAndUpdateKeyHash(masterPassword, key)
          if (passwordValid) {
            messagingService.send('loggedIn')
  
            // Fake set key
            await cryptoService.setKey(key)
            return { kind: 'ok' }
          }
        }
      }

      // Online session login
      const keyHash = await cryptoService.hashPassword(masterPassword, key)
      return _loginUsingApi(key, keyHash, kdf, kdfIterations, masterPassword)
    } catch (e) {
      notify('error', translate('error.session_login_failed'))
      return { kind: 'bad-data' }
    }
  }

  // Biometric login
  const biometricLogin =  async (): Promise<{ kind: string }> => {
    try {
      // await delay(200)
      const { available } = await ReactNativeBiometrics.isSensorAvailable()
      if (!available) {
        notify('error', translate('error.biometric_not_support'))
        return { kind: 'bad-data' }
      }

      // Validate biometric
      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: 'Unlock Locker'
      })
      if (!success) {
        notify('error', translate('error.biometric_unlock_failed'))
        return { kind: 'bad-data' }
      }

      // Offline login
      if (uiStore.isOffline) {
        const hasKey = await cryptoService.hasKey()
        if (!hasKey) {
          notify('error', translate('error.session_login_failed'))
          return { kind: 'bad-data' }
        }

        // Fake set key
        messagingService.send('loggedIn')
        const storedKey = await cryptoService.getKey()
        await cryptoService.setKey(storedKey)
        return { kind: 'ok' }
      }
      
      // Online login
      const key = await cryptoService.getKey()
      const keyHash = await cryptoService.getKeyHash()
      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000
      return _loginUsingApi(key, keyHash, kdf, kdfIterations)
    } catch (e) {
      notify('error', translate('error.session_login_failed'))
      return { kind: 'bad-data' }
    }
  }

  // Set master password
  const registerLocker = async (masterPassword: string, hint: string, passwordStrength: number) => {
    try {
      await delay(200)
      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000
      const referenceData = ''
      const key = await cryptoService.makeKey(masterPassword, user.email, kdf, kdfIterations)
      const encKey = await cryptoService.makeEncKey(key)
      const hashedPassword = await cryptoService.hashPassword(masterPassword, key)
      const keys = await cryptoService.makeKeyPair(encKey[0])

      const res = await user.registerLocker({
        name: user.full_name,
        email: user.email,
        master_password_hash: hashedPassword,
        master_password_hint: hint,
        key: encKey[1].encryptedString,
        kdf,
        kdf_iterations: kdfIterations,
        reference_data: referenceData,
        keys: {
          public_key: keys[0],
          encrypted_private_key: keys[1].encryptedString
        },
        score: passwordStrength
      })

      // API failed
      if (res.kind !== 'ok') {
        notifyApiError(res)
        return { kind: 'bad-data' }
      }

      await cryptoService.setKey(key)
      await cryptoService.setKeyHash(hashedPassword)
      await cryptoService.setEncKey(encKey[1].encryptedString)
      await cryptoService.setEncPrivateKey(keys[1].encryptedString)

  
      const autofillHashedPassword = await cryptoService.hashPasswordAutofill(masterPassword, key.keyB64)
      await cryptoService.setAutofillKeyHash(autofillHashedPassword)
      

      // Success
      notify('success', translate('success.master_password_updated'))

      await delay(500)

      return { kind: 'ok' }
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      return { kind: 'bad-data' }
    }
  }

  // Change master password
  const changeMasterPassword = async (oldPassword: string, newPassword: string): Promise<{ kind: string }> => {
    try {
      await delay(200)
      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000
      const key = await cryptoService.makeKey(newPassword, user.email, kdf, kdfIterations)
      const keyHash = await cryptoService.hashPassword(newPassword, key)
      let encKey = null
      const existingEncKey = await cryptoService.getEncKey()
      if (existingEncKey == null) {
        encKey = await cryptoService.makeEncKey(key)
      } else {
        encKey = await cryptoService.remakeEncKey(key)
      }

      const oldKeyHash = await cryptoService.hashPassword(oldPassword, null)

      // Send API
      const res = await user.changeMasterPassword({
        key: encKey[1].encryptedString,
        new_master_password_hash: keyHash,
        master_password_hash: oldKeyHash
      })
      if (res.kind !== 'ok') {
        notifyApiError(res)
        return { kind: 'bad-data' }
      }

      // Setup service
      notify('success', translate('success.master_password_updated'))
      await cryptoService.clearKeys()
      await logout()
      return { kind: 'ok' }
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      return { kind: 'bad-data' }
    }
  }

  // Logout
  const logout = async () => {
    try {
      await clearAllData()
      await user.updateFCM(null)
      await user.logout()
      await logoutAllServices()
      await Intercom.logout()
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error('logout: ' + e)
    }
  }

  // Lock screen
  const lock = async () => {
    folderService.clearCache()
    cipherService.clearCache()
    // searchService.clearCache()
    collectionService.clearCache()

    cipherStore.lock()
    collectionStore.lock()
    folderStore.lock()
    toolStore.lock()
    user.lock()
  }

  // Clear all data
  const clearAllData = async (dataOnly?: boolean) => {
    cipherStore.clearStore(dataOnly)
    collectionStore.clearStore(dataOnly)
    folderStore.clearStore(dataOnly)
    toolStore.clearStore(dataOnly)

    // Reset shared data
    await saveShared('autofill', '{}')

    // Reset push noti data
    await remove(StorageKey.PUSH_NOTI_DATA)

    // TODO: remove this when RSA problem is fixed
    await removeSecure('decOrgKeys')

    // Clear services
    await Promise.all([
      folderService.clearCache(),
      cipherService.clearCache(),
      // searchService.clearCache()
      collectionService.clearCache()
    ])

    const userId = await userService.getUserId()
    await Promise.all([
      folderService.clear(userId),
      cipherService.clear(userId),
      collectionService.clear(userId),
      cryptoService.clearKeys(),
      userService.clear()
    ])
  }

  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    color: themeColor,
    isDark,

    sessionLogin,
    biometricLogin,
    logout,
    lock,
    registerLocker,
    changeMasterPassword,
    clearAllData
  }

  return (
    <CipherAuthenticationMixinsContext.Provider value={data}>
      {props.children}
    </CipherAuthenticationMixinsContext.Provider>
  )
})

export const useCipherAuthenticationMixins = () => useContext(CipherAuthenticationMixinsContext)
