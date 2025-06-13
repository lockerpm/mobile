import { useAppLocale, useTheme } from "app/services/context"
import { useCipherData } from "app/services/hook"
import { AccountRoleText, SharedGroupType, SharedMemberType, SharingStatus } from "app/static/types"
import { CollectionView } from "core/models/view/collectionView"
import React, { useState } from "react"
import { View, Image, TouchableOpacity } from "react-native"
import { Text, Icon } from "app/components/cores"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"

interface Props {
  reload: boolean
  setReload: (val: boolean) => void
  setShowConfirmModal: (val: any) => void
  item?: (SharedMemberType | SharedGroupType) & { type: string }
  collection: CollectionView
  onRemove: (collection: CollectionView, id: string, isGroup?: boolean) => void
}

const GROUP = require("assets/images/icons/group.png")

export const SharedUsers = (props: Props) => {
  const { item, collection, reload, setReload, onRemove, setShowConfirmModal } = props

  const { colors } = useTheme()
  const { translate } = useAppLocale()
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
      collection.organizationId,
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
        marginBottom: 15,
      }}
    >
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          paddingVertical: 14,
          justifyContent: "flex-start",
        }}
      >
        <Image
          resizeMode="contain"
          source={item.avatar ? { uri: item.avatar } : GROUP}
          style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
        />

        <TouchableOpacity
          disabled={item.status === SharingStatus.ACCEPTED}
          style={{ flex: 1, justifyContent: "center" }}
          onPress={() => setShowSheetModal(true)}
        >
          <Text text={item.email || item.name} />
          <View style={{ flexDirection: "row" }}>
            <Text
              preset="default"
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
                      ? colors.title
                      : colors.primary,
                  borderRadius: 3,
                }}
              >
                <Text
                  size="small"
                  text={
                    item.status === SharingStatus.ACCEPTED
                      ? translate("shares.wait_confirm")
                      : // @ts-ignore
                        translate(`shares.status.${item.status.toLowerCase()}`)
                  }
                  style={{
                    fontWeight: "bold",
                    color: colors.background,
                  }}
                />
              </View>
            )}
          </View>
        </TouchableOpacity>

        <NewActionSheet
          isOpen={showSheetModal}
          onClose={() => setShowSheetModal(false)}
          header={
            <View style={{ paddingHorizontal: 20 }}>
              <View style={{ flexDirection: "row", marginBottom: 16 }}>
                <Image
                  resizeMode="contain"
                  source={item.avatar ? { uri: item.avatar } : GROUP}
                  style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
                />

                <View style={{ justifyContent: "center", height: 40, marginLeft: 16 }}>
                  {item.full_name && <Text>{item.full_name}</Text>}
                  <Text preset={item.name ? "default" : "label"}>{item.email || item.name}</Text>
                </View>
              </View>
            </View>
          }
        >
          <NewActionSheetItem
            // containerStyle={{ backgroundColor: !isEditable && colors.block }}
            onPress={() => {
              onEditRole("only_fill")
            }}
            icon="eye"
            // disabled={!isEditable}
            tx="shares.share_folder.viewer"
          />

          <NewActionSheetItem
            // containerStyle={{ backgroundColor: isEditable && colors.block }}
            onPress={() => {
              onEditRole("edit")
            }}
            icon="edit"
            // disabled={isEditable}
            tx="shares.share_folder.editor"
          />

          <NewActionSheetItem
            onPress={() => {
              onRemove(collection, item.id, item.type === "group")
              setShowSheetModal(false)
            }}
            icon="user-minus"
            color={colors.error}
            tx="shares.share_folder.remove"
          />
        </NewActionSheet>
      </View>
      {item?.status === SharingStatus.ACCEPTED && (
        <View
          style={{
            flexDirection: "row",
            marginVertical: 8,
          }}
        >
          <Text
            text={translate("shares.confirm")}
            style={{
              flex: 2,
              fontSize: 14,
            }}
          />
          <View>
            <TouchableOpacity
              onPress={() => {
                setShowConfirmModal(item)
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 8,
                borderColor: colors.primary,
                borderWidth: 1,
                padding: 8,
                paddingHorizontal: 16,
              }}
            >
              <Icon icon="check" color={colors.primary} size={24} />
              <Text
                text={translate("common.confirm")}
                style={{
                  marginLeft: 8,
                  color: colors.primary,
                  fontSize: 14,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}
