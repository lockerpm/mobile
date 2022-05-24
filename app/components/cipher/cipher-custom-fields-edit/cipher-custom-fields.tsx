import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { Text } from "../../text/text"
import { commonStyles, fontSize } from "../../../theme"
import { useMixins } from "../../../services/mixins"
import { FieldView } from "../../../../core/models/view"
import { FieldType } from "../../../../core/enums"
import { FieldEdit } from "./field-edit"
import { TypeSelectModal } from "./type-select-modal"
import { Button } from "../../button/button"
import AntDesign from 'react-native-vector-icons/AntDesign'


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

  // -------------- PARAMS --------------

  const [showTypeModal, setShowTypeModal] = useState(false)

  // -------------- METHODS --------------

  const addNewField = (type: FieldType) => {
    const newField = new FieldView()
    newField.type = type
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
      <View style={[commonStyles.SECTION_PADDING, commonStyles.CENTER_HORIZONTAL_VIEW, {
        justifyContent: 'space-between'
      }]}>
        <Text
          text={translate('common.custom_fields').toUpperCase()}
          style={{ fontSize: fontSize.small }}
        />

        <Button
          preset="link"
          onPress={() => {
            setShowTypeModal(true)
          }}
        >
          <AntDesign name="pluscircleo" size={20} color={color.primary} />
        </Button>
      </View>
      {/* Label end */}

      {/* Others */}
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
      </View>
      {/* Others end */}
    </View>
  )
})
