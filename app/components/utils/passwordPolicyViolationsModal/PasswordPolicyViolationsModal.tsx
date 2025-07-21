import { useAppLocale } from "@/i18n"
import { BottomModal, Button, Text } from "../../cores"
import { StyleSheet } from "react-native"

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
    <BottomModal isOpen={isOpen} onClose={onClose} tx="policy:password_violation_modal.title">
      <Text
        text={`${translate("policy:password_violation_modal.desc")} ${teamName}:`}
        style={styles.label}
      />

      {violations.map((v, index) => (
        <Text preset="bold" key={index} text={`- ${v}`} style={styles.violation} />
      ))}

      <Button preset="secondary" text={confirmText} onPress={onConfirm} style={styles.button} />
    </BottomModal>
  )
}

const styles = StyleSheet.create({
  button: {
    marginTop: 30,
    width: "100%",
  },
  label: {
    marginBottom: 10,
    marginTop: 20,
  },
  violation: {
    marginBottom: 3,
  },
})
