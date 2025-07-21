import { FC, useState } from "react"
import { Text, Screen, Header, TextInput, Button } from "app/components/cores"
import { useStores } from "app/models"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useToast } from "app/services/utils"
import { DataBreachScannerScreenProps } from "app/navigators"
import { StyleSheet, View } from "react-native"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

export const DataBreachEmailInputScreen: FC<DataBreachScannerScreenProps<"emailInput">> = ({
  navigation,
}) => {
  const { notifyApiError } = useToast()
  const { toolStore, user } = useStores()
  const { translate } = useAppLocale()
  const {
    theme: { colors },
  } = useAppTheme()

  // --------------------PARAMS--------------------
  const [email, setEmail] = useState("")
  const [isShowGoodNews, setIsShowGoodNews] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCheck = async () => {
    setIsLoading(true)
    logFirebaseEvent(AnalyticEvents.DATA_BREACH_SCANNER, user.email)
    const res = await toolStore.checkBreaches(email)
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      if (res.data.length > 0) {
        navigation.navigate("dataBreachList", {
          email,
          data: res.data,
        })
        setEmail("")
      } else {
        setIsShowGoodNews(true)
      }
    }
    setIsLoading(false)
  }
  const onChangeText = (text: string) => {
    setEmail(text)
    setIsShowGoodNews(false)
  }

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      contentContainerStyle={styles.ph16}
      keyboardOffset={16}
      header={
        <Header
          leftIcon="arrow-left"
          titleTx="data_breach_scanner:title"
          onLeftPress={navigation.goBack}
        />
      }
      footer={
        <Button
          tx="data_breach_scanner:check"
          disabled={isLoading || !email}
          loading={isLoading}
          onPress={handleCheck}
          style={styles.mh16}
        />
      }
    >
      <Text tx="data_breach_scanner:breach_desc" style={styles.mv16} />

      <TextInput
        placeholderTx="data_breach_scanner:check_email"
        value={email}
        inputMode="email"
        autoCapitalize="none"
        onChangeText={onChangeText}
        onSubmitEditing={handleCheck}
      />

      {isShowGoodNews && (
        <View style={styles.mt16}>
          <Text
            preset="bold"
            text={translate("data_breach_scanner:good_news").toUpperCase() + ":"}
            color={colors.primary}
            style={styles.mb8}
          />
          <Text text={`${email}${translate("data_breach_scanner:no_breaches_found")}`} />
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  mb8: {
    marginBottom: 8,
  },
  mh16: {
    marginHorizontal: 16,
  },
  mt16: {
    marginTop: 16,
  },
  mv16: {
    marginBottom: 16,
  },
  ph16: {
    paddingHorizontal: 16,
  },
})
