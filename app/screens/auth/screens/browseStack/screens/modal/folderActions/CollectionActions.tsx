import { useCallback } from "react"
import { StyleSheet, View } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { BottomModalContainer, ImageIcon, Text } from "app/components/cores"
import { NewActionSheetItem } from "app/components/utils"
import { useStores } from "app/models"
import { useFolder } from "app/services/hook"
import { AccountRole, FolderActionsModal } from "app/static/types"
import { getTeam } from "app/utils/cipherHelper"
import { CollectionView } from "core/models/view/collectionView"

import { useAppLocale } from "@/i18n/useLanguage"
import { BrowseScreenProps } from "@/navigators"
import { delay } from "@/utils/delay"
import { getRelativeTime } from "@/utils/formatDate"
import { useAppTheme } from "@/utils/useAppTheme"

type Props = {
  acceptedTime?: number
  collection: CollectionView
  setNextModal: (action: FolderActionsModal) => void
  onClose: () => void
}

export const CollectionActions = ({ acceptedTime, collection, setNextModal, onClose }: Props) => {
  const { cipherStore } = useStores()
  const { translate } = useAppLocale()
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
  const shareRole = getTeam(organizations, organizationId).type
  const isOwner = shareRole === AccountRole.OWNER
  const isShared = shareRole === AccountRole.MEMBER || shareRole === AccountRole.ADMIN
  const editable =
    !organizationId || shareRole === AccountRole.ADMIN || shareRole === AccountRole.OWNER

  const acceptTime = acceptedTime
    ? translate("shares:accepted_at", {
        time: getRelativeTime(acceptedTime * 1000, true),
      })
    : ""

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
        <View style={styles.name}>
          <Text preset="bold" text={collection.name} ellipsizeMode="tail" numberOfLines={1} />
          <Text preset="label" size="sm" text={acceptTime} ellipsizeMode="tail" numberOfLines={2} />
        </View>
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
