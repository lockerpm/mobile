import Upload, { UploadOptions } from "react-native-background-upload"
import RNFS from "react-native-fs"
import { Logger } from "app/utils/utils"
import crypto from "react-native-crypto"
import { Buffer } from "buffer"
import { GetUploadFormResult } from "app/static/types"
import { IS_IOS } from "app/config/constants"

export class AttachmentService {
  private static readonly PROGRESS_INTERVAL = 1500 // ms
  private static readonly PROGRESS_DIVIDER = 1

  /**
   * Encrypts a file using AES-256-GCM.
   * @param inputPath - The input file path.
   * @param outputPath - The output file path.
   * @param key - The encryption key.
   */
  encryptFile = async (inputPath: string, outputPath: string, key: Buffer): Promise<boolean> => {
    try {
      const iv = crypto.randomBytes(12) // 12-byte IV for AES-GCM
      const fileData = await RNFS.readFile(inputPath, "base64") // Read file as base64
      const fileBuffer = Buffer.from(fileData, "base64")

      const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
      const encryptedData = Buffer.concat([cipher.update(fileBuffer), cipher.final()])
      const authTag = cipher.getAuthTag() // 16-byte AuthTag for integrity

      // Combine IV + AuthTag + Encrypted Data
      const finalData = Buffer.concat([iv, authTag, encryptedData]).toString("base64")

      await RNFS.writeFile(outputPath, finalData, "base64")
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Decrypts a file using AES-256-GCM.
   * @param inputPath - The input file path.
   * @param outputPath - The output file path.
   */
  decryptFile = async (inputPath: string, outputPath: string, key: Buffer): Promise<boolean> => {
    try {
      const encryptedBase64 = await RNFS.readFile(inputPath, "base64")
      const encryptedBuffer = Buffer.from(encryptedBase64, "base64")

      // Extract IV, AuthTag, and Encrypted Data
      const iv = encryptedBuffer.slice(0, 12)
      const authTag = encryptedBuffer.slice(12, 28)
      const encryptedData = encryptedBuffer.slice(28)

      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
      decipher.setAuthTag(authTag)

      const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()])

      await RNFS.writeFile(outputPath, decryptedData.toString("base64"), "base64")
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Uploads an attachment to the server.
   * @param params - The parameters including the file URI, name, and progress callback.
   * @returns A promise resolving with the uploaded attachment ID.
   */
  public async uploadAttachment(params: {
    uploadFormData: GetUploadFormResult
    uri: string
    onProgress?: (val: number) => void
  }): Promise<{ kind: "ok"; id: string } | { kind: "error"; error: string }> {
    const { uri, uploadFormData, onProgress } = params

    try {
      const uploadForm = uploadFormData.upload_form

      const uploadOptions: UploadOptions = {
        url: uploadForm.url,
        path: IS_IOS ? `file://${uri}` : uri,
        type: "raw",
        method: "PUT",
        notification: {
          enabled: true,
          autoClear: true,
          onProgressTitle: "Uploading...",
          onCompleteTitle: "Upload Complete",
          onErrorTitle: "Upload Failed",
        },
      }
      const { id } = await new Promise<{ id: string }>((resolve, reject) => {
        Upload.startUpload(uploadOptions)
          .then((uploadId) => {
            Upload.addListener("progress", uploadId, (data) => {
              onProgress && onProgress(data.progress / 100)
            })

            Upload.addListener("completed", uploadId, (data) => {
              if (data.responseCode === 200) {
                resolve({ id: uploadFormData.upload_id })
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
      return { kind: "ok", id }
    } catch (error) {
      Logger.error(`UploadAttachment Error: ${error}`)
      return { kind: "error", error: `Upload error: ${error}` }
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
  }): Promise<boolean> {
    const { inputUri, outputUri } = params

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
