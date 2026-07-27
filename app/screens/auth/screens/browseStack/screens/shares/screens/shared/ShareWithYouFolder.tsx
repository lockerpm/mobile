import { memo } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

import { ImageIcon, PressableScale, Text } from "app/components/cores"
import { PendingSharedFolderType } from "app/static/types"

import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

type Prop = {
  item: PendingSharedFolderType
  openActionMenu?: (item: PendingSharedFolderType) => void
}

export const ShareWithYouFolder = memo((props: Prop) => {
  const { item, openActionMenu } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <PressableScale
      disabled={!openActionMenu || item.isAccepted}
      onPress={() => {
        if (openActionMenu) {
          openActionMenu(item)
        }
      }}
      style={styles.container}
    >
      <View style={styles.row}>
        <ImageIcon icon="folder-share" size={30} />

        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.name}>
              <Text preset="bold" text={item.name} numberOfLines={1} />
            </View>

            {/* Pending status */}
            <View style={themed($pending)}>
              <Text
                tx={item.isAccepted ? "shares:wait_confirm" : "common:pending"}
                preset="bold"
                size="xs"
                color={colors.background}
              />
            </View>
          </View>

          {/* Description */}
          {!!item.description && (
            <Text
              size="sm"
              preset="label"
              text={item.description}
              style={styles.mt3}
              numberOfLines={1}
            />
          )}
        </View>
      </View>
    </PressableScale>
  )
})

ShareWithYouFolder.displayName = "ShareWithYouFolder"

const $pending: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 10,
  paddingVertical: 2,
  backgroundColor: colors.warning,
  borderRadius: 3,
})

const styles = StyleSheet.create({
  container: {
    height: 71,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  mt3: {
    marginTop: 3,
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
