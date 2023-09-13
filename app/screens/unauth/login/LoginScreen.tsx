import React, { FC, useEffect, useState } from "react"
import { View } from "react-native"
import { BASE_URL } from "app/config/constants"
import { RootStackScreenProps } from "app/navigators"
import { useStores } from "app/models"
import { api } from "app/services/api"

import { LoginForm } from "./LoginForm"
// import { MethodSelection } from "./2fa/method-selection"
// import { Otp } from "./2fa/otp"



import { Layout, Text, Button } from "../../../components"
import { translate } from "app/i18n"


export const LoginScreen: FC<RootStackScreenProps<'login'>> = (props) => {
  const navigation = props.navigation
  const { user } = useStores()
  // ------------------------------ PARAMS -------------------------------

  const [index, setIndex] = useState(0)
  const [credential, setCredential] = useState({
    username: "",
    password: "",
    methods: [],
  })
  const [method, setMethod] = useState("")
  const [partialEmail, setPartialEamil] = useState("")

  // ------------------------------ METHODS -------------------------------

  const onLoggedIn = async (_newUser?: boolean, _token?: string) => {
    setIndex(0)
    const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
    if (userRes.kind === "ok" && userPwRes.kind === "ok") {
      if (user.is_pwd_manager) {
        navigation.navigate("lock")
      } else {
        navigation.navigate("createMasterPassword")
      }
    }
  }

  const nextStep = (
    username: string,
    password: string,
    methods: { type: string; data: any }[],
  ) => {
    setCredential({ username, password, methods })
    setIndex(1)
  }

  const handleForgot = () => navigation.navigate("forgotPassword")

  // -------------- EFFECT ------------------

  useEffect(() => {
    user.setOnPremiseUser(false)
    api.apisauce.setBaseURL(BASE_URL)
  }, [])

  useEffect(() => {
    const handleBack = (e) => {
      if (!["POP", "GO_BACK"].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()
      navigation.navigate("login")
    }

    navigation.addListener("beforeRemove", handleBack)

    return () => {
      navigation.removeListener("beforeRemove", handleBack)
    }
  }, [navigation])

  // ------------------------------ RENDER -------------------------------

  return (
    <Layout
      footer={(
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            justifyContent: "center",
          }}
        >
          <Text
            text={translate("login.no_account")}
            style={{
              marginRight: 12,
            }}
          />
          <Button
            preset="link"
            text={translate("common.sign_up")}
            onPress={() => navigation.navigate("signup")}
          />
        </View>
      )
      }
    >
      <LoginForm
        handleForgot={handleForgot}
        onLoggedIn={onLoggedIn}
        nextStep={nextStep}
      />

      {/* {index === 1 && (
        <MethodSelection
          goBack={() => setIndex(0)}
          methods={credential.methods}
          onSelect={(type: string, data: any) => {
            setMethod(type)
            setPartialEamil(data)
            setIndex(2)
          }}
          username={credential.username}
          password={credential.password}
        />
      )}
      {index === 2 && (
        <Otp
          goBack={() => setIndex(1)}
          method={method}
          email={partialEmail}
          username={credential.username}
          password={credential.password}
          onLoggedIn={onLoggedIn}
        />
      )} */}
    </Layout>
  )
}
