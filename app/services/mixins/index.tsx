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
import { GET_LOGO_URL, GOOGLE_CLIENT_ID } from '../../config/constants'
import i18n from "i18n-js"
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { saveShared } from '../../utils/keychain'
import { GeneralApiProblem } from '../api/api-problem'
import { AccessToken, LoginManager } from 'react-native-fbsdk-next'
import { FolderView } from '../../../core/models/view/folderView'
import { FolderRequest } from '../../../core/models/request/folderRequest'
import { ImportCiphersRequest } from '../../../core/models/request/importCiphersRequest'
import { KvpRequest } from '../../../core/models/request/kvpRequest'
import { observer } from 'mobx-react-lite'
import { color, colorDark } from '../../theme'

const { createContext, useContext } = React

// Funtion params

type GetCiphersParams = {
  deleted: boolean,
  searchText: string,
  filters: Function[],
  includeExtensions?: boolean
}

// Mixins data

const defaultData = {
  // Data
  color,
  isDark: false,

  // Methods
  sessionLogin: async (masterPassword : string) => { return { kind: 'unknown' } },
  biometricLogin: async () => { return { kind: 'unknown' } },
  logout: async () => {},
  lock: async () => {},
  getSyncData: async () => { return { kind: 'unknown' } },
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
  importCiphers: async (importResult) => { return { kind: 'unknown' } },
  loadPasswordsHealth: async () => {},
  reloadCache: async () => {},

  // Supporting methods
  getRouteName: async () => { return '' },
  isBiometricAvailable: async () => { return false },
  translate: (tx: TxKeyPath, options?: i18n.TranslateOptions) => { return '' },
  notifyApiError: (problem: GeneralApiProblem) => {},
  notify: (type : 'error' | 'success' | 'warning' | 'info', text: string, duration?: undefined | number) => {},
  randomString: () => '',
}


const MixinsContext = createContext(defaultData)

