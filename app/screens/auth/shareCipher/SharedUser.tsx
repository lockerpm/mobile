// @ts-nocheck
import React, { useState } from "react"
import { View, Image, TouchableOpacity } from "react-native"
import { AccountRoleText, SharedGroupType, SharedMemberType, SharingStatus } from "app/static/types"
import { useTheme } from "app/services/context"
import { Icon, Text } from "app/components/cores"
import { ActionSheet } from "app/components/ciphers"
import { useCipherData, useHelper } from "app/services/hook"

interface Props {
  reload: boolean
  setReload: (val: boolean) => void
  item?: (SharedMemberType | SharedGroupType) & { type: string }
  organizationId: string
  onRemove: (id: string, isGroup?: boolean) => void
}

const SHARE_GROUP = require("assets/images/icons/group.png")

export const SharedUsers = (props: Props) => {
  const { item, organizationId, reload, setReload, onRemove } = props
  const { translate } = useHelper()
  const { colors } = useTheme()
  const { editShareCipher } = useCipherData()

  const isEditable = item.role === "admin"

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
      organizationId,
      item.id,
      role,
      autofillOnly,
      item.type === "group",
    )
    if (res.kind === "ok" || res.kind === "unauthorized") {
      setShowSheetModal(false)
      setReload(!reload)
    }
  }

  // ----------------------- PARAMS -----------------------
  const [showSheetModal, setShowSheetModal] = useState<boolean>(false)

  // ----------------------- RENDER -----------------------
  return (
    <View
      style={{
        borderBottomColor: colors.block,
        borderBottomWidth: 1,
        width: "100%",
        flexDirection: "row",
        marginBottom: 15,
        paddingVertical: 14,
        justifyContent: "flex-start",
      }}
    >
      <Image
        // @ts-ignore
        source={item.avatar ? { uri: item.avatar } : SHARE_GROUP}
        style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
      />

      <TouchableOpacity
        style={{ flex: 1, justifyContent: "center" }}
        onPress={() => setShowSheetModal(true)}
      >
        <Text
          // @ts-ignore
          text={item.email || item.name}
        />
        <View style={{ flexDirection: "row" }}>
          <Text
            preset="label"
            text={
              !isEditable
                ? translate("shares.share_type.view")
                : translate("shares.share_type.edit")
            }
          />
          {/* Sharing status */}
          {item.status && (
            <View
              style={{
                alignSelf: "center",
                marginLeft: 10,
                paddingHorizontal: 10,
                paddingVertical: 2,
                backgroundColor:
                  item.status === SharingStatus.INVITED
                    ? colors.warning
                    : item.status === SharingStatus.ACCEPTED
                    ? colors.secondaryText
                    : colors.primary,
                borderRadius: 3,
              }}
            >
              <Text
                preset="bold"
                text={item.status.toUpperCase()}
                size="base"
                style={{
                  color: colors.background,
                }}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <ActionSheet
        isOpen={showSheetModal}
        onClose={() => setShowSheetModal(false)}
        header={
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              <Image
                source={item.avatar ? { uri: item.avatar } : SHARE_GROUP}
                style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
              />
              <View style={{ justifyContent: "center", height: 40, marginLeft: 16 }}>
                {item.full_name && <Text text={item.full_name} />}
                <Text preset={item.name ? "default" : "label"}>{item.email || item.name}</Text>
              </View>
            </View>
          </View>
        }
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
          }}
          onPress={() => {
            onEditRole("only_fill")
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
            padding: 16,
          }}
          onPress={() => {
            onEditRole("edit")
          }}
        >
          <Icon icon="edit" size={24} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text text={translate("shares.share_folder.editor")} />
            <Text preset="label" text={translate("shares.share_folder.editor_per")} />
          </View>
          {isEditable && <Icon icon="check" color={colors.primary} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            padding: 16,
          }}
          onPress={() => {
            onRemove(item.id, item.type === "group")
            setShowSheetModal(false)
          }}
        >
          <Icon icon="user-minus" size={24} color={colors.error} />
          <Text text={translate("common.remove")} style={{ color: colors.error, marginLeft: 12 }} />
        </TouchableOpacity>
      </ActionSheet>
    </View>
  )
}
