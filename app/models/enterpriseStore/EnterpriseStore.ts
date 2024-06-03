import { Instance, SnapshotIn, SnapshotOut, types } from 'mobx-state-tree'
import { withSetPropAction } from '../helpers/withSetPropAction'
import { enterpriseApi } from 'app/services/api/enterpriseApi'
import { folderApi } from 'app/services/api/folderApi'
import { omit } from 'ramda'
import { EditShareCipherData } from 'app/static/types'

/**
 * Model description here for TypeScript hints.
 */
export const EnterpriseStoreModel = types
  .model('EnterpriseStore')
  .props({
    apiToken: types.maybeNull(types.string),
    isEnterpriseInvitations: false,
  })
  .actions(withSetPropAction)
  .views((self) => ({})) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    setApiToken: (token: string) => {
      self.apiToken = token
    },
    setEnterpriseInvited: (val: boolean) => {
      self.isEnterpriseInvitations = val
    },
  })) // eslint-disable-line @typescript-eslint/no-unused-vars
  .actions((self) => ({
    clearStore: (dataOnly?: boolean) => {
      if (!dataOnly) {
        self.apiToken = null
      }
      self.isEnterpriseInvitations = false
    },

    getListUserGroups: async () => {
      const res = await enterpriseApi.getListUserGroups(self.apiToken)
      return res
    },

    getListGroupMembers: async (groupId: string) => {
      const res = await enterpriseApi.getListGroupMembers(self.apiToken, groupId)
      return res
    },

    searchGroupOrMember: async (enterpriseId: string, query: string) => {
      const res = await enterpriseApi.searchGroupOrMember(self.apiToken, enterpriseId, query)
      return res
    },

    editShareCipher: async (
      organizationId: string,
      groupID: string,
      payload: EditShareCipherData
    ) => {
      const res = await folderApi.editShareCipher(self.apiToken, organizationId, groupID, payload)
      return res
    },
    invitations: async () => {
      const res = await enterpriseApi.invitations(self.apiToken)
      if (res.kind === 'ok') {
        if (res.data.length > 0) {
          self.setEnterpriseInvited(res.data.some((e) => e.domain === null))
        }
        return res.data
      }
      return []
    },
    invitationsActions: async (id: string, status: 'confirmed' | 'reject') => {
      const res = await enterpriseApi.invitationsActions(self.apiToken, id, status)
      return res
    },
  }))
  .postProcessSnapshot(omit(['enterpriseInvitations']))

export interface EnterpriseStore extends Instance<typeof EnterpriseStoreModel> {}
export interface EnterpriseStoreSnapshotOut extends SnapshotOut<typeof EnterpriseStoreModel> {}
export interface EnterpriseStoreSnapshotIn extends SnapshotIn<typeof EnterpriseStoreModel> {}
export const createEnterpriseStoreDefaultModel = () => types.optional(EnterpriseStoreModel, {})
