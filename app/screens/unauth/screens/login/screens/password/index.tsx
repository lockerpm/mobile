import React, { FC, useEffect, useState } from "react"
import { BASE_URL } from "app/config/constants"
import { useStores } from "app/models"
import { api } from "app/services/api"
import { LoginForm } from "./LoginForm"
import { Header, Screen } from "app/components/cores"
import { useHelper } from "app/services/hook"
import { observer } from "mobx-react-lite"
import { SetLanguage } from "app/components/utils"
import { useAppLocale } from "app/services/context"
import { LoginScreenProps } from "../../route"
import { TwoFAAuthenSheet } from "./2faBottomSheet/BottomSheetModal"

export const LoginScreen: FC<LoginScreenProps<"login">> = observer(({ navigation }) => {
  const { user } = useStores()
  const { notify } = useHelper()
  const { translate } = useAppLocale()

  // ------------------------------ PARAMS -------------------------------

  const [credential, setCredential] = useState({
    username: "",
    password: "",
    methods: [],
  })
  const [isShow2FASheet, setIsShow2FASheet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // ------------------------------ METHODS -------------------------------

  const onLoggedIn = async (_newUser?: boolean, _token?: string) => {
    const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
    if (userRes.kind === "ok" && userPwRes.kind === "ok") {
      if (user.is_pwd_manager) {
        navigation.navigate("lock")
      } else {
        navigation.navigate("createMasterPassword")
      }
    } else {
      notify("error", translate("passkey.error.login_failed"))
    }
    setIsLoading(false)
  }

  const nextStep = (username: string, password: string, methods: { type: string; data: any }[]) => {
    setCredential({ username, password, methods })
    setIsShow2FASheet(true)
  }

  const handleForgot = () => navigation.navigate("forgotPassword")

  // -------------- EFFECT ------------------

  useEffect(() => {
    user.setOnPremiseUser(false)
    api.apisauce.setBaseURL(BASE_URL)
  }, [])

  // ------------------------------ RENDER -------------------------------

  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={["bottom"]}
      header={<Header RightActionComponent={<SetLanguage />} />}
      contentContainerStyle={{ flex: 1, justifyContent: "space-between" }}
    >
      <TwoFAAuthenSheet
        credential={credential}
        isOpen={isShow2FASheet}
        onClose={() => {
          setIsShow2FASheet(false)
        }}
        onLoggedIn={onLoggedIn}
      />

      <LoginForm
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        handleForgot={handleForgot}
        onLoggedIn={onLoggedIn}
        nextStep={nextStep}
      />
    </Screen>
  )
})
