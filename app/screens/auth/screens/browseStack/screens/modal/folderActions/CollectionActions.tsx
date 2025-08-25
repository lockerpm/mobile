import { StyleSheet, View } from "react-native"
import { BottomModalContainer, ImageIcon, Text } from "app/components/cores"
import { CollectionView } from "core/models/view/collectionView"
import { useStores } from "app/models"
import { useFolder } from "app/services/hook"
import { AccountRole, AccountRoleText, FolderActionsModal } from "app/static/types"
import { getTeam } from "app/utils/cipherHelper"
import { NewActionSheetItem } from "app/components/utils"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { BrowseScreenProps } from "@/navigators"
import { delay } from "@/utils/delay"
import { useCallback } from "react"

type Props = {
  collection: CollectionView
  setNextModal: (action: FolderActionsModal) => void
  onClose: () => void
}

export const CollectionActions = ({ collection, setNextModal, onClose }: Props) => {
  const { cipherStore, user } = useStores()
  const {
    theme: { colors },
  } = useAppTheme()
  const { stopShareFolder } = useFolder()
  const navigation = useNavigation<BrowseScreenProps<"folderActionModal">["navigation"]>()
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

  const navigateToManageShareMember = useCallback(() => {
    navigation.goBack()
    delay(30).then(() => {
      navigation.navigate("shareStack", {
        screen: "manageFolderSharedMember",
        params: {
          collection: collection,
        },
      })
    })
  }, [navigation, collection])

  const navigateToCollectionCiphers = useCallback(() => {
    navigation.goBack()
    delay(30).then(() => {
      navigation.navigate("cipherList", {
        header: collection.name,
        collectionId: collection.id,
        organizationId: collection.organizationId,
      })
    })
  }, [navigation, collection])

  // ---------------- RENDER -----------------

  return (
    <BottomModalContainer>
      <View style={styles.header}>
        <ImageIcon icon={"folder-share"} size={30} />
        <Text
          preset="bold"
          text={collection.name}
          ellipsizeMode="tail"
          numberOfLines={2}
          style={styles.name}
        />
      </View>

      <NewActionSheetItem
        bottomBorder
        tx="shares:share_folder.detail"
        icon="list-bullets"
        onPress={navigateToCollectionCiphers}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!editable}
        tx="common:rename"
        icon="edit"
        onPress={() => {
          setNextModal(FolderActionsModal.RENAME)
        }}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!editable || !isOwner}
        tx="shares:share_folder.manage_user"
        icon="users-three"
        onPress={navigateToManageShareMember}
      />
      <NewActionSheetItem
        bottomBorder
        hide={!editable || !isOwner}
        tx="shares:stop_sharing"
        icon="sign-out"
        color={colors.error}
        iconColor={colors.error}
        onPress={async () => {
          await stopShareFolder(collection)
          onClose()
        }}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!isShared}
        tx="shares:leave"
        icon="sign-out"
        color={colors.error}
        iconColor={colors.error}
        onPress={() => {
          setNextModal(FolderActionsModal.LEAVE_SHARE)
        }}
      />

      <NewActionSheetItem
        bottomBorder
        hide={!editable || !isOwner}
        tx="folder:delete_folder"
        icon="trash"
        color={colors.error}
        iconColor={colors.error}
        onPress={() => {
          setNextModal(FolderActionsModal.DELETE)
        }}
      />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
    marginBottom: 12,
    paddingHorizontal: 16,
    width: "100%",
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 12,
  },
})
