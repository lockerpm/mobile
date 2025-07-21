import { useCipherData } from "app/services/hook"
import { useState } from "react"
import { Image, StyleSheet, View } from "react-native"
import { Text, Button, BottomModalContainer, BottomModalHeader } from "app/components/cores"

interface Props {
  onClose: () => void
  organizationId: string
}

const TRASH = require("assets/images/intro/trash.png")

export const LeaveShare = ({ organizationId, onClose }: Props) => {
  const { leaveShare } = useCipherData()

  // --------------------PARAMS---------------------
  const [isLoading, setIsLoading] = useState(false)

  // --------------------METHODS---------------------

  const handleLeave = async () => {
    setIsLoading(true)
    const res = await leaveShare(organizationId)
    if (res.kind === "ok") {
      onClose()
    }
    setIsLoading(false)
  }

  return (
    <BottomModalContainer>
      <BottomModalHeader tx="common:warning" onClose={onClose} />

      <View style={styles.container}>
        <Image resizeMode="contain" source={TRASH} style={styles.image} />
        <Text preset="label" size="sm" tx={"shares:leave_desc"} style={styles.label} />

        <Button
          preset="delete"
          disabled={isLoading}
          loading={isLoading}
          onPress={handleLeave}
          tx="shares:leave"
        />
      </View>
    </BottomModalContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  image: {
    alignSelf: "center",
    height: 110,
    marginBottom: 12,
    width: 100,
  },
  label: {
    marginBottom: 16,
    textAlign: "center",
  },
})
