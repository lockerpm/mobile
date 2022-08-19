import React from 'react'
import { observer } from 'mobx-react-lite'
import { Modal } from '../../modal/modal'
import { Button } from '../../button/button'
import { Text } from '../../text/text'
import { useMixins } from '../../../services/mixins'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  teamName: string
  violations: string[]
  confirmText: string
}

export const PasswordPolicyViolationsModal = observer((props: Props) => {
  const { isOpen, onClose, onConfirm, violations, teamName, confirmText } = props
  const { translate } = useMixins()

  // --------------- PARAMS ----------------

  // --------------- COMPUTED ----------------

  // --------------- METHODS ----------------

  // --------------- EFFECT ----------------

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate('policy.password_violation_modal.title')}
    >
      <Text
        preset="black"
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
        preset="outline"
        text={confirmText}
        onPress={onConfirm}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      />
    </Modal>
  )
})
