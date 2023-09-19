import React, { useEffect, useState } from 'react'
import { View, TextInput } from 'react-native'
import { BottomModal, Text, Button } from 'app/components-v2/cores'
import { SubdomainData } from 'app/static/types'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { translate } from 'app/i18n'

interface Props {
  isOpen: boolean
  onClose: () => void
  subdomain: SubdomainData
  setSubdomain: (subdomain: SubdomainData) => void
}

export const EditSubdomainModal = (props: Props) => {
  const { isOpen, onClose, subdomain, setSubdomain } = props
  const { colors } = useTheme()
  const { toolStore } = useStores()

  const [isLoading, setIsLoading] = useState(false)
  const [domain, setDomain] = useState('')
  const [updateError, setUpdateError] = useState('')

  const handleUpdateSubdomain = async () => {
    setIsLoading(true)
    const res = await toolStore.editSubdomain(subdomain.id, domain.trim())
    setIsLoading(false)
    if (res.kind === 'ok') {
      setSubdomain({
        ...subdomain,
        subdomain: domain,
      })
      onClose()
    } else if (res.kind === 'bad-data') {
      const errorData: {
        details?: {
          [key: string]: string[]
        }
        code: string
        message?: string
      } = res.data
      let errorMessage = ''
      if (errorData.details) {
        for (const key of Object.keys(errorData.details)) {
          if (errorData.details[key][0]) {
            if (!errorMessage) {
              errorMessage = errorData.details[key][0]
            }
          }
        }
      }
      setUpdateError(errorMessage)
    }
  }

  useEffect(() => {
    setUpdateError('')
    setDomain('')
  }, [isOpen])

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('private_relay.manage_subdomain.edit_btn')}
    >
      <View>
        <Text preset="bold" text={`@${subdomain.subdomain}.maily.org`} style={{ marginTop: 12 }} />

        <Text text={translate('private_relay.manage_subdomain.new')} style={{ marginTop: 16 }} />
        <View
          style={{
            borderWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 44,
            marginTop: 12,
            borderColor: colors.primary,
            borderRadius: 8,
            paddingRight: 12,
            paddingLeft: 12,
          }}
        >
          <TextInput
            value={domain}
            onChangeText={(text: string) => {
              setDomain(text.toLowerCase())
              if (updateError !== '') setUpdateError('')
            }}
            placeholder={'... '}
            placeholderTextColor={colors.secondaryText}
            selectionColor={colors.primary}
            autoFocus
            style={{
              flex: 5,
              color: colors.title,
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

        {!!updateError && (
          <Text
            numberOfLines={2}
            size="base"
            text={updateError}
            style={{ color: colors.error, marginVertical: 8 }}
          />
        )}

        <Text
          preset="label"
          style={{ marginTop: 16 }}
          text={translate('private_relay.manage_subdomain.edit_note')}
        />
        <Button
          loading={isLoading}
          disabled={!domain}
          style={{ marginTop: 16 }}
          text={isLoading ? '' : translate('common.confirm')}
          onPress={handleUpdateSubdomain}
        />
      </View>
    </BottomModal>
  )
}
