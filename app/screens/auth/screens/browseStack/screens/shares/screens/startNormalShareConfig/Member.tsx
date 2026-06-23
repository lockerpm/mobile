import { View, StyleSheet, TouchableOpacity, ViewStyle } from "react-native"

import { Icon, PressableIcon, Text } from "app/components/cores"

import { AccountRoleText, ShareMembers } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

type MemberProps = {
  member: ShareMembers
  removeEmail: (email: string) => void
  navigateToEditMember: (
    email: string,
    name: string,
    role: AccountRoleText,
    hidePasswords: boolean
  ) => void
}

export const Member = ({ member, removeEmail, navigateToEditMember }: MemberProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View style={themed($shareMember)}>
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          navigateToEditMember(member.email, member.email, member.role, member.hidePasswords)
        }
      >
        <Text text={member.email} style={styles.email} ellipsizeMode="tail" numberOfLines={1} />
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            navigateToEditMember(member.email, member.email, member.role, member.hidePasswords)
          }
        >
          <Text
            size="xs"
            weight="semiBold"
            color={colors.primary}
            tx={
              member.role === AccountRoleText.MEMBER
                ? "shares:share_folder.viewer"
                : "shares:share_folder.editor"
            }
          />
          <Icon icon="caret-down" size={18} style={styles.mh4} />
        </TouchableOpacity>

        <PressableIcon
          icon="x-circle"
          size={20}
          onPress={() => removeEmail(member.email)}
          color={colors.error}
        />
      </TouchableOpacity>
    </View>
  )
}

const $shareMember: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  borderWidth: 0.5,
  borderColor: colors.border,
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginBottom: 16,
})

const styles = StyleSheet.create({
  email: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  mh4: {
    marginHorizontal: 4,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
