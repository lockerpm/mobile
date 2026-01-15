import { Instance, SnapshotIn, SnapshotOut, cast, types } from "mobx-state-tree"

import { cipherApi } from "app/services/api/cipherApi"
import {
  ConfirmShareCipherData,
  EditShareCipherData,
  ImportCipherData,
  ImportCipherWithFolderData,
  ImportFolderData,
  MoveFolderData,
  MyShareType,
  ShareCipherData,
  ShareMultipleCiphersData,
  SharingInvitationType,
  SharingStatus,
  StopShareCipherData,
} from "app/static/types"
import { Organization } from "core/models/domain/organization"
import { CipherRequest } from "core/models/request/cipherRequest"
import { SendRequest } from "core/models/request/sendRequest"
import { CipherView } from "core/models/view/cipherView"

import Config from "@/config"

import { withSetPropAction } from "../helpers/withSetPropAction"

/**
 * Model description here for TypeScript hints.
 */
export const CipherStoreModel = types
  .model("CipherStore")
  .props({
    apiToken: types.string,

    // Status
    isSynching: types.boolean,
    isSynchingOffline: types.boolean,
    isSynchingAutofill: types.boolean,
    isBatchDecrypting: types.boolean,

    // Data
    notSynchedCiphers: types.array(types.string), // Create in offline mode
    notUpdatedCiphers: types.array(types.string), // Create in online mode but somehow not update yet
    lastSync: types.number,
    lastSyncQuickShare: types.number,
    lastCacheUpdate: types.number,
    sharingInvitations: types.array(types.frozen<SharingInvitationType>()),
    myShares: types.array(types.frozen<MyShareType>()),
    organizations: types.array(types.frozen<Organization>()),

    // Selector
    generatedPassword: types.string,
    selectedTotp: types.string,
    selectedCipher: types.maybeNull(types.frozen()),
    selectedFolder: types.string,
    selectedCollection: types.string,
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get cipherView() {
      return self.selectedCipher || new CipherView()
    },
    get sharingInvitationsIgnoreAccept() {
      return self.sharingInvitations.filter((i) => i.status !== SharingStatus.ACCEPTED)
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setApiToken: (token: string) => {
      self.apiToken = token
    },

    // ----------------- CACHE -------------------

    setGeneratedPassword: (password: string) => {
      self.generatedPassword = password
    },

    setSelectedCipher: (cipher: CipherView) => {
      self.selectedCipher = cipher
    },

    setSelectedFolder: (folderId: string) => {
      self.selectedFolder = folderId
    },

    setSelectedTotp: (totp: string) => {
      self.selectedTotp = totp
    },

    setSelectedCollection: (collectionId: string) => {
      self.selectedCollection = collectionId
    },

    setIsSynching: (val: boolean) => {
      self.isSynching = val
    },

    setIsSynchingOffline: (val: boolean) => {
      self.isSynchingOffline = val
    },

    setIsSynchingAutofill: (val: boolean) => {
      self.isSynchingAutofill = val
    },

    setIsBatchDecrypting: (val: boolean) => {
      self.isBatchDecrypting = val
    },

    setLastSync: (val?: number) => {
      self.lastSync = Math.max(val || Date.now(), self.lastSync)
    },

    setLastSyncQuickShare: (val?: number) => {
      self.lastSyncQuickShare = Math.max(val || Date.now(), self.lastSyncQuickShare)
    },

    setLastCacheUpdate: () => {
      self.lastCacheUpdate = Date.now()
    },

    addNotSync: (id: string) => {
      if (!self.notSynchedCiphers.includes(id)) {
        self.notSynchedCiphers.push(id)
      }
    },

    removeNotSync: (id: string) => {
      if (!self.notSynchedCiphers.includes(id)) {
        self.notSynchedCiphers = cast(self.notSynchedCiphers.filter((i) => i !== id))
      }
    },

    clearNotSync: () => {
      self.notSynchedCiphers = cast([])
    },

    addNotUpdate: (id: string) => {
      if (!self.notUpdatedCiphers.includes(id)) {
        self.notUpdatedCiphers.push(id)
      }
    },

    removeNotUpdate: (id: string) => {
      if (self.notUpdatedCiphers.includes(id)) {
        self.notUpdatedCiphers = cast(self.notUpdatedCiphers.filter((i) => i !== id))
      }
    },

    clearNotUpdate: () => {
      self.notUpdatedCiphers = cast([])
    },

    clearStore: (dataOnly?: boolean) => {
      if (!dataOnly) {
        self.apiToken = ""
      }

      // Status
      self.isSynching = false
      self.isSynchingOffline = false
      self.isSynchingAutofill = false
      self.isBatchDecrypting = false

      // Data
      self.notUpdatedCiphers = cast([])
      self.lastSync = 0
      self.lastSyncQuickShare = 0
      self.lastCacheUpdate = 0
      self.sharingInvitations = cast([])
      self.myShares = cast([])
      self.organizations = cast([])
      // Selector
      self.generatedPassword = ""
      self.selectedTotp = ""
      self.selectedCipher = null
      self.selectedFolder = ""
      self.selectedCollection = ""
    },

    lock: () => {
      self.generatedPassword = ""
      self.selectedCipher = null
      self.selectedFolder = ""
      self.selectedCollection = ""
    },

    setSharingInvitations: (data: SharingInvitationType[]) => {
      self.sharingInvitations = cast(data)
    },

    setMyShares: (data: MyShareType[]) => {
      self.myShares = cast(data)
    },

    setOrganizations: (data: Organization[]) => {
      self.organizations = cast(data)
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    syncData: async (page?: number, size?: number) => {
      const res = await cipherApi.syncData(self.apiToken, page, size)
      return res
    },

    getCipher: async (id: string) => {
      const res = await cipherApi.getCipher(self.apiToken, id)
      return res
    },

    createCipher: async (data: CipherRequest, score: number, collectionIds: string[]) => {
      const res = await cipherApi.postCipher(self.apiToken, data, score, collectionIds)
      return res
    },

    importCipherWithFolder: async (data: ImportCipherWithFolderData) => {
      const res = await cipherApi.importCipherWithFolder(self.apiToken, data)
      return res
    },

    importFolders: async (data: ImportFolderData) => {
      const res = await cipherApi.importFolders(self.apiToken, data)
      return res
    },

    importCiphers: async (data: ImportCipherData) => {
      const res = await cipherApi.importCiphers(self.apiToken, data)
      return res
    },

    offlineSyncCipher: async (data: ImportCipherWithFolderData) => {
      const res = await cipherApi.offlineSyncCipher(self.apiToken, data)
      return res
    },

    updateCipher: async (
      id: string,
      data: CipherRequest,
      score: number,
      collectionIds: string[]
    ) => {
      const res = await cipherApi.putCipher(self.apiToken, id, data, score, collectionIds)
      return res
    },

    shareCipherToTeam: async (
      id: string,
      data: CipherRequest,
      score: number,
      collectionIds: string[]
    ) => {
      const res = await cipherApi.shareCipherToTeam(self.apiToken, id, data, score, collectionIds)
      return res
    },

    toTrashCiphers: async (ids: string[]) => {
      const res = await cipherApi.toTrashCiphers(self.apiToken, ids)
      return res
    },

    deleteCiphers: async (ids: string[]) => {
      const res = await cipherApi.deleteCiphers(self.apiToken, ids)
      return res
    },

    restoreCiphers: async (ids: string[]) => {
      const res = await cipherApi.restoresCiphers(self.apiToken, ids)
      return res
    },

    moveToFolder: async (data: MoveFolderData) => {
      const res = await cipherApi.moveToFolder(self.apiToken, data)
      return res
    },

    getLastUpdate: async () => {
      const res = await cipherApi.getLastUpdate(self.apiToken)
      return res
    },

    getSharingPublicKey: async (email: string) => {
      const res = await cipherApi.getSharingPublicKey(self.apiToken, { email })
      return res
    },

    shareCipher: async (payload: ShareCipherData) => {
      const res = await cipherApi.shareCipher(self.apiToken, payload)
      return res
    },

    shareMultipleCiphers: async (payload: ShareMultipleCiphersData) => {
      const res = await cipherApi.shareMultipleCiphers(self.apiToken, payload)
      return res
    },

    stopShareCipher: async (
      organizationId: string,
      memberId: string,
      payload: StopShareCipherData
    ) => {
      const res = await cipherApi.stopShareCipher(self.apiToken, organizationId, memberId, payload)
      return res
    },

    stopShareCipherForGroup: async (organizationId: string, payload: StopShareCipherData) => {
      const res = await cipherApi.stopShareCipherForGroup(self.apiToken, organizationId, payload)
      return res
    },

    editShareCipher: async (
      organizationId: string,
      memberId: string,
      payload: EditShareCipherData
    ) => {
      const res = await cipherApi.editShareCipher(self.apiToken, organizationId, memberId, payload)
      return res
    },

    confirmShareCipher: async (
      organizationId: string,
      memberId: string,
      payload: ConfirmShareCipherData
    ) => {
      const res = await cipherApi.confirmShareCipher(
        self.apiToken,
        organizationId,
        memberId,
        payload
      )
      return res
    },

    loadSharingInvitations: async () => {
      const res = await cipherApi.getSharingInvitations(self.apiToken)
      if (res.kind === "ok") {
        self.setSharingInvitations(res.data)
      }
      return res
    },

    loadMyShares: async () => {
      const res = await cipherApi.getMyShares(self.apiToken)
      if (res.kind === "ok") {
        self.setMyShares(res.data)
      }
      return res
    },

    leaveShare: async (organizationId: string) => {
      const res = await cipherApi.leaveShare(self.apiToken, organizationId)
      return res
    },

    respondShare: async (id: string, accepted: boolean) => {
      const res = await cipherApi.respondShareInvitation(self.apiToken, id, {
        status: accepted ? "accept" : "reject",
      })
      return res
    },

    getProfile: async () => {
      const res = await cipherApi.getPMProfile(self.apiToken)
      return res
    },

    getOrganization: async (id: string) => {
      const res = await cipherApi.getOrganization(self.apiToken, id)
      return res
    },

    // ----------QUICK SHARE--------------------

    quickShare: async (sendRequest: SendRequest) => {
      const res = await cipherApi.quickShare(self.apiToken, sendRequest)
      return res
    },
    syncQuickShares: async (page: number) => {
      const res = await cipherApi.syncQuickShares(self.apiToken, page)
      if (res.kind === "ok") {
        return res.data
      }
      return []
    },

    getPublicShareUrl: (accessId: string, key: any) => {
      return `${Config.QUICK_SHARE_BASE_URL}/quick-shares/${accessId}#${encodeURIComponent(key)}`
    },

    stopQuickSharing: async (send: any) => {
      const res = await cipherApi.stopQuickSharing(self.apiToken, send.id)
      return res
    },
    // ---------------------QUICK SHARE----------------------------
  }))
  .postProcessSnapshot((snapShot) => {
    return {
      ...snapShot,
      generatedPassword: "",
      selectedCipher: null,
      selectedFolder: "",
      selectedCollection: "",
      isSynching: false,
      isSynchingOffline: false,
      isSynchingAutofill: false,
      isBatchDecrypting: false,
    }
  })

export interface CipherStore extends Instance<typeof CipherStoreModel> {}
export interface CipherStoreSnapshotOut extends SnapshotOut<typeof CipherStoreModel> {}
export interface CipherStoreSnapshotIn extends SnapshotIn<typeof CipherStoreModel> {}
export const createCipherStoreDefaultModel = () =>
  types.optional(CipherStoreModel, {
    apiToken: "",

    // Status
    isSynching: false,
    isSynchingOffline: false,
    isSynchingAutofill: false,
    isBatchDecrypting: false,

    // Data
    notSynchedCiphers: [], // Create in offline mode
    notUpdatedCiphers: [], // Create in online mode but somehow not update yet
    lastSync: 0,
    lastSyncQuickShare: 0,
    lastCacheUpdate: 0,
    sharingInvitations: [],
    myShares: [],
    organizations: [],

    // Selector
    generatedPassword: "",
    selectedTotp: "",
    selectedCipher: null,
    selectedFolder: "",
    selectedCollection: "",
  })
