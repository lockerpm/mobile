import React from "react"
import { BottomModal, Icon, Text } from "app/components/cores"
import { useStores } from "app/models"
import { useCipherData, useHelper } from "app/services/hook"
import { AccountRoleText, SharedGroupType, SharedMemberType } from "app/static/types"
import { CipherView } from "core/models/view"
import { TouchableOpacity, View } from "react-native"
import { useTheme } from "app/services/context"

interface Props {
  isOpen?: boolean
  onClose?: () => void
  member: SharedMemberType
  group?: SharedGroupType
}

export const EditShareModal = (props: Props) => {
  const { isOpen, onClose, member, group } = props
  const { translate } = useHelper()
  const { cipherStore } = useStores()
  const { editShareCipher } = useCipherData()
  const { colors } = useTheme()

  const selectedCipher: CipherView = cipherStore.cipherView

  // --------------- PARAMS ----------------
  const isEditable = member?.role === "admin" || group?.role === "admin"

  // --------------- METHODS ----------------

  const handleEditShare = async (shareType: "only_fill" | "edit") => {
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
      selectedCipher.organizationId,
      member?.id || group?.id,
      role,
      autofillOnly,
      !!group,
    )

    if (res.kind === "ok" || res.kind === "unauthorized") {
      onClose()
    }
  }

  // --------------- EFFECT ----------------

  // --------------- RENDER ----------------

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={selectedCipher.name}>
      <Text
        preset="label"
        size="base"
        text={member ? translate("common.user") : translate("common.group")}
        style={{
          marginTop: 20,
          marginBottom: 10,
        }}
      />

      {!!member && <Text text={`${member?.full_name} (${member?.email})`} />}
      {!!group && <Text text={`${group?.name}`} />}

      <Text
        preset="label"
        size="base"
        text={translate("shares.share_type.label")}
        style={{
          marginTop: 20,
          marginBottom: 10,
        }}
      />

      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 16,
          borderRadius: 12,
          borderColor: colors.border,
          borderWidth: 1,
          paddingHorizontal: 8,
        }}
        onPress={() => {
          handleEditShare("only_fill")
        }}
      >
        <Icon icon="eye" size={24} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text text={translate("shares.share_folder.viewer")} />
          <Text preset="label" text={translate("shares.share_folder.viewer_per")} />
        </View>
        {!isEditable && <Icon icon="check" color={colors.primary} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 16,
          borderRadius: 12,
          borderColor: colors.border,
          borderWidth: 1,
          paddingHorizontal: 8,
          marginTop: 8,
        }}
        onPress={() => {
          handleEditShare("edit")
        }}
      >
        <Icon icon="edit" size={24} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text text={translate("shares.share_folder.editor")} />
          <Text preset="label" text={translate("shares.share_folder.editor_per")} />
        </View>
        {isEditable && <Icon icon="check" color={colors.primary} />}
      </TouchableOpacity>
    </BottomModal>
  )
}
