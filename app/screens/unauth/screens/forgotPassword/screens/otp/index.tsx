import React, { FC, useCallback, useState } from "react"
import { Button, Header, Screen, Text, TextInput } from "app/components/cores"
import { ForgotPasswordScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { useAppLocale } from "app/services/context"
import { idApi } from "app/services/api"

export const ForgotOtpAuthenScreen: FC<ForgotPasswordScreenProps<"otp">> = ({
  navigation,
  route: {
    params: { email, username },
  },
}) => {
  const { notifyTx } = useToast()
  const { translate } = useAppLocale()

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [code, setCode] = useState("")

  // ------------------ Methods ----------------------
  const navigateToChangePassword = useCallback((token: string) => {
    navigation.replace("changePassword", {
      token,
      username,
    })
  }, [])

  const handleRequest = async () => {
    setIsError(false)
    setIsLoading(true)
    const res = await idApi.resetPasswordWithCode({ username: email, code })
    setIsLoading(false)
    if (res.kind !== "ok") {
      setIsError(true)
      notifyTx("error", "error.invalid_authorization_code")
    } else {
      const urlArray = res.data.reset_password_url?.split("/")
      navigateToChangePassword(urlArray[urlArray.length - 1])
    }
  }

  // ------------------------------ RENDER -------------------------------

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      padding
      header={
        <Header
          leftIcon={"arrow-left"}
          onLeftPress={navigation.goBack}
          titleTx={"forgot_password.enter_code"}
        />
      }
    >
      <Text text={translate("forgot_password.enter_code_desc")} />

      <TextInput
        animated
        isError={isError}
        label={translate("forgot_password.enter_code_here")}
        value={code}
        onChangeText={setCode}
        onSubmitEditing={handleRequest}
      />

      <Button
        loading={isLoading}
        disabled={isLoading || !code}
        text={translate("common.authenticate")}
        onPress={handleRequest}
        style={{
          width: "100%",
          marginTop: 30,
        }}
      />
    </Screen>
  )
}
