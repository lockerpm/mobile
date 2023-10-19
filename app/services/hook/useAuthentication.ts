/* eslint-disable camelcase */
import { useStores } from 'app/models'
import { useHelper } from './useHelper'
import { useCoreService } from '../coreService'
import { SymmetricCryptoKey } from 'core/models/domain'
import moment from 'moment'
import DeviceInfo from 'react-native-device-info'
import { KdfType } from 'core/enums/kdfType'
import { Utils } from '../coreService/utils'
import ReactNativeBiometrics from 'react-native-biometrics'
import { CipherRequest } from 'core/models/request'
import { CipherType } from 'core/enums'
import { CipherView, LoginUriView, LoginView } from 'core/models/view'
import { Logger, delay, getUrlParameterByName } from 'app/utils/utils'
import { saveShared } from 'app/utils/keychain'
import { StorageKey, remove, removeSecure } from 'app/utils/storage'
import Intercom from '@intercom/intercom-react-native'
import { setCookiesFromUrl } from 'app/utils/analytics'

export function useAuthentication() {
  const { uiStore, user, cipherStore, folderStore, collectionStore, toolStore, enterpriseStore } =
    useStores()
  const {
    cryptoService,
    cryptoFunctionService,
    userService,
    folderService,
    cipherService,
    collectionService,
    platformUtilsService,
    messagingService,
    tokenService,
  } = useCoreService()
  const { notify, notifyApiError, setApiTokens, translate } = useHelper()

  // -------------------- AUTHENTICATION --------------------

  // Login vault using API
  const _loginUsingApi = async (
    key: SymmetricCryptoKey,
    keyHash: string,
    kdf: number,
    kdfIterations: number,
    masterPassword?: string,
    createMasterPasswordItem?: () => Promise<void>,
    onPremiseData?: boolean
  ) => {
    // Session login API
    const res = await user.sessionLogin({
      client_id: 'mobile',
      password: keyHash, // keyHash,
      device_name: platformUtilsService.getDeviceString(),
      device_type: platformUtilsService.getDevice(),
      // device_identifier: await storageService.get('device_id') || randomString(),
      device_identifier: await DeviceInfo.getUniqueId(),
      email: user.email,
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
        } else if (res.data.code === '1009') {
          return { kind: 'enterprise-lock' }
        } else if (res.data.code === '1010') {
          return { kind: 'enterprise-system-lock' }
        } else {
          notifyApiError(res)
        }
        return res
      }

      notify('error', translate('error.session_login_failed'))
      return res
    }

    if (onPremiseData) {
      setApiTokens(res.data?.access_token)
      await Promise.all([user.getUser(), user.getUserPw()])
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

    if (res.data.has_no_master_pw_item && createMasterPasswordItem !== undefined) {
      uiStore.setHasNoMasterPwItem(true)
      await createMasterPasswordItem()
    }
    return { kind: 'ok' }
  }

  // Login vault using API
  const _loginOnPremiseSessionOtp = async (
    key: SymmetricCryptoKey,
    keyHash: string,
    kdf: number,
    kdfIterations: number,
    masterPassword: string,
    method: string,
    otp: string,
    save_device: boolean
  ) => {
    // Session login API
    const res = await user.sessionOtpLogin({
      client_id: 'mobile',
      password: keyHash, // keyHash,
      device_name: platformUtilsService.getDeviceString(),
      device_type: platformUtilsService.getDevice(),
      // device_identifier: await storageService.get('device_id') || randomString(),
      device_identifier: await DeviceInfo.getUniqueId(),
      email: user.email,
      method,
      otp,
      save_device,
    })
    if (res.kind === 'unauthorized') {
      notify('error', translate('error.token_expired'))
      return { kind: 'unauthorized' }
    }
    if (res.kind !== 'ok') {
      notify('error', translate('error.session_login_failed'))
      return res
    }

    setApiTokens(res.data?.access_token)
    await Promise.all([user.getUser(), user.getUserPw()])

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

    return { kind: 'ok' }
  }

  // Session login
  const sessionLogin = async (
    masterPassword: string,
    createMasterPasswordItem?: () => Promise<void>,
    onPremiseData?: boolean
  ): Promise<{ kind: string }> => {
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
      return _loginUsingApi(
        key,
        keyHash,
        kdf,
        kdfIterations,
        masterPassword,
        createMasterPasswordItem,
        onPremiseData
      )
    } catch (e) {
      notify('error', translate('error.session_login_failed'))
      return { kind: 'bad-data' }
    }
  }
  // password less qr login
  const sessionQrLogin = async (
    qr: string,
    qrOtp: string,
    onPremise?: boolean
  ): Promise<{ kind: string }> => {
    try {
      await delay(100)
      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000
      const keyStr = (qrOtp + qrOtp + qrOtp).slice(0, 16)
      const keyBuff = Utils.fromUtf8ToArray(keyStr).buffer

      // parse qr
      const iv = Utils.fromB64ToArray(qr.split('.')[0]).buffer
      const encryptB64 = Utils.fromB64ToArray(qr.split('.')[1]).buffer

      const dataBuffer = await cryptoFunctionService.aesDecrypt(encryptB64, iv, keyBuff)
      const data = Utils.fromBufferToUtf8(dataBuffer)
      const [keyHash, keyB64, encType] = data.split('.')

      const key = new SymmetricCryptoKey(Utils.fromB64ToArray(keyB64).buffer, parseInt(encType))
      // Online session login
      return _loginUsingApi(key, keyHash, kdf, kdfIterations, '', () => null, onPremise)
    } catch (e) {
      notify('error', translate('error.session_login_failed'))
      return { kind: 'bad-data' }
    }
  }

  // password less qr login
  const sessionBusinessQrLogin = async (qr: string, qrOtp: string): Promise<{ kind: string }> => {
    try {
      await delay(100)
      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000
      const keyStr = (qrOtp + qrOtp + qrOtp).slice(0, 16)
      const keyBuff = Utils.fromUtf8ToArray(keyStr).buffer

      // parse qr
      const iv = Utils.fromB64ToArray(qr.split('.')[0]).buffer
      const encryptB64 = Utils.fromB64ToArray(qr.split('.')[1]).buffer

      const dataBuffer = await cryptoFunctionService.aesDecrypt(encryptB64, iv, keyBuff)
      const data = Utils.fromBufferToUtf8(dataBuffer)
      const [keyHash, keyB64, encType] = data.split('.')

      const key = new SymmetricCryptoKey(Utils.fromB64ToArray(keyB64).buffer, parseInt(encType))
      // Online session login
      return _loginUsingApi(key, keyHash, kdf, kdfIterations)
    } catch (e) {
      notify('error', translate('error.session_login_failed'))
      return { kind: 'bad-data' }
    }
  }

  // Session login
  const sessionOtpLoginWithHashPassword = async (
    masterPasswordHash: string,
    key: SymmetricCryptoKey,
    method: string,
    otp: string,
    save_device: boolean
  ): Promise<{ kind: string }> => {
    try {
      await delay(200)

      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000

      return _loginOnPremiseSessionOtp(
        key,
        masterPasswordHash,
        kdf,
        kdfIterations,
        '',
        method,
        otp,
        save_device
      )
    } catch (e) {
      notify('error', translate('error.session_login_failed'))
      return { kind: 'bad-data' }
    }
  }

  // Session login
  const sessionOtpLogin = async (
    masterPassword: string,
    method: string,
    otp: string,
    save_device: boolean
  ): Promise<{ kind: string }> => {
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
      return _loginOnPremiseSessionOtp(
        key,
        keyHash,
        kdf,
        kdfIterations,
        masterPassword,
        method,
        otp,
        save_device
      )
    } catch (e) {
      notify('error', translate('error.session_login_failed'))
      return { kind: 'bad-data' }
    }
  }

  // Biometric login
  const biometricLogin = async (): Promise<{ kind: string }> => {
    try {
      await delay(200)
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
      if (lockerPassword) {
        const res = await user.lockerPasswordEA(eaID, newPassword)
        if (res.kind !== 'ok') {
          notifyApiError(res)
          return { kind: 'bad-data' }
        }
        // Setup service
        notify('success', translate('success.locker_password_updated'))
      } else {
        const fetchKeyRes = await user.takeoverEA(eaID)
        if (fetchKeyRes.kind !== 'ok') return { kind: 'bad-data' }
        const { key_encrypted, kdf, kdf_iterations } = fetchKeyRes.data
        const oldKeyBuffer = await cryptoService.rsaDecrypt(key_encrypted)
        const oldEncKey = new SymmetricCryptoKey(oldKeyBuffer)

        const key = await cryptoService.makeKey(newPassword, email, kdf, kdf_iterations)

        const masterPasswordHash = await cryptoService.hashPassword(newPassword, key)
        const encKey = await cryptoService.remakeEncKey(key, oldEncKey)

        // Update Master Password item
        const cipher = _createMasterPwItem(newPassword)
        const cipherEnc = await cipherService.encrypt(cipher, encKey[0])
        const data = new CipherRequest(cipherEnc)
        data.type = CipherType.MasterPassword

        const payload = {
          key: encKey[1].encryptedString,
          new_master_password_hash: masterPasswordHash,
          master_password_cipher: data,
        }
        const res = await user.passwordEA(eaID, payload)
        if (res.kind !== 'ok') {
          notifyApiError(res)
          return { kind: 'bad-data' }
        }
        // Setup service
        notify('success', translate('success.master_password_updated'))
      }

      return { kind: 'ok' }
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      return { kind: 'bad-data' }
    }
  }

  const _createMasterPwItem = (newPassword: string) => {
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
      const cipher = _createMasterPwItem(newPassword)
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
    newPassword: string,
    hint: string
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
        master_password_cipher: data,
        new_master_password_hint: hint,
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
      await user.updateFCM(null)
      await user.logout()
      await clearAllData()
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
    enterpriseStore.clearStore(dataOnly)

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

      // emergencyAccess
      if (path.startsWith('/settings/security')) {
        uiStore.setIsDeeplinkEmergencyAccess(true)
        return false
      }

      // emergencyAccess
      if (path.startsWith('/shares')) {
        uiStore.setIsDeeplinkShares(true)
        return false
      }
    }
    return false
  }

  return {
    sessionLogin,
    sessionOtpLogin,
    biometricLogin,
    logout,
    lock,
    registerLocker,
    changeMasterPassword,
    updateNewMasterPasswordEA,
    clearAllData,
    handleDynamicLink,
    sessionQrLogin,
    sessionOtpLoginWithHashPassword,
    sessionBusinessQrLogin,
  }
}
