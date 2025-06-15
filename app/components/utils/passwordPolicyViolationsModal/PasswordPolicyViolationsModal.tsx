import React from "react"
import { Button, Text } from "../../cores"
import { useAppLocale } from "app/services/context"
import { Modal } from "react-native"

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
  const { translate } = useAppLocale()

  return (
    <Modal visible={isOpen} onDismiss={onClose}>
      <Text
        tx="policy.password_violation_modal.title"
        style={{
          marginTop: 20,
          marginBottom: 10,
        }}
      />
      <Text
        text={`${translate("policy.password_violation_modal.desc")} ${teamName}:`}
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
          width: "100%",
          marginTop: 30,
        }}
      />
    </Modal>
  )
}
