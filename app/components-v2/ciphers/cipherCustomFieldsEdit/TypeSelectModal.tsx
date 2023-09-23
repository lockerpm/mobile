import { useCipherHelper } from "app/services/hook"
import { FieldType } from "core/enums"
import React from "react"
import { View } from "react-native"
import { ActionSheet } from "../actionsSheet/ActionSheet"
import { Text } from '../../cores'
import { ActionItem } from "../actionsSheet/ActionSheetItem"


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

  const types = Object.keys(FieldType).filter(k => isNaN(Number(k))).map(key => {
    const { label, type } = getCustomFieldDataFromType(FieldType[key])
    return { label, value: type }
  })

  // --------------- METHODS ----------------

  // --------------- EFFECT ----------------

  // --------------- RENDER ----------------

  return (
    <ActionSheet
      isOpen={isOpen}
      onClose={onClose}
      header={<View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 10 }}>
        <Text
          preset="bold"
          text={'Add new field'}
        />
      </View>}
    >
      {
        types.map((item) => (
          <ActionItem
            name={item.label}
            key={item.value}
            action={() => {
              onSelect(item.value)
              onClose()
            }}
          />
        ))
      }
    </ActionSheet>
  )
}
