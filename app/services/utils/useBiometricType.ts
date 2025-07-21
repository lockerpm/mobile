import { BiometricsType } from "app/static/types"
import { useEffect, useState } from "react"
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics"

const rnBiometrics = new ReactNativeBiometrics()

export const useBiometricType = () => {
  const [biometryType, setBiometryType] = useState<BiometricsType>(BiometricsType.None)

  // Detect biometric type
  const detectbiometryType = async () => {
    const { biometryType } = await rnBiometrics.isSensorAvailable()

    if (biometryType === BiometryTypes.TouchID) {
      setBiometryType(BiometricsType.TouchID)
      return
    }

    if (biometryType === BiometryTypes.FaceID) {
      setBiometryType(BiometricsType.FaceID)
    }
  }

  const isSensorAvailable = async () => {
    const { available } = await rnBiometrics.isSensorAvailable()

    return available
  }

  // Auto trigger face id / touch id + detect biometry type
  useEffect(() => {
    detectbiometryType()
  }, [])

  return {
    biometryType,
    isBiometricAvailable: isSensorAvailable,
  }
}
