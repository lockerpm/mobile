import { observer } from "mobx-react-lite"
import React, { createContext, useContext } from "react"
import { useMixins } from ".."
import { CipherRequest } from "../../../../core/models/request/cipherRequest"
import { FolderRequest } from "../../../../core/models/request/folderRequest"
import { CipherView, LoginUriView, LoginView } from "../../../../core/models/view"
import { FolderView } from "../../../../core/models/view/folderView"
import { useStores } from "../../../models"
import { useCoreService } from "../../core-service"
import { ImportCiphersRequest } from "../../../../core/models/request/importCiphersRequest"
import { KvpRequest } from "../../../../core/models/request/kvpRequest"
import { CipherType } from "../../../../core/enums"
import { AutofillDataType, loadShared, saveShared } from "../../../utils/keychain"
import { useCipherHelpersMixins } from "./helpers"
import {
  IMPORT_BATCH_SIZE,
  MAX_MULTIPLE_SHARE_COUNT,
  TEMP_PREFIX,
  FREE_PLAN_LIMIT,
} from "../../../config/constants"
import { CollectionView } from "../../../../core/models/view/collectionView"
import { CollectionRequest } from "../../../../core/models/request/collectionRequest"
import { CipherData } from "../../../../core/models/data/cipherData"
import { FolderData } from "../../../../core/models/data/folderData"
import { Logger } from "../../../utils/logger"
import { Cipher, EncString, SymmetricCryptoKey } from "../../../../core/models/domain"
import { Utils } from "../../core-service/utils"
import { AccountRoleText, EmergencyAccessType } from "../../../config/types"
import { OrganizationData } from "../../../../core/models/data/organizationData"
import { ImportResult } from "../../../../core/models/domain/importResult"
import { SyncQueue } from "../../../utils/queue"
import { AppEventType, EventBus } from "../../../utils/event-bus"
import chunk from "lodash/chunk"

type GetCiphersParams = {
  deleted: boolean
  searchText: string
  filters: ((c: CipherView) => boolean)[]
  includeExtensions?: boolean
}

const defaultData = {
  reloadCache: async () => null,
  startSyncProcess: async (bumpTimestamp: number) => {
    return { kind: "unknown" }
  },
  getSyncData: async (bumpTimestamp: number) => {
    return { kind: "unknown" }
  },
  syncOfflineData: async () => null,
  syncAutofillData: async () => null,

  getEncKeyFromDecryptedKey: async (encrypt_key: string) => {
    return null
  },
  getCiphers: async (params: GetCiphersParams) => {
    return []
  },
  getCiphersFromCache: async (params: GetCiphersParams) => {
    return []
  },
  getEncryptedCiphers: async (params: GetCiphersParams) => {
    return []
  },
  getCipherById: async (id: string) => new CipherView(),

  getCollections: async () => {
    return []
  },
  loadOrganizations: async () => null,
  loadFolders: async () => null,
  loadCollections: async () => null,

  createCipher: async (
    cipher: CipherView,
    score: number,
    collectionIds: string[],
    silent?: boolean,
  ) => {
    return { kind: "unknown" }
  },
  updateCipher: async (
    id: string,
    cipher: CipherView,
    score: number,
    collectionIds: string[],
    silent?: boolean,
  ) => {
    return { kind: "unknown" }
  },
  toTrashCiphers: async (ids: string[]) => {
    return { kind: "unknown" }
  },
  deleteCiphers: async (ids: string[]) => {
    return { kind: "unknown" }
  },
  restoreCiphers: async (ids: string[]) => {
    return { kind: "unknown" }
  },
  importCiphers: async (payload: {
    importResult: any
    setImportedCount: (val: number) => void
    setTotalCount: (val: number) => void
    setIsLimited: (val: boolean) => void
    isFreeAccount: boolean
  }) => {
    return { kind: "unknown" }
  },

  inviteEA: async (email: string, type: EmergencyAccessType, waitTime: number) => {
    return { kind: "unknown" }
  },
  shareCipher: async (
    cipher: CipherView,
    emails: string[],
    role: AccountRoleText,
    autofillOnly: boolean,
    groups?: { id: string; name: string }[],
  ) => {
    return { kind: "unknown" }
  },
  shareMultipleCiphers: async (
    ids: string[],
    emails: string[],
    role: AccountRoleText,
    autofillOnly: boolean,
    groups?: { id: string; name: string }[],
  ) => {
    return { kind: "unknown" }
  },
  confirmShareCipher: async (organizationId: string, memberId: string, publicKey: string) => {
    return { kind: "unknown" }
  },
  stopShareCipher: async (cipher: CipherView, memberId: string) => {
    return { kind: "unknown" }
  },
  editShareCipher: async (
    organizationId: string,
    memberId: string,
    role: AccountRoleText,
    onlyFill: boolean,
    isGroup?: boolean,
  ) => {
    return { kind: "unknown" }
  },
  leaveShare: async (organizationId: string, id?: string) => {
    return { kind: "unknown" }
  },
  acceptShareInvitation: async (id: string) => {
    return { kind: "unknown" }
  },
  rejectShareInvitation: async (id: string) => {
    return { kind: "unknown" }
  },

  createFolder: async (folder: FolderView) => {
    return { kind: "unknown" }
  },
  updateFolder: async (folder: FolderView) => {
    return { kind: "unknown" }
  },
  deleteFolder: async (id: string) => {
    return { kind: "unknown" }
  },

  createCollection: async (collection: CollectionView) => {
    return { kind: "unknown" }
  },
  updateCollection: async (collection: CollectionView) => {
    return { kind: "unknown" }
  },
  deleteCollection: async (collection: CollectionView) => {
    return { kind: "unknown" }
  },

  syncSingleCipher: async (id: string) => {
    return { kind: "unknown" }
  },
  syncSingleFolder: async (id: string) => {
    return { kind: "unknown" }
  },
  syncSingleOrganization: async (id: string) => {
    return { kind: "unknown" }
  },
  syncProfile: async () => {
    return { kind: "unknown" }
  },

  createRandomPasswords: async (params: { count: number; type: CipherType }) => null
}

export const CipherDataMixinsContext = createContext(defaultData)

