import React from "react"
import { View } from "react-native"
import DocumentPicker from "react-native-document-picker"
import { useHelper } from "app/services/hook"
import { useCoreService } from "app/services/coreService"
import { useStores } from "app/models"
import { Logger } from "app/utils/utils"
import { Button, Text } from "app/components/cores"
import { SettingsItem, Select } from "app/components/utils"
import { FileData } from "app/static/types"
import { useTheme } from "app/services/context"

interface Props {
  format: any
  setFormat: (val: string) => void
  file: FileData
  setFile: (val: FileData) => void
  handleImport: () => Promise<void>
}

export const ImportPickFile = (props: Props) => {
  const { colors } = useTheme()
  const { notify, translate } = useHelper()
  const { importService } = useCoreService()
  const { uiStore } = useStores()

  const { format, setFormat, file, setFile, handleImport } = props

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

  const getFileName = (file) => {
    if (file.name) {
      return file.name
    }
    const uriComponents = file?.uri?.split("/")
    return uriComponents[uriComponents.length - 1]
  }

  const pickFile = async () => {
    try {
      // Mark as overlay task to prevent lock when return
      uiStore.setIsPerformOverlayTask(true)

      const targetFormat = formats.find((i) => i.value === format)
      const targetExtension = targetFormat.label?.split(" (")[1]?.split(")")[0]

      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      })

      if (getFileName(res).endsWith(`.${targetExtension}`)) {
        setFile(res)
      } else {
        notify("error", translate("import.pls_select_right_format", { format: targetExtension }))
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        Logger.error("Import pick file: " + err)
        notify("error", translate("error.something_went_wrong"))
      }
    }
  }

  return (
    <View>
      <Select
        showSearch
        value={format}
        onChange={(val: string) => setFormat(val)}
        options={formats}
        title={translate("import.format")}
        renderSelected={({ label }) => (
          <SettingsItem name={translate("import.format")} RightAccessory={<Text text={label} />} />
        )}
      />

      <SettingsItem
        name={translate("import.file")}
        onPress={pickFile}
        RightAccessory={
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            text={getFileName(file)}
            style={{
              maxWidth: 150,
            }}
          />
        }
        containerStyle={{
          borderTopColor: colors.border,
          borderTopWidth: 1.5,
        }}
      />
      <Button
        disabled={!file.uri}
        text={translate("settings.import")}
        onPress={() => handleImport()}
        style={{
          marginTop: 20,
          marginBottom: 10,
        }}
      />
    </View>
  )
}
