import { Button, Header, Logo, Screen, Text } from "app/components/cores"
import { DividerText, PasscodeInput } from "app/components/utils"
import { useStores } from "app/models"
import { useAppLocale, useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useRef, useState } from "react"
import { View } from "react-native"
import { LOGIN_METHOD } from "app/static/types"
import { TwoFactorAuthentication } from "./2faModal"
import { ResendOtp } from "../../../signup/screens"
import { LoginScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"

export const PinCodeLoginScreen: FC<LoginScreenProps<"loginByPincode">> = observer(
  ({
    navigation,
    route: {
      params: { email },
    },
  }) => {
    const { colors } = useTheme()
    const { notifyTx } = useToast()
    const { setApiTokens, randomString } = useHelper()
    const { notifyApiError } = useToast()
    const { user } = useStores()
    const { translate } = useAppLocale()

    const [code, setCode] = useState("")
    const [isLoadding, setIsLoading] = useState(false)
    const [errorText, setErrorText] = useState("")
    const [methods, setMethods] = useState<{ type: string; data: any }[]>([])

    const nonce = useRef(randomString(32))

    const isEnable = code.length === 6
    const show2FaModal = methods.length > 0

    const submitOTP = async () => {
      if (isEnable) {
        setIsLoading(true)
        const res = await user.registerByPinCode(code, nonce.current)
        if (res.kind === "ok") {
          if (res.data.is_factor2) {
            setMethods(res.data.methods || [])
          } else {
            if ("access_token" in res.data) {
              setApiTokens(res.data.access_token)
            }
            onLoggedIn()
            setCode("")
          }
        } else {
          setErrorText(notifyApiError(res, true))
        }
        setIsLoading(false)
      }
    }

    const onLoggedIn = async () => {
      const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
      if (userRes.kind === "ok" && userPwRes.kind === "ok") {
        if (user.is_pwd_manager) {
          navigation.replace("lock")
        } else {
          navigation.replace("createMasterPassword")
        }
      } else {
        notifyTx("error", "error.something_went_wrong")
      }
      setIsLoading(false)
    }

    useEffect(() => {
      submitOTP()
    }, [isEnable])

    return (
      <Screen
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={() => {
              navigation.navigate("login", {
                initMethod: LOGIN_METHOD.PASSWORD,
                email,
              })
            }}
          />
        }
      >
        {show2FaModal && (
          <TwoFactorAuthentication
            email={email}
            isOpen={show2FaModal}
            onClose={() => {
              setMethods([])
              setCode("")
            }}
            code={code}
            nonce={nonce.current}
            methods={methods}
            onLoggedIn={onLoggedIn}
          />
        )}
        <View style={{ padding: 16 }}>
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
            isError={!!errorText}
            isLoading={isLoadding}
            onCodeFilled={setCode}
            onTextChange={() => {
              setErrorText("")
            }}
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

          <>
            <DividerText
              tx="login_email_code.or"
              style={{ marginHorizontal: 8 }}
              color={colors.secondaryText}
              size="base"
              containerStyle={{
                marginVertical: 12,
              }}
            />

            <Button
              disabled={isLoadding}
              onPress={() => {
                navigation.navigate("login", {
                  initMethod: LOGIN_METHOD.PASSWORD,
                  email,
                })
              }}
              text={translate("login_email_code.sign_in")}
            />
          </>
        </View>
      </Screen>
    )
  },
)
