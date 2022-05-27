import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { Text } from "../../text/text"
import { commonStyles, fontSize, spacing } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { FieldView } from "../../../../core/models/view"
import { FieldType } from "../../../../core/enums"
import { FieldEdit } from "./field-edit"
import { TypeSelectModal } from "./type-select-modal"
import { Button } from "../../button/button"
import AntDesign from 'react-native-vector-icons/AntDesign'
import { useCipherHelpersMixins } from "../../../services/mixins/cipher/helpers"


type Props = {
  fields: FieldView[]
  setFields: (val: FieldView[]) => void
}

/**
 * Describe your component here
 */
export const CustomFieldsEdit = observer((props: Props) => {
  const { fields, setFields } = props
  const { translate, color } = useMixins()
  const { getCustomFieldDataFromType } = useCipherHelpersMixins()

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

  const updateField = (index: number, values: {
    type: FieldType
    name: string
    value: string
  }) => {
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
      {/* Modal */}
      <TypeSelectModal
        isOpen={showTypeModal}
        onClose={() => {
          setShowTypeModal(false)
        }}
        onSelect={addNewField}
      />
      {/* Modal end */}

      {/* Label */}
      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('common.custom_fields').toUpperCase()}
          style={{ fontSize: fontSize.small }}
        />
      </View>
      {/* Label end */}

      {/* Data */}
      <View
        style={[commonStyles.SECTION_PADDING, {
          backgroundColor: color.background,
          paddingBottom: 32,
          position: 'relative'
        }]}
      >
        {/* List */}
        {
          fields.map((item, index) => (
            <FieldEdit
              key={index}
              type={item.type}
              name={item.name}
              value={item.value}
              onChange={val => {
                updateField(index, val)
              }}
              onDelete={() => {
                deleteField(index)
              }}
            />
          ))
        }
        {/* List end */}

        <Button
          preset="link"
          onPress={() => {
            setShowTypeModal(true)
          }}
          style={{
            justifyContent: 'flex-start'
          }}
        >
          <AntDesign name="pluscircleo" size={20} color={color.primary} />
          <Text
            text={translate('common.add_new_field')}
            style={{
              marginLeft: spacing[3],
              color: color.primary
            }}
          />
        </Button>
      </View>
      {/* Data end */}
    </View>
  )
})
