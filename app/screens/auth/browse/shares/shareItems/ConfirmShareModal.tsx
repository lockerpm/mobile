import { useStores } from 'app/models'
import { useTheme } from 'app/services/context'
import { useCoreService } from 'app/services/coreService'
import { Utils } from 'app/services/coreService/utils'
import { useCipherData, useHelper } from 'app/services/hook'
import { SharedMemberType } from 'app/static/types'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Text, BottomModal, Button } from 'app/components/cores'

interface Props {
  isOpen?: boolean
  onClose?: () => void
  member: SharedMemberType
}

export const ConfirmShareModal = (props: Props) => {
  const { isOpen, onClose, member } = props
  const { cipherStore } = useStores()
  const { colors } = useTheme()
  const { notifyApiError, translate } = useHelper()
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
    setIsLoading(true)
    const res = await confirmShareCipher(organizationId, member.id, publicKey)
    setIsLoading(false)

    if (res.kind === 'ok' || res.kind === 'unauthorized') {
      onClose()
    }
  }

  const loadFingerprint = async () => {
    setIsLoading(true)
    const res = await cipherStore.getSharingPublicKey(member.email)
    if (res.kind !== 'ok') {
      notifyApiError(res)
      setIsLoading(false)
      return
    }
    setPublicKey(res.data.public_key)
    const pubKey = Utils.fromB64ToArray(res.data.public_key)
    const fp = await cryptoService.getFingerprint(member.pwd_user_id, pubKey.buffer)
    setFingerprint(fp.join('-'))
    setIsLoading(false)
  }

  // --------------- EFFECT ----------------
  useEffect(() => {
    if (isOpen) {
      setFingerprint('')
      setPublicKey('')
      loadFingerprint()
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
        disabled={isLoading}
        loading={isLoading}
        onPress={handleConfirmShare}
        style={{
          width: '100%',
          marginTop: 20,
        }}
      />
    </BottomModal>
  )
}