export const MixinsProvider = observer((props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
  const { uiStore, user, cipherStore, folderStore, collectionStore, toolStore } = useStores()
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
    passwordGenerationService,
    auditService
  } = useCoreService()
  const insets = useSafeAreaInsets()

  // ------------------------ DATA -------------------------

  const isDark = uiStore.isDark
  const themeColor = isDark ? colorDark : color

  // -------------------- AUTHENTICATION --------------------

  // Session login
  const sessionLogin = async (masterPassword: string): Promise<{ kind: string }> => {
    try {
      await delay(200)

      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000
      const key = await cryptoService.makeKey(masterPassword, user.email, kdf, kdfIterations)
      const autofillHashedPassword = await cryptoService.hashPasswordAutofill(masterPassword, key.keyB64)
      
      // setup service offline
      await cryptoService.setAutofillKeyHash(autofillHashedPassword)

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
        notify('error', translate('error.biometric_unlock_failed'))
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
      const autofillHashedPassword = await cryptoService.hashPasswordAutofill(masterPassword, key.keyB64)
      const keys = await cryptoService.makeKeyPair(encKey[0])

      await cryptoService.setKey(key)
      await cryptoService.setKeyHash(hashedPassword)
      await cryptoService.setAutofillKeyHash(autofillHashedPassword)
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
      await Promise.all([
        folderService.clearCache(),
        cipherService.clearCache(),
        collectionService.clearCache(),
        cryptoService.clearKeys(),
        userService.clear()
      ])
  
      cipherStore.clearStore()
      collectionStore.clearStore()
      folderStore.clearStore()
      toolStore.clearStore()
      
      await user.logout()
  
      // Sign out of Google
      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_ID
      })
      const isSignedIn = await GoogleSignin.isSignedIn()
      if (isSignedIn) {
        await GoogleSignin.signOut()
      }
  
      // Sign out of Facebook
      if (await AccessToken.getCurrentAccessToken()) {
        LoginManager.logOut()
      }
  
      // Reset shared data
      await saveShared('autofill', '')
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
    }
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

      
      if (cipherStore.isSynching) {
        return { kind: 'synching' }
      }

      cipherStore.setIsSynching(true)
      messagingService.send('syncStarted')

      // Sync offline data first
      await _syncOfflineData()

      // Sync api
      const res = await cipherStore.syncData()
      if (res.kind !== 'ok') {
        messagingService.send('syncCompleted', { successfully: false })
        cipherStore.setIsSynching(false)
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
      
      cipherStore.setLastSync(new Date().getTime())
      messagingService.send('syncCompleted', { successfully: true })

      // Save fingerprint
      const fingerprint = await cryptoService.getFingerprint(userId)
      user.setFingerprint(fingerprint.join('-'))

      // Save to shared keychain for autofill service
      const hashPasswordAutofill = await cryptoService.getAutofillKeyHash()
      const passwordRes = await getCiphers({
        filters: [
          (c : CipherView) => c.type === CipherType.Login && c.login.uri
        ],
        searchText: '',
        deleted: false
      })
      const passwordData = passwordRes.map((c: CipherView) => ({
        id: c.id,
        name: c.name,
        uri: c.login.uri || '',
        username: c.login.username || '',
        password: c.login.password || '',
        isOwner: !c.organizationId
      }))

      const sharedData = {
        passwords: passwordData,
        deleted: [],
        authen: { email: user.email, hashPass: hashPasswordAutofill },
        faceIdEnabled: user.isBiometricUnlock
      }
      await saveShared('autofill', JSON.stringify(sharedData))

      cipherStore.setIsSynching(false)
      return { kind: 'ok' }
    } catch (e) {
      cipherStore.setIsSynching(false)
      messagingService.send('syncCompleted', { successfully: false })
      return { kind: 'bad-data' }
    }
  }

  // Sync offline data
  const _syncOfflineData = async () => {
    const ciphers = []
    const folders = []
    const folderRelationships = []

    // Prepare ciphers
    if (cipherStore.notSynchedCiphers.length > 0) {
      const notSynchedCiphers = await getCiphers({
        deleted: false,
        searchText: '',
        filters: [(c: CipherView) => cipherStore.notSynchedCiphers.includes(c.id)],
        includeExtensions: true
      })
      const notSynchedCiphersDeleted = await getCiphers({
        deleted: true,
        searchText: '',
        filters: [(c: CipherView) => cipherStore.notSynchedCiphers.includes(c.id)],
        includeExtensions: true
      })
      notSynchedCiphers.push(...notSynchedCiphersDeleted)
  
      const promises = []
      notSynchedCiphers.forEach((c: CipherView) => {
        promises.push(
          cipherService.encrypt(c).then(enc => {
            const cipherReq = new CipherRequest(enc)
            if (!c.id.startsWith('tmp__')) {
              // @ts-ignore
              cipherReq.id = c.id
            }
            if (c.isDeleted) {
              // @ts-ignore
              cipherReq.deletedDate = new Date(c.deletedDate).getTime() / 1000
            }
            ciphers.push(cipherReq)
          })
        )
      })
      await Promise.all(promises)
    }

    // Prepare folders
    if (folderStore.notSynchedFolders.length > 0) {
      const promises = []
      folderStore.folders.filter(f => folderStore.notSynchedFolders.includes(f.id)).forEach((f: FolderView) => {
        promises.push(
          folderService.encrypt(f).then(enc => {
            const folderReq = new FolderRequest(enc)
            // @ts-ignore
            folderReq.id = f.id
            folders.push(folderReq)
          })
        )
      })
      await Promise.all(promises)
    }

    // Prepare relationship
    folders.forEach((f, fIndex) => {
      if (f.id.startsWith('tmp__')) {
        ciphers.forEach((c, cIndex) => {
          if (c.folderId === f.id) {
            c.folderId = null
            folderRelationships.push({
              key: cIndex,
              value: fIndex
            })
          }
        })
        delete f.id
      }
    })
    
    // Done
    if (ciphers.length || folders.length) {
      await cipherStore.offlineSyncCipher({
        ciphers,
        folders,
        folderRelationships
      })
      cipherStore.clearNotSync()
      folderStore.clearNotSync()
    }
  }

  // Reload offline cache
  const reloadCache = async () => {
    await cipherService.clearCache()
    cipherStore.setLastOfflineSync(new Date().getTime())
    folderService.clearCache()
    await loadFolders()
    if (cipherStore.selectedCipher) {
      const updatedCipher = await getCipherById(cipherStore.selectedCipher.id)
      cipherStore.setSelectedCipher(updatedCipher)
    }
  }

  // Load folders
  const loadFolders = async () => {
    try {
      const res = await folderService.getAllDecrypted() || []
      for (let f of res) {
        let ciphers = await getCiphers({
          deleted: false,
          searchText: '',
          filters: [c => c.folderId ? c.folderId === f.id : (!c.collectionIds.length && !f.id)]
        })
        f.cipherCount = ciphers ? ciphers.length : 0
      }
      folderStore.setFolders(res)
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
    }
  }

  // Load collections
  const loadCollections = async () => {
    try {
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
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
    }
  }

  // Get ciphers
  const getCiphers = async (params: GetCiphersParams) => {
    try {
      const deletedFilter = (c : CipherView) => c.isDeleted === params.deleted
      const filters = [deletedFilter, ...params.filters]
      if (!params.includeExtensions) {
        filters.unshift((c : CipherView) => 1 <= c.type && c.type <= 4)
      }
      return await searchService.searchCiphers(params.searchText || '', filters, null) || []
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
      return []
    }
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
    try {
      let res = await collectionService.getAllDecrypted() || []
      res = res.filter(item => item.id)
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
      return []
    }
  }

  // Load weak passwords
  const loadPasswordsHealth = async () => {
    try {
      if (!user.plan || user.plan.alias === 'pm_free') {
        return
      }
  
      const passwordStrengthCache = new Map()
      const passwordStrengthMap = new Map()
      const passwordUseMap = new Map()
      const exposedPasswordMap = new Map()
  
      const exposedPasswordCiphers = []
      const promises = []
  
      const allCiphers = await getCiphers({
        deleted: false,
        searchText: '',
        filters: [(c: CipherView) => c.type === CipherType.Login && c.login.password]
      })
      const weakPasswordCiphers = []
      const isUserNameNotEmpty = (c: CipherView) => {
        return c.login.username != null && c.login.username.trim() !== ''
      }
      const getCacheKey = (c: CipherView) => {
        return c.login.password + '_____' + (isUserNameNotEmpty(c) ? c.login.username : '')
      }
  
      allCiphers.forEach((c: CipherView) => {
        const hasUserName = isUserNameNotEmpty(c)
        const cacheKey = getCacheKey(c)
  
        // Check password used
        if (passwordUseMap.has(c.login.password)) {
          passwordUseMap.set(c.login.password, passwordUseMap.get(c.login.password) + 1)
        } else {
          passwordUseMap.set(c.login.password, 1)
        }
  
        // Check password strength
        if (!passwordStrengthCache.has(cacheKey)) {
          let userInput = []
          if (hasUserName) {
            const atPosition = c.login.username.indexOf('@')
            if (atPosition > -1) {
              userInput = userInput.concat(
                c.login.username.substr(0, atPosition).trim().toLowerCase().split(/[^A-Za-z0-9]/)
              ).filter(i => i.length >= 3)
            } else {
              userInput = c.login.username.trim().toLowerCase().split(/[^A-Za-z0-9]/).filter(i => i.length >= 3)
            }
          }
          const result = passwordGenerationService.passwordStrength(
            c.login.password, 
            userInput.length > 0 ? userInput : null
          )
          passwordStrengthCache.set(cacheKey, result.score)
        }
        const score = passwordStrengthCache.get(cacheKey)
        if (score != null && score <= 2) {
          passwordStrengthMap.set(c.id, score)
          weakPasswordCiphers.push(c)
        }
  
        // Check exposed password
        const promise = auditService.passwordLeaked(c.login.password).then(exposedCount => {
          if (exposedCount > 0) {
            exposedPasswordCiphers.push(c)
            exposedPasswordMap.set(c.id, exposedCount)
          }
        })
        promises.push(promise)
      })
  
      await Promise.all(promises)
  
      // Result
      weakPasswordCiphers.sort((a, b) => {
        return passwordStrengthCache.get(getCacheKey(a)) - passwordStrengthCache.get(getCacheKey(b))
      })
      const reusedPasswordCiphers = allCiphers.filter((c: CipherView) => (
        passwordUseMap.has(c.login.password) && passwordUseMap.get(c.login.password) > 1
      ))
  
      toolStore.setWeakPasswords(weakPasswordCiphers)
      toolStore.setPasswordStrengthMap(passwordStrengthMap)
      toolStore.setReusedPasswords(reusedPasswordCiphers)
      toolStore.setPasswordUseMap(passwordUseMap)
      toolStore.setExposedPasswords(exposedPasswordCiphers)
      toolStore.setExposedPasswordMap(exposedPasswordMap)
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
    }
  }

  // ------------------------ CIPHERS ---------------------------

  // Import
  const importCiphers = async (importResult) => {
    // Offline
    if (uiStore.isOffline) {
      return _offlineImportCiphers(importResult)
    }

    // Online
    const request = new ImportCiphersRequest()
    for (let i = 0; i < importResult.ciphers.length; i++) {
      const c = await cipherService.encrypt(importResult.ciphers[i])
      request.ciphers.push(new CipherRequest(c))
    }
    if (importResult.folders != null) {
      for (let i = 0; i < importResult.folders.length; i++) {
        const f = await folderService.encrypt(importResult.folders[i])
        request.folders.push(new FolderRequest(f))
      }
    }
    if (importResult.folderRelationships != null) {
      importResult.folderRelationships.forEach(r =>
        request.folderRelationships.push(new KvpRequest(r[0], r[1])))
    }
    const res = await cipherStore.importCipher(request)
    if (res.kind === 'ok') {
      notify('success', translate('import.success'))
      return res
    } else {
      notifyApiError(res)
      return res
    }
  }

  const _offlineImportCiphers = async (importResult) => {
    // Prepare data
    const ciphers = []
    const folders = []
    for (let i = 0; i < importResult.ciphers.length; i++) {
      const c = await cipherService.encrypt(importResult.ciphers[i])
      const enc = new CipherRequest(c)
      const tempId = 'tmp__' + randomString()
      // @ts-ignore
      enc.id = tempId
      ciphers.push(enc)
    }
    if (importResult.folders != null) {
      for (let i = 0; i < importResult.folders.length; i++) {
        const f = await folderService.encrypt(importResult.folders[i])
        const enc = new FolderRequest(f)
        const tempId = 'tmp__' + randomString()
        // @ts-ignore
        enc.id = tempId
        folders.push(enc)
      }
    }
    if (importResult.folderRelationships != null) {
      importResult.folderRelationships.forEach(r => {
        ciphers[r[0]].folderId = folders[r[1]].id
      })
    }

    // Update cipher storage
    const userId = await userService.getUserId()
    if (ciphers.length) {
      const key = `ciphers_${userId}`
      const res = await storageService.get(key)
      ciphers.forEach(c => {
        cipherStore.addNotSync(c.id)
        res[c.id] = {
          ...c,
          userId
        }
      })
      await storageService.save(key, res)
    }

    // Update folder storage
    if (folders.length) {
      const key = `folders_${userId}`
      const res = await storageService.get(key)
      ciphers.forEach(f => {
        folderStore.addNotSync(f.id)
        res[f.id] = {
          ...f,
          userId
        }
      })
      await storageService.save(key, res)
    }

    await reloadCache()
    notify('success', translate('import.success') + ' ' + translate('success.will_sync_when_online'))
    return { kind: 'ok' }
  }

  // Create
  const createCipher = async (cipher: CipherView, score: number, collectionIds: string[]) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineCreateCipher(cipher, collectionIds)
        notify('success', `${translate('success.cipher_created')} ${translate('success.will_sync_when_online')}`)
        return { kind: 'ok' }
      } 

      // Online
      const cipherEnc = await cipherService.encrypt(cipher)
      const data = new CipherRequest(cipherEnc)
      const res = await cipherStore.createCipher(data, score, collectionIds)
      if (res.kind === 'ok') {
        notify('success', translate('success.cipher_created'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
      return { kind: 'unknown' }
    }
  }

  // Offline create
  const _offlineCreateCipher = async (cipher: CipherView, collectionIds: string[]) => {
    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key)

    const cipherEnc = await cipherService.encrypt(cipher)
    const data = new CipherRequest(cipherEnc)
    const tempId = 'tmp__' + randomString()

    res[tempId] = {
      ...data,
      userId,
      id: tempId,
      collectionIds
    }
    await storageService.save(key, res)
    cipherStore.addNotSync(tempId)
    await reloadCache()
  }

  // Update
  const updateCipher = async (id: string, cipher: CipherView, score: number, collectionIds: string[]) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineUpdateCipher(cipher, collectionIds)
        notify('success', `${translate('success.cipher_updated')} ${translate('success.will_sync_when_online')}`)
        return { kind: 'ok' }
      } 

      // Online
      const cipherEnc = await cipherService.encrypt(cipher)
      const data = new CipherRequest(cipherEnc)
      const res = await cipherStore.updateCipher(id, data, score, collectionIds)
      if (res.kind === 'ok') {
        notify('success', translate('success.cipher_updated'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
      return { kind: 'unknown' }
    }
  }

  // Offline update
  const _offlineUpdateCipher = async (cipher: CipherView, collectionIds: string[]) => {
    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key)

    const cipherEnc = await cipherService.encrypt(cipher)
    const data = new CipherRequest(cipherEnc)
    
    res[cipher.id] = {
      ...res[cipher.id],
      ...data,
      collectionIds,
      revisionDate: new Date().toISOString()
    }
    await storageService.save(key, res)
    cipherStore.addNotSync(cipher.id)
    await reloadCache()
  }

  // Delete
  const deleteCiphers = async (ids: string[]) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineDeleteCiphers(ids)
        notify('success', `${translate('success.cipher_deleted')}`)
        return { kind: 'ok' }
      } 

      // Online
      const res = await cipherStore.deleteCiphers(ids)
      if (res.kind === 'ok') {
        notify('success', translate('success.cipher_deleted'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
      return { kind: 'unknown' }
    }
  }

  // Offline delete
  const _offlineDeleteCiphers = async (ids: string[]) => {
    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key)

    ids.forEach(id => {
      delete res[id]
      cipherStore.removeNotSync(id)
    })
    await storageService.save(key, res)
    await reloadCache()
  }

  // To trash
  const toTrashCiphers = async (ids: string[]) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineToTrashCiphers(ids)
        notify('success', `${translate('success.cipher_trashed')} ${translate('success.will_sync_when_online')}`)
        return { kind: 'ok' }
      } 

      // Online
      const res = await cipherStore.toTrashCiphers(ids)
      if (res.kind === 'ok') {
        notify('success', translate('success.cipher_trashed'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
      return { kind: 'unknown' }
    }
  }

  // Offline to trash
  const _offlineToTrashCiphers = async (ids: string[]) => {
    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key)

    ids.forEach(id => {
      res[id].deletedDate = new Date().toISOString()
      cipherStore.addNotSync(id)
    })
    await storageService.save(key, res)
    await reloadCache()
  }

  // Restore
  const restoreCiphers = async (ids: string[]) => {
    // Offline
    if (uiStore.isOffline) {
      await _offlineRestoreCiphers(ids)
      notify('success', `${translate('success.cipher_restored')} ${translate('success.will_sync_when_online')}`)
      return { kind: 'ok' }
    } 

    // Online
    try {
      const res = await cipherStore.restoreCiphers(ids)
      if (res.kind === 'ok') {
        notify('success', translate('success.cipher_restored'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
      return { kind: 'unknown' }
    }
  }

  // Offline restore
  const _offlineRestoreCiphers = async (ids: string[]) => {
    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key)

    ids.forEach(id => {
      res[id].deletedDate = null
      cipherStore.addNotSync(id)
    })
    await storageService.save(key, res)
    await reloadCache()
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
      visibilityTime: duration ? duration : type === 'error' ? 3000 : 1500,
      topOffset: insets.top + 10,
      onPress: () => {
        Toast.hide()
      }
    })
  }

  // Random string
  const randomString = () => {
    return nanoid()
  }

  // Clipboard
  const copyToClipboard = (text: string) => {
    notify('success', translate('common.copied_to_clipboard'), 1000)
    Clipboard.setString(text)
  }

  // Get website logo
  const getWebsiteLogo = (uri: string) => {
    if (!uri) {
      return { uri: null }
    }
    const imgUri = `${GET_LOGO_URL}/${uri.split('//')[1]}?size=40`
    return { uri: imgUri }
  }

  // Get team
  const getTeam = (teams: object[], orgId: string) => {
    return find(teams, e => e.id === orgId) || { name: '', role: '' }
  }

  // Check if biometric is viable
  const isBiometricAvailable = async () => {
    try {
      const { available } = await ReactNativeBiometrics.isSensorAvailable()
      return available
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      __DEV__ && console.log(e)
      return false
    }
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
    color: themeColor,
    isDark,

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
    notifyApiError,
    loadPasswordsHealth,
    reloadCache,
    importCiphers
  }

  return (
    <MixinsContext.Provider value={data}>
      {props.children}
    </MixinsContext.Provider>
  )
})

export const useMixins = () => useContext(MixinsContext)
