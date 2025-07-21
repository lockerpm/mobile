import { View, Image, StyleSheet, ViewStyle } from "react-native"
import { PressableIcon, PressableScale, Text } from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { FamilyMember } from "@/static/types"

export interface FamilyMemberProp {
  id: number
  email: string
  avatar: string
  created_time: string
  username: string
  full_name: string
}

interface MemberProps {
  member: FamilyMember
  onActions: (val: FamilyMember) => void
}

export const Member = ({ member, onActions }: MemberProps) => {
  const { id, email, avatar, full_name } = member
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const owner = id === null
  // ----------------------- RENDER -----------------------
  return (
    <PressableScale disabled={owner} onPress={() => onActions(member)}>
      <View style={themed($container)}>
        <Image resizeMode="contain" source={{ uri: avatar }} style={styles.modalImage} />

        <View style={styles.text}>
          <Text
            text={full_name || "Unknown"}
            style={{ color: owner ? colors.primary : colors.title }}
          />
          <Text text={email} color={colors.label} size="sm" />
        </View>

        {!owner && <PressableIcon icon="dots-three" size={20} onPress={() => onActions(member)} />}
      </View>
    </PressableScale>
  )
}

const $container: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
  justifyContent: "flex-start",
})

const styles = StyleSheet.create({
  modalImage: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  text: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 12,
  },
})
