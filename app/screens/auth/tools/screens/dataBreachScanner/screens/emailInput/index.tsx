import React, { FC, useState } from "react"
import { Text, Screen, Header, TextInput, Button } from "app/components/cores"
import { useStores } from "app/models"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useToast } from "app/services/utils"
import { DataBreachScannerStackScreenProps } from "app/navigators"
import { StyleSheet } from "react-native"

export const DataBreachEmailInputScreen: FC<DataBreachScannerStackScreenProps<"emailInput">> = ({
  navigation,
}) => {
  const { notifyApiError } = useToast()
  const { toolStore, user } = useStores()

  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCheck = async () => {
    setIsLoading(true)
    logFirebaseEvent(AnalyticEvents.DATA_BREACH_SCANNER, user.email)
    const res = await toolStore.checkBreaches(email)
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      navigation.navigate("dataBreachList", {
        email,
        data: res.data,
      })
    }
    setIsLoading(false)
  }

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      padding
      header={
        <Header
          leftIcon="arrow-left"
          titleTx="data_breach_scanner.title"
          onLeftPress={navigation.goBack}
        />
      }
      footer={
        <Button
          tx="data_breach_scanner.check"
          disabled={isLoading || !email}
          loading={isLoading}
          onPress={handleCheck}
          style={styles.mh16}
        />
      }
    >
      <Text tx="data_breach_scanner.breach_desc" style={styles.mv16} />

      <TextInput
        placeholderTx="data_breach_scanner.check_email"
        value={email}
        inputMode="email"
        autoCapitalize="none"
        onChangeText={setEmail}
        onSubmitEditing={handleCheck}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  mh16: {
    marginHorizontal: 16,
  },
  mv16: {
    marginVertical: 16,
  },
})
