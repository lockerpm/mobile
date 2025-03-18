import RNFS from "react-native-fs"
import DocumentPicker, { DocumentPickerResponse } from "react-native-document-picker"
import { launchImageLibrary } from "react-native-image-picker"
import { useHelper } from "app/services/hook"
import { usePermission } from "./permission"
import { useCoreService } from "app/services/coreService"
import { useStores } from "app/models"
import { Platform } from "react-native"
import { Logger } from "app/utils/utils"

export const MAX_UPLOAD_SIZE = 50000000
export const IS_ANDROID = Platform.OS === "android"

export type AttachmentType = {
  id: string
  name: string
  size: number
  type: string // MIME type
  uri: string
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
    return `${name.replace(":", "-")}.${fileExtension}`
  }
  return name
}

export const usePickAttachment = () => {
  const { notify } = useHelper()
  const { handleUserDeniedPermission } = usePermission()
  const { attachmentService } = useCoreService()
  const { cipherStore } = useStores()

  const pickFile = async (): Promise<AttachmentType | null> => {
    try {
      // (Android) Cannot directly read msf:// and content:// file -> need copy to cache
      const pickerFile: DocumentPickerResponse = await DocumentPicker.pickSingle(
        IS_ANDROID ? { copyTo: "cachesDirectory" } : undefined,
      )
      const file = {
        name: pickerFile.name,
        size: pickerFile.size,
        type: pickerFile.type,
        uri: pickerFile.uri,
        id: pickerFile.uri,
      }
      if (pickerFile.fileCopyUri) {
        file.uri = pickerFile.fileCopyUri
      }

      if (!file.size || file.size === 0) {
        notify("error", "File is corrupted")
        return null
      }

      // Limit size
      if (file.size > MAX_UPLOAD_SIZE) {
        notify("error", "File too large")
      }
      // If file name have space or unicode characters, picker will encode it -> need decode
      file.uri = await prepareFileUri(file.uri)

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

    if (res.didCancel || res.assets.length === 0) {
      notify("error", "File is corrupted")
      return null
    }

    const file: AttachmentType = {
      id: res.assets[0].id || res.assets[0].uri,
      name: res.assets[0].fileName,
      size: res.assets[0].fileSize,
      type: res.assets[0].type,
      uri: res.assets[0].uri,
    }
    file.name = prepareFileName(file.name, file.type)
    file.uri = await prepareFileUri(file.uri)

    return file
  }

  const uploadAttachment = (file: AttachmentType, onProgress: (num: number) => void) => {
    return attachmentService.uploadAttachment({
      token: cipherStore.apiToken,
      cipherId: cipherStore.selectedCipher.id,
      uri: file.uri,
      fileName: file.name,
      onProgress,
    })
  }

  return { pickFile, pickMedia, uploadAttachment }
}
