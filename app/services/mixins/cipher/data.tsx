import { observer } from 'mobx-react-lite'
import React, { createContext, useContext } from 'react'
import { useMixins } from '..'
import { CipherRequest } from '../../../../core/models/request/cipherRequest'
import { FolderRequest } from '../../../../core/models/request/folderRequest'
import { CipherView, LoginUriView, LoginView } from '../../../../core/models/view'
import { FolderView } from '../../../../core/models/view/folderView'
import { useStores } from '../../../models'
import { useCoreService } from '../../core-service'
import find from 'lodash/find'
import { ImportCiphersRequest } from '../../../../core/models/request/importCiphersRequest'
import { KvpRequest } from '../../../../core/models/request/kvpRequest'
import { CipherType } from '../../../../core/enums'
import { AutofillDataType, loadShared, saveShared } from '../../../utils/keychain'
import { useCipherHelpersMixins } from './helpers'
import { IS_IOS } from '../../../config/constants'
import { CollectionView } from '../../../../core/models/view/collectionView'
import { CollectionRequest } from '../../../../core/models/request/collectionRequest'
import { CipherData } from '../../../../core/models/data/cipherData'
import { FolderData } from '../../../../core/models/data/folderData'
import { Logger } from '../../../utils/logger'


type GetCiphersParams = {
  deleted: boolean,
  searchText: string,
  filters: Function[],
  includeExtensions?: boolean
}

