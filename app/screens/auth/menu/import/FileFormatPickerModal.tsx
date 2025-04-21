import React, { useState } from "react"
import { View } from "react-native"
import Modal from "react-native-modal"
import { Text, Screen, Header } from "app/components/cores"
import { SettingsItem } from "app/components/utils"
import { useHelper } from "app/services/hook"
import { FormatList } from "./FormatList"

interface Props {
  format: string
  formats: {
    label: string
    value: string
  }[]
  setFormat: (val: string) => void
}

export const FileFormatPickerModal = ({ format, setFormat, formats }: Props) => {
  const { translate } = useHelper()
  const [isOpen, setIsOpen] = useState(false)

  const onClose = () => setIsOpen(false)

  const handleSelect = (code: string) => {
    setFormat(code)
    onClose()
  }

  return (
    <View>
      <SettingsItem
        onPress={() => setIsOpen(true)}
        name={translate("import.format")}
        RightAccessory={<Text text={formats.find((i) => i.value === format).label} />}
      />
      <Modal
        animationIn="slideInRight"
        animationOut="slideOutRight"
        isVisible={isOpen}
        onBackdropPress={onClose}
        style={{
          margin: 0,
        }}
      >
        <Screen
          header={
            <Header
              leftIcon="arrow-left"
              onLeftPress={onClose}
              title={translate("import.format")}
            />
          }
          contentContainerStyle={{
            flex: 1,
          }}
        >
          <FormatList format={format} formats={formats} setFormat={handleSelect} />
        </Screen>
      </Modal>
    </View>
  )
}
