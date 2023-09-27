import React, { useEffect, useState } from 'react'
import { TextInput, View } from 'react-native'
import { useStores } from 'app/models'
import { useTheme } from 'app/services/context'
import { RelayAddress } from 'app/static/types'
import { BottomModal, Text, Button } from 'app/components/cores'
import { translate } from 'app/i18n'
import Animated, { FadeInDown } from 'react-native-reanimated'

interface Props {
  isOpen?: boolean
  onClose?: () => void
  item: RelayAddress
  onEdit: () => void
}

export const EditAliasModal = (props: Props) => {
  const { isOpen, onClose, item, onEdit } = props
  const { colors } = useTheme()
  const { toolStore } = useStores()
  // --------------- PARAMS ----------------

  const [isLoading, setIsLoading] = useState(false)
  const [newAddress, setNewAddress] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [isConfirm, setIsConfirm] = useState(false)

  // --------------- METHODS ----------------

  const handleEdit = async () => {
    setIsLoading(true)
    const res = await toolStore.updateRelayAddress(item.id, newAddress.toLowerCase())
    if (res.kind === 'ok') {
      onClose()
      onEdit()
    } else {
      if (res.kind === 'bad-data') {
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
        setIsConfirm(false)
      }
    }

    setIsLoading(false)
  }

  // --------------- EFFECT ----------------'

  useEffect(() => {
    setUpdateError('')
    setNewAddress('')
    setIsConfirm(false)
  }, [isOpen])

  // --------------- RENDER ----------------

  const renderEdit = () => (
    <Animated.View entering={FadeInDown}>
      <View>
        <Text
          preset="label"
          size="base"
          text={translate('private_relay.edit_modal.current')}
          style={{
            marginTop: 10,
            marginBottom: 4,
          }}
        />

        <Text text={item.full_address} />

        <Text
          preset="label"
          size="base"
          text={translate('private_relay.edit_modal.new')}
          style={{
            marginTop: 24,
            marginBottom: 4,
          }}
        />

        <View
          style={{
            borderWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 44,
            borderColor: colors.primary,
            borderRadius: 8,
            paddingRight: 12,
            paddingLeft: 12,
          }}
        >
          <TextInput
            value={newAddress}
            onChangeText={(text: string) => {
              setNewAddress(text)
              if (updateError !== '') setUpdateError('')
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
            text={item.full_address.replace(item.address, '')}
            style={{
              marginLeft: 2,
              right: 0,
            }}
          />
        </View>
      </View>

      <Text
        numberOfLines={2}
        size="base"
        text={updateError}
        style={{ color: colors.error, marginVertical: 8 }}
      />

      <Button
        text={translate('common.save')}
        disabled={isLoading || !newAddress || updateError !== ''}
        loading={isLoading}
        onPress={() => setIsConfirm(true)}
      />
    </Animated.View>
  )

  const renderConfirmEdit = () => (
    <Animated.View entering={FadeInDown}>
      <Text
        text={translate('private_relay.edit_warning', { alias: item.full_address })}
        style={{
          marginTop: 4,
          marginBottom: 4,
        }}
      />
      <View
        style={{
          marginTop: 12,
          justifyContent: 'flex-end',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Button
          preset="secondary"
          text={translate('common.cancel')}
          onPress={() => {
            setIsConfirm(false)
            onClose()
          }}
          style={{
            width: 100,
          }}
        />
        <Button
          text={translate('common.save')}
          loading={isLoading}
          onPress={handleEdit}
          style={{
            width: 100,
            marginLeft: 12,
          }}
        />
      </View>
    </Animated.View>
  )

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        !isConfirm
          ? translate('private_relay.edit_modal.titel')
          : translate('private_relay.edit_modal.confirm_title')
      }
    >
      {!isConfirm && renderEdit()}
      {isConfirm && renderConfirmEdit()}
    </BottomModal>
  )
}
