import React from 'react'
import { nanoid } from 'nanoid'
import find from 'lodash/find'
import ReactNativeBiometrics from 'react-native-biometrics'
import Toast from 'react-native-toast-message'
import { KdfType } from '../../../core/enums/kdfType'
import { useStores } from '../../models'
import { useCoreService } from '../core-service'
import { CardView, CipherView, IdentityView, LoginUriView, LoginView, SecureNoteView } from '../../../core/models/view'
import { CipherType, SecureNoteType } from '../../../core/enums'
import Clipboard from '@react-native-clipboard/clipboard'
import { CipherRequest } from '../../../core/models/request/cipherRequest'
import { load } from '../../utils/storage'
import { delay } from '../../utils/delay'
import { translate as tl, TxKeyPath } from "../../i18n"
import { GET_LOGO_URL } from '../../config/constants'
import i18n from "i18n-js"
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { saveShared } from '../../utils/keychain'
import { GeneralApiProblem } from '../api/api-problem'

const { createContext, useContext } = React

// Funtion params

type GetCiphersParams = {
  deleted: boolean,
  searchText: string,
  filters: Function[]
}

// Mixins data

const defaultData = {
  sessionLogin: async (masterPassword : string) => { return { kind: 'unknown' } },
  biometricLogin: async () => { return { kind: 'unknown' } },
  logout: async () => {},
  lock: async () => {},
  getSyncData: async () => { return { kind: 'unknown' } },
  notify: (type : 'error' | 'success' | 'warning' | 'info', text: string, duration?: undefined | number) => {},
  randomString: () => '',
  newCipher: (type: CipherType) => { return new CipherView() },
  registerLocker: async (masterPassword: string, hint: string, passwordStrength: number) => { return { kind: 'unknown' } },
  changeMasterPassword: async (oldPassword: string, newPassword: string) => { return { kind: 'unknown' } },
  getWebsiteLogo: (uri: string) => ({ uri: '' }),
  getTeam: (teams: object[], orgId: string) => ({ name: '', role: '' }),
  getCiphers: async (params: GetCiphersParams) => { return [] },
  getCipherById: async (id: string) => new CipherView(),
  getCollections: async () => { return [] },
  loadFolders: async () => {},
  loadCollections: async () => {},
  getPasswordStrength: (password: string) => ({ score: 0 }),
  copyToClipboard: (text: string) => {},
  createCipher: async (cipher: CipherView, score: number, collectionIds: string[]) => { return { kind: 'unknown' } },
  updateCipher: async (id: string, cipher: CipherView, score: number, collectionIds: string[]) => { return { kind: 'unknown' } },
  toTrashCiphers: async (ids: string[]) => { return { kind: 'unknown' } },
  deleteCiphers: async (ids: string[]) => { return { kind: 'unknown' } },
  restoreCiphers: async (ids: string[]) => { return { kind: 'unknown' } },
  getRouteName: async () => { return '' },
  isBiometricAvailable: async () => { return false },
  translate: (tx: TxKeyPath, options?: i18n.TranslateOptions) => { return '' },
  notifyApiError: (problem: GeneralApiProblem) => {}
}


const MixinsContext = createContext(defaultData)

