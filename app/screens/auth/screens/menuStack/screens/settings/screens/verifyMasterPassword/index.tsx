import { FC, useEffect, useRef, useState } from "react"
import { observer } from "mobx-react-lite"

import { useStores } from "app/models"
import { SettingsScreenProps } from "app/navigators/navigators.types"
import { useCoreService } from "app/services/coreService"
import { useAuthentication } from "app/services/hook"
import { useBiometricType } from "app/services/utils"
import { BiometricsType, LoginMethod } from "app/static/types/enum"
import { KdfType } from "core/enums/kdfType"

import { MPEncodeConfig } from "@/static/types"

import { BusinessLockByPasswordless } from "./business"
import { LockByMasterPassword } from "./normal"

export const VerifyMasterPasswordScreen: FC<SettingsScreenProps<"verifyMasterPassword">> = observer(
  ({ navigation }) => {
    const { user } = useStores()
    const { cryptoService } = useCoreService()
    const { biometricLogin } = useAuthentication()

    // ---------------------- PARAMS -------------------------

    const [lockConfig, setLockConfig] = useState<
      {
        isLoading: boolean
        login_method: LoginMethod
      } & MPEncodeConfig
    >({
      isLoading: true,
      login_method: LoginMethod.PASSWORD,
      kdf: KdfType.PBKDF2_SHA256,
      kdf_iterations: 100000,
    })
    const { biometryType, hasDevicePasscode } = useBiometricType()
    const [isUnlocking, setIsUnlocking] = useState(false)
    // Guards the direct (already-focused) biometric trigger against effect re-runs
    const autoPromptedRef = useRef(false)

    // ---------------------- COMPUTED -------------------------

    // ---------------------- METHODS -------------------------

    const fetchLockType = async () => {
      const res = await user.preLogin()
      if (res.kind === "ok") {
        setLockConfig({
          isLoading: false,
          login_method: res.data.login_method,
          kdf: res.data.kdf,
          kdf_iterations: res.data.kdf_iterations,
          kdf_memory: res.data.kdf_memory ?? 0,
          kdf_parallelism: res.data.kdf_parallelism ?? 0,
          kdf_version: res.data.kdf_version ?? 0,
        })
      }
    }

    const handleLogout = async () => {
      navigation.goBack()
    }

    const handleUnlock = async () => {
      navigation.replace("export")
    }

    const handleUnlockBiometric = async (lockConfig: MPEncodeConfig) => {
      const key = await cryptoService.getKey()
      if (!key) return
      setIsUnlocking(true)
      const res = await biometricLogin(lockConfig)
      if (res.kind === "ok") {
        handleUnlock()
      }
      setIsUnlocking(false)
    }

    // -------------- EFFECT ------------------

    // Auto trigger face id / touch id + detect biometry type
    useEffect(() => {
      fetchLockType()
    }, [])

    // // Handle back press
    useEffect(() => {
      if (lockConfig.isLoading) return undefined

      const tryUnlockBiometric = () => {
        if (user.isBiometricUnlock && (biometryType !== BiometricsType.None || hasDevicePasscode)) {
          handleUnlockBiometric({
            kdf: lockConfig.kdf,
            kdf_iterations: lockConfig.kdf_iterations,
          })
        }
      }

      // The mount-time "focus" event fires while lockConfig is still loading,
      // before this listener attaches — so trigger directly if already focused.
      if (navigation.isFocused() && !autoPromptedRef.current) {
        autoPromptedRef.current = true
        tryUnlockBiometric()
      }
      const focusHandler = navigation.addListener("focus", tryUnlockBiometric)

      return () => {
        focusHandler()
      }
    }, [navigation, lockConfig, user.isBiometricUnlock, biometryType, hasDevicePasscode])

    // ---------------------- RENDER -------------------------
    const commonProps = {
      handleLogout,
      handleUnlock,
      isUnlocking,
      setIsUnlocking,
      biometryType,
      hasDevicePasscode,
      lockConfig,
    }

    if (lockConfig.login_method === LoginMethod.PASSWORDLESS) {
      return <BusinessLockByPasswordless {...commonProps} />
    }

    return <LockByMasterPassword {...commonProps} />
  }
)
