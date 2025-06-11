import React, { useState } from "react"
import { BottomModalContainer, Text, TextInput, Button } from "app/components/cores"
import { FolderView } from "core/models/view/folderView"
import { useStores } from "app/models"
import { useCipherData } from "app/services/hook"

type Props = {
  onClose: () => void
}

export const NewFolder = ({ onClose }: Props) => {
  const { folderStore } = useStores()
  const { createFolder } = useCipherData()

  // ---------------- PARAMS -----------------

  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // --------------- COMPUTED ---------------

  const isExisted = (() => {
    if (!name.trim() || isLoading) {
      return false
    }
    return folderStore.folders.some((f) => f.name && f.name === name)
  })()

  // --------------- METHODS ----------------

  const handleCreateFolder = async () => {
    if (!name.trim() || isExisted) {
      return
    }
    setIsLoading(true)
    const data = new FolderView()
    data.name = name
    const res = await createFolder(data)

    setIsLoading(false)
    if (res.kind === "ok") {
      setName("")
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
      <Text preset="bold" tx="folder.create_folder" />

      <TextInput
        animated
        isError={isExisted}
        helperTx="folder.folder_existed"
        labelTx="folder.folder_name"
        value={name}
        onChangeText={setName}
        onSubmitEditing={handleCreateFolder}
      />

      <Button
        tx="common.create"
        disabled={isLoading || !name.trim() || isExisted}
        loading={isLoading}
        onPress={handleCreateFolder}
        style={{
          width: "100%",
          marginTop: 30,
        }}
      />
    </BottomModalContainer>
  )
}