export const MixinsProvider = (props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
  const { uiStore, user, cipherStore, folderStore, collectionStore } = useStores()
  const {
    cryptoService,
    userService,
    folderService,
    cipherService,
    searchService,
    collectionService,
    platformUtilsService,
    storageService,
    messagingService,
    tokenService,
    syncService,
    passwordGenerationService
  } = useCoreService()
  const insets = useSafeAreaInsets()

  // -------------------- AUTHENTICATION --------------------

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

      // Session login API
      const res = await user.sessionLogin({
        client_id: 'mobile',
        password: keyHash,
        device_name: platformUtilsService.getDeviceString(),
        device_type: platformUtilsService.getDevice(),
        device_identifier: await storageService.get('device_id') || randomString()
      })
      if (res.kind === 'unauthorized') {
        notify('error', translate('error.token_expired'))
        user.clearToken()
        return { kind: 'unauthorized' }
      }

      if (res.kind !== 'ok') {
        notify('error', translate('error.session_login_failed'))
        return { kind: 'bad-data' }
      }

      // Setup service
      messagingService.send('loggedIn')
      await tokenService.setTokens(res.data.access_token, res.data.refresh_token)
      await userService.setInformation(tokenService.getUserId(), user.email, kdf, kdfIterations)
      await cryptoService.setKey(key)
      await cryptoService.setKeyHash(keyHash)
      await cryptoService.setEncKey(res.data.key)
      await cryptoService.setEncPrivateKey(res.data.private_key)

      return { kind: 'ok' }
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

      // Validate
      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: 'Unlock Locker'
      })
      if (!success) {
        notify('error', translate('error.session_login_failed'))
        return { kind: 'bad-data' }
      }

      // Check key
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

      await cryptoService.setKey(key)
      await cryptoService.setKeyHash(hashedPassword)
      await cryptoService.setEncKey(encKey[1].encryptedString)
      await cryptoService.setEncPrivateKey(keys[1].encryptedString)

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

      // Success
      notify('success', translate('success.master_password_updated'))

      await delay(2000)

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
    await Promise.all([
      user.logout(),
      folderService.clearCache(),
      cipherService.clearCache(),
      collectionService.clearCache(),
      cryptoService.clearKeys(),
      userService.clear()
    ])

    // Sign out of Google
    const isSignedIn = await GoogleSignin.isSignedIn()
    if (isSignedIn) {
      await GoogleSignin.signOut()
    }

    // Reset shared data
    await saveShared('autofill', '[]')
  }

  // Lock screen
  const lock = async () => {
    folderService.clearCache()
    cipherService.clearCache()
    // searchService.clearCache()
    collectionService.clearCache()
    user.lock()
  }

  // ------------------------ DATA ---------------------------

  // Sync
  const getSyncData = async () => {
    try {
      messagingService.send('syncStarted')

      // Sync api
      const res = await cipherStore.syncData()
      if (res.kind !== 'ok') {
        messagingService.send('syncCompleted', { successfully: false })
        return res
      }

      // Sync service
      const userId = await userService.getUserId()

      await syncService.syncProfile(res.data.profile)
      await syncService.syncFolders(userId, res.data.folders)
      await syncService.syncCollections(res.data.collections)
      await syncService.syncCiphers(userId, res.data.ciphers)
      await syncService.syncSends(userId, res.data.sends)
      await syncService.syncSettings(userId, res.data.domains)
      await syncService.syncPolicies(res.data.policies)
      await syncService.setLastSync(new Date())
      messagingService.send('syncCompleted', { successfully: true })

      // Save to shared keychain for autofill service
      const passwordRes = await getCiphers({
        filters: [
          (c : CipherView) => c.type === CipherType.Login
        ],
        searchText: '',
        deleted: false
      })
      const sharedData = passwordRes.map((c: CipherView) => ({
        uri: c.login.uri,
        username: c.login.username,
        password: c.login.password
      }))
      await saveShared('autofill', JSON.stringify(sharedData))

      return { kind: 'ok' }
    } catch (e) {
      messagingService.send('syncCompleted', { successfully: false })
      return { kind: 'bad-data' }
    }
  }

  // Load folders
  const loadFolders = async () => {
    const res = await folderService.getAllDecrypted() || []
    for (let f of res) {
      let ciphers = await getCiphers({
        deleted: false,
        searchText: '',
        filters: [c => c.folderId === f.id && !c.collectionIds.length]
      })
      f.cipherCount = ciphers ? ciphers.length : 0
    }
    folderStore.setFolders(res)
  }

  // Load collections
  const loadCollections = async () => {
    const res = await collectionService.getAllDecrypted() || []
    for (let f of res) {
      let ciphers = await getCiphers({
        deleted: false,
        searchText: '',
        filters: [c => c.collectionIds.includes(f.id)]
      })
      f.cipherCount = ciphers ? ciphers.length : 0
    }
    collectionStore.setCollections(res)
  }

  // Get ciphers
  const getCiphers = async (params: GetCiphersParams) => {
    // Filter
    const deletedFilter = (c : CipherView) => c.isDeleted === params.deleted
    const filters = [deletedFilter, ...params.filters]
    return await searchService.searchCiphers(params.searchText || '', filters, null) || []
  }

  // Get cipher by id
  const getCipherById = async (id: string) => {
    const ciphers = await getCiphers({
      deleted: false,
      searchText: '',
      filters: []
    })
    return find(ciphers, e => e.id === id) || new CipherView()
  }

  // Get collections
  const getCollections = async () => {
    let res = await collectionService.getAllDecrypted() || []
    res = res.filter(item => item.id)
    return res
  }

  // ------------------------ CIPHERS ---------------------------

  const createCipher = async (cipher: CipherView, score: number, collectionIds: string[]) => {
    const cipherEnc = await cipherService.encrypt(cipher)
    const data = new CipherRequest(cipherEnc)
    const res = await cipherStore.createCipher(data, score, collectionIds)
    if (res.kind === 'ok') {
      notify('success', translate('success.cipher_created'))
    } else {
      notifyApiError(res)
    }
    return res
  }

  const updateCipher = async (id: string, cipher: CipherView, score: number, collectionIds: string[]) => {
    const cipherEnc = await cipherService.encrypt(cipher)
    const data = new CipherRequest(cipherEnc)
    const res = await cipherStore.updateCipher(id, data, score, collectionIds)
    if (res.kind === 'ok') {
      notify('success', translate('success.cipher_updated'))
    } else {
      notifyApiError(res)
    }
    return res
  }

  const deleteCiphers = async (ids: string[]) => {
    const res = await cipherStore.deleteCiphers(ids)
    if (res.kind === 'ok') {
      notify('success', translate('success.cipher_deleted'))
    } else {
      notifyApiError(res)
    }
    return res
  }

  const toTrashCiphers = async (ids: string[]) => {
    const res = await cipherStore.toTrashCiphers(ids)
    if (res.kind === 'ok') {
      notify('success', translate('success.cipher_trashed'))
    } else {
      notifyApiError(res)
    }
    return res
  }

  const restoreCiphers = async (ids: string[]) => {
    const res = await cipherStore.restoreCiphers(ids)
    if (res.kind === 'ok') {
      notify('success', translate('success.cipher_restored'))
    } else {
      notifyApiError(res)
    }
    return res
  }


  // ------------------------ SUPPORT -------------------------

  const newCipher = (type: CipherType) => {
    const cipher = new CipherView()
    cipher.organizationId = null
    cipher.type = type
    cipher.login = new LoginView()
    cipher.login.uris = [new LoginUriView]
    cipher.card = new CardView()
    cipher.identity = new IdentityView()
    cipher.secureNote = new SecureNoteView()
    cipher.secureNote.type = SecureNoteType.Generic
    cipher.folderId = null
    cipher.collectionIds = []
    return cipher
  }

  // Password strength
  const getPasswordStrength = (password: string) => {
    return passwordGenerationService.passwordStrength(password, ['cystack']) || { score: 0 }
  }

  // Get current route name
  const getRouteName = async () => {
    const res = await load('NAVIGATION_STATE')
    let route = res.routes.slice(-1)[0]
    while (route.state && route.state.routes) {
      route = route.state.routes.slice(-1)[0]
    }
    return route.name
  }

  // Alert message
  const notify = (
    type : 'error' | 'success' | 'info',
    text: null | string,
    duration?: undefined | number
  ) => {
    Toast.show({
      type: type,
      text2: text,
      position: 'top',
      autoHide: true,
      visibilityTime: duration ? duration : type === 'error' ? 5000 : 2000,
      topOffset: insets.top + 10
    })
  }

  // Random string
  const randomString = () => {
    return nanoid()
  }

  // Clipboard
  const copyToClipboard = (text: string) => {
    notify('success', translate('common.copied_to_clipboard'), 500)
    Clipboard.setString(text)
  }

  // Get website logo
  const getWebsiteLogo = (uri: string) => {
    const imgUri = `${GET_LOGO_URL}/${uri.split('//')[1]}?size=40`
    return { uri: imgUri }
  }

  // Get team
  const getTeam = (teams: object[], orgId: string) => {
    return find(teams, e => e.id === orgId) || { name: '', role: '' }
  }

  // Check if biometric is viable
  const isBiometricAvailable = async () => {
    const { available } = await ReactNativeBiometrics.isSensorAvailable()
    return available
  }

  // Custom translate to force re render
  const translate = (tx: TxKeyPath, options?: i18n.TranslateOptions) => {
    // Dummy to force rerender
    // @ts-ignore
    const abc = user.language
    return tl(tx, options)
  }

  // Notify based on api error
  const notifyApiError = (problem: GeneralApiProblem) => {
    switch (problem.kind) {
      case 'cannot-connect':
        notify('error', translate('error.network_error'))
        break
      case 'bad-data':
      case 'rejected':
        notify('error', translate('error.invalid_data'))
        break
      case 'forbidden':
        notify('error', translate('error.forbidden'))
        break
      case 'not-found':
        notify('error', translate('error.not_found'))
        break
      case 'unauthorized':
        notify('error', translate('error.token_expired'))
        break
      default:
        notify('error', translate('error.something_went_wrong'))
    }
  }

  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    sessionLogin,
    biometricLogin,
    logout,
    lock,
    notify,
    randomString,
    getSyncData,
    newCipher,
    registerLocker,
    changeMasterPassword,
    getWebsiteLogo,
    getTeam,
    getCiphers,
    getCipherById,
    getCollections,
    loadFolders,
    loadCollections,
    getPasswordStrength,
    copyToClipboard,
    createCipher,
    updateCipher,
    deleteCiphers,
    toTrashCiphers,
    restoreCiphers,
    getRouteName,
    isBiometricAvailable,
    translate,
    notifyApiError
  }

  return (
    <MixinsContext.Provider value={data}>
      {props.children}
    </MixinsContext.Provider>
  )
}

export const useMixins = () => useContext(MixinsContext)
