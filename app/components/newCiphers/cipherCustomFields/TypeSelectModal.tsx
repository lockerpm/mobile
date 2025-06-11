import { useCipherHelper } from "app/services/hook"
import { FieldType } from "core/enums"
import React from "react"
import { View } from "react-native"
import { Text } from "../../cores"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (val: FieldType) => void
}

export const TypeSelectModal = (props: Props) => {
  const { isOpen, onClose, onSelect } = props
  const { getCustomFieldDataFromType } = useCipherHelper()

  // --------------- PARAMS ----------------

  // --------------- COMPUTED ----------------

  const types = Object.keys(FieldType)
    .filter((k) => isNaN(Number(k)))
    .map((key) => {
      const { label, type } = getCustomFieldDataFromType(FieldType[key])
      return { label, value: type }
    })

  // --------------- METHODS ----------------

  // --------------- EFFECT ----------------

  // --------------- RENDER ----------------

  return (
    <NewActionSheet
      isOpen={isOpen}
      onClose={onClose}
      header={
        <View style={{ width: "100%", paddingHorizontal: 20, marginBottom: 10 }}>
          <Text preset="bold" tx="common.add_new_field" />
        </View>
      }
    >
      {types.map((item) => (
        <NewActionSheetItem
          text={item.label}
          key={item.value}
          onPress={() => {
            onSelect(item.value)
            onClose()
          }}
        />
      ))}
    </NewActionSheet>
  )
}
