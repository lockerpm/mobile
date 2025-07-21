import { ModalBackdrop } from "app/components/cores"
import { BrowseScreenProps } from "app/navigators"
import { FolderActionsModal } from "app/static/types"
import { debounce } from "app/utils/utils"
import { FC, useState } from "react"
import { KeyboardAvoidingView, View, StyleSheet, Platform } from "react-native"

// action
import { FolderAction } from "./FolderActions"
import { CollectionActions } from "./CollectionActions"
import { Delete } from "./Delete"
import { Premium } from "./Premium"
import { LeaveShare } from "./LeaveShare"
import { NewFolder } from "./NewFolder"
import { RenameFolder } from "./RenameFolder"
import { RenameCollection } from "./RenameCollection"
import { observer } from "mobx-react-lite"
const IS_IOS = Platform.OS === "ios"

export const FolderActionsModalScreen: FC<BrowseScreenProps<"folderActionModal">> = observer(
  ({
    navigation,
    route: {
      params: { mode, folder, collection },
    },
  }) => {
    const [targetModal, setTargetModal] = useState(mode)

    const onClose = debounce(navigation.goBack, 400)

    return (
      <KeyboardAvoidingView
        behavior={IS_IOS ? "padding" : "height"}
        keyboardVerticalOffset={0}
        style={styles.flex}
      >
        <View style={styles.flex}>
          <ModalBackdrop onPress={onClose} />
          {targetModal === FolderActionsModal.DEFAULT && !!folder && (
            <FolderAction folder={folder} setNextModal={setTargetModal} />
          )}

          {targetModal === FolderActionsModal.DEFAULT && !!collection && (
            <CollectionActions
              collection={collection}
              setNextModal={setTargetModal}
              onClose={onClose}
            />
          )}

          {targetModal === FolderActionsModal.CREATE && <NewFolder onClose={onClose} />}

          {targetModal === FolderActionsModal.RENAME && folder && (
            <RenameFolder folder={folder} onClose={onClose} />
          )}

          {targetModal === FolderActionsModal.RENAME && collection && (
            <RenameCollection collection={collection} onClose={onClose} />
          )}

          {targetModal === FolderActionsModal.DELETE && (
            <Delete folder={folder} collection={collection} onClose={onClose} />
          )}

          {targetModal === FolderActionsModal.PREMIUM_ACTION && <Premium />}

          {targetModal === FolderActionsModal.LEAVE_SHARE && !!collection && (
            <LeaveShare onClose={onClose} organizationId={collection.organizationId} />
          )}
        </View>
      </KeyboardAvoidingView>
    )
  }
)

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
})
