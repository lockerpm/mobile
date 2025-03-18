import React, { useCallback, useMemo, useState } from "react"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils/action-sheet/ActionSheet"
import { View } from "react-native"
import { Icon, IconTypes, Text } from "app/components/cores"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"
import { AttachmentType, usePickAttachment } from "./usePickAttachment"
import { AttachmentPreview } from "./item/AttachmentPreview"

interface Props {
  addAttachment: (newFile: AttachmentType) => void
}
export const AttachmentSelectIcon = ({ addAttachment }: Props) => {
  const { colors } = useTheme()
  const { translate } = useHelper()
  const { pickFile, pickMedia } = usePickAttachment()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [attachment, setAttachment] = useState<AttachmentType | null>(null)

  const openModal = useCallback(() => {
    setIsAddOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setAttachment(null)
    setIsAddOpen(false)
  }, [])

  const options: { id: string; icon: IconTypes; label: string; onPress: () => void }[] = useMemo(
    () => [
      {
        id: "upload photo",
        icon: "image",
        label: translate("file_attachment.upload_photo"),
        onPress: async () => {
          const res = await pickMedia()
          if (res) {
            setAttachment(res)
          } else {
            closeModal()
          }
        },
      },
      {
        id: "upload file",
        icon: "file-arrow-up",
        label: translate("file_attachment.upload_file"),
        onPress: async () => {
          const res = await pickFile()
          if (res) {
            setAttachment(res)
          } else {
            closeModal()
          }
        },
      },
    ],
    [],
  )

  const ActionContent = useCallback(() => {
    return options.map((item) => (
      <NewActionSheetItem icon={item.icon} key={item.id} text={item.label} onPress={item.onPress} />
    ))
  }, [options])

  return (
    <View>
      <Icon icon="plus" onPress={openModal} />
      <NewActionSheet
        isOpen={isAddOpen}
        onClose={closeModal}
        closeText={translate("common.cancel")}
        footer={
          !attachment ? (
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Icon
                icon={"info"}
                color={colors.warning}
                size={18}
                style={{
                  marginRight: 8,
                }}
              />
              <Text tx="file_attachment.max_size" size="base" color={colors.warning} />
            </View>
          ) : undefined
        }
      >
        {attachment ? (
          <AttachmentPreview
            item={attachment}
            setItem={setAttachment}
            addAttachment={() => {
              addAttachment(attachment)
              closeModal()
            }}
          />
        ) : (
          <ActionContent />
        )}
      </NewActionSheet>
    </View>
  )
}
