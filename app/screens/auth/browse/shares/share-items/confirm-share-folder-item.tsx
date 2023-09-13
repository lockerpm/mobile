import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../../../../models'
import { useMixins } from '../../../../../services/mixins'
import { useCipherDataMixins } from '../../../../../services/mixins/cipher/data'
import { Button, Modal, Text } from '../../../../../components'
import { fontSize } from '../../../../../theme'
import { useCoreService } from '../../../../../services/coreService'
import { View } from 'react-native'
import { CollectionView } from '../../../../../../core/models/view/collectionView'

interface Props {
  isOpen?: boolean
  onClose?: () => void
  item: CollectionView
}

export const ConfirmShareFolderModal = observer((props: Props) => {
  const { isOpen, onClose, item } = props
  const { cipherStore } = useStores()
  const { translate, notifyApiError, color } = useMixins()
  const { confirmShareCipher } = useCipherDataMixins()
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

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOpen={() => {
        setFingerprint('')
        setPublicKey('')
      }}
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
          backgroundColor: color.block,
        }}
      >
        <Text
          text={fingerprint}
          style={{
            color: color.error,
          }}
        />
      </View>

      <Text
        text={translate('shares.confirm_share.fingerprint_desc')}
        style={{
          marginTop: 20,
          marginBottom: 10,
          fontSize: fontSize.small,
        }}
      />

      <Button
        text={translate('common.confirm')}
        isDisabled={isLoading}
        isLoading={isLoading}
        onPress={handleConfirmShare}
        style={{
          width: '100%',
          marginTop: 20,
        }}
      />
    </Modal>
  )
})
