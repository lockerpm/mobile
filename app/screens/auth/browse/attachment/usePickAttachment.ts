import RNFS from "react-native-fs"
import DocumentPicker, { DocumentPickerResponse } from "react-native-document-picker"
import { launchImageLibrary } from "react-native-image-picker"
import { useHelper } from "app/services/hook"
import { usePermission } from "./permission"
import { useCoreService } from "app/services/coreService"
import { useStores } from "app/models"
import { Platform } from "react-native"
import { Logger } from "app/utils/utils"
import { SymmetricCryptoKey } from "core/models/domain"
import { KdfType } from "core/enums/kdfType"

export const MAX_UPLOAD_SIZE = 50000000
export const IS_ANDROID = Platform.OS === "android"

export type AttachmentType = {
  id: string
  size: number
  url: string
  fileName: string
  key: SymmetricCryptoKey | null
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
  const { notify, randomString } = useHelper()
  const { handleUserDeniedPermission } = usePermission()
  const { attachmentService, cryptoService } = useCoreService()
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
        notify("error", "File is corrupted")
        return null
      }

      // Limit size
      if (file.size > MAX_UPLOAD_SIZE) {
        notify("error", "File too large")
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

    if (res.didCancel || res.assets.length === 0) {
      notify("error", "File is corrupted")
      return null
    }
    // Limit size
    if (res.assets[0].fileSize > MAX_UPLOAD_SIZE) {
      notify("error", "File too large")
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

  // const test = async (file: AttachmentType) => {
  //   const kdf = KdfType.PBKDF2_SHA256
  //   const kdfIterations = 100000
  //   const password = randomString(32)
  //   const salt = randomString(16)

  //   const key: SymmetricCryptoKey = await cryptoService.makeKey(password, salt, kdf, kdfIterations)

  //   const fileData = await RNFS.readFile(file.uri, "base64")

  //   console.log("fileData", fileData)

  //   const encryptedData = await cryptoService.encrypt(fileData, key)

  //   // console.log("encryptedData", encryptedData)
  //   const decryptToUtf8 = await cryptoService.decryptToUtf8(encryptedData, key)

  //   console.log("decryptToUtf8", decryptToUtf8)

  //   const filePath = `${RNFS.MainBundlePath}/${file.name}`

  //   try {
  //     if (await RNFS.exists(filePath)) {
  //       await RNFS.unlink(filePath)
  //     }
  //     await RNFS.writeFile(filePath, decryptToUtf8, "base64")
  //     console.log("Image saved at:", filePath)
  //   } catch (error) {
  //     console.error("Error saving image:", error)
  //   }
  //   return filePath
  // }

  const encryptAndUploadFile = async (
    file: AttachmentType,
    onProgress: (val: number) => void,
  ): Promise<AttachmentType | null> => {
    const tempEncFile = `${RNFS.DocumentDirectoryPath}/${Date.now()}${file.fileName}`

    try {
      const kdf = KdfType.PBKDF2_SHA256
      const kdfIterations = 100000
      const password = randomString(32)
      const salt = randomString(16)

      const key: SymmetricCryptoKey = await cryptoService.makeKey(
        password,
        salt,
        kdf,
        kdfIterations,
      )

      const fileData = await RNFS.readFile(file.url, "base64")

      const encryptedData = await cryptoService.encrypt(fileData, key)

      const encryptedFileData = JSON.stringify(encryptedData)

      await RNFS.writeFile(tempEncFile, encryptedFileData, "base64")

      const uploadRes = await attachmentService.uploadAttachment({
        token: cipherStore.apiToken,
        cipherId: cipherStore.selectedCipher.id,
        uri: tempEncFile,
        fileName: file.fileName,
        onProgress,
      })

      if (uploadRes.kind === "error") {
        notify("error", uploadRes.error)
        onProgress(-1)
        return null
      }

      const attachment: AttachmentType = {
        ...file,
        url: uploadRes.id,
        key,
      }

      console.tron.log("attachment", attachment)
      onProgress(1)
      return attachment
    } catch (error) {
      notify("error", "Error uploading file")
      onProgress(-1)
    } finally {
      if (await RNFS.exists(tempEncFile)) {
        await RNFS.unlink(tempEncFile)
      }
    }

    return null
  }

  return { pickFile, pickMedia, encryptAndUploadFile }
}
