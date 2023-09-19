import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../services/mixins"
import {  Divider, Modal, Text } from "../../../../components"
import { fontSize } from "../../../../theme"
import { TouchableOpacity, View } from "react-native"
import { RelayAddress } from '../../../../config/types/api'
import { useStores } from "../../../../models"
import CheckBox from "@react-native-community/checkbox"


interface Props {
  isOpen?: boolean
  onClose?: () => void
  item: RelayAddress
}


export const ConfigAliasModal = observer((props: Props) => {
  const { isOpen, onClose, item } = props
  const { color, translate } = useMixins()
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('private_relay.config_modal.title')}
    >
      <View>
        <Text
          preset="black"
          text={item.full_address}
          style={{ marginBottom: 12 }}
        />
        <Divider />
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
                <CheckBox
                  tintColors={{ true: "black", false: color.text }}
                  onFillColor={color.background}
                  tintColor={color.text}
                  onTintColor={color.text}
                  animationDuration={0.3}
                  onCheckColor={color.primary}
                  disabled={false}
                  style={{ marginRight: 16 }}
                  value={item.value}
                  onValueChange={item.onChange}
                />
                <Text preset="black" text={item.title} style={{maxWidth: "85%"}}/>
              </>
            </TouchableOpacity>
            <Divider />
          </View>
          ))
        }
      </View>
      <Text
        style={{ fontSize: fontSize.small, marginTop: 12 }}
        text={translate('private_relay.config_modal.note')}
      />
    </Modal>
  )
})
