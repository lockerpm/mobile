import { FC, useCallback, useState } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { debounce } from "app/utils/utils"
import { Actions, RelayActionType } from "./Actions"
import { EditAlias } from "./EditAlias"
import { ConfigAlias } from "./ConfigAlias"
import { PrivateRelayScreenProps } from "app/navigators"
import { ModalBackdrop } from "app/components/cores"
import { delay } from "@/utils/delay"

export const RelayActionScreen: FC<PrivateRelayScreenProps<"relayAction">> = ({
  navigation,
  route: {
    params: { item, freeAccount, isEditable, isEdit },
  },
}) => {
  const [nextAction, setNextAction] = useState(
    isEdit ? RelayActionType.EDIT : RelayActionType.DEFAULT
  )

  const onClose = debounce(navigation.goBack, 400)
  const navigateStatistic = useCallback(() => {
    if (Platform.OS === "ios") {
      navigation.replace("aliasStatistic", {
        alias: item,
      })
      return
    }
    onClose()
    delay(150).then(() => {
      navigation.navigate("aliasStatistic", {
        alias: item,
      })
    })
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
      style={styles.flex}
    >
      <View style={styles.flex}>
        <ModalBackdrop onPress={onClose} />
        {nextAction === RelayActionType.DEFAULT && (
          <Actions
            item={item}
            isEditable={isEditable}
            freeAccount={freeAccount}
            setNextAction={setNextAction}
            navigateStatistic={navigateStatistic}
            onClose={onClose}
          />
        )}
        {nextAction === RelayActionType.EDIT && <EditAlias item={item} onClose={onClose} />}
        {nextAction === RelayActionType.CONFIG && <ConfigAlias item={item} onClose={onClose} />}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
})
