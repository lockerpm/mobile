import React, { useMemo, useState } from "react"
import { SettingsItem } from "app/components/utils"
import { NewActionSheet, NewActionSheetItem } from "app/components/utils/action-sheet/ActionSheet"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Text } from "app/components/cores"
import { useTheme } from "app/services/context"
import { useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { AppTimeoutType } from "app/static/types"

export const SetTimeOutItem = observer(() => {
  const { colors } = useTheme()
  const { user } = useStores()
  const { translate } = useHelper()

  const [isTimeOutSelect, setIsTimeOutSelect] = useState(false)

  const options = useMemo(
    () => [
      {
        label: `30 ${translate("common.seconds")}`,
        value: 30 * 1000,
      },
      {
        label: `1 ${translate("common.minute")}`,
        value: 1 * 60 * 1000,
      },
      {
        label: `3 ${translate("common.minutes")}`,
        value: 3 * 60 * 1000,
      },
      {
        label: translate("settings.on_screen_off"),
        value: AppTimeoutType.SCREEN_OFF,
      },
      {
        label: translate("settings.on_app_close"),
        value: AppTimeoutType.APP_CLOSE,
      },
    ],
    [],
  )

  return (
    <View>
      <SettingsItem
        textTx={"settings.timeout"}
        onPress={() => setIsTimeOutSelect(true)}
        RightAccessory={<Text text={options.find((e) => e.value === user.appTimeout).label} />}
      />
      <NewActionSheet
        isOpen={isTimeOutSelect}
        onClose={() => setIsTimeOutSelect(false)}
        closeText={translate("common.cancel")}
      >
        {options.map((item, index) => (
          <NewActionSheetItem
            icon={item.value === user.appTimeout ? "check" : undefined}
            iconColor={colors.success}
            key={index}
            text={item.label}
            onPress={() => {
              user.setAppTimeout(item.value)
              setIsTimeOutSelect(false)
            }}
            textStyle={{ flex: 1 }}
          />
        ))}
      </NewActionSheet>
    </View>
  )
})
