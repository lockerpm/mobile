import React from 'react'
import ReactNativeBiometrics from 'react-native-biometrics'
import { KdfType } from '../../../../core/enums/kdfType'
import { useStores } from '../../../models'
import { useCipherDataMixins } from './data'
import { useCoreService } from '../../core-service'
import { delay } from '../../../utils/delay'
import { saveShared } from '../../../utils/keychain'
import { observer } from 'mobx-react-lite'
import moment from 'moment'
import DeviceInfo from 'react-native-device-info'
import { useMixins } from '..'
import { Logger } from '../../../utils/logger'
import { SymmetricCryptoKey } from '../../../../core/models/domain'
import { remove, removeSecure, StorageKey } from '../../../utils/storage'
import { useSocialLoginMixins } from '../social-login'
import Intercom from '@intercom/intercom-react-native'
import { setCookiesFromUrl } from '../../../utils/analytics'
import { getUrlParameterByName } from '../../../utils/helpers'
import { CipherView, LoginUriView, LoginView } from '../../../../core/models/view'
import { CipherType } from '../../../../core/enums'
import { CipherRequest } from '../../../../core/models/request/cipherRequest'

const { createContext, useContext } = React

// Mixins data
const defaultData = {
  // Methods
  sessionLogin: async (masterPassword: string, createMasterPasswordItem?: () => Promise<void>) => {
    return { kind: 'unknown' }
  },
  biometricLogin: async () => {
    return { kind: 'unknown' }
  },
  logout: async () => null,
  lock: async () => null,
  registerLocker: async (masterPassword: string, hint: string, passwordStrength: number) => {
    return { kind: 'unknown' }
  },
  changeMasterPassword: async (oldPassword: string, newPassword: string) => {
    return { kind: 'unknown' }
  },
  updateNewMasterPasswordEA: async (newPassword: string, email: string, eaID: string, lockerPassword?: boolean) => {
    return { kind: 'unknown' }
  },
  clearAllData: async (dataOnly?: boolean) => null,
  handleDynamicLink: async (url: string, navigation?: any) => false,
}

const CipherAuthenticationMixinsContext = createContext(defaultData)

