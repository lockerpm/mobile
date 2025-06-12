import React, { FC } from "react"
import { StyleSheet, View } from "react-native"
import { debounce } from "app/utils/utils"
import { AuthStackScreenProps } from "app/navigators"
import { ModalBackdrop } from "app/components/cores"
import { Actions } from "./Actions"
import { CipherActionsModal } from "app/static/types"
import { Delete } from "./Delete"
import { ShareOptions } from "./ShareOptions"
import { Premium } from "./Premium"
import { LeaveShared } from "./LeaveShared"

export const CipherActionsModalScreen: FC<AuthStackScreenProps<"cipherActionsModal">> = ({
  navigation,
  route: {
    params: { mode, item, deleteIds, isDeleted = false },
  },
}) => {
  const [targetModal, setTargetModal] = React.useState(mode)

  const onClose = debounce(navigation.goBack, 400)

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />
      {targetModal === CipherActionsModal.DEFAULT && !!item && (
        <Actions item={item} setNextModal={setTargetModal} onClose={onClose} />
      )}

      {targetModal === CipherActionsModal.DELETE && (
        <Delete deleteIds={deleteIds} onClose={onClose} isDeleted={isDeleted} />
      )}

      {targetModal === CipherActionsModal.SHARE && !!item && (
        <ShareOptions cipherId={item.id} onClose={onClose} setNextModal={setTargetModal} />
      )}

      {targetModal === CipherActionsModal.PREMIUM_ACTION && <Premium />}

      {targetModal === CipherActionsModal.LEAVE_SHARE && !!item && (
        <LeaveShared onClose={onClose} cipherId={item.id} organizationId={item.organizationId} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
})
