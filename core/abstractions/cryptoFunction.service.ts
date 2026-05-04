import { DecryptParameters } from "../models/domain/decryptParameters"
import { SymmetricCryptoKey } from "../models/domain/symmetricCryptoKey"

export abstract class CryptoFunctionService {
  abstract pbkdf2: (
    password: string | ArrayBuffer,
    salt: string | ArrayBuffer,
    algorithm: "sha256" | "sha512",
    iterations: number
  ) => Promise<ArrayBuffer>
  abstract argon2id: (
    password: string,
    salt: string,
    iterations: number,
    memory: number,
    parallelism: number,
    outputByteSize: number
  ) => Promise<ArrayBuffer>
  abstract hkdf: (
    ikm: ArrayBuffer,
    salt: string | ArrayBuffer,
    info: string | ArrayBuffer,
    outputByteSize: number,
    algorithm: "sha256" | "sha512"
  ) => Promise<ArrayBuffer>
  abstract hkdfExpand: (
    prk: ArrayBuffer,
    info: string | ArrayBuffer,
    outputByteSize: number,
    algorithm: "sha256" | "sha512"
  ) => Promise<ArrayBuffer>
  abstract hash: (
    value: string | ArrayBuffer,
    algorithm: "sha1" | "sha256" | "sha512" | "md5"
  ) => Promise<ArrayBuffer>
  abstract hmac: (
    value: ArrayBuffer,
    key: ArrayBuffer,
    algorithm: "sha1" | "sha256" | "sha512"
  ) => Promise<ArrayBuffer>
  abstract compare: (a: ArrayBuffer, b: ArrayBuffer) => Promise<boolean>
  abstract hmacFast: (
    value: ArrayBuffer,
    key: ArrayBuffer,
    algorithm: "sha1" | "sha256" | "sha512"
  ) => Promise<ArrayBuffer>
  abstract compareFast: (a: ArrayBuffer, b: ArrayBuffer) => Promise<boolean>
  abstract aesEncrypt: (
    data: ArrayBuffer,
    iv: ArrayBuffer,
    key: ArrayBuffer
  ) => Promise<ArrayBuffer>
  abstract aesDecryptFastParameters: (
    data: string,
    iv: string,
    mac: string,
    key: SymmetricCryptoKey
  ) => DecryptParameters<ArrayBuffer | string>
  abstract aesDecryptFast: (parameters: DecryptParameters<ArrayBuffer>) => Promise<string>
  abstract aesDecrypt: (
    data: ArrayBuffer,
    iv: ArrayBuffer,
    key: ArrayBuffer
  ) => Promise<ArrayBuffer>
  abstract rsaEncrypt: (
    data: ArrayBuffer,
    publicKey: ArrayBuffer,
    algorithm: "sha1" | "sha256"
  ) => Promise<ArrayBuffer>
  abstract rsaDecrypt: (
    data: ArrayBuffer,
    privateKey: ArrayBuffer,
    algorithm: "sha1" | "sha256"
  ) => Promise<ArrayBuffer>
  abstract rsaExtractPublicKey: (privateKey: ArrayBuffer) => Promise<ArrayBuffer>
  abstract rsaGenerateKeyPair: (length: 1024 | 2048 | 4096) => Promise<[ArrayBuffer, ArrayBuffer]>
  abstract randomBytes: (length: number) => Promise<ArrayBuffer>
}
