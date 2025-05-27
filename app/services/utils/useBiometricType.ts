import { BiometricsType } from "app/static/types"
import { useEffect, useState } from "react"
import ReactNativeBiometrics from "react-native-biometrics"

export const useBiometricType = () => {
  const [biometryType, setBiometryType] = useState<BiometricsType>(BiometricsType.None)

  // Detect biometric type
  const detectbiometryType = async () => {
    const { biometryType } = await ReactNativeBiometrics.isSensorAvailable()

    if (biometryType === ReactNativeBiometrics.TouchID) {
      setBiometryType(BiometricsType.TouchID)
      return
    }

    if (biometryType === ReactNativeBiometrics.FaceID) {
      setBiometryType(BiometricsType.FaceID)
    }
  }

  const isSensorAvailable = async () => {
    const { available } = await ReactNativeBiometrics.isSensorAvailable()

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
