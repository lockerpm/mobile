import React, { useCallback, useEffect, useState } from "react"
import { AttachmentType, usePickAttachment } from "../usePickAttachment"
import ProgressBar from "react-native-ui-lib/progressBar"
import { useTheme } from "app/services/context"
import { ViewStyle } from "react-native"

interface Props {
  item: AttachmentType
  uploadAttachment: (item: AttachmentType) => void
}

export const AttachmentProgress = ({ item, uploadAttachment }: Props) => {
  const { encryptAndUploadFile } = usePickAttachment()
  const { colors } = useTheme()
  const [progress, setProgress] = useState(0)

  const onUploadAttachment = useCallback(async () => {
    const res = await encryptAndUploadFile(item, setProgress)
    if (res) {
      uploadAttachment(res)
    }
  }, [])

  useEffect(() => {
    onUploadAttachment()
  }, [])

  return (
    <ProgressBar
      style={[
        container,
        {
          backgroundColor: progress === -1 ? colors.error : colors.block,
        },
      ]}
      progressColor={colors.primary}
      progress={progress * 100}
    />
  )
}

const container: ViewStyle = {
  height: 6,
  marginTop: 8,
  borderRadius: 4,
}
