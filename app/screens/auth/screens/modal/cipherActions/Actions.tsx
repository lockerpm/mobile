import { View, StyleSheet } from "react-native"
import { BottomModalContainer, Text } from "app/components/cores"
import { AccountRole, CipherActionsModal, CipherAppView } from "app/static/types"
import { useStores } from "app/models"
import { CipherType } from "core/enums"
import { getCipherDescription, getTeam } from "app/utils/cipherHelper"
import { CipherActionsByType, CipherIconImage } from "app/components/ciphers"
import { NewActionSheetItem } from "app/components/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { useActionsNavigate } from "./useActionsNavigate"
import { useCipherData } from "@/services/hook"

interface Props {
  isDeleted: boolean
  item: CipherAppView
  setNextModal: (action: CipherActionsModal) => void
  onClose: () => void
}

export const Actions = ({ isDeleted, item, setNextModal, onClose }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { cipherStore } = useStores()
  const { deleteCiphers, restoreCiphers } = useCipherData()

  // ------------------------COMPUTED------------------------

  const organizations = cipherStore.organizations
  const cipherDescription = getCipherDescription(item)
  const lockerMasterPassword = item.type === CipherType.MasterPassword

  // Share role and editable status
  const shareRole = getTeam(organizations, item.organizationId).type
  const isShared = shareRole === AccountRole.MEMBER || shareRole === AccountRole.ADMIN
  const isInFolderShare = item.collectionIds?.length > 0
  const editable =
    !item.organizationId || shareRole === AccountRole.ADMIN || shareRole === AccountRole.OWNER

  // -----------------------METHODS-----------------------

  const {
    navigateManageSharedMembers,
    navigateQuickShare,
    navigateHistory,
    navigateCipherDetail,
    navigateCipherClone,
    navigateCipherEdit,
    navigateAttachment,
    navigateMoveToFolder,
  } = useActionsNavigate(item, onClose)

  return (
    <BottomModalContainer>
      <View style={styles.headerContainer}>
        <CipherIconImage cipherType={item.type} source={item.imgLogo} resizeMode="contain" />
        <View style={styles.headerContent}>
          <Text preset="bold" text={item.name} numberOfLines={2} />
          {!!cipherDescription && (
            <Text
              preset="label"
              size="sm"
              text={cipherDescription}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
          )}
        </View>
      </View>

      {!isDeleted && <CipherActionsByType item={item} onClose={onClose} />}

      <NewActionSheetItem
        bottomBorder
        hide={isDeleted || !editable || !item.passwordHistory || item.passwordHistory?.length === 0}
        tx="password_history:view"
        icon="clock-clockwise"
        onPress={navigateHistory}
      />
      <NewActionSheetItem
        bottomBorder
        tx="common:details"
        icon="list-bullets"
        onPress={navigateCipherDetail}
      />
      <NewActionSheetItem
        bottomBorder
        hide={isDeleted || lockerMasterPassword || !editable}
        tx="common:clone"
        icon="copy"
        onPress={navigateCipherClone}
      />
      <NewActionSheetItem
        bottomBorder
        hide={isDeleted || lockerMasterPassword || isInFolderShare || !editable}
        tx="folder:move_to_folder"
        icon="folder-simple"
        onPress={navigateMoveToFolder}
      />
      <NewActionSheetItem
        bottomBorder
        hide={isDeleted || lockerMasterPassword || !editable}
        tx="common:edit"
        icon="edit"
        onPress={navigateCipherEdit}
      />
      <NewActionSheetItem
        bottomBorder
        hide={isDeleted || lockerMasterPassword || isShared || !editable}
        tx="file_attachment:title"
        icon="file-arrow-up"
        onPress={() => {
          navigateAttachment(false)
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={isDeleted || lockerMasterPassword || !(isInFolderShare || isShared) || !editable}
        tx="quick_shares:share_option.quick.tl"
        icon="share"
        onPress={navigateQuickShare}
      />
      <NewActionSheetItem
        bottomBorder
        hide={isDeleted || lockerMasterPassword || isInFolderShare || isShared || !editable}
        tx="common:share"
        icon="share"
        onPress={() => {
          setNextModal(CipherActionsModal.SHARE)
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={
          isDeleted ||
          lockerMasterPassword ||
          isInFolderShare ||
          isShared ||
          !editable ||
          !item?.organizationId
        }
        tx="shares:share_folder.manage_user"
        icon="users-three"
        onPress={navigateManageSharedMembers}
      />
      <NewActionSheetItem
        bottomBorder
        hide={isDeleted || !isShared}
        tx="file_attachment:title"
        icon="file-arrow-up"
        onPress={() => {
          navigateAttachment(true)
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={isDeleted || !isShared}
        tx="shares:leave"
        icon="sign-out"
        color={colors.error}
        iconColor={colors.error}
        onPress={() => {
          setNextModal(CipherActionsModal.LEAVE_SHARE)
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={isDeleted || lockerMasterPassword || !editable}
        tx="trash:to_trash"
        icon="trash"
        color={colors.error}
        iconColor={colors.error}
        onPress={() => {
          setNextModal(CipherActionsModal.DELETE)
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={!isDeleted}
        tx="common:restore"
        icon="repeat"
        onPress={async () => {
          await restoreCiphers([item.id])
          onClose()
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={!isDeleted || lockerMasterPassword || !editable}
        tx="trash:perma_delete"
        icon="trash"
        color={colors.error}
        iconColor={colors.error}
        onPress={async () => {
          await deleteCiphers([item.id])
          onClose()
        }}
      />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    width: "100%",
  },
  headerContent: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 12,
  },
})