export const CipherAuthenticationMixinsProvider = observer(
  (props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
    const { uiStore, user, cipherStore, folderStore, collectionStore, toolStore } = useStores()
    const {
      cryptoService,
      userService,
      folderService,
      cipherService,
      collectionService,
      platformUtilsService,
      messagingService,
      tokenService,
    } = useCoreService()
    const { notify, translate, notifyApiError, setApiTokens } = useMixins()
    const { logoutAllServices } = useSocialLoginMixins()

    // TODO: don't know why, but crash if comment this line
    const { syncAutofillData } = useCipherDataMixins()

    // ------------------------ DATA -------------------------

    // -------------------- AUTHENTICATION --------------------

    // Login vault using API
    const _loginUsingApi = async (
      key: SymmetricCryptoKey,
      keyHash: string,
      kdf: number,
      kdfIterations: number,
      masterPassword?: string,
      createMasterPasswordItem?: () => Promise<void>
    ) => {
      // Session login API
      const res = await user.sessionLogin({
        client_id: 'mobile',
        password: keyHash,
        device_name: platformUtilsService.getDeviceString(),
        device_type: platformUtilsService.getDevice(),
        // device_identifier: await storageService.get('device_id') || randomString(),
        device_identifier: DeviceInfo.getUniqueId(),
      })
      if (res.kind === 'unauthorized') {
        notify('error', translate('error.token_expired'))
        return { kind: 'unauthorized' }
      }

      if (res.kind !== 'ok') {
        if (res.kind === 'bad-data') {
          if (res.data.code === '1008') {
            notify(
              'error',
              `${translate('error.login_locked')} ${moment
                .duration(res.data.wait, 'seconds')
                .humanize()}`
            )
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
        const autofillHashedPassword = await cryptoService.hashPasswordAutofill(
          masterPassword,
          key.keyB64
        )
        await cryptoService.setAutofillKeyHash(autofillHashedPassword)
        // await syncAutofillData();
      }

      if (res.data.has_no_master_pw_item) {
        await createMasterPasswordItem()
      }
      return { kind: 'ok' }
    }

    // Session login
    const sessionLogin = async (masterPassword: string, createMasterPasswordItem?: () => Promise<void>): Promise<{ kind: string }> => {
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
        return _loginUsingApi(key, keyHash, kdf, kdfIterations, masterPassword, createMasterPasswordItem)
      } catch (e) {
        notify('error', translate('error.session_login_failed'))
        return { kind: 'bad-data' }
      }
    }

    // Biometric login
    const biometricLogin = async (): Promise<{ kind: string }> => {
      try {
        // await delay(200)
        const { available } = await ReactNativeBiometrics.isSensorAvailable()
        if (!available) {
          notify('error', translate('error.biometric_not_support'))
          return { kind: 'bad-data' }
        }

        // Validate biometric
        const { success } = await ReactNativeBiometrics.simplePrompt({
          promptMessage: 'Unlock Locker',
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
    const registerLocker = async (
      masterPassword: string,
      hint: string,
      passwordStrength: number
    ) => {
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
            encrypted_private_key: keys[1].encryptedString,
          },
          score: passwordStrength,
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

        const autofillHashedPassword = await cryptoService.hashPasswordAutofill(
          masterPassword,
          key.keyB64
        )
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
    const updateNewMasterPasswordEA = async (
      newPassword: string,
      email: string,
      eaID: string,
      lockerPassword?: boolean
    ): Promise<{ kind: string }> => {
      try {
        let payload = {}
        if (lockerPassword) {
          payload = {
            new_password: newPassword
          }
        } else {
          const fetchKeyRes = await user.takeoverEA(eaID)
          if (fetchKeyRes.kind !== "ok") return { kind: 'bad-data' }
          const { key_encrypted, kdf, kdf_iterations } = fetchKeyRes.data
          const oldKeyBuffer = await cryptoService.rsaDecrypt(key_encrypted)
          const oldEncKey = new SymmetricCryptoKey(oldKeyBuffer)

          const key = await cryptoService.makeKey(newPassword, email, kdf, kdf_iterations)
          const masterPasswordHash = await cryptoService.hashPassword(newPassword, key)
          const encKey = await cryptoService.remakeEncKey(key, oldEncKey)
          payload = {
            key: encKey[1].encryptedString,
            new_master_password_hash: masterPasswordHash
          }
        }

        // Send API
        const res = await user.passwordEA(eaID, payload)
        if (res.kind !== 'ok') {
          notifyApiError(res)
          return { kind: 'bad-data' }
        }
        // Setup service
        notify('success', translate('success.master_password_updated'))
        return { kind: 'ok' }
      } catch (e) {
        notify('error', translate('error.something_went_wrong'))
        return { kind: 'bad-data' }
      }
    }


    const _createMasterPwItem = async (newPassword: string) => {
      const cipher = new CipherView()
      cipher.type = CipherType.Login
      const loginData = new LoginView()
      loginData.username = 'locker.io'
      loginData.password = newPassword
      const uriView = new LoginUriView()
      uriView.uri = 'https://locker.io'
      loginData.uris = [uriView]
      cipher.login = loginData
      cipher.name = 'Locker Master Password'
      return cipher
    }

    const _createMasterPwItemRequest = async (newPassword: string) => {
      try {
        const cipher = await _createMasterPwItem(newPassword)
        const cipherEnc = await cipherService.encrypt(cipher)
        const data = new CipherRequest(cipherEnc)
        data.type = CipherType.MasterPassword
        return data
      } catch (e) {
        return null
      }
    }

    // Change master password
    const changeMasterPassword = async (
      oldPassword: string,
      newPassword: string
    ): Promise<{ kind: string }> => {
      try {
        // createMasterPwItem
        const data = await _createMasterPwItemRequest(newPassword)

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
          master_password_hash: oldKeyHash,
          master_password_cipher: data
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
        collectionService.clearCache(),
      ])

      const userId = await userService.getUserId()
      await Promise.all([
        folderService.clear(userId),
        cipherService.clear(userId),
        collectionService.clear(userId),
        cryptoService.clearKeys(),
        userService.clear(),
      ])
    }

    // Handle dynamic link
    const handleDynamicLink = async (url: string, navigation?: any) => {
      // Set UTM
      setCookiesFromUrl(url)

      // Redirect
      const WHITELIST_HOSTS = [
        'https://locker.io',
        'https://id.locker.io',
        'https://staging.locker.io',
      ]
      const host = WHITELIST_HOSTS.find((h) => url.startsWith(h))
      if (host) {
        const path = url.split(host)[1]

        // Register
        if (path.startsWith('/register')) {
          navigation?.navigate('signup')
          return !!navigation
        }

        // Authenticate
        if (path.startsWith('/authenticate')) {
          const token = getUrlParameterByName('token', url)
          if (token) {
            const tempUserRes = await user.getUser({
              customToken: token,
              dontSetData: true,
            })

            // Ignore if token is not valid or current user is correct
            if (tempUserRes.kind !== 'ok' || tempUserRes.user.email === user.email) {
              return false
            }

            // Logout if current user is not correct
            if (user.isLoggedIn) {
              await logout()
            }
            navigation?.navigate('init')
            setApiTokens(token)
            const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
            if (userRes.kind === 'ok' && userPwRes.kind === 'ok') {
              if (user.is_pwd_manager) {
                navigation?.navigate('lock')
              } else {
                navigation?.navigate('createMasterPassword')
              }
              return !!navigation
            }
          }
        }
      }
      return false
    }

    // -------------------- REGISTER FUNCTIONS ------------------

    const data = {
      sessionLogin,
      biometricLogin,
      logout,
      lock,
      registerLocker,
      changeMasterPassword,
      updateNewMasterPasswordEA,
      clearAllData,
      handleDynamicLink,
    }

    return (
      <CipherAuthenticationMixinsContext.Provider value={data}>
        {props.children}
      </CipherAuthenticationMixinsContext.Provider>
    )
  }
)

export const useCipherAuthenticationMixins = () => useContext(CipherAuthenticationMixinsContext)
