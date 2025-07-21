import { useState } from "react"
import { View, ViewStyle } from "react-native"
import { Text, BottomModal } from "app/components/cores"
import { SettingsItem } from "app/components/utils"
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
        textTx={"import:format"}
        RightAccessory={<Text text={formats.find((i) => i.value === format)?.label} />}
      />
      <BottomModal
        isOpen={isOpen}
        onClose={onClose}
        tx={"import:format"}
        contentContainer={$content}
      >
        <FormatList format={format} formats={formats} setFormat={handleSelect} />
      </BottomModal>
    </View>
  )
}

const $content: ViewStyle = {
  padding: 0,
  maxHeight: "auto",
  height: 600,
  paddingHorizontal: 0,
}
