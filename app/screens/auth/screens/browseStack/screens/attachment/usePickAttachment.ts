import { Platform } from "react-native"
import { keepLocalCopy, pick } from "@react-native-documents/picker"
import RNFS from "react-native-fs"
import { launchCamera, launchImageLibrary } from "react-native-image-picker"
import crypto from "react-native-quick-crypto"

import { useStores } from "app/models"
import { attachmentApi } from "app/services/api"
import { useCoreService } from "app/services/coreService"
import { useToast } from "app/services/utils"

import { Logger } from "@/utils/logger"

import { usePermission } from "./permission"

export const MAX_UPLOAD_SIZE = 52428800 // 50MB
export const IS_ANDROID = Platform.OS === "android"
export enum UploadStatus {
  ENCRYPTING,
  UPLOADING,
  NONE,
  ERROR,
}

export type AttachmentType = {
  id: string
  size: number
  url: string
  fileName: string
  key: string | null
}

export const usePickAttachment = () => {
  const { notify, notifyTx, notifyApiError } = useToast()
  const { handleUserDeniedPermission } = usePermission()
  const { attachmentService } = useCoreService()
  const { cipherStore } = useStores()

  const pickFile = async (): Promise<AttachmentType | null> => {
    try {
      // (Android) Cannot directly read msf:// and content:// file -> need copy to cache
      const [file1] = await pick()
      const [localCopy] = await keepLocalCopy({
        files: [
          {
            uri: file1.uri,
            fileName: file1.name ?? "fallbackName",
          },
        ],
        destination: "cachesDirectory",
      })

      const file: AttachmentType = IS_ANDROID
        ? {
            id: Date.now().toString(),
            fileName: file1.name ?? "",
            size: file1.size ?? 0,
            url: "",
            key: null,
          }
        : {
            id: Date.now().toString(),
            fileName: file1.name ?? "",
            size: file1.size ?? 0,
            url: file1.uri,
            key: null,
          }
      if (IS_ANDROID && localCopy.status === "success" && localCopy.localUri) {
        file.url = localCopy.localUri
      }

      if (!file.size || file.size === 0) {
        notifyTx("error", "file_attachment:error.file_zero")
        return null
      }

      // Limit size
      if (file.size > MAX_UPLOAD_SIZE) {
        notifyTx("error", "file_attachment:error.max_size_error")
        return null
      }
      // If file name have space or unicode characters, picker will encode it -> need decode
      file.url = await prepareFileUri(file.url)

      return file
    } catch (e: any) {
      if ("code" in e && e?.code !== "DOCUMENT_PICKER_CANCELED") {
        Logger.debug(e)
      }
      return null
    }
  }

  const takeImage = async (): Promise<AttachmentType | null> => {
    try {
      // Pick image
      const res = await launchCamera({
        mediaType: "photo",
        quality: 0.8,
        cameraType: "back",
        saveToPhotos: false,
      })
      if (res.errorCode) {
        if (res.errorCode === "permission") {
          handleUserDeniedPermission("Photos")
          return null
        }
        return null
      }

      if (res.didCancel || !res.assets) {
        return null
      }
      if (res.assets.length === 0) {
        notifyTx("error", "file_attachment:error.file_zero")
        return null
      }

      // Limit size
      if ((res.assets[0].fileSize ?? 0) > MAX_UPLOAD_SIZE) {
        notifyTx("error", "file_attachment:error.max_size_error")
        return null
      }

      const file: AttachmentType = {
        id: Date.now().toString(),
        fileName: res.assets[0].fileName ?? "",
        size: res.assets[0].fileSize ?? 0,
        url: res.assets[0].uri ?? "",
        key: null,
      }
      file.fileName = prepareFileName(file.fileName, res.assets[0].type)
      file.url = await prepareFileUri(file.url)

      return file
    } catch (error) {
      Logger.error("Error taking image:", error)
      return null
    }
  }

  const pickMedia = async (): Promise<AttachmentType | null> => {
    // Pick image
    const res = await launchImageLibrary({
      mediaType: "mixed",
      quality: 0.8,
      selectionLimit: 1,
      videoQuality: "low",
    })
    if (res.errorCode) {
      if (res.errorCode === "permission") {
        handleUserDeniedPermission("Photos")
        return null
      }
      return null
    }

    if (res.didCancel || !res.assets) {
      return null
    }
    if (res.assets.length === 0) {
      notifyTx("error", "file_attachment:error.file_zero")
      return null
    }

    // Limit size
    if ((res.assets[0].fileSize ?? 0) > MAX_UPLOAD_SIZE) {
      notifyTx("error", "file_attachment:error.max_size_error")
      return null
    }

    const file: AttachmentType = {
      id: Date.now().toString(),
      fileName: res.assets[0].fileName ?? "",
      size: res.assets[0].fileSize ?? 0,
      url: res.assets[0].uri ?? "",
      key: null,
    }
    file.fileName = prepareFileName(file.fileName, res.assets[0].type)
    file.url = await prepareFileUri(file.url)

    return file
  }

  const encryptAndUploadFile = async (
    cipherId: string,
    file: AttachmentType,
    onStatus: (status: UploadStatus) => void
  ): Promise<AttachmentType | null> => {
    const tempEncFile = `${RNFS.CachesDirectoryPath}/${Date.now()}${file.fileName}`
    try {
      onStatus(UploadStatus.ENCRYPTING)
      const uploadFormRes = await attachmentApi.getUploadForm(cipherStore.apiToken, {
        file_name: file.fileName,
        metadata: {
          cipher_id: cipherId,
        },
      })

      if (uploadFormRes.kind !== "ok") {
        notifyApiError(uploadFormRes)
        onStatus(UploadStatus.ERROR)
        return null
      }
      if (uploadFormRes.data.limit_size < file.size) {
        notifyTx("error", "file_attachment:error.upload_limit_error")
        onStatus(UploadStatus.ERROR)
        return null
      }
      const randomKey = crypto.randomBytes(32)
      const encRes = await attachmentService.nativeEncryptFileByChunk(
        file.url,
        tempEncFile,
        randomKey.toString("base64")
      )
      if (!encRes) {
        notifyTx("error", "file_attachment:error.encrypt_error")
        onStatus(UploadStatus.ERROR)
        return null
      }
      onStatus(UploadStatus.UPLOADING)
      const encryptedFileSize = await getFileSize(tempEncFile)
      if (uploadFormRes.data.limit_size < encryptedFileSize) {
        notifyTx("error", "file_attachment:error.upload_limit_error")
        onStatus(UploadStatus.ERROR)
        return null
      }
      const uploadRes = await attachmentService.uploadAttachment({
        uploadFormData: uploadFormRes.data,
        uri: tempEncFile,
      })
      if (uploadRes.kind === "error") {
        notify("error", uploadRes.error)
        onStatus(UploadStatus.ERROR)
        return null
      }
      const attachment: AttachmentType = {
        ...file,
        url: uploadRes.id,
        key: randomKey.toString("base64"),
      }
      onStatus(UploadStatus.NONE)
      return attachment
    } catch (error) {
      Logger.error("Error encrypting or uploading file:", error)
      onStatus(UploadStatus.ERROR)
      notifyTx("error", "file_attachment:error.upload_error")
    } finally {
      if (await RNFS.exists(tempEncFile)) {
        await RNFS.unlink(tempEncFile)
      }
    }

    return null
  }

  return { takeImage, pickFile, pickMedia, encryptAndUploadFile }
}

const prepareFileUri = async (uri: string) => {
  if (uri !== decodeURIComponent(uri)) {
    try {
      const res = await RNFS.stat(uri)
      return res.path
    } catch (error) {
      Logger.error("Error preparing file URI:", error)
      return decodeURIComponent(uri)
    }
  }
  return uri
}

const prepareFileName = (name: string, type?: string) => {
  if (IS_ANDROID && type) {
    const fileExtension = type.split("/").pop()
    return `${name.split(".").shift()?.replace(":", "-")}.${fileExtension}`
  }
  return name
}

const getFileSize = async (uri: string) => {
  try {
    const res = await RNFS.stat(uri)
    return res.size
  } catch (error) {
    Logger.error("Error getting file size:", error)
    return 0
  }
}
