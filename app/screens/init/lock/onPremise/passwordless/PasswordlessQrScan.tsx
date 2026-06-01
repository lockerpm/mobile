import { useEffect, useState } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { useNavigation } from "@react-navigation/native"
import {
  Camera,
  Code,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from "react-native-vision-camera"

import { Header, Text } from "app/components/cores"
import { useAuthentication } from "app/services/hook"

import { AppScreenProps } from "@/navigators"
import { MPEncodeConfig } from "@/static/types/user.types"

interface Props {
  lockConfig: MPEncodeConfig
  index: number
  otp: number
  goBack: () => void
  handleUnlock: () => Promise<void>
}

const { width, height } = Dimensions.get("screen")

export const PasswordlessQrScan = ({ lockConfig, otp, goBack, index, handleUnlock }: Props) => {
  const navigation = useNavigation<AppScreenProps<"lock">["navigation"]>()
  const [onScanQR, setonScanQR] = useState(false)
  const { sessionQrLogin } = useAuthentication()

  const onSuccess = async (codes: Code[]) => {
    if (codes.length > 0) {
      const res = await sessionQrLogin(lockConfig, codes[0].value ?? "", otp.toString(), true)

      if (res.kind === "ok") {
        handleUnlock()
      } else if (res.kind === "unauthorized") {
        navigation.navigate("unAuthStack", {
          screen: "loginStack",
          params: {
            screen: "login",
          },
        })
      }
    }
  }

  useEffect(() => {
    setonScanQR(index === 1)
  }, [index])

  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "ean-13"],
    onCodeScanned: onSuccess,
  })

  const device = useCameraDevice("back")
  const { hasPermission } = useCameraPermission()

  if (!hasPermission) return null
  if (device == null) return null

  return (
    <View style={styles.container}>
      <Header
        leftIcon="arrow-left"
        onLeftPress={goBack}
        titleTx={"onpremise_passwordless:qr_scan"}
      />
      <View style={styles.cameraContainer}>
        {onScanQR && (
          <Camera isActive={true} device={device} codeScanner={codeScanner} style={styles.flex} />
        )}
      </View>
      <View style={styles.footer}>
        <Text preset="bold" tx={"onpremise_passwordless:more_step"} style={styles.mb16} size="xl" />
        <Text text={"onpremise_passwordless:point_camera"} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cameraContainer: {
    height: width,
    paddingTop: 70,
    width,
  },
  container: {
    flex: 1,
    height,
    width,
  },
  flex: {
    flex: 1,
  },
  footer: {
    alignItems: "center",
    marginTop: 86,
    padding: 20,
  },
  mb16: {
    marginBottom: 16,
  },
})
