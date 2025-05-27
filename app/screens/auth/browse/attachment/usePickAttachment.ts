import RNFS from "react-native-fs"
import DocumentPicker, { DocumentPickerResponse } from "react-native-document-picker"
import { launchImageLibrary } from "react-native-image-picker"
import { useHelper } from "app/services/hook"
import { usePermission } from "./permission"
import { useCoreService } from "app/services/coreService"
import { useStores } from "app/models"
import { Platform } from "react-native"
import { Logger } from "app/utils/utils"
import crypto from "react-native-crypto"
import { attachmentApi } from "app/services/api"
import { useAppLocale } from "app/services/context"

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
  const { translate } = useAppLocale()
  const { notify, notifyApiError } = useHelper()
  const { handleUserDeniedPermission } = usePermission()
  const { attachmentService } = useCoreService()
  const { cipherStore } = useStores()

  const pickFile = async (): Promise<AttachmentType | null> => {
    try {
      // (Android) Cannot directly read msf:// and content:// file -> need copy to cache
      const pickerFile: DocumentPickerResponse = await DocumentPicker.pickSingle(
        IS_ANDROID ? { copyTo: "cachesDirectory" } : undefined,
      )
      const file: AttachmentType = {
        id: Date.now().toString(),
        fileName: pickerFile.name,
        size: pickerFile.size,
        url: pickerFile.uri,
        key: null,
      }
      if (pickerFile.fileCopyUri) {
        file.url = pickerFile.fileCopyUri
      }

      if (!file.size || file.size === 0) {
        notify("error", translate("file_attachment.error.file_zero"))
        return null
      }

      // Limit size
      if (file.size > MAX_UPLOAD_SIZE) {
        notify("error", translate("file_attachment.error.max_size_error"))
        return null
      }
      // If file name have space or unicode characters, picker will encode it -> need decode
      file.url = await prepareFileUri(file.url)

      return file
    } catch (e) {
      if (e?.code !== "DOCUMENT_PICKER_CANCELED") {
        Logger.debug(e)
      }
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

    if (res.didCancel) {
      return null
    }
    if (res.assets.length === 0) {
      notify("error", translate("file_attachment.error.file_zero"))
      return null
    }
    // Limit size
    if (res.assets[0].fileSize > MAX_UPLOAD_SIZE) {
      notify("error", translate("file_attachment.error.max_size_error"))
      return null
    }

    const file: AttachmentType = {
      id: Date.now().toString(),
      fileName: res.assets[0].fileName,
      size: res.assets[0].fileSize,
      url: res.assets[0].uri,
      key: null,
    }
    file.fileName = prepareFileName(file.fileName, res.assets[0].type)
    file.url = await prepareFileUri(file.url)

    return file
  }

  const encryptAndUploadFile = async (
    file: AttachmentType,
    onStatus: (status: UploadStatus) => void,
  ): Promise<AttachmentType | null> => {
    const tempEncFile = `${RNFS.CachesDirectoryPath}/${Date.now()}${file.fileName}`
    try {
      onStatus(UploadStatus.ENCRYPTING)
      const uploadFormRes = await attachmentApi.getUploadForm(cipherStore.apiToken, {
        file_name: file.fileName,
        metadata: {
          cipher_id: cipherStore.selectedCipher.id,
        },
      })

      if (uploadFormRes.kind !== "ok") {
        notifyApiError(uploadFormRes)
        onStatus(UploadStatus.ERROR)
        return null
      }
      if (uploadFormRes.data.limit_size < file.size) {
        notify("error", translate("file_attachment.error.upload_limit_error"))
        onStatus(UploadStatus.ERROR)
        return null
      }

      const randomKey = crypto.randomBytes(32)
      const encRes = await attachmentService.nativeEncryptFileByChunk(
        file.url,
        tempEncFile,
        randomKey.toString("base64"),
      )
      if (!encRes) {
        notify("error", translate("file_attachment.error.encrypt_error"))
        onStatus(UploadStatus.ERROR)
        return null
      }
      onStatus(UploadStatus.UPLOADING)
      const encryptedFileSize = await getFileSize(tempEncFile)
      if (uploadFormRes.data.limit_size < encryptedFileSize) {
        notify("error", translate("file_attachment.error.upload_limit_error"))
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
      onStatus(UploadStatus.ERROR)
      notify("error", translate("file_attachment.error.upload_error"))
    } finally {
      if (await RNFS.exists(tempEncFile)) {
        await RNFS.unlink(tempEncFile)
      }
    }

    return null
  }

  return { pickFile, pickMedia, encryptAndUploadFile }
}

const prepareFileUri = async (uri: string) => {
  if (uri !== decodeURIComponent(uri)) {
    try {
      const res = await RNFS.stat(uri)
      return res.path
    } catch (error) {
      return decodeURIComponent(uri)
    }
  }
  return uri
}

const prepareFileName = (name: string, type?: string) => {
  if (IS_ANDROID && type) {
    const fileExtension = type.split("/").pop()
    return `${name.split(".").shift().replace(":", "-")}.${fileExtension}`
  }
  return name
}

const getFileSize = async (uri: string) => {
  try {
    const res = await RNFS.stat(uri)
    return res.size
  } catch (error) {
    return 0
  }
}
