import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { omit } from "ramda"
import { EditShareCipherData } from "../../services/api"
import { EnterpriseApi } from "../../services/api/enterprise-api"
import { withEnvironment } from "../extensions/with-environment"

/**
 * Model description here for TypeScript hints.
 */
export const EnterpriseModel = types
  .model("Enterprise")
  .props({
    apiToken: types.maybeNull(types.string),
    isEnterpriseInvitations: false
  })
  .extend(withEnvironment)
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
    getListUserGroups: async () => {
      const enterpriseApi = new EnterpriseApi(self.environment.api)
      const res = await enterpriseApi.getListUserGroups(self.apiToken)
      return res
    },

    getListGroupMembers: async (groupId: string) => {
      const enterpriseApi = new EnterpriseApi(self.environment.api)
      const res = await enterpriseApi.getListGroupMembers(self.apiToken, groupId)
      return res
    },

    searchGroupOrMember: async (enterpriseId: string, query: string) => {
      const enterpriseApi = new EnterpriseApi(self.environment.api)
      const res = await enterpriseApi.searchGroupOrMember(self.apiToken, enterpriseId, query)
      return res
    },

    editShareCipher: async (organizationId: string,
      groupID: string,
      payload: EditShareCipherData) => {
      const enterpriseApi = new EnterpriseApi(self.environment.api)
      const res = await enterpriseApi.editShareCipher(self.apiToken, organizationId, groupID, payload)
      return res
    },
    invitations: async () => {
      const enterpriseApi = new EnterpriseApi(self.environment.api)
      const res = await enterpriseApi.invitations(self.apiToken)
      if (res.kind === "ok") {
        if (res.data.length > 0) {
          self.setEnterpriseInvited(res.data.some(e => e.domain === null))
        }
        return res.data
      }
      return []
    },
    invitationsActions: async (id: string, status: "confirmed" | "reject") => {
      const enterpriseApi = new EnterpriseApi(self.environment.api)
      const res = await enterpriseApi.invitationsActions(self.apiToken, id, status)
      return res
    },
  }))
  .postProcessSnapshot(omit([
    'enterpriseInvitations',
  ]))
/**
 * Un-comment the following to omit model attributes from your snapshots (and from async storage).
 * Useful for sensitive data like passwords, or transitive state like whether a modal is open.

 * Note that you'll need to import `omit` from ramda, which is already included in the project!
 *  .postProcessSnapshot(omit(["password", "socialSecurityNumber", "creditCardNumber"]))
 */

type EnterpriseType = Instance<typeof EnterpriseModel>
export interface Enterprise extends EnterpriseType { }
type EnterpriseSnapshotType = SnapshotOut<typeof EnterpriseModel>
export interface EnterpriseSnapshot extends EnterpriseSnapshotType { }
export const createEnterpriseDefaultModel = () => types.optional(EnterpriseModel, {})
