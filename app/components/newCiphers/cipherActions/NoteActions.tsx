import { NewActionSheetItem } from "app/components/utils"
import { useClipboard } from "app/services/utils"
import { CipherAppView } from "app/static/types"
import React from "react"

type Props = {
  item: CipherAppView
  onClose: () => void
}

export const NoteAction = ({ item, onClose }: Props) => {
  const { copyToClipboard } = useClipboard()

  return (
    <NewActionSheetItem
      bottomBorder
      tx="note.copy_note"
      icon="copy"
      onPress={() => {
        onClose()
        copyToClipboard(item.notes)
      }}
      hide={!item.notes}
    />
  )
}
