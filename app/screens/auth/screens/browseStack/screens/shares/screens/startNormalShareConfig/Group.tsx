import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native"

import { Icon, PressableIcon, Text } from "app/components/cores"

import { AccountRoleText, ShareGroups } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

type GroupProps = {
  group: ShareGroups
  removeGroup: (id: string) => void
  navigateToEditGroup: (
    id: string,
    value: string,
    role: AccountRoleText,
    hidePassword: boolean
  ) => void
}

export const Group = ({ group, removeGroup, navigateToEditGroup }: GroupProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <TouchableOpacity
      style={themed($shareMember)}
      onPress={() => navigateToEditGroup(group.id, group.name, group.role, group.hidePasswords)}
    >
      <Text text={group.name} style={styles.email} />
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigateToEditGroup(group.id, group.name, group.role, group.hidePasswords)}
      >
        <Text
          size="xs"
          weight="semiBold"
          color={colors.primary}
          tx={
            group.role === AccountRoleText.MEMBER
              ? "shares:share_folder.viewer"
              : "shares:share_folder.editor"
          }
        />
        <Icon icon="caret-down" size={18} style={styles.mh4} />
      </TouchableOpacity>
      <PressableIcon
        icon="x-circle"
        size={20}
        onPress={() => removeGroup(group.id)}
        color={colors.error}
      />
    </TouchableOpacity>
  )
}

const $shareMember: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  borderWidth: 0.5,
  borderColor: colors.border,
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginBottom: 16,
  alignItems: "center",
  flexDirection: "row",
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
