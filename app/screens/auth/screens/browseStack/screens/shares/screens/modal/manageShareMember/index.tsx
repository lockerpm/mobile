import { FC } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

import {
  BottomModalContainer,
  Icon,
  Text,
  ModalBackdrop,
  PressableScale,
  Switch,
} from "app/components/cores"
import { ShareScreenProps } from "app/navigators"
import { debounce } from "app/utils/utils"
import { CipherType } from "core/enums"

import { useCipherData } from "@/services/hook"
import { AccountRoleText } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"

import { SharedGroup } from "../../manageSharedMember/SharedGroup"
import { SharedMember } from "../../manageSharedMember/SharedMember"

export const ManageShareMemberModalScreen: FC<ShareScreenProps<"manageSharedMemberModal">> = ({
  navigation,
  route: {
    params: { member, group, cipher },
  },
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { editShareCipher } = useCipherData()
  const { stopShareCipherForGroup, stopShareCipher } = useCipherData()

  const onClose = debounce(navigation.goBack, 400)

  const id = member?.id || group?.id || ""
  const isEditable = member?.role === "admin" || group?.role === "admin"
  const isHidePassword = member?.hide_passwords || group?.hide_passwords || false
  const showHidePasswordOption = cipher.type === CipherType.Login

  const currentRole = member?.role || group?.role || AccountRoleText.MEMBER

  const onReload = () => {
    EventBus.emit(AppEventType.MANAGE_SHARE_MEMBER_UPDATE, null)
    onClose()
  }

  const onEditRole = async (shareType: "view" | "edit", hidePassword: boolean) => {
    const role = shareType === "edit" ? AccountRoleText.ADMIN : AccountRoleText.MEMBER

    if (role === currentRole && hidePassword === isHidePassword) {
      onReload()
      return
    }

    const res = await editShareCipher(cipher.organizationId ?? "", id, role, hidePassword, !!group)
    if (res.kind === "ok" || res.kind === "unauthorized") {
      onReload()
    }
  }

  const onRemove = async () => {
    if (group) {
      // @ts-ignore
      const res = await stopShareCipherForGroup(cipher, group.id)
      if (res.kind === "ok" || res.kind === "unauthorized") {
        onReload()
      }
    }
    if (member) {
      // @ts-ignore
      const res = await stopShareCipher(cipher, member.id)
      if (res.kind === "ok" || res.kind === "unauthorized") {
        onReload()
      }
    }
  }

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />

      <BottomModalContainer>
        <View style={styles.header}>
          {member && <SharedMember item={member} />}
          {group && <SharedGroup item={group} />}
        </View>

        <PressableScale onPress={() => onEditRole("view", isHidePassword)}>
          <View style={themed([$item, !isEditable && $select])}>
            <View style={styles.row}>
              <Icon icon={"eye"} containerStyle={styles.icon} />

              <View style={styles.text}>
                <View style={styles.row}>
                  <View style={styles.text}>
                    <Text preset="bold" tx={"shares:share_folder.viewer"} />
                    <Text preset="label" tx={"shares:share_folder.viewer_per"} />
                  </View>
                </View>
              </View>
            </View>

            {showHidePasswordOption && (
              <View style={[styles.row, styles.hidePassword]}>
                <View style={styles.text}>
                  <Text weight="medium" tx={"shares:share_folder.fill_only"} />
                  <Text preset="label" size="xs" tx={"shares:share_folder.fill_only_per"} />
                </View>

                <Switch
                  value={isHidePassword}
                  onValueChange={(value) => onEditRole("view", value)}
                />
              </View>
            )}
          </View>
        </PressableScale>
        <PressableScale onPress={() => onEditRole("edit", false)}>
          <View style={themed([$item, isEditable && $select])}>
            <View style={styles.row}>
              <Icon icon={"edit"} containerStyle={styles.icon} />
              <View>
                <Text preset="bold" tx={"shares:share_folder.editor"} />
                <Text preset="label" tx={"shares:share_folder.editor_per"} />
              </View>
            </View>
          </View>
        </PressableScale>

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

const $select: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.primary,
})

const $item: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.border,
  borderRadius: 12,
  borderWidth: 1,
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
  hidePassword: {
    marginLeft: 36,
    marginTop: 4,
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
  text: {
    flexGrow: 1,
    flexShrink: 1,
  },
  title: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
})
