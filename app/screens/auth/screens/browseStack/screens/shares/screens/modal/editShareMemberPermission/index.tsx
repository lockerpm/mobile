import { FC } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { debounce } from "app/utils/utils"
import { ShareScreenProps } from "app/navigators"
import {
  BottomModalContainer,
  Icon,
  Text,
  ModalBackdrop,
  PressableScale,
  IconTypes,
} from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { AccountRoleText } from "@/static/types"
import { TxKeyPath } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { AppEventType, EventBus } from "@/utils/eventBus"

export const EditShareMemberPermissionModalScreen: FC<
  ShareScreenProps<"editShareMemberPermissionModal">
> = ({
  navigation,
  route: {
    params: { id, value, role },
  },
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const onClose = debounce(navigation.goBack, 400)

  const isEditable = role === "admin"

  const onEditRole = async (shareType: "only_fill" | "edit") => {
    const role = shareType === "only_fill" ? AccountRoleText.MEMBER : AccountRoleText.ADMIN

    EventBus.emit(AppEventType.MANAGE_SHARE_MEMBER_UPDATE, {
      id,
      role,
    })
    onClose()
  }

  const permissions: {
    icon: IconTypes
    value: boolean
    title: TxKeyPath
    decs: TxKeyPath
    onPress: () => void
  }[] = [
    {
      icon: "eye",
      value: !isEditable,
      title: "shares:share_folder.viewer",
      decs: "shares:share_folder.viewer_per",
      onPress: () => onEditRole("only_fill"),
    },
    {
      icon: "edit",
      value: isEditable,
      title: "shares:share_folder.editor",
      decs: "shares:share_folder.editor_per",
      onPress: () => onEditRole("edit"),
    },
  ]

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />

      <BottomModalContainer>
        <Text weight="medium" text={value} style={styles.header} />

        {permissions.map((item, index) => (
          <PressableScale key={index} onPress={item.onPress}>
            <View style={themed($item)}>
              <View style={styles.row}>
                <Icon icon={item.icon} containerStyle={styles.icon} />
                <View>
                  <Text preset="bold" tx={item.title} />
                  <Text preset="label" tx={item.decs} />
                </View>
              </View>

              {item.value && <Icon icon="check-bold" size={24} color={colors.primary} />}
            </View>
          </PressableScale>
        ))}
      </BottomModalContainer>
    </View>
  )
}

const $item: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.border,
  alignItems: "center",
  borderRadius: 12,
  borderWidth: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: 16,
  marginVertical: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    justifyContent: "flex-end",
  },
  header: {
    marginHorizontal: 16,
    textAlign: "center",
  },
  icon: {
    marginRight: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
})
