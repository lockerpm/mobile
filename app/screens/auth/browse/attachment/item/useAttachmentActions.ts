import { AttachmentType } from "../usePickAttachment"
import { attachmentApi } from "app/services/api"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import RNFS from "react-native-fs"
import { useCoreService } from "app/services/coreService"

export const useAttachmentActions = (
  attachment: AttachmentType,
  setIsLoading: (val: boolean) => void,
  updateAttachments: (attachment: AttachmentType, isDelete: boolean) => void,
) => {
  const { cipherStore } = useStores()
  const { attachmentService } = useCoreService()
  const { notify, notifyApiError, translate } = useHelper()

  const onDownloadAttachment = async () => {
    if (!attachment.key) return
    try {
      setIsLoading(true)
      const tempEncFile = `${RNFS.CachesDirectoryPath}/${Date.now()}enc${attachment.fileName}`
      const filePath = `${RNFS.DocumentDirectoryPath}/${Date.now()}-${attachment.fileName}`
      if (await RNFS.exists(filePath)) {
        await RNFS.unlink(filePath)
      }

      // download attachment
      const res = await attachmentApi.getAttachmentUrl(cipherStore.apiToken, attachment.url)
      if (res.kind !== "ok") {
        notifyApiError(res)
        return
      }

      const downloadRes = await attachmentService.downloadAttachment({
        inputUri: res.data.url,
        outputUri: tempEncFile,
      })
      if (!downloadRes) {
        notify("error", translate("file_attachment.error.download_error"))
        return
      }

      const decryptedRes = await attachmentService.decryptFile(
        tempEncFile,
        filePath,
        Buffer.from(attachment.key, "base64"),
      )

      if (!decryptedRes) {
        notify("error", translate("file_attachment.error.decrypt_error"))
        return
      }
      notify("success", translate("file_attachment.download_success"))
    } catch (error) {
      console.error(error)
      notify("error", translate("file_attachment.error.download_error"))
    } finally {
      setIsLoading(false)
    }
  }

  const onDeleteAttachment = async () => {
    if (!attachment.key) return
    setIsLoading(true)
    const res = await attachmentApi.deleteAttachment(cipherStore.apiToken, [attachment.url])
    if (res.kind !== "ok") {
      notifyApiError(res)
      return
    }
    updateAttachments(attachment, true)
    setIsLoading(false)
    notify("success", translate("file_attachment.delete_success"))
  }

  return { onDownloadAttachment, onDeleteAttachment }
}
