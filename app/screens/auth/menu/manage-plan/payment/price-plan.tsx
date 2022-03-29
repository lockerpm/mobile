import React from "react"
import { View, TouchableOpacity, ViewStyle } from "react-native"
import CheckBox from "@react-native-community/checkbox"
import { Button, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { IS_IOS } from "../../../../../config/constants"
import { PlanType } from "../../../../../config/types"


interface PricePlanItemProps {
  onPress: () => void
  isEnable: boolean

  onSale?: string
  title: string
  subtitle: string

}

const PricePlanItem = (prop: PricePlanItemProps) => {
  const { color } = useMixins()


  return (
    <TouchableOpacity
      onPress={prop.onPress}
      style={{
        backgroundColor: prop.isEnable ? color.block : color.background,
        height: 67,
        borderRadius: 10,
        flexDirection: "row",
      }}
    >
      <View style={{ justifyContent: "center" }}>
        <CheckBox
          tintColors={{ true: "black", false: color.text }}
          onFillColor={color.textBlack}
          tintColor={color.text}
          onTintColor={color.textBlack}
          animationDuration={0.3}
          onCheckColor={color.background}
          style={{ margin: 16 }}
          disabled={false}
          value={prop.isEnable}
          onValueChange={prop.onPress}
        />
      </View>

      <View style={{ justifyContent: "center" }}>
        <View style={{ flexDirection: "row" }}>
          <Text
            preset={prop.isEnable ? "bold" : "default"}
            style={{ fontSize: 20, marginBottom: 4 }}
          >
            {prop.title}
          </Text>
          <Text
            preset={prop.isEnable ? "black" : "default"}
            style={{
              justifyContent: "center",
              color: "red",
              marginLeft: 8,
              fontSize: 14
            }}
          >
            {prop.onSale}
          </Text>
        </View>
        <Text preset={prop.isEnable ? "black" : "default"}>{prop.subtitle}</Text>
      </View>
    </TouchableOpacity>
  )
}


interface PricePlanProps {
  onPress: React.Dispatch<React.SetStateAction<boolean>>
  purchase: (subID: string) => void
  isEnable: boolean
  personal: boolean
  isProcessPayment: boolean
}

export const PricePlan = (props: PricePlanProps) => {
  const { translate, color } = useMixins()
  const { user } = useStores()

  const isFreeAccount = (user.plan?.alias === PlanType.FREE) || !user.plan 
  const planText = {
    per: {
      monthly: {
        subId: !IS_IOS ? "pm_premium_monthly" : "ios_pm_premium_monthly",
        title: translate("payment.price.per.monthly.title"),
        subtitle: translate("payment.price.per.monthly.subtitle"),
        onSale: translate("payment.price.per.monthly.sale"),
        pay_title: translate("payment.price.per.monthly.pay_title")
      },
      yearly: {
        subId: !IS_IOS ? "pm_premium_yearly" : "ios_pm_premium_yearly",
        title: translate("payment.price.per.yearly.title"),
        subtitle: translate("payment.price.per.yearly.subtitle"),
        onSale: translate("payment.price.per.yearly.sale"),
        pay_title: translate("payment.price.per.yearly.pay_title")
      },
    },
    fam: {
      monthly: {
        subId: !IS_IOS ? "pm_family_monthly" : "ios_pm_family_monthly",
        title: translate("payment.price.fam.monthly.title"),
        subtitle: translate("payment.price.fam.monthly.subtitle"),
        onSale: translate("payment.price.fam.monthly.sale"),
        pay_title: translate("payment.price.fam.monthly.pay_title")
      },
      yearly: {
        subId: !IS_IOS ? "pm_family_yearly" : "ios_pm_family_yearly",
        title: translate("payment.price.fam.yearly.title"),
        subtitle: translate("payment.price.fam.yearly.subtitle"),
        onSale: translate("payment.price.fam.yearly.sale"),
        pay_title: translate("payment.price.fam.yearly.pay_title")
      },
    }
  }

  const plan = props.personal ? planText.per : planText.fam
  const billingCycle = props.isEnable ? plan.yearly : plan.monthly

  const CONTAINER: ViewStyle = {
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
    justifyContent: "space-around"
  }

  return (
    <View style={CONTAINER}>
      <Text preset="black" style={{ marginTop: 10, marginBottom: 10 }}>
        {translate("payment.ads")}
      </Text>

      <PricePlanItem
        onPress={() => props.onPress(true)}
        isEnable={props.isEnable}
        onSale={plan.yearly.onSale}
        title={plan.yearly.title}
        subtitle={plan.yearly.subtitle}
      />
      <PricePlanItem
        onPress={() => props.onPress(false)}
        isEnable={!props.isEnable}
        onSale={plan.monthly.onSale}
        title={plan.monthly.title}
        subtitle={plan.monthly.subtitle}
      />
      <Button
        style={{
          marginVertical: 20,
        }}
        isDisabled={!isFreeAccount}
        isLoading={props.isProcessPayment}
        onPress={() => props.purchase(billingCycle.subId)}
      >
        <View style={{ flexDirection: "column", }}>
          <Text
            preset="bold"
            style={{ color: color.white }}
          >
            {props.isProcessPayment ? "" : billingCycle.pay_title}
          </Text>
          <Text
            style={{ fontSize: 12, color: color.white }}
          >
            {props.isProcessPayment ? "" : translate("payment.cancel_text")}
          </Text>
        </View>
      </Button>
    </View>
  )
}