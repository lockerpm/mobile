import React, { useCallback, useState } from "react"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils/action-sheet/ActionSheet"
import { View } from "react-native"
import { Icon, IconTypes, Text } from "app/components/cores"
import { useHelper } from "app/services/hook"
import { useTheme } from "app/services/context"

export const AttachmentSelectIcon = () => {
  const { colors } = useTheme()
  const { translate } = useHelper()

  const [isAddOpen, setIsAddOpen] = useState(false)

  const openModal = useCallback(() => {
    setIsAddOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsAddOpen(false)
  }, [])

  const options: { id: string; icon: IconTypes; label: string; onPress: () => void }[] = [
    {
      id: "upload photo",
      icon: "image",
      label: translate("file_attachment.upload_photo"),
      onPress: () => {
        console.log("upload photo")
      },
    },
    {
      id: "upload file",
      icon: "file-arrow-up",
      label: translate("file_attachment.upload_file"),
      onPress: () => {
        console.log("upload file")
      },
    },
  ]

  return (
    <View>
      <Icon icon="plus" onPress={openModal} />
      <NewActionSheet
        isOpen={isAddOpen}
        onClose={closeModal}
        closeText={translate("common.cancel")}
        footer={
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
        }
      >
        {options.map((item) => (
          <NewActionSheetItem
            icon={item.icon}
            key={item.id}
            text={item.label}
            onPress={item.onPress}
          />
        ))}
      </NewActionSheet>
    </View>
  )
}
