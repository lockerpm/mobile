import React, { useState } from 'react'
import { TextInput, View } from 'react-native'
import { BottomModal, Button, Text } from 'app/components/cores'
import { useStores } from 'app/models'
import { useTheme } from 'app/services/context'
import { useHelper } from 'app/services/hook'
import { SubdomainData } from 'app/static/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  setSubdomain: (payload: SubdomainData) => void
}

export const CreateSubdomainModal = (props: Props) => {
  const { isOpen, onClose } = props
  const { colors } = useTheme()
  const { notifyApiError, translate } = useHelper()
  const { toolStore } = useStores()

  const [isLoading, setIsLoading] = useState(false)
  const [subdomain, setSubdomain] = useState('')

  const handleCreateSubdomain = async () => {
    setIsLoading(true)
    const res = await toolStore.createSubdomain(subdomain)
    if (res.kind === 'ok') {
      const data: SubdomainData = {
        ...res.data,
        num_alias: 0,
        num_forwarded: 0,
        num_spam: 0,
        created_time: Date.now(),
      }
      props.setSubdomain(data)
      onClose()
    } else {
      notifyApiError(res)
    }
    setIsLoading(false)
  }

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('private_relay.manage_subdomain.new')}
    >
      <View>
        <View
          style={{
            borderWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 44,
            marginTop: 16,
            borderColor: colors.primary,
            borderRadius: 8,
            paddingRight: 12,
            paddingLeft: 12,
          }}
        >
          <TextInput
            value={subdomain}
            onChangeText={(text: string) => {
              setSubdomain(text.toLowerCase())
            }}
            placeholder={'... '}
            placeholderTextColor={colors.secondaryText}
            selectionColor={colors.primary}
            style={{
              flex: 5,
              color: colors.title,
              fontSize: 16,
            }}
          />
          <Text
            text={'.maily.org'}
            style={{
              marginLeft: 2,
              right: 0,
            }}
          />
        </View>

        <Button
          loading={isLoading}
          disabled={!subdomain}
          style={{ marginTop: 16 }}
          text={isLoading ? '' : translate('common.confirm')}
          onPress={handleCreateSubdomain}
        />
      </View>
    </BottomModal>
  )
}
