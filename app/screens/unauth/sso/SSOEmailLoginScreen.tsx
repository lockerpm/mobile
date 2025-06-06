import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { observer } from "mobx-react-lite"
import React, { FC, useState } from "react"
import { LockType } from "../lock/lock.types"
import { Button, Header, Logo, Screen, Text, TextInput } from "app/components/cores"
import { RootStackScreenProps } from "app/navigators/navigators.types"

export const SSOEmailLoginScreen: FC<RootStackScreenProps<"ssoLogin">> = observer((props) => {
  const navigation = props.navigation
  const { user } = useStores()
  const { translate, notify, notifyApiError } = useHelper()

  const [username, setUsername] = useState("")

  const [isError, setIsError] = useState(false)

  const handleLogin = async () => {
    setIsError(false)
    const res = await user.onPremisePreLogin({ email: username })
    if (res.kind !== "ok") {
      setIsError(true)
      if (res.kind === "unauthorized" && res.data) {
        const errorData: {
          code: string
          message: string
        } = res.data
        notify("error", errorData.message)
      } else {
        notifyApiError(res)
      }
    } else {
      if (res.data.length === 0) {
        notify("error", translate("error.onpremise_login_failed"))
      }
      if (res.data[0]?.activated) {
        navigation.navigate("lock", {
          type: LockType.OnPremise,
          data: res.data[0],
          email: username,
        })
      }
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
        isError={isError}
        label={translate("login.email_or_username")}
        onChangeText={setUsername}
        value={username}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <Button
        disabled={!username}
        text={translate("common.continue")}
        onPress={handleLogin}
        style={{ marginTop: 24, marginBottom: 16 }}
      />

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
