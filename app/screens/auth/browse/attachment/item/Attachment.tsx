import React, { useCallback, useEffect, useMemo, useState } from "react"
import { AttachmentType, UploadStatus, usePickAttachment } from "../usePickAttachment"
import { ActivityIndicator, Alert, View, ViewStyle } from "react-native"
import { ThemedColors } from "app/theme"
import { useTheme } from "app/services/context"
import { Icon, Text } from "app/components/cores"
import { convertBytes } from "./utils"
import { useAttachmentActions } from "./useAttachmentActions"
import { useHelper } from "app/services/hook"

interface Props {
  isFree: boolean
  item: AttachmentType
  updateAttachments: (attachment: AttachmentType, isDelete: boolean) => void
  isShared?: boolean
}

export const Attachment = ({ item, updateAttachments, isFree, isShared }: Props) => {
  const { colors } = useTheme()
  const { translate } = useHelper()
  const { encryptAndUploadFile } = usePickAttachment()

  const $styles = useMemo(() => styles(colors), [colors])

  const [isLoading, setIsLoading] = useState(!item.key)
  const [attachment, setAttachment] = useState(item)
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.NONE)

  const { onDownloadAttachment, onDeleteAttachment } = useAttachmentActions(
    attachment,
    setIsLoading,
    updateAttachments,
  )

  /**
   * Call back when user upload successfully attachment
   */
  const uploadedAttachment = useCallback((attachment: AttachmentType) => {
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

  const onUploadAttachment = useCallback(async () => {
    if (!attachment.key) {
      const res = await encryptAndUploadFile(item, setStatus)
      if (res) {
        uploadedAttachment(res)
      }
    }
  }, [])

  useEffect(() => {
    onUploadAttachment()
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
            opacity: isLoading && !attachment.key ? 0.5 : 1,
          }}
        >
          <Text text={attachment.fileName} numberOfLines={3} />
          <Text preset="label" text={convertBytes(attachment.size)} size="base" />
        </View>
        {!isLoading && (
          <View style={row}>
            {(!isFree || isShared) && (
              <Icon
                icon="download-simple"
                size={24}
                containerStyle={iconPadding}
                onPress={onDownloadAttachment}
              />
            )}
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
        {isLoading && <ActivityIndicator size={"small"} color={colors.primary} />}
      </View>
      {status !== UploadStatus.NONE && (
        <Text
          preset="label"
          text={
            status === UploadStatus.ENCRYPTING
              ? translate("file_attachment.encrypting")
              : translate("file_attachment.uploading")
          }
          size="base"
          style={{ marginTop: 8 }}
        />
      )}
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
