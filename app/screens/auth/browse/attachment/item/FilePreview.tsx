import React, { memo, useCallback, useMemo, useState } from "react"
import { AttachmentType } from "../usePickAttachment"
import { Keyboard, View, ViewStyle } from "react-native"
import { ThemedColors } from "app/theme"
import { useTheme } from "app/services/context"
import { Icon, Text, TextInput, Button } from "app/components/cores"
import { convertBytes } from "./utils"
import { useHelper } from "app/services/hook"

interface Props {
  item: AttachmentType
  setItem: (val: AttachmentType) => void
  addAttachment: () => void
}

export const FilePreview = memo(({ item, addAttachment, setItem }: Props) => {
  const { colors } = useTheme()
  const { translate } = useHelper()
  const $styles = useMemo(() => styles(colors), [colors])

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(item.name)

  const onEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const onEditDone = useCallback(() => {
    if (name !== item.name) {
      setItem({ ...item, name })
    }
    setIsEditing(false)
    Keyboard.dismiss()
  }, [])

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
          {!isEditing ? (
            <Text text={item.name} numberOfLines={3} />
          ) : (
            <TextInput
              value={name}
              onChangeText={setName}
              onSubmitEditing={onEditDone}
              RightAccessory={() => <Text text={name.split(".")[1]} />}
            />
          )}
          <Text preset="label" text={convertBytes(item.size)} size="base" />
        </View>
        <View style={row}>
          {!isEditing ? (
            <Icon icon="edit" containerStyle={iconPadding} onPress={onEdit} />
          ) : (
            <Icon
              icon="check"
              color={colors.success}
              containerStyle={iconPadding}
              onPress={onEditDone}
            />
          )}
        </View>
      </View>
      <Button
        disabled={isEditing}
        preset="teriatary"
        text={translate("common.add")}
        onPress={addAttachment}
      />
    </View>
  )
})

const row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const iconPadding: ViewStyle = {
  padding: 8,
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
