import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Button, FloatingInput, Text } from "../../../components"
import { Header, Screen } from "../../../components/cores"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"

export const SSOIdentifierScreen = observer(() => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { notifyApiError } = useMixins()

  const [ssoId, setSsoId] = useState("")
  const [errorText, setErrorText] = useState("")

  const onSubmit = async () => {
    const res = await user.onPremiseIdentifier(ssoId)
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      navigation.navigate("login", { ...res.data })
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
      }}
    >
      <Text
        preset="semibold"
        text="Sign in to your company"
        style={{
          fontSize: 20,
          marginBottom: 16,
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

      <Button isDisabled={!ssoId} text="Continue" onPress={onSubmit} style={{ marginTop: 24 }} />
    </Screen>
  )
})