const defaultData = {
  reloadCache: async () => {},
  getSyncData: async () => { return { kind: 'unknown' } },
  syncOfflineData: async () => {},
  syncAutofillData: async () => {},
  getCiphers: async (params: GetCiphersParams) => { return [] },
  getCipherById: async (id: string) => new CipherView(),
  getCollections: async () => { return [] },
  loadFolders: async () => {},
  loadCollections: async () => {},
  createCipher: async (cipher: CipherView, score: number, collectionIds: string[]) => { return { kind: 'unknown' } },
  updateCipher: async (id: string, cipher: CipherView, score: number, collectionIds: string[]) => { return { kind: 'unknown' } },
  toTrashCiphers: async (ids: string[]) => { return { kind: 'unknown' } },
  deleteCiphers: async (ids: string[]) => { return { kind: 'unknown' } },
  restoreCiphers: async (ids: string[]) => { return { kind: 'unknown' } },
  importCiphers: async (importResult) => { return { kind: 'unknown' } },
  createFolder: async (folder: FolderView) => { return { kind: 'unknown' } },
  updateFolder: async (folder: FolderView) => { return { kind: 'unknown' } },
  deleteFolder: async (id: string) => { return { kind: 'unknown' } },
  createCollection: async (collection: CollectionView) => { return { kind: 'unknown' } },
  updateCollection: async (collection: CollectionView) => { return { kind: 'unknown' } },
  deleteCollection: async (id: string, teamId: string) => { return { kind: 'unknown' } },
  syncSingleCipher: async (id: string) => {},
  syncSingleFolder: async (id: string) => {},
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
  const { notify, translate, randomString, notifyApiError } = useMixins()
  const { newCipher } = useCipherHelpersMixins()

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
      loadCollections()
    ])
    if (cipherStore.selectedCipher) {
      const updatedCipher = await getCipherById(cipherStore.selectedCipher.id)
      cipherStore.setSelectedCipher(updatedCipher)
    }
    if (IS_IOS) {
      await _updateAutofillData()
    }
  }

  // Sync
  const getSyncData = async () => {
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
      if (IS_IOS) {
        await _updateAutofillData()
      }
      return { kind: 'ok' }
    } catch (e) {
      Logger.error(e)
      messagingService.send('syncCompleted', { successfully: false })
      return { kind: 'error' }
    } finally {
      cipherStore.setIsSynching(false)
    }
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
    // Only iOS
    if (!IS_IOS) {
      return
    }
    
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
      authen: { email: user.email, hashPass: hashPasswordAutofill },
      faceIdEnabled: user.isBiometricUnlock
    }
    await saveShared('autofill', JSON.stringify(sharedData))
  }

  // Sync autofill data
  const syncAutofillData = async () => {
    try {
      // Only iOS
      if (!IS_IOS) {
        return
      }

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
            await _offlineCreateCipher(payload, [])
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

  // Load folders
  const loadFolders = async () => {
    try {
      const res = await folderService.getAllDecrypted() || []
      for (let f of res) {
        let ciphers = await getCiphers({
          deleted: false,
          searchText: '',
          filters: [(c: CipherView) => c.folderId ? c.folderId === f.id : (!f.id && !c.organizationId)]
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
        let ciphers = await getCiphers({
          deleted: false,
          searchText: '',
          filters: [c => c.collectionIds.includes(f.id)]
        })
        f.cipherCount = ciphers ? ciphers.length : 0
      }

      // Add unassigned
      let unassignedTeamCiphers = await getCiphers({
        deleted: false,
        searchText: '',
        filters: [(c : CipherView) => !c.collectionIds.length && !!c.organizationId]
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
      Logger.error(e)
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
      Logger.error(e)
      return []
    }
  }

  // Import
  const importCiphers = async (importResult) => {
    // Offline
    if (uiStore.isOffline) {
      await _offlineImportCiphers(importResult)
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
      await _offlineImportCiphers(importResult, true)
      notify('success', translate('import.success'))
      return res
    } else {
      notifyApiError(res)
      return res
    }
  }

  const _offlineImportCiphers = async (importResult, isCaching?: boolean) => {
    const ciphers = []
    const folders = []

    // Prepare ciphers
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

    // Prepare folders
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
      const res = await storageService.get(key)
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
      const res = await storageService.get(key)
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
        await _offlineCreateCipher(cipher, collectionIds)
        notify('success', `${translate('success.cipher_created')} ${translate('success.will_sync_when_online')}`)
        return { kind: 'ok' }
      } 

      // Online
      const cipherEnc = await cipherService.encrypt(cipher)
      const data = new CipherRequest(cipherEnc)
      const res = await cipherStore.createCipher(data, score, collectionIds)
      if (res.kind === 'ok') {
        await _offlineCreateCipher(cipher, collectionIds, true) 
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
  const _offlineCreateCipher = async (cipher: CipherView, collectionIds: string[], isCaching?: boolean) => {
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
    if (!isCaching) {
      cipherStore.addNotSync(tempId)
    } else {
      cipherStore.addNotUpdate(tempId)
    }
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
        await _offlineUpdateCipher(cipher, collectionIds, true)
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
  const _offlineUpdateCipher = async (cipher: CipherView, collectionIds: string[], isCaching?: boolean) => {
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
    if (!isCaching) {
      cipherStore.addNotSync(cipher.id)
    } else {
      cipherStore.addNotUpdate(cipher.id)
    }
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
    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key)

    ids.forEach(id => {
      delete res[id]
      if (!isCaching) {
        cipherStore.removeNotSync(id)
      } else {
        cipherStore.removeNotUpdate(id)
      }
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
    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key)

    ids.forEach(id => {
      res[id].deletedDate = new Date().toISOString()
      if (!isCaching) {
        cipherStore.addNotSync(id)
      } else {
        cipherStore.addNotUpdate(id)
      }
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
    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key)

    ids.forEach(id => {
      res[id].deletedDate = null
      if (!isCaching) {
        cipherStore.addNotSync(id)
      } else {
        cipherStore.addNotUpdate(id)
      }
    })
    await storageService.save(key, res)
    await reloadCache()
  }

  // ----------------------- FOLDER ---------------------------

  // Create folder
  const createFolder = async (folder: FolderView) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineCreateFolder(folder)
        notify('success', `${translate('folder.folder_created')} ${translate('success.will_sync_when_online')}`)
        return { kind: 'ok' }
      } 

      // Online
      const folderEnc = await folderService.encrypt(folder)
      const payload = new FolderRequest(folderEnc)
      const res = await folderStore.createFolder(payload)
      if (res.kind === 'ok') {
        await _offlineCreateFolder(folder, true) 
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
  const _offlineCreateFolder = async (folder: FolderView, isCaching?: boolean) => {
    const userId = await userService.getUserId()
    const key = `folders_${userId}`
    const res = await storageService.get(key)

    const folderEnc = await folderService.encrypt(folder)
    const data = new FolderRequest(folderEnc)
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
    await reloadCache()
  }

  // Update folder
  const updateFolder = async (folder: FolderView) => {
    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineUpdateFolder(folder)
        notify('success', `${translate('folder.folder_updated')} ${translate('success.will_sync_when_online')}`)
        return { kind: 'ok' }
      } 

      // Online
      const folderEnc = await folderService.encrypt(folder)
      const payload = new FolderRequest(folderEnc)
      const res = await folderStore.updateFolder(folder.id, payload)
      if (res.kind === 'ok') {
        await _offlineUpdateFolder(folder, true) 
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
  const _offlineUpdateFolder = async (folder: FolderView, isCaching?: boolean) => {
    const userId = await userService.getUserId()
    const key = `folders_${userId}`
    const res = await storageService.get(key)

    const folderEnc = await folderService.encrypt(folder)
    const data = new FolderRequest(folderEnc)

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
    await reloadCache()
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
    const res = await storageService.get(key)

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
        await _offlineCreateCollection(collection, true) 
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
  const _offlineCreateCollection = async (collection: CollectionView, isCaching?: boolean) => {
    const userId = await userService.getUserId()
    const key = `collections_${userId}`
    const res = await storageService.get(key)

    const collectionEnc = await collectionService.encrypt(collection)
    const data = new CollectionRequest(collectionEnc)
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
    await reloadCache()
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
        await _offlineUpdateCollection(collection, true) 
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
  const _offlineUpdateCollection = async (collection: CollectionView, isCaching?: boolean) => {
    const userId = await userService.getUserId()
    const key = `collections_${userId}`
    const res = await storageService.get(key)

    const collectionEnc = await collectionService.encrypt(collection)
    const data = new CollectionRequest(collectionEnc)

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
    await reloadCache()
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
    const res = await storageService.get(key)

    delete res[id]
    if (!isCaching) {
      collectionStore.removeNotSync(id)
    } else {
      collectionStore.removeNotUpdate(id)
    }
    await storageService.save(key, res)
    await reloadCache()
  }

  // Sync single cipher
  const syncSingleCipher = async (id: string) => {
    const userId = await userService.getUserId()
    const key = `ciphers_${userId}`
    const res = await storageService.get(key)

    const cipherRes = await cipherStore.getCipher(id)
    if (cipherRes.kind !== 'ok') {
      if (cipherRes.kind === 'not-found') {
        delete res[id]
        cipherStore.removeNotUpdate(id)
      } else {
        notifyApiError(cipherRes)
        return
      }
    } else {
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
          break
        }
      }
    }

    await storageService.save(key, res)
    await reloadCache({
      isOnline: true
    })
  }

  // Sync single folder
  const syncSingleFolder = async (id: string) => {
    const userId = await userService.getUserId()
    const key = `folders_${userId}`
    const res = await storageService.get(key)

    const folderRes = await folderStore.getFolder(id)
    if (folderRes.kind !== 'ok') {
      if (folderRes.kind === 'not-found') {
        delete res[id]
        folderStore.removeNotUpdate(id)
      } else {
        notifyApiError(folderRes)
        return
      }
    } else {
      const folder = folderRes.data
      const folderData = new FolderData(folder, userId)

      // Update cipher
      res[folder.id] = {
        ...folderData
      }
      folderStore.removeNotUpdate(folder.id)

      // Remove temporary cipher
      for (const _id of Object.keys(res)) {
        if (_id.startsWith('tmp__') && res[_id].name === folder.name) {
          delete res[_id]
          folderStore.removeNotUpdate(_id)
          break
        }
      }
    }

    await storageService.save(key, res)
    await reloadCache({
      isOnline: true
    })
  }

  // -------------------- REGISTER FUNCTIONS ------------------

  const data = {
    reloadCache,
    getSyncData,
    syncOfflineData,
    syncAutofillData,
    getCiphers,
    getCipherById,
    getCollections,
    loadFolders,
    loadCollections,
    createCipher,
    updateCipher,
    deleteCiphers,
    toTrashCiphers,
    restoreCiphers,
    importCiphers,
    createFolder,
    updateFolder,
    deleteFolder,
    createCollection,
    updateCollection,
    deleteCollection,
    syncSingleCipher,
    syncSingleFolder
  }

  return (
    <CipherDataMixinsContext.Provider value={data}>
      {props.children}
    </CipherDataMixinsContext.Provider>
  )
})

export const useCipherDataMixins = () => useContext(CipherDataMixinsContext)
