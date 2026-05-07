import { FC } from "react"
import { Platform, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"

import { ModalBackdrop, Text, Icon, PressableIcon, Button } from "app/components/cores"
import { AuthScreenProps } from "app/navigators"
import { debounce } from "app/utils/utils"

import { colorTransparency, ThemedStyle } from "@/theme"
import { delay } from "@/utils/delay"
import { useAppTheme } from "@/utils/useAppTheme"

export const UpdateEncryptionModalScreen: FC<AuthScreenProps<"updateEncryption">> = ({
  navigation,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const onClose = debounce(navigation.goBack, 400)

  const learnMore = () => {}

  const updateNow = () => {
    if (Platform.OS === "ios") {
      navigation.replace("menuStack", {
        screen: "settingsStack",
        params: {
          screen: "encryptionKey",
        },
      })
      return
    }
    onClose()
    delay(30).then(() => {
      navigation.navigate("menuStack", {
        screen: "settingsStack",
        params: {
          screen: "encryptionKey",
        },
      })
    })
  }

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />
      <View style={themed($container)}>
        <View style={styles.header}>
          <View style={themed($title)}>
            <Text
              tx={"encryption_key:modal.header"}
              color={colors.warning}
              size={"xxs"}
              weight={"medium"}
            />
          </View>
          <PressableIcon icon={"x"} size={20} onPress={onClose} />
        </View>
        <Text tx={"encryption_key:modal.title"} size={"lg"} weight={"semiBold"} />
        <Text tx={"encryption_key:modal.desc"} />
        <TouchableOpacity style={styles.learnMore} onPress={learnMore}>
          <Text
            weight="medium"
            size="xs"
            tx={"encryption_key:modal.learn"}
            color={colors.primary}
          />
          <Icon icon={"arrow-right"} size={16} color={colors.primary} />
        </TouchableOpacity>

        <Button tx={"encryption_key:modal.update"} onPress={updateNow} />
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  marginHorizontal: 20,
  paddingTop: 16,
  padding: 16,
  borderRadius: 16,
  gap: 8,
})

const $title: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 99,
  backgroundColor: colorTransparency(colors.warning, 20),
  paddingHorizontal: 8,
  padding: 4,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  learnMore: { alignItems: "center", flexDirection: "row", gap: 2, marginBottom: 36 },
})
