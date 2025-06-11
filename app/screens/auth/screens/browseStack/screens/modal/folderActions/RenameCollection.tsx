import React, { useState } from "react"
import { BottomModalContainer, Text, TextInput, Button } from "app/components/cores"
import { useStores } from "app/models"
import { useCipherData } from "app/services/hook"
import { CollectionView } from "core/models/view/collectionView"

type Props = {
  onClose: () => void
  collection: CollectionView
}

export const RenameCollection = ({ onClose, collection }: Props) => {
  const { collectionStore } = useStores()
  const { updateCollection } = useCipherData()

  // ---------------- PARAMS -----------------

  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // --------------- COMPUTED ---------------

  const isExisted = (() => {
    if (!name.trim()) {
      return false
    }

    return collectionStore.collections.some((f) => f.name && f.name === name)
  })()

  // --------------- METHODS ----------------

  const renameCollection = async () => {
    if (!name.trim() || isExisted) {
      return
    }

    setIsLoading(true)

    const data = { ...collection }
    data.name = name
    const res = await updateCollection(data)

    setIsLoading(false)

    if (res.kind === "ok") {
      onClose()
    } else {
      if (res.kind === "unauthorized") {
        onClose()
      }
    }
  }

  // ---------------- RENDER -----------------

  return (
    <BottomModalContainer>
      <Text preset="bold" tx="folder.rename_folder" />

      <TextInput
        isError={isExisted}
        helperTx="folder.folder_existed"
        labelTx="folder.folder_name"
        placeholder={name}
        value={name}
        onChangeText={setName}
        onSubmitEditing={renameCollection}
      />

      <Button
        tx="common.save"
        disabled={isLoading || !name.trim() || isExisted}
        loading={isLoading}
        onPress={renameCollection}
        style={{
          width: "100%",
          marginTop: 30,
        }}
      />
    </BottomModalContainer>
  )
}