export const CipherDataMixinsProvider = observer(
  (props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {
    const {
      cipherStore,
      folderStore,
      uiStore,
      collectionStore,
      user,
      enterpriseStore,
    } = useStores()
    const {
      userService,
      cipherService,
      folderService,
      storageService,
      collectionService,
      searchService,
      messagingService,
      syncService,
      cryptoService,
    } = useCoreService()
    const { notify, translate, randomString, notifyApiError, getTeam } = useMixins()
    const { newCipher } = useCipherHelpersMixins()
    const syncQueue = SyncQueue

    // ----------------------------- METHODS ---------------------------
    const createRandomPasswords = async (params: { count: number; type: CipherType }) => {
      const { count, type } = params

      for (let i = 0; i < count; i++) {
        const name = Math.random().toString()

        const payload = newCipher(type)
        payload.name = name
        const passwordStrength = 1
        await createCipher(payload, passwordStrength, [])
      }

      notify("success", "Done")
    }

    // Reload offline cache
    const reloadCache = async (options?: { isOnline?: boolean; notCipher?: boolean }) => {
      Logger.debug("reload cache")
      cipherStore.setLastCacheUpdate()
      if (!options?.notCipher) {
        await cipherService.clearCache()
      }
      folderService.clearCache()
      collectionService.clearCache()
      await Promise.all([loadFolders(), loadCollections(), loadOrganizations()])
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
    const minimalReloadCache = async (payload: { cipher?: CipherView; deletedIds?: string[] }) => {
      Logger.debug("minimal reload cache")

      const { cipher, deletedIds } = payload
      if (cipher) {
        cipherService.csUpdateDecryptedCache([cipher])
      }
      if (deletedIds) {
        cipherService.csDeleteFromDecryptedCache(deletedIds)
      }

      await Promise.all([loadFolders(), loadCollections(), loadOrganizations()])
      if (cipherStore.selectedCipher && cipherStore.selectedCipher.name) {
        const updatedCipher = await getCipherById(cipherStore.selectedCipher.id)
        if (updatedCipher.id) {
          cipherStore.setSelectedCipher(updatedCipher)
        }
      }
      _updateAutofillData()
      if (uiStore.hasNoMasterPwItem) {
        startSyncProcess(Date.now())
        uiStore.setHasNoMasterPwItem(false)
      }
      cipherStore.setLastCacheUpdate()

      if (cipher?.type === CipherType.Login || !!deletedIds) {
        EventBus.emit(AppEventType.PASSWORD_UPDATE, null)
      }
    }

    // Sync
    const getSyncData = (bumpTimestamp: number) => {
      syncQueue.clear()
      return syncQueue.add(async () => {
        try {
          cipherStore.setIsSynching(true)
          messagingService.send("syncStarted")

          // Sync api
          const res = await cipherStore.syncData()
          if (res.kind !== "ok") {
            notifyApiError(res)
            messagingService.send("syncCompleted", { successfully: false })
            return res
          }

          // Start sync
          cipherStore.setLastSync(bumpTimestamp)
          await syncService.setLastSync(new Date(bumpTimestamp))

          // Sync service
          const userId = await userService.getUserId()

          await syncService.syncProfile(res.data.profile)
          await syncService.syncFolders(userId, res.data.folders)
          await syncService.syncCollections(res.data.collections)
          await syncService.syncCiphers(userId, res.data.ciphers)
          await syncService.syncSends(userId, res.data.sends)
          await syncService.syncSettings(userId, res.data.domains)
          await syncService.syncPolicies(res.data.policies)

          messagingService.send("syncCompleted", { successfully: true })

          // Clear not updated list
          cipherStore.clearNotUpdate()
          folderStore.clearNotUpdate()
          collectionStore.clearNotUpdate()

          // Save fingerprint
          const fingerprint = await cryptoService.getFingerprint(userId)
          user.setFingerprint(fingerprint.join("-"))

          // Save to shared keychain for autofill service
          await _updateAutofillData()

          // Reload password health
          EventBus.emit(AppEventType.PASSWORD_UPDATE, null)

          return { kind: "ok" }
        } catch (e) {
          Logger.error("getSyncData: " + e)
          messagingService.send("syncCompleted", { successfully: false })
          return { kind: "error" }
        } finally {
          cipherStore.setIsSynching(false)
        }
      })
    }

    // Sync gradually
    const startSyncProcess = (bumpTimestamp: number) => {
      syncQueue.clear()
      return syncQueue.add(async () => {
        try {
          const pageSize = 300
          let page = 1
          let cipherIds: string[] = []

          cipherStore.setIsSynching(true)

          // Sync api
          let res = await cipherStore.syncData(page, pageSize)
          if (res.kind !== "ok") {
            notifyApiError(res)
            return res
          }

          // Set last sync
          cipherStore.setLastSync(bumpTimestamp)
          await syncService.setLastSync(new Date(bumpTimestamp))

          // Sync service with data from first page
          const userId = await userService.getUserId()

          await syncService.syncProfile(res.data.profile)
          await syncService.syncFolders(userId, res.data.folders)
          await syncService.syncCollections(res.data.collections)
          await syncService.syncSomeCiphers(userId, res.data.ciphers)
          await syncService.syncSends(userId, res.data.sends)
          await syncService.syncSettings(userId, res.data.domains)
          await syncService.syncPolicies(res.data.policies)

          cipherIds = res.data.ciphers.map((c) => c.id)

          // Load all loaded data
          loadOrganizations()
          cipherStore.setLastCacheUpdate()

          // Sync other ciphers
          const totalCipherCount = res.data.count.ciphers
          while (page * pageSize < totalCipherCount) {
            page += 1
            res = await cipherStore.syncData(page, pageSize)
            if (res.kind !== "ok") {
              notifyApiError(res)
              return res
            }
            await syncService.syncSomeCiphers(userId, res.data.ciphers)
            cipherIds = [...cipherIds, ...res.data.ciphers.map((c) => c.id)]
            cipherStore.setLastCacheUpdate()
          }

          // Clear deleted ciphers
          const deletedIds: string[] = []
          const storageRes: { [id: string]: any } = await storageService.get(`ciphers_${userId}`)
          for (const id in { ...storageRes }) {
            if (!cipherIds.includes(id)) {
              delete storageRes[id]
              deletedIds.push(id)
            }
          }
          await storageService.save(`ciphers_${userId}`, storageRes)
          await cipherService.csDeleteFromDecryptedCache(deletedIds)

          // Load folders
          loadFolders()
          loadCollections()

          // Clear not updated list
          cipherStore.clearNotUpdate()
          folderStore.clearNotUpdate()
          collectionStore.clearNotUpdate()

          // Save fingerprint
          const fingerprint = await cryptoService.getFingerprint(userId)
          user.setFingerprint(fingerprint.join("-"))

          // Save to shared keychain for autofill service
          await _updateAutofillData()

          // Reload password health
          EventBus.emit(AppEventType.PASSWORD_UPDATE, null)

          return { kind: "ok" }
        } catch (e) {
          Logger.error("startSyncProcess: " + e)
          return { kind: "error" }
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
        const notSynchedCiphers = await getEncryptedCiphers({
          deleted: false,
          searchText: "",
          filters: [(c: CipherView) => cipherStore.notSynchedCiphers.includes(c.id)],
          includeExtensions: true,
        })
        const notSynchedCiphersDeleted = await getEncryptedCiphers({
          deleted: true,
          searchText: "",
          filters: [(c: CipherView) => cipherStore.notSynchedCiphers.includes(c.id)],
          includeExtensions: true,
        })
        notSynchedCiphers.push(...notSynchedCiphersDeleted)

        notSynchedCiphers.forEach((enc: Cipher) => {
          const cipherReq = new CipherRequest(enc)
          if (!enc.id?.startsWith(TEMP_PREFIX)) {
            // @ts-ignore
            cipherReq.id = enc.id
          }
          if (enc.deletedDate) {
            // @ts-ignore
            cipherReq.deletedDate = new Date(enc.deletedDate).getTime() / 1000
          }
          ciphers.push(cipherReq)
        })
      }

      // Prepare folders
      if (folderStore.notSynchedFolders.length > 0) {
        const promises = []
        folderStore.folders
          .filter((f) => folderStore.notSynchedFolders.includes(f.id))
          .forEach((f: FolderView) => {
            promises.push(
              folderService.encrypt(f).then((enc) => {
                const folderReq = new FolderRequest(enc)
                // @ts-ignore
                folderReq.id = f.id
                folders.push(folderReq)
              }),
            )
          })
        await Promise.all(promises)
      }

      // Prepare relationship
      folders.forEach((f, fIndex) => {
        if (f.id?.startsWith(TEMP_PREFIX)) {
          ciphers.forEach((c, cIndex) => {
            if (c.folderId === f.id) {
              c.folderId = null
              folderRelationships.push({
                key: cIndex,
                value: fIndex,
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
          folderRelationships,
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
          (c: CipherView) =>
            c.type === CipherType.Login && !!c.login.username && !!c.login.password,
        ],
        searchText: "",
        deleted: false,
      })
      const passwordData = passwordRes.map((c: CipherView) => ({
        id: c.id,
        name: c.name,
        uri: c.login.uri || "",
        username: c.login.username || "",
        password: c.login.password || "",
        isOwner: !c.organizationId,
      }))

      const sharedData: AutofillDataType = {
        passwords: passwordData,
        deleted: [],
        authen: { email: user.email, hashPass: hashPasswordAutofill, avatar: user.avatar },
        faceIdEnabled: user.isBiometricUnlock,
      }

      await saveShared("autofill", JSON.stringify(sharedData))
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
            faceIdEnabled: false,
          }
          await saveShared("autofill", JSON.stringify(sharedData))
          return
        }

        let hasUpdate = false
        const sharedData: AutofillDataType = JSON.parse(credentials.password)

        // Delete passwords
        if (sharedData.deleted) {
          await _offlineDeleteCiphers(sharedData.deleted.map((c) => c.id))
          hasUpdate = true
        }

        // Create passwords
        if (sharedData.passwords) {
          for (const cipher of sharedData.passwords) {
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
                collectionIds: [],
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
        Logger.error("syncAutofillData: " + e)
      } finally {
        cipherStore.setIsSynchingAutofill(false)
      }
    }

    // Load organizations
    const loadOrganizations = async () => {
      try {
        const res = (await userService.getAllOrganizations()) || []
        cipherStore.setOrganizations(res)
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("loadOrganizations: " + e)
      }
    }

    // Load folders
    const loadFolders = async () => {
      try {
        const res = (await folderService.getAllDecrypted()) || []

        const folders = await Promise.all(
          res.map(async (folder) => {
            if (!folder.id) return folder
            const ciphers = await getEncryptedCiphers({
              deleted: false,
              searchText: "",
              // filters: [(c: CipherView) => c.folderId ? c.folderId === f.id : (!f.id && (!c.organizationId || !getTeam(user.teams, c.organizationId).name))]
              // exclude share folder item
              filters: [
                (c: CipherView) =>
                  c.collectionIds.length === 0 && c.folderId && c.folderId === folder.id,
                // : !f.id && (!c.organizationId || !getTeam(user.teams, c.organizationId).name)
              ],
            })
            return {
              ...folder,
              cipherCount: ciphers ? ciphers.length : 0,
            }
          }),
        )

        folderStore.setFolders(folders)
        folderStore.setLastUpdate()
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("loadFolders: " + e)
      }
    }

    // Load collections
    const loadCollections = async () => {
      try {
        const res = (await collectionService.getAllDecrypted()) || []

        const collections = await Promise.all(
          res.map(async (collection) => {
            const ciphers = await getEncryptedCiphers({
              deleted: false,
              searchText: "",
              filters: [(c) => c.collectionIds.includes(collection.id)],
            })
            return {
              ...collection,
              cipherCount: ciphers ? ciphers.length : 0,
            }
          }),
        )

        // Add unassigned
        const unassignedTeamCiphers = await getEncryptedCiphers({
          deleted: false,
          searchText: "",
          filters: [
            (c: CipherView) =>
              !c.collectionIds?.length && !!getTeam(user.teams, c.organizationId).name,
          ],
        })
        unassignedTeamCiphers.forEach((item: CipherView) => {
          const target = collections.find(
            (f) => f.id === null && f.organizationId === item.organizationId,
          )
          if (target) {
            target.cipherCount += 1
          } else {
            // @ts-ignore
            collections.push({
              cipherCount: 1,
              hidePasswords: null,
              id: null,
              name: "",
              organizationId: item.organizationId,
            })
          }
        })

        collectionStore.setCollections(collections)
        collectionStore.setLastUpdate()
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("loadCollections: " + e)
      }
    }

    const getEncKeyFromDecryptedKey = async (encrypt_key: string) => {
      const keyBuffer = await cryptoService.rsaDecrypt(encrypt_key)
      return new SymmetricCryptoKey(keyBuffer)
    }

    // Get encrypted ciphers
    const getEncryptedCiphers = async (params: GetCiphersParams) => {
      try {
        const deletedFilter = (c: Cipher) => !!c.deletedDate === params.deleted
        const filters = [deletedFilter, ...params.filters]
        if (!params.includeExtensions) {
          filters.unshift((c: Cipher) => c.type !== CipherType.TOTP)
        }
        return (await searchService.searchEncryptedCiphers(filters, null)) || []
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("getEncryptedCiphers: " + e)
        return []
      }
    }

    // Get ciphers
    const getCiphers = async (params: GetCiphersParams) => {
      try {
        const deletedFilter = (c: CipherView) => c.isDeleted === params.deleted
        const filters = [deletedFilter, ...params.filters]
        if (!params.includeExtensions) {
          filters.unshift((c: CipherView) => ![CipherType.TOTP].includes(c.type))
        }
        return (await searchService.searchCiphers(params.searchText || "", filters, null)) || []
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("getCiphers: " + e)
        return []
      }
    }

    // Get ciphers from cache only
    const getCiphersFromCache = async (params: GetCiphersParams) => {
      try {
        const deletedFilter = (c: CipherView) => c.isDeleted === params.deleted
        const filters = [deletedFilter, ...params.filters]
        if (!params.includeExtensions) {
          filters.unshift((c: CipherView) => ![CipherType.TOTP].includes(c.type))
        }
        return (
          (await searchService.searchCiphersFromCache(params.searchText || "", filters, null)) || []
        )
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("getCiphersFromCache: " + e)
        return []
      }
    }

    // Get cipher by id
    const getCipherById = async (id: string) => {
      const ciphers = await getCiphers({
        deleted: false,
        searchText: "",
        filters: [(c) => c.id === id],
      })
      return ciphers[0] || new CipherView()
    }

    // Get collections
    const getCollections = async () => {
      try {
        let res = (await collectionService.getAllDecrypted()) || []
        res = res.filter((item) => item.id)
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("getCollections: " + e)
        return []
      }
    }

    // Import
    const importCiphers = async (payload) => {
      const { importResult, setImportedCount, setTotalCount, setIsLimited, isFreeAccount } = payload
      setTotalCount(importResult.ciphers.length)
      // Offline
      if (uiStore.isOffline) {
        await _offlineImportCiphers({
          importResult,
          setImportedCount,
          setTotalCount,
          setIsLimited,
          isFreeAccount,
        })
        notify(
          "success",
          translate("import.success") + " " + translate("success.will_sync_when_online"),
        )
        return { kind: "ok" }
      }
      // Online
      const request = new ImportCiphersRequest()

      if (isFreeAccount) {
        let numberOfImportedCipher = 0
        let currentLoginCount = await _getCipherCount(CipherType.Login)
        let currentCardCount = await _getCipherCount(CipherType.Card)
        let currentIdentityCount = await _getCipherCount(CipherType.Identity)
        let currentNoteCount = await _getCipherCount(CipherType.SecureNote)
        let currentCryptoCount = await _getCipherCount(CipherType.CryptoWallet)

        // TODO
        // unlimited for other cipher types

        for (let i = 0; i < importResult.ciphers.length; i++) {
          const cipher = importResult.ciphers[i]

          if (cipher.type === CipherType.Login) {
            if (currentLoginCount < FREE_PLAN_LIMIT.LOGIN) {
              currentLoginCount += 1
            } else {
              setIsLimited(true)
              continue
            }
          } else if (cipher.type === CipherType.SecureNote) {
            if (currentNoteCount < FREE_PLAN_LIMIT.NOTE) {
              currentNoteCount += 1
            } else {
              setIsLimited(true)
              continue
            }
          } else if (cipher.type === CipherType.CryptoWallet) {
            if (currentCryptoCount < FREE_PLAN_LIMIT.CRYPTO) {
              currentCryptoCount += 1
            } else {
              setIsLimited(true)
              continue
            }
          } else if (cipher.type === CipherType.Card) {
            if (currentCardCount < FREE_PLAN_LIMIT.PAYMENT_CARD) {
              currentCardCount += 1
            } else {
              setIsLimited(true)
              continue
            }
            break
          } else if (cipher.type === CipherType.Identity) {
            if (currentIdentityCount < FREE_PLAN_LIMIT.IDENTITY) {
              currentIdentityCount += 1
            } else {
              setIsLimited(true)
              continue
            }
          }

          const countDuplicate = await _countDuplicateCipherName(cipher)
          if (countDuplicate > 0) {
            cipher.name = `${cipher.name} (${countDuplicate})`
          }
          const enc = await cipherService.encrypt(cipher)
          request.ciphers.push(new CipherRequest(enc))
          numberOfImportedCipher += 1
          setImportedCount(numberOfImportedCipher)
        }
      } else {
        for (let i = 0; i < importResult.ciphers.length; i++) {
          const cipher = importResult.ciphers[i]
          const countDuplicate = await _countDuplicateCipherName(cipher)
          if (countDuplicate > 0) {
            cipher.name = `${cipher.name} (${countDuplicate})`
          }
          const enc = await cipherService.encrypt(cipher)

          request.ciphers.push(new CipherRequest(enc))
          setImportedCount(i + 1)
        }
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
        importResult.folderRelationships.forEach((r) =>
          request.folderRelationships.push(new KvpRequest(r[0], r[1])),
        )
      }

      // Import folders first
      let folderIds = []
      let importedFolderCount = 0
      const folderBatches = chunk(request.folders, IMPORT_BATCH_SIZE)
      for (const batch of folderBatches) {
        const res = await cipherStore.importFolders({ folders: batch })
        if (res.kind !== "ok") {
          notifyApiError(res)
          return res
        }
        importedFolderCount += batch.length
        // setImportedFolderCount && setImportedFolderCount(importedFolderCount)
        folderIds = [...folderIds, ...res.data.ids]
      }

      // Then import ciphers with updated folderId
      request.ciphers = request.ciphers.map((cipher, index) => {
        const folderRelationship = request.folderRelationships.find((item) => item.key === index)
        return {
          ...cipher,
          folderId: folderRelationship ? folderIds[folderRelationship.value] : null,
        }
      })
      let importedCipherCount = 0
      const cipherBatches = chunk(request.ciphers, IMPORT_BATCH_SIZE)
      for (const batch of cipherBatches) {
        const res = await cipherStore.importCiphers({ ciphers: batch })
        if (res.kind !== "ok") {
          notifyApiError(res)
          return res
        }
        importedCipherCount += batch.length
        // setImportedCipherCount && setImportedCipherCount(importedCipherCount)
      }
      // await startSyncProcess(Date.now())
      if (importedCipherCount !== 0) {
        notify("success", translate("import.success"))
      }

      return { kind: "ok" }
    }

    const _getCipherCount = async (type: CipherType) => {
      const allCiphers = await getEncryptedCiphers({
        deleted: false,
        searchText: "",
        filters: [(c: CipherView) => c.type === type],
      })
      return allCiphers.length
    }

    const _offlineImportCiphers = async (payload: {
      importResult: ImportResult
      setImportedCount: (val: number) => void
      setTotalCount: (val: number) => void
      setIsLimited: (val: boolean) => void
      isFreeAccount: boolean
      isCaching?: boolean
      cipherRequests?: (CipherRequest & { id?: string })[]
      folderRequests?: (FolderRequest & { id?: string })[]
    }) => {
      const {
        importResult,
        setImportedCount,
        setTotalCount,
        setIsLimited,
        isFreeAccount,
        isCaching,
        cipherRequests,
        folderRequests,
      } = payload

      const ciphers = cipherRequests || []
      const folders = folderRequests || []

      // Prepare ciphers
      if (!cipherRequests) {
        if (isFreeAccount) {
          let numberOfImportedCipher = 0
          let currentLoginCount = await _getCipherCount(CipherType.Login)
          let currentCardCount = await _getCipherCount(CipherType.Card)
          let currentIdentityCount = await _getCipherCount(CipherType.Identity)
          let currentNoteCount = await _getCipherCount(CipherType.SecureNote)
          let currentCryptoCount = await _getCipherCount(CipherType.CryptoWallet)
          for (let i = 0; i < importResult.ciphers.length; i++) {
            const cipher = importResult.ciphers[i]

            if (cipher.type === CipherType.Login) {
              if (currentLoginCount < FREE_PLAN_LIMIT.LOGIN) {
                currentLoginCount += 1
              } else {
                setIsLimited(true)
                continue
              }
            } else if (cipher.type === CipherType.SecureNote) {
              if (currentNoteCount < FREE_PLAN_LIMIT.NOTE) {
                currentNoteCount += 1
              } else {
                setIsLimited(true)
                continue
              }
            } else if (cipher.type === CipherType.CryptoWallet) {
              if (currentCryptoCount < FREE_PLAN_LIMIT.CRYPTO) {
                currentCryptoCount += 1
              } else {
                setIsLimited(true)
                continue
              }
            } else if (cipher.type === CipherType.Card) {
              if (currentCardCount < FREE_PLAN_LIMIT.PAYMENT_CARD) {
                currentCardCount += 1
              } else {
                setIsLimited(true)
                continue
              }
              break
            } else if (cipher.type === CipherType.Identity) {
              if (currentIdentityCount < FREE_PLAN_LIMIT.IDENTITY) {
                currentIdentityCount += 1
              } else {
                setIsLimited(true)
                continue
              }
            }

            const countDuplicate = await _countDuplicateCipherName(cipher)
            if (countDuplicate > 0) {
              cipher.name = `${cipher.name} (${countDuplicate})`
            }
            const enc = await cipherService.encrypt(cipher)
            const cr = new CipherRequest(enc)
            const tempId = TEMP_PREFIX + randomString()
            // @ts-ignore
            cr.id = tempId
            ciphers.push(cr)
            numberOfImportedCipher += 1
            setImportedCount(numberOfImportedCipher)
          }
        } else {
          for (let i = 0; i < importResult.ciphers.length; i++) {
            const cipher = importResult.ciphers[i]
            const countDuplicate = await _countDuplicateCipherName(cipher)
            if (countDuplicate > 0) {
              cipher.name = `${cipher.name} (${countDuplicate})`
            }
            const enc = await cipherService.encrypt(cipher)
            const cr = new CipherRequest(enc)
            const tempId = TEMP_PREFIX + randomString()
            // @ts-ignore
            cr.id = tempId
            ciphers.push(cr)
            setImportedCount(i + 1)
          }
        }
      }

      // Check for empty id
      for (const cipher of ciphers) {
        if (!cipher.id) {
          const tempId = TEMP_PREFIX + randomString()
          cipher.id = tempId
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
            const tempId = TEMP_PREFIX + randomString()
            // @ts-ignore
            fr.id = tempId
            folders.push(fr)
          }
        }
      }

      // Check for empty id
      for (const folder of folders) {
        if (!folder.id) {
          const tempId = TEMP_PREFIX + randomString()
          folder.id = tempId
        }
      }

      // Prepare relationships
      if (importResult.folderRelationships != null) {
        importResult.folderRelationships.forEach((r) => {
          ciphers[r[0]].folderId = folders[r[1]].id
        })
      }

      // Update cipher storage
      const userId = await userService.getUserId()
      if (ciphers.length) {
        const key = `ciphers_${userId}`
        const res = (await storageService.get(key)) || {}
        ciphers.forEach((c) => {
          if (!isCaching) {
            cipherStore.addNotSync(c.id)
          } else {
            cipherStore.addNotUpdate(c.id)
          }
          res[c.id] = {
            ...c,
            userId,
          }
        })
        await storageService.save(key, res)
      }

      // Update folder storage
      if (folders.length) {
        const key = `folders_${userId}`
        const res = (await storageService.get(key)) || {}
        ciphers.forEach((f) => {
          if (!isCaching) {
            folderStore.addNotSync(f.id)
          } else {
            folderStore.addNotUpdate(f.id)
          }
          res[f.id] = {
            ...f,
            userId,
          }
        })
        await storageService.save(key, res)
      }

      await reloadCache()
      return { kind: "ok" }
    }

    // Check cipher name duplication
    const _countDuplicateCipherName = async (cipher: CipherView) => {
      // TODO: no more counting duplicate cipher
      return 0

      // const ciphers = await getCiphers({
      //   deleted: false,
      //   searchText: cipher.name,
      //   filters: [(c: CipherView) => c.type === cipher.type && c.name.startsWith(cipher.name)]
      // })
      // let count = 1
      // let name = cipher.name
      // while (ciphers.some((c: CipherView) => c.name === name)) {
      //   name = `${cipher.name} (${count})`
      //   count += 1
      // }
      // return count - 1
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
    const createCipher = async (
      cipher: CipherView,
      score: number,
      collectionIds: string[],
      silent?: boolean,
    ) => {
      try {
        // Check name duplication
        const countDuplicate = await _countDuplicateCipherName(cipher)
        if (countDuplicate > 0) {
          notify("error", translate("error.duplicate_cipher_name"))
          return { kind: "bad-data" }
        }

        // Offline
        if (uiStore.isOffline) {
          await _offlineCreateCipher({ cipher, collectionIds })
          notify(
            "success",
            `${translate("success.cipher_created")} ${translate("success.will_sync_when_online")}`,
          )
          return { kind: "ok" }
        }

        // Online
        const cipherEnc = await cipherService.encrypt(cipher)
        const data = new CipherRequest(cipherEnc)
        const res = await cipherStore.createCipher(data, score, collectionIds)
        if (res.kind === "ok") {
          await _offlineCreateCipher({
            cipher,
            collectionIds,
            cipherRequest: data,
            cipherId: res.data.id,
          })
          !silent && notify("success", translate("success.cipher_created"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("createCipher: " + e)
        return { kind: "unknown" }
      }
    }

    // Offline create
    const _offlineCreateCipher = async (payload: {
      cipher: CipherView
      collectionIds: string[]
      cipherRequest?: CipherRequest
      cipherId?: string
    }) => {
      const { cipher, collectionIds, cipherRequest, cipherId } = payload
      const userId = await userService.getUserId()
      const key = `ciphers_${userId}`
      const res = (await storageService.get(key)) || {}

      const cipherEnc = await cipherService.encrypt(cipher)
      const data = cipherRequest || new CipherRequest(cipherEnc)
      const tempId = TEMP_PREFIX + randomString()
      const finalId = cipherId || tempId

      res[finalId] = {
        ...data,
        userId,
        id: finalId,
        collectionIds,
      }
      await storageService.save(key, res)
      if (!cipherId) {
        cipherStore.addNotSync(finalId)
      }

      // Update cache
      cipher.id = finalId
      await minimalReloadCache({ cipher })
    }

    // Update
    const updateCipher = async (
      id: string,
      cipher: CipherView,
      score: number,
      collectionIds: string[],
      silent?: boolean,
    ) => {
      try {
        // Offline
        if (uiStore.isOffline) {
          await _offlineUpdateCipher({ cipher, collectionIds })
          notify(
            "success",
            `${translate("success.cipher_updated")} ${translate("success.will_sync_when_online")}`,
          )
          return { kind: "ok" }
        }

        // Online
        const cipherEnc = await cipherService.encrypt(cipher)
        const data = new CipherRequest(cipherEnc)
        const res = await cipherStore.updateCipher(id, data, score, collectionIds)
        if (res.kind === "ok") {
          await _offlineUpdateCipher({
            cipher,
            collectionIds,
            isAccepted: true,
            cipherRequest: data,
          })
          !silent && notify("success", translate("success.cipher_updated"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("updateCipher: " + e)
        return { kind: "unknown" }
      }
    }

    // Offline update
    const _offlineUpdateCipher = async (payload: {
      cipher: CipherView
      collectionIds: string[]
      isAccepted?: boolean
      cipherRequest?: CipherRequest
    }) => {
      const { cipher, collectionIds, isAccepted, cipherRequest } = payload

      const userId = await userService.getUserId()
      const key = `ciphers_${userId}`
      const res = (await storageService.get(key)) || {}

      const cipherEnc = await cipherService.encrypt(cipher)
      const data = cipherRequest || new CipherRequest(cipherEnc)
      const revisionDate = new Date()

      res[cipher.id] = {
        ...res[cipher.id],
        ...data,
        collectionIds,
        revisionDate: revisionDate.toISOString(),
      }
      await storageService.save(key, res)
      if (!isAccepted) {
        cipherStore.addNotSync(cipher.id)
      }

      // Update cache
      cipher.collectionIds = collectionIds
      cipher.revisionDate = revisionDate
      await minimalReloadCache({ cipher })
    }

    // Delete
    const deleteCiphers = async (ids: string[]) => {
      if (!ids.length) {
        return { kind: "ok" }
      }
      try {
        // Offline
        if (uiStore.isOffline) {
          await _offlineDeleteCiphers(ids)
          notify("success", `${translate("success.cipher_deleted")}`)
          return { kind: "ok" }
        }

        // Online
        const res = await cipherStore.deleteCiphers(ids)
        if (res.kind === "ok") {
          await _offlineDeleteCiphers(ids, true)
          notify("success", translate("success.cipher_deleted"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("deleteCiphers: " + e)
        return { kind: "unknown" }
      }
    }

    // Offline delete
    const _offlineDeleteCiphers = async (ids: string[], isAccepted?: boolean) => {
      if (!ids.length) {
        return
      }
      await cipherService.delete(ids)
      ids.forEach((id) => {
        if (!isAccepted) {
          cipherStore.removeNotSync(id)
        }
      })
      minimalReloadCache({})
    }

    // To trash
    const toTrashCiphers = async (ids: string[]) => {
      if (!ids.length) {
        return { kind: "ok" }
      }
      try {
        // Offline
        if (uiStore.isOffline) {
          await _offlineToTrashCiphers(ids)
          notify(
            "success",
            `${translate("success.cipher_trashed")} ${translate("success.will_sync_when_online")}`,
          )
          return { kind: "ok" }
        }

        // Online
        const res = await cipherStore.toTrashCiphers(ids)
        if (res.kind === "ok") {
          await _offlineToTrashCiphers(ids, true)
          notify("success", translate("success.cipher_trashed"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("toTrashCiphers: " + e)
        return { kind: "unknown" }
      }
    }

    // Offline to trash
    const _offlineToTrashCiphers = async (ids: string[], isAccepted?: boolean) => {
      if (!ids.length) {
        return
      }
      await cipherService.softDelete(ids)
      ids.forEach((id) => {
        if (!isAccepted) {
          cipherStore.addNotSync(id)
        }
      })
      await minimalReloadCache({})
    }

    // Restore
    const restoreCiphers = async (ids: string[]) => {
      if (!ids.length) {
        return { kind: "ok" }
      }

      // Offline
      if (uiStore.isOffline) {
        await _offlineRestoreCiphers(ids)
        notify(
          "success",
          `${translate("success.cipher_restored")} ${translate("success.will_sync_when_online")}`,
        )
        return { kind: "ok" }
      }

      // Online
      try {
        const res = await cipherStore.restoreCiphers(ids)
        if (res.kind === "ok") {
          await _offlineRestoreCiphers(ids, true)
          notify("success", translate("success.cipher_restored"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("restoreCiphers: " + e)
        return { kind: "unknown" }
      }
    }

    // Offline restore
    const _offlineRestoreCiphers = async (ids: string[], isAccepted?: boolean) => {
      if (!ids.length) {
        return
      }
      await cipherService.restore(
        ids.map((id) => ({
          id,
          revisionDate: new Date().toISOString(),
        })),
      )

      ids.forEach((id) => {
        if (!isAccepted) {
          cipherStore.addNotSync(id)
        }
      })
      await minimalReloadCache({})
    }

    // Change master password
    const inviteEA = async (
      email: string,
      type: EmergencyAccessType,
      waitTime: number,
    ): Promise<{ kind: string }> => {
      try {
        const publicKeyRes = await cipherStore.getSharingPublicKey(email)
        if (publicKeyRes.kind !== "ok") return { kind: "bad-data" }

        const encKey = await cryptoService.getEncKey()
        const key = await _generateMemberKey(publicKeyRes.data.public_key, encKey)
        const res = await user.inviteEA(email, key, type, waitTime)
        if (res.kind !== "ok") {
          if (res.kind === "bad-data") {
            const errorData: {
              email?: string[]
              code: string
              message?: string
            } = res.data
            if (errorData.code === "0004") {
              return { kind: "exist-data" }
            }
          }
          return { kind: "bad-data" }
        }
        return { kind: "ok" }
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        return { kind: "bad-data" }
      }
    }

    const _shareFolderToGroups = async (
      orgKey: SymmetricCryptoKey,
      groups: { id: string; name: string }[],
    ) => {
      return await Promise.all(
        groups.map(async (group) => {
          const groupMemberRes = await enterpriseStore.getListGroupMembers(group.id)
          if (groupMemberRes.kind !== "ok") {
            return null
          }
          const members = await Promise.all(
            groupMemberRes.data.members
              ?.filter((e) => e.email !== user.email)
              ?.map(async (member) => {
                return {
                  username: member.email,
                  key: member.public_key
                    ? await _generateMemberKey(member.public_key, orgKey)
                    : null,
                }
              }),
          )
          return {
            id: group.id,
            role: "member",
            members,
          }
        }),
      )
    }

    // Share cipher
    const shareCipher = async (
      cipher: CipherView,
      emails: string[],
      role: AccountRoleText,
      autofillOnly: boolean,
      groups?: { id: string; name: string }[],
    ) => {
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
        const members = await Promise.all(
          emails.map(async (email) => {
            const publicKeyRes = await cipherStore.getSharingPublicKey(email)
            let publicKey = ""
            if (publicKeyRes.kind === "ok") {
              publicKey = publicKeyRes.data.public_key
            }
            return {
              username: email,
              role,
              hide_passwords: autofillOnly,
              key: publicKey ? await _generateMemberKey(publicKey, orgKey) : null,
            }
          }),
        )

        // prepare for share to groups
        let groupsPayload = []
        if (groups) {
          groupsPayload = await _shareFolderToGroups(orgKey, groups)
        }
        // Send API
        const res = await cipherStore.shareCipher({
          members,
          cipher: {
            id: cipher.id,
            ...data,
          },
          sharing_key: shareKey ? shareKey[0].encryptedString : null,
          groups: groupsPayload,
        })
        if (res.kind === "ok") {
          notify("success", translate("success.cipher_shared"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("shareCipher: " + e)
        return { kind: "unknown" }
      }
    }

    const _generateMemberKey = async (publicKey: string, orgKey: SymmetricCryptoKey) => {
      const pk = Utils.fromB64ToArray(publicKey)
      const key = await cryptoService.rsaEncrypt(orgKey.key, pk.buffer)
      return key.encryptedString
    }

    // -------------------------------------------------------
    // Share multiple ciphers
    const shareMultipleCiphers = async (
      ids: string[],
      emails: string[],
      role: AccountRoleText,
      autofillOnly: boolean,
      groups?: { id: string; name: string }[],
    ) => {
      if (!ids.length) {
        return { kind: "ok" }
      }
      const ciphers =
        (await getCiphers({
          deleted: false,
          searchText: "",
          filters: [(c: CipherView) => ids.includes(c.id)],
        })) || []
      if (!ciphers.length || ciphers.length > MAX_MULTIPLE_SHARE_COUNT) {
        return { kind: "ok" }
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
          groups?: {
            id: string
            role: string
            members: {
              username: string
              key: string
            }[]
          }[]
        }[] = []

        // Prepare org key
        const shareKey: [EncString, SymmetricCryptoKey] = await cryptoService.makeShareKey()
        const orgKey: SymmetricCryptoKey = shareKey[1]

        // Get public keys
        const members = await Promise.all(
          emails.map(async (email) => {
            const publicKeyRes = await cipherStore.getSharingPublicKey(email)
            let publicKey = ""
            if (publicKeyRes.kind === "ok") {
              publicKey = publicKeyRes.data.public_key
            }
            return {
              email,
              publicKey,
              username: email,
              role,
              hide_passwords: autofillOnly,
              key: publicKey ? await _generateMemberKey(publicKey, orgKey) : null,
            }
          }),
        )

        // Prepare cipher
        const prepareCipher = async (c: CipherView) => {
          let _orgKey = orgKey
          if (c.organizationId) {
            _orgKey = await cryptoService.getOrgKey(c.organizationId)
          }
          const cipherEnc = await cipherService.encrypt(c, _orgKey)
          const data = new CipherRequest(cipherEnc)
          const mem = await Promise.all(
            members.map(async (m) => {
              return {
                username: m.email,
                role,
                hide_passwords: autofillOnly,
                key: m.publicKey ? await _generateMemberKey(m.publicKey, _orgKey) : null,
              }
            }),
          )

          // prepare for share to groups
          let groupsPayload = []
          if (groups) {
            groupsPayload = await _shareFolderToGroups(_orgKey, groups)
          }

          sharedCiphers.push({
            cipher: {
              id: c.id,
              ...data,
            },
            members: mem,
            groups: groupsPayload,
          })
        }

        await Promise.all(ciphers.map(prepareCipher))

        // Send API
        const res = await cipherStore.shareMultipleCiphers({
          ciphers: sharedCiphers,
          sharing_key: shareKey ? shareKey[0].encryptedString : null,
        })
        if (res.kind === "ok") {
          notify("success", translate("success.cipher_shared"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("shareMultipleCiphers: " + e)
        return { kind: "unknown" }
      }
    }

    // Confirm share cipher
    const confirmShareCipher = async (
      organizationId: string,
      memberId: string,
      publicKey: string,
    ) => {
      try {
        const key = await _generateOrgKey(organizationId, publicKey)
        const res = await cipherStore.confirmShareCipher(organizationId, memberId, { key })
        if (res.kind === "ok") {
          notify("success", translate("success.done"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("confirmShareCipher: " + e)
        return { kind: "unknown" }
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
        const personalKey = await cryptoService.getEncKey()
        const cipherEnc = await cipherService.encrypt(cipher, personalKey)
        const data = new CipherRequest(cipherEnc)

        // Send API
        const res = await cipherStore.stopShareCipher(cipher.organizationId, memberId, {
          cipher: {
            id: cipher.id,
            ...data,
          },
        })
        if (res.kind === "ok") {
          notify("success", translate("success.done"))

          // Remove member in local my share first
          const myShares = [...cipherStore.myShares]
          for (const share of myShares) {
            if (share.id === cipher.organizationId) {
              share.members = share.members.filter((m) => m.id !== memberId)
            }
          }
          cipherStore.setMyShares(myShares)
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("stopShareCipher: " + e)
        return { kind: "unknown" }
      }
    }

    // Edit share cipher
    const editShareCipher = async (
      organizationId: string,
      itemId: string,
      role: AccountRoleText,
      onlyFill: boolean,
      isGroup?: boolean,
    ) => {
      try {
        // Send API
        let res
        if (!isGroup) {
          res = await cipherStore.editShareCipher(organizationId, itemId, {
            role,
            hide_passwords: onlyFill,
          })
        } else {
          res = await enterpriseStore.editShareCipher(organizationId, itemId, {
            role,
          })
        }

        if (res.kind === "ok") {
          notify("success", translate("success.done"))

          // Update member in local my share first
          const myShares = [...cipherStore.myShares]
          for (const share of myShares) {
            if (share.id === organizationId) {
              for (const member of share.members) {
                if (member.id === itemId) {
                  member.role = role
                  member.hide_passwords = onlyFill
                }
              }
              // for (const group of share.groups) {
              //   if (group.id === itemId) {
              //     group.role = role
              //   }
              // }
            }
          }
          cipherStore.setMyShares(myShares)
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("editShareCipher: " + e)
        return { kind: "unknown" }
      }
    }

    // Leave share
    const leaveShare = async (organizationId: string, id?: string) => {
      const apiRes = await cipherStore.leaveShare(organizationId)
      if (apiRes.kind !== "ok") {
        notifyApiError(apiRes)
        return apiRes
      }
      if (id) {
        await cipherService.delete(id)
      }
      await minimalReloadCache({})
      cipherStore.setOrganizations(cipherStore.organizations.filter((o) => o.id !== organizationId))
      return apiRes
    }

    // Accept share invitation
    const acceptShareInvitation = async (id: string) => {
      const res = await cipherStore.respondShare(id, true)
      if (res.kind === "ok") {
        notify("success", translate("success.share_invitaion_accepted"))
        cipherStore.setSharingInvitations(cipherStore.sharingInvitations.filter((i) => i.id !== id))
      } else {
        notifyApiError(res)
      }
      return res
    }

    // Reject share invitation
    const rejectShareInvitation = async (id: string) => {
      const res = await cipherStore.respondShare(id, false)
      if (res.kind === "ok") {
        notify("success", translate("success.done"))
        cipherStore.setSharingInvitations(cipherStore.sharingInvitations.filter((i) => i.id !== id))
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
          notify(
            "success",
            `${translate("folder.folder_created")} ${translate("success.will_sync_when_online")}`,
          )
          return { kind: "ok" }
        }

        // Online
        const folderEnc = await folderService.encrypt(folder)
        const payload = new FolderRequest(folderEnc)
        const res = await folderStore.createFolder(payload)
        if (res.kind === "ok") {
          await _offlineCreateFolder({
            folder,
            folderRequest: payload,
            folderId: res.data.id,
          })
          notify("success", translate("folder.folder_created"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("createFolder: " + e)
        return { kind: "unknown" }
      }
    }

    // Offline create folder
    const _offlineCreateFolder = async (payload: {
      folder: FolderView
      folderRequest?: FolderRequest
      folderId?: string
    }) => {
      const { folder, folderRequest, folderId } = payload

      const userId = await userService.getUserId()
      const key = `folders_${userId}`
      const res = (await storageService.get(key)) || {}

      const folderEnc = await folderService.encrypt(folder)
      const data = folderRequest || new FolderRequest(folderEnc)
      const tempId = TEMP_PREFIX + randomString()
      const finalId = folderId || tempId

      res[finalId] = {
        ...data,
        userId,
        id: finalId,
      }
      await storageService.save(key, res)
      if (!folderId) {
        folderStore.addNotSync(finalId)
      }
      await reloadCache({ notCipher: true })
    }

    // Update folder
    const updateFolder = async (folder: FolderView) => {
      try {
        // Offline
        if (uiStore.isOffline) {
          await _offlineUpdateFolder({ folder })
          notify(
            "success",
            `${translate("folder.folder_updated")} ${translate("success.will_sync_when_online")}`,
          )
          return { kind: "ok" }
        }

        // Online
        const folderEnc = await folderService.encrypt(folder)
        const payload = new FolderRequest(folderEnc)
        const res = await folderStore.updateFolder(folder.id, payload)
        if (res.kind === "ok") {
          await _offlineUpdateFolder({
            folder,
            isAccepted: true,
            folderRequest: payload,
          })
          notify("success", translate("folder.folder_updated"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("updateFolder: " + e)
        return { kind: "unknown" }
      }
    }

    // Offline update folder
    const _offlineUpdateFolder = async (payload: {
      folder: FolderView
      isAccepted?: boolean
      folderRequest?: FolderRequest
    }) => {
      const { folder, isAccepted, folderRequest } = payload

      const userId = await userService.getUserId()
      const key = `folders_${userId}`
      const res = (await storageService.get(key)) || {}

      const folderEnc = await folderService.encrypt(folder)
      const data = folderRequest || new FolderRequest(folderEnc)

      res[folder.id] = {
        ...res[folder.id],
        ...data,
      }
      await storageService.save(key, res)
      if (!isAccepted) {
        folderStore.addNotSync(folder.id)
      }
      await reloadCache({ notCipher: true })
    }

    // Delete folder
    const deleteFolder = async (id: string) => {
      try {
        // Offline
        if (uiStore.isOffline) {
          await _offlineDeleteFolder(id)
          notify("success", translate("folder.folder_deleted"))
          return { kind: "ok" }
        }

        // Online
        const res = await folderStore.deleteFolder(id)
        if (res.kind === "ok") {
          await _offlineDeleteFolder(id, true)
          notify("success", translate("folder.folder_deleted"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("deleteFolder: " + e)
        return { kind: "unknown" }
      }
    }

    // Offline delete folder
    const _offlineDeleteFolder = async (id: string, isAccepted?: boolean) => {
      const userId = await userService.getUserId()
      const key = `folders_${userId}`
      const res = (await storageService.get(key)) || {}

      delete res[id]
      if (!isAccepted) {
        folderStore.removeNotSync(id)
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
          return { kind: "unknown" }
        }

        // Online
        const collectionEnc = await collectionService.encrypt(collection)
        const payload = new CollectionRequest(collectionEnc)
        const res = await collectionStore.createCollection(collection.organizationId, payload)

        if (res.kind === "ok") {
          await _offlineCreateCollection({
            collection,
            collectionRequest: payload,
            collectionId: res.data.id,
          })
          notify("success", translate("folder.folder_created"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("createCollection: " + e)
        return { kind: "unknown" }
      }
    }

    // Offline create collection
    const _offlineCreateCollection = async (payload: {
      collection: CollectionView
      collectionRequest?: CollectionRequest
      collectionId?: string
    }) => {
      const { collection, collectionId, collectionRequest } = payload

      const userId = await userService.getUserId()
      const key = `collections_${userId}`
      const res = (await storageService.get(key)) || {}

      const collectionEnc = await collectionService.encrypt(collection)
      const data = collectionRequest || new CollectionRequest(collectionEnc)
      const tempId = TEMP_PREFIX + randomString()
      const finalId = collectionId || tempId

      res[finalId] = {
        ...data,
        userId,
        id: finalId,
      }
      await storageService.save(key, res)
      if (!collectionId) {
        collectionStore.addNotSync(finalId)
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
          return { kind: "unknown" }
        }

        // Online
        const collectionEnc = await collectionService.encrypt(collection)
        const payload = new CollectionRequest(collectionEnc)
        const res = await collectionStore.updateCollection(
          collection.id,
          collection.organizationId,
          payload,
        )

        if (res.kind === "ok") {
          await _offlineUpdateCollection({
            collection,
            isAccepted: true,
            collectionRequest: payload,
          })
          notify("success", translate("folder.folder_updated"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("updateCollection: " + e)
        return { kind: "unknown" }
      }
    }

    // Offline Update collection
    const _offlineUpdateCollection = async (payload: {
      collection: CollectionView
      isAccepted?: boolean
      collectionRequest?: CollectionRequest
    }) => {
      const { collection, isAccepted, collectionRequest } = payload

      const userId = await userService.getUserId()
      const key = `collections_${userId}`
      const res = (await storageService.get(key)) || {}

      const collectionEnc = await collectionService.encrypt(collection)
      const data = collectionRequest || new CollectionRequest(collectionEnc)

      res[collection.id] = {
        ...res[collection.id],
        ...data,
      }
      await storageService.save(key, res)
      if (!isAccepted) {
        collectionStore.addNotSync(collection.id)
      }
      await reloadCache({ notCipher: true })
    }

    // Delete collection
    const deleteCollection = async (collection: CollectionView) => {
      try {
        // Offline
        if (uiStore.isOffline) {
          await _offlineDeleteCollection(collection.id)
          notify("success", translate("folder.folder_deleted"))
          return { kind: "ok" }
        }

        const personalKey = await cryptoService.getEncKey()
        const ciphers: CipherView[] =
          (await getCiphers({
            deleted: false,
            searchText: "",
            filters: [(c: CipherView) => c.collectionIds.includes(collection.id)],
          })) || []

        const data = []

        const prepareCipher = async (c: CipherView) => {
          const cipherEnc = await cipherService.encrypt(c, personalKey)
          const requestData = new CipherRequest(cipherEnc)
          data.push({
            id: c.id,
            ...requestData,
          })
        }
        await Promise.all(ciphers.map(prepareCipher))

        // Prepare folder name
        const folderNameEnc = await cryptoService.encrypt(collection.name, personalKey)

        const res = await collectionStore.deleteCollection(
          collection.id,
          collection.organizationId,
          {
            folder: {
              id: collection.id,
              name: folderNameEnc.encryptedString,
              ciphers: data,
            },
          },
        )
        if (res.kind === "ok") {
          await _offlineDeleteCollection(collection.id, true)
          notify("success", translate("folder.folder_deleted"))
        } else {
          notifyApiError(res)
        }
        return res
      } catch (e) {
        notify("error", translate("error.something_went_wrong"))
        Logger.error("deleteCollection: " + e)
        return { kind: "unknown" }
      }
    }

    // Offline delete collection
    const _offlineDeleteCollection = async (id: string, isAccepted?: boolean) => {
      const userId = await userService.getUserId()
      const key = `collections_${userId}`
      const res = (await storageService.get(key)) || {}

      delete res[id]
      if (!isAccepted) {
        collectionStore.removeNotSync(id)
      }
      await storageService.save(key, res)
      await reloadCache()
    }

    // --------------------------- MINIMAL SYNC --------------------------------

    // Sync single cipher
    const syncSingleCipher = async (id: string) => {
      return syncQueue.add(async () => {
        const cipherRes = await cipherStore.getCipher(id)

        // Error/Deleted
        if (cipherRes.kind !== "ok") {
          if (cipherRes.kind === "not-found" || cipherRes.kind === "forbidden") {
            await _offlineDeleteCiphers([id], true)
            cipherStore.setLastSync()
          } else {
            notifyApiError(cipherRes)
            return cipherRes
          }
          return cipherRes
        }
        cipherStore.setLastSync()

        // Create/Update
        const userId = await userService.getUserId()
        const key = `ciphers_${userId}`
        const res = (await storageService.get(key)) || {}

        const cipher = cipherRes.data
        const cipherData = new CipherData(cipher, userId, cipher.collectionIds)

        // Update cipher
        res[cipher.id] = {
          ...cipherData,
        }
        cipherStore.removeNotUpdate(cipher.id)

        // Remove temporary cipher
        for (const _id of Object.keys(res)) {
          if (
            _id.startsWith(TEMP_PREFIX) &&
            res[_id].name === cipher.name &&
            res[_id].type === cipher.type
          ) {
            delete res[_id]
            cipherStore.removeNotUpdate(_id)
            cipherService.csDeleteFromDecryptedCache([_id])
            break
          }
        }

        // Sync profile
        if (cipher.organizationId) {
          // await syncSingleOrganization(cipher.organizationId)
          await syncProfile()
        }

        await storageService.save(key, res)

        // Decrypt and minimal reload cache
        const c = new Cipher(cipherData, false)
        const hasKey = await cryptoService.hasKey()
        if (hasKey) {
          await minimalReloadCache({
            cipher: await c.decrypt(),
          })
        } else {
          await reloadCache()
        }
        return cipherRes
      })
    }

    // Sync single folder
    const syncSingleFolder = async (id: string) => {
      return syncQueue.add(async () => {
        const folderRes = await folderStore.getFolder(id)

        // Error/Deleted
        if (folderRes.kind !== "ok") {
          if (folderRes.kind === "not-found") {
            await _offlineDeleteFolder(id, true)
            cipherStore.setLastSync()
          } else {
            notifyApiError(folderRes)
          }
          return folderRes
        }

        cipherStore.setLastSync()

        const userId = await userService.getUserId()
        const key = `folders_${userId}`
        const res = (await storageService.get(key)) || {}

        const folder = folderRes.data
        const folderData = new FolderData(folder, userId)

        // Update folder
        res[folder.id] = {
          ...folderData,
        }
        folderStore.removeNotUpdate(folder.id)

        // Remove temporary folder
        for (const _id of Object.keys(res)) {
          if (_id.startsWith(TEMP_PREFIX) && res[_id].name === folder.name) {
            delete res[_id]
            folderStore.removeNotUpdate(_id)
            break
          }
        }

        await storageService.save(key, res)
        await reloadCache({ notCipher: true })
        return folderRes
      })
    }

    // Sync single organization
    // TODO: not used
    const syncSingleOrganization = async (id: string) => {
      const userId = await userService.getUserId()
      const key = `organizations_${userId}`
      const res = (await storageService.get(key)) || {}

      const orgRes = await cipherStore.getOrganization(id)
      if (orgRes.kind !== "ok") {
        if (orgRes.kind === "not-found" || orgRes.kind === "forbidden") {
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
          ...orgData,
        }
      }

      await storageService.save(key, res)
      return orgRes
    }

    // Sync profile (nested use only --> no need to add to queue)
    const syncProfile = async () => {
      const res = await cipherStore.getProfile()
      if (res.kind === "ok") {
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
      getCiphersFromCache,
      getEncryptedCiphers,
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

      getEncKeyFromDecryptedKey,
      inviteEA,
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
      syncProfile,

      createRandomPasswords,
    }

    return (
      <CipherDataMixinsContext.Provider value={data}>
        {props.children}
      </CipherDataMixinsContext.Provider>
    )
  },
)

export const useCipherDataMixins = () => useContext(CipherDataMixinsContext)
