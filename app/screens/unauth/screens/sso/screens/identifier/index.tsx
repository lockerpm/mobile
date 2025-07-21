import { FC, useState } from "react"
import { Text, TextInput, Button, Screen, Header, Logo } from "app/components/cores"
import { SSOScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { StyleSheet } from "react-native"
import { idApi } from "app/services/api"
import { useAppLocale } from "@/i18n"

export const SSOIdentifierScreen: FC<SSOScreenProps<"ssoIdentifier">> = ({ navigation }) => {
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()

  // ------------------------ PARAMS --------------------------
  const [ssoId, setSsoId] = useState("")

  // ------------------------ METHOD --------------------------
  const onSubmit = async () => {
    const res = await idApi.onPremiseIdentifier(ssoId)
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      navigation.navigate("ssoLogin", { ...res.data })
    }
  }

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={<Header leftIcon="arrow-left" onLeftPress={navigation.goBack} />}
      contentContainerStyle={styles.container}
    >
      <Logo preset={"cystack-logo"} style={styles.logo} />

      <Text preset="bold" size="xl" tx="sso:id.title" style={styles.title} />

      <TextInput
        animated
        labelTx="sso:id.identifier"
        onChangeText={setSsoId}
        value={ssoId}
        style={styles.input}
      />

      <Button disabled={!ssoId} tx="common:continue" onPress={onSubmit} style={styles.button} />

      <Text preset="label" tx="sso:id.create_sso" style={styles.mt4} />
      <Text preset="label" style={styles.mt4}>
        {translate("sso:id.contact_at")}
        <Text preset="bold" tx="sso:id.contact" style={styles.underline} />
      </Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  button: {
    marginBottom: 16,
    marginTop: 24,
  },
  container: {
    paddingHorizontal: 16,
  },
  input: {
    marginBottom: 12,
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
  underline: {
    textDecorationLine: "underline",
  },
})
