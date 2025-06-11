import { ModalBackdrop } from "app/components/cores"
import { IS_IOS } from "app/config/constants"
import { BrowseStackScreenProps } from "app/navigators"
import { FolderActionsModal } from "app/static/types"
import { debounce } from "app/utils/utils"
import { observable } from "mobx"
import React, { FC } from "react"
import { KeyboardAvoidingView, View, StyleSheet } from "react-native"

// action
import { FolderAction } from "./FolderActions"
import { CollectionActions } from "./CollectionActions"
import { Delete } from "./Delete"
import { Premium } from "./Premium"
import { LeaveShare } from "./LeaveShare"
import { NewFolder } from "./NewFolder"
import { RenameFolder } from "./RenameFolder"
import { RenameCollection } from "./RenameCollection"

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

          {/* {targetModal === FolderActionsModal.SHARE && !!item && (
            <ShareOptions cipherId={item.id} onClose={onClose} setNextModal={setTargetModal} />
          )} */}

          {targetModal === FolderActionsModal.LEAVE_SHARE && !!collection && (
            <LeaveShare onClose={onClose} organizationId={collection.organizationId} />
          )}
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
