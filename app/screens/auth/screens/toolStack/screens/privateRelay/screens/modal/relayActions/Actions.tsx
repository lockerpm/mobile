import React from "react"
import { View, StyleSheet } from "react-native"
import { Text } from "app/components/cores"
import moment from "moment"
import { RelayAddress } from "app/static/types"
import { ActionItem } from "app/components/ciphers"
import { useAppLocale, useTheme } from "app/services/context"
import { useStores } from "app/models"
import { debounce } from "app/utils/utils"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { useClipboard, useToast } from "app/services/utils"
import { BottomModalContainer } from "app/components/utils"

export enum RelayActionType {
  DEFAULT = "default",
  EDIT = "edit",
  CONFIG = "config",
}

interface Props {
  item: RelayAddress
  isEditable: boolean
  freeAccount: boolean
  setNextAction: (action: RelayActionType) => void
  navigateStatistic: () => void
  onClose: () => void
}

export const Actions = ({
  item,
  isEditable,
  freeAccount,
  setNextAction,
  navigateStatistic,
  onClose,
}: Props) => {
  const { toolStore } = useStores()
  const { colors } = useTheme()
  const { notifyApiError } = useToast()
  const { copyToClipboard } = useClipboard()
  const { translate } = useAppLocale()

  const handleRemove = async () => {
    onClose()
    const res = await toolStore.deleteRelayAddress(item.id)
    if (res.kind !== "ok") {
      notifyApiError(res)
    } else {
      EventBus.emit(AppEventType.PRIVATE_RELAY_DELETE, item.id)
    }
  }

  return (
    <BottomModalContainer>
      <View style={styles.headerContainer}>
        <View style={styles.row}>
          <View>
            <Text preset="bold" text={item.full_address} style={{ marginBottom: 4 }} />
            <Text text={moment.unix(item.created_time).format("DD/MM/YYYY")} />
          </View>
        </View>
      </View>

      <ActionItem
        bottomDivider
        name={translate("private_relay.copy")}
        icon="copy"
        action={() => {
          copyToClipboard(item.full_address)
        }}
      />
      {isEditable && (
        <ActionItem
          bottomDivider
          name={translate("private_relay.edit")}
          icon="edit"
          action={() => {
            setNextAction(RelayActionType.EDIT)
          }}
        />
      )}
      {!freeAccount && (
        <>
          <ActionItem
            bottomDivider
            name={translate("private_relay.statistic")}
            icon="file-text"
            action={navigateStatistic}
          />
          <ActionItem
            bottomDivider
            name={translate("private_relay.config")}
            icon="gear"
            action={() => {
              setNextAction(RelayActionType.CONFIG)
            }}
          />
        </>
      )}

      <ActionItem
        bottomDivider
        name={translate("common.delete")}
        icon="trash"
        color={colors.error}
        action={debounce(handleRemove, 300)}
      />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    width: "100%",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
