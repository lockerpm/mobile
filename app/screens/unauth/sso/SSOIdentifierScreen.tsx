import { observer } from "mobx-react-lite"
import React, { FC, useState } from "react"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { Text, TextInput, Button, Screen, Header, Logo } from "app/components/cores"
import { RootStackScreenProps } from "app/navigators/navigators.types"

export const SSOIdentifierScreen: FC<RootStackScreenProps<"ssoIdentifier">> = observer((props) => {
  const navigation = props.navigation
  const { user } = useStores()
  const { notifyApiError, translate } = useHelper()

  const [ssoId, setSsoId] = useState("")

  const onSubmit = async () => {
    const res = await user.onPremiseIdentifier(ssoId)
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      navigation.navigate("ssoLogin", { ...res.data })
    }
  }

  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={["bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
        />
      }
    >
      <Logo
        preset={"default"}
        style={{ height: 80, width: 70, marginBottom: 10, alignSelf: "center" }}
      />

      <Text
        preset="bold"
        size="xl"
        text={translate("sso.id.title")}
        style={{
          marginBottom: 20,
          textAlign: "center",
        }}
      />

      <TextInput
        animated
        label={translate("sso.id.identifier")}
        onChangeText={setSsoId}
        value={ssoId}
        style={{ marginBottom: 12 }}
        // onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
      />

      <Button
        disabled={!ssoId}
        text={translate("common.continue")}
        onPress={onSubmit}
        style={{ marginTop: 24, marginBottom: 16 }}
      />

      <Text>
        {translate("sso.id.sso_info")}
        <Text
          preset="bold"
          onPress={() => {
            navigation.navigate("ssoLogin")
          }}
        >
          {translate("sso.id.enter_email")}
        </Text>
      </Text>
      <Text preset="label" text={translate("sso.id.create_sso")} style={{ marginTop: 4 }} />
      <Text style={{ marginTop: 4 }}>
        {translate("sso.id.contact_at")}
        <Text preset="bold" style={{ textDecorationLine: "underline" }}>
          {translate("sso.id.contact")}
        </Text>
      </Text>
    </Screen>
  )
})