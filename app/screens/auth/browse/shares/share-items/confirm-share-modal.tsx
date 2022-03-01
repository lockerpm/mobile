import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { SharedMemberType } from "../../../../../services/api/api.types"
import { useStores } from "../../../../../models"
import { useMixins } from "../../../../../services/mixins"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { Button, Modal, Text } from "../../../../../components"
import { fontSize } from "../../../../../theme"
import { useCoreService } from "../../../../../services/core-service"
import { Utils } from "../../../../../../core/misc/utils"
import { View } from "react-native"


interface Props {
  isOpen?: boolean,
  onClose?: () => void
  member: SharedMemberType
  organizationId: string
}

export const ConfirmShareModal = observer((props: Props) => {
  const { isOpen, onClose, member, organizationId } = props
  const { cipherStore } = useStores()
  const { translate, notifyApiError, color } = useMixins()
  const { confirmShareCipher } = useCipherDataMixins()
  const { cryptoService } = useCoreService()

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

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOpen={() => {
        setFingerprint('')
        setPublicKey('')
        loadFingerprint()
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

      <View style={{
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 5,
        backgroundColor: color.block
      }}>
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
          fontSize: fontSize.small
        }}
      />

      <Button
        text={translate('common.confirm')}
        isDisabled={isLoading}
        isLoading={isLoading}
        onPress={handleConfirmShare}
        style={{
          width: '100%',
          marginTop: 20
        }}
      />
    </Modal>
  )
})
