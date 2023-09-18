import React from 'react'
import { Modal } from '../modal/Modal'
import { Button, Text } from '../../cores'
import { translate } from 'app/i18n'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  teamName: string
  violations: string[]
  confirmText: string
}

export const PasswordPolicyViolationsModal = (props: Props) => {
  const { isOpen, onClose, onConfirm, violations, teamName, confirmText } = props

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('policy.password_violation_modal.title')}
    >
      <Text
        text={`${translate('policy.password_violation_modal.desc')} ${teamName}:`}
        style={{
          marginTop: 20,
          marginBottom: 10,
        }}
      />

      {violations.map((v, index) => (
        <Text
          preset="bold"
          key={index}
          text={`- ${v}`}
          style={{
            marginBottom: 3,
          }}
        />
      ))}

      <Button
        preset="secondary"
        text={confirmText}
        onPress={onConfirm}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      />
    </Modal>
  )
}
