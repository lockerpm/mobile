import { Passkey } from "react-native-passkey"

import { useStores } from "app/models"
import { useCoreService } from "app/services/coreService"
import { useToast } from "app/services/utils"
import { PasskeyItem } from "app/static/types"
import { Utils } from "core/misc/utils"
import { SymmetricCryptoKey } from "core/models/domain"

import { Logger } from "@/utils/logger"
import {
  PASSKEY_CHALLENGE_LENGTH,
  PRF_SALT_LENGTH,
  PasskeyPrfError,
  PasskeyPrfErrorCode,
  buildPrfCreateRequest,
  buildPrfGetRequest,
  findPasskeyByCredentialId,
  getPasskeyKdfConfig,
  getPreviousPrfRandom,
  getPrfUnlockCandidates,
  isPasskeyCancelledError,
  isPrfPasskeySupported,
  parsePrfCreateResult,
  parsePrfGetResult,
  toPasskeyItems,
} from "@/utils/passkeyPrf"

import { useAuthentication } from "./useAuthentication"

/**
 * Passkeys (WebAuthn PRF) used as a backup way to unlock the vault instead of the master password.
 * Mirrors `setBackupPasswordlessUsingPasskey` and `getPasswordlessUsingPasskeys`
 * of `@lockerpm/client-service`.
 */
