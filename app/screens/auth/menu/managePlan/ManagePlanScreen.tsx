import React from "react"
import { Screen, Header } from "app/components-v2/cores"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { PremiumFeature } from "./PremiumFeature"
import { PlanUsage } from "./PlanSsage"
import { useTheme } from "app/services/context"

export const ManagePlanScreen = observer(() => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { colors } = useTheme()

  // ----------------------- PARAMS -----------------------

  return (
    <Screen
      preset="auto"
      safeAreaEdges={['bottom']}
      header={(
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={user.plan?.name + " Plan"}
        />
      )}
      backgroundColor={colors.block}
    >
      <PlanUsage />
      <PremiumFeature />
    </Screen>
  )
})