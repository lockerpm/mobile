import DocumentPicker from "react-native-document-picker"
import RNFS from "react-native-fs"
import { useHelper } from "app/services/hook"
import { Platform } from "react-native"
import { Logger } from "app/utils/utils"

export const MAX_UPLOAD_SIZE = 100000000
export const IS_ANDROID = Platform.OS === "android"

export const usePickFile = () => {
  const { notify } = useHelper()

  const handleSendFile = async () => {
    let file: {
      name: string
      size: number
      type: string // MIME type
      uri: string
    }

    const maxSize = MAX_UPLOAD_SIZE

    try {
      // (Android) Cannot directly read msf:// and content:// file -> need copy to cache
      file = await DocumentPicker.pickSingle(IS_ANDROID ? { copyTo: "cachesDirectory" } : undefined)
      // @ts-ignore
      if (file.fileCopyUri) {
        // @ts-ignore
        file.uri = file.fileCopyUri
      }

      if (!file.size || file.size === 0) {
        notify("error", "File is corrupted")
        return
      }

      // If file name have space or unicode characters, picker will encode it -> need decode
      if (file.uri !== decodeURIComponent(file.uri)) {
        try {
          await RNFS.stat(file.uri)
        } catch (error) {
          file.uri = decodeURIComponent(file.uri)
        }
      }
    } catch (e) {
      if (e?.code !== "DOCUMENT_PICKER_CANCELED") {
        Logger.debug(e)
      }
      return
    }

    // Limit size
    if (file.size > maxSize) {
      notify("error", "File too large")
    }
  }

  return { handleSendFile }
}
