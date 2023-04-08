import { useNavigation } from "@react-navigation/native"
import { observer } from "mobx-react-lite"
import React from "react"
import { FloatingInput, Text } from "../../../components"
import { Header, Screen } from "../../../components/cores"

export const SSOIdentifierScreen = observer(() => {
  const navigation = useNavigation()


  const []

  return (
    <Screen
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
        />
      }
    >
      <Text text="Sign in to your company" />

      <FloatingInput
          label={'Enter your SSO Identifier'}
          onChangeText={setUsername}
          value={username}
          style={{ width: "100%", marginBottom: spacing.small }}
          onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
        />
    </Screen>
  )
})
