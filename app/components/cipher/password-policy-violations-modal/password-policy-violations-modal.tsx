import React from 'react'
import { observer } from 'mobx-react-lite'
import { Modal } from '../../modal/modal'
import { Button } from '../../button/button'
import { Text } from '../../text/text'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  teamName: string
  violations: string[]
}

export const PasswordPolicyViolationsModal = observer((props: Props) => {
  const { isOpen, onClose, onConfirm, violations, teamName } = props

  // --------------- PARAMS ----------------

  // --------------- COMPUTED ----------------

  // --------------- METHODS ----------------

  // --------------- EFFECT ----------------

  // --------------- RENDER ----------------

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Policy Violations">
      <Text
        preset="black"
        text={`Your password violated the following policies of ${teamName}:`}
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
        text="Use this password anyway"
        onPress={onConfirm}
        style={{
          width: '100%',
          marginTop: 30,
        }}
      />
    </Modal>
  )
})
