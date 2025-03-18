import React, { memo, useCallback, useRef, useState } from "react"
import { AttachmentType } from "../usePickAttachment"
import { View, ViewStyle, Image, ImageStyle, Keyboard, TextInput } from "react-native"
import { useTheme } from "app/services/context"
import { Button, Icon, Text } from "app/components/cores"
import { convertBytes } from "./utils"
import { useHelper } from "app/services/hook"

interface Props {
  item: AttachmentType
  setItem: (val: AttachmentType) => void
  addAttachment: () => void
}

export const ImagePreview = memo(({ item, setItem, addAttachment }: Props) => {
  const { colors } = useTheme()
  const { translate } = useHelper()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(item.name)

  const inputRef = useRef(null)

  const onEdit = useCallback(() => {
    setIsEditing(true)
    inputRef.current?.focus()
  }, [])

  const onEditDone = useCallback(() => {
    if (name !== item.name) {
      setItem({ ...item, name })
    }
    setIsEditing(false)
    Keyboard.dismiss()
  }, [name])

  return (
    <View style={{ padding: 12 }}>
      <Image source={{ uri: "file://" + item.uri }} style={image} resizeMode="cover" />
      <View style={row}>
        <View
          style={{
            flexGrow: 1,
            flexShrink: 1,
          }}
        >
          <TextInput
            editable={isEditing}
            ref={inputRef}
            value={name}
            multiline
            onChangeText={setName}
            onSubmitEditing={onEditDone}
          />
        </View>
        {!isEditing ? (
          <Icon icon="edit" size={24} containerStyle={iconPadding} onPress={onEdit} />
        ) : (
          <Icon
            icon="check"
            color={colors.success}
            containerStyle={iconPadding}
            onPress={onEditDone}
          />
        )}
      </View>
      <Text preset="label" text={convertBytes(item.size)} size="base" />

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

const image: ImageStyle = {
  width: 290,
  height: 290,
  alignSelf: "center",
}

const iconPadding: ViewStyle = {
  padding: 8,
}
