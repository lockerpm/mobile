import React from "react"
import { FieldType } from "../../../../core/enums"
import { ActionSheet, ActionSheetContent, ActionSheetItem } from "../../action-sheet"
import { Text } from "../../text/text"
import { View } from "react-native"
import { Divider } from "../../divider/divider"
import { commonStyles } from "../../../theme"


interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (val: FieldType) => void
}

export const TypeSelectModal = (props: Props) => {
  const { isOpen, onClose, onSelect } = props
  
  // --------------- PARAMS ----------------

  // --------------- COMPUTED ----------------

  const types = [ 
    {
      value: FieldType.Text,
      label: 'Text'
    },
    {
      value: FieldType.Hidden,
      label: 'Password'
    },
    {
      value: FieldType.Boolean,
      label: 'Boolean'
    }
  ]

  // --------------- METHODS ----------------

  // --------------- EFFECT ----------------

  // --------------- RENDER ----------------

  return (
    <ActionSheet
      isOpen={isOpen}
      onClose={onClose}
    >
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <Text
          preset="semibold"
          text={'Add new field'}
        />
      </View>

      <Divider style={{ marginTop: 10 }} />

      <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
        {
          types.map((item) => (
            <ActionSheetItem
              key={item.value}
              onPress={() => {
                onSelect(item.value)
                onClose()
              }}
            >
              <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                <Text
                  preset="black"
                  text={item.label}
                />
              </View>
            </ActionSheetItem>
          ))
        }
      </ActionSheetContent>
    </ActionSheet>
  )
}
