import { useCipherData } from "app/services/hook"
import React, { useState } from "react"
import { Image, StyleSheet } from "react-native"
import { Text, Button, BottomModalContainer } from "app/components/cores"
import { useTheme } from "app/services/context"

interface Props {
  onClose: () => void
  organizationId: string
}

const TRASH = require("assets/images/intro/trash.png")

export const LeaveShare = ({ organizationId, onClose }: Props) => {
  const { colors } = useTheme()
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
    <BottomModalContainer style={styles.container}>
      <Text preset="bold" tx="common.warning" style={styles.header} />
      <Image resizeMode="contain" source={TRASH} style={styles.image} />
      <Text preset="label" size="base" tx={"shares.leave_desc"} style={styles.label} />

      <Button
        preset="teriatary"
        disabled={isLoading}
        loading={isLoading}
        onPress={handleLeave}
        teriataryBackground={colors.error}
      >
        <Text preset="bold" tx={"shares.leave"} color={colors.white} />
      </Button>
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
