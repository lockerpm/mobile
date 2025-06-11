import React from "react"
import { FolderView } from "core/models/view/folderView"
import { StyleSheet, View } from "react-native"
import { useAppLocale } from "app/services/context"
import { Icon, ImageIcon, PressableScale, Text } from "app/components/cores"

type Props = {
  item: FolderView
  openFolderCipher: (folderId: string) => void
  openAction: (folderId: string) => void
}

export const FolderItem = ({ item, openFolderCipher, openAction }: Props) => {
  const { translate } = useAppLocale()
  return (
    <PressableScale
      onPress={() => {
        openFolderCipher(item.id)
      }}
      style={styles.pv12}
    >
      <View style={styles.row}>
        <ImageIcon icon={"folder"} size={30} />
        <View style={styles.content}>
          <Text preset="bold" text={item.name} tx="folder.unassigned" numberOfLines={2} />

          <Text
            size="base"
            preset="label"
            text={
              (item.cipherCount !== undefined ? `${item.cipherCount} ` : "0 ") +
              translate(item.cipherCount > 1 ? "common.items" : "common.item")
            }
          />
        </View>

        {!!item.id && (
          <Icon
            icon="dots-three"
            size={18}
            onPress={() => openAction(item.id)}
            containerStyle={styles.icon}
          />
        )}
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  content: {
    flexShrink: 1,
    marginLeft: 12,
  },
  icon: {
    alignItems: "center",
    height: 35,
    justifyContent: "flex-end",
    width: 40,
  },
  pv12: {
    paddingVertical: 12,
  },
  row: { alignItems: "center", flexDirection: "row" },
})
