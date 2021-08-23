import React, { useState } from 'react'
import { useToast } from 'native-base'
import { Text } from "../../components"
import { nanoid } from 'nanoid'
import find from 'lodash/find'
import { KdfType } from '../../../core/enums/kdfType'
import { useStores } from '../../models'
import { useCoreService } from '../core-service'
import { CardView, CipherView, IdentityView, LoginUriView, LoginView, SecureNoteView } from '../../../core/models/view'
import { CipherType, SecureNoteType } from '../../../core/enums'

const { createContext, useContext } = React

// Funtion params

type GetCiphersParams = {
  deleted: boolean,
  searchText: string,
  filters: Function[]
}

// Mixins data

const defaultData = {
  // Data
  selectedCipher: new CipherView(),

  // Methods
  sessionLogin: async (masterPassword : string) => { return { kind: 'unknown' } },
  logout: async () => {},
  lock: async () => {},
  getSyncData: async () => {},
  notify: (type : 'error' | 'success' | 'warning' | 'info', title : string, text: string) => {},
  randomString: () => '',
  newCipher: () => {},
  register: async (masterPassword: string, hint: string, passwordStrength: number) => { return { kind: 'unknown' } },
  getWebsiteLogo: (uri: string) => ({ uri: '' }),
  getTeam: (teams: object[], orgId: string) => ({ name: '' }),
  setSelectedCipher: (c: CipherView) => {},
  getCiphers: async (params: GetCiphersParams) => { return [] },
  getCollections: async () => { return [] },
  getFolders: async () => { return [] },
  getPasswordStrength: (password: string) => ({ score: 0 })
}


const MixinsContext = createContext(defaultData)

export const MixinsProvider = (props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
  const toast = useToast()
  const { user, cipherStore } = useStores()
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

  const [selectedCipher, setSelectedCipher] = useState(new CipherView())

  // -------------------- AUTHENTICATION --------------------

  // Session login
  const sessionLogin = async (masterPassword: string): Promise<{ kind: string }> => {
    try {
      await cryptoService.clearKeys()
      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000
      const key = await cryptoService.makeKey(masterPassword, user.email, kdf, kdfIterations)
      const hashedPassword = await cryptoService.hashPassword(masterPassword, key)

      // Session login
      const res = await user.sessionLogin({
        client_id: 'mobile',
        password: hashedPassword,
        device_name: platformUtilsService.getDeviceString(),
        device_type: platformUtilsService.getDevice(),
        device_identifier: await storageService.get('device_id') || randomString()
      })
      if (res.kind !== 'ok') {
        notify('error', 'Error', 'Session login failed')
        return { kind: 'bad-data' }
      }

      // Setup service
      messagingService.send('loggedIn')
      await tokenService.setTokens(res.data.access_token, res.data.refresh_token)
      await userService.setInformation(tokenService.getUserId(), user.email, kdf, kdfIterations)
      await cryptoService.setKey(key)
      await cryptoService.setKeyHash(hashedPassword)
      await cryptoService.setEncKey(res.data.key)
      await cryptoService.setEncPrivateKey(res.data.private_key)

      // Return value
      return { kind: 'ok' }
    } catch (e) {
      notify('error', 'Error', 'Session login failed')
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

  // Get ciphers
  const getCiphers = async (params: GetCiphersParams) => {
    // Filter
    const deletedFilter = (c : CipherView) => c.isDeleted === params.deleted
    const filters = [deletedFilter, ...params.filters]
    return await searchService.searchCiphers(params.searchText || '', filters, null) || []
  }

  // Get collections
  const getCollections = async () => {
    let res = await collectionService.getAllDecrypted() || []
    res = res.filter(item => item.id)
    return res
  }

  // Get folders
  const getFolders = async () => {
    return await folderService.getAllDecrypted() || []
  }

  // ------------------------ SUPPORT -------------------------

  const newCipher = () => {
    const cipher = new CipherView()
    cipher.organizationId = null
    cipher.type = CipherType.Login
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

  const getPasswordStrength = (password: string) => {
    return passwordGenerationService.passwordStrength(password, ['cystack']) || { score: 0 }
  }

  // Alert message
  const notify = (type : 'error' | 'success' | 'warning' | 'info', title : string, text: string) => {
    toast.show({
      title: (
        <Text
          preset="header"
          style={{ fontSize: 14 }}
        >
          {title}
        </Text>
      ),
      description: (
        <Text
          style={{ fontSize: 12 }}
        >
          {text}
        </Text>
      ),
      placement: 'top',
      status: type
    })
  }

  // Random string
  const randomString = () => {
    return nanoid()
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
    selectedCipher,
    sessionLogin,
    logout,
    lock,
    notify,
    randomString,
    getSyncData,
    newCipher,
    register,
    getWebsiteLogo,
    getTeam,
    setSelectedCipher,
    getCiphers,
    getCollections,
    getFolders,
    getPasswordStrength
  }

  return (
    <MixinsContext.Provider value={data}>
      {props.children}
    </MixinsContext.Provider>
  )
}

export const useMixins = () => useContext(MixinsContext)
