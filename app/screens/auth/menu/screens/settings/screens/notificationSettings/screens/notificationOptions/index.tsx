import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { Screen, Header } from "app/components/cores"
import { useTheme } from "app/services/context"
import { MenuItemContainer, SettingsItem } from "app/components/utils"
import { NotificationSettingsScreenProps } from "../../route"

export const NotificationSettingsScreen: FC<NotificationSettingsScreenProps<"notiOptions">> =
  observer(({ navigation }) => {
    const { colors } = useTheme()

    return (
      <Screen
        padding
        preset="auto"
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx={"common.notifications"}
          />
        }
        backgroundColor={colors.block}
      >
        <MenuItemContainer>
          <SettingsItem
            textTx={"common.push_notifications"}
            onPress={() => navigation.navigate("deviceNoti")}
          />
          <SettingsItem textTx={"common.email"} onPress={() => navigation.navigate("emailNoti")} />
        </MenuItemContainer>
      </Screen>
    )
  })
