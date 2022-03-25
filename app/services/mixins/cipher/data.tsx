import { observer } from 'mobx-react-lite'
import React, { createContext, useContext } from 'react'
import { useMixins } from '..'
import { CipherRequest } from '../../../../core/models/request/cipherRequest'
import { FolderRequest } from '../../../../core/models/request/folderRequest'
import { CipherView, LoginUriView, LoginView } from '../../../../core/models/view'
import { FolderView } from '../../../../core/models/view/folderView'
import { useStores } from '../../../models'
import { useCoreService } from '../../core-service'
import { ImportCiphersRequest } from '../../../../core/models/request/importCiphersRequest'
import { KvpRequest } from '../../../../core/models/request/kvpRequest'
import { CipherType } from '../../../../core/enums'
import { AutofillDataType, loadShared, saveShared } from '../../../utils/keychain'
import { useCipherHelpersMixins } from './helpers'
import { MAX_MULTIPLE_SHARE_COUNT } from '../../../config/constants'
import { CollectionView } from '../../../../core/models/view/collectionView'
import { CollectionRequest } from '../../../../core/models/request/collectionRequest'
import { CipherData } from '../../../../core/models/data/cipherData'
import { FolderData } from '../../../../core/models/data/folderData'
import { Logger } from '../../../utils/logger'
import { Cipher, EncString, SymmetricCryptoKey } from '../../../../core/models/domain'
import { Utils } from '../../core-service/utils'
import { AccountRoleText } from '../../../config/types'
import { OrganizationData } from '../../../../core/models/data/organizationData'
import { ImportResult } from '../../../../core/models/domain/importResult'
import { SyncQueue } from '../../../utils/queue'
import { AppEventType, EventBus } from '../../../utils/event-bus'


type GetCiphersParams = {
  deleted: boolean,
  searchText: string,
  filters: Function[],
  includeExtensions?: boolean
}

const defaultData = {
  reloadCache: async () => {},
  startSyncProcess: async () => { return { kind: 'unknown' } },
  getSyncData: async () => { return { kind: 'unknown' } },
  syncOfflineData: async () => {},
  syncAutofillData: async () => {},

  getCiphers: async (params: GetCiphersParams) => { return [] },
  getCipherById: async (id: string) => new CipherView(),

  getCollections: async () => { return [] },
  loadOrganizations: async () => {},
  loadFolders: async () => {},
  loadCollections: async () => {},

  createCipher: async (cipher: CipherView, score: number, collectionIds: string[]) => { return { kind: 'unknown' } },
  updateCipher: async (id: string, cipher: CipherView, score: number, collectionIds: string[]) => { return { kind: 'unknown' } },
  toTrashCiphers: async (ids: string[]) => { return { kind: 'unknown' } },
  deleteCiphers: async (ids: string[]) => { return { kind: 'unknown' } },
  restoreCiphers: async (ids: string[]) => { return { kind: 'unknown' } },
  importCiphers: async (importResult: ImportResult) => { return { kind: 'unknown' } },

  shareCipher: async (cipher: CipherView, emails: string[], role: AccountRoleText, autofillOnly: boolean) => { return { kind: 'unknown' } },
  shareMultipleCiphers: async (ids: string[], emails: string[], role: AccountRoleText, autofillOnly: boolean) => { return { kind: 'unknown' } },
  confirmShareCipher: async (organizationId: string, memberId: string, publicKey: string) => { return { kind: 'unknown' } },
  stopShareCipher: async (cipher: CipherView, memberId: string) => { return { kind: 'unknown' } },
  editShareCipher: async (organizationId: string, memberId: string, role: AccountRoleText, onlyFill: boolean) => { return { kind: 'unknown' } },
  leaveShare: async (id: string, organizationId: string) => { return { kind: 'unknown' } },
  acceptShareInvitation: async (id: string) => { return { kind: 'unknown' } },
  rejectShareInvitation: async (id: string) => { return { kind: 'unknown' } },

  createFolder: async (folder: FolderView) => { return { kind: 'unknown' } },
  updateFolder: async (folder: FolderView) => { return { kind: 'unknown' } },
  deleteFolder: async (id: string) => { return { kind: 'unknown' } },

  createCollection: async (collection: CollectionView) => { return { kind: 'unknown' } },
  updateCollection: async (collection: CollectionView) => { return { kind: 'unknown' } },
  deleteCollection: async (id: string, teamId: string) => { return { kind: 'unknown' } },

  syncSingleCipher: async (id: string) => { return { kind: 'unknown' } },
  syncSingleFolder: async (id: string) => { return { kind: 'unknown' } },
  syncSingleOrganization: async (id: string) => { return { kind: 'unknown' } },
  syncProfile: async () => { return { kind: 'unknown' } },
}

export const CipherDataMixinsContext = createContext(defaultData)

