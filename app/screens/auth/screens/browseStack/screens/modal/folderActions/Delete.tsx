import { useCipherData } from "app/services/hook"
import React, { useState } from "react"
import { Image, StyleSheet } from "react-native"
import { Text, Button, BottomModalContainer } from "app/components/cores"
import { useTheme } from "app/services/context"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"

interface Props {
  onClose: () => void
  folder?: FolderView
  collection?: CollectionView
}

const TRASH = require("assets/images/intro/trash.png")

export const Delete = ({ folder, collection, onClose }: Props) => {
  const { colors } = useTheme()
  const { deleteCollection, deleteFolder } = useCipherData()

  // --------------------PARAMS---------------------
  const [isLoading, setIsLoading] = useState(false)

  // --------------------METHODS---------------------

  const handleDelete = async () => {
    setIsLoading(true)
    if (folder) {
      await deleteFolder(folder.id)
    }

    if (collection) {
      await deleteCollection(collection)
    }
    setIsLoading(false)
    onClose()
  }

  return (
    <BottomModalContainer style={styles.container}>
      <Text preset="bold" tx="folder.delete_modal.title" style={styles.header} />
      <Image resizeMode="contain" source={TRASH} style={styles.image} />
      <Text preset="label" size="base" tx={"folder.delete_modal.desc"} style={styles.label} />

      <Button
        preset="teriatary"
        disabled={isLoading}
        loading={isLoading}
        onPress={handleDelete}
        teriataryBackground={colors.error}
      >
        <Text preset="bold" tx={"folder.delete_modal.btn"} color={colors.white} />
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
