import React from "react"
import { StyleSheet, View } from "react-native"
import moment from "moment"
import { RelayAddress } from "app/static/types"
import { Icon, PressableScale, Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import Animated, { FadeInUp } from "react-native-reanimated"

interface Props {
  isFreeAccount: boolean
  item: RelayAddress
  isEditable: boolean
  openActions: (
    item: RelayAddress,
    isEditable: boolean,
    freeAccount: boolean,
    edit?: boolean,
  ) => void
}

export const AliasItem = ({ isFreeAccount, item, isEditable, openActions }: Props) => {
  const { colors } = useTheme()
  return (
    <PressableScale
      onPress={() => {
        openActions(item, isEditable, isFreeAccount)
      }}
    >
      <Animated.View
        entering={FadeInUp}
        style={[
          styles.container,
          {
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.flexGrow}>
            <Text numberOfLines={1} preset="bold" text={item.full_address} style={styles.mb4} />
            <Text size="base" text={moment.unix(item.created_time).format("DD/MM/YYYY")} />
          </View>
          {isEditable && (
            <Icon
              icon="edit"
              size={24}
              style={styles.mr12}
              onPress={() => {
                openActions(item, isEditable, isFreeAccount, true)
              }}
            />
          )}

          <Icon icon="dots-three-vertical" size={24} />
        </View>
      </Animated.View>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
    padding: 12,
    paddingVertical: 8,
  },
  flexGrow: {
    flexGrow: 1,
    flexShrink: 1,
  },
  mb4: { marginBottom: 4 },
  mr12: { marginRight: 12 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
})
