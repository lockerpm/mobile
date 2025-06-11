import { ModalBackdrop } from "app/components/cores"
import { IS_IOS } from "app/config/constants"
import { BrowseStackScreenProps } from "app/navigators"
import { FolderActionsModal } from "app/static/types"
import { debounce } from "app/utils/utils"
import { observable } from "mobx"
import React, { FC } from "react"
import { KeyboardAvoidingView, View } from "react-native"
import { FolderAction } from "./FolderActions"

export const FolderActionsModalScreen: FC<BrowseStackScreenProps<"folderActionModal">> = observable(
  ({
    navigation,
    route: {
      params: { mode, folder, collection },
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
          {targetModal === FolderActionsModal.DEFAULT && !!folder && (
            <FolderAction folder={folder} setNextModal={setTargetModal} />
          )}

          {/* {targetModal === FolderActionsModal.DELETE && (
            <Delete deleteIds={deleteIds} onClose={onClose} />
          )}
  
          {targetModal === FolderActionsModal.SHARE && !!item && (
            <ShareOptions cipherId={item.id} onClose={onClose} setNextModal={setTargetModal} />
          )}
  
          {targetModal === FolderActionsModal.PREMIUM_ACTION && <Premium />}
  
          {targetModal === FolderActionsModal.LEAVE_SHARE && !!item && (
            <LeaveShared onClose={onClose} cipherId={item.id} organizationId={item.organizationId} />
          )} */}
        </View>
      </KeyboardAvoidingView>
    )
  },
)

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
})
