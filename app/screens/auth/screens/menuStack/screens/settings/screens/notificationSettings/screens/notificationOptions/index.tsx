import { FC } from "react"
import { Screen, Header } from "app/components/cores"
import { MenuItemContainer, SettingsItem } from "app/components/utils"
import { NotificationSettingsScreenProps } from "app/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { ViewStyle } from "react-native"

export const NotificationSettingsScreen: FC<NotificationSettingsScreenProps<"notiOptions">> = ({
  navigation,
}) => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Screen
      preset="auto"
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
          titleTx={"common:notifications"}
        />
      }
      backgroundColor={colors.block}
      contentContainerStyle={$container}
    >
      <MenuItemContainer>
        <SettingsItem
          textTx={"common:push_notifications"}
          onPress={() => navigation.navigate("deviceNoti")}
        />
        <SettingsItem textTx={"common:email"} onPress={() => navigation.navigate("emailNoti")} />
      </MenuItemContainer>
    </Screen>
  )
}

const $container: ViewStyle = {
  paddingHorizontal: 16,
}
