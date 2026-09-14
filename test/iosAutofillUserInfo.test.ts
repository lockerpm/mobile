import { KdfType } from "core/enums/kdfType"

import { AutofillUserInfo, ProtobufEncoder } from "../app/utils/autofill.ios"

const baseUserInfo: AutofillUserInfo = {
  email: "user@example.com",
  avatar: "",
  hashPass: "autofill-hash",
  token: "token",
  language: "en",
  faceIdEnabled: false,
  isFree: false,
  kdf: KdfType.PBKDF2_SHA256,
  kdf_iterations: 600000,
  kdf_memory: 0,
  kdf_parallelism: 0,
  kdf_version: 0,
}

const writeVarint = (value: number) => {
  const bytes: number[] = []
  let remaining = value >>> 0
  while (remaining >= 0x80) {
    bytes.push((remaining & 0x7f) | 0x80)
    remaining >>>= 7
  }
  bytes.push(remaining)
  return bytes
}

const writeString = (fieldNumber: number, value: string) => {
  const valueBytes = new TextEncoder().encode(value)
  return [...writeVarint((fieldNumber << 3) | 2), ...writeVarint(valueBytes.length), ...valueBytes]
}

const legacyUserInfo = () =>
  new Uint8Array([
    ...writeString(1, baseUserInfo.email),
    ...writeString(2, baseUserInfo.avatar),
    ...writeString(3, baseUserInfo.hashPass),
    ...writeString(4, baseUserInfo.token),
    ...writeString(5, baseUserInfo.language),
    ...writeVarint((6 << 3) | 0),
    0,
    ...writeVarint((7 << 3) | 0),
    0,
  ])

describe("iOS Autofill UserInfo protobuf", () => {
  it.each([
    baseUserInfo,
    {
      ...baseUserInfo,
      kdf: KdfType.ARGON2ID,
      kdf_iterations: 3,
      kdf_memory: 64 * 1024,
      kdf_parallelism: 4,
      kdf_version: 19,
    },
  ])("round-trips the complete master-password encode config", (userInfo) => {
    expect(ProtobufEncoder.decodeUserInfo(ProtobufEncoder.encodeUserInfo(userInfo))).toEqual(
      userInfo
    )
  })

  it("uses the historical PBKDF2 config for a legacy payload", () => {
    expect(ProtobufEncoder.decodeUserInfo(legacyUserInfo())).toMatchObject({
      kdf: KdfType.PBKDF2_SHA256,
      kdf_iterations: 100000,
      kdf_memory: 0,
      kdf_parallelism: 0,
      kdf_version: 0,
    })
  })

  it("preserves KDF config when user preferences are updated", () => {
    const decoded = ProtobufEncoder.decodeUserInfo(ProtobufEncoder.encodeUserInfo(baseUserInfo))
    const updated = { ...decoded, language: "vi", faceIdEnabled: true }

    expect(ProtobufEncoder.decodeUserInfo(ProtobufEncoder.encodeUserInfo(updated))).toMatchObject({
      language: "vi",
      faceIdEnabled: true,
      kdf: baseUserInfo.kdf,
      kdf_iterations: baseUserInfo.kdf_iterations,
      kdf_memory: baseUserInfo.kdf_memory,
      kdf_parallelism: baseUserInfo.kdf_parallelism,
      kdf_version: baseUserInfo.kdf_version,
    })
  })

  it("rejects a partially appended config", () => {
    const partial = new Uint8Array([
      ...legacyUserInfo(),
      ...writeVarint((8 << 3) | 0),
      KdfType.ARGON2ID,
    ])

    expect(() => ProtobufEncoder.decodeUserInfo(partial)).toThrow(
      "Incomplete master password encode config"
    )
  })

  it("rejects unknown KDF and invalid Argon2 parameters", () => {
    expect(() =>
      ProtobufEncoder.decodeUserInfo(
        ProtobufEncoder.encodeUserInfo({ ...baseUserInfo, kdf: 99 as KdfType })
      )
    ).toThrow("Invalid master password encode config")

    expect(() =>
      ProtobufEncoder.decodeUserInfo(
        ProtobufEncoder.encodeUserInfo({
          ...baseUserInfo,
          kdf: KdfType.ARGON2ID,
          kdf_iterations: 3,
          kdf_memory: 0,
          kdf_parallelism: 4,
        })
      )
    ).toThrow("Invalid master password encode config")
  })
})
