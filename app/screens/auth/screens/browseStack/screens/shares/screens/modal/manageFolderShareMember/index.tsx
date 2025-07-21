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
import { useCipherData, useFolder } from "@/services/hook"
import { TxKeyPath } from "@/i18n"
import { SharedGroup } from "../../manageSharedMember/SharedGroup"
import { SharedMember } from "../../manageSharedMember/SharedMember"
import { ThemedStyle } from "@/theme"
import { AppEventType, EventBus } from "@/utils/eventBus"

export const ManageFolderShareMemberModalScreen: FC<
  ShareScreenProps<"manageFolderSharedMemberModal">
> = ({
  navigation,
  route: {
    params: { member, group, collection },
  },
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { editShareCipher } = useCipherData()
  const { shareFolderRemoveMember } = useFolder()

  const onClose = debounce(navigation.goBack, 400)

  const id = member?.id || group?.id || ""
  const isEditable = member?.role === "admin" || group?.role === "admin"
  const onReload = () => {
    EventBus.emit(AppEventType.MANAGE_SHARE_MEMBER_UPDATE, null)
    onClose()
  }

  const onEditRole = async (shareType: "only_fill" | "edit") => {
    let role = AccountRoleText.MEMBER
    let autofillOnly = false
    switch (shareType) {
      case "only_fill":
        autofillOnly = true
        break
      case "edit":
        role = AccountRoleText.ADMIN
        break
    }
    const res = await editShareCipher(
      collection.organizationId ?? "",
      id,
      role,
      autofillOnly,
      !!group
    )
    if (res.kind === "ok" || res.kind === "unauthorized") {
      onReload()
    }
  }

  const onRemove = async () => {
    const res = await shareFolderRemoveMember(collection, id, !!group)
    if (res.kind === "ok" || res.kind === "unauthorized") {
      onReload()
    }
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
        <View style={styles.header}>
          {member && <SharedMember item={member} />}
          {group && <SharedGroup item={group} />}
        </View>

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
        <PressableScale onPress={onRemove}>
          <View style={themed($item)}>
            <View style={styles.row}>
              <Icon icon="user-minus" size={24} color={colors.error} style={styles.icon} />
              <Text tx={"common:remove"} color={colors.error} style={styles.title} />
            </View>
          </View>
        </PressableScale>
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
    marginTop: -6,
    paddingHorizontal: 16,
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
  title: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
})
