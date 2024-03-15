// PERMISSIONS
export const TEAM_COLLECTION_EDITOR = ["owner", "admin"]
export const TEAM_CIPHER_EDITOR = ["owner", "admin", "manager"]

// DATA
export const TEMP_PREFIX = "tmp__"
export const MAX_MULTIPLE_SHARE_COUNT = 20
export const IMPORT_BATCH_SIZE = 1000
export const BACKGROUND_DECRYPT_FIRST_BATCH_SIZE = 50
export const BACKGROUND_DECRYPT_BATCH_SIZE = 500
export const BACKGROUND_DECRYPT_REINDEX_EVERY = 2
export const MAX_CIPHER_SELECTION = 10000
export const MASTER_PW_MIN_LENGTH = 8

// FREE
export const FREE_PLAN_LIMIT = {
  CRYPTO: 5,
  IDENTITY: 10,
  LOGIN: 100,
  PAYMENT_CARD: 5,
  NOTE: 50,
  OTP: 10,
}

export const GEN = {
  MALE: "t",
  FEMALE: "f",
  OTHER: "o",
}
