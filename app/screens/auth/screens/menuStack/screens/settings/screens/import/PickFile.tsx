import { Platform, StyleSheet, View, ViewStyle } from "react-native"
import { keepLocalCopy, pick, types } from "@react-native-documents/picker"

import { Button, Text } from "app/components/cores"
import { SettingsItem } from "app/components/utils"
import { useCoreService } from "app/services/coreService"
import { useToast } from "app/services/utils"
import { FileData } from "app/static/types"

import { ThemedStyle } from "@/theme"
import { Logger } from "@/utils/logger"
import { useAppTheme } from "@/utils/useAppTheme"

import { FileFormatPickerModal } from "./FileFormatPickerModal"

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

      const [res] = await pick({
        type: [types.allFiles],
      })

      if (getFileName(res).endsWith(`.${targetExtension}`)) {
        let resolvedUri = res.uri

        if (Platform.OS === "android") {
          const [localCopy] = await keepLocalCopy({
            files: [{ uri: res.uri, fileName: res.name ?? "import-file" }],
            destination: "cachesDirectory",
          })
          if (localCopy.status !== "success" || !localCopy.localUri) {
            notifyTx("error", "error:something_went_wrong")
            return
          }
          resolvedUri = localCopy.localUri
        }

        setFile({
          name: res.name ?? "",
          uri: resolvedUri,
          type: res.type ?? "",
          size: res.size ?? 0,
        })
      } else {
        notifyTx("error", "import:pls_select_right_format", { format: targetExtension })
      }
    } catch (err) {
      Logger.error("Import pick file: " + err)
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
