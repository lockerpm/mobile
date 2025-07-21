import { memo, useCallback, useState } from "react"
import { AttachmentType } from "../usePickAttachment"
import { Keyboard, View, ViewStyle } from "react-native"
import { Icon, Text, TextInput, Button, PressableIcon } from "app/components/cores"
import { convertBytes } from "./utils"
import { useAppTheme } from "@/utils/useAppTheme"

interface Props {
  item: AttachmentType
  setItem: (val: AttachmentType | null) => void
  addAttachment: (file: AttachmentType) => void
}

export const FilePreview = memo(({ item, addAttachment, setItem }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()

  const [name, setName] = useState(item.fileName)

  const changeName = useCallback((val: string) => {
    setName(val.trim())
  }, [])

  const onAdd = () => {
    addAttachment({ ...item, fileName: name })
    setItem(null)
    Keyboard.dismiss()
  }

  return (
    <View style={container}>
      <View style={row}>
        <Icon icon="file-text" size={40} color={colors.primary} />
        <View style={inputContainer}>
          <TextInput
            autoFocus
            animated
            labelTx={"common:name"}
            value={name}
            multiline
            returnKeyType="done"
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Enter") {
                onAdd()
              }
            }}
            onChangeText={changeName}
            inputWrapperStyle={inputWrapper}
          />
          <Text preset="label" text={convertBytes(item.size)} size="sm" />
        </View>
        <PressableIcon icon="trash" color={colors.error} onPress={() => setItem(null)} />
      </View>
      <Button preset="secondary" tx={"common:add"} onPress={onAdd} style={button} />
    </View>
  )
})

FilePreview.displayName = "FilePreview"

const row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const button: ViewStyle = {
  marginVertical: 16,
  width: 150,
  alignSelf: "center",
}

const inputWrapper: ViewStyle = {
  minHeight: 48,
  flexGrow: 1,
  flexShrink: 1,
}

const inputContainer: ViewStyle = {
  flexGrow: 1,
  flexShrink: 1,
  paddingHorizontal: 12,
}

const container: ViewStyle = {
  paddingHorizontal: 16,
}
