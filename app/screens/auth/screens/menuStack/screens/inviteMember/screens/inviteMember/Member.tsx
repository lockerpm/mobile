import { View, Image, StyleSheet, ViewStyle } from "react-native"
import { PressableScale, Text } from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

interface MemberProps {
  email: string
  onPress: (email: string) => void
}

const AVATAR = require("assets/images/icons/avatar-2.png")

export const InviteMember = ({ email, onPress }: MemberProps) => {
  const { themed } = useAppTheme()

  // ----------------------- PARAMS -----------------------

  // ----------------------- RENDER -----------------------
  return (
    <PressableScale onPress={() => onPress(email)}>
      <View style={themed($container)}>
        <Image resizeMode="contain" source={AVATAR} style={styles.modalImage} />
        <View style={styles.text}>
          <Text text={email}></Text>
        </View>
      </View>
    </PressableScale>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.block,
  borderWidth: 1,
  borderRadius: 12,
  paddingHorizontal: 16,
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 15,
  paddingVertical: 12,
  justifyContent: "flex-start",
})

const styles = StyleSheet.create({
  modalImage: {
    borderRadius: 20,
    height: 40,
    marginRight: 12,
    width: 40,
  },

  text: {
    flex: 1,
    justifyContent: "center",
  },
})
