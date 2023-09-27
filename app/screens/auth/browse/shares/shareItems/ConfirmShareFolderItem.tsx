/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import { BottomModal, Button, Text } from 'app/components/cores'
import { translate } from 'app/i18n'
import { useStores } from 'app/models'
import { useCoreService } from 'app/services/coreService'
import { useCipherData } from 'app/services/hook'
import { View } from 'react-native'
import { useTheme } from 'app/services/context'
import { CollectionView } from 'core/models/view/collectionView'

interface Props {
  isOpen?: boolean
  onClose?: () => void
  item: CollectionView
}

export const ConfirmShareFolderModal = (props: Props) => {
  const { isOpen, onClose } = props
  const { cipherStore } = useStores()
  const { colors } = useTheme()
  const { confirmShareCipher } = useCipherData()
  const { cryptoService } = useCoreService()

  const organizationId = cipherStore.cipherView?.organizationId
  // --------------- PARAMS ----------------

  const [isLoading, setIsLoading] = useState(false)
  const [fingerprint, setFingerprint] = useState('')
  const [publicKey, setPublicKey] = useState('')

  // --------------- COMPUTED ----------------

  // --------------- METHODS ----------------

  const handleConfirmShare = async () => {
    // setIsLoading(true)
    // const res = await confirmShareCipher(organizationId, member.id, publicKey)
    // setIsLoading(false)
    // if (res.kind === 'ok' || res.kind === 'unauthorized') {
    //   onClose()
    // }
  }

  // --------------- EFFECT ----------------

  useEffect(() => {
    if (isOpen) {
      setFingerprint('')
      setPublicKey('')
    }
  }, [isOpen])
  // --------------- RENDER ----------------

  return (
    <BottomModal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('shares.confirm_share.verify_fingerprint')}
    >
      <Text
        text={translate('shares.confirm_share.verification_desc')}
        style={{
          marginTop: 20,
          marginBottom: 20,
        }}
      />

      <View
        style={{
          paddingHorizontal: 15,
          paddingVertical: 10,
          borderRadius: 5,
          backgroundColor: colors.border,
        }}
      >
        <Text
          text={fingerprint}
          style={{
            color: colors.error,
          }}
        />
      </View>

      <Text
        preset="label"
        size="base"
        text={translate('shares.confirm_share.fingerprint_desc')}
        style={{
          marginTop: 20,
          marginBottom: 10,
        }}
      />

      <Button
        text={translate('common.confirm')}
        loading={isLoading}
        disabled={isLoading}
        onPress={handleConfirmShare}
        style={{
          width: '100%',
          marginTop: 20,
        }}
      />
    </BottomModal>
  )
}
