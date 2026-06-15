import moment from "moment"
import DeviceInfo from "react-native-device-info"

import { useStores } from "app/models"
import { removeSecure } from "app/utils/storage"
import { CipherType } from "core/enums"
import { SymmetricCryptoKey } from "core/models/domain"
import { CipherRequest } from "core/models/request"
import { CipherView, LoginUriView, LoginView } from "core/models/view"

import { useAppLocale } from "@/i18n"
import { MPEncodeConfig } from "@/static/types/user.types"
import { autofillKeyChain } from "@/utils/autofill.ios"
import { Base64 } from "@/utils/base64"
import { delay } from "@/utils/delay"
import { Logger } from "@/utils/logger"

import { useHelper } from "./useHelper"
import { useSocialLogout } from "./useSocialLogin"
import { useCoreService } from "../coreService"
import { getDeviceAuthCapabilities, promptDeviceAuth, useToast } from "../utils"

export function useAuthentication() {
  const { uiStore, user, cipherStore, folderStore, collectionStore, toolStore, enterpriseStore } =
    useStores()
  const {
    cryptoService,
    cryptoFunctionService,
    userService,
    folderService,
    cipherService,
    collectionService,
    platformUtilsService,
    messagingService,
    tokenService,
  } = useCoreService()
  const { translate } = useAppLocale()
  const { setApiTokens } = useHelper()
  const { notify, notifyTx, notifyApiError } = useToast()
  const { logoutAllServices } = useSocialLogout()

  // -------------------- AUTHENTICATION --------------------

  // Login vault using API
  const _loginUsingApi = async (
    keyConfig: {
      key: SymmetricCryptoKey
      keyHash: string
    } & MPEncodeConfig,
    masterPassword?: string,
    createMasterPasswordItem?: () => Promise<void>,
    onPremiseData?: boolean
  ) => {
    // Session login API
    const res = await user.sessionLogin({
      client_id: "mobile",
      password: keyConfig.keyHash, // keyHash,
      device_name: platformUtilsService.getDeviceString(),
      device_type: platformUtilsService.getDevice(),
      // device_identifier: await storageService.get('device_id') || randomString(),
      device_identifier: await DeviceInfo.getUniqueId(),
      email: user.email,
    })
    if (res.kind === "unauthorized") {
      notifyTx("error", "error:token_expired")
      return { kind: "unauthorized" }
    }

    if (res.kind !== "ok") {
      if (res.kind === "bad-data") {
        if (res.data.code === "1008") {
          notify(
            "error",
            `${translate("error:login_locked")} ${moment
              .duration(res.data.wait, "seconds")
              .humanize()}`
          )
        } else if (res.data.code === "1009") {
          return { kind: "enterprise-lock" }
        } else if (res.data.code === "1010") {
          return { kind: "enterprise-system-lock" }
        } else if (res.data.code === "1011") {
          return { kind: "enterprise-belongs" }
        } else if (res.data.code === "0004") {
          notifyTx("error", "error:incorrect_pw")
        } else {
          notifyApiError(res)
        }
        return res
      }
      notifyTx("error", "error:session_login_failed")
      return res
    }

    if (onPremiseData) {
      setApiTokens(res.data?.access_token)
    }
    await Promise.all([user.getUser(), user.getUserPw()])

    // Setup service
    messagingService.send("loggedIn")

    await tokenService.setTokens(res.data.access_token, res.data.refresh_token)
    await userService.setInformation(
      tokenService.getUserId(),
      user.email,
      keyConfig.kdf,
      keyConfig.kdf_version ?? 0,
      keyConfig.kdf_iterations,
      keyConfig.kdf_memory ?? 0,
      keyConfig.kdf_parallelism ?? 0
    )
    await cryptoService.setKey(keyConfig.key)
    await cryptoService.setKeyHash(keyConfig.keyHash)
    await cryptoService.setEncKey(res.data.key)
    await cryptoService.setEncPrivateKey(res.data.private_key)
    // setup service offline
    if (masterPassword) {
      const autofillHashedPassword = await cryptoService.hashPasswordAutofill(
        masterPassword,
        keyConfig.key.keyB64
      )
      await cryptoService.setAutofillKeyHash(autofillHashedPassword)
      // await syncAutofillData();
    }

    if (res.data.has_no_master_pw_item && createMasterPasswordItem !== undefined) {
      await createMasterPasswordItem()
      uiStore.setHasNoMasterPwItem(true)
    }
    return { kind: "ok" }
  }

  // Login vault using API
  const _loginOnPremiseSessionOtp = async (
    keyConfig: {
      key: SymmetricCryptoKey
      keyHash: string
    } & MPEncodeConfig,
    masterPassword: string,
    method: string,
    otp: string,
    save_device: boolean
  ) => {
    // Session login API
    const res = await user.sessionOtpLogin({
      client_id: "mobile",
      password: keyConfig.keyHash, // keyHash,
      device_name: platformUtilsService.getDeviceString(),
      device_type: platformUtilsService.getDevice(),
      // device_identifier: await storageService.get('device_id') || randomString(),
      device_identifier: await DeviceInfo.getUniqueId(),
      email: user.email,
      method,
      otp,
      save_device,
    })
    if (res.kind === "unauthorized") {
      notifyTx("error", "error:token_expired")
      return { kind: "unauthorized" }
    }
    if (res.kind !== "ok") {
      notifyTx("error", "error:session_login_failed")
      return res
    }

    setApiTokens(res.data?.access_token)
    await Promise.all([user.getUser(), user.getUserPw()])

    // Setup service
    messagingService.send("loggedIn")

    await tokenService.setTokens(res.data.access_token, res.data.refresh_token)
    await userService.setInformation(
      tokenService.getUserId(),
      user.email,
      keyConfig.kdf,
      keyConfig.kdf_version ?? 0,
      keyConfig.kdf_iterations,
      keyConfig.kdf_memory ?? 0,
      keyConfig.kdf_parallelism ?? 0
    )
    await cryptoService.setKey(keyConfig.key)
    await cryptoService.setKeyHash(keyConfig.keyHash)
    await cryptoService.setEncKey(res.data.key)
    await cryptoService.setEncPrivateKey(res.data.private_key)
    // setup service offline
    if (masterPassword) {
      const autofillHashedPassword = await cryptoService.hashPasswordAutofill(
        masterPassword,
        keyConfig.key.keyB64
      )
      await cryptoService.setAutofillKeyHash(autofillHashedPassword)
      // await syncAutofillData();
    }

    return { kind: "ok" }
  }

  // Session login
  const sessionLogin = async (
    encodeConfig: MPEncodeConfig,
    masterPassword: string,
    createMasterPasswordItem?: () => Promise<void>,
    onPremiseData?: boolean
  ): Promise<{ kind: string }> => {
    try {
      await delay(100)

      const key = await cryptoService.makeKey(
        masterPassword,
        user.email,
        encodeConfig.kdf,
        encodeConfig.kdf_iterations,
        encodeConfig.kdf_memory,
        encodeConfig.kdf_parallelism
      )

      // Offline compare
      if (uiStore.isOffline) {
        const storedKeyHash = await cryptoService.getKeyHash()
        if (storedKeyHash) {
          const passwordValid = await cryptoService.compareAndUpdateKeyHash(masterPassword, key)
          if (passwordValid) {
            messagingService.send("loggedIn")

            // Fake set key
            await cryptoService.setKey(key)
            return { kind: "ok" }
          }
        }
      }

      // Online session login
      const keyHash = await cryptoService.hashPassword(masterPassword, key)
      return _loginUsingApi(
        {
          key,
          keyHash,
          ...encodeConfig,
        },
        masterPassword,
        createMasterPasswordItem,
        onPremiseData
      )
    } catch (e) {
      Logger.error("sessionLogin: " + e)
      notifyTx("error", "error:session_login_failed")
      return { kind: "bad-data" }
    }
  }
  // password less qr login
  const sessionQrLogin = async (
    encodeConfig: MPEncodeConfig,
    qr: string,
    qrOtp: string,
    onPremise?: boolean
  ): Promise<{ kind: string }> => {
    try {
      await delay(100)
      const keyStr = (qrOtp + qrOtp + qrOtp).slice(0, 16)
      const keyBuff = Base64.fromUtf8ToArray(keyStr).buffer

      // parse qr
      const iv = Base64.fromB64ToArray(qr.split(".")[0]).buffer
      const encryptB64 = Base64.fromB64ToArray(qr.split(".")[1]).buffer

      const dataBuffer = await cryptoFunctionService.aesDecrypt(encryptB64, iv, keyBuff)
      const data = Base64.fromBufferToUtf8(dataBuffer)
      const [keyHash, keyB64, encType] = data.split(".")

      const key = new SymmetricCryptoKey(Base64.fromB64ToArray(keyB64).buffer, parseInt(encType))
      // Online session login
      return _loginUsingApi(
        {
          key,
          keyHash,
          ...encodeConfig,
        },
        "",
        () => null,
        onPremise
      )
    } catch (e) {
      notifyTx("error", "error:session_login_failed")
      return { kind: "bad-data" }
    }
  }

  // password less qr login
  const sessionBusinessQrLogin = async (
    encodeConfig: MPEncodeConfig,
    qr: string,
    qrOtp: string
  ): Promise<{ kind: string }> => {
    try {
      await delay(100)
      const keyStr = (qrOtp + qrOtp + qrOtp).slice(0, 16)
      const keyBuff = Base64.fromUtf8ToArray(keyStr).buffer

      // parse qr
      const iv = Base64.fromB64ToArray(qr.split(".")[0]).buffer
      const encryptB64 = Base64.fromB64ToArray(qr.split(".")[1]).buffer

      const dataBuffer = await cryptoFunctionService.aesDecrypt(encryptB64, iv, keyBuff)
      const data = Base64.fromBufferToUtf8(dataBuffer)
      const [keyHash, keyB64, encType] = data.split(".")

      const key = new SymmetricCryptoKey(Base64.fromB64ToArray(keyB64).buffer, parseInt(encType))
      // Online session login
      return _loginUsingApi({
        key,
        keyHash,
        ...encodeConfig,
      })
    } catch (e) {
      Logger.error("sessionBusinessQrLogin: ", e)
      notifyTx("error", "error:session_login_failed")
      return { kind: "bad-data" }
    }
  }

  // Session login
  const sessionOtpLoginWithHashPassword = async (
    encodeConfig: MPEncodeConfig,
    masterPasswordHash: string,
    key: SymmetricCryptoKey,
    method: string,
    otp: string,
    save_device: boolean
  ): Promise<{ kind: string }> => {
    try {
      await delay(100)
      return _loginOnPremiseSessionOtp(
        {
          key,
          keyHash: masterPasswordHash,
          ...encodeConfig,
        },
        "",
        method,
        otp,
        save_device
      )
    } catch (e) {
      Logger.error("sessionOtpLoginWithHashPassword: ", e)
      notifyTx("error", "error:session_login_failed")
      return { kind: "bad-data" }
    }
  }

  // Session login
  const sessionOtpLogin = async (
    encodeConfig: MPEncodeConfig,
    masterPassword: string,
    method: string,
    otp: string,
    save_device: boolean
  ): Promise<{ kind: string }> => {
    try {
      await delay(100)

      const key = await cryptoService.makeKey(
        masterPassword,
        user.email,
        encodeConfig.kdf,
        encodeConfig.kdf_iterations,
        encodeConfig.kdf_memory,
        encodeConfig.kdf_parallelism
      )

      // Offline compare
      if (uiStore.isOffline) {
        const storedKeyHash = await cryptoService.getKeyHash()
        if (storedKeyHash) {
          const passwordValid = await cryptoService.compareAndUpdateKeyHash(masterPassword, key)
          if (passwordValid) {
            messagingService.send("loggedIn")

            // Fake set key
            await cryptoService.setKey(key)
            return { kind: "ok" }
          }
        }
      }

      // Online session login
      const keyHash = await cryptoService.hashPassword(masterPassword, key)
      return _loginOnPremiseSessionOtp(
        {
          key,
          keyHash,
          ...encodeConfig,
        },
        masterPassword,
        method,
        otp,
        save_device
      )
    } catch (e) {
      Logger.error("sessionOtpLogin: ", e)
      notifyTx("error", "error:session_login_failed")
      return { kind: "bad-data" }
    }
  }

  // Biometric login
  const biometricLogin = async (encodeConfig: MPEncodeConfig): Promise<{ kind: string }> => {
    try {
      await delay(100)
      const { hasBiometric, hasDevicePasscode } = await getDeviceAuthCapabilities()
      if (!hasBiometric && !hasDevicePasscode) {
        notifyTx("error", "error:biometric_not_support")
        return { kind: "bad-data" }
      }

      // Validate biometric (or device passcode fallback)
      const { success, error } = await promptDeviceAuth({
        promptMessage: translate("common:unlock_locker"),
        allowDeviceCredential: true,
        fallbackLabel: translate("common:use_device_passcode"),
      })
      if (!success) {
        if (error !== "user_cancel" && error !== "system_cancel") {
          notifyTx("error", "error:biometric_unlock_failed")
        }
        return { kind: "bad-data" }
      }
      // Offline login
      if (uiStore.isOffline) {
        const hasKey = await cryptoService.hasKey()
        if (!hasKey) {
          notifyTx("error", "error:session_login_failed")
          return { kind: "bad-data" }
        }
        // Fake set key
        messagingService.send("loggedIn")
        const storedKey = await cryptoService.getKey()
        await cryptoService.setKey(storedKey)
        return { kind: "ok" }
      }

      // Online login
      const key = await cryptoService.getKey()
      const keyHash = await cryptoService.getKeyHash()
      return _loginUsingApi({
        key: key!,
        keyHash: keyHash!,
        ...encodeConfig,
      })
    } catch (e) {
      return { kind: "bad-data" }
    }
  }

  // Set master password
  const registerLocker = async (
    masterPassword: string,
    hint: string,
    passwordStrength: number,
    encodeConfig: MPEncodeConfig
  ) => {
    try {
      await delay(100)
      const referenceData = ""
      const key = await cryptoService.makeKey(
        masterPassword,
        user.email,
        encodeConfig.kdf,
        encodeConfig.kdf_iterations,
        encodeConfig.kdf_memory,
        encodeConfig.kdf_parallelism
      )
      const encKey = await cryptoService.makeEncKey(key)
      const hashedPassword = await cryptoService.hashPassword(masterPassword, key)
      const keys = await cryptoService.makeKeyPair(encKey[0])

      const res = await user.registerLocker({
        name: user.full_name,
        email: user.email,
        master_password_hash: hashedPassword,
        master_password_hint: hint,
        key: encKey[1].encryptedString,
        kdf: encodeConfig.kdf,
        kdf_iterations: encodeConfig.kdf_iterations,
        kdf_memory: encodeConfig.kdf_memory,
        kdf_parallelism: encodeConfig.kdf_parallelism,
        reference_data: referenceData,
        keys: {
          public_key: keys[0],
          encrypted_private_key: keys[1].encryptedString,
        },
        score: passwordStrength,
      })

      // API failed
      if (res.kind !== "ok") {
        notifyApiError(res)
        return { kind: "bad-data" }
      }

      await cryptoService.setKey(key)
      await cryptoService.setKeyHash(hashedPassword)
      await cryptoService.setEncKey(encKey[1].encryptedString)
      await cryptoService.setEncPrivateKey(keys[1].encryptedString)

      const autofillHashedPassword = await cryptoService.hashPasswordAutofill(
        masterPassword,
        key.keyB64
      )
      await cryptoService.setAutofillKeyHash(autofillHashedPassword)

      // Success
      notifyTx("success", "success:master_password_updated")

      await delay(300)

      return { kind: "ok" }
    } catch (e) {
      Logger.error("registerLocker: " + e)
      notifyTx("error", "error:something_went_wrong")
      return { kind: "bad-data" }
    }
  }

  const _createMasterPwItem = (newPassword: string) => {
    const cipher = new CipherView()
    cipher.type = CipherType.Login
    const loginData = new LoginView()
    loginData.username = "locker.io"
    loginData.password = newPassword
    const uriView = new LoginUriView()
    uriView.uri = "https://locker.io"
    loginData.uris = [uriView]
    cipher.login = loginData
    cipher.name = "Locker Master Password"
    return cipher
  }

  const _createMasterPwItemRequest = async (newPassword: string) => {
    try {
      const cipher = _createMasterPwItem(newPassword)
      const cipherEnc = await cipherService.encrypt(cipher)
      const data = new CipherRequest(cipherEnc)
      data.type = CipherType.MasterPassword
      return data
    } catch (e) {
      Logger.error("_createMasterPwItemRequest: ", e)
      return null
    }
  }

  // Change master password
  const changeMasterPassword = async (
    oldPassword: string,
    newPassword: string,
    hint: string,
    encodeConfig: MPEncodeConfig
  ): Promise<{ kind: string }> => {
    try {
      // createMasterPwItem
      const data = await _createMasterPwItemRequest(newPassword)

      await delay(100)
      const key = await cryptoService.makeKey(
        newPassword,
        user.email,
        encodeConfig.kdf,
        encodeConfig.kdf_iterations,
        encodeConfig.kdf_memory,
        encodeConfig.kdf_parallelism
      )
      const keyHash = await cryptoService.hashPassword(newPassword, key)
      let encKey = null
      const existingEncKey = await cryptoService.getEncKey()
      if (existingEncKey == null) {
        encKey = await cryptoService.makeEncKey(key)
      } else {
        encKey = await cryptoService.remakeEncKey(key)
      }

      const oldKeyHash = await cryptoService.hashPassword(oldPassword, null)
      // Send API
      const res = await user.changeMasterPassword({
        key: encKey[1].encryptedString,
        new_master_password_hash: keyHash,
        master_password_hash: oldKeyHash,
        master_password_cipher: data,
        new_master_password_hint: hint || undefined,
        kdf: encodeConfig.kdf,
        kdf_iterations: encodeConfig.kdf_iterations,
        kdf_memory: encodeConfig.kdf_memory ?? 0,
        kdf_parallelism: encodeConfig.kdf_parallelism ?? 0,
      })
      if (res.kind !== "ok") {
        notifyApiError(res)
        return { kind: "bad-data" }
      }

      // Setup service
      notifyTx("success", "success:master_password_updated")
      await cryptoService.clearKeys()
      await logout()
      return { kind: "ok" }
    } catch (e) {
      Logger.error("changeMasterPassword: " + e)
      notifyTx("error", "error:something_went_wrong")
      return { kind: "bad-data" }
    }
  }

  // Logout
  const logout = async () => {
    try {
      await user.updateFCM("")
      await user.logout()
      await clearAllData()
      await logoutAllServices()
    } catch (e) {
      notifyTx("error", "error:something_went_wrong")
      Logger.error("logout: " + e)
    }
  }

  // Lock screen
  const lock = async () => {
    folderService.clearCache()
    cipherService.clearCache()
    collectionService.clearCache()

    cipherStore.lock()
    collectionStore.lock()
    folderStore.lock()
    toolStore.lock()
    user.lock()
  }

  // Clear all data
  const clearAllData = async (dataOnly?: boolean) => {
    try {
      cipherStore.clearStore(dataOnly)
      collectionStore.clearStore(dataOnly)
      folderStore.clearStore(dataOnly)
      toolStore.clearStore(dataOnly)
      enterpriseStore.clearStore(dataOnly)

      // Reset shared data
      await autofillKeyChain.resetAll()

      // TODO: remove this when RSA problem is fixed
      await removeSecure("decOrgKeys")

      // Clear services
      await Promise.all([
        folderService.clearCache(),
        cipherService.clearCache(),
        // searchService.clearCache()
        collectionService.clearCache(),
      ])

      const userId = await userService.getUserId()
      await Promise.all([
        folderService.clear(userId),
        cipherService.clear(userId),
        collectionService.clear(userId),
        cryptoService.clearKeys(),
        userService.clear(),
      ])
    } catch (e) {
      Logger.error("clearAllData: " + e)
    }
  }

  return {
    sessionLogin,
    sessionOtpLogin,
    biometricLogin,
    sessionQrLogin,
    sessionOtpLoginWithHashPassword,
    sessionBusinessQrLogin,

    logout,
    lock,
    registerLocker,
    changeMasterPassword,
    clearAllData,
  }
}
