import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Text, Screen, Header, TextInput, Button } from "app/components/cores"
import { useNavigation } from "@react-navigation/core"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { translate } from "app/i18n"

export const DataBreachScannerScreen = observer(() => {
  const { colors } = useTheme()
  const { notifyApiError } = useHelper()
  const navigation = useNavigation() as any
  const { toolStore } = useStores()

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleCheck = async () => {
    setIsError(false)
    setIsLoading(true)

    const res = await toolStore.checkBreaches(email)
    if (res.kind !== "ok") {
      setIsError(true)
      notifyApiError(res)
    } else {
      toolStore.setBreachedEmail(email)
      toolStore.setBreaches(res.data)
      navigation.navigate("dataBreachList")
    }

    setIsLoading(false)
  }

  return (
    <Screen
      backgroundColor={colors.block}
      safeAreaEdges={['bottom']}
      header={
        <Header
          leftIcon="arrow-left"
          title={translate("data_breach_scanner.title")}
          onLeftPress={() => navigation.goBack()}
        />
      }
      footer={
        <Button
          text={translate("data_breach_scanner.check")}
          disabled={isLoading || !email}
          loading={isLoading}
          onPress={handleCheck}
          style={{
            marginHorizontal: 20
          }}
        />
      }
      contentContainerStyle={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: 20,
        paddingVertical: 16,
      }}
    >
      <Text
        text={translate("data_breach_scanner.breach_desc")}
        style={{
          marginBottom: 10,
        }}
      />

      <TextInput
        label={translate("data_breach_scanner.check_email")}
        value={email}
        onChangeText={setEmail}
        isError={isError}
        onSubmitEditing={handleCheck}
        containerStyle={{
          marginTop: 10,
          marginBottom: 30,
        }}
      />
    </Screen>
  )
})
