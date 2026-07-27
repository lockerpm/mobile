import { View, StyleSheet } from "react-native"

import { ImageIcon, PressableIcon, PressableScale, Text } from "app/components/cores"
import { CollectionView } from "core/models/view/collectionView"

import { useAppLocale } from "@/i18n"

type Props = {
  acceptedTime?: number
  isYourSharedScreen?: boolean
  item: CollectionView
  openCollectionCipher: (collectionId: string, orgId: string, name: string) => void
  openAction: (item: CollectionView, acceptedTime?: number) => void
}

export const CollectionItem = ({
  item,
  openCollectionCipher,
  openAction,
  isYourSharedScreen,
  acceptedTime,
}: Props) => {
  const { translate } = useAppLocale()
  return (
    <PressableScale
      onPress={() => {
        if (!!item.id && isYourSharedScreen) {
          openAction(item, acceptedTime)
          return
        }
        openCollectionCipher(item.id, item.organizationId, item.name)
      }}
      style={styles.pv12}
    >
      <View style={styles.row}>
        <ImageIcon icon={"folder-share"} size={30} />
        <View style={styles.content}>
          <Text preset="bold" text={item.name} numberOfLines={2} />
          <Text
            size="sm"
            preset="label"
            text={
              (item.cipherCount !== undefined ? `${item.cipherCount} ` : "0 ") +
              translate(item.cipherCount > 1 ? "common:items" : "common:item")
            }
          />
        </View>

        {!!item.id && !isYourSharedScreen && (
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
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
