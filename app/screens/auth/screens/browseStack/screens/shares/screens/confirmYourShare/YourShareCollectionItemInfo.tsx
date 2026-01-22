import { View, StyleSheet } from "react-native"

import { ImageIcon, Text } from "app/components/cores"

import { useAppLocale } from "@/i18n"

type Props = {
  name: string
  cipherCount?: number
}

export const YourShareCollectionItem = (item: Props) => {
  const { translate } = useAppLocale()
  return (
    <View style={styles.pv12}>
      <View style={styles.row}>
        <ImageIcon icon={"folder-share"} size={30} />
        <View style={styles.content}>
          <View style={styles.row}>
            <Text preset="bold" text={item.name} numberOfLines={2} style={styles.name} />
          </View>

          <Text
            size="sm"
            preset="label"
            text={
              item.cipherCount !== undefined
                ? `${item.cipherCount} ` + translate("common:items")
                : "0 " + translate("common:item")
            }
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 12,
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
  },

  pv12: {
    paddingVertical: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
