import { FC } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

import {
  BottomModalContainer,
  Icon,
  Text,
  ModalBackdrop,
  PressableScale,
  Checkbox,
} from "app/components/cores"
import { ShareScreenProps } from "app/navigators"
import { debounce } from "app/utils/utils"

import { AccountRoleText } from "@/static/types"
import { ThemedStyle } from "@/theme"
import { AppEventType, EventBus } from "@/utils/eventBus"
import { useAppTheme } from "@/utils/useAppTheme"

export const EditShareMemberPermissionModalScreen: FC<
  ShareScreenProps<"editShareMemberPermissionModal">
> = ({
  navigation,
  route: {
    params: { id, value, role, hidePasswords, isHaveLoginItem },
  },
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const onClose = debounce(navigation.goBack, 400)

  const isEditable = role === "admin"

  const onEditRole = async (shareType: "only_fill" | "edit", hidePasswords: boolean) => {
    const role = shareType === "only_fill" ? AccountRoleText.MEMBER : AccountRoleText.ADMIN

    EventBus.emit(AppEventType.MANAGE_SHARE_MEMBER_UPDATE, {
      id,
      role,
      hidePasswords,
    })
    onClose()
  }

  return (
    <View style={styles.flex}>
      <ModalBackdrop onPress={onClose} />

      <BottomModalContainer>
        <Text weight="medium" text={value} style={styles.header} />

        <PressableScale onPress={() => onEditRole("only_fill", hidePasswords)}>
          <View style={themed($item)}>
            <View style={styles.row}>
              <Icon icon={"eye"} containerStyle={styles.icon} />

              <View>
                <View style={styles.row}>
                  <View>
                    <Text preset="bold" tx={"shares:share_folder.viewer"} />
                    <Text preset="label" tx={"shares:share_folder.viewer_per"} />
                  </View>

                  {!isEditable && <Icon icon="check-bold" size={24} color={colors.primary} />}
                </View>

                {isHaveLoginItem && (
                  <View style={styles.row}>
                    <View>
                      <Text preset="bold" tx={"shares:share_folder.viewer"} />
                      <Text preset="label" tx={"shares:share_folder.viewer_per"} />
                    </View>

                    <Checkbox
                      value={hidePasswords}
                      onValueChange={(value) => onEditRole("only_fill", value)}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </PressableScale>
        <PressableScale onPress={() => onEditRole("edit", false)}>
          <View style={themed($item)}>
            <View style={styles.row}>
              <Icon icon={"edit"} containerStyle={styles.icon} />
              <View>
                <Text preset="bold" tx={"shares:share_folder.editor"} />
                <Text preset="label" tx={"shares:share_folder.editor_per"} />
              </View>
            </View>

            {isEditable && <Icon icon="check-bold" size={24} color={colors.primary} />}
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
