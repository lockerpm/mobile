import React, { useCallback, useMemo, useState } from "react"
import { AttachmentType } from "../usePickAttachment"
import { View, ViewStyle } from "react-native"
import { ThemedColors } from "app/theme"
import { useTheme } from "app/services/context"
import { Icon, Text } from "app/components/cores"
import { convertBytes } from "./utils"
import { AttachmentProgress } from "./AttachmentProgress"

interface Props {
  item: AttachmentType
}

export const Attachment = ({ item }: Props) => {
  const { colors } = useTheme()
  const $styles = useMemo(() => styles(colors), [colors])

  const [isLoading, setIsLoading] = useState(!item.key)
  const [attachment, setAttachment] = useState(item)

  const uploadAttachment = useCallback((attachment: AttachmentType) => {
    if (attachment.key) {
      setAttachment(attachment)
      setIsLoading(false)
    }
  }, [])

  const onDownloadAttachment = useCallback(() => {
    // download attachment
  }, [])

  const onDeleteAttachment = useCallback(() => {
    // delete attachment
  }, [])

  return (
    <View style={$styles.constainer}>
      <View style={row}>
        <Icon icon="file-text" size={40} color={isLoading ? colors.disable : colors.primary} />
        <View
          style={{
            flexGrow: 1,
            flexShrink: 1,
            paddingHorizontal: 12,
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          <Text text={attachment.fileName} numberOfLines={3} />
          <Text preset="label" text={convertBytes(attachment.size)} size="base" />
        </View>
        {!isLoading && (
          <View style={row}>
            <Icon
              icon="download-simple"
              size={24}
              containerStyle={iconPadding}
              onPress={onDownloadAttachment}
            />
            <Icon
              icon="trash"
              size={24}
              color={colors.error}
              containerStyle={iconPadding}
              onPress={onDeleteAttachment}
            />
          </View>
        )}
      </View>
      {!attachment.key && <AttachmentProgress item={item} uploadAttachment={uploadAttachment} />}
    </View>
  )
}

const row: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const iconPadding: ViewStyle = {
  padding: 8,
}

const styles = (colors: ThemedColors) => ({
  constainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  } as ViewStyle,
})
