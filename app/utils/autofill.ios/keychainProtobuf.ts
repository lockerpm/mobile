import { Platform } from "react-native"
import * as ReactNativeKeychain from "react-native-keychain"

import Config from "@/config"

import {
  IosAutofillPassword,
  IosAutofillTemporaryPassword,
  AutofillUserInfo,
  AutofillStorekey,
  IosAutofillTemporaryPasskey,
  IosAutofillOTP,
} from "./autofillType"
import { Logger } from "../logger"

const IS_IOS = Platform.OS === "ios"

// Manual Protobuf encoder/decoder without google-protobuf library
class ProtobufEncoder {
  // Helper: Write varint
  private static writeVarint(value: number): number[] {
    const bytes: number[] = []
    let num = value >>> 0
    while (num >= 0x80) {
      bytes.push((num & 0x7f) | 0x80)
      num >>>= 7
    }
    bytes.push(num & 0x7f)
    return bytes
  }

  // Helper: Read varint
  private static readVarint(bytes: Uint8Array, offset: { value: number }): number {
    let result = 0
    let shift = 0
    while (offset.value < bytes.length) {
      const byte = bytes[offset.value++]
      result |= (byte & 0x7f) << shift
      if ((byte & 0x80) === 0) {
        return result
      }
      shift += 7
    }
    return result
  }

  // Helper: Write string
  private static writeString(fieldNumber: number, value: string): number[] {
    const bytes: number[] = []
    const tag = (fieldNumber << 3) | 2 // Wire type 2 (length-delimited)
    bytes.push(...this.writeVarint(tag))

    const strBytes = new TextEncoder().encode(value)
    bytes.push(...this.writeVarint(strBytes.length))
    bytes.push(...Array.from(strBytes))
    return bytes
  }

  // Helper: Write bool
  private static writeBool(fieldNumber: number, value: boolean): number[] {
    const bytes: number[] = []
    const tag = (fieldNumber << 3) | 0 // Wire type 0 (varint)
    bytes.push(...this.writeVarint(tag))
    bytes.push(value ? 1 : 0)
    return bytes
  }

  // Helper: Write message
  private static writeMessage(fieldNumber: number, messageBytes: number[]): number[] {
    const bytes: number[] = []
    const tag = (fieldNumber << 3) | 2 // Wire type 2 (length-delimited)
    bytes.push(...this.writeVarint(tag))
    bytes.push(...this.writeVarint(messageBytes.length))
    bytes.push(...messageBytes)
    return bytes
  }

  // Helper: Read string
  private static readString(bytes: Uint8Array, offset: { value: number }): string {
    const length = this.readVarint(bytes, offset)
    const strBytes = bytes.slice(offset.value, offset.value + length)
    offset.value += length
    return new TextDecoder().decode(strBytes)
  }

  // Helper: Read bool
  private static readBool(bytes: Uint8Array, offset: { value: number }): boolean {
    const value = this.readVarint(bytes, offset)
    return value !== 0
  }

  // Helper: Skip field
  private static skipField(wireType: number, bytes: Uint8Array, offset: { value: number }): void {
    switch (wireType) {
      case 0: // Varint
        this.readVarint(bytes, offset)
        break
      case 1: // 64-bit
        offset.value += 8
        break
      case 2: // Length-delimited
        const length = this.readVarint(bytes, offset)
        offset.value += length
        break
      case 5: // 32-bit
        offset.value += 4
        break
    }
  }
  // Encode AutofillUserInfo to binary
  static encodeUserInfo(data: AutofillUserInfo): Uint8Array {
    const bytes: number[] = []
    bytes.push(...this.writeString(1, data.email))
    bytes.push(...this.writeString(2, data.avatar))
    bytes.push(...this.writeString(3, data.hashPass))
    bytes.push(...this.writeString(4, data.token))
    bytes.push(...this.writeString(5, data.language))
    bytes.push(...this.writeBool(6, data.faceIdEnabled))
    bytes.push(...this.writeBool(7, data.isFree))
    return new Uint8Array(bytes)
  }

