import { FC, useState } from "react"
import { View, ViewStyle } from "react-native"
import JSZip from "jszip"
import { observer } from "mobx-react-lite"
import RNFS from "react-native-fs"

import { Screen, Header } from "app/components/cores"
import { useStores } from "app/models"
import { SettingsScreenProps } from "app/navigators"
import { useCoreService } from "app/services/coreService"
import { useCipherData } from "app/services/hook"
import { useToast } from "app/services/utils"
import { FileData } from "app/static/types"
import { CipherType } from "core/enums"
import { Utils } from "core/misc/utils"

import { ThemedStyle } from "@/theme"
import { Logger } from "@/utils/logger"
import { useAppTheme } from "@/utils/useAppTheme"

import { ImportProgress } from "./ImportProgress"
import { ImportResult } from "./ImportResult"
import { PickFile } from "./PickFile"

const DOMParser = require("react-native-html-parser").DOMParser

const fileData = {
  name: "",
  uri: "",
  type: "",
  size: 0,
}

export const ImportScreen: FC<SettingsScreenProps<"import">> = observer(({ navigation }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { notifyTx } = useToast()
  const { importCiphers } = useCipherData()
  const { importService } = useCoreService()
  const { user } = useStores()

  // -------------------- PARAMS --------------------

  const isFreeAccount = user.isFreePlan

  const [step, setStep] = useState(0)
  const [format, setFormat] = useState("lockerjson")
  const [file, setFile] = useState<FileData>(fileData)
  const [importedCount, setImportedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isLimited, setIsLimited] = useState(false)

  // -------------------- COMPUTED --------------------

  // -------------------- METHODS --------------------

  const handleImport = async () => {
    setStep(1)

    try {
      const importer = importService.getImporter(format)

      let content: string

      if (format === "1password1pux") {
        const b64 = await RNFS.readFile(file.uri, "base64")
        content = await extract1PuxContent(b64)
      } else {
        content = await RNFS.readFile(file.uri)
      }

      if (format === "lastpasscsv" && file.type === "text/html") {
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, "text/html")
        const pre = doc.querySelector("pre")
        if (pre != null) {
          content = pre.textContent
        } else {
          notifyTx("error", "import:invalid_data_format")
          setFile(fileData)
          // uiStore.setIsImporting(false)
          return
        }
      }
      let importResult
      try {
        importResult = await importer.parse(content)
      } catch (e) {
        Logger.error("Import parse error: " + e)
        notifyTx("error", "import:invalid_data_format")
        setFile(fileData)
        setStep(0)
        return
      }
      if (importResult.success) {
        if (importResult.folders.length === 0 && importResult.ciphers.length === 0) {
          notifyTx("error", "import:no_data")
          setFile(fileData)
          setStep(0)
          return
        } else if (importResult.ciphers.length > 0) {
          const halfway = Math.floor(importResult.ciphers.length / 2)
          const last = importResult.ciphers.length - 1
          if (
            badData(importResult.ciphers[0]) &&
            badData(importResult.ciphers[halfway]) &&
            badData(importResult.ciphers[last])
          ) {
            notifyTx("error", "import:invalid_data_format")
            setFile(fileData)
            setStep(0)
            return
          }
        }
        try {
          await importCiphers({
            importResult,
            setImportedCount,
            setTotalCount,
            setIsLimited,
            isFreeAccount,
          })
          setFile(fileData)
          setStep(2)
          return
        } catch (error) {
          Logger.error("Import error: " + error)
          notifyTx("error", "import:invalid_data_format")
        }
      } else {
        notifyTx("error", "import:invalid_data_format")
      }
    } catch (e) {
      Logger.error("Handle import: " + e)
      notifyTx("error", "error:something_went_wrong")
    }
  }

  const badData = (c: any) => {
    return (
      (c.name == null || c.name === "--") &&
      c.type === CipherType.Login &&
      c.login != null &&
      Utils.isNullOrWhitespace(c.login.password)
    )
  }

  // 1pux
  const extract1PuxContent = (fileContent: string): Promise<string> => {
    return new JSZip()
      .loadAsync(fileContent, { base64: true })
      .then((zip) => {
        const exportFile = zip.file("export.data")
        if (exportFile) {
          return exportFile.async("string")
        } else {
          return ""
        }
      })
      .then(
        function success(content) {
          return content
        },
        function error(_e) {
          return ""
        }
      )
  }

  // -------------------- RENDER --------------------

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      header={
        <Header leftIcon="arrow-left" onLeftPress={navigation.goBack} titleTx={"settings:import"} />
      }
      backgroundColor={colors.block}
      contentContainerStyle={$container}
    >
      <View style={themed($contentContainer)}>
        {step === 0 && (
          <PickFile
            format={format}
            setFormat={setFormat}
            file={file}
            setFile={setFile}
            handleImport={handleImport}
          />
        )}
        {step === 1 && (
          <ImportProgress imported={importedCount} total={totalCount} file={file.name} />
        )}

        {step === 2 && (
          <ImportResult
            imported={importedCount}
            total={totalCount}
            isLimited={isLimited}
            setIsLimited={setIsLimited}
          />
        )}
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: 16,
}

const $contentContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.background,
  paddingVertical: 20,
  marginTop: 16,
  paddingHorizontal: 20,
  borderRadius: 12,
})
