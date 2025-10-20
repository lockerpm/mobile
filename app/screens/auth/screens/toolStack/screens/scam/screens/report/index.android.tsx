import { Button, Header, Screen, Text, TextInput } from "@/components/cores"
import { ScamScreenProps } from "@/navigators"
import { FC, useCallback, useState } from "react"
import { StyleSheet } from "react-native"
import { ScamTypeInput } from "./ScamTypeInput"
import { ScamPhoneType, ScamType } from "@/static/types"
import { toolApi } from "@/services/api"
import { observer } from "mobx-react-lite"
import { useStores } from "@/models"
import { formatVietnamesePhoneNumber, validateVietnamesePhoneNumber } from "@/utils/utils"
import { useToast } from "@/services/utils"
import { CommonActions } from "@react-navigation/native"
import { useCallerIDData } from "@/services/callerID/useCallerID.android"

export const ScamReportScreen: FC<ScamScreenProps<"report">> = observer(
  ({ navigation, route: { params } }) => {
    const { user } = useStores()
    const { notifyTx, notifyApiError } = useToast()
    const { addValue } = useCallerIDData()

    // -----------------------PARAMS----------------------------
    const [phoneNumber, setPhoneNumber] = useState(params?.phoneNumber || "")
    const [scamType, setScamType] = useState<ScamPhoneType>(ScamPhoneType.PhoneSpam)
    const [description, setDescription] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const isValidPhoneNumber = validateVietnamesePhoneNumber(phoneNumber)
    const canSubmit = phoneNumber.trim() !== "" && isValidPhoneNumber && !isLoading

    const sendReport = async () => {
      if (!canSubmit) return

      const formatPhone = formatVietnamesePhoneNumber(phoneNumber)

      setIsLoading(true)
      const res = await toolApi.scamReport(user.apiToken, {
        type: ScamType.Phone,
        value: formatPhone,
        description: description || "",
        phishing_type: scamType,
        target_entity: "",
        is_anonymous: false,
      })

      if (res.kind === "ok") {
        notifyTx("success", "scam:report.success.title")
        await addValue({ value: formatPhone, type: scamType })
        navigation.goBack()
      } else {
        notifyApiError(res)
      }
    }

    const navigateBack = useCallback(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0, // Index of the active route in new state
          routes: [{ name: "scamList" }],
        })
      )
    }, [navigation])

    return (
      <Screen
        disableAvoidkeyboard
        preset="auto"
        safeAreaEdges={["bottom"]}
        header={
          <Header leftIcon="arrow-left" onLeftPress={navigateBack} titleTx="scam:report.title" />
        }
        footer={
          <Button
            tx="scam:report.btn"
            onPress={sendReport}
            style={styles.m16}
            disabled={!canSubmit}
            loading={isLoading}
          />
        }
        contentContainerStyle={styles.ph16}
      >
        <Text tx="scam:report.label" />
        <Text
          size="sm"
          weight="semiBold"
          tx="scam:report.enterPhone"
          style={styles.textInputTitle}
        />
        <TextInput
          placeholderTx="scam:report.enterPhonePlaceholder"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <Text
          size="sm"
          weight="semiBold"
          tx="scam:report.typeTitle"
          style={styles.textInputTitle}
        />
        <ScamTypeInput scamType={scamType} setScamType={setScamType} />

        <Text size="sm" weight="semiBold" tx="scam:report.desc" style={styles.textInputTitle} />
        <TextInput
          placeholderTx="scam:report.descPlaceholder"
          value={description}
          onChangeText={setDescription}
          autoCorrect={false}
        />
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  anonymos: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 16,
  },
  m16: {
    marginHorizontal: 16,
  },
  ml8: {
    marginLeft: 8,
  },
  mt32: {
    marginTop: 32,
  },
  ph16: {
    flex: 1,
    paddingHorizontal: 16,
  },
  textInputTitle: {
    marginBottom: 4,
    marginTop: 16,
  },
})
