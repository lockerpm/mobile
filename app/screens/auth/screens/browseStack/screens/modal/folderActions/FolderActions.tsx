import { StyleSheet, View } from "react-native"
import { BottomModalContainer, ImageIcon, Text } from "app/components/cores"
import { FolderView } from "core/models/view/folderView"
import { FolderActionsModal } from "app/static/types"
import { NewActionSheetItem } from "app/components/utils"
import { useStores } from "app/models"
import { useAppTheme } from "@/utils/useAppTheme"
import { useNavigation } from "@react-navigation/native"
import { BrowseScreenProps } from "@/navigators"
import { delay } from "@/utils/delay"

type Props = {
  folder: FolderView
  setNextModal: (action: FolderActionsModal) => void
}

export const FolderAction = ({ folder, setNextModal }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { user } = useStores()
  const navigation = useNavigation<BrowseScreenProps<"folderActionModal">["navigation"]>()

  // ---------------- PARAMS -----------------

  // ---------------- METHODS -----------------

  const handleShare = () => {
    if (user.isFreePlan) {
      setNextModal(FolderActionsModal.PREMIUM_ACTION)
      return
    }
    navigation.goBack()
    delay(30).then(() => {
      navigation.navigate("shareStack", {
        screen: "folderShare",
        params: {
          folder,
        },
      })
    })
  }

  // ---------------- RENDER -----------------

  return (
    <BottomModalContainer>
      <View style={styles.header}>
        <ImageIcon icon={"folder"} size={30} />

        <Text
          preset="bold"
          text={folder?.name}
          numberOfLines={2}
          ellipsizeMode="tail"
          style={styles.name}
        />
      </View>

      <NewActionSheetItem
        bottomBorder
        tx="common:rename"
        icon="edit"
        onPress={() => {
          setNextModal(FolderActionsModal.RENAME)
        }}
      />

      <NewActionSheetItem bottomBorder tx="common:share" icon="share" onPress={handleShare} />

      <NewActionSheetItem
        bottomBorder
        tx="folder:delete_folder"
        icon="trash"
        iconColor={colors.error}
        color={colors.error}
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
    flexShrink: 1,
    marginLeft: 12,
  },
})
