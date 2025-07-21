import { View, Image, TouchableOpacity, ViewStyle, StyleSheet } from "react-native"
import { Icon, Text } from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

const REFER_LOCKER = require("assets/images/intro/refer-locker.png")

const referColor = "#072245"

export const ReferFriendMenuItem = ({ onPress }: { onPress: () => void }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <TouchableOpacity onPress={onPress} style={styles.mt24}>
      <View style={styles.container}>
        <Image resizeMode="contain" source={REFER_LOCKER} style={styles.image} />
        <Text
          preset="bold"
          color={colors.white}
          style={styles.title}
          tx={"refer_friend:menu_title"}
        />
      </View>

      <View style={themed($container)}>
        <Text preset="bold" color={colors.white} tx={"refer_friend:navigate"} />
        <Icon icon="caret-right" size={18} color={colors.white} />
      </View>
    </TouchableOpacity>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.primary,
  paddingHorizontal: 16,
  paddingVertical: 15,
  flex: 1,
  flexDirection: "row",
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  justifyContent: "space-between",
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: referColor,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 80,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  image: {
    height: 104,
    position: "absolute",
    right: 16,
    width: 128,
  },
  mt24: {
    marginTop: 24,
  },
  title: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
