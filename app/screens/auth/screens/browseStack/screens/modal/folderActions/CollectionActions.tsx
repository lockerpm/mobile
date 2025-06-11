import React from "react"
import { View } from "react-native"
import { BottomModalContainer, ImageIcon, Text } from "app/components/cores"
import { CollectionView } from "core/models/view/collectionView"
import { useStores } from "app/models"
import { useFolder } from "app/services/hook"
import { AccountRole, AccountRoleText, FolderActionsModal } from "app/static/types"

import { useTheme } from "app/services/context"
import { getTeam } from "app/utils/cipherHelper"
import { NewActionSheetItem } from "app/components/utils"

type Props = {
  collection: CollectionView
  setNextModal: (action: FolderActionsModal) => void
  onClose: () => void
}

export const CollectionActions = ({ collection, setNextModal, onClose }: Props) => {
  const { cipherStore, user } = useStores()
  const { colors } = useTheme()
  const { stopShareFolder } = useFolder()

  // ---------------- PARAMS -----------------

  // ---------------- COMPUTED -----------------

  const organizationId = collection.organizationId

  // Computed
  const organizations = cipherStore.organizations
  const teamRole = getTeam(user.teams, organizationId).role
  const shareRole = getTeam(organizations, organizationId).type
  const isOwner = shareRole === AccountRole.OWNER
  const isShared = shareRole === AccountRole.MEMBER || shareRole === AccountRole.ADMIN
  const editable =
    !organizationId ||
    (teamRole && teamRole !== AccountRoleText.MEMBER) ||
    shareRole === AccountRole.ADMIN ||
    shareRole === AccountRole.OWNER

  // ---------------- METHODS -----------------

  // ---------------- RENDER -----------------

  return (
    <BottomModalContainer>
      <View style={{ width: "100%", paddingHorizontal: 20, marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ImageIcon icon={"folder-share"} size={30} />

          <Text
            preset="bold"
            text={collection.name}
            numberOfLines={2}
            style={{
              marginLeft: 10,
              flex: 1,
            }}
          />
        </View>
      </View>
      <NewActionSheetItem
        hide={!editable}
        tx="common.rename"
        icon="edit"
        onPress={() => {
          setNextModal(FolderActionsModal.RENAME)
        }}
      />

      <NewActionSheetItem
        hide={!editable || !isOwner}
        tx="shares.share_folder.manage_user"
        icon="users-three"
        onPress={() => {
          setNextModal(FolderActionsModal.ADD_MEMBER)
        }}
      />
      <NewActionSheetItem
        hide={!editable || !isOwner}
        tx="shares.stop_sharing"
        icon="x-circle"
        onPress={async () => {
          await stopShareFolder(collection)
          onClose()
        }}
      />

      <NewActionSheetItem
        hide={!editable || !isShared}
        tx="shares.leave"
        icon="sign-out"
        color={colors.error}
        onPress={() => {
          setNextModal(FolderActionsModal.LEAVE_SHARE)
        }}
      />

      <NewActionSheetItem
        hide={!editable || !isOwner}
        tx="folder.delete_folder"
        icon="trash"
        color={colors.error}
        onPress={() => {
          setNextModal(FolderActionsModal.DELETE)
        }}
      />

      <NewActionSheetItem
        hide={editable || !isShared}
        tx="shares.leave"
        icon="sign-out"
        color={colors.error}
        onPress={() => {
          setNextModal(FolderActionsModal.LEAVE_SHARE)
        }}
      />
    </BottomModalContainer>
  )
}
