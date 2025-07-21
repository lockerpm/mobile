import { FolderView } from "core/models/view/folderView"
import { StyleSheet, View } from "react-native"
import { ImageIcon, PressableIcon, PressableScale, Text } from "app/components/cores"
import { useAppLocale } from "@/i18n"

type Props = {
  item: FolderView
  openFolderCipher: (folderId: string, name: string) => void
  openAction: (item: FolderView) => void
}

export const FolderItem = ({ item, openFolderCipher, openAction }: Props) => {
  const { translate } = useAppLocale()
  const name = item.name || translate("folder:unassigned")

  return (
    <PressableScale
      onPress={() => {
        openFolderCipher(item.id, name)
      }}
      style={styles.pv12}
    >
      <View style={styles.row}>
        <ImageIcon icon={"folder"} size={30} />
        <View style={styles.content}>
          <Text preset="bold" text={name} ellipsizeMode="tail" numberOfLines={2} />

          <Text
            size="sm"
            preset="label"
            text={
              (item.cipherCount !== undefined ? `${item.cipherCount} ` : "0 ") +
              translate(item.cipherCount > 1 ? "common:items" : "common:item")
            }
          />
        </View>

        {!!item.id && (
          <PressableIcon
            icon="dots-three"
            size={24}
            onPress={() => openAction(item)}
            containerStyle={styles.icon}
          />
        )}
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 12,
  },
  icon: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  pv12: {
    paddingVertical: 12,
  },
  row: { alignItems: "center", flexDirection: "row" },
})
