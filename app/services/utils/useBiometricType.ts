import { useEffect, useState } from "react"

import { BiometricsType } from "app/static/types"

import { getDeviceAuthCapabilities } from "./useDeviceAuthentication"

export const useBiometricType = () => {
  const [biometryType, setBiometryType] = useState<BiometricsType>(BiometricsType.None)
  const [hasDevicePasscode, setHasDevicePasscode] = useState<boolean>(false)

  const refresh = async () => {
    const caps = await getDeviceAuthCapabilities()
    setBiometryType(caps.biometryType)
    setHasDevicePasscode(caps.hasDevicePasscode)
  }

  const isBiometricAvailable = async () => {
    const caps = await getDeviceAuthCapabilities()
    return caps.hasBiometric
  }

  useEffect(() => {
    refresh()
  }, [])

  return {
    biometryType,
    hasDevicePasscode,
    isBiometricAvailable,
    refresh,
  }
}
