import React from "react"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { Screen, Header } from "app/components/cores"
import { useTheme } from "app/services/context"
import { MenuItemContainer, SettingsItem } from "app/components/utils"
import { observer } from "mobx-react-lite"

export const EmergencyAccessScreen = observer(() => {
  const navigation = useNavigation() as any
  const { user } = useStores()
  const { colors } = useTheme()
  const isFree = user.isFreePlan

  // ----------------------- PARAMS -----------------------

  // ----------------------- METHODS -----------------------

  // ----------------------- RENDER -----------------------

  return (
    <Screen
      padding
      safeAreaEdges={["bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack()}
          titleTx={"emergency_access.title"}
        />
      }
      backgroundColor={colors.block}
    >
      <MenuItemContainer>
        <SettingsItem
          textTx={"emergency_access.your_trust"}
          onPress={() => {
            isFree
              ? navigation.navigate("payment", { premium: true })
              : navigation.navigate("yourTrustedContact")
          }}
        />

        <SettingsItem
          textTx={"emergency_access.trust_you"}
          onPress={() => navigation.navigate("contactsTrustedYou")}
        />
      </MenuItemContainer>
    </Screen>
  )
})
