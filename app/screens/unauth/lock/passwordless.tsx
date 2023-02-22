import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { useEffect, useLayoutEffect, useState } from "react"
import { View, Image, TouchableOpacity } from "react-native"
import { APP_ICON, SOCIAL_LOGIN_ICON } from "../../../common/mappings"
import { ActionItem, ActionSheet, ActionSheetContent } from "../../../components"
import { Button, Screen, Text } from "../../../components/cores"
import { LanguagePicker } from "../../../components/utils"
import { IS_IOS, IS_PROD } from "../../../config/constants"
import { useStores } from "../../../models"
import { OnPremisePreloginData } from "../../../services/api"
import { useMixins } from "../../../services/mixins"
import { verticalScale } from "../../../services/mixins/adaptive-layout"
import { useSocialLoginMixins } from "../../../services/mixins/social-login"
import { GitHubLoginModal } from "../login/github-login-modal"
import { OtpPasswordlessGenerator } from "./otp-generator"



export const LockByPasswordless = observer(() => {
  const navigation = useNavigation()
  const { uiStore, user } = useStores()
  const { translate } = useMixins()

  const [otpInfo, setOtpInfo] = useState(false)
  const [otp, setOtp] = useState(randomOtpNumber())

  useEffect(() => {
    setOtp(randomOtpNumber())
  }, [])

  return (
    <Screen
      safeAreaEdges={["top"]}
      contentContainerStyle={{
        flex: 1,
        padding: 20,
        paddingTop: 70,
      }}
    >
      <View
        style={{
          alignItems: "center",
          marginBottom: 40,
        }}
      >
        <Image
          source={uiStore.isDark ? APP_ICON.textVerticalLight : APP_ICON.textVertical}
          style={{ height: verticalScale(80), width: verticalScale(90) }}
        />
      </View>

      <Text
        text={"Enter the OTP code displayed below to Desktop App to continue log in"}
        style={{ marginBottom: 16 }}
      />

      <OtpPasswordlessGenerator otp={otp} />

      <Button
        onPress={() => {
          navigation.navigate("passwordlessQrScan")
        }}
        size="large"
        text="QR scan"
        style={{ marginBottom: 16 }}
      />
      <Button
        onPress={() => {
          setOtp(randomOtpNumber())
        }}
        size="large"
        text="Re gen Otp"
        style={{ marginBottom: 16 }}
      />

      <ActionSheet isOpen={otpInfo} onClose={() => setOtpInfo(false)}>
        <View style={{ width: "100%", paddingHorizontal: 20 }}>
          <Text
            preset="bold"
            text="Your Business Locker is set to log in with Passwordless Login method. To log in to your Vault, please follow the steps below: "
            style={{ marginBottom: 16 }}
          />

          <Text text={"1. Open your Vault on Locker Desktop App"} style={{ marginBottom: 16 }} />

          <Text
            text={"2. Click on    button on the top right > choose Passwordless Login on Phone"}
            style={{ marginBottom: 16 }}
          />
          <Text
            text={"3. Click on Continue button below to receive an OTP code "}
            style={{ marginBottom: 16 }}
          />
        </View>
      </ActionSheet>
    </Screen>
  )
})

const randomOtpNumber = () => {
  return Math.round(Math.random() * 1000000)
}
