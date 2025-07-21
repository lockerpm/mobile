import { useCipherData } from "app/services/hook"
import { useState } from "react"
import { StyleSheet } from "react-native"
import { Text, Button, BottomModalContainer } from "app/components/cores"
import { useToast } from "app/services/utils"

interface Props {
  onClose: () => void
  cipherId: string
  organizationId: string
}

export const LeaveShared = ({ cipherId, organizationId, onClose }: Props) => {
  const { leaveShare } = useCipherData()
  const { notifyTx } = useToast()

  // --------------------PARAMS---------------------
  const [isLoading, setIsLoading] = useState(false)

  // --------------------METHODS---------------------

  const handleLeave = async () => {
    setIsLoading(true)
    const res = await leaveShare(organizationId, cipherId)
    if (res.kind === "ok") {
      onClose()
      notifyTx("success", "success:done")
    }
    setIsLoading(false)
  }

  return (
    <BottomModalContainer style={styles.container}>
      <Text preset="bold" tx="common:warning" style={styles.header} />
      <Text preset="label" size="sm" tx="shares:leave_desc" style={styles.label} />

      <Button
        preset="delete"
        disabled={isLoading}
        loading={isLoading}
        onPress={handleLeave}
        tx="shares:leave"
      />
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 12,
    textAlign: "center",
  },

  label: {
    marginBottom: 16,
    textAlign: "center",
  },
})
