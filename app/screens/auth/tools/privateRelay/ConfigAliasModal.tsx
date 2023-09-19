import React, { useState } from "react"
import { TouchableOpacity, View } from "react-native"
import { RelayAddress } from "app/static/types"
import { BottomModal, Text, Toggle } from 'app/components-v2/cores'
import { useStores } from "app/models"
import { translate } from "app/i18n"

interface Props {
  isOpen?: boolean
  onClose?: () => void
  item: RelayAddress
}


export const ConfigAliasModal = (props: Props) => {
  const { isOpen, onClose, item } = props
  const { toolStore } = useStores()
  // --------------- PARAMS ----------------

  const enum ALIAS_CONFIG {
    ENABLE = 1,
    BLOCK = 2,
    BLOCK_SPAM = 3,
  }
  const enabled = item.enabled ? ALIAS_CONFIG.ENABLE : ALIAS_CONFIG.BLOCK
  const [config, setConfig] = useState(item.block_spam ? ALIAS_CONFIG.BLOCK_SPAM : enabled)

  const configurations = [
    {
      value: config === ALIAS_CONFIG.ENABLE,
      onChange: () => {
        setConfig(ALIAS_CONFIG.ENABLE)
        handleEdit(ALIAS_CONFIG.ENABLE)
      },
      title: translate('private_relay.config_modal.enable')
    },
    {
      value: config === ALIAS_CONFIG.BLOCK,
      onChange: () => {
        setConfig(ALIAS_CONFIG.BLOCK)
        handleEdit(ALIAS_CONFIG.BLOCK)
      },
      title: translate('private_relay.config_modal.block')
    },
    {
      value: config === ALIAS_CONFIG.BLOCK_SPAM,
      onChange: () => {
        setConfig(ALIAS_CONFIG.BLOCK_SPAM)
        handleEdit(ALIAS_CONFIG.BLOCK_SPAM)
      },
      title: translate('private_relay.config_modal.block_spam')
    }
  ]

  // --------------- COMPUTED ----------------

  // --------------- METHODS ----------------

  const handleEdit = async (val: ALIAS_CONFIG) => {
    const enabled = val !== ALIAS_CONFIG.BLOCK
    const blockSpam = val === ALIAS_CONFIG.BLOCK_SPAM
    const res = await toolStore.configRelayAddress(item.id, item.address, enabled, blockSpam)
    if (res.kind === 'ok') {
      // onClose()
    }
  }

  // --------------- EFFECT ----------------'

  // --------------- RENDER ----------------

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('private_relay.config_modal.title')}
    >
      <View>
        <Text
          text={item.full_address}
          style={{ marginBottom: 12 }}
        />
        {
          configurations.map((item, index) => (<View
            key={index}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 12
              }}
              onPress={item.onChange}
            >
              <>
                <Toggle
                  value={item.value}
                  onValueChange={item.onChange}
                />
                <Text text={item.title} style={{ maxWidth: "85%", marginLeft: 12 }} />
              </>
            </TouchableOpacity>
          </View>
          ))
        }
      </View>
      <Text
        preset="label"
        size="base"
        style={{ marginTop: 12 }}
        text={translate('private_relay.config_modal.note')}
      />
    </BottomModal>
  )
}
