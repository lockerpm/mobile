import React, { memo, useCallback, useMemo, useState } from "react"
import { AttachmentType } from "../usePickAttachment"
import { Keyboard, View, ViewStyle } from "react-native"
import { ThemedColors } from "app/theme"
import { useAppLocale, useTheme } from "app/services/context"
import { Icon, Text, TextInput, Button } from "app/components/cores"
import { convertBytes } from "./utils"

interface Props {
  item: AttachmentType
  setItem: (val: AttachmentType) => void
  addAttachment: (file: AttachmentType) => void
}

export const FilePreview = memo(({ item, addAttachment, setItem }: Props) => {
  const { colors } = useTheme()
  const { translate } = useAppLocale()
  const $styles = useMemo(() => styles(colors), [colors])

  const [name, setName] = useState(item.fileName)

  const changeName = useCallback((val: string) => {
    setName(val.trim())
  }, [])
  const onEditDone = () => {
    if (name !== item.fileName) {
      setItem({ ...item, fileName: name })
    }
    Keyboard.dismiss()
  }

  const onAdd = () => {
    onEditDone()
    addAttachment({ ...item, fileName: name })
  }

  return (
    <View style={container}>
      <View style={$styles.constainer}>
        <Icon icon="file-text" size={40} color={colors.primary} />
        <View
          style={{
            flexGrow: 1,
            flexShrink: 1,
            paddingHorizontal: 12,
          }}
        >
          <TextInput
            autoFocus
            animated
            label={translate("common.name")}
            value={name}
            multiline
            returnKeyType="done"
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Enter") {
                onEditDone()
              }
            }}
            onChangeText={changeName}
            inputWrapperStyle={{
              minHeight: 48,
              flexGrow: 1,
              flexShrink: 1,
            }}
          />
          <Text preset="label" text={convertBytes(item.size)} size="base" />
        </View>
      </View>
      <Button preset="teriatary" text={translate("common.add")} onPress={onAdd} />
    </View>
  )
})

const row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const styles = (colors: ThemedColors) => ({
  constainer: {
    ...row,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  } as ViewStyle,
})

const container: ViewStyle = {
  padding: 16,
}
