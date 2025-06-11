import React from "react"
import { View } from "react-native"
import { BottomModalContainer, ImageIcon, Text } from "app/components/cores"
import { FolderView } from "core/models/view/folderView"
import { FolderActionsModal } from "app/static/types"
import { useTheme } from "app/services/context"
import { NewActionSheetItem } from "app/components/utils"
import { useStores } from "app/models"

type Props = {
  folder: FolderView
  setNextModal: (action: FolderActionsModal) => void
}

export const FolderAction = ({ folder, setNextModal }: Props) => {
  const { colors } = useTheme()
  const { user } = useStores()

  // ---------------- PARAMS -----------------

  // ---------------- METHODS -----------------

  const handleShare = () => {
    if (user.isFreePlan) {
      setNextModal(FolderActionsModal.PREMIUM_ACTION)
      return
    }
    setNextModal(FolderActionsModal.SHARE)
  }

  // ---------------- RENDER -----------------

  return (
    <BottomModalContainer>
      <View style={{ width: "100%", paddingHorizontal: 20, marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ImageIcon icon={"folder"} size={30} />

          <Text
            preset="bold"
            text={folder?.name}
            numberOfLines={2}
            style={{
              marginLeft: 10,
              flexShrink: 1,
            }}
          />
        </View>
      </View>

      <NewActionSheetItem
        tx="common.rename"
        icon="edit"
        onPress={() => {
          setNextModal(FolderActionsModal.RENAME)
        }}
      />

      <NewActionSheetItem tx="common.share" icon="share" onPress={handleShare} />

      <NewActionSheetItem
        tx="folder.delete_folder"
        icon="trash"
        color={colors.error}
        onPress={() => {
          setNextModal(FolderActionsModal.DELETE)
        }}
      />
    </BottomModalContainer>
  )
}
