import { View, StyleSheet, ViewStyle } from "react-native"

import { BottomModalContainer, PressableIcon, Text } from "app/components/cores"
import { NewActionSheetItem } from "app/components/utils"
import { useStores } from "app/models"
import { useClipboard, useToast } from "app/services/utils"
import { RelayAddress } from "app/static/types"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { debounce } from "app/utils/utils"

import { ThemedStyle } from "@/theme"
import { formatDate } from "@/utils/formatDate"
import { useAppTheme } from "@/utils/useAppTheme"

export enum RelayActionType {
  DEFAULT = "default",
  EDIT = "edit",
  EDIT_DESCRIPTION = "edit_description",
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
    themed,
    theme: { colors },
  } = useAppTheme()
  const { notifyApiError } = useToast()
  const { copyToClipboard } = useClipboard()

  const description = item.description?.trim()

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
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text preset="bold" size="lg" text={item.full_address} style={styles.mb4} />
          <Text
            preset="label"
            size="sm"
            text={formatDate(item.created_time * 1000, "dd/MM/yyyy")}
          />
        </View>
        <PressableIcon icon="x" onPress={onClose} />
      </View>

      {!!description && (
        <View style={themed($description)}>
          <Text size="sm" text={description} />
        </View>
      )}

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
      <NewActionSheetItem
        bottomBorder
        tx="private_relay:edit_description"
        icon="list-bullets"
        onPress={() => {
          setNextAction(RelayActionType.EDIT_DESCRIPTION)
        }}
      />
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

const $description: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.block,
  borderRadius: 12,
  marginBottom: 8,
  marginHorizontal: 16,
  padding: 12,
})

const styles = StyleSheet.create({
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
  },
  mb4: { marginBottom: 4 },
})
