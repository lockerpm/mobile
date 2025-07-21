import { View, Image, StyleSheet } from "react-native"
import { SharedGroupType } from "app/static/types"
import { PressableScale, Text } from "app/components/cores"

interface Props {
  item: SharedGroupType
  openActions?: (item: SharedGroupType) => void
}

const SHARE_GROUP = require("assets/images/icons/group.png")

export const SharedGroup = ({ item, openActions }: Props) => {
  const isEditable = item.role === "admin"

  // ----------------------- PARAMS -----------------------

  // ----------------------- RENDER -----------------------
  return (
    <PressableScale
      disabled={!openActions}
      style={styles.container}
      onPress={() => openActions?.(item)}
    >
      <Image source={SHARE_GROUP} style={styles.avatar} />

      <View style={styles.content}>
        <Text text={item.name} />
        <View style={styles.row}>
          <Text
            preset="label"
            tx={!isEditable ? "shares:share_type.view" : "shares:share_type.edit"}
          />
        </View>
      </View>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 20,
    height: 40,
    marginRight: 12,
    width: 40,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingVertical: 12,
    width: "100%",
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
