import { Header, Logo, Screen, Text } from "app/components/cores"
import { DividerText, PasscodeInput } from "app/components/utils"
import { useStores } from "app/models"
import { RootStackScreenProps } from "app/navigators/navigators.types"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useRef, useState } from "react"
import { TouchableOpacity } from "react-native"
import { randomString, ResendOtp } from "../../signup/SignUpWithPinCode"

export const PinCodeLoginScreen: FC<RootStackScreenProps<"signup_pin_code">> = observer(
  ({
    navigation,
    route: {
      params: { email },
    },
  }) => {
    const { colors } = useTheme()
    const { translate, notifyApiError, setApiTokens, notify } = useHelper()
    const { user } = useStores()

    const [code, setCode] = useState("")
    const [isLoadding, setIsLoading] = useState(false)
    const [errorText, setErrorText] = useState("")

    const nonce = useRef(randomString(32))

    const isEnable = code.length === 6

    const submitOTP = async () => {
      if (isEnable) {
        setIsLoading(true)
        const res = await user.registerByPinCode(code, nonce.current)
        if (res.kind === "ok") {
          if ("access_token" in res.data) {
            setApiTokens(res.data.access_token)
          }
          onLoggedIn()
        } else {
          setErrorText(notifyApiError(res, true))
        }
        setCode("")
      }
    }

    const onLoggedIn = async () => {
      const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
      if (userRes.kind === "ok" && userPwRes.kind === "ok") {
        if (user.is_pwd_manager) {
          navigation.navigate("lock")
        } else {
          navigation.navigate("createMasterPassword")
        }
      } else {
        notify("error", translate("error.something_went_wrong"))
      }
      setIsLoading(false)
    }

    useEffect(() => {
      submitOTP()
    }, [isEnable])

    return (
      <Screen
        padding
        safeAreaEdges={["bottom"]}
        header={<Header leftIcon="arrow-left" onLeftPress={navigation.goBack} />}
      >
        <Logo
          preset={"cystack-logo"}
          style={{ height: 70, width: 70, marginBottom: 10, alignSelf: "center" }}
        />
        <Text
          weight="semibold"
          size="xl"
          tx="new_signup.title"
          style={{ textAlign: "center", marginBottom: 4 }}
        />
        <Text
          preset="label"
          size="medium"
          style={{ textAlign: "center", marginBottom: 4, maxWidth: "80%", alignSelf: "center" }}
        >
          {translate("login_email_code.sub_title.prefix")}
          <Text color={colors.link} text={email} />
          {translate("login_email_code.sub_title.suffix")}
        </Text>

        <PasscodeInput
          isLoading={isLoadding}
          onCodeFilled={setCode}
          style={{
            marginVertical: 16,
            marginBottom: 8,
          }}
        />
        <Text
          text={errorText}
          color={colors.error}
          style={{ textAlign: "center", marginBottom: 4 }}
        />

        <ResendOtp email={email} language={user.language} nonce={nonce.current} />

        <DividerText
          tx="login_email_code.or"
          style={{ marginHorizontal: 8 }}
          color={colors.secondaryText}
          size="base"
          containerStyle={{
            marginVertical: 12,
          }}
        />

        <Text
          preset="label"
          tx="login_email_code.not_familiar"
          size="base"
          style={{ textAlign: "center", marginBottom: 16 }}
        />

        <TouchableOpacity
          disabled={isLoadding}
          style={{
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.palette.neutral5,
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 16,
          }}
          onPress={() => {
            navigation.replace("signup_password", {
              email,
            })
          }}
        >
          <Text preset="bold" tx="login_email_code.use_password" />
        </TouchableOpacity>
      </Screen>
    )
  },
)