export const CipherDataMixinsProvider = observer((props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
  const { cipherStore, folderStore, uiStore, collectionStore, user } = useStores()
  const { 
    userService, 
    cipherService, 
    folderService,
    storageService,
    collectionService,
    searchService,
    messagingService,
    syncService,
    cryptoService
  } = useCoreService()
  const { notify, translate, randomString, notifyApiError, getTeam } = useMixins()
  const { newCipher } = useCipherHelpersMixins()
  const syncQueue = SyncQueue

  // ----------------------------- METHODS ---------------------------

  // Reload offline cache
  const reloadCache = async (options?: {
    isOnline?: boolean
    notCipher?: boolean
  }) => {
    cipherStore.setLastCacheUpdate()
    if (!options?.notCipher) {
      await cipherService.clearCache()
    }
    folderService.clearCache()
    collectionService.clearCache()
    await Promise.all([
      loadFolders(),
      loadCollections(),
      loadOrganizations()
    ])
    if (cipherStore.selectedCipher && cipherStore.selectedCipher.name) {
      const updatedCipher = await getCipherById(cipherStore.selectedCipher.id)
      if (updatedCipher.id) {
        cipherStore.setSelectedCipher(updatedCipher)
      }
    }

    await _updateAutofillData()
    EventBus.emit(AppEventType.PASSWORD_UPDATE, null)
  }

  // Reload offline cache of a single cipher only
  const minimalReloadCache = async (payload: {
    cipher?: CipherView
    deletedIds?: string[]
  }) => {
    const { cipher, deletedIds } = payload
    if (cipher) {
      cipherService.csUpdateDecryptedCache([cipher])
    }
    if (deletedIds) {
      cipherService.csDeleteFromDecryptedCache(deletedIds)
    }

    await Promise.all([
      loadFolders(),
      loadCollections(),
      loadOrganizations()
    ])
    if (cipherStore.selectedCipher && cipherStore.selectedCipher.name) {
      const updatedCipher = await getCipherById(cipherStore.selectedCipher.id)
      if (updatedCipher.id) {
        cipherStore.setSelectedCipher(updatedCipher)
      }
    }
   
    _updateAutofillData()
    
    cipherStore.setLastCacheUpdate()
    if (cipher?.type === CipherType.Login || !!deletedIds) {
      EventBus.emit(AppEventType.PASSWORD_UPDATE, null)
    }
  }

  // Sync
  const getSyncData = () => {
    syncQueue.clear()
    return syncQueue.add(async () => {
      try {
        if (cipherStore.isSynching) {
          return { kind: 'synching' }
        }
  
        cipherStore.setIsSynching(true)
        messagingService.send('syncStarted')
  
        // Sync api
        const res = await cipherStore.syncData()
        if (res.kind !== 'ok') {
          notifyApiError(res)
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
        
        cipherStore.setLastSync()
        messagingService.send('syncCompleted', { successfully: true })
  
        // Clear not updated list
        cipherStore.clearNotUpdate()
        folderStore.clearNotUpdate()
        collectionStore.clearNotUpdate()
  
        // Save fingerprint
        const fingerprint = await cryptoService.getFingerprint(userId)
        user.setFingerprint(fingerprint.join('-'))
  
        // Save to shared keychain for autofill service
        
        await _updateAutofillData()
        
        return { kind: 'ok' }
      } catch (e) {
        Logger.error(e)
        messagingService.send('syncCompleted', { successfully: false })
        return { kind: 'error' }
      } finally {
        cipherStore.setIsSynching(false)
      }
    })
  }

  // Sync gradually
  const startSyncProcess = () => {
    syncQueue.clear()
    return syncQueue.add(async () => {
      try {
        const pageSize = 50
        let page = 1
        let cipherIds: string[] = []
  
        if (cipherStore.isSynching) {
          return { kind: 'synching' }
        }
  
        cipherStore.setIsSynching(true)
  
        // Sync api
        let res = await cipherStore.syncData(page, pageSize)
        if (res.kind !== 'ok') {
          notifyApiError(res)
          return res
        }
  
        // Sync service with data from first page
        const userId = await userService.getUserId()
  
        await syncService.syncProfile(res.data.profile)
        await syncService.syncFolders(userId, res.data.folders)
        await syncService.syncCollections(res.data.collections)
        await syncService.syncSomeCiphers(userId, res.data.ciphers)
        await syncService.syncSends(userId, res.data.sends)
        await syncService.syncSettings(userId, res.data.domains)
        await syncService.syncPolicies(res.data.policies)
  
        cipherIds = res.data.ciphers.map(c => c.id)
  
        // Load all loaded data
        loadOrganizations()
        cipherStore.setLastCacheUpdate()
  
        // Sync other ciphers
        const totalCipherCount = res.data.count.ciphers
        while (page * pageSize < totalCipherCount) {
          page += 1
          res = await cipherStore.syncData(page, pageSize)
          if (res.kind !== 'ok') {
            notifyApiError(res)
            return res
          }
          await syncService.syncSomeCiphers(userId, res.data.ciphers)
          cipherIds = [...cipherIds, ...res.data.ciphers.map(c => c.id)]
          cipherStore.setLastCacheUpdate()
        }
  
        // Clear deleted ciphers
        const deletedIds: string[] = []
        const storageRes: { [id: string]: any } = await storageService.get(`ciphers_${userId}`)
        for (let id in { ...storageRes }) {
          if (!cipherIds.includes(id)) {
            delete storageRes[id]
            deletedIds.push(id)
          }
        }
        await storageService.save(`ciphers_${userId}`, storageRes)
        await cipherService.csDeleteFromDecryptedCache(deletedIds)
  
        // Set last sync
        cipherStore.setLastSync()
        await syncService.setLastSync(new Date())
        loadFolders()
        loadCollections()
  
        // Clear not updated list
        cipherStore.clearNotUpdate()
        folderStore.clearNotUpdate()
        collectionStore.clearNotUpdate()
  
        // Save fingerprint
        const fingerprint = await cryptoService.getFingerprint(userId)
        user.setFingerprint(fingerprint.join('-'))
  
      
        await _updateAutofillData()
        return { kind: 'ok' }
      } catch (e) {
        Logger.error(e)
        return { kind: 'error' }
      } finally {
        cipherStore.setIsSynching(false)
      }
    })
  }

  // Sync offline data
  const syncOfflineData = async () => {
    // Prevent duplicate sync
    if (cipherStore.isSynchingOffline) {
      return
    }
    cipherStore.setIsSynchingOffline(true)

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
    cipherStore.setIsSynchingOffline(false)
  }



  // Store password for autofill
  const _updateAutofillData = async () => {
    
    const hashPasswordAutofill = await cryptoService.getAutofillKeyHash()

    const passwordRes = await getCiphers({
      filters: [
        (c : CipherView) => c.type === CipherType.Login && c.login.username && c.login.password
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

    const sharedData: AutofillDataType = {
      passwords: passwordData,
      deleted: [],
      authen: { email: user.email, hashPass: hashPasswordAutofill, avatar: user.avatar },
      faceIdEnabled: user.isBiometricUnlock
    }
    await saveShared('autofill', JSON.stringify(sharedData))
  }

  // Sync autofill data
  const syncAutofillData = async () => {
    try {
   

      // Prevent duplicate sync
      if (cipherStore.isSynchingAutofill) {
        return
      }
      cipherStore.setIsSynchingAutofill(true)

      const credentials = await loadShared()
      if (!credentials || !credentials.password) {
        const sharedData: AutofillDataType = {
          passwords: [],
          deleted: [],
          authen: null,
          faceIdEnabled: false
        }
        await saveShared('autofill', JSON.stringify(sharedData))
        return
      }

      let hasUpdate = false
      const sharedData: AutofillDataType = JSON.parse(credentials.password)

      // Delete passwords
      if (sharedData.deleted) {
        await _offlineDeleteCiphers(sharedData.deleted.map(c => c.id))
        hasUpdate = true
      }

      // Create passwords
      if (sharedData.passwords) {
        for (let cipher of sharedData.passwords) {
          if (!cipher.id) {
            const payload = newCipher(CipherType.Login)
            const data = new LoginView()
            data.username = cipher.username
            data.password = cipher.password
            if (cipher.uri) {
              const uriView = new LoginUriView()
              uriView.uri = cipher.uri
              data.uris = [uriView]
            }
            payload.name = cipher.name
            payload.login = data
            await _offlineCreateCipher({
              cipher: payload, 
              collectionIds: []
            })
            hasUpdate = true
          }
        }
      }

      await _updateAutofillData()

      if (hasUpdate && !uiStore.isOffline) {
        await syncOfflineData()
      }
    } catch (e) {
      Logger.error(e)
    } finally {
      cipherStore.setIsSynchingAutofill(false)
    }
  }

  // Load organizations
  const loadOrganizations = async () => {
    try {
      const res = await userService.getAllOrganizations() || []
      cipherStore.setOrganizations(res)
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
    }
  }

  // Load folders
  const loadFolders = async () => {
    try {
      const res = await folderService.getAllDecrypted() || []
      for (let f of res) {
        const ciphers = await getEncryptedCiphers({
          deleted: false,
          searchText: '',
          filters: [(c: CipherView) => c.folderId ? c.folderId === f.id : (!f.id && (!c.organizationId || !getTeam(user.teams, c.organizationId).name))]
        })
        f.cipherCount = ciphers ? ciphers.length : 0
      }
      folderStore.setFolders(res)
      folderStore.setLastUpdate()
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
    }
  }

  // Load collections
  const loadCollections = async () => {
    try {
      const res = await collectionService.getAllDecrypted() || []
      for (let f of res) {
        const ciphers = await getEncryptedCiphers({
          deleted: false,
          searchText: '',
          filters: [c => c.collectionIds.includes(f.id)]
        })
        f.cipherCount = ciphers ? ciphers.length : 0
      }

      // Add unassigned
      let unassignedTeamCiphers = await getEncryptedCiphers({
        deleted: false,
        searchText: '',
        filters: [(c : CipherView) => !c.collectionIds.length && !!getTeam(user.teams, c.organizationId).name]
      })
      unassignedTeamCiphers.forEach((item: CipherView) => {
        const target = res.find(f => f.id === null && f.organizationId === item.organizationId)
        if (target) {
          target.cipherCount += 1
        } else {
          // @ts-ignore
          res.push({
            cipherCount: 1,
            hidePasswords: null,
            id: null,
            name: '',
            organizationId: item.organizationId
          })
        }
      })

      collectionStore.setCollections(res)
      collectionStore.setLastUpdate()
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
    }
  }

  // Get encrypted ciphers
  const getEncryptedCiphers = async (params: GetCiphersParams) => {
    try {
      const deletedFilter = (c : Cipher) => !!c.deletedDate === params.deleted
      const filters = [deletedFilter, ...params.filters]
      if (!params.includeExtensions) {
        filters.unshift((c: Cipher) => c.type !== CipherType.TOTP)
      }
      return await searchService.searchEncryptedCiphers(filters, null) || []
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return []
    }
  }

  // Get ciphers
  const getCiphers = async (params: GetCiphersParams) => {
    try {
      const deletedFilter = (c : CipherView) => c.isDeleted === params.deleted
      const filters = [deletedFilter, ...params.filters]
      if (!params.includeExtensions) {
        filters.unshift((c : CipherView) => ![CipherType.TOTP].includes(c.type))
      }
      return await searchService.searchCiphers(params.searchText || '', filters, null) || []
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return []
    }
  }

  // Get cipher by id
  const getCipherById = async (id: string) => {
    const ciphers = await getCiphers({
      deleted: false,
      searchText: '',
      filters: [c => c.id === id]
    })
    return ciphers[0] || new CipherView()
  }

  // Get collections
  const getCollections = async () => {
    try {
      let res = await collectionService.getAllDecrypted() || []
      res = res.filter(item => item.id)
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return []
    }
  }

  // Import
  const importCiphers = async (importResult: ImportResult) => {
    // Offline
    if (uiStore.isOffline) {
      await _offlineImportCiphers({ importResult })
      notify('success', translate('import.success') + ' ' + translate('success.will_sync_when_online'))
      return { kind: 'ok' }
    }

    // Online
    const request = new ImportCiphersRequest()
    for (let i = 0; i < importResult.ciphers.length; i++) {
      const cipher = importResult.ciphers[i]
      const countDuplicate = await _countDuplicateCipherName(cipher)
      if (countDuplicate > 0) {
        cipher.name = `${cipher.name} (${countDuplicate})`
      }
      const enc = await cipherService.encrypt(cipher)
      request.ciphers.push(new CipherRequest(enc))
    }
    if (importResult.folders != null) {
      for (let i = 0; i < importResult.folders.length; i++) {
        const folder = importResult.folders[i]
        const countDuplicate = _countDuplicateFolderName(folder)
        if (countDuplicate > 0) {
          folder.name = `${folder.name} (${countDuplicate})`
        }
        const enc = await folderService.encrypt(folder)
        request.folders.push(new FolderRequest(enc))
      }
    }
    if (importResult.folderRelationships != null) {
      importResult.folderRelationships.forEach(r =>
        request.folderRelationships.push(new KvpRequest(r[0], r[1])))
    }
    const res = await cipherStore.importCipher(request)
    if (res.kind === 'ok') {
      await _offlineImportCiphers({
        importResult,
        isCaching: true,
        cipherRequests: request.ciphers,
        folderRequests: request.folders
      })
      notify('success', translate('import.success'))
      return res
    } else {
      notifyApiError(res)
      return res
    }
  }

  const _offlineImportCiphers = async (payload: {
    importResult: ImportResult
    isCaching?: boolean
    cipherRequests?: (CipherRequest & { id?: string })[]
    folderRequests?: (FolderRequest & { id?: string })[]
  }) => {
    const { importResult, isCaching, cipherRequests, folderRequests } = payload

    const ciphers = cipherRequests || []
    const folders = folderRequests || []

    // Prepare ciphers
    if (!cipherRequests) {
      for (let i = 0; i < importResult.ciphers.length; i++) {
        const cipher = importResult.ciphers[i]
        const countDuplicate = await _countDuplicateCipherName(cipher)
        if (countDuplicate > 0) {
          cipher.name = `${cipher.name} (${countDuplicate})`
        }
        const enc = await cipherService.encrypt(cipher)
        const cr = new CipherRequest(enc)
        const tempId = 'tmp__' + randomString()
        // @ts-ignore
        cr.id = tempId
        ciphers.push(cr)
      }
    }
    
    // Prepare folders
    if (!folderRequests) {
      if (importResult.folders != null) {
        for (let i = 0; i < importResult.folders.length; i++) {
          const folder = importResult.folders[i]
          const countDuplicate = _countDuplicateFolderName(folder)
          if (countDuplicate > 0) {
            folder.name = `${folder.name} (${countDuplicate})`
          }
          const enc = await folderService.encrypt(folder)
          const fr = new FolderRequest(enc)
          const tempId = 'tmp__' + randomString()
          // @ts-ignore
          fr.id = tempId
          folders.push(fr)
        }
      }
    }

    // Prepare relationships
    if (importResult.folderRelationships != null) {
      importResult.folderRelationships.forEach(r => {
        ciphers[r[0]].folderId = folders[r[1]].id
      })
    }

    // Update cipher storage
    const userId = await userService.getUserId()
    if (ciphers.length) {
      const key = `ciphers_${userId}`
      const res = await storageService.get(key) || {}
      ciphers.forEach(c => {
        if (!isCaching) {
          cipherStore.addNotSync(c.id)
        } else {
          cipherStore.addNotUpdate(c.id)
        }
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
      const res = await storageService.get(key) || {}
      ciphers.forEach(f => {
        if (!isCaching) {
          folderStore.addNotSync(f.id)
        } else {
          folderStore.addNotUpdate(f.id)
        }
        res[f.id] = {
          ...f,
          userId
        }
      })
      await storageService.save(key, res)
    }

    await reloadCache()
    return { kind: 'ok' }
  }

  // Check cipher name duplication
  const _countDuplicateCipherName = async (cipher: CipherView) => {
    const ciphers = await getCiphers({
      deleted: false,
      searchText: cipher.name,
      filters: [(c: CipherView) => c.type === cipher.type && c.name.startsWith(cipher.name)]
    })
    let count = 1
    let name = cipher.name
    while (ciphers.some((c: CipherView) => c.name === name)) {
      name = `${cipher.name} (${count})`
      count += 1
    }
    return count - 1
  }

  // Check folder name duplication
  const _countDuplicateFolderName = (folder: FolderView) => {
    let count = 1
    let name = folder.name
    while (folderStore.folders.some((f: FolderView) => f.name === name)) {
      name = `${folder.name} (${count})`
      count += 1
    }
    return count - 1
  }

  // ----------------------- CIPHER ---------------------------

  // Create
  const createCipher = async (cipher: CipherView, score: number, collectionIds: string[]) => {
    try {
      // Check name duplication
      const countDuplicate = await _countDuplicateCipherName(cipher)
      if (countDuplicate > 0) {
        notify('error', translate('error.duplicate_cipher_name'))
        return { kind: 'bad-data' }
      }

      // Offline
      if (uiStore.isOffline) {
        await _offlineCreateCipher({ cipher, collectionIds })
        notify('success', `${translate('success.cipher_created')} ${translate('success.will_sync_when_online')}`)
        return { kind: 'ok' }
      } 

      // Online
      const cipherEnc = await cipherService.encrypt(cipher)
      const data = new CipherRequest(cipherEnc)
      const res = await cipherStore.createCipher(data, score, collectionIds)
      if (res.kind === 'ok') {
        await _offlineCreateCipher({ 
          cipher, 
          collectionIds, 
          isCaching: true,
          cipherRequest: data
        }) 
        notify('success', translate('success.cipher_created'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Offline create
  const _offlineCreateCipher = async (payload: {
    cipher: CipherView
    collectionIds: string[]
    isCaching?: boolean
    cipherRequest?: CipherRequest
  }) => {
    const { cipher, collectionIds, isCaching, cipherRequest } = payload
    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key) || {}

    const cipherEnc = await cipherService.encrypt(cipher)
    const data = cipherRequest || new CipherRequest(cipherEnc)
    const tempId = 'tmp__' + randomString()

    res[tempId] = {
      ...data,
      userId,
      id: tempId,
      collectionIds
    }
    await storageService.save(key, res)
    if (!isCaching) {
      cipherStore.addNotSync(tempId)
    } else {
      cipherStore.addNotUpdate(tempId)
    }

    // Update cache
    cipher.id = tempId
    await minimalReloadCache({ cipher })
  }

  // Update
  const updateCipher = async (id: string, cipher: CipherView, score: number, collectionIds: string[]) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineUpdateCipher({ cipher, collectionIds })
        notify('success', `${translate('success.cipher_updated')} ${translate('success.will_sync_when_online')}`)
        return { kind: 'ok' }
      } 

      // Online
      const cipherEnc = await cipherService.encrypt(cipher)
      const data = new CipherRequest(cipherEnc)
      const res = await cipherStore.updateCipher(id, data, score, collectionIds)
      if (res.kind === 'ok') {
        await _offlineUpdateCipher({
          cipher, 
          collectionIds,
          isCaching: true,
          cipherRequest: data
        })
        notify('success', translate('success.cipher_updated'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Offline update
  const _offlineUpdateCipher = async (payload: {
    cipher: CipherView
    collectionIds: string[]
    isCaching?: boolean
    cipherRequest?: CipherRequest
  }) => {
    const { cipher, collectionIds, isCaching, cipherRequest } = payload

    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key) || {}

    const cipherEnc = await cipherService.encrypt(cipher)
    const data = cipherRequest || new CipherRequest(cipherEnc)
    const revisionDate = new Date()
    
    res[cipher.id] = {
      ...res[cipher.id],
      ...data,
      collectionIds,
      revisionDate: revisionDate.toISOString()
    }
    await storageService.save(key, res)
    if (!isCaching) {
      cipherStore.addNotSync(cipher.id)
    } else {
      cipherStore.addNotUpdate(cipher.id)
    }

    // Update cache
    cipher.collectionIds = collectionIds
    cipher.revisionDate = revisionDate
    await minimalReloadCache({ cipher })
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
        await _offlineDeleteCiphers(ids, true)
        notify('success', translate('success.cipher_deleted'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Offline delete
  const _offlineDeleteCiphers = async (ids: string[], isCaching?: boolean) => {
    await cipherService.delete(ids)
    ids.forEach(id => {
      if (!isCaching) {
        cipherStore.removeNotSync(id)
      } else {
        cipherStore.removeNotUpdate(id)
      }
    })
    minimalReloadCache({})
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
        await _offlineToTrashCiphers(ids, true)
        notify('success', translate('success.cipher_trashed'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Offline to trash
  const _offlineToTrashCiphers = async (ids: string[], isCaching?: boolean) => {
    await cipherService.softDelete(ids)
    ids.forEach(id => {
      if (!isCaching) {
        cipherStore.addNotSync(id)
      } else {
        cipherStore.addNotUpdate(id)
      }
    })
    await minimalReloadCache({})
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
        await _offlineRestoreCiphers(ids, true)
        notify('success', translate('success.cipher_restored'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Offline restore
  const _offlineRestoreCiphers = async (ids: string[], isCaching?: boolean) => {
    await cipherService.restore(ids.map(id => ({
      id,
      revisionDate: new Date().toISOString()
    })))

    ids.forEach(id => {
      if (!isCaching) {
        cipherStore.addNotSync(id)
      } else {
        cipherStore.addNotUpdate(id)
      }
    })
    await minimalReloadCache({})
  }

  // Share cipher
  const shareCipher = async (cipher: CipherView, emails: string[], role: AccountRoleText, autofillOnly: boolean) => {
    try {
      // Prepare org key
      let orgKey: SymmetricCryptoKey = null
      let shareKey: [EncString, SymmetricCryptoKey] = null
      if (cipher.organizationId) {
        orgKey = await cryptoService.getOrgKey(cipher.organizationId)
      } else {
        shareKey = await cryptoService.makeShareKey()
        orgKey = shareKey[1]
      }

      // Prepare cipher
      const cipherEnc = await cipherService.encrypt(cipher, orgKey)
      const data = new CipherRequest(cipherEnc)

      // Get public keys
      const members = await Promise.all(emails.map(async (email) => {
        const publicKeyRes = await cipherStore.getSharingPublicKey(email)
        let publicKey = ''
        if (publicKeyRes.kind === 'ok') {
          publicKey = publicKeyRes.data.public_key
        }
        return {
          username: email,
          role,
          hide_passwords: autofillOnly,
          key: publicKey ? await _generateMemberKey(publicKey, orgKey) : null
        }
      }))

      // Send API
      const res = await cipherStore.shareCipher({
        members,
        cipher: {
          id: cipher.id,
          ...data
        },
        sharing_key: shareKey ? shareKey[0].encryptedString : null
      })
      if (res.kind === 'ok') {
        notify('success', translate('success.cipher_shared'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  const _generateMemberKey = async (publicKey: string, orgKey: SymmetricCryptoKey) => {
    const pk = Utils.fromB64ToArray(publicKey)
    const key = await cryptoService.rsaEncrypt(orgKey.key, pk.buffer)
    return key.encryptedString
  }

  // Share multiple ciphers
  const shareMultipleCiphers = async (ids: string[], emails: string[], role: AccountRoleText, autofillOnly: boolean) => {
    const ciphers = await getCiphers({
      deleted: false,
      searchText: '',
      filters: [(c: CipherView) => ids.includes(c.id)]
    }) || []
    if (!ciphers.length || ciphers.length > MAX_MULTIPLE_SHARE_COUNT) {
      return { kind: 'ok' }
    }

    try {
      const sharedCiphers: {
        cipher: CipherRequest & { id: string }
        members: {
          username: string
          role: AccountRoleText
          key: string
          hide_passwords: boolean
        }[]
      }[] = []

      // Prepare org key
      const shareKey: [EncString, SymmetricCryptoKey] = await cryptoService.makeShareKey()
      const orgKey: SymmetricCryptoKey = shareKey[1]

      // Get public keys
      const members = await Promise.all(emails.map(async (email) => {
        const publicKeyRes = await cipherStore.getSharingPublicKey(email)
        let publicKey = ''
        if (publicKeyRes.kind === 'ok') {
          publicKey = publicKeyRes.data.public_key
        }
        return {
          email,
          publicKey,
          username: email,
          role,
          hide_passwords: autofillOnly,
          key: publicKey ? await _generateMemberKey(publicKey, orgKey) : null
        }
      }))

      // Prepare cipher
      const prepareCipher = async (c: CipherView) => {
        let _orgKey = orgKey
        if (c.organizationId) {
          _orgKey = await cryptoService.getOrgKey(c.organizationId)
        }
        const cipherEnc = await cipherService.encrypt(c, _orgKey)
        const data = new CipherRequest(cipherEnc)
        const mem = await Promise.all(members.map(async (m) => {
          return {
            username: m.email,
            role,
            hide_passwords: autofillOnly,
            key: m.publicKey ? await _generateMemberKey(m.publicKey, _orgKey) : null
          }
        }))
        sharedCiphers.push({
          cipher: {
            id: c.id,
            ...data
          },
          members: mem
        })
      }

      await Promise.all(ciphers.map(prepareCipher))

      // Send API
      const res = await cipherStore.shareMultipleCiphers({
        ciphers: sharedCiphers,
        sharing_key: shareKey ? shareKey[0].encryptedString : null
      })
      if (res.kind === 'ok') {
        notify('success', translate('success.cipher_shared'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Confirm share cipher
  const confirmShareCipher = async (organizationId: string, memberId: string, publicKey: string) => {
    try {
      const key = await _generateOrgKey(organizationId, publicKey)
      const res = await cipherStore.confirmShareCipher(organizationId, memberId, { key })
      if (res.kind === 'ok') {
        notify('success', translate('success.done'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  const _generateOrgKey = async (organizationId: string, publicKey: string) => {
    const pk = Utils.fromB64ToArray(publicKey)
    const orgKey = await cryptoService.getOrgKey(organizationId)
    const key = await cryptoService.rsaEncrypt(orgKey.key, pk.buffer)
    return key.encryptedString
  }

  // Stop share cipher
  const stopShareCipher = async (cipher: CipherView, memberId: string) => {
    try {
      // Prepare cipher
      const cipherEnc = await cipherService.encrypt(cipher)
      const data = new CipherRequest(cipherEnc)

      // Send API
      const res = await cipherStore.stopShareCipher(cipher.organizationId, memberId, {
        cipher: {
          id: cipher.id,
          ...data
        }
      })
      if (res.kind === 'ok') {
        notify('success', translate('success.done'))

        // Remove member in local my share first
        const myShares = [...cipherStore.myShares]
        for (let share of myShares) {
          if (share.id === cipher.organizationId) {
            share.members = share.members.filter(m => m.id !== memberId)
          }
        }
        cipherStore.setMyShares(myShares)
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Edit share cipher
  const editShareCipher = async (organizationId: string, memberId: string, role: AccountRoleText, onlyFill: boolean) => {
    try {
      // Send API
      const res = await cipherStore.editShareCipher(organizationId, memberId, {
        role,
        hide_passwords: onlyFill
      })
      if (res.kind === 'ok') {
        notify('success', translate('success.done'))

        // Update member in local my share first
        const myShares = [...cipherStore.myShares]
        for (let share of myShares) {
          if (share.id === organizationId) {
            for (let member of share.members) {
              if (member.id === memberId) {
                member.role = role
                member.hide_passwords = onlyFill
              }
            }
          }
        }
        cipherStore.setMyShares(myShares)
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Leave share
  const leaveShare = async (id: string, organizationId: string) => {
    const apiRes = await cipherStore.leaveShare(organizationId)
    if (apiRes.kind !== 'ok') {
      notifyApiError(apiRes)
      return apiRes
    }
    await cipherService.delete(id)
    await minimalReloadCache({})
    cipherStore.setOrganizations(cipherStore.organizations.filter(o => o.id !== organizationId))
    return apiRes
  }

  // Accept share invitation
  const acceptShareInvitation = async (id: string) => {
    const res = await cipherStore.respondShare(id, true)
    if (res.kind === 'ok') {
      notify('success', translate('success.done'))
      cipherStore.setSharingInvitations(cipherStore.sharingInvitations.filter(i => i.id !== id))
    } else {
      notifyApiError(res)
    }
    return res
  }

  // Reject share invitation
  const rejectShareInvitation = async (id: string) => {
    const res = await cipherStore.respondShare(id, false)
    if (res.kind === 'ok') {
      notify('success', translate('success.done'))
      cipherStore.setSharingInvitations(cipherStore.sharingInvitations.filter(i => i.id !== id))
    } else {
      notifyApiError(res)
    }
    return res
  }

  // ----------------------- FOLDER ---------------------------

  // Create folder
  const createFolder = async (folder: FolderView) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineCreateFolder({ folder })
        notify('success', `${translate('folder.folder_created')} ${translate('success.will_sync_when_online')}`)
        return { kind: 'ok' }
      } 

      // Online
      const folderEnc = await folderService.encrypt(folder)
      const payload = new FolderRequest(folderEnc)
      const res = await folderStore.createFolder(payload)
      if (res.kind === 'ok') {
        await _offlineCreateFolder({
          folder,
          isCaching: true,
          folderRequest: payload
        }) 
        notify('success', translate('folder.folder_created'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Offline create folder
  const _offlineCreateFolder = async (payload: {
    folder: FolderView
    isCaching?: boolean
    folderRequest?: FolderRequest
  }) => {
    const { folder, isCaching, folderRequest } = payload

    const userId = await userService.getUserId()
    const key = `folders_${userId}`
    const res = await storageService.get(key) || {}

    const folderEnc = await folderService.encrypt(folder)
    const data = folderRequest || new FolderRequest(folderEnc)
    const tempId = 'tmp__' + randomString()

    res[tempId] = {
      ...data,
      userId,
      id: tempId
    }
    await storageService.save(key, res)
    if (!isCaching) {
      folderStore.addNotSync(tempId)
    } else {
      folderStore.addNotUpdate(tempId)
    }
    await reloadCache({ notCipher: true })
  }

  // Update folder
  const updateFolder = async (folder: FolderView) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineUpdateFolder({ folder })
        notify('success', `${translate('folder.folder_updated')} ${translate('success.will_sync_when_online')}`)
        return { kind: 'ok' }
      } 

      // Online
      const folderEnc = await folderService.encrypt(folder)
      const payload = new FolderRequest(folderEnc)
      const res = await folderStore.updateFolder(folder.id, payload)
      if (res.kind === 'ok') {
        await _offlineUpdateFolder({
          folder,
          isCaching: true,
          folderRequest: payload
        }) 
        notify('success', translate('folder.folder_updated'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Offline update folder
  const _offlineUpdateFolder = async (payload: {
    folder: FolderView
    isCaching?: boolean
    folderRequest?: FolderRequest
  }) => {
    const { folder, isCaching, folderRequest } = payload

    const userId = await userService.getUserId()
    const key = `folders_${userId}`
    const res = await storageService.get(key) || {}

    const folderEnc = await folderService.encrypt(folder)
    const data = folderRequest || new FolderRequest(folderEnc)

    res[folder.id] = {
      ...res[folder.id],
      ...data
    }
    await storageService.save(key, res)
    if (!isCaching) {
      folderStore.addNotSync(folder.id)
    } else {
      folderStore.addNotUpdate(folder.id)
    }
    await reloadCache({ notCipher: true })
  }

  // Delete folder
  const deleteFolder = async (id: string) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineDeleteFolder(id)
        notify('success', translate('folder.folder_deleted'))
        return { kind: 'ok' }
      } 

      // Online
      const res = await folderStore.deleteFolder(id)
      if (res.kind === 'ok') {
        await _offlineDeleteFolder(id, true) 
        notify('success', translate('folder.folder_deleted'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Offline delete folder
  const _offlineDeleteFolder = async (id: string, isCaching?: boolean) => {
    const userId = await userService.getUserId()
    const key = `folders_${userId}`
    const res = await storageService.get(key) || {}

    delete res[id]
    if (!isCaching) {
      folderStore.removeNotSync(id)
    } else {
      folderStore.removeNotUpdate(id)
    }
    await storageService.save(key, res)
    await reloadCache()
  }

  // ----------------------- COLLECTION ---------------------------

  // Create collection
  const createCollection = async (collection: CollectionView) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        // await _offlineCreateCollection(collection)
        // notify('success', `${translate('folder.folder_created')} ${translate('success.will_sync_when_online')}`)
        // return { kind: 'ok' }
        return { kind: 'unknown' }
      }

      // Online
      const collectionEnc = await collectionService.encrypt(collection)
      const payload = new CollectionRequest(collectionEnc)
      const res = await collectionStore.createCollection(collection.organizationId, payload)

      if (res.kind === 'ok') {
        await _offlineCreateCollection({
          collection,
          isCaching: true,
          collectionRequest: payload
        }) 
        notify('success', translate('folder.folder_created'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Offline create collection
  const _offlineCreateCollection = async (payload: {
    collection: CollectionView
    isCaching?: boolean
    collectionRequest?: CollectionRequest
  }) => {
    const { collection, isCaching, collectionRequest } = payload

    const userId = await userService.getUserId()
    const key = `collections_${userId}`
    const res = await storageService.get(key) || {}

    const collectionEnc = await collectionService.encrypt(collection)
    const data = collectionRequest || new CollectionRequest(collectionEnc)
    const tempId = 'tmp__' + randomString()

    res[tempId] = {
      ...data,
      userId,
      id: tempId
    }
    await storageService.save(key, res)
    if (!isCaching) {
      collectionStore.addNotSync(tempId)
    } else {
      collectionStore.addNotUpdate(tempId)
    }
    await reloadCache({ notCipher: true })
  }

  // Update collection
  const updateCollection = async (collection: CollectionView) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        // await _offlineUpdateCollection(collection)
        // notify('success', `${translate('folder.folder_updated')} ${translate('success.will_sync_when_online')}`)
        // return { kind: 'ok' }
        return { kind: 'unknown' }
      }

      // Online
      const collectionEnc = await collectionService.encrypt(collection)
      const payload = new CollectionRequest(collectionEnc)
      const res = await collectionStore.updateCollection(collection.id, collection.organizationId, payload)

      if (res.kind === 'ok') {
        await _offlineUpdateCollection({
          collection,
          isCaching: true,
          collectionRequest: payload
        }) 
        notify('success', translate('folder.folder_updated'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Offline Update collection
  const _offlineUpdateCollection = async (payload: {
    collection: CollectionView
    isCaching?: boolean
    collectionRequest?: CollectionRequest
  }) => {
    const { collection, isCaching, collectionRequest } = payload

    const userId = await userService.getUserId()
    const key = `collections_${userId}`
    const res = await storageService.get(key) || {}

    const collectionEnc = await collectionService.encrypt(collection)
    const data = collectionRequest || new CollectionRequest(collectionEnc)

    res[collection.id] = {
      ...res[collection.id],
      ...data
    }
    await storageService.save(key, res)
    if (!isCaching) {
      collectionStore.addNotSync(collection.id)
    } else {
      collectionStore.addNotUpdate(collection.id)
    }
    await reloadCache({ notCipher: true })
  }

  // Delete collection
  const deleteCollection = async (id: string, teamId: string) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineDeleteCollection(id)
        notify('success', translate('folder.folder_deleted'))
        return { kind: 'ok' }
      } 

      // Online
      const res = await collectionStore.deleteCollection(id, teamId)
      if (res.kind === 'ok') {
        await _offlineDeleteCollection(id, true) 
        notify('success', translate('folder.folder_deleted'))
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notify('error', translate('error.something_went_wrong'))
      Logger.error(e)
      return { kind: 'unknown' }
    }
  }

  // Offline delete collection
  const _offlineDeleteCollection = async (id: string, isCaching?: boolean) => {
    const userId = await userService.getUserId()
    const key = `collections_${userId}`
    const res = await storageService.get(key) || {}

    delete res[id]
    if (!isCaching) {
      collectionStore.removeNotSync(id)
    } else {
      collectionStore.removeNotUpdate(id)
    }
    await storageService.save(key, res)
    await reloadCache()
  }

  // --------------------------- MINIMAL SYNC --------------------------------

  // Sync single cipher
  const syncSingleCipher = async (id: string) => {
    const cipherRes = await cipherStore.getCipher(id)

    // Error/Deleted
    if (cipherRes.kind !== 'ok') {
      if (cipherRes.kind === 'not-found' || cipherRes.kind === 'forbidden') {
        await _offlineDeleteCiphers([id], true)
        cipherStore.setLastSync()
      } else {
        notifyApiError(cipherRes)
        return cipherRes
      }
      return cipherRes
    }

    // Create/Update
    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key) || {}

    const cipher = cipherRes.data
    const cipherData = new CipherData(cipher, userId, cipher.collectionIds)

    // Update cipher
    res[cipher.id] = {
      ...cipherData
    }
    cipherStore.removeNotUpdate(cipher.id)

    // Remove temporary cipher
    for (const _id of Object.keys(res)) {
      if (_id.startsWith('tmp__') && res[_id].name === cipher.name && res[_id].type === cipher.type ) {
        delete res[_id]
        cipherStore.removeNotUpdate(_id)
        cipherService.csDeleteFromDecryptedCache([_id])
        break
      }
    }

    // Sync profile
    if (!!cipher.organizationId) {
      // await syncSingleOrganization(cipher.organizationId)
      await syncProfile()
    }

    await storageService.save(key, res)
    
    // Decrypt and minimal reload cache
    cipherStore.setLastSync()
    const c = new Cipher(cipherData, false)
    const hasKey = await cryptoService.hasKey()
    if (hasKey) {
      await minimalReloadCache({
        cipher: await c.decrypt()
      })
    } else {
      await reloadCache()
    }
    return cipherRes
  }

  // Sync single folder
  const syncSingleFolder = async (id: string) => {
    const folderRes = await folderStore.getFolder(id)

    // Error/Deleted
    if (folderRes.kind !== 'ok') {
      if (folderRes.kind === 'not-found') {
        await _offlineDeleteFolder(id, true)
        cipherStore.setLastSync()
      } else {
        notifyApiError(folderRes)
      }
      return folderRes
    }

    const userId = await userService.getUserId()
    const key = `folders_${userId}`
    const res = await storageService.get(key) || {}

    const folder = folderRes.data
    const folderData = new FolderData(folder, userId)

    // Update folder
    res[folder.id] = {
      ...folderData
    }
    folderStore.removeNotUpdate(folder.id)

    // Remove temporary folder
    for (const _id of Object.keys(res)) {
      if (_id.startsWith('tmp__') && res[_id].name === folder.name) {
        delete res[_id]
        folderStore.removeNotUpdate(_id)
        break
      }
    }

    await storageService.save(key, res)
    cipherStore.setLastSync()
    await reloadCache({ notCipher: true })
    return folderRes
  }

  // Sync single organization
  const syncSingleOrganization = async (id: string) => {
    const userId = await userService.getUserId()
    const key = `organizations_${userId}`
    const res = await storageService.get(key) || {}

    const orgRes = await cipherStore.getOrganization(id)
    if (orgRes.kind !== 'ok') {
      if (orgRes.kind === 'not-found' || orgRes.kind === 'forbidden') {
        delete res[id]
      } else {
        notifyApiError(orgRes)
        return orgRes
      }
    } else {
      const org = orgRes.data
      const orgData = new OrganizationData(org)

      // Update organization
      res[org.id] = {
        ...orgData
      }
    }

    await storageService.save(key, res)
    return orgRes
  }

  // Sync profile
  const syncProfile = async () => {
    const res = await cipherStore.getProfile()
    if (res.kind === 'ok') {
      await syncService.syncProfile(res.data)
      await loadOrganizations()
    } else {
      notifyApiError(res)
    }
    return res
  }

  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    reloadCache,
    startSyncProcess,
    getSyncData,
    syncOfflineData,
    syncAutofillData,

    getCiphers,
    getCipherById,
    getCollections,
    loadOrganizations,
    loadFolders,
    loadCollections,

    createCipher,
    updateCipher,
    deleteCiphers,
    toTrashCiphers,
    restoreCiphers,
    importCiphers,

    shareCipher,
    shareMultipleCiphers,
    confirmShareCipher,
    stopShareCipher,
    editShareCipher,
    leaveShare,
    acceptShareInvitation,
    rejectShareInvitation,

    createFolder,
    updateFolder,
    deleteFolder,

    createCollection,
    updateCollection,
    deleteCollection,

    syncSingleCipher,
    syncSingleFolder,
    syncSingleOrganization,
    syncProfile
  }

  return (
    <CipherDataMixinsContext.Provider value={data}>
      {props.children}
    </CipherDataMixinsContext.Provider>
  )
})

export const useCipherDataMixins = () => useContext(CipherDataMixinsContext)
