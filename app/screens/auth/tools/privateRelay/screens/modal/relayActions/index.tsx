import React, { FC, useCallback } from "react"
import { KeyboardAvoidingView, StyleSheet, View } from "react-native"
import { debounce } from "app/utils/utils"
import { Actions, RelayActionType } from "./Actions"
import { EditAlias } from "./EditAlias"
import { IS_IOS } from "app/config/constants"
import { ConfigAlias } from "./ConfigAlias"
import { PrivateRelayScreenProps } from "app/navigators"
import { ModalBackdrop } from "app/components/cores"

export const RelayActionScreen: FC<PrivateRelayScreenProps<"relayAction">> = ({
  navigation,
  route: {
    params: { item, freeAccount, isEditable, isEdit },
  },
}) => {
  const [nextAction, setNextAction] = React.useState(
    isEdit ? RelayActionType.EDIT : RelayActionType.DEFAULT,
  )

  const navigateStatistic = useCallback(() => {
    navigation.replace("aliasStatistic", {
      alias: item,
    })
  }, [])

  const onClose = debounce(navigation.goBack, 400)

  return (
    <KeyboardAvoidingView
      behavior={IS_IOS ? "padding" : undefined}
      keyboardVerticalOffset={16}
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
