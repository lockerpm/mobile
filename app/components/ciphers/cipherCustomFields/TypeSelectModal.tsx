import { useCipherHelper } from "app/services/hook"
import { FieldType } from "core/enums"
import { View, ViewStyle } from "react-native"
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
      // @ts-ignore
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
        <View style={$header}>
          <Text preset="bold" tx="common:add_new_field" />
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

const $header: ViewStyle = {
  width: "100%",
  padding: 16,
  paddingBottom: 0,
}
