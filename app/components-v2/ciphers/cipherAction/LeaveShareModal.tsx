import React, { useState } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { BottomModal, Text } from 'app/components-v2/cores'
import { useTheme } from 'app/services/context'
import { useCipherData, useHelper } from 'app/services/hook'
import { translate } from 'app/i18n'

interface Props {
  isOpen?: boolean
  onClose?: () => void
  cipherId?: string
  organizationId: string
}

const TRASH = require('assets/images/intro/trash.png')

export const LeaveShareModal = (props: Props) => {
  const { colors } = useTheme()
  const { notify } = useHelper()
  const { isOpen, onClose, cipherId, organizationId } = props
  const { leaveShare } = useCipherData()

  const [isLoading, setIsLoading] = useState(false)

  const handleLeave = async () => {
    setIsLoading(true)
    const res = await leaveShare(organizationId, cipherId)
    if (res.kind === 'ok') {
      setIsLoading(false)
      onClose()
      notify('success', translate('success.done'))
    } else {
      setIsLoading(false)
    }
  }

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={''}>
      <View style={{ alignItems: 'center' }}>
        <Image source={TRASH} style={{ height: 110, width: 100 }} />
        <Text
          preset="bold"
          size="xl"
          text={translate('common.warning')}
          style={{ marginBottom: 10, marginTop: 20 }}
        />
        <Text
          preset="label"
          size="base"
          text={translate('shares.leave_desc')}
          style={{ textAlign: 'center' }}
        />
      </View>

      <TouchableOpacity
        disabled={isLoading}
        onPress={handleLeave}
        style={{
          backgroundColor: colors.error,
          width: '100%',
          marginTop: 30,
          borderRadius: 12,
        }}
      >
        <Text text={translate('shares.leave')} style={{ color: colors.white }} />
      </TouchableOpacity>
    </BottomModal>
  )
}
