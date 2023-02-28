import React, { useEffect, useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { Layout, Text, Button } from "../../../components"
import { LanguagePicker } from "../../../components/utils"
import { useMixins } from "../../../services/mixins"
import { spacing } from "../../../theme"
import { DefaultLogin } from "./default"
import { MethodSelection } from "./2fa/method-selection"
import { Otp } from "./2fa/otp"
import { useStores } from "../../../models"
import { RootParamList } from "../../../navigators"
import { BASE_URL } from "../../../config/constants"

export const LoginScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<RootParamList, "login">>()
  const { user } = useStores()
  const { translate } = useMixins()
  // ------------------------------ PARAMS -------------------------------

  const loginType = route.params.type || "individual"

  const [isScreenLoading, setIsScreenLoading] = useState(false)
  const [index, setIndex] = useState(0)
  const [credential, setCredential] = useState({
    username: "",
    password: "",
    methods: [],
  })
  const [method, setMethod] = useState("")
  const [partialEmail, setPartialEamil] = useState("")

  // ------------------------------ METHODS -------------------------------

  const onLoggedIn = async (newUser?: boolean, token?: string) => {
    setIndex(0)
    setIsScreenLoading(true)
    const [userRes, userPwRes] = await Promise.all([user.getUser(), user.getUserPw()])
    setIsScreenLoading(false)
    if (userRes.kind === "ok" && userPwRes.kind === "ok") {
      if (user.is_pwd_manager) {
        navigation.navigate("lock")
      } else {
        navigation.navigate("createMasterPassword")
      }
    }
  }

  // -------------- EFFECT ------------------

  useEffect(() => {
    if (loginType === "individual") {
      user.setOnPremiseUser(false)
      user.environment.api.apisauce.setBaseURL(BASE_URL)
    }
  }, [])

  useEffect(() => {
    const handleBack = (e) => {
      if (!["POP", "GO_BACK"].includes(e.data.action.type)) {
        navigation.dispatch(e.data.action)
        return
      }

      e.preventDefault()
      navigation.navigate("onBoarding")
    }

    navigation.addListener("beforeRemove", handleBack)

    return () => {
      navigation.removeListener("beforeRemove", handleBack)
    }
  }, [navigation])

  // ------------------------------ RENDER -------------------------------

  return (
    <Layout
      isOverlayLoading={isScreenLoading}
      footer={
        loginType !== "onPremise" ? (
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
                marginRight: spacing.smaller,
              }}
            />
            <Button
              preset="link"
              text={translate("common.sign_up")}
              onPress={() => navigation.navigate("signup")}
            />
          </View>
        ) : (
          <View />
        )
      }
    >
      {index === 0 && <LanguagePicker />}
      {index === 0 && (
        <DefaultLogin
          onPremise={loginType === "onPremise"}
          handleForgot={() => navigation.navigate("forgotPassword")}
          onLoggedIn={onLoggedIn}
          nextStep={(
            username: string,
            password: string,
            methods: { type: string; data: any }[],
          ) => {
            setCredential({ username, password, methods })
            setIndex(1)
          }}
        />
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
      )}
    </Layout>
  )
})
