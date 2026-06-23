import { EncString, SymmetricCryptoKey } from "core/models/domain"
import { CipherRequest } from "core/models/request"
import { CipherView } from "core/models/view"

import { useStores } from "@/models"
import { useCoreService } from "@/services/coreService"
import { useToast } from "@/services/utils"
import { MAX_MULTIPLE_SHARE_COUNT } from "@/static/constants"
import {
  AccountRoleText,
  ShareGroups,
  ShareMembers,
  ShareMultipleCiphersData,
  ShareMultipleCiphersGroups,
  ShareMultipleCiphersMembers,
} from "@/static/types"
import { AnalyticEvents, logFirebaseEvent } from "@/utils/analytics"
import { Base64 } from "@/utils/base64"
import { Logger } from "@/utils/logger"

export const useShareMultipleCiphers = () => {
  const { cipherStore, user, enterpriseStore } = useStores()
  const { searchService, cryptoService, cipherService } = useCoreService()
  const { notifyTx, notifyApiError } = useToast()

  const generateMemberKey = async (publicKey: string, orgKey: SymmetricCryptoKey) => {
    const pk = Base64.fromB64ToArray(publicKey)
    const key = await cryptoService.rsaEncrypt(orgKey.key, pk.buffer as ArrayBuffer)
    return key.encryptedString
  }

  const prepareMemberPayload = async (
    orgKey: SymmetricCryptoKey,
    members: {
      email: string
      publicKey: string
      username: string
      role: AccountRoleText
      hide_passwords: boolean
      key: string | null
    }[]
  ) => {
    return await Promise.all(
      members.map(async (m) => {
        return {
          username: m.email,
          role: m.role,
          hide_passwords: m.hide_passwords,
          key: m.publicKey ? (await generateMemberKey(m.publicKey, orgKey)) || null : null,
        }
      })
    )
  }

  const prepareGroupPayload = async (
    orgKey: SymmetricCryptoKey,
    groups: ShareGroups[]
  ): Promise<ShareMultipleCiphersGroups> => {
    if (!groups.length) {
      return []
    }
    const res = await Promise.all(
      groups.map(async (group) => {
        const groupMemberRes = await enterpriseStore.getListGroupMembers(group.id)
        if (groupMemberRes.kind !== "ok") {
          return null
        }
        if (!groupMemberRes.data.members || !groupMemberRes.data.members.length) {
          return null
        }
        const members = await Promise.all(
          groupMemberRes.data.members
            .filter((e) => e.email !== user.email)
            .map(async (member) => {
              return {
                username: member.email,
                key: member.public_key
                  ? (await generateMemberKey(member.public_key, orgKey)) || null
                  : null,
              }
            })
        )
        return {
          id: group.id,
          role: group.role,
          members,
          hide_passwords: group.hidePasswords,
        }
      })
    )
    return res.filter((g) => g !== null)
  }

  // Share multiple ciphers
  const shareMultipleCiphers = async (
    ids: string[],
    emails: ShareMembers[],
    groups: ShareGroups[]
  ) => {
    try {
      const ciphers =
        (await searchService.searchCiphers("", [(c: CipherView) => ids.includes(c.id)])) || []
      if (!ciphers.length || ciphers.length > MAX_MULTIPLE_SHARE_COUNT) {
        return { kind: "ok" }
      }

      const sharedCiphers: ShareMultipleCiphersData["ciphers"] = []

      // Prepare org key
      const shareKey: [EncString, SymmetricCryptoKey] = await cryptoService.makeShareKey()
      const orgKey: SymmetricCryptoKey = shareKey[1]

      // Get public keys
      const members = await Promise.all(
        emails.map(async (e) => {
          const publicKeyRes = await cipherStore.getSharingPublicKey(e.email)
          let publicKey = ""
          if (publicKeyRes.kind === "ok") {
            publicKey = publicKeyRes.data.public_key
          }
          return {
            email: e.email,
            publicKey,
            username: e.email,
            role: e.role,
            hide_passwords: e.hidePasswords,
            key: publicKey ? (await generateMemberKey(publicKey, orgKey)) || null : null,
          }
        })
      )
      // Prepare cipher
      const prepareCipher = async (c: CipherView) => {
        let _orgKey = orgKey
        if (c.organizationId) {
          const _tempOrgKey = await cryptoService.getOrgKey(c.organizationId)
          if (_tempOrgKey) {
            _orgKey = _tempOrgKey
          }
        }
        const cipherEnc = await cipherService.encrypt(c, _orgKey)
        const data = new CipherRequest(cipherEnc)

        const membersPayload: ShareMultipleCiphersMembers = await prepareMemberPayload(
          _orgKey,
          members
        )
        const groupsPayload: ShareMultipleCiphersGroups = await prepareGroupPayload(_orgKey, groups)

        sharedCiphers.push({
          cipher: {
            id: c.id,
            ...data,
          },
          members: membersPayload,
          groups: groupsPayload,
        })
      }
      await Promise.all(ciphers.map(prepareCipher))

      // Send API
      const res = await cipherStore.shareMultipleCiphers({
        ciphers: sharedCiphers,
        sharing_key: shareKey ? shareKey[0].encryptedString || "" : "",
      })
      if (res.kind === "ok") {
        notifyTx("success", "success:cipher_shared")
        logFirebaseEvent(AnalyticEvents.SHARE_ITENS, user.email)
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notifyTx("error", "error:something_went_wrong")
      Logger.error("shareMultipleCiphers: " + e)
      return { kind: "unknown" }
    }
  }
  return { shareMultipleCiphers }
}
