import { Text, BottomModal } from "app/components/cores"
import { TextStyle } from "react-native"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const MoveItemToSharedFolderWarningModal = ({ isOpen, onClose }: Props) => {
  return (
    <BottomModal isOpen={isOpen} onClose={onClose} tx="common:warning">
      <Text tx="folder:move_to_collection_warning" style={$text} />
    </BottomModal>
  )
}

const $text: TextStyle = {
  marginTop: 16,
  fontSize: 18,
}
