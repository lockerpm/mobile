import { KdfType } from "core/enums/kdfType"

export type PasswordlessCredentialType = "prf" | "hmac"

type PasswordlessKdfConfig = {
  kdf_version: number
  kdf: KdfType
  kdf_iterations: number
  kdf_memory: number | null
  kdf_parallelism: number | null
}

// GET /v3/cystack_platform/pm/passwordless/credential?email=
export type PasswordlessBackupKey = PasswordlessKdfConfig & {
  id: string
  credential_id: string
  random: string
  transports?: string[]
  name: string
  type: PasswordlessCredentialType
  creation_date: number | null
  last_use_date: number | null
}

export type PasswordlessCredentialResponse = PasswordlessKdfConfig & {
  credential_id: string | null
  random: string | null
  transports?: string[]
  name: string | null
  type: PasswordlessCredentialType
  creation_date: number | null
  last_use_date: number | null
  backup_keys: PasswordlessBackupKey[]
}

export type PasskeyItem = {
  // Empty string for the primary passwordless credential
  id: string
  name: string
  credentialId: string
  random: string
  transports: string[]
  creationDate: number | null
  lastUseDate: number | null
  isPrimary: boolean
}

// POST /v3/cystack_platform/pm/users/backup_credentials
export type CreateBackupCredentialRequest = {
  fd_credential_id: string
  fd_random: string
  fd_transports: string[]
  key: string
  master_password_hash: string
  name: string
  type: "prf"
  kdf: KdfType
  kdf_iterations: number
  kdf_memory: number | null
  kdf_parallelism: number | null
}
