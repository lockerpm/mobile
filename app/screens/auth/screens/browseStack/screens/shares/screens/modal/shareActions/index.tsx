import { ModalBackdrop } from "app/components/cores"
import { ShareStackScreenProps } from "app/navigators"
import { ShareActionsModal } from "app/static/types"
import { debounce } from "app/utils/utils"
import { observable } from "mobx"
import React, { FC } from "react"
import { View, StyleSheet } from "react-native"
import { YourShareCipherActions } from "./YourShareCipherActions"

export const ShareActionsModalScreen: FC<ShareStackScreenProps<"shareActionsModal">> = observable(
  ({
    navigation,
    route: {
      params: { mode, cipher, collection },
    },
  }) => {
    const [targetModal, setTargetModal] = React.useState(mode)

    const onClose = debounce(navigation.goBack, 400)

    return (
      <View style={styles.flex}>
        <ModalBackdrop onPress={onClose} />
        {targetModal === ShareActionsModal.DEFAULT && cipher && (
          <YourShareCipherActions item={cipher} setNextModal={setTargetModal} onClose={onClose} />
        )}
      </View>
    )
  },
)

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
})
