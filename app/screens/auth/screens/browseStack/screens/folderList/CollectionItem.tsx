import React from "react"
import { View, StyleSheet } from "react-native"
import { useAppLocale } from "app/services/context"
import { Icon, ImageIcon, PressableScale, Text } from "app/components/cores"
import { CollectionView } from "core/models/view/collectionView"

type Props = {
  item: CollectionView
  openCollectionCipher: (collectionId: string, orgId: string) => void
  openAction: (collectionId: string) => void
}

export const CollectionItem = ({ item, openCollectionCipher, openAction }: Props) => {
  const { translate } = useAppLocale()
  return (
    <PressableScale
      onPress={() => {
        openCollectionCipher(item.id, item.organizationId)
      }}
      style={styles.pv12}
    >
      <View style={styles.row}>
        <ImageIcon icon={"folder-share"} size={30} />
        <View style={styles.content}>
          <Text preset="bold" text={item.name} numberOfLines={2} />
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
