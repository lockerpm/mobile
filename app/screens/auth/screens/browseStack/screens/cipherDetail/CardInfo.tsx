import React from "react"
import { View } from "react-native"
import { TextInput } from "app/components/cores"
import { Textarea } from "app/components/utils"
import { CipherAppView } from "app/static/types"
import { CARD_BRANDS } from "app/static/constants"

type Props = {
  item: CipherAppView
}

export const CardInfo = ({ item }: Props) => {
  return (
    <View>
      <TextInput
        isCopyable
        labelTx="card.card_name"
        value={item.card.cardholderName}
        editable={false}
        containerStyle={{ marginBottom: 16 }}
      />

      <TextInput
        isCopyable
        labelTx="card.brand"
        value={(CARD_BRANDS.find((i) => i.value === item.card.brand) || { label: "" }).label}
        editable={false}
        containerStyle={{ marginBottom: 16 }}
      />

      <TextInput
        isCopyable
        labelTx="card.card_number"
        value={item.card.number}
        editable={false}
        containerStyle={{ marginBottom: 16 }}
      />

      <TextInput
        isCopyable
        labelTx="card.exp_date"
        value={`${item.card.expMonth}/${item.card.expYear}`}
        editable={false}
        containerStyle={{ marginBottom: 16 }}
      />

      <TextInput
        isCopyable
        isPassword
        labelTx="card.cvv"
        value={item.card.code}
        editable={false}
        containerStyle={{ marginBottom: 16 }}
      />

      {/* Notes */}
      <Textarea
        labelTx="common.notes"
        value={item.notes || "123"}
        editable={false}
        style={{ marginTop: 10 }}
      />

      {/* <CiphelBaseInfo cipher={item} /> */}
    </View>
  )
}
