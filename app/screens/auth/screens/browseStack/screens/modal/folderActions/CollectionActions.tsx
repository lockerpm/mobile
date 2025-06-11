import React, { useEffect, useState } from "react"
import { Platform, View } from "react-native"
import { RenameFolderModal } from "./RenameFolderModal"
import { AddUserShareFolderModal } from "./folderSharedUsersManagement/ShareUserModal"
import { useNavigation } from "@react-navigation/native"
import { BottomModalContainer, ImageIcon, Text } from "app/components/cores"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"
import { useStores } from "app/models"
import { useCipherData, useFolder, useHelper } from "app/services/hook"
import { AccountRole, AccountRoleText, FolderActionsModal } from "app/static/types"
import { GeneralApiProblem } from "app/services/api/apiProblem"
import {
  ActionItem,
  ActionSheet,
  DeleteConfirmModal,
  LeaveShareModal,
} from "app/components/ciphers"
import { useAppLocale, useTheme } from "app/services/context"
import { ActionPremiumItem } from "app/components/ciphers/actionsSheet/ActionSheetPremiumItem"
import { useToast } from "app/services/utils"
import { getTeam } from "app/utils/cipherHelper"
import { NewActionSheetItem } from "app/components/utils"

type Props = {
  collection: CollectionView
  setNextModal: (action: FolderActionsModal) => void
}

export const CollectionActions = (props: Props) => {
  const { collection, setNextModal } = props
  const { cipherStore, user, uiStore } = useStores()
  const { colors } = useTheme()
  const { translate } = useAppLocale()
  const { deleteCollection } = useCipherData()
  const { stopShareFolder } = useFolder()

  // ---------------- PARAMS -----------------

  // ---------------- COMPUTED -----------------

  const organizationId = collection.organizationId
  const isCollection = !!organizationId

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

  const handleDelete = async () => {
    await deleteCollection(collection)
  }

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
      {editable && (
        <>
          <NewActionSheetItem
            tx="common.rename"
            icon="edit"
            onPress={() => {
              setNextModal(FolderActionsModal.RENAME)
            }}
          />

          {isCollection && isOwner && (
            <ActionItem
              name={translate("shares.share_folder.manage_user")}
              icon="users-three"
              action={() => {
                // navigation.navigate("shareFolder", { collectionId: folder?.id })
                // onClose()
              }}
            />
          )}
          {isOwner && isCollection && (
            <ActionItem
              name={translate("shares.stop_sharing")}
              icon="x-circle"
              action={() => {
                stopShareFolder(collection)
                // onClose()
              }}
            />
          )}

          {isShared && (
            <ActionItem
              disabled={uiStore.isOffline}
              name={translate("shares.leave")}
              icon="sign-out"
              color={colors.error}
              action={() => {
                setNextModal("leaveConfirm")
                onClose()
              }}
            />
          )}

          {isOwner && (
            <ActionItem
              name={translate("folder.delete_folder")}
              icon="trash"
              color={colors.error}
              action={() => {
                setNextModal("deleteConfirm")
                onClose()
              }}
            />
          )}
        </>
      )}

      {!editable && isShared && (
        <ActionItem
          disabled={uiStore.isOffline}
          name={translate("shares.leave")}
          icon="sign-out"
          color={colors.error}
          action={() => {
            setNextModal("leaveConfirm")
            onClose()
          }}
        />
      )}
    </BottomModalContainer>
  )
}
