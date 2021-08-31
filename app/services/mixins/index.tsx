import React from 'react'
import { IToastProps, useToast } from 'native-base'
import { Text } from "../../components"
import { nanoid } from 'nanoid'
import find from 'lodash/find'
import { KdfType } from '../../../core/enums/kdfType'
import { useStores } from '../../models'
import { useCoreService } from '../core-service'
import { CardView, CipherView, IdentityView, LoginUriView, LoginView, SecureNoteView } from '../../../core/models/view'
import { CipherType, SecureNoteType } from '../../../core/enums'
import Clipboard from '@react-native-clipboard/clipboard'
import { CipherRequest } from '../../../core/models/request/cipherRequest'
import { load } from '../../utils/storage'
import { delay } from '../../utils/delay'

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
  getSyncData: async () => {},
  notify: (type : 'error' | 'success' | 'warning' | 'info', title : string, text: string, duration?: undefined | number) => {},
  randomString: () => '',
  newCipher: (type: CipherType) => { return new CipherView() },
  register: async (masterPassword: string, hint: string, passwordStrength: number) => { return { kind: 'unknown' } },
  getWebsiteLogo: (uri: string) => ({ uri: '' }),
  getTeam: (teams: object[], orgId: string) => ({ name: '' }),
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
  getRouteName: async () => { return '' }
}


const MixinsContext = createContext(defaultData)

export const MixinsProvider = (props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
  const toast = useToast()
  const { user, cipherStore, folderStore, collectionStore } = useStores()
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

  // -------------------- AUTHENTICATION --------------------

  // Session login
  const sessionLogin = async (masterPassword: string): Promise<{ kind: string }> => {
    try {
      await delay(200)

      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000
      const key = await cryptoService.makeKey(masterPassword, user.email, kdf, kdfIterations)

      // Offline compare
      const storedKeyHash = await cryptoService.getKeyHash()
      if (storedKeyHash) {
        const passwordValid = await cryptoService.compareAndUpdateKeyHash(masterPassword, key)
        if (passwordValid) {
          messagingService.send('loggedIn')
          await cryptoService.setKey(key)
          return { kind: 'ok' }
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
        notify('error', '', 'Token expired')
        user.clearToken()
        return { kind: 'unauthorized' }
      }

      if (res.kind !== 'ok') {
        notify('error', '', 'Session login failed')
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
      notify('error', '', 'Session login failed')
      return { kind: 'bad-data' }
    }
  }

  // Biometric login
  const biometricLogin =  async (): Promise<{ kind: string }> => {
    try {
      await delay(200)
      messagingService.send('loggedIn')
      const storedKey = await cryptoService.getKey()
      await cryptoService.setKey(storedKey)
      return { kind: 'ok' }
    } catch (e) {
      notify('error', '', 'Biometric login failed')
      return { kind: 'bad-data' }
    }
  }

  // Set master password
  const register = async (masterPassword: string, hint: string, passwordStrength: number) => {
    try {
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

      const res = await user.register({
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
        notify('error', 'Error', 'Session login failed')
        return { kind: 'bad-data' }
      }

      // Success
      notify('success', 'Success', 'Master password is set')
      return { kind: 'ok' }
    } catch (e) {
      notify('error', 'Error', 'Set master password failed')
      return { kind: 'bad-data' }
    }
  }

  // Logout
  const logout = async () => {
    cipherStore.clearToken()
    folderStore.clearToken()
    await Promise.all([
      user.logout(),
      cryptoService.clearKeys(),
      userService.clear()
    ])
  }

  // Lock screen
  const lock = async () => {
    await Promise.all([
      cryptoService.clearKey(),
      cryptoService.clearOrgKeys(true),
      cryptoService.clearKeyPair(true),
      cryptoService.clearEncKey(true)
    ])
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
        notify('error', 'Error', 'Sync failed')
        messagingService.send('syncCompleted', { successfully: false })
        return
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
    } catch (e) {
      notify('error', 'Error', 'Sync failed')
      messagingService.send('syncCompleted', { successfully: false })
    }
  }

  // Load folders
  const loadFolders = async () => {
    const res = await folderService.getAllDecrypted() || []
    folderStore.setFolders(res)
  }

  // Load collections
  const loadCollections = async () => {
    const res = await collectionService.getAllDecrypted() || []
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
      notify('success', '', 'New item created')
    } else {
      notify('error', '', 'Something went wrong')
    }
    return res
  }

  const updateCipher = async (id: string, cipher: CipherView, score: number, collectionIds: string[]) => {
    const cipherEnc = await cipherService.encrypt(cipher)
    const data = new CipherRequest(cipherEnc)
    const res = await cipherStore.updateCipher(id, data, score, collectionIds)
    if (res.kind === 'ok') {
      notify('success', '', 'Item updated')
    } else {
      notify('error', '', 'Something went wrong')
    }
    return res
  }

  const deleteCiphers = async (ids: string[]) => {
    const res = await cipherStore.deleteCiphers(ids)
    if (res.kind === 'ok') {
      notify('success', '', 'Deleted')
    } else {
      notify('error', '', 'Something went wrong')
    }
    return res
  }

  const toTrashCiphers = async (ids: string[]) => {
    const res = await cipherStore.toTrashCiphers(ids)
    if (res.kind === 'ok') {
      notify('success', '', 'Moved to trash')
    } else {
      notify('error', '', 'Something went wrong')
    }
    return res
  }

  const restoreCiphers = async (ids: string[]) => {
    const res = await cipherStore.restoreCiphers(ids)
    if (res.kind === 'ok') {
      notify('success', '', 'Restored')
    } else {
      notify('error', '', 'Something went wrong')
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
    type : 'error' | 'success' | 'warning' | 'info', 
    title : null | string, 
    text: null | string,
    duration?: undefined | number
  ) => {
    const options: IToastProps = {
      placement: 'top',
      status: type,
      duration,
      title: undefined,
      description: undefined
    }
    if (title) {
      options.title = (
        <Text
          preset="header"
          style={{ fontSize: 14, minWidth: 300 }}
        >
          {title}
        </Text>
      )
    }
    if (text) {
      options.description = (
        <Text
          style={{ fontSize: 12, minWidth: 300 }}
        >
          {text}
        </Text>
      )
    }
    toast.show(options)
  }

  // Random string
  const randomString = () => {
    return nanoid()
  }

  // Clipboard
  const copyToClipboard = (text: string) => {
    notify('success', undefined, 'Copied', 500)
    Clipboard.setString(text)
  }

  // Get website logo
  const getWebsiteLogo = (uri: string) => {
    const imgUri = `https://locker.io/logo/${uri.split('//')[1]}?size=40`
    return { uri: imgUri }
  }

  // Get team
  const getTeam = (teams: object[], orgId: string) => {
    return find(teams, e => e.id === orgId) || { name: '' }
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
    register,
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
    getRouteName
  }

  return (
    <MixinsContext.Provider value={data}>
      {props.children}
    </MixinsContext.Provider>
  )
}

export const useMixins = () => useContext(MixinsContext)
