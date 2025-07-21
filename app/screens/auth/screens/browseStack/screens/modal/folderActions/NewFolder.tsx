/* eslint-disable no-restricted-imports */
import { useEffect, useRef, useState } from "react"
import { BottomModalContainer, TextInput, Button, BottomModalHeader } from "app/components/cores"
import { FolderView } from "core/models/view/folderView"
import { useStores } from "app/models"
import { useCipherData } from "app/services/hook"
import { View, ViewStyle, TextInput as RNInput } from "react-native"
import { delay } from "@/utils/delay"

type Props = {
  onClose: () => void
}

export const NewFolder = ({ onClose }: Props) => {
  const { folderStore } = useStores()
  const { createFolder } = useCipherData()

  // ---------------- PARAMS -----------------

  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<RNInput>(null)

  // --------------- COMPUTED ---------------

  const isExisted = (() => {
    if (!name.trim() || isLoading) {
      return false
    }
    return folderStore.folders.some((f) => f.name && f.name === name)
  })()

  // --------------- METHODS ----------------

  const handleCreateFolder = async () => {
    setIsLoading(true)
    const data = new FolderView()
    data.name = name
    await createFolder(data)

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
      <BottomModalHeader tx="folder:create_folder" onClose={onClose} />

      <View style={$container}>
        <TextInput
          ref={inputRef}
          animated
          isError={isExisted}
          helperTx="folder:folder_existed"
          labelTx="folder:folder_name"
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleCreateFolder}
        />

        <Button
          tx="common:create"
          disabled={isLoading || !name.trim() || isExisted}
          loading={isLoading}
          onPress={handleCreateFolder}
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
