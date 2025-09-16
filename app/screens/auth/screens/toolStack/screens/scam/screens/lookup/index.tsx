import { Button, Header, Icon, Screen, Text, TextInput } from "@/components/cores"
import { ScamScreenProps } from "@/navigators"
import { toolApi } from "@/services/api"
import { useToast } from "@/services/utils"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"
import { formatVietnamesePhoneNumber, validateVietnamesePhoneNumber } from "@/utils/utils"
import { FC, useCallback, useState } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import Animated, { FadeInUp } from "react-native-reanimated"

export const ScamLookupScreen: FC<ScamScreenProps<"lookup">> = ({ navigation }) => {
  const { themed } = useAppTheme()
  const { notifyApiError } = useToast()

  //.-----------------------PARAMS----------------------------
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSafe, setShowSafe] = useState(false)

  const isValidPhoneNumber = validateVietnamesePhoneNumber(phoneNumber)
  const canSubmit = phoneNumber.trim() !== "" && isValidPhoneNumber && !isLoading

  const lookupPhoneNumber = async () => {
    setIsLoading(true)
    const formatPhone = formatVietnamesePhoneNumber(phoneNumber)
    const res = await toolApi.scamLookup(formatPhone)
    if (res.kind === "ok") {
      if (res.data.result.status === "safe") {
        setShowSafe(true)
      } else {
        navigation.navigate("lookupResult", {
          data: res.data,
        })
      }
    } else {
      notifyApiError(res)
    }

    setIsLoading(false)
  }

  const navigateToReport = () => {
    navigation.navigate("report", {
      phoneNumber: phoneNumber,
    })
  }

  const onChangeText = useCallback((text: string) => {
    setPhoneNumber(text)
    setShowSafe(false)
  }, [])

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={
        <Header leftIcon="arrow-left" onLeftPress={navigation.goBack} titleTx="scam:lookup.title" />
      }
      footer={
        <>
          <Button
            preset="delete"
            tx="scam:home.report.title"
            style={styles.m16}
            onPress={navigateToReport}
          />
          <Button
            disabled={!canSubmit}
            loading={isLoading}
            tx="scam:lookup.btn"
            onPress={lookupPhoneNumber}
            style={styles.m16}
          />
        </>
      }
      contentContainerStyle={styles.ph16}
      keyboardOffset={16}
    >
      <Text tx="scam:lookup.label" style={styles.mb16} />

      <TextInput
        placeholderTx="scam:lookup.placeholder"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={onChangeText}
      />

      {showSafe && (
        <Animated.View entering={FadeInUp} style={themed($warningContainer)}>
          <View style={themed($warningLeft)} />
          <View style={themed($warningInfo)}>
            <Icon icon="info" size={12} containerStyle={themed($warningIcon)} color={"#067647"} />
            <Text weight="semiBold" tx="scam:lookup.safe" color={"#067647"} />
          </View>
        </Animated.View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  m16: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  mb16: {
    marginBottom: 16,
  },
  ph16: {
    paddingHorizontal: 16,
  },
})

const $warningLeft: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  left: 0,
  top: 16,
  bottom: 16,
  width: 8,
  borderTopRightRadius: 16,
  borderBottomRightRadius: 16,
  backgroundColor: "#067647",
})

const $warningContainer: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 12,
  padding: 16,
  paddingLeft: 28,
  backgroundColor: "#DCFAE6",
  marginTop: 24,
})

const $warningInfo: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 24,
  padding: 4,
  paddingRight: 8,
  paddingHorizontal: 6,
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.success,
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "flex-start",
})

const $warningIcon: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 24,
  padding: 6,
  backgroundColor: "#DCFAE6",
  marginRight: 6,
})
