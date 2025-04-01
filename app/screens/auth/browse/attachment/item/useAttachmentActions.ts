/* eslint-disable react-native/split-platform-components */
import { AttachmentType } from "../usePickAttachment"
import { attachmentApi } from "app/services/api"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import RNFS from "react-native-fs"
import { useCoreService } from "app/services/coreService"
import { Platform } from "react-native"
import { usePermission } from "../permission"
import Share, { ShareOptions } from "react-native-share"
import { CameraRoll } from "@react-native-camera-roll/camera-roll"

const DOWNLOAD_PATH =
  Platform.OS === "android"
    ? Platform.Version >= 30
      ? RNFS.DocumentDirectoryPath
      : RNFS.DownloadDirectoryPath
    : RNFS.DocumentDirectoryPath

export const useAttachmentActions = (
  attachment: AttachmentType,
  setIsLoading: (val: boolean) => void,
  updateAttachments: (attachment: AttachmentType, isDelete: boolean) => void,
) => {
  const { cipherStore } = useStores()
  const { attachmentService } = useCoreService()
  const { notify, notifyApiError, translate } = useHelper()
  const { requestStoragePermission, hasAndroidGalleryPermission } = usePermission()

  const onDownloadAttachment = async () => {
    if (!attachment.key) return
    try {
      setIsLoading(true)
      const hasPermission = await requestStoragePermission()
      if (!hasPermission) {
        console.error("onDownloadAttachment: Permission denied!")
        return
      }

      const tempEncFile = `${RNFS.CachesDirectoryPath}/${Date.now()}enc${attachment.fileName}`
      const filePath = `${DOWNLOAD_PATH}/${attachment.fileName}`
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

      if (getFileType(attachment.fileName) === "file") {
        if (Platform.OS === "android") {
          if (Platform.Version >= 30) {
            const options: ShareOptions = {
              title: "Save File",
              url: `file://${filePath}`,
              saveToFiles: true,
            }

            try {
              await Share.open(options)
            } catch (error) {
              if (error.message === "User did not share") {
                // "User canceled sharing"
              } else {
                console.error("Error sharing:", error)
              }
            }
          }
        } else {
          notify("success", translate("file_attachment.download_success"))
        }
      } else {
        try {
          if (Platform.OS === "android" && !(await hasAndroidGalleryPermission())) {
            return
          }
          await CameraRoll.saveAsset(filePath)
          notify("success", translate("file_attachment.download_media_success"))
        } catch (error) {
          console.error("Error saving media:", error)
        }
      }
    } catch (error) {
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

const getFileType = (fileName: string): "image" | "video" | "file" => {
  // Define extensions for images and videos
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "svg", "heic"]
  const videoExtensions = ["mp4", "mkv", "avi", "mov", "flv", "wmv", "webm", "3gp", "mpeg"]

  // Extract file extension
  const extension = fileName.split(".").pop()?.toLowerCase()

  if (!extension) return "file" // No extension means unknown file

  if (imageExtensions.includes(extension)) return "image"
  if (videoExtensions.includes(extension)) return "video"

  return "file" // Default case for other files
}
