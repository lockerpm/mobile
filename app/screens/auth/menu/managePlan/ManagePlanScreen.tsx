import React from "react"
import { Screen, Header } from "app/components/cores"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { PremiumFeature } from "./PremiumFeature"
import { PlanUsage } from "./PlanSsage"
import { useTheme } from "app/services/context"

const map = {
  pm_lifetime_family: "Lifetime Family",
  pm_lifetime_team: "Lifetime Team",
  pm_lifetime_premium: "Lifetime Premium",
  pm_free: "Free",
  pm_premium: "Premium",
  pm_family: "Family",
}

export const ManagePlanScreen = observer(() => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { colors } = useTheme()

  // ----------------------- PARAMS -----------------------

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={map[user.plan?.alias] ?? "Free"}
        />
      }
      backgroundColor={colors.block}
    >
      <PlanUsage />
      <PremiumFeature />
    </Screen>
  )
})
