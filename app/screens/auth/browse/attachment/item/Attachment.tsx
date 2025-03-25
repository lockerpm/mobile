import React, { useCallback, useMemo, useState } from "react"
import { AttachmentType } from "../usePickAttachment"
import { ActivityIndicator, Alert, View, ViewStyle } from "react-native"
import { ThemedColors } from "app/theme"
import { useTheme } from "app/services/context"
import { Icon, Text } from "app/components/cores"
import { convertBytes } from "./utils"
import { AttachmentProgress } from "./AttachmentProgress"
import { useAttachmentActions } from "./useAttachmentActions"
import { useHelper } from "app/services/hook"

interface Props {
  item: AttachmentType
  updateAttachments: (attachment: AttachmentType, isDelete: boolean) => void
  isShared?: boolean
}

export const Attachment = ({ item, updateAttachments, isShared }: Props) => {
  const { colors } = useTheme()
  const { translate } = useHelper()

  const $styles = useMemo(() => styles(colors), [colors])

  const [isLoading, setIsLoading] = useState(!item.key)
  const [attachment, setAttachment] = useState(item)

  const { onDownloadAttachment, onDeleteAttachment } = useAttachmentActions(
    attachment,
    setIsLoading,
    updateAttachments,
  )

  /**
   * Call back when user upload successfully attachment
   */
  const uploadAttachment = useCallback((attachment: AttachmentType) => {
    if (attachment.key) {
      setAttachment(attachment)
      setIsLoading(false)
      updateAttachments(attachment, false)
    }
  }, [])

  const deleteAlert = useCallback(() => {
    Alert.alert(
      translate("file_attachment.delete_btn"),
      "",
      [
        {
          text: translate("common.cancel"),
          style: "cancel",
        },
        {
          text: translate("common.delete"),
          style: "destructive",
          onPress: onDeleteAttachment,
        },
      ],
      { cancelable: true },
    )
  }, [onDeleteAttachment])

  return (
    <View style={$styles.constainer}>
      <View style={row}>
        <Icon icon="file-text" size={40} color={isLoading ? colors.disable : colors.primary} />
        <View
          style={{
            flexGrow: 1,
            flexShrink: 1,
            paddingHorizontal: 12,
            opacity: isLoading && !attachment.key ? 0.5 : 1,
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
            {!isShared && (
              <Icon
                icon="trash"
                size={24}
                color={colors.error}
                containerStyle={iconPadding}
                onPress={deleteAlert}
              />
            )}
          </View>
        )}
        {isLoading && !!attachment.key && (
          <ActivityIndicator size={"small"} color={colors.primary} />
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
