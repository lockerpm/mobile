import { useState } from "react"
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import { FieldEdit } from "./fieldEdit"
import { TypeSelectModal } from "./TypeSelectModal"
import { FieldView } from "core/models/view"
import { useCipherHelper } from "app/services/hook"
import { FieldType } from "core/enums"
import { Icon, Text } from "app/components/cores"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

type Props = {
  fields: FieldView[]
  setFields: (val: FieldView[]) => void
}

/**
 * Describe your component here
 */
export const CustomFieldsEdit = (props: Props) => {
  const { fields, setFields } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { getCustomFieldDataFromType } = useCipherHelper()

  // -------------- PARAMS --------------

  const [showTypeModal, setShowTypeModal] = useState(false)

  // -------------- METHODS --------------

  const addNewField = (type: FieldType) => {
    const { label } = getCustomFieldDataFromType(type)
    const newField = new FieldView()
    newField.type = type
    newField.name = label
    setFields([...fields, newField])
  }

  const updateField = (
    index: number,
    values: {
      type: FieldType
      name: string
      value: string
    }
  ) => {
    const newFields = [...fields]
    newFields[index].type = values.type
    newFields[index].name = values.name
    newFields[index].value = values.value
    setFields(newFields)
  }

  const deleteField = (index: number) => {
    const newFields = [...fields]
    newFields.splice(index, 1)
    setFields(newFields)
  }

  // -------------- RENDER --------------

  return (
    <View>
      <TypeSelectModal
        isOpen={showTypeModal}
        onClose={() => {
          setShowTypeModal(false)
        }}
        onSelect={addNewField}
      />

      <View style={themed($customField)}>
        <Text preset="label" size="sm" tx="common:custom_fields" />
      </View>

      {fields.map((item, index) => (
        <FieldEdit
          key={index}
          type={item.type}
          name={item.name}
          value={item.value}
          onChange={(val) => {
            updateField(index, val)
          }}
          onDelete={() => {
            deleteField(index)
          }}
        />
      ))}
      <TouchableOpacity
        onPress={() => {
          setShowTypeModal(true)
        }}
        style={styles.newFieldsContainer}
      >
        <Icon icon="plus-circle" size={20} color={colors.primary} />
        <Text tx={"common:add_new_field"} color={colors.primary} style={styles.newFields} />
      </TouchableOpacity>
    </View>
  )
}

const $customField: ThemedStyle<ViewStyle> = ({ colors }) => ({
  padding: 16,
  paddingVertical: 8,
  backgroundColor: colors.block,
})
const styles = StyleSheet.create({
  newFields: {
    marginLeft: 12,
  },
  newFieldsContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 16,
  },
})
