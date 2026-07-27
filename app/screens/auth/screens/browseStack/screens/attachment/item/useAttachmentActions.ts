/* eslint-disable react-native/split-platform-components */
import { Platform } from "react-native"
import { CameraRoll } from "@react-native-camera-roll/camera-roll"
import ReactNativeBlobUtil from "react-native-blob-util"
import RNFS from "react-native-fs"
import Share, { ShareOptions } from "react-native-share"

import { useStores } from "app/models"
import { attachmentApi } from "app/services/api"
import { useCoreService } from "app/services/coreService"
import { useToast } from "app/services/utils"

import { usePermission } from "../permission"
import { AttachmentType } from "../usePickAttachment"

const DOWNLOAD_PATH =
  Platform.OS === "android"
    ? Platform.Version >= 30
      ? // Scoped storage: we can't write to public Downloads directly. Decrypt
        // into the cache dir first, then copy into the Downloads MediaStore
        // collection via react-native-blob-util.
        RNFS.CachesDirectoryPath
      : RNFS.DownloadDirectoryPath
    : RNFS.DocumentDirectoryPath

export const useAttachmentActions = (
  attachment: AttachmentType,
  setIsLoading: (val: boolean) => void,
  updateAttachments: (attachment: AttachmentType, isDelete: boolean) => void
) => {
  const { cipherStore } = useStores()
  const { attachmentService } = useCoreService()
  const { notifyTx, notifyApiError } = useToast()
  const { requestStoragePermission } = usePermission()

  const onDownloadAttachment = async () => {
    if (!attachment.key) return

    const tempEncFile = `${RNFS.CachesDirectoryPath}/${Date.now()}enc${attachment.fileName}`

    const filePath = `${DOWNLOAD_PATH}/${attachment.fileName}`
    try {
      setIsLoading(true)
      const hasPermission = await requestStoragePermission()
      if (!hasPermission) {
        console.error("onDownloadAttachment: Permission denied!")
        return
      }

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
        notifyTx("error", "file_attachment:error.download_error")
        return
      }

      const decryptedRes = await attachmentService.nativeDecryptFileByChunk(
        tempEncFile,
        filePath,
        attachment.key
      )

      if (!decryptedRes) {
        notifyTx("error", "file_attachment:error.decrypt_error")
        return
      }

      if (getFileType(attachment.fileName) === "file") {
        if (Platform.OS === "ios") {
          // iOS: present the share sheet so the user can Save to Files / share.
          const options: ShareOptions = {
            title: "Save File",
            url: `file://${filePath}`,
            saveToFiles: true,
          }

          try {
            await Share.open(options)
          } catch (error: any) {
            // User dismissing the share sheet is not an error.
            if (error?.message !== "User did not share") {
              console.error("Error sharing:", error)
            }
          }
        } else if (Number(Platform.Version) >= 30) {
          // Android 10+ (scoped storage): copy the decrypted file from our
          // private cache into the public Downloads collection via MediaStore.
          await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
            {
              name: attachment.fileName,
              parentFolder: "",
              mimeType: getMimeType(attachment.fileName),
            },
            "Download",
            filePath
          )
          // Don't leave the decrypted plaintext lingering in the cache dir.
          if (await RNFS.exists(filePath)) {
            await RNFS.unlink(filePath)
          }
          notifyTx("success", "file_attachment:download_success")
        } else {
          // Legacy Android (<10): the file was written straight to the public
          // Downloads directory.
          notifyTx("success", "file_attachment:download_success")
        }
      } else {
        try {
          if (Platform.OS === "android" && Platform.Version < 30) {
            return
          }
          await CameraRoll.saveAsset(filePath)
          notifyTx("success", "file_attachment:download_media_success")
        } catch (error) {
          console.error("Error saving media:", error)
        }
      }
    } catch (error) {
      console.error("Error saving media:", error)

      notifyTx("error", "file_attachment:error.download_error")
    } finally {
      if (await RNFS.exists(tempEncFile)) {
        await RNFS.unlink(tempEncFile)
      }
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
    notifyTx("success", "file_attachment:delete_success")
  }

  return { onDownloadAttachment, onDeleteAttachment }
}

const getMimeType = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase()
  const map: Record<string, string> = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
    xml: "application/xml",
    zip: "application/zip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    mp3: "audio/mpeg",
    wav: "audio/wav",
  }
  return (ext && map[ext]) || "application/octet-stream"
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
