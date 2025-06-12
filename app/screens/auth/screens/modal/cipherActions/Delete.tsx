import { useCipherData, useDeleteCipher } from "app/services/hook"
import React, { useState } from "react"
import { Image, StyleSheet } from "react-native"
import { Text, Button, BottomModalContainer } from "app/components/cores"
import { useTheme } from "app/services/context"

interface Props {
  onClose: () => void
  deleteIds: string[]
  isDeleted: boolean // permanent delete or move to trash
}

const TRASH = require("assets/images/intro/trash.png")

export const Delete = ({ deleteIds, isDeleted, onClose }: Props) => {
  const { toTrashCiphers } = useDeleteCipher()
  const { deleteCiphers } = useCipherData()
  const { colors } = useTheme()

  // --------------------PARAMS---------------------
  const [isLoading, setIsLoading] = useState(false)

  // --------------------METHODS---------------------

  const handleDelete = async () => {
    setIsLoading(true)
    if (isDeleted) {
      // permanent delete
      await deleteCiphers(deleteIds)
    } else {
      await toTrashCiphers(deleteIds)
    }
    setIsLoading(false)
    onClose()
  }

  return (
    <BottomModalContainer style={styles.container}>
      <Text
        preset="bold"
        tx={isDeleted ? "trash.perma_delete" : "trash.to_trash"}
        style={styles.header}
      />
      <Image resizeMode="contain" source={TRASH} style={styles.image} />
      <Text
        preset="label"
        size="base"
        tx={isDeleted ? "trash.perma_delete_desc" : "trash.to_trash_desc"}
        style={styles.label}
      />

      <Button
        preset="teriatary"
        disabled={isLoading}
        loading={isLoading}
        onPress={handleDelete}
        teriataryBackground={colors.error}
      >
        <Text preset="bold" tx={isDeleted ? "common.ok" : "common.delete"} color={colors.white} />
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
