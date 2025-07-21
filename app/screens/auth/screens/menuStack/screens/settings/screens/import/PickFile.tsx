import { StyleSheet, View, ViewStyle } from "react-native"
import DocumentPicker from "react-native-document-picker"
import { useCoreService } from "app/services/coreService"
import { Button, Text } from "app/components/cores"
import { SettingsItem } from "app/components/utils"
import { FileData } from "app/static/types"
import { FileFormatPickerModal } from "./FileFormatPickerModal"
import { useToast } from "app/services/utils"
import { Logger } from "@/utils/logger"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"

interface Props {
  format: string
  setFormat: (val: string) => void
  file: FileData
  setFile: (val: FileData) => void
  handleImport: () => Promise<void>
}

const getFileName = (file: any) => {
  if (file.name) {
    return file.name
  }
  const uriComponents = file?.uri?.split("/")
  return uriComponents[uriComponents.length - 1]
}

export const PickFile = ({ format, setFormat, file, setFile, handleImport }: Props) => {
  const { themed } = useAppTheme()
  const { importService } = useCoreService()
  const { notifyTx } = useToast()

  // -------------------- COMPUTED --------------------

  const formats = [
    ...importService.featuredImportOptions,
    ...(importService.regularImportOptions || []).sort((a, b) => {
      if (a.name == null && b.name != null) {
        return -1
      }
      if (a.name != null && b.name == null) {
        return 1
      }
      if (a.name == null && b.name == null) {
        return 0
      }
      return a.name.localeCompare(b.name)
    }),
  ].map((i) => ({
    label: i.name,
    value: i.id,
  }))

  // -------------------- METHODS --------------------

  const pickFile = async () => {
    try {
      const targetFormat = formats.find((i) => i.value === format)
      const targetExtension = targetFormat?.label?.split(" (")[1]?.split(")")[0]

      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      })

      if (getFileName(res).endsWith(`.${targetExtension}`)) {
        setFile({
          name: res.name ?? "",
          uri: res.uri,
          type: res.type ?? "",
          size: res.size ?? 0,
        })
      } else {
        notifyTx("error", "import:pls_select_right_format", { format: targetExtension })
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        Logger.error("Import pick file: " + err)
        notifyTx("error", "error:something_went_wrong")
      }
    }
  }

  return (
    <View>
      <FileFormatPickerModal format={format} formats={formats} setFormat={setFormat} />

      <SettingsItem
        textTx={"import:file"}
        onPress={pickFile}
        RightAccessory={
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            text={getFileName(file)}
            style={styles.text}
          />
        }
        containerStyle={themed($border)}
      />
      <Button
        disabled={!file.uri}
        tx={"settings:import"}
        onPress={handleImport}
        style={styles.button}
      />
    </View>
  )
}

const $border: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderTopColor: colors.border,
  borderTopWidth: 1,
})

const styles = StyleSheet.create({
  button: {
    marginBottom: 10,
    marginTop: 20,
  },

  text: {
    maxWidth: 150,
  },
})
