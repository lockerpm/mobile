import React, { useState } from "react"
import { TouchableOpacity, View } from "react-native"
import moment from "moment"
import { RelayAddress } from "app/static/types"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { Icon, Text } from "app/components/cores"
import { ActionItem, ActionSheet } from "app/components/ciphers"

interface Props {
  isFreeAccount: boolean
  item: RelayAddress
  isEdited: boolean
  deleteRelayAddress: (id: number) => void
  setShowEditModal: () => void
  setShowConfigModal: () => void
  navigateStatistic: () => void
}

export const AliasItem = (props: Props) => {
  const {
    isFreeAccount,
    item,
    isEdited,
    deleteRelayAddress,
    setShowConfigModal,
    setShowEditModal,
    navigateStatistic,
  } = props
  const { colors } = useTheme()
  const { copyToClipboard, translate } = useHelper()
  const { toolStore } = useStores()

  const [isOpen, setIsOpen] = useState(false)

  const handleRemove = async () => {
    const res = await toolStore.deleteRelayAddress(item.id)
    if (res.kind === "ok") {
      deleteRelayAddress(item.id)
    }
  }

  const handleActionSheetClose = (nextModal: string) => {
    setIsOpen(false)

    switch (nextModal) {
      case "copy":
        copyToClipboard(item.full_address)
        break
      case "edit":
        setShowEditModal()
        break
      case "config":
        setShowConfigModal()
        break
      case "remove":
        handleRemove()
        break
    }
  }

  return (
    <View style={{ marginVertical: 16, marginBottom: isEdited ? 16 : 0 }}>
      <TouchableOpacity
        onPress={() => {
          setIsOpen(true)
        }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          <View>
            <Text preset="bold" text={item.full_address} style={{ marginBottom: 4 }} />
            <Text text={moment.unix(item.created_time).format("DD/MM/YYYY")} />
          </View>

          <Icon icon="dots-three" size={24} />
        </View>
      </TouchableOpacity>
      <ActionSheet
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        header={
          <View style={{ width: "100%", paddingHorizontal: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View>
                <Text preset="bold" text={item.full_address} style={{ marginBottom: 4 }} />
                <Text text={moment.unix(item.created_time).format("DD/MM/YYYY")} />
              </View>
            </View>
          </View>
        }
      >
        <ActionItem
          name={translate("private_relay.copy")}
          icon="copy"
          action={() => {
            handleActionSheetClose("copy")
          }}
        />
        {isEdited && (
          <ActionItem
            name={translate("private_relay.edit")}
            icon="edit"
            action={() => {
              handleActionSheetClose("edit")
            }}
          />
        )}
        {!isFreeAccount && (
          <ActionItem
            name={translate("private_relay.statistic")}
            icon="file-text"
            action={() => {
              setIsOpen(false)
              navigateStatistic()
            }}
          />
        )}
        {!isFreeAccount && (
          <ActionItem
            name={translate("private_relay.config")}
            icon="gear"
            action={() => {
              handleActionSheetClose("config")
            }}
          />
        )}
        <ActionItem
          name={translate("common.delete")}
          icon="trash"
          color={colors.error}
          action={() => {
            handleActionSheetClose("remove")
          }}
        />
      </ActionSheet>
    </View>
  )
}
