import React, { useState } from "react"
import { Modal } from "../../modal/modal"
import { DropdownPicker } from "../../dropdown-picker/dropdown-picker"
import { Button } from "../../button/button"
import { FieldType } from "../../../../core/enums"


interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (val: FieldType) => void
}

export const TypeSelectModal = (props: Props) => {
  const { isOpen, onClose, onSelect } = props
  
  // --------------- PARAMS ----------------

  const [type, setType] = useState(FieldType.Text)

  // --------------- COMPUTED ----------------

  const types = [
    {
      value: FieldType.Boolean,
      label: 'Boolean'
    },
    {
      value: FieldType.Hidden,
      label: 'Password'
    },
    {
      value: FieldType.Text,
      label: 'Text'
    }
  ]

  // --------------- METHODS ----------------

  const handleSelect = async () => {
    onClose()
    onSelect(type)
  }

  // --------------- EFFECT ----------------

  // --------------- RENDER ----------------

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={'What type of custom field do you want to add?'}
    >
      <DropdownPicker
        placeholder={'Type'}
        value={type}
        items={types}
        setValue={setType}
        setItems={() => {}}
      />

      <Button
        text={'Ok'}
        onPress={handleSelect}
        style={{
          width: '100%',
          marginTop: 60
        }}
      />
    </Modal>
  )
}
