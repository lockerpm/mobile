import React, { FC } from "react"
import { KeyboardAvoidingView, StyleSheet, View } from "react-native"
import { debounce } from "app/utils/utils"
import { IS_IOS } from "app/config/constants"
import { AuthStackScreenProps } from "app/navigators"
import { ModalBackdrop } from "app/components/cores"
import { Actions } from "./Actions"
import { CipherActionsModal } from "app/static/types"
import { Delete } from "./Delete"

export const CipherActionsModalScreen: FC<AuthStackScreenProps<"cipherActionsModal">> = ({
  navigation,
  route: {
    params: { mode, item, deleteIds },
  },
}) => {
  const [targetModal, setTargetModal] = React.useState(mode)

  const onClose = debounce(navigation.goBack, 400)

  return (
    <KeyboardAvoidingView
      behavior={IS_IOS ? "padding" : undefined}
      keyboardVerticalOffset={16}
      style={styles.flex}
    >
      <View style={styles.flex}>
        <ModalBackdrop onPress={onClose} />
        {targetModal === CipherActionsModal.DEFAULT && !!item && (
          <Actions item={item} setNextModal={setTargetModal} onClose={onClose} />
        )}

        {targetModal === CipherActionsModal.DELETE && (
          <Delete deleteIds={deleteIds} onClose={onClose} />
        )}
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
