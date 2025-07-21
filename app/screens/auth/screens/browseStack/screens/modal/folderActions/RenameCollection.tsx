/* eslint-disable no-restricted-imports */
import { useEffect, useRef, useState } from "react"
import { BottomModalContainer, TextInput, Button, BottomModalHeader } from "app/components/cores"
import { useStores } from "app/models"
import { useCipherData } from "app/services/hook"
import { CollectionView } from "core/models/view/collectionView"
import { View, ViewStyle, TextInput as RNInput } from "react-native"
import { delay } from "@/utils/delay"

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
  const inputRef = useRef<RNInput>(null)

  // --------------- COMPUTED ---------------

  const isExisted = (() => {
    if (!name.trim()) {
      return false
    }

    return collectionStore.collections.some((f) => f.name && f.name === name)
  })()

  // --------------- METHODS ----------------

  const renameCollection = async () => {
    setIsLoading(true)
    const data = { ...collection }
    data.name = name
    await updateCollection(data)
    setIsLoading(false)
    onClose()
  }

  // ---------------- RENDER -----------------

  useEffect(() => {
    delay(200).then(() => {
      inputRef.current?.focus()
    })
  }, [])

  return (
    <BottomModalContainer>
      <BottomModalHeader tx="folder:rename_folder" onClose={onClose} />

      <View style={$container}>
        <TextInput
          ref={inputRef}
          isError={isExisted}
          animated
          helperTx="folder:folder_existed"
          labelTx="folder:folder_name"
          placeholder={name}
          value={name}
          onChangeText={setName}
          onSubmitEditing={renameCollection}
        />

        <Button
          tx="common:save"
          disabled={isLoading || !name.trim() || isExisted}
          loading={isLoading}
          onPress={renameCollection}
          style={$button}
        />
      </View>
    </BottomModalContainer>
  )
}

const $container: ViewStyle = {
  paddingHorizontal: 16,
}

const $button: ViewStyle = {
  width: "100%",
  marginTop: 24,
}