  // Decode AutofillUserInfo from binary
  static decodeUserInfo(bytes: Uint8Array): AutofillUserInfo {
    const offset = { value: 0 }
    const result: any = {}

    while (offset.value < bytes.length) {
      const tag = this.readVarint(bytes, offset)
      const fieldNumber = tag >>> 3
      const wireType = tag & 0x7

      switch (fieldNumber) {
        case 1:
          result.email = this.readString(bytes, offset)
          break
        case 2:
          result.avatar = this.readString(bytes, offset)
          break
        case 3:
          result.hashPass = this.readString(bytes, offset)
          break
        case 4:
          result.token = this.readString(bytes, offset)
          break
        case 5:
          result.language = this.readString(bytes, offset)
          break
        case 6:
          result.faceIdEnabled = this.readBool(bytes, offset)
          break
        case 7:
          result.isFree = this.readBool(bytes, offset)
          break
        default:
          this.skipField(wireType, bytes, offset)
      }
    }

    return result as AutofillUserInfo
  }

  // Encode IosAutofillTemporaryPassword to binary
  static encodeTempPassword(data: IosAutofillTemporaryPassword): Uint8Array {
    const bytes: number[] = []

    data.forEach((item) => {
      const itemBytes: number[] = []
      itemBytes.push(...this.writeString(1, item.username))
      itemBytes.push(...this.writeString(2, item.password))
      itemBytes.push(...this.writeString(3, item.name))
      itemBytes.push(...this.writeString(4, item.uri))
      bytes.push(...this.writeMessage(1, itemBytes))
    })

    return new Uint8Array(bytes)
  }

  // Decode IosAutofillTemporaryPassword from binary
  static decodeTempPassword(bytes: Uint8Array): IosAutofillTemporaryPassword {
    const offset = { value: 0 }
    const result: IosAutofillTemporaryPassword = []

    while (offset.value < bytes.length) {
      const tag = this.readVarint(bytes, offset)
      const fieldNumber = tag >>> 3
      const wireType = tag & 0x7

      if (fieldNumber === 1 && wireType === 2) {
        const length = this.readVarint(bytes, offset)
        const messageEnd = offset.value + length
        const item: any = {}

        while (offset.value < messageEnd) {
          const subTag = this.readVarint(bytes, offset)
          const subFieldNumber = subTag >>> 3
          const subWireType = subTag & 0x7

          switch (subFieldNumber) {
            case 1:
              item.username = this.readString(bytes, offset)
              break
            case 2:
              item.password = this.readString(bytes, offset)
              break
            case 3:
              item.name = this.readString(bytes, offset)
              break
            case 4:
              item.uri = this.readString(bytes, offset)
              break
            default:
              this.skipField(subWireType, bytes, offset)
          }
        }

        result.push(item)
      } else {
        this.skipField(wireType, bytes, offset)
      }
    }

    return result
  }

  // Encode IosAutofillPassword to binary
  static encodePassword(data: IosAutofillPassword): Uint8Array {
    const bytes: number[] = []

    data.forEach((item) => {
      const itemBytes: number[] = []
      itemBytes.push(...this.writeString(1, item.id))
      itemBytes.push(...this.writeString(2, item.name))
      itemBytes.push(...this.writeString(3, item.uri))
      itemBytes.push(...this.writeString(4, item.username))
      itemBytes.push(...this.writeString(5, item.password))
      itemBytes.push(...this.writeBool(6, item.isOwner))
      if (item.otp) {
        itemBytes.push(...this.writeString(7, item.otp))
      }
      if (item.fido2) {
        item.fido2.forEach((fido) => {
          const fidoBytes: number[] = []
          fidoBytes.push(...this.writeString(1, fido.credentialId))
          fidoBytes.push(...this.writeString(2, fido.keyValue))
          fidoBytes.push(...this.writeString(3, fido.rpId))
          fidoBytes.push(...this.writeString(4, fido.userHandle))
          fidoBytes.push(...this.writeString(5, fido.userName))
          fidoBytes.push(...this.writeString(6, fido.creationDate))
          itemBytes.push(...this.writeMessage(8, fidoBytes))
        })
      }
      bytes.push(...this.writeMessage(1, itemBytes))
    })

    return new Uint8Array(bytes)
  }

