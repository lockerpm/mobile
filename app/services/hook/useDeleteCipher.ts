import { CipherView } from "core/models/view"
import { useCipherData } from "./useCipherData"
import { useFolder } from "./useFolder"
import { useStores } from "app/models"
import { useCoreService } from "../coreService"
import { useCipherHelper } from "./useCipherHelper"
import { useToast } from "../utils"
import { useAppLocale } from "@/i18n"
import { Logger } from "@/utils/logger"

export const useDeleteCipher = () => {
  const { cipherStore, uiStore } = useStores()
  const { cipherService } = useCoreService()
  const {
    getCiphersFromCache,
    stopShareCipher,
    stopShareCipherForGroup,
    minimalReloadCache,
    updateCipher,
  } = useCipherData()
  const { notify } = useToast()
  const { shareFolderRemoveItem } = useFolder()
  const { notifyTx, notifyApiError } = useToast()
  const { translate } = useAppLocale()
  const { getPasswordStrength } = useCipherHelper()

  const removeItemFromFolder = async (selectedCipher: CipherView) => {
    selectedCipher.folderId = ""
    const passwordStrength = getPasswordStrength(selectedCipher.login.password).score
    await updateCipher(
      selectedCipher.id,
      selectedCipher,
      passwordStrength,
      selectedCipher.collectionIds
    )
  }

  // To trash
  const toTrashCiphers = async (ids: string[]) => {
    if (!ids.length) {
      return { kind: "ok" }
    }

    // Search
    const searchRes = await getCiphersFromCache({
      filters: [(c: CipherView) => ids.includes(c.id)],
      searchText: "",
      deleted: false,
    })
    if (searchRes.length === 0) {
      return {
        kind: "ok",
      }
    }
    searchRes.forEach(async (selectedCipher) => {
      if (selectedCipher.folderId) {
        await removeItemFromFolder(selectedCipher)
      }
      if (selectedCipher.organizationId) {
        if (selectedCipher.collectionIds?.length > 0) {
          await shareFolderRemoveItem(
            selectedCipher.collectionIds[0],
            selectedCipher.organizationId,
            selectedCipher
          )
        } else {
          const share = cipherStore.myShares.find((s) => s.id === selectedCipher.organizationId)

          if (share) {
            if (share.members.length > 0) {
              await stopShareCipher(selectedCipher, share.members[0].id)
            }
            if (share.groups.length) {
              await stopShareCipherForGroup(selectedCipher, share.groups[0].id)
            }
          }
        }
      }
    })

    try {
      // Offline
      if (uiStore.isOffline) {
        await _offlineToTrashCiphers(ids)
        notify(
          "success",
          `${translate("success:cipher_trashed")} ${translate("success:will_sync_when_online")}`
        )
        return { kind: "ok" }
      }

      // Online
      const res = await cipherStore.toTrashCiphers(ids)
      if (res.kind === "ok") {
        await _offlineToTrashCiphers(ids, true)
        notifyTx("success", "success:cipher_trashed")
      } else {
        notifyApiError(res)
      }
      return res
    } catch (e) {
      notifyTx("error", "error:something_went_wrong")
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

  return {
    toTrashCiphers,
  }
}
