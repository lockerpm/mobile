import React, { memo } from "react"
import { StyleSheet, View } from "react-native"
import { useTheme } from "app/services/context"
import { Text, PressableScale, Icon } from "app/components/cores"
import { colorTransparency } from "app/theme"

interface ItemProps {
  email: string
  onPress: () => void
}

export const RootEmailInfo = memo(({ onPress, email }: ItemProps) => {
  const { colors } = useTheme()

  return (
    <PressableScale onPress={onPress}>
      <View
        style={[
          styles.container,
          {
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.email}>
            <Icon
              icon={"mailbox-fill"}
              size={24}
              color={colors.primary}
              containerStyle={{
                backgroundColor: colorTransparency(colors.primary, 20),
                borderRadius: 24,
                padding: 8,
              }}
            />
            <View style={styles.ml8}>
              <Text tx={"private_relay.root_email"} />
              <Text preset="bold" text={email} />
            </View>
          </View>
          <Icon icon={"info"} size={24} color={colorTransparency(colors.link, 50)} />
        </View>
      </View>
    </PressableScale>
  )
})

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  email: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
  ml8: { marginLeft: 8 },
})