  // Decode IosAutofillPassword from binary
  static decodePassword(bytes: Uint8Array): IosAutofillPassword {
    const offset = { value: 0 }
    const result: IosAutofillPassword = []

    while (offset.value < bytes.length) {
      const tag = this.readVarint(bytes, offset)
      const fieldNumber = tag >>> 3
      const wireType = tag & 0x7

      if (fieldNumber === 1 && wireType === 2) {
        const length = this.readVarint(bytes, offset)
        const messageEnd = offset.value + length
        const item: any = { fido2: [] }

        while (offset.value < messageEnd) {
          const subTag = this.readVarint(bytes, offset)
          const subFieldNumber = subTag >>> 3
          const subWireType = subTag & 0x7

          switch (subFieldNumber) {
            case 1:
              item.id = this.readString(bytes, offset)
              break
            case 2:
              item.name = this.readString(bytes, offset)
              break
            case 3:
              item.uri = this.readString(bytes, offset)
              break
            case 4:
              item.username = this.readString(bytes, offset)
              break
            case 5:
              item.password = this.readString(bytes, offset)
              break
            case 6:
              item.isOwner = this.readBool(bytes, offset)
              break
            case 7:
              item.otp = this.readString(bytes, offset)
              break
            case 8:
              // Decode Fido2SimpleView
              const fidoLength = this.readVarint(bytes, offset)
              const fidoEnd = offset.value + fidoLength
              const fido: any = {}

              while (offset.value < fidoEnd) {
                const fidoTag = this.readVarint(bytes, offset)
                const fidoFieldNumber = fidoTag >>> 3
                const fidoWireType = fidoTag & 0x7

                switch (fidoFieldNumber) {
                  case 1:
                    fido.credentialId = this.readString(bytes, offset)
                    break
                  case 2:
                    fido.keyValue = this.readString(bytes, offset)
                    break
                  case 3:
                    fido.rpId = this.readString(bytes, offset)
                    break
                  case 4:
                    fido.userHandle = this.readString(bytes, offset)
                    break
                  case 5:
                    fido.userName = this.readString(bytes, offset)
                    break
                  case 6:
                    fido.creationDate = this.readString(bytes, offset)
                    break
                  default:
                    this.skipField(fidoWireType, bytes, offset)
                }
              }
              item.fido2.push(fido)
              break
            default:
              this.skipField(subWireType, bytes, offset)
          }
        }
        result.push(item)
      } else {
        this.skipField(wireType, bytes, offset)
      }
    }

    return result
  }

  // Encode IosAutofillTemporaryPasskey to binary
  static encodeTempPasskey(data: IosAutofillTemporaryPasskey): Uint8Array {
    const bytes: number[] = []

    data.forEach((item) => {
      const itemBytes: number[] = []
      itemBytes.push(...this.writeString(1, item.id))
      itemBytes.push(...this.writeString(2, item.credentialId))
      itemBytes.push(...this.writeString(3, item.keyValue))
      itemBytes.push(...this.writeString(4, item.rpId))
      itemBytes.push(...this.writeString(5, item.userHandle))
      itemBytes.push(...this.writeString(6, item.userName))
      itemBytes.push(...this.writeString(7, item.creationDate))
      bytes.push(...this.writeMessage(1, itemBytes))
    })

    return new Uint8Array(bytes)
  }

  // Decode IosAutofillTemporaryPasskey from binary
  static decodeTempPasskey(bytes: Uint8Array): IosAutofillTemporaryPasskey {
    const offset = { value: 0 }
    const result: IosAutofillTemporaryPasskey = []

    while (offset.value < bytes.length) {
      const tag = this.readVarint(bytes, offset)
      const fieldNumber = tag >>> 3
      const wireType = tag & 0x7

      if (fieldNumber === 1 && wireType === 2) {
        const length = this.readVarint(bytes, offset)
        const messageEnd = offset.value + length
        const item: any = {}

        while (offset.value < messageEnd) {
          const subTag = this.readVarint(bytes, offset)
          const subFieldNumber = subTag >>> 3
          const subWireType = subTag & 0x7

          switch (subFieldNumber) {
            case 1:
              item.id = this.readString(bytes, offset)
              break
            case 2:
              item.credentialId = this.readString(bytes, offset)
              break
            case 3:
              item.keyValue = this.readString(bytes, offset)
              break
            case 4:
              item.rpId = this.readString(bytes, offset)
              break
            case 5:
              item.userHandle = this.readString(bytes, offset)
              break
            case 6:
              item.userName = this.readString(bytes, offset)
              break
            case 7:
              item.creationDate = this.readString(bytes, offset)
              break
            default:
              this.skipField(subWireType, bytes, offset)
          }
        }
        result.push(item)
      } else {
        this.skipField(wireType, bytes, offset)
      }
    }

    return result
  }

