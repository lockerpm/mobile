import { KdfType } from "../enums/kdfType"
import { EncArrayBuffer } from "../models/domain/encArrayBuffer"
import { EncString } from "../models/domain/encString"
import { SymmetricCryptoKey } from "../models/domain/symmetricCryptoKey"
import { ProfileOrganizationResponse } from "../models/response/profileOrganizationResponse"

export abstract class CryptoService {
  abstract setKey: (key: SymmetricCryptoKey) => Promise<void>
  abstract setKeyHash: (keyHash: string) => Promise<void>
  abstract setEncKey: (encKey: string) => Promise<void>
  abstract setEncPrivateKey: (encPrivateKey: string) => Promise<void>
  abstract setOrgKeys: (orgs: ProfileOrganizationResponse[]) => Promise<void>
  abstract getKey: () => Promise<SymmetricCryptoKey | null>
  abstract getKeyHash: () => Promise<string | null>
  abstract getEncKey: (key?: SymmetricCryptoKey) => Promise<SymmetricCryptoKey | null>
  abstract getPublicKey: () => Promise<ArrayBuffer | null>
  abstract getPrivateKey: () => Promise<ArrayBuffer | null>
  abstract getFingerprint: (userId: string, publicKey?: ArrayBuffer) => Promise<string[]>
  abstract getOrgKeys: () => Promise<Map<string, SymmetricCryptoKey> | null>
  abstract getOrgKey: (orgId: string) => Promise<SymmetricCryptoKey | null>
  abstract hasKey: () => Promise<boolean>
  abstract hasEncKey: () => Promise<boolean>
  abstract clearKey: () => Promise<void>
  abstract clearKeyHash: () => Promise<void>
  abstract clearEncKey: (memoryOnly?: boolean) => Promise<void>
  abstract clearKeyPair: (memoryOnly?: boolean) => Promise<void>
  abstract clearOrgKeys: (memoryOnly?: boolean) => Promise<void>
  abstract clearPinProtectedKey: () => Promise<void>
  abstract clearKeys: () => Promise<void>
  abstract toggleKey: () => Promise<void>
  abstract makeKey: (
    password: string,
    salt: string,
    kdf: KdfType,
    kdfIterations: number,
    kdfMemory?: number,
    kdfParallelism?: number
  ) => Promise<SymmetricCryptoKey>
  abstract makeKeyFromPin: (
    pin: string,
    salt: string,
    kdf: KdfType,
    kdfIterations: number,
    kdfMemory?: number,
    kdfParallelism?: number,
    protectedKeyCs?: EncString
  ) => Promise<SymmetricCryptoKey>
  abstract makeShareKey: () => Promise<[EncString, SymmetricCryptoKey]>
  abstract makeKeyPair: (key?: SymmetricCryptoKey) => Promise<[string, EncString]>
  abstract makePinKey: (
    pin: string,
    salt: string,
    kdf: KdfType,
    kdfIterations: number,
    kdfMemory?: number,
    kdfParallelism?: number
  ) => Promise<SymmetricCryptoKey>
  abstract makeSendKey: (keyMaterial: ArrayBuffer) => Promise<SymmetricCryptoKey>
  abstract hashPassword: (password: string, key: SymmetricCryptoKey) => Promise<string>
  abstract makeEncKey: (key: SymmetricCryptoKey) => Promise<[SymmetricCryptoKey, EncString]>
  abstract remakeEncKey: (
    key: SymmetricCryptoKey,
    encKey?: SymmetricCryptoKey
  ) => Promise<[SymmetricCryptoKey, EncString]>
  abstract encrypt: (
    plainValue: string | ArrayBuffer,
    key?: SymmetricCryptoKey
  ) => Promise<EncString>
  abstract encryptToBytes: (
    plainValue: ArrayBuffer,
    key?: SymmetricCryptoKey
  ) => Promise<EncArrayBuffer>
  abstract rsaEncrypt: (data: ArrayBuffer, publicKey?: ArrayBuffer) => Promise<EncString>
  abstract rsaDecrypt: (encValue: string) => Promise<ArrayBuffer>
  abstract decryptToBytes: (
    encString: EncString,
    key?: SymmetricCryptoKey
  ) => Promise<ArrayBuffer | null>
  abstract decryptToUtf8: (encString: EncString, key?: SymmetricCryptoKey) => Promise<string | null>
  abstract decryptFromBytes: (
    encBuf: ArrayBuffer,
    key: SymmetricCryptoKey
  ) => Promise<ArrayBuffer | null>
  abstract randomNumber: (min: number, max: number) => Promise<number>
  abstract validateKey: (key: SymmetricCryptoKey) => Promise<boolean>
}
