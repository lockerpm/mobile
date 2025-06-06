import React from "react"
import { Text, BottomModal } from "app/components/cores"
import { TextStyle } from "react-native"
import { useHelper } from "app/services/hook"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const MoveItemToSharedFolderWarningModal = ({ isOpen, onClose }: Props) => {
  const { translate } = useHelper()
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title={translate("common.warning")}>
      <Text tx="folder.move_to_collection_warning" style={$text} />
    </BottomModal>
  )
}

const $text: TextStyle = {
  marginTop: 16,
  fontSize: 18,
}
