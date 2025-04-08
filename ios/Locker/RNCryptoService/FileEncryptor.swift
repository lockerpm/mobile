import Foundation
import OpenSSL


@objc(FileEncryptor)
class FileEncryptor: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool {
      return true
  }

  
  @objc(encryptFileByChunk:outputPath:keyBase64:chunkSize:resolver:rejecter:)
  func encryptFileByChunk(_ inputPath: String,
                            outputPath: String,
                            keyBase64: String,
                            chunkSize: NSNumber,
                            resolver: @escaping RCTPromiseResolveBlock,
                            rejecter: @escaping RCTPromiseRejectBlock)  {
    let keyData = Data(base64Encoded: keyBase64)!
    let iv = AESGenerateRandomIV(length: 12)
    var ctx: OpaquePointer? = EVP_CIPHER_CTX_new()

    do {
      // Open input and output file
      guard let input = InputStream(url: URL(fileURLWithPath: inputPath)),
            let output = OutputStream(url: URL(fileURLWithPath: outputPath), append: false) else {
        throw NSError(domain: "FileOpen", code: -1, userInfo: nil)
      }

      input.open()
      output.open()

      // Write placeholder for IV + AuthTag (28 bytes)
       var placeholder = Data(count: 28)
       _ = placeholder.withUnsafeBytes { ptr in
         output.write(ptr.bindMemory(to: UInt8.self).baseAddress!, maxLength: ptr.count)
       }
      
      // Setup encryption
      EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), nil, nil, nil)
      keyData.withUnsafeBytes { keyPtr in
        iv.withUnsafeBytes { ivPtr in
          EVP_EncryptInit_ex(ctx, nil, nil, keyPtr.baseAddress?.assumingMemoryBound(to: UInt8.self), ivPtr.baseAddress?.assumingMemoryBound(to: UInt8.self))
        }
      }

      // Process chunks
      let bufferSize = chunkSize.intValue
      var buffer = [UInt8](repeating: 0, count: bufferSize)
      var outBuffer = [UInt8](repeating: 0, count: bufferSize + 16)
      var outLen: Int32 = 0

      while input.hasBytesAvailable {
        let readBytes = input.read(&buffer, maxLength: bufferSize)
        if readBytes <= 0 { break }

        let updateStatus = EVP_EncryptUpdate(
          ctx,
          &outBuffer,
          &outLen,
          buffer,
          Int32(readBytes)
        )

        if updateStatus != 1 {
          throw NSError(domain: "EncryptUpdate", code: -1, userInfo: nil)
        }

        _ = output.write(outBuffer, maxLength: Int(outLen))
      }

      // Finalize
      let finalStatus = EVP_EncryptFinal_ex(ctx, &outBuffer, &outLen)
      if finalStatus != 1 {
        throw NSError(domain: "EncryptFinal", code: -1, userInfo: nil)
      }
      _ = output.write(outBuffer, maxLength: Int(outLen))

      // Get AuthTag
      var authTag = [UInt8](repeating: 0, count: 16)
      let tagStatus = EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, 16, &authTag)
      if tagStatus != 1 {
        throw NSError(domain: "GetAuthTag", code: -1, userInfo: nil)
      }

      // Write IV + AuthTag to the beginning
      output.close()
      if let fileHandle = try? FileHandle(forWritingTo: URL(fileURLWithPath: outputPath)) {
        fileHandle.seek(toFileOffset: 0)
        fileHandle.write(iv)
        fileHandle.write(Data(authTag))
        fileHandle.closeFile()
      }

      EVP_CIPHER_CTX_free(ctx)
      resolver(true)
    } catch {
      if let ctx = ctx {
        EVP_CIPHER_CTX_free(ctx)
      }
      rejecter("ENCRYPT_ERROR", "Encryption failed", error)
    }
  }

  @objc(decryptFileByChunk:outputPath:keyBase64:chunkSize:resolver:rejecter:)
  func decryptFileByChunk(
   _ inputPath: String,
    outputPath: String,
    keyBase64: String,
    chunkSize: NSNumber,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    let chunkSizeInt = chunkSize.intValue
    guard let keyData = Data(base64Encoded: keyBase64) else {
    rejecter("key_error", "Invalid base64 key", nil)
    return
    }
    guard let inputStream = InputStream(fileAtPath: inputPath),
          FileManager.default.createFile(atPath: outputPath, contents: nil),
          let outputStream = OutputStream(toFileAtPath: outputPath, append: false) else {
      rejecter("file_error", "Could not open file streams", nil)
      return
    }

    inputStream.open()
    outputStream.open()

    // Read IV (12 bytes) and Auth Tag (16 bytes)
    var iv = [UInt8](repeating: 0, count: 12)
    var authTag = [UInt8](repeating: 0, count: 16)
    guard inputStream.read(&iv, maxLength: 12) == 12,
          inputStream.read(&authTag, maxLength: 16) == 16 else {
      rejecter("file_error", "Failed to read IV and Auth Tag", nil)
      return
    }

    guard let ctx = EVP_CIPHER_CTX_new() else {
      rejecter("openssl_error", "Failed to create cipher context", nil)
      return
    }

    defer {
      EVP_CIPHER_CTX_free(ctx)
      inputStream.close()
      outputStream.close()
    }

    if EVP_DecryptInit_ex(ctx, EVP_aes_256_gcm(), nil, nil, nil) != 1 {
      rejecter("openssl_error", "Failed to initialize decrypt context", nil)
      return
    }

    // Set IV length
    if EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, 12, nil) != 1 {
      rejecter("openssl_error", "Failed to set IV length", nil)
      return
    }

    // Set key and IV
    _ = keyData.withUnsafeBytes { keyPtr in
      EVP_DecryptInit_ex(ctx, nil, nil, keyPtr.bindMemory(to: UInt8.self).baseAddress, iv)
    }

    // Decrypt chunks
    var inBuffer = [UInt8](repeating: 0, count: chunkSizeInt)
    var outBuffer = [UInt8](repeating: 0, count: chunkSizeInt + 16)

    while true {
      let bytesRead = inputStream.read(&inBuffer, maxLength: chunkSizeInt)
      if bytesRead <= 0 {
        break
      }

      var outLen: Int32 = 0
      let result = EVP_DecryptUpdate(ctx, &outBuffer, &outLen, inBuffer, Int32(bytesRead))
      if result != 1 {
        rejecter("openssl_error", "Failed to decrypt chunk", nil)
        return
      }

      outputStream.write(outBuffer, maxLength: Int(outLen))
    }

    // Set Auth Tag *before* finalizing
    if EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_TAG, 16, &authTag) != 1 {
      rejecter("openssl_error", "Failed to set Auth Tag", nil)
      return
    }

    // Finalize decryption
    var dummyOutLen: Int32 = 0
    let finalResult = EVP_DecryptFinal_ex(ctx, nil, &dummyOutLen)
    if finalResult != 1 {
      rejecter("auth_error", "Authentication failed", nil)
      return
    }

    resolver(true)
  }
  
  private func AESGenerateRandomIV(length: Int) -> Data {
      var iv = [UInt8](repeating: 0, count: length)
      _ = SecRandomCopyBytes(kSecRandomDefault, length, &iv)
      return Data(iv)
  }
}
