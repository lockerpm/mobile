import { cast, Instance, SnapshotOut, types } from "mobx-state-tree"
import { omit } from "ramda"
import { Organization } from "../../../core/models/domain/organization"
import { CipherRequest } from "../../../core/models/request/cipherRequest"
import { CipherView } from "../../../core/models/view"
import { ConfirmShareCipherData, EditShareCipherData, ImportCipherData, MoveFolderData, MyShareType, ShareCipherData, ShareMultipleCiphersData, SharingInvitationType, StopShareCipherData } from "../../services/api"
import { CipherApi } from "../../services/api/cipher-api"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const CipherStoreModel = types
  .model("CipherStore")
  .props({
    apiToken: types.maybeNull(types.string),

    // Status
    isSynching: types.maybeNull(types.boolean),
    isSynchingOffline: types.maybeNull(types.boolean),
    isSynchingAutofill: types.maybeNull(types.boolean),

    // Data
    notSynchedCiphers: types.array(types.string),         // Create in offline mode
    notUpdatedCiphers: types.array(types.string),         // Create in online mode but somehow not update yet
    lastSync: types.maybeNull(types.number),
    lastCacheUpdate: types.maybeNull(types.number),
    sharingInvitations: types.array(types.frozen<SharingInvitationType>()),
    myShares: types.array(types.frozen<MyShareType>()),
    organizations: types.array(types.frozen<Organization>()),

    // Selector
    generatedPassword: types.maybeNull(types.string),
    selectedCipher: types.maybeNull(types.frozen()),
    selectedFolder: types.maybeNull(types.string)
  })
  .extend(withEnvironment)
  .views((self) => ({
    get cipherView() {
      return self.selectedCipher || new CipherView()
    }
  }))
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

    setIsSynching: (val: boolean) => {
      self.isSynching = val
    },

    setIsSynchingOffline: (val: boolean) => {
      self.isSynchingOffline = val
    },

    setIsSynchingAutofill: (val: boolean) => {
      self.isSynchingAutofill = val
    },

    setLastSync: () => {
      self.lastSync = Date.now()
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
        self.notSynchedCiphers = cast(self.notSynchedCiphers.filter(i => i !== id))
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
        self.notUpdatedCiphers = cast(self.notUpdatedCiphers.filter(i => i !== id))
      }
    },

    clearNotUpdate: () => {
      self.notUpdatedCiphers = cast([])
    },

    clearStore: () => {
      self.apiToken = null
      self.generatedPassword = null
      self.selectedCipher = null
      self.selectedFolder = null
      self.notSynchedCiphers = cast([])
      self.notUpdatedCiphers = cast([])
      self.isSynching = false
      self.isSynchingOffline = false
      self.isSynchingAutofill = false
      self.lastSync = null
      self.lastCacheUpdate = null
      self.sharingInvitations = cast([])
      self.myShares = cast([])
      self.organizations = cast([])
    },

    lock: () => {
      self.generatedPassword = null
      self.selectedCipher = null
      self.selectedFolder = null
    },

    setSharingInvitations: (data: SharingInvitationType[]) => {
      self.sharingInvitations = cast(data)
    },

    setMyShares: (data: MyShareType[]) => {
      self.myShares = cast(data)
    },

    setOrganizations: (data: Organization[]) => {
      self.organizations = cast(data)
    }
  }))
  .actions(self => ({
    syncData: async (page?: number, size?: number) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.syncData(self.apiToken, page, size)
      return res
    },

    getCipher: async (id: string) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.getCipher(self.apiToken, id)
      return res
    },

    createCipher: async (data: CipherRequest, score: number, collectionIds: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.postCipher(self.apiToken, data, score, collectionIds)
      return res
    },

    importCipher: async (data: ImportCipherData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.importCipher(self.apiToken, data)
      return res
    },

    offlineSyncCipher: async (data: ImportCipherData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.offlineSyncCipher(self.apiToken, data)
      return res
    },

    updateCipher: async (id: string, data: CipherRequest, score: number, collectionIds: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.putCipher(self.apiToken, id, data, score, collectionIds)
      return res
    },

    shareCipherToTeam: async (id: string, data: CipherRequest, score: number, collectionIds: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.shareCipherToTeam(self.apiToken, id, data, score, collectionIds)
      return res
    },

    toTrashCiphers: async (ids: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.toTrashCiphers(self.apiToken, ids)
      return res
    },

    deleteCiphers: async (ids: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.deleteCiphers(self.apiToken, ids)
      return res
    },

    restoreCiphers: async (ids: string[]) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.restoresCiphers(self.apiToken, ids)
      return res
    },

    moveToFolder: async (data: MoveFolderData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.moveToFolder(self.apiToken, data)
      return res
    },

    getLastUpdate: async () => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.getLastUpdate(self.apiToken)
      return res
    },

    getSharingPublicKey: async (email: string) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.getSharingPublicKey(self.apiToken, { email })
      return res
    },

    shareCipher: async (payload: ShareCipherData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.shareCipher(self.apiToken, payload)
      return res
    },

    shareMultipleCiphers: async (payload: ShareMultipleCiphersData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.shareMultipleCiphers(self.apiToken, payload)
      return res
    },

    stopShareCipher: async (organizationId: string, memberId: string, payload: StopShareCipherData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.stopShareCipher(self.apiToken, organizationId, memberId, payload)
      return res
    },

    editShareCipher: async (organizationId: string, memberId: string, payload: EditShareCipherData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.editShareCipher(self.apiToken, organizationId, memberId, payload)
      return res
    },

    confirmShareCipher: async (organizationId: string, memberId: string, payload: ConfirmShareCipherData) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.confirmShareCipher(self.apiToken, organizationId, memberId, payload)
      return res
    },

    loadSharingInvitations: async () => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.getSharingInvitations(self.apiToken)
      if (res.kind === 'ok') {
        self.setSharingInvitations(res.data)
      }
      return res
    },

    loadMyShares: async () => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.getMyShares(self.apiToken)
      if (res.kind === 'ok') {
        self.setMyShares(res.data)
      }
      return res
    },

    leaveShare: async (organizationId: string) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.leaveShare(self.apiToken, organizationId)
      return res
    },

    respondShare: async (id: string, accepted: boolean) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.respondShareInvitation(self.apiToken, id, {
        status: accepted ? 'accept' : 'reject'
      })
      return res
    },

    getProfile: async () => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.getPMProfile(self.apiToken)
      return res
    },

    getOrganization: async (id: string) => {
      const cipherApi = new CipherApi(self.environment.api)
      const res = await cipherApi.getOrganization(self.apiToken, id)
      return res
    },
  }))
  .postProcessSnapshot(omit([
    'generatedPassword', 
    'selectedCipher',
    'selectedFolder',
    'isSynching',
    'isSynchingOffline',
    'isSynchingAutofill',
    'organizations',
    'lastUpdate'
  ]))

/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type CipherStoreType = Instance<typeof CipherStoreModel>
export interface CipherStore extends CipherStoreType {}
type CipherStoreSnapshotType = SnapshotOut<typeof CipherStoreModel>
export interface CipherStoreSnapshot extends CipherStoreSnapshotType {}
export const createCipherStoreDefaultModel = () => types.optional(CipherStoreModel, {})
