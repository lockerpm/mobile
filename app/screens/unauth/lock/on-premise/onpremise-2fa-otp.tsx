import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { Text, Button, FloatingInput } from "../../../../components"
import { useMixins } from "../../../../services/mixins"
import IoniconsIcon from "react-native-vector-icons/Ionicons"
import { commonStyles, fontSize, spacing } from "../../../../theme"
import { Checkbox } from "react-native-ui-lib"
import { useCipherAuthenticationMixins } from "../../../../services/mixins/cipher/authentication"
import { useNavigation } from "@react-navigation/native"

type Props = {
  goBack: () => void
  method: string
  email?: string
  username: string
  masterPassword: string
  onLoggedIn: () => void
}

export const OnPremiseOtp = observer((props: Props) => {
  const navigation = useNavigation()
  const { translate, color } = useMixins()
  const { sessionOtpLogin } = useCipherAuthenticationMixins()
  const { goBack, method, email,  masterPassword} = props

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [otp, setOtp] = useState("")
  const [saveDevice, setSaveDevice] = useState(false)

  // ------------------ Methods ----------------------

  const handleAuthenticate = async () => {
    setIsError(false)
    setIsLoading(true)
    const res = await sessionOtpLogin(masterPassword, method, otp, saveDevice)
    setIsLoading(false)
    if (res.kind === "ok") {
      navigation.navigate("mainStack", { screen: "start" })
    } else if (res.kind === "unauthorized") {
      navigation.navigate("login")
    }  else if (res.kind === "on-premise-2fa") {
      return
    } else {
      setIsError(true)
    }
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <View>
      <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
        <Button preset="link" onPress={() => goBack()} style={{ marginRight: 15 }}>
          <IoniconsIcon name="md-arrow-back" size={26} color={color.title} />
        </Button>
        <Text preset="header" text={translate("login.enter_code")} />
      </View>

      <Text
        text={
          method === "mail"
            ? translate("login.from_email", { email })
            : translate("login.from_authenticator")
        }
        preset="black"
        style={{
          marginBottom: spacing.margin / 2,
          marginTop: 30,
        }}
      />

      <FloatingInput
        isInvalid={isError}
        label={translate("login.enter_code_here")}
        value={otp}
        onChangeText={setOtp}
        onSubmitEditing={handleAuthenticate}
      />

      <Checkbox
        value={saveDevice}
        accessibilityLabel={"saveDevice"}
        color={color.primary}
        label={translate("login.save_device")}
        onValueChange={setSaveDevice}
        style={{
          marginTop: spacing.margin,
          marginBottom: spacing.margin,
        }}
        labelStyle={{
          color: color.textBlack,
          fontSize: fontSize.p,
        }}
      />

      <Button
        isLoading={isLoading}
        isDisabled={isLoading || !otp}
        text={translate("common.authenticate")}
        onPress={handleAuthenticate}
        style={{
          width: "100%",
          marginTop: spacing.margin / 2,
        }}
      />
    </View>
  )
})
