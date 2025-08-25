import { View } from "react-native"
import { TextInput } from "app/components/cores"
import { Textarea } from "app/components/utils"
import { CipherAppView } from "app/static/types"
import { CARD_BRANDS } from "app/static/constants"

type Props = {
  item: CipherAppView
}

export const CardInfo = ({ item }: Props) => {
  const brand = (CARD_BRANDS.find((i) => i.value === item.card.brand) || { label: "" }).label
  return (
    <View>
      {item.card.cardholderName && (
        <TextInput
          animated
          isCopyable
          labelTx="card:card_name"
          value={item.card.cardholderName}
          editable={false}
        />
      )}
      {brand && (
        <TextInput animated isCopyable labelTx="card:brand" value={brand} editable={false} />
      )}

      {item.card.number && (
        <TextInput
          animated
          isCopyable
          labelTx="card:card_number"
          value={item.card.number}
          editable={false}
        />
      )}

      {item.card.expMonth && item.card.expYear && (
        <TextInput
          animated
          isCopyable
          labelTx="card:exp_date"
          value={`${item.card.expMonth}/${item.card.expYear}`}
          editable={false}
        />
      )}

      {item.card.code && (
        <TextInput
          animated
          isCopyable
          isPassword
          labelTx="card:cvv"
          value={item.card.code}
          editable={false}
        />
      )}
      {item.notes && <Textarea labelTx="common:notes" value={item.notes} editable={false} />}
    </View>
  )
}
