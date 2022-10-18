import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Animated, TextInput, TouchableOpacity, View } from 'react-native'
import { Button, Modal, Text } from '../../../../../components'
import { useMixins } from '../../../../../services/mixins'
import { fontSize } from '../../../../../theme'

interface Props {
  isOpen: boolean
  onClose: () => void
  subdomain: string
}

export const EditSubdomainModal = (props: Props) => {
  const { isOpen, onClose, subdomain } = props
  const { translate, color } = useMixins()

  const [domain, setDomain] = useState("")

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={"Edit subdomain"}
    >
      <View>
        <Text preset='bold' text={subdomain}  style={{ marginTop: 32}} />

        <Text text={"New Subdomain"} style={{ marginTop: 16 }} />
        <View style={{
          borderWidth: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 44,
          marginTop: 16,
          borderColor: color.line,
          borderRadius: 8,
          paddingRight: 12,
          paddingLeft: 12,
        }}>
          <TextInput
            value={domain}
            onChangeText={(text: string) => {
              setDomain(text)
            }}
            placeholder={"... "}
            placeholderTextColor={color.text}
            selectionColor={color.primary}
            style={{
              flex: 5,
              color: color.textBlack,
              fontSize: fontSize.p,
            }}
          />
          <Text text={".maily.org"} style={{
            marginLeft: 2,
            right: 0
          }} />
        </View>

        <Text
          style={{ marginTop: 16 }}
          text='*Current sub-domain will be permanently deleted when you change to a new sub-domain. All email aliases created from your current sub-domain will also be then deleted when you perform this action'
        />
        <Button
          style={{ marginTop: 16 }}
          text='Confirm'
          onPress={() => null}
        />
        <Button
          preset='outlinePlain'
          style={{ marginTop: 16 }}
          text='Cancel'
          onPress={onClose}
        />
      </View>
    </Modal>
  )
}