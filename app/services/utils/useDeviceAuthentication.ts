import * as LocalAuthentication from "expo-local-authentication"

import { BiometricsType } from "@/static/types/enum"

export type DeviceAuthCapabilities = {
  hasBiometric: boolean
  biometryType: BiometricsType
  hasDevicePasscode: boolean
}

export const getDeviceAuthCapabilities = async (): Promise<DeviceAuthCapabilities> => {
  try {
    const [hasHardware, isEnrolled, supportedTypes, enrolledLevel] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
      LocalAuthentication.getEnrolledLevelAsync(),
    ])

    const hasBiometric = hasHardware && isEnrolled
    const hasDevicePasscode = enrolledLevel !== LocalAuthentication.SecurityLevel.NONE

    let biometryType = BiometricsType.None
    if (hasBiometric) {
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometryType = BiometricsType.FaceID
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometryType = BiometricsType.TouchID
      } else {
        biometryType = BiometricsType.Biometrics
      }
    }

    return { hasBiometric, biometryType, hasDevicePasscode }
  } catch {
    return { hasBiometric: false, biometryType: BiometricsType.None, hasDevicePasscode: false }
  }
}

export type PromptDeviceAuthResult = {
  success: boolean
  error?: string
}

export type PromptDeviceAuthOptions = {
  promptMessage: string
  allowDeviceCredential?: boolean
  fallbackLabel?: string
  cancelLabel?: string
}

export const promptDeviceAuth = async ({
  promptMessage,
  allowDeviceCredential = true,
  fallbackLabel,
  cancelLabel,
}: PromptDeviceAuthOptions): Promise<PromptDeviceAuthResult> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      disableDeviceFallback: !allowDeviceCredential,
      fallbackLabel,
      cancelLabel,
    })

    if (result.success) {
      return { success: true }
    }

    return { success: false, error: result.error }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "unknown" }
  }
}
