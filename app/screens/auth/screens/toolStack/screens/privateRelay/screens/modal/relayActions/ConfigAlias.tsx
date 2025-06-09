import React from "react"
import { View, StyleSheet } from "react-native"
import { RelayAddress } from "app/static/types"
import { Icon, PressableScale, Text, BottomModalContainer } from "app/components/cores"
import { useStores } from "app/models"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { useAppLocale, useTheme } from "app/services/context"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { useToast } from "app/services/utils"

interface Props {
  onClose: () => void
  item: RelayAddress
}

const enum ALIAS_CONFIG {
  ENABLE = 1,
  BLOCK = 2,
  BLOCK_SPAM = 3,
}

export const ConfigAlias = ({ onClose, item }: Props) => {
  const { toolStore, user } = useStores()
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()
  const { colors } = useTheme()

  // --------------- PARAMS ----------------

  const enabled = item.enabled ? ALIAS_CONFIG.ENABLE : ALIAS_CONFIG.BLOCK
  const config = item.block_spam ? ALIAS_CONFIG.BLOCK_SPAM : enabled

  const configurations = [
    {
      value: ALIAS_CONFIG.ENABLE,
      title: translate("private_relay.config_modal.enable"),
    },
    {
      value: ALIAS_CONFIG.BLOCK,
      title: translate("private_relay.config_modal.block"),
    },
    {
      value: ALIAS_CONFIG.BLOCK_SPAM,
      title: translate("private_relay.config_modal.block_spam"),
    },
  ]

  // --------------- COMPUTED ----------------

  // --------------- METHODS ----------------

  const handleEdit = async (val: ALIAS_CONFIG) => {
    const enabled = val !== ALIAS_CONFIG.BLOCK
    const blockSpam = val === ALIAS_CONFIG.BLOCK_SPAM
    onClose()
    const res = await toolStore.configRelayAddress(item.id, item.address, enabled, blockSpam)
    if (res.kind === "ok") {
      logFirebaseEvent(AnalyticEvents.BLOCK_PRIVATE_EMAIL, user.email)
      EventBus.emit(AppEventType.PRIVATE_RELAY_DELETE, {
        ...item,
        enabled,
        block_spam: blockSpam,
      })
    } else {
      notifyApiError(res)
    }
  }

  // --------------- EFFECT ----------------'

  // --------------- RENDER ----------------

  return (
    <BottomModalContainer style={styles.container}>
      <View style={styles.header}>
        <Text
          preset="bold"
          text={item.full_address}
          numberOfLines={1}
          size="large"
          style={styles.title}
        />
        <Icon icon="x" onPress={onClose} />
      </View>
      {configurations.map((item, index) => (
        <PressableScale key={index} onPress={() => handleEdit(item.value)}>
          <View
            style={[
              styles.item,
              {
                borderColor: config === item.value ? colors.primary : colors.border,
              },
            ]}
          >
            <Text text={item.title} style={{ marginRight: 12, flexGrow: 1, flexShrink: 1 }} />
            {config === item.value && (
              <Icon
                icon="check-bold"
                size={24}
                color={colors.primary}
                style={{ marginLeft: "auto" }}
              />
            )}
          </View>
        </PressableScale>
      ))}
      <Text
        preset="label"
        size="base"
        style={styles.label}
        text={translate("private_relay.config_modal.note")}
      />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 45,
    justifyContent: "space-between",
  },
  item: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    height: 72,
    justifyContent: "space-between",
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  label: { marginTop: 12, textAlign: "center" },
  title: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
