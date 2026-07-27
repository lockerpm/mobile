import { useCallback, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { useNavigation } from "@react-navigation/native"

import { Icon, IconTypes, PressableIcon, Text } from "app/components/cores"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils"
import { BrowseScreenProps } from "app/navigators"

import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

import { AttachmentType, usePickAttachment } from "./usePickAttachment"

interface Props {
  isAddOpen: boolean
  setIsAddOpen: (val: boolean) => void
  setLocalFile: (val: AttachmentType | null) => void
  isFree: boolean
}
export const AttachmentSelectIcon = ({ isAddOpen, setIsAddOpen, isFree, setLocalFile }: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const navigation = useNavigation<BrowseScreenProps<"attachment">["navigation"]>()
  const { translate } = useAppLocale()
  const { pickFile, pickMedia, takeImage } = usePickAttachment()

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
    setIsAddOpen(false)
  }, [])

  // On iOS a native modal (the action sheet) cannot be dismissed while a new
  // view controller (the document / image picker) is being presented in the
  // same tick — iOS drops the presentation and the picker promise never
  // resolves. Close the sheet, then wait for its dismiss animation to finish
  // before presenting the picker.
  const closeModalAndWait = useCallback(async () => {
    closeModal()
    await new Promise((resolve) => setTimeout(resolve, 400))
  }, [closeModal])

  const options: { id: string; icon: IconTypes; label: string; onPress: () => void }[] = useMemo(
    () => [
      {
        id: "take photo",
        icon: "camera",
        label: translate("file_attachment:take_photo"),
        onPress: async () => {
          const res = await takeImage()
          closeModal()
          if (res) {
            setLocalFile(res)
          }
        },
      },
      {
        id: "upload photo",
        icon: "image",
        label: translate("file_attachment:upload_photo"),
        onPress: async () => {
          await closeModalAndWait()
          const res = await pickMedia()
          if (res) {
            setLocalFile(res)
          }
        },
      },
      {
        id: "upload file",
        icon: "file-arrow-up",
        label: translate("file_attachment:upload_file"),
        onPress: async () => {
          await closeModalAndWait()
          const res = await pickFile()
          if (res) {
            setLocalFile(res)
          }
        },
      },
    ],
    [closeModal, closeModalAndWait, setLocalFile]
  )

  return (
    <View>
      <PressableIcon icon="plus" onPress={openModal} />
      <NewActionSheet
        isOpen={isAddOpen}
        onClose={closeModal}
        closeTx={"common:cancel"}
        footer={
          <View style={[styles.container, { borderColor: colors.border }]}>
            <Icon icon={"info"} color={colors.warning} size={18} style={styles.mr8} />
            <Text tx="file_attachment:max_size" size="sm" color={colors.warning} />
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

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mr8: {
    marginRight: 8,
  },
})
