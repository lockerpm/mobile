import React, { useCallback, useMemo, useState } from "react"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils/actionSheet/ActionSheet"
import { View } from "react-native"
import { Icon, IconTypes, Text } from "app/components/cores"
import { useAppLocale, useTheme } from "app/services/context"
import { AttachmentType, usePickAttachment } from "./usePickAttachment"
import { FilePreview } from "./item/FilePreview"
import { delay } from "app/utils/utils"
import { useNavigation } from "@react-navigation/native"
import { BrowseStackScreenProps } from "app/navigators"

interface Props {
  isFree: boolean
  addAttachment: (file: AttachmentType) => void
}
export const AttachmentSelectIcon = ({ isFree, addAttachment }: Props) => {
  const { colors } = useTheme()
  const navigation = useNavigation<BrowseStackScreenProps<"attachment">["navigation"]>()
  const { translate } = useAppLocale()
  const { pickFile, pickMedia } = usePickAttachment()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [localFile, setLocalFile] = useState<AttachmentType | null>(null)

  const openModal = useCallback(() => {
    if (isFree) {
      navigation.navigate("menuStack", {
        screen: "payment",
      })
      return
    }
    setIsAddOpen(true)
  }, [isFree])

  const closeModal = useCallback(() => {
    setLocalFile(null)
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
            setLocalFile(res)
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
            setLocalFile(res)
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
          !localFile ? (
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
        {localFile ? (
          <FilePreview
            item={localFile}
            setItem={setLocalFile}
            addAttachment={async (file: AttachmentType) => {
              closeModal()
              await delay(300)
              addAttachment(file)
            }}
          />
        ) : (
          <ActionContent />
        )}
      </NewActionSheet>
    </View>
  )
}
