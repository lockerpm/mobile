import React, { FC, useCallback, useState } from "react"
import { Button, TextInput, Screen, Header } from "app/components/cores"
import { useToast } from "app/services/utils"
import { ForgotPasswordScreenProps } from "app/navigators"
import { CommonActions } from "@react-navigation/native"
import { LOGIN_METHOD } from "app/static/types"
import { ViewStyle } from "react-native"
import { idApi } from "app/services/api"

export const ForgotChangePasswordScreen: FC<ForgotPasswordScreenProps<"changePassword">> = ({
  navigation,
  route: {
    params: { token, username },
  },
}) => {
  const { notifyTx, notifyApiError } = useToast()

  // ------------------ Params -----------------------

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // ------------------ Methods ----------------------

  const handleSubmitNewPassword = async () => {
    setIsError(false)
    setIsLoading(true)
    const res = await idApi.setNewPassword({ new_password: password, token })
    setIsLoading(false)
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      notifyTx("success", "forgot_password.password_updated")
      navigateToLogin()
    }
  }

  const navigateToLogin = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "loginStack",
            params: {
              screen: "login",
              params: {
                initMethod: LOGIN_METHOD.PASSWORD,
                email: username,
              },
            },
          },
        ],
      }),
    )
  }, [])

  // ------------------------------ RENDER -------------------------------

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      padding
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
          titleTx={"forgot_password.set_new_password"}
        />
      }
    >
      <TextInput
        isPassword
        animated
        isError={isError}
        labelTx="forgot_password.new_password"
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        animated
        isPassword
        isError={isError || (!!password && !!confirmPassword && password !== confirmPassword)}
        labelTx="forgot_password.confirm_new_password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button
        loading={isLoading}
        disabled={isLoading || !(password && confirmPassword === password)}
        tx="common.submit"
        onPress={handleSubmitNewPassword}
        style={button}
      />
    </Screen>
  )
}

const button: ViewStyle = {
  width: "100%",
  marginTop: 40,
}
