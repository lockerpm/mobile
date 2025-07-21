import { FC } from "react"
import { observer } from "mobx-react-lite"
import { useCoreService } from "app/services/coreService"

import { Screen, Header } from "app/components/cores"
import { MenuItemContainer, SettingsItem } from "app/components/utils"
import { SettingsScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { useAppTheme } from "@/utils/useAppTheme"

export const ExportScreen: FC<SettingsScreenProps<"export">> = observer(({ navigation }) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { notifyTx } = useToast()
  const { platformUtilsService, exportService } = useCoreService()

  // ----------------------- PARAMS -----------------------

  // ----------------------- METHODS -----------------------

  const handleExport = async (format: "csv" | "json") => {
    const data = await exportService.getExport(format)
    const isSuccess = await downloadFile(data, format)
    if (isSuccess) {
      notifyTx("success", "export:success")
    } else {
      notifyTx("error", "error:something_went_wrong")
    }
  }

  const downloadFile = (csv: any, format: "csv" | "json") => {
    const fileName = getFileName(null, format)
    return platformUtilsService.saveFile(csv, "utf8", fileName)
  }

  const getFileName = (prefix = null, extension = "csv") => {
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

  // ----------------------- EFFECT -----------------------

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
    </Screen>
  )
})

const $container = {
  paddingHorizontal: 16,
}