  // Encode IosAutofillOTP to binary
  static encodeOTP(data: IosAutofillOTP): Uint8Array {
    const bytes: number[] = []

    data.forEach((item) => {
      const itemBytes: number[] = []
      itemBytes.push(...this.writeString(1, item.id))
      itemBytes.push(...this.writeString(2, item.name))
      itemBytes.push(...this.writeString(3, item.otp))
      bytes.push(...this.writeMessage(1, itemBytes))
    })

    return new Uint8Array(bytes)
  }

  // Decode IosAutofillOTP from binary
  static decodeOTP(bytes: Uint8Array): IosAutofillOTP {
    const offset = { value: 0 }
    const result: IosAutofillOTP = []

    while (offset.value < bytes.length) {
      const tag = this.readVarint(bytes, offset)
      const fieldNumber = tag >>> 3
      const wireType = tag & 0x7

      if (fieldNumber === 1 && wireType === 2) {
        const length = this.readVarint(bytes, offset)
        const messageEnd = offset.value + length
        const item: any = {}

        while (offset.value < messageEnd) {
          const subTag = this.readVarint(bytes, offset)
          const subFieldNumber = subTag >>> 3
          const subWireType = subTag & 0x7

          switch (subFieldNumber) {
            case 1:
              item.id = this.readString(bytes, offset)
              break
            case 2:
              item.name = this.readString(bytes, offset)
              break
            case 3:
              item.otp = this.readString(bytes, offset)
              break
            default:
              this.skipField(subWireType, bytes, offset)
          }
        }
        result.push(item)
      } else {
        this.skipField(wireType, bytes, offset)
      }
    }

    return result
  }
}

/**
 * Protobuf-based Keychain Service
 * Uses Protocol Buffers for more efficient binary serialization compared to JSON
 */
export class KeychainProtobufService {
  // User Info methods
  public async saveUserInfo(data: AutofillUserInfo) {
    const platformData = Platform.select({
      ios: data,
      android: {
        email: data.email,
        hashPass: data.hashPass,
      } as any,
      default: data,
    })

    const encoded = ProtobufEncoder.encodeUserInfo(platformData)
    const base64Data = this.bufferToBase64(encoded)

    await this.saveShared(
      AutofillStorekey.USER_INFO.service,
      AutofillStorekey.USER_INFO.username,
      base64Data
    )
  }

  public async getUserInfo(): Promise<AutofillUserInfo | null> {
    const res = await this.loadShared(AutofillStorekey.USER_INFO.service)
    if (!res || !res.password) {
      return null
    }

    try {
      const buffer = this.base64ToBuffer(res.password)
      return ProtobufEncoder.decodeUserInfo(buffer)
    } catch (e) {
      Logger.error(`getUserInfo decode error: ` + e)
      return null
    }
  }

  // Password methods
  public async savePassword(data: IosAutofillPassword) {
    if (!IS_IOS) return

    const encoded = ProtobufEncoder.encodePassword(data)
    const base64Data = this.bufferToBase64(encoded)

    await this.saveShared(
      AutofillStorekey.PASSWORD.service,
      AutofillStorekey.PASSWORD.username,
      base64Data
    )
  }

  public async getPasswords(): Promise<IosAutofillPassword | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(AutofillStorekey.PASSWORD.service)
    if (!res || !res.password) {
      return null
    }

