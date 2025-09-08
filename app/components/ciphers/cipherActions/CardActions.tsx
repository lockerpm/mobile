import { NewActionSheetItem } from "app/components/utils"
import { useClipboard } from "app/services/utils"
import { CipherAppView } from "app/static/types"
import { View } from "react-native"

type Props = {
  item: CipherAppView
  onClose: () => void
}

export const CardActions = ({ item, onClose }: Props) => {
  const { copyToClipboard } = useClipboard()

  return (
    <View>
      <NewActionSheetItem
        bottomBorder
        tx="card:card_number"
        icon="copy"
        onPress={() => {
          onClose()
          console.log(item.card.number, item.card)
          copyToClipboard(item.card.number)
        }}
      />
    </View>
  )
}
