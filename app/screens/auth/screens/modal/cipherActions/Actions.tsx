import React from "react"
import { View, StyleSheet } from "react-native"
import { BottomModalContainer, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { AccountRole, CipherActionsModal, CipherAppView } from "app/static/types"
import { useStores } from "app/models"
import { CipherType } from "core/enums"
import { getCipherDescription, getTeam } from "app/utils/cipherHelper"
import { CipherActionsByType, CipherIconImage } from "app/components/newCiphers"
import { NewActionSheetItem } from "app/components/utils"
import { useNavigation } from "@react-navigation/native"
import { AuthStackScreenProps } from "app/navigators"

interface Props {
  item: CipherAppView
  setNextModal: (action: CipherActionsModal) => void
  onClose: () => void
}

export const Actions = ({ item, setNextModal, onClose }: Props) => {
  const navigation = useNavigation<AuthStackScreenProps<"cipherActionsModal">["navigation"]>()

  const { colors } = useTheme()
  const { cipherStore } = useStores()

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

  return (
    <BottomModalContainer>
      <View style={styles.headerContainer}>
        <CipherIconImage cipherType={item.type} source={item.imgLogo} resizeMode="contain" />
        <View style={styles.headerContent}>
          <Text preset="bold" text={item.name} numberOfLines={2} />
          {!!cipherDescription && (
            <Text
              preset="label"
              size="base"
              text={cipherDescription}
              numberOfLines={1}
              ellipsizeMode="tail"
            />
          )}
        </View>
      </View>

      <CipherActionsByType item={item} onClose={onClose} />

      <NewActionSheetItem
        hide={!editable || !item.passwordHistory || item.passwordHistory?.length === 0}
        tx="password_history.view"
        icon="clock-clockwise"
        onPress={() => {
          onClose()
          // navigation.navigate("passwords_history")
        }}
      />
      <NewActionSheetItem
        bottomBorder
        tx="common.details"
        icon="list-bullets"
        onPress={() => {
          onClose()
          setTimeout(() => {
            navigation.navigate("browseStack", {
              screen: "cipherDetail",
              params: {
                cipher: item,
              },
            })
          }, 50)
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={lockerMasterPassword || !editable}
        tx="common.clone"
        icon="copy"
        onPress={() => {
          onClose()
          // navigation.navigate(`${cipherMapper.path}__edit`, { mode: "clone" })
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={lockerMasterPassword || isInFolderShare || !editable}
        tx="folder.move_to_folder"
        icon="folder-simple"
        onPress={() => {
          onClose()
          // navigation.navigate("folders__select", {
          //   mode: "move",
          //   initialId: selectedCipher.folderId,
          //   cipherIds: [selectedCipher.id],
          // })
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={lockerMasterPassword || !editable}
        tx="common.edit"
        icon="edit"
        onPress={() => {
          onClose()
          // navigation.navigate(`${cipherMapper.path}__edit`, { mode: "edit" })
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={lockerMasterPassword || isShared || !editable}
        tx="file_attachment.title"
        icon="file-arrow-up"
        onPress={() => {
          onClose()
          // navigation.navigate("attachment")
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={lockerMasterPassword || !(isInFolderShare || isShared) || !editable}
        tx="quick_shares.share_option.quick.tl"
        icon="share"
        onPress={() => {
          onClose()
          // navigation.navigate("quick_shares", { cipher: selectedCipher })
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={lockerMasterPassword || isInFolderShare || isShared || !editable}
        tx="common.share"
        icon="share"
        onPress={() => {
          setNextModal(CipherActionsModal.SHARE)
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={!isShared}
        tx="file_attachment.title"
        icon="file-arrow-up"
        onPress={() => {
          onClose()
          // navigation.navigate("attachment", {
          //   isShared: true,
          // })
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={!isShared}
        tx="shares.leave"
        icon="sign-out"
        color={colors.error}
        iconColor={colors.error}
        onPress={() => {
          setNextModal(CipherActionsModal.LEAVE_SHARE)
        }}
      />
      <NewActionSheetItem
        bottomBorder
        hide={lockerMasterPassword || !editable}
        tx="trash.to_trash"
        icon="trash"
        color={colors.error}
        iconColor={colors.error}
        onPress={() => {
          setNextModal(CipherActionsModal.DELETE)
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
