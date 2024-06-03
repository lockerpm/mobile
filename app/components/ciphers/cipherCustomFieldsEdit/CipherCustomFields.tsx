import React, { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { FieldEdit } from './fieldEdit'
import { TypeSelectModal } from './TypeSelectModal'
import { FieldView } from 'core/models/view'
import { useTheme } from 'app/services/context'
import { useCipherHelper, useHelper } from 'app/services/hook'
import { FieldType } from 'core/enums'
import { Icon, Text } from 'app/components/cores'

type Props = {
  fields: FieldView[]
  setFields: (val: FieldView[]) => void
}

/**
 * Describe your component here
 */
export const CustomFieldsEdit = (props: Props) => {
  const { fields, setFields } = props
  const { colors } = useTheme()
  const { translate } = useHelper()
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

      <View
        style={{
          padding: 16,
          backgroundColor: colors.block,
        }}
      >
        <Text preset="label" size="base" text={translate('common.custom_fields').toUpperCase()} />
      </View>

      {/* Data */}
      <View
        style={{
          padding: 16,
        }}
      >
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
          style={{
            justifyContent: 'flex-start',
            alignItems: 'center',
            flexDirection: 'row',
          }}
        >
          <Icon icon="plus-circle" size={20} color={colors.primary} />
          <Text
            text={translate('common.add_new_field')}
            color={colors.primary}
            style={{
              marginLeft: 12,
            }}
          />
        </TouchableOpacity>
      </View>
      {/* Data end */}
    </View>
  )
}
