import { useCipherData } from "app/services/hook"
import { useState } from "react"
import { Image, StyleSheet, View } from "react-native"
import { Text, Button, BottomModalContainer, BottomModalHeader } from "app/components/cores"
import { FolderView } from "core/models/view/folderView"
import { CollectionView } from "core/models/view/collectionView"

interface Props {
  onClose: () => void
  folder?: FolderView
  collection?: CollectionView
}

const TRASH = require("assets/images/intro/trash.png")

export const Delete = ({ folder, collection, onClose }: Props) => {
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
    <BottomModalContainer>
      <BottomModalHeader tx="folder:delete_modal.title" onClose={onClose} />

      <View style={styles.container}>
        <Image resizeMode="contain" source={TRASH} style={styles.image} />
        <Text preset="label" size="sm" tx={"folder:delete_modal.desc"} style={styles.label} />

        <Button
          preset="delete"
          disabled={isLoading}
          loading={isLoading}
          onPress={handleDelete}
          tx="folder:delete_modal.btn"
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
