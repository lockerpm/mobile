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
  folder: FolderView
}

export const RenameFolder = ({ onClose, folder }: Props) => {
  const { folderStore } = useStores()
  const { updateFolder } = useCipherData()

  // ---------------- PARAMS -----------------

  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<RNInput>(null)

  // --------------- COMPUTED ---------------
  const isExisted = (() => {
    if (!name.trim()) {
      return false
    }
    return folderStore.folders.some((f) => f.name && f.name === name)
  })()
  // --------------- METHODS ----------------

  const renameFolder = async () => {
    setIsLoading(true)
    const data = { ...folder }
    data.name = name
    await updateFolder(data)
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
          animated
          isError={isExisted}
          helperTx="folder:folder_existed"
          labelTx="folder:folder_name"
          placeholder={folder.name}
          value={name}
          onChangeText={setName}
          onSubmitEditing={renameFolder}
        />

        <Button
          tx="common:save"
          disabled={isLoading || !name.trim() || isExisted}
          loading={isLoading}
          onPress={renameFolder}
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
