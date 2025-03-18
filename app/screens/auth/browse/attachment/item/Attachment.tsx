import React, { memo, useMemo } from "react"
import { AttachmentType } from "../usePickAttachment"
import { View, ViewStyle } from "react-native"
import { ThemedColors } from "app/theme"
import { useTheme } from "app/services/context"
import { Icon, Text } from "app/components/cores"
import { convertBytes } from "./utils"

interface Props {
  item: AttachmentType
}

export const Attachment = memo(({ item }: Props) => {
  const { colors } = useTheme()
  const $styles = useMemo(() => styles(colors), [colors])

  return (
    <View style={$styles.constainer}>
      <Icon icon="file-text" size={40} color={colors.primary} />
      <View
        style={{
          flexGrow: 1,
          flexShrink: 1,
          paddingHorizontal: 12,
        }}
      >
        <Text text={item.name} numberOfLines={3} />
        <Text preset="label" text={convertBytes(item.size)} size="base" />
      </View>
      <View style={row}>
        <Icon icon="download-simple" size={24} containerStyle={iconPadding} />
        <Icon icon="trash" size={24} color={colors.error} containerStyle={iconPadding} />
      </View>
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
