import Upload, { UploadOptions } from "react-native-background-upload"
import RNFS from "react-native-fs"
import { Logger } from "app/utils/utils"
import crypto from "react-native-crypto"
import { Buffer } from "buffer"
import { GetUploadFormResult } from "app/static/types"
import { IS_IOS } from "app/config/constants"
import { NativeModules } from "react-native"
const { FileEncryptor } = NativeModules

export class AttachmentService {
  private static readonly PROGRESS_INTERVAL = 1500 // ms
  private static readonly PROGRESS_DIVIDER = 1
  private readonly CHUNK_SIZE = 1024 * 1024 // 1MB per chunk (adjust based on performance)
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

  encryptFileByChunk = async (
    inputPath: string,
    outputPath: string,
    key: Buffer,
  ): Promise<boolean> => {
    try {
      const iv = crypto.randomBytes(12) // 12-byte IV for AES-GCM
      const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)

      await RNFS.writeFile(outputPath, "", "base64")
      let offset = 0
      const fileStat = await RNFS.stat(inputPath)
      const fileSize = Number(fileStat.size)

      console.log(`Encrypting file: ${inputPath} (${fileSize} bytes) in chunks...`)

      while (offset < fileSize) {
        const chunkBase64 = await RNFS.read(inputPath, this.CHUNK_SIZE, offset, "base64")
        const chunkBuffer = Buffer.from(chunkBase64, "base64")

        // Encrypt chunk
        const encryptedChunk = Buffer.concat([cipher.update(chunkBuffer), cipher.final()])

        // Write first chunk: store IV + AuthTag at the beginning
        if (offset === 0) {
          const authTag = cipher.getAuthTag() // 16-byte AuthTag
          const header = Buffer.concat([iv, authTag]).toString("base64") // Store IV + AuthTag once
          await RNFS.appendFile(outputPath, header + "\n", "base64")
        }

        // Write encrypted chunk
        await RNFS.appendFile(outputPath, encryptedChunk.toString("base64") + "\n", "base64")

        console.log(`Encrypted chunk at offset: ${offset}`)
        offset += this.CHUNK_SIZE
      }

      console.log(`Encryption completed: ${outputPath}`)
      return true
    } catch (error) {
      console.error("Encryption error:", error)
      return false
    }
  }

  /**
   * Native Encrypts a file using AES-256-GCM.
   * @param inputPath - The input file path.
   * @param outputPath - The output file path.
   * @param key - The encryption key. (base 64 string)
   */
  nativeEncryptFileByChunk = async (
    inputPath: string,
    outputPath: string,
    key: string,
  ): Promise<boolean> => {
    try {
      const result = await FileEncryptor.encryptFileByChunk(
        inputPath.replace("file://", ""),
        outputPath.replace("file://", ""),
        key,
        this.CHUNK_SIZE,
      )
      console.log("nativeEncryptFileByChunk success:", result)
      return result
    } catch (err) {
      console.error("nativeEncryptFileByChunk failed", err)
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

  decryptFileByChunk = async (
    inputPath: string,
    outputPath: string,
    key: Buffer,
  ): Promise<boolean> => {
    try {
      const fileStat = await RNFS.stat(inputPath)
      const fileSize = Number(fileStat.size)

      const inputHandle = await RNFS.read(inputPath, 28, 0, "base64") // Read first 44 bytes (IV + AuthTag)
      const headerBuffer = Buffer.from(inputHandle, "base64")
      const iv = headerBuffer.slice(0, 12) // First 12 bytes = IV
      const authTag = headerBuffer.slice(12, 28) // Next 16 bytes = AuthTag

      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
      decipher.setAuthTag(authTag)

      await RNFS.writeFile(outputPath, "", "base64") // Clear output file

      let offset = 28 // Start after IV + AuthTag
      console.log(`Decrypting file: ${inputPath} (${fileSize} bytes) in chunks...`)

      while (offset < fileSize) {
        const chunkBase64 = await RNFS.read(inputPath, this.CHUNK_SIZE, offset, "base64")
        const encryptedChunk = Buffer.from(chunkBase64, "base64")

        // Decrypt chunk
        const decryptedChunk = decipher.update(encryptedChunk).toString("base64")

        // Write decrypted chunk immediately
        await RNFS.appendFile(outputPath, decryptedChunk, "base64")

        console.log(`Decrypted chunk at offset: ${offset}`)
        offset += this.CHUNK_SIZE
      }

      // Finalize decryption
      const finalData = decipher.final().toString("base64")
      if (finalData.length > 0) {
        await RNFS.appendFile(outputPath, finalData, "base64")
      }

      console.log(`Decryption completed: ${outputPath}`)
      return true
    } catch (error) {
      console.error("Decryption error:", error)
      return false
    }
  }

  nativeDecryptFileByChunk = async (
    inputPath: string,
    outputPath: string,
    key: string,
  ): Promise<boolean> => {
    console.log("nativeEncryptFileByChunk", inputPath, outputPath, key)
    try {
      const result = await FileEncryptor.decryptFileByChunk(
        inputPath.replace("file://", ""),
        outputPath.replace("file://", ""),
        key,
        this.CHUNK_SIZE,
      )
      console.log("nativeEncryptFileByChunk success:", result)
      return result
    } catch (err) {
      console.error("nativeEncryptFileByChunk failed", err)
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
