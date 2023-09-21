import React from 'react'
import { BottomModal, Text, Button } from 'app/components-v2/cores'
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
    <BottomModal
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
        preset='secondary'
        text={confirmText}
        onPress={onConfirm}
        style={{
          marginTop: 30,
        }}
      />
    </BottomModal>
  )
}
