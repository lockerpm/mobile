import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Image } from "react-native"
import { Button, FloatingInput, Text } from "../../../components"
import { Header, Screen } from "../../../components/cores"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"

const APP_ICON_DARK = require("../../../common/images/appIcon/textHorizontal.png")
const APP_ICON_LIGHT = require("../../../common/images/appIcon/textHorizontal-light.png")

export const SSOIdentifierScreen = observer(() => {
  const navigation = useNavigation()
  const { user, uiStore } = useStores()
  const { notifyApiError } = useMixins()

  const [ssoId, setSsoId] = useState("")
  const [errorText, setErrorText] = useState("")

  const onSubmit = async () => {
    const res = await user.onPremiseIdentifier(ssoId)
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      navigation.navigate("ssoLogin", { ...res.data })
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setErrorText("")
    }, 200)
  }, [ssoId])

  return (
    <Screen
      safeAreaEdges={["top"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
        />
      }
      contentContainerStyle={{
        padding: 20,
        paddingTop: 0,
      }}
    >
      <Image
        source={uiStore.isDark ? APP_ICON_LIGHT : APP_ICON_DARK}
        style={{
          height: 50,
          width: 180,
          alignSelf: "center",
        }}
        resizeMode="contain"
      />
      <Text
        preset="semibold"
        text="Sign in to your company"
        style={{
          fontSize: 20,
          marginBottom: 16,
          marginTop: 32,
          textAlign: "center",
        }}
      />

      <FloatingInput
        errorText={errorText}
        label={"Enter your SSO Identifier"}
        onChangeText={setSsoId}
        value={ssoId}
        style={{ width: "100%", marginBottom: 12 }}
        // onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
      />

      <Button
        isDisabled={!ssoId}
        text="Continue"
        onPress={onSubmit}
        style={{ marginTop: 24, marginBottom: 16 }}
      />

      <Text>
        Don't know your SSO Identifier?{" "}
        <Text
          preset="bold"
          onPress={() => {
            navigation.navigate("ssoLogin")
          }}
        >
          Enter your email
        </Text>
      </Text>
      <Text text="Looking to create an SSO Identifier instead?" style={{marginTop: 4}}/>
      <Text preset="black" style={{marginTop: 4}}>
        Contact us at <Text preset="bold" style={{ textDecorationLine: "underline" }}>contact@locker.io</Text>
      </Text>
    </Screen>
  )
})
