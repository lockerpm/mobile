/* eslint-disable react-native/no-inline-styles */
import { View, StyleSheet } from "react-native"
import { BottomModalContainer, Text } from "app/components/cores"
import moment from "moment"
import { RelayAddress } from "app/static/types"
import { useStores } from "app/models"
import { debounce } from "app/utils/utils"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { useClipboard, useToast } from "app/services/utils"
import { NewActionSheetItem } from "app/components/utils"
import { useAppTheme } from "@/utils/useAppTheme"

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
  const {
    theme: { colors },
  } = useAppTheme()
  const { notifyApiError } = useToast()
  const { copyToClipboard } = useClipboard()

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

      <NewActionSheetItem
        bottomBorder
        tx="private_relay:copy"
        icon="copy"
        onPress={() => {
          onClose()
          copyToClipboard(item.full_address)
        }}
      />
      {isEditable && (
        <NewActionSheetItem
          bottomBorder
          tx="private_relay:edit"
          icon="edit"
          onPress={() => {
            setNextAction(RelayActionType.EDIT)
          }}
        />
      )}
      {!freeAccount && (
        <>
          <NewActionSheetItem
            bottomBorder
            tx="private_relay:statistic"
            icon="file-text"
            onPress={navigateStatistic}
          />
          <NewActionSheetItem
            bottomBorder
            tx="private_relay:config"
            icon="gear"
            onPress={() => {
              setNextAction(RelayActionType.CONFIG)
            }}
          />
        </>
      )}

      <NewActionSheetItem
        bottomBorder
        tx="common:delete"
        icon="trash"
        color={colors.error}
        iconColor={colors.error}
        onPress={debounce(handleRemove, 300)}
      />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    width: "100%",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
