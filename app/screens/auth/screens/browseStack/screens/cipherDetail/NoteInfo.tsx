import { View } from "react-native"
import { Textarea } from "app/components/utils"
import { CipherAppView } from "app/static/types"

type Props = {
  item: CipherAppView
}

export const NoteInfo = ({ item }: Props) => {
  return (
    <View>
      {item.notes && <Textarea labelTx="common:notes" value={item.notes} editable={false} />}
    </View>
  )
}
