import { FC, useState } from "react"
import { StyleSheet, View } from "react-native"

import { ModalBackdrop } from "app/components/cores"
import { AuthScreenProps } from "app/navigators"
import { CipherActionsModal } from "app/static/types"
import { debounce } from "app/utils/utils"

import { Actions } from "./Actions"
import { Delete } from "./Delete"
import { LeaveShared } from "./LeaveShared"
import { OtpActions } from "./OtpActions"
import { PremiumAction } from "./PremiumAction"
import { ShareOptions } from "./ShareOptions"

export const CipherActionsModalScreen: FC<AuthScreenProps<"cipherActionsModal">> = ({
  navigation,
  route: {
    params: { mode, item, deleteIds, isDeleted = false, acceptedTime },
  },
}) => {
  const [targetModal, setTargetModal] = useState(mode)

  const onClose = debounce(navigation.goBack, 400)

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />

      {targetModal === CipherActionsModal.OTP_ACTIONS && !!item && (
        <OtpActions item={item} setNextModal={setTargetModal} onClose={onClose} />
      )}

      {targetModal === CipherActionsModal.DEFAULT && !!item && (
        <Actions
          isDeleted={isDeleted}
          item={item}
          setNextModal={setTargetModal}
          onClose={onClose}
          acceptedTime={acceptedTime}
        />
      )}

      {targetModal === CipherActionsModal.DELETE && (
        <Delete deleteIds={deleteIds} onClose={onClose} isDeleted={isDeleted} />
      )}

      {targetModal === CipherActionsModal.SHARE && !!item && (
        <ShareOptions cipher={item} onClose={onClose} setNextModal={setTargetModal} />
      )}

      {targetModal === CipherActionsModal.PREMIUM_ACTION && <PremiumAction isShare={true} />}

      {targetModal === CipherActionsModal.PREMIUM_LIMIT && <PremiumAction isShare={false} />}

      {targetModal === CipherActionsModal.LEAVE_SHARE && !!item && (
        <LeaveShared
          onClose={onClose}
          cipherId={item.id}
          organizationId={item.organizationId || ""}
        />
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