export const usePasskeyBackup = () => {
  const { user } = useStores()
  const { cryptoService, cryptoFunctionService, userService } = useCoreService()
  const { notifyTx, notifyApiError } = useToast()
  const { sessionLogin } = useAuthentication()

  const randomBytes = async (length: number) =>
    new Uint8Array(await cryptoFunctionService.randomBytes(length))

  // ----------------------- LIST -----------------------

  const getPasskeys = async (): Promise<PasskeyItem[] | null> => {
    const res = await user.getPasswordlessCredentials()
    if (res.kind === "ok") {
      return toPasskeyItems(res.data)
    }
    // Passwordless is not set up for this account yet
    if (res.kind === "not-found") {
      return []
    }
    notifyApiError(res)
    return null
  }

  // ----------------------- VERIFY -----------------------

  const verifyMasterPassword = async (masterPassword: string) => {
    const encodeConfig = {
      kdf: userService.getKdf(),
      kdf_iterations: userService.getKdfIterations(),
      kdf_memory: userService.getKdfMemory(),
      kdf_parallelism: userService.getKdfParallelism(),
      kdf_version: userService.getKdfVersion(),
    }
    try {
      const key = await cryptoService.makeKey(
        masterPassword,
        user.email,
        encodeConfig.kdf,
        encodeConfig.kdf_iterations,
        encodeConfig.kdf_memory,
        encodeConfig.kdf_parallelism
      )
      if (await cryptoService.compareAndUpdateKeyHash(masterPassword, key)) {
        return true
      }
    } catch (e: any) {
      Logger.error("usePasskeyBackup", "verifyMasterPassword", e?.message)
      return false
    }
    // After a passkey unlock the stored key hash belongs to the passkey, verify online instead
    const res = await sessionLogin(encodeConfig, masterPassword)
    return res.kind === "ok"
  }

  // ----------------------- UNLOCK -----------------------

  /**
   * Authenticate with one of the account PRF passkeys and derive the key protecting the vault key,
   * the same way a master key is derived from the master password
   */
  const getPasskeyUnlockKey = async (): Promise<{
    key: SymmetricCryptoKey
    keyHash: string
  } | null> => {
    try {
      if (!isPrfPasskeySupported()) {
        throw new PasskeyPrfError(PasskeyPrfErrorCode.NOT_SUPPORTED)
      }

      const res = await user.getPasswordlessCredentials()
      if (res.kind !== "ok" && res.kind !== "not-found") {
        notifyApiError(res)
        return null
      }
      const candidates = res.kind === "ok" ? getPrfUnlockCandidates(res.data) : []
      if (!candidates.length) {
        notifyTx("error", "lock:passkey.no_passkey")
        return null
      }

      const request = buildPrfGetRequest({
        challenge: await randomBytes(PASSKEY_CHALLENGE_LENGTH),
        // All PRF passkeys of an account share the same salt
        salt: Utils.fromB64ToArray(candidates[0].random),
        allowCredentials: candidates.map((c) => ({
          idUrl: Utils.fromB64toUrlB64(c.credentialId),
          transports: c.transports,
        })),
      })
      const { credentialId, secret } = parsePrfGetResult(await Passkey.getPlatformKey(request))
      if (!secret) {
        throw new PasskeyPrfError(PasskeyPrfErrorCode.NO_PRF_SECRET)
      }
      const usedKey = findPasskeyByCredentialId(candidates, credentialId)
      if (!usedKey) {
        throw new Error("Unknown passkey")
      }

      const key = await cryptoService.makeKey(
        secret,
        user.email,
        usedKey.kdf,
        usedKey.kdfIterations,
        usedKey.kdfMemory ?? undefined,
        usedKey.kdfParallelism ?? undefined
      )
      const keyHash = await cryptoService.hashPassword(secret, key)
      return { key, keyHash }
    } catch (e: any) {
      if (isPasskeyCancelledError(e)) {
        return null
      }
      if (
        e?.code === PasskeyPrfErrorCode.NOT_SUPPORTED ||
        e?.code === PasskeyPrfErrorCode.NO_PRF_SECRET
      ) {
        notifyTx("error", "passkey:unlock.prf_unsupported")
        return null
      }
      // Only log the error code, the error may come from crypto operations
      Logger.error("usePasskeyBackup", "getPasskeyUnlockKey", e?.code ?? e?.error ?? e?.message)
      notifyTx("error", "lock:passkey.failed")
      return null
    }
  }

  // ----------------------- CREATE -----------------------

  // Create a platform passkey and evaluate PRF with the given salt
  const registerPrfPasskey = async (salt: Uint8Array) => {
    const challenge = await randomBytes(PASSKEY_CHALLENGE_LENGTH)
    const createRequest = buildPrfCreateRequest({
      // Timestamp prevents Android from overwriting an existing passkey of the same user
      userId: `${Date.now()}.${user.email}`,
      email: user.email,
      displayName: user.full_name || user.email,
      challenge,
      salt,
    })
    const created = parsePrfCreateResult(await Passkey.createPlatformKey(createRequest))
    if (!created.prfEnabled) {
      throw new PasskeyPrfError(PasskeyPrfErrorCode.PRF_UNSUPPORTED)
    }
    const { credentialId, transports } = created
    if (created.secret) {
      return { credentialId, transports, secret: created.secret }
    }

    // Some providers only evaluate PRF on assertion
    const getRequest = buildPrfGetRequest({
      challenge: await randomBytes(PASSKEY_CHALLENGE_LENGTH),
      salt,
      allowCredentials: [{ idUrl: created.credentialIdUrl, transports }],
    })
    const { secret } = parsePrfGetResult(await Passkey.getPlatformKey(getRequest))
    if (!secret) {
      throw new PasskeyPrfError(PasskeyPrfErrorCode.NO_PRF_SECRET)
    }
    return { credentialId, transports, secret }
  }

  const createPasskey = async (name: string): Promise<boolean> => {
    try {
      if (!isPrfPasskeySupported()) {
        throw new PasskeyPrfError(PasskeyPrfErrorCode.NOT_SUPPORTED)
      }

      const encKey = await cryptoService.getEncKey()
      if (!encKey) {
        throw new Error("Vault key is not available")
      }

      // All PRF passkeys of an account share the same salt
      const credentialsRes = await user.getPasswordlessCredentials()
      let previousRandom: string | undefined
      if (credentialsRes.kind === "ok") {
        previousRandom = getPreviousPrfRandom(credentialsRes.data)
      } else if (credentialsRes.kind !== "not-found") {
        notifyApiError(credentialsRes)
        return false
      }
      const salt = previousRandom
        ? Utils.fromB64ToArray(previousRandom)
        : await randomBytes(PRF_SALT_LENGTH)
      const random = previousRandom ?? Utils.fromBufferToB64(salt.buffer as ArrayBuffer)

      const preLoginRes = await user.preLogin()
      if (preLoginRes.kind !== "ok") {
        notifyApiError(preLoginRes)
        return false
      }
      const { kdf, kdfIterations, kdfMemory, kdfParallelism } = getPasskeyKdfConfig(
        preLoginRes.data
      )

      const created = await registerPrfPasskey(salt)

      // The base64 PRF output is used the same way as a master password
      const key = await cryptoService.makeKey(
        created.secret,
        user.email,
        kdf,
        kdfIterations,
        kdfMemory ?? undefined,
        kdfParallelism ?? undefined
      )
      const masterPasswordHash = await cryptoService.hashPassword(created.secret, key)
      const [, protectedEncKey] = await cryptoService.remakeEncKey(key, encKey)

      const res = await user.createBackupCredential({
        fd_credential_id: created.credentialId,
        fd_random: random,
        fd_transports: created.transports,
        key: protectedEncKey.encryptedString ?? "",
        master_password_hash: masterPasswordHash,
        name,
        type: "prf",
        kdf,
        kdf_iterations: kdfIterations,
        kdf_memory: kdfMemory,
        kdf_parallelism: kdfParallelism,
      })
      if (res.kind !== "ok") {
        notifyApiError(res)
        return false
      }
      return true
    } catch (e: any) {
      if (isPasskeyCancelledError(e)) {
        return false
      }
      if (
        e?.code === PasskeyPrfErrorCode.NOT_SUPPORTED ||
        e?.code === PasskeyPrfErrorCode.PRF_UNSUPPORTED
      ) {
        notifyTx("error", "passkey:unlock.prf_unsupported")
        return false
      }
      // Only log the error code, the error may come from crypto operations
      Logger.error("usePasskeyBackup", "createPasskey", e?.code ?? e?.error ?? e?.message)
      notifyTx("error", "passkey:unlock.create_failed")
      return false
    }
  }

  // ----------------------- DELETE -----------------------

  const deletePasskey = async (item: Pick<PasskeyItem, "id" | "isPrimary">) => {
    if (item.isPrimary) {
      return user.deletePrimaryPasswordlessCredential()
    }
    return user.deleteBackupCredential(item.id)
  }

  return {
    getPasskeys,
    verifyMasterPassword,
    getPasskeyUnlockKey,
    createPasskey,
    deletePasskey,
  }
}
