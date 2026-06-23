import { View, Image, StyleSheet } from "react-native"

import { PressableScale, Text } from "app/components/cores"
import { SharedMemberType, SharingStatus } from "app/static/types"

import { TxKeyPath } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  item: SharedMemberType
  openActions?: (item: SharedMemberType) => void
}

export const SharedMember = ({ item, openActions }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()

  const isEditable = item.role === "admin"

  // ----------------------- RENDER -----------------------
  return (
    <PressableScale
      disabled={!openActions}
      style={styles.container}
      onPress={() => openActions?.(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      <View style={styles.content}>
        <Text text={item.email} numberOfLines={1} ellipsizeMode="tail" style={styles.content} />
        <Text
          preset="label"
          tx={!isEditable ? "shares:share_type.view" : "shares:share_type.edit"}
        />
      </View>
      {/* Sharing status */}
      {item.status && (
        <View
          style={[
            styles.status,
            {
              backgroundColor:
                item.status === SharingStatus.INVITED
                  ? colors.warning
                  : item.status === SharingStatus.ACCEPTED
                    ? colors.label
                    : colors.primary,
            },
          ]}
        >
          <Text
            preset="bold"
            tx={`shares:status.${item.status.toLowerCase()}` as TxKeyPath}
            size="sm"
            color={colors.white}
          />
        </View>
      )}
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
    paddingVertical: 12,
    width: "100%",
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  status: {
    alignSelf: "center",
    borderRadius: 3,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
})
