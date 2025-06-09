import React, { FC, useState } from "react"
import { StyleSheet } from "react-native"
import { Button, Header, Logo, Screen, Text, TextInput } from "app/components/cores"
import { LockType } from "app/static/types"
import { useAppLocale } from "app/services/context"
import { SSOScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { idApi } from "app/services/api"

export const SSOEmailLoginScreen: FC<SSOScreenProps<"ssoLogin">> = ({ navigation }) => {
  const { notify, notifyTx, notifyApiError } = useToast()
  const { translate } = useAppLocale()

  // ------------------PARAMS--------------------
  const [username, setUsername] = useState("")

  const [isError, setIsError] = useState(false)

  // ------------------METHODS--------------------
  const handleLogin = async () => {
    setIsError(false)
    const res = await idApi.onPremisePreLogin({ email: username })
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
        notifyTx("error", "error.onpremise_login_failed")
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
      header={<Header leftIcon="arrow-left" onLeftPress={navigation.goBack} />}
    >
      <Logo preset={"cystack-logo"} style={styles.logo} />

      <Text preset="bold" size="xl" tx={"sso.id.title"} style={styles.title} />

      <TextInput
        animated
        isError={isError}
        labelTx="login.email_or_username"
        onChangeText={setUsername}
        value={username}
        style={styles.input}
      />

      <Button
        disabled={!username}
        tx="common.continue"
        onPress={handleLogin}
        style={styles.continue}
      />

      <Text preset="label" tx="sso.id.create_sso" style={styles.mt4} />
      <Text preset="label" style={styles.mt4}>
        {translate("sso.id.contact_at")}
        <Text preset="bold" tx="sso.id.contact" style={{ textDecorationLine: "underline" }} />
      </Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  continue: {
    marginBottom: 16,
    marginTop: 24,
  },
  input: {
    marginBottom: 12,
    width: "100%",
  },
  logo: {
    alignSelf: "center",
    height: 70,
    marginBottom: 10,
    width: 70,
  },
  mt4: {
    marginTop: 4,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
})
