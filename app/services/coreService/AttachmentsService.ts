import Upload, { MultipartUploadOptions } from "react-native-background-upload"
import RNFS from "react-native-fs"
import { attachmentApi } from "../api"
import { IS_IOS } from "app/config/constants"
import { Logger } from "app/utils/utils"

export class AttachmentService {
  private static readonly PROGRESS_INTERVAL = 1500 // ms
  private static readonly PROGRESS_DIVIDER = 1

  /**
   * Uploads an attachment to the server.
   * @param params - The parameters including the file URI, name, and progress callback.
   * @returns A promise resolving with the uploaded attachment ID.
   */
  public async uploadAttachment(params: {
    token: string
    cipherId: string
    uri: string
    fileName: string
    onProgress: (val: number) => void
  }): Promise<{ id: string }> {
    const { uri, fileName, onProgress, cipherId, token } = params

    try {
      const uploadFormRes = await attachmentApi.getUploadForm(token, {
        file_name: fileName,
        metadata: {
          cipher_id: cipherId,
        },
      })

      console.log(uploadFormRes)
      return { id: "123" }
      if (uploadFormRes.kind !== "ok") {
        throw new Error(`Failed to fetch upload form: ${JSON.stringify(uploadFormRes)}`)
      }

      const uploadForm = uploadFormRes.data.upload_form

      const uploadOptions: MultipartUploadOptions = {
        url: uploadForm.url,
        path: IS_IOS ? `file://${uri}` : uri,
        type: "multipart",
        field: "file",
        parameters: uploadForm.fields,
        notification: {
          enabled: true,
          autoClear: true,
        },
      }

      return new Promise<{ id: string }>((resolve, reject) => {
        Upload.startUpload(uploadOptions)
          .then((uploadId) => {
            Upload.addListener("progress", uploadId, (data) => {
              onProgress(data.progress / 100)
            })

            Upload.addListener("completed", uploadId, (data) => {
              if (data.responseCode === 201) {
                resolve({ id: uploadFormRes.data.upload_id })
              } else {
                reject(new Error(`Upload failed with response code ${data.responseCode}`))
              }
            })

            Upload.addListener("error", uploadId, (data) => {
              reject(new Error(`Upload error: ${data.error}`))
            })

            Upload.addListener("cancelled", uploadId, () => {
              reject(new Error("Upload was cancelled."))
            })
          })
          .catch((err) => {
            reject(new Error(`Upload start error: ${err}`))
          })
      })
    } catch (error) {
      Logger.error(`UploadAttachment Error: ${error}`)
      throw new Error(`Upload error: ${error}`)
    }
  }

  /**
   * Downloads an attachment to the local filesystem.
   * @param params - The parameters including input and output URIs, and progress callbacks.
   * @returns A promise resolving with a boolean indicating success or failure.
   */
  public async downloadAttachment(params: {
    inputUri: string
    outputUri: string
    onBegin?: (size: number) => void
    onProgress?: (val: number) => void
  }): Promise<boolean> {
    const { inputUri, outputUri, onBegin, onProgress } = params

    if (!inputUri || !outputUri) {
      Logger.error("Invalid download parameters")
      return false
    }

    try {
      const job = RNFS.downloadFile({
        fromUrl: inputUri,
        toFile: outputUri,
        discretionary: true,
        progressInterval: AttachmentService.PROGRESS_INTERVAL,
        progressDivider: AttachmentService.PROGRESS_DIVIDER,
        begin: (res) => onBegin?.(res.contentLength),
        progress: (res) => {
          const percentage = res.bytesWritten / res.contentLength
          onProgress?.(percentage)
        },
      })

      const res = await job.promise

      if (res.statusCode === 200) {
        return true
      } else {
        Logger.error(`Download failed with status code ${res.statusCode}`)
        return false
      }
    } catch (e) {
      Logger.error(`DownloadAttachment Error: ${e}`)
      return false
    }
  }
}
