import React from 'react'
import { Alert } from "react-native"
import { nanoid } from 'nanoid'
import { KdfType } from '../../../core/enums/kdfType'
import { useStores } from '../../models'
import { useCoreService } from '../core-service'

const { createContext, useContext } = React

const defaultData = {
  sessionLogin: async (masterPassword : string) => { return false },
  logout: async () => {},
  lock: async () => {},
  getSyncData: async () => {},
  notify: (type : 'error' | 'success' | 'warning' | 'info', title : string, text: string) => {},
  randomString: () => ''
}


const MixinsContext = createContext(defaultData)

export const MixinsProvider = (props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
  const { user } = useStores()
  const { 
    cryptoService, 
    userService, 
    folderService, 
    cipherService,
    // searchService,
    collectionService,
    platformUtilsService,
    storageService,
    messagingService,
    tokenService,
    syncService
  } = useCoreService()

  // -------------------- AUTHENTICATION --------------------

  // Session login
  const sessionLogin = async (masterPassword : string) => {
    try {
      await cryptoService.clearKeys()
      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000
      const key = await cryptoService.makeKey(masterPassword, user.email, kdf, kdfIterations)
      const hashedPassword = await cryptoService.hashPassword(masterPassword, key)
      const res = await user.sessionLogin({
        client_id: 'mobile',
        password: hashedPassword,
        device_name: platformUtilsService.getDeviceString(),
        device_type: platformUtilsService.getDevice(),
        device_identifier: await storageService.get('device_id', undefined) || randomString()
      })
      messagingService.send('loggedIn')
      await tokenService.setTokens(res.data.access_token, res.data.refresh_token)
      await userService.setInformation(tokenService.getUserId(), user.email, kdf, kdfIterations)
      await cryptoService.setKey(key)
      await cryptoService.setKeyHash(hashedPassword)
      await cryptoService.setEncKey(res.data.key)
      await cryptoService.setEncPrivateKey(res.data.private_key)
      return true
    } catch (e) {
      notify('error', 'Error', 'Session login failed')
      return false
    }
  }

  // Logout
  const logout = async () => {
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
  }

  // ------------------------ DATA ---------------------------
  const getSyncData = async () => {
    try {
      messagingService.send('syncStarted')
      const res = await user.syncData()
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
      messagingService.send('syncCompleted', { successfully: false })
    }
  }

  // ------------------------ SUPPORT -------------------------

  // Alert message
  const notify = (type : 'error' | 'success' | 'warning' | 'info', title : string, text: string) => {
    Alert.alert(title, text)
  }

  // Random string
  const randomString = () => {
    return nanoid()
  }

  // -------------------- REGISTER FUNCTIONS ------------------
  const data = {
    sessionLogin,
    logout,
    lock,
    notify,
    randomString,
    getSyncData
  }

  return (
    <MixinsContext.Provider value={data}>
      {props.children}
    </MixinsContext.Provider>
  )
}

export const useMixins = () => useContext(MixinsContext)
