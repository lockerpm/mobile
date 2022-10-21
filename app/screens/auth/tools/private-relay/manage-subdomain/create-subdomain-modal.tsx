import React, {  useState } from 'react'
import { TextInput, View } from 'react-native'
import { Button, Modal, Text } from '../../../../../components'
import { useMixins } from '../../../../../services/mixins'
import { fontSize } from '../../../../../theme'
import { useStores } from '../../../../../models'
import { SubdomainData } from '../../../../../config/types/api'

interface Props {
  isOpen: boolean
  onClose: () => void
  setSubdomain: (payload: SubdomainData) => void
}

export const CreateSubdomainModal = (props: Props) => {
  const { isOpen, onClose } = props
  const { translate, color, notifyApiError } = useMixins()
  const { toolStore} = useStores()

  const [subdomain, setSubdomain] = useState("")

  const handleCreateSubdomain = async () => {
    const res = await toolStore.createSubdomain(subdomain) 
    if (res.kind === 'ok') {
      const data :SubdomainData = {
        ...res.data,
        num_alias: 0,
        num_forwarded: 0,
        num_spam: 0,
        created_time: Date.now()
      }
      props.setSubdomain(data)
      onClose()
    } else {
      notifyApiError(res)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('private_relay.manage_subdomain.new')}
    >
      <View>
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
            value={subdomain}
            onChangeText={(text: string) => {
              setSubdomain(text.toLowerCase())
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
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Button
            preset='outlinePlain'
            style={{ marginTop: 16, marginRight: 16 }}
            text={translate('common.cancel')}
            onPress={onClose}
          />
          <Button
            isDisabled={!subdomain}
            style={{ marginTop: 16 }}
            text={translate('common.confirm')}
            onPress={handleCreateSubdomain}
          />
        </View>

      </View>
    </Modal>
  )
}