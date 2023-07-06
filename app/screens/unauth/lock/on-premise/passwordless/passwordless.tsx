import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState } from "react"
import { Dimensions, ScrollView } from "react-native"
import { Screen } from "../../../../../components/cores"
import { useStores } from "../../../../../models"
import { useCipherAuthenticationMixins } from "../../../../../services/mixins/cipher/authentication"
import { MethodSelection } from "../../../login/2fa/method-selection"
import { OtpPasswordlessGenerator, randomOtpNumber } from "./otp-generator"
import { OnPremiseOtp } from "./passwordless-2fa-otp"
import { PasswordlessQrScan } from "./passwordless-qr-scan"
import { useCoreService } from "../../../../../services/core-service"

const { width } = Dimensions.get("screen")

interface Props {
  biometryType: "faceid" | "touchid" | "biometric"
  handleLogout: () => void
}

export const LockByPasswordless = observer(({ handleLogout, biometryType }: Props) => {
  const navigation = useNavigation()
  const { user } = useStores()
  const {  biometricLogin } = useCipherAuthenticationMixins()
  const { cryptoService } = useCoreService()
  // ---------------------- PARAMS -------------------------

  const [otp, setOtp] = useState(randomOtpNumber())
  const [scanQrStep, setScanQrStep] = useState(0)
  const [symmetricCryptoKey, setSymmetricCryptoKey] = useState(null)

  const [index, setIndex] = useState(0)
  const [credential, setCredential] = useState({
    username: "",
    pwdHash: "",
    methods: [],
  })
  const [method, setMethod] = useState("")
  const [partialEmail, setPartialEamil] = useState("")

  const scrollViewRef = useRef(null)
  // ------------------ METHODS ---------------------

  const scrollTo = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    })
    setScanQrStep(index)
  }

  const handleUnlockBiometric = async () => {
    const key = await cryptoService.getKey()
    if (!key) return
    const res = await biometricLogin()
    if (res.kind === "ok") {
      navigation.navigate("mainStack", { screen: "start" })
    }
  }


  // Auto trigger face id / touch id + detect biometry type
  useEffect(() => {
    navigation.addListener("focus", () => {
      if (user.isBiometricUnlock) {
        handleUnlockBiometric()
      }
    })
  }, [])

  return (
    <Screen  safeAreaEdges={["top"]}>
      {index === 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          scrollEnabled={false}
          ref={scrollViewRef}
          showsHorizontalScrollIndicator={false}
          snapToInterval={width}
          decelerationRate="fast"
          scrollEventThrottle={16}
        >
          <OtpPasswordlessGenerator
            otp={otp}
            setOtp={setOtp}
            goNext={() => {
              scrollTo(1)
            }}
            goBack={() => {
              navigation.goBack()
            }}
          />
          <PasswordlessQrScan
            otp={otp}
            goBack={() => {
              scrollTo(0)
            }}
            index={scanQrStep}
            setSymmetricCryptoKey={setSymmetricCryptoKey}
            nextStep={(
              username: string,
              pwdHash: string,
              methods: { type: string; data: any }[],
            ) => {
              setCredential({ username, pwdHash, methods })
              setIndex(1)
            }}
          />
        </ScrollView>
      )}
      {index === 1 && (
        <MethodSelection
          goBack={() => setIndex(0)}
          methods={credential.methods}
          onSelect={(type: string, data: any) => {
            setMethod(type)
            setPartialEamil(data)
            setIndex(2)
          }}
          username={credential.username}
          password={credential.pwdHash}
        />
      )}
      {index === 2 && (
        <OnPremiseOtp
          goBack={() => setIndex(1)}
          method={method}
          email={partialEmail}
          username={credential.username}
          pwdHash={credential.pwdHash}
          symmetricCryptoKey={symmetricCryptoKey}
          onLoggedIn={() => {}}
        />
      )}
    </Screen>
  ) 
})
