import { View, StyleSheet } from "react-native"
import { RelayAddress } from "app/static/types"
import {
  Icon,
  PressableScale,
  Text,
  BottomModalContainer,
  BottomModalHeader,
} from "app/components/cores"
import { useStores } from "app/models"
import { AnalyticEvents, logFirebaseEvent } from "app/utils/analytics"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { useToast } from "app/services/utils"
import { TxKeyPath } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

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
  const {
    theme: { colors },
  } = useAppTheme()

  // --------------- PARAMS ----------------

  const enabled = item.enabled ? ALIAS_CONFIG.ENABLE : ALIAS_CONFIG.BLOCK
  const config = item.block_spam ? ALIAS_CONFIG.BLOCK_SPAM : enabled

  const configurations: { value: ALIAS_CONFIG; title: TxKeyPath }[] = [
    {
      value: ALIAS_CONFIG.ENABLE,
      title: "private_relay:config_modal.enable",
    },
    {
      value: ALIAS_CONFIG.BLOCK,
      title: "private_relay:config_modal.block",
    },
    {
      value: ALIAS_CONFIG.BLOCK_SPAM,
      title: "private_relay:config_modal.block_spam",
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
      EventBus.emit(AppEventType.PRIVATE_RELAY_UPDATE, {
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
    <BottomModalContainer>
      <BottomModalHeader text={item.full_address} onClose={onClose} />

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
            <Text tx={item.title} style={styles.title} />
            {config === item.value && (
              <Icon icon="check-bold" size={24} color={colors.primary} style={styles.check} />
            )}
          </View>
        </PressableScale>
      ))}
      <Text preset="label" size="sm" style={styles.label} tx={"private_relay:config_modal.note"} />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  check: {
    marginLeft: "auto",
  },
  item: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    height: 72,
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  label: { marginHorizontal: 16, marginTop: 12, textAlign: "center" },
  title: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