    try {
      const buffer = this.base64ToBuffer(res.password)
      return ProtobufEncoder.decodePassword(buffer)
    } catch (e) {
      Logger.error(`getPasswords decode error: ` + e)
      return null
    }
  }

  // Temporary Password methods
  public async saveTempPassword(data: IosAutofillTemporaryPassword) {
    if (!IS_IOS) return

    const encoded = ProtobufEncoder.encodeTempPassword(data)
    const base64Data = this.bufferToBase64(encoded)

    await this.saveShared(
      AutofillStorekey.TEMP_PASSWORD.service,
      AutofillStorekey.TEMP_PASSWORD.username,
      base64Data
    )
  }

  public async getTempPassword(): Promise<IosAutofillTemporaryPassword | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(AutofillStorekey.TEMP_PASSWORD.service)
    if (!res || !res.password) {
      return null
    }

    try {
      const buffer = this.base64ToBuffer(res.password)
      return ProtobufEncoder.decodeTempPassword(buffer)
    } catch (e) {
      Logger.error(`getTempPassword decode error: ` + e)
      return null
    }
  }

  public async resetTempPassword() {
    if (!IS_IOS) return

    await this.saveShared(
      AutofillStorekey.TEMP_PASSWORD.service,
      AutofillStorekey.TEMP_PASSWORD.username,
      ""
    )
  }

  // Temporary Passkey methods
  public async saveTempPasskey(data: IosAutofillTemporaryPasskey) {
    if (!IS_IOS) return

    const encoded = ProtobufEncoder.encodeTempPasskey(data)
    const base64Data = this.bufferToBase64(encoded)

    await this.saveShared(
      AutofillStorekey.TEMP_PASSKEY.service,
      AutofillStorekey.TEMP_PASSKEY.username,
      base64Data
    )
  }

  public async getTempPasskey(): Promise<IosAutofillTemporaryPasskey | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(AutofillStorekey.TEMP_PASSKEY.service)
    if (!res || !res.password) {
      return null
    }

    try {
      const buffer = this.base64ToBuffer(res.password)
      return ProtobufEncoder.decodeTempPasskey(buffer)
    } catch (e) {
      Logger.error(`getTempPasskey decode error: ` + e)
      return null
    }
  }

  public async resetTempPasskey() {
    if (!IS_IOS) return

    await this.saveShared(
      AutofillStorekey.TEMP_PASSKEY.service,
      AutofillStorekey.TEMP_PASSKEY.username,
      ""
    )
  }

  // OTP methods
  public async saveOTP(data: IosAutofillOTP) {
    if (!IS_IOS) return

    const encoded = ProtobufEncoder.encodeOTP(data)
    const base64Data = this.bufferToBase64(encoded)

    await this.saveShared(AutofillStorekey.OTP.service, AutofillStorekey.OTP.username, base64Data)
  }

  public async getOTP(): Promise<IosAutofillOTP | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(AutofillStorekey.OTP.service)
    if (!res || !res.password) {
      return null
    }

    try {
      const buffer = this.base64ToBuffer(res.password)
      return ProtobufEncoder.decodeOTP(buffer)
    } catch (e) {
      Logger.error(`getOTP decode error: ` + e)
      return null
    }
  }

  public async getTempOTP(): Promise<IosAutofillTemporaryPassword | null> {
    if (!IS_IOS) return null

    const res = await this.loadShared(AutofillStorekey.TEMP_OTP.service)
    if (!res || !res.password) {
      return null
    }

    try {
      const buffer = this.base64ToBuffer(res.password)
      return ProtobufEncoder.decodeTempPassword(buffer)
    } catch (e) {
      Logger.error(`getTempOTP decode error: ` + e)
      return null
    }
  }

  public async resetTempOTP() {
    if (!IS_IOS) return

    await this.saveShared(AutofillStorekey.TEMP_OTP.service, AutofillStorekey.TEMP_OTP.username, "")
  }

  // Reset all protobuf data
  public async resetAll() {
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.USER_INFO.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.PASSWORD.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.TEMP_PASSWORD.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.TEMP_PASSKEY.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.OTP.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
    ReactNativeKeychain.resetGenericPassword({
      service: AutofillStorekey.TEMP_OTP.service,
      accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
    })
  }

  // Private helper methods
  private async saveShared(service: string, username: string, password: string) {
    try {
      await ReactNativeKeychain.setGenericPassword(username, password, {
        service,
        accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
      })
    } catch (e) {
      Logger.error(`saveShared ${username}: ` + e)
    }
  }

  private async loadShared(service: string) {
    try {
      const credentials = await ReactNativeKeychain.getGenericPassword({
        service,
        accessGroup: Config.SHARED_KEYCHAIN_ACCESS_GROUP,
      })
      return credentials
    } catch (e) {
      Logger.error(`loadShared: ` + e)
      return false
    }
  }

  private bufferToBase64(buffer: Uint8Array): string {
    let binary = ""
    const len = buffer.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i])
    }
    return btoa(binary)
  }

  private base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64)
    const len = binary.length
    const buffer = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i)
    }
    return buffer
  }
}

export const autofillKeyChain = new KeychainProtobufService()
