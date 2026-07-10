import { FC } from "react"
import { Platform, TextStyle } from "react-native"
import { observer } from "mobx-react-lite"
import RNFS from "react-native-fs"
import Share from "react-native-share"

import { Screen, Header, Text } from "app/components/cores"
import { MenuItemContainer, SettingsItem } from "app/components/utils"
import { SettingsScreenProps } from "app/navigators"
import { useCoreService } from "app/services/coreService"
import { useToast } from "app/services/utils"

import { Logger } from "@/utils/logger"
import { useAppTheme } from "@/utils/useAppTheme"

export const ExportScreen: FC<SettingsScreenProps<"export">> = observer(({ navigation }) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { notifyTx } = useToast()
  const { exportService } = useCoreService()

  // ----------------------- METHODS -----------------------

  const handleExport = async (format: "csv" | "json") => {
    try {
      const data = await exportService.getExport(format)
      const fileName = getFileName(null, format)
      const path = `${RNFS.CachesDirectoryPath}/${fileName}`

      await RNFS.writeFile(path, data, "utf8")

      // Hand the file to the OS share / "Save to Files" sheet so the user can pick a
      // visible location. Writing to the app sandbox alone is NOT visible in the iOS
      // Files app (that needs UIFileSharingEnabled), so we let the OS place it.
      await Share.open({
        title: fileName,
        filename: fileName,
        url: `file://${path}`,
        type: format === "csv" ? "text/csv" : "application/json",
        saveToFiles: Platform.OS === "ios",
      })

      notifyTx("success", "export:success")
    } catch (e) {
      const message = String((e as { message?: string })?.message ?? e)
      // react-native-share rejects when the user dismisses the sheet — that's not an error
      if (/cancel|did not share/i.test(message)) {
        return
      }
      Logger.error("Export file: " + message)
      notifyTx("error", "error:something_went_wrong")
    }
  }

  const getFileName = (prefix: string | null = null, extension = "csv") => {
    const now = new Date()
    const dateString =
      now.getFullYear() +
      "" +
      padNumber(now.getMonth() + 1, 2) +
      "" +
      padNumber(now.getDate(), 2) +
      padNumber(now.getHours(), 2) +
      "" +
      padNumber(now.getMinutes(), 2) +
      padNumber(now.getSeconds(), 2)

    return "cystack" + (prefix ? "_" + prefix : "") + "_export_" + dateString + "." + extension
  }

  const padNumber = (num: number, width: number, padCharacter = "0") => {
    const numString = num.toString()
    return numString.length >= width
      ? numString
      : new Array(width - numString.length + 1).join(padCharacter) + numString
  }

  // ----------------------- RENDER -----------------------

  return (
    <Screen
      header={
        <Header leftIcon="arrow-left" onLeftPress={navigation.goBack} titleTx={"settings:export"} />
      }
      backgroundColor={colors.block}
      contentContainerStyle={$container}
    >
      <MenuItemContainer>
        <SettingsItem
          text={"CSV"}
          onPress={() => {
            handleExport("csv")
          }}
        />
        <SettingsItem
          text={"JSON"}
          onPress={() => {
            handleExport("json")
          }}
        />
      </MenuItemContainer>
      <Text tx={"settings:export_note"} preset="label" size="xs" style={$exportNote} />
    </Screen>
  )
})

const $container = {
  paddingHorizontal: 16,
}

const $exportNote: TextStyle = {
  marginTop: 16,
}
