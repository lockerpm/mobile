import React, { useState } from "react"
import { View } from "react-native"
import { useMixins } from "../../../services/mixins"
import { Button } from "../../button/button"
import { Modal } from "../../modal/modal"
import { Text } from "../../text/text"
import { AutoImage as Image } from "../../auto-image/auto-image"
import { fontSize } from "../../../theme"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"

interface Props {
  isOpen?: boolean
  onClose?: () => void
  cipherId: string
  organizationId: string
}

export const LeaveShareModal = (props: Props) => {
  const { translate, color, notify } = useMixins()
  const { isOpen, onClose, cipherId, organizationId } = props
  const { leaveShare } = useCipherDataMixins()

  const [isLoading, setIsLoading] = useState(false)

  const handleLeave = async () => {
    setIsLoading(true)
    const res = await leaveShare(cipherId, organizationId)
    if (res.kind === 'ok') {
      setIsLoading(false)
      onClose()
      notify('success', translate('success.done'))
    } else {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <View style={{ alignItems: 'center' }}>
        <Image
          source={require('../../../screens/auth/browse/trash/trash.png')}
          style={{ height: 110, width: 100 }}
        />
        <Text
          preset="black"
          text={translate('common.warning')}
          style={{ fontSize: fontSize.h4, marginBottom: 10, marginTop: 20 }}
        />
        <Text
          text={translate('shares.leave_desc')}
          style={{ textAlign: 'center', fontSize: fontSize.small }}
        />
      </View>

      <Button
        preset="error"
        disabled={isLoading}
        isLoading={isLoading}
        onPress={handleLeave}
        style={{
          width: '100%',
          marginTop: 30
        }}
      >
        <Text
          text={translate('shares.leave')}
          style={{ color: color.white }}
        />
      </Button>
    </Modal>
  )
}
