import React from "react"
import { View, TouchableOpacity } from "react-native"
import CheckBox from "@react-native-community/checkbox"
import { Button, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { observer } from "mobx-react-lite"

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
          style={{ margin: 16 }}
          disabled={false}
          value={prop.isEnable}
          onValueChange={prop.onPress}
        />
      </View>

      <View style={{ justifyContent: "center" }}>
        <View style={{ flexDirection: "row" }}>
          <Text preset={prop.isEnable? "bold" : "default"} style={{ fontStyle: "normal" }}>{prop.title}</Text>
          <Text preset={prop.isEnable? "black" : "default"} style={{ justifyContent: "center", color: "red", marginLeft: 8, fontSize: 12}}>
            {prop.onSale}
          </Text>
        </View>
        <Text preset={prop.isEnable? "black" : "default"}>{prop.subtitle}</Text>
      </View>
    </TouchableOpacity>
  )
}


interface PricePlanProps {
  onPress: React.Dispatch<React.SetStateAction<boolean>>
  purchase: (subID: string) => void
  isEnable: boolean
  personal: boolean
}

export const PricePlan = (prop: PricePlanProps) => { 
  const { translate, color } = useMixins()
  const planText = {
    per : {
      monthly: {
        subId: "pm_premium_monthly",
        title: translate("payment.price.per.monthly.title"),
        subtitle: translate("payment.price.per.monthly.subtitle"),
        onSale:  translate("payment.price.per.monthly.sale"),
        pay_title: translate("payment.price.per.monthly.pay_title")
      },
      yearly: {
        subId:  "pm_premium_yearly",
        title: translate("payment.price.per.yearly.title"),
        subtitle:  translate("payment.price.per.yearly.subtitle"),
        onSale: translate("payment.price.per.yearly.sale"),
        pay_title:  translate("payment.price.per.yearly.pay_title")
      },
    },
    fam : {
      monthly: {
        subId: "pm_family_monthly",
        title:  translate("payment.price.fam.monthly.title"),
        subtitle:  translate("payment.price.fam.monthly.subtitle"),
        onSale:  translate("payment.price.fam.monthly.sale"),
        pay_title:  translate("payment.price.fam.monthly.pay_title") 
      },
      yearly: {
        subId: "pm_family_yearly",
        title:  translate("payment.price.fam.yearly.title"),
        subtitle:  translate("payment.price.fam.yearly.subtitle"),
        onSale:  translate("payment.price.fam.yearly.sale"),
        pay_title:  translate("payment.price.fam.yearly.pay_title")
      },
    }
  }

  const plan = prop.personal? planText.per : planText.fam
  const billingCycle = prop.isEnable ? plan.yearly : plan.monthly

  return (
    <View style={{ marginLeft: 20, marginRight: 20 }}>
      <Text preset="black" style={{marginTop: 10, marginBottom: 10 }}>
        {translate("payment.ads")}
      </Text>

      <PricePlanItem
        onPress={() => prop.onPress(true)}
        isEnable={prop.isEnable}
        onSale={plan.yearly.onSale}
        title={plan.yearly.title}
        subtitle={plan.yearly.subtitle}
      />
      <PricePlanItem
        onPress={() => prop.onPress(false)}
        isEnable={!prop.isEnable}
        onSale={plan.monthly.onSale}
        title={plan.monthly.title}
        subtitle={plan.monthly.subtitle}
      />
      <Button style={{
        flexDirection: "column",
        marginTop: 20,
      }} onPress={() => prop.purchase(billingCycle.subId)}>
        <Text preset="bold" style={{ color: color.white}}>
          {billingCycle.pay_title}
        </Text>
        <Text style={{ fontSize: 12, color: color.white}}>{translate("payment.cancel_text")}</Text>
      </Button>
    </View>
  )
}