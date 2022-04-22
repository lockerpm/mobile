import React from "react"
import { View, TouchableOpacity, ViewStyle } from "react-native"
import CheckBox from "@react-native-community/checkbox"
import { Button, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { SKU } from "./price-plan.sku"

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
        marginTop: 10,
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

      <View style={{ justifyContent: "center", width: "100%" }}>
        <View style={{ flexDirection: "row" }}>
          <Text
            preset={prop.isEnable ? "bold" : "default"}
            style={{ fontSize: 16, marginBottom: 4 }}
          >
            {prop.title}
          </Text>
          <Text
            style={{
              justifyContent: "center",
              color: prop.isEnable ? 'rgba(255, 0, 0, 1.0)' : 'rgba(255, 0, 0, 0.3)',
              marginLeft: 8,
              fontSize: 14,
            }}
          >
            {prop.onSale}
          </Text>
        </View>
        <Text
          preset={prop.isEnable ? "black" : "default"}
          style={{ fontSize: 14, maxWidth: "80%" }}
        >{prop.subtitle}</Text>
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

  // const isFreeAccount = (user.plan?.alias === PlanType.FREE) || !user.plan 

  //  const handeUserIsInFamilyPlan = () => {
  //     Alert.alert("Warning", "User")
  //  }

  const planText = {
    per: {
      monthly: {
        subId: SKU.PRE_MON,
        title: translate("payment.price.per.monthly.title"),
        subtitle: translate("payment.price.per.monthly.subtitle"),
        onSale: translate("payment.price.per.monthly.sale"),
        pay_title: translate("payment.price.per.monthly.pay_title")
      },
      yearly: {
        subId: SKU.PRE_YEAR,
        title: translate("payment.price.per.yearly.title"),
        subtitle: translate("payment.price.per.yearly.subtitle"),
        onSale: translate("payment.price.per.yearly.sale"),
        pay_title: translate("payment.price.per.yearly.pay_title")
      },
    },
    fam: {
      monthly: {
        subId: SKU.FAM_MON,
        title: translate("payment.price.fam.monthly.title"),
        subtitle: translate("payment.price.fam.monthly.subtitle"),
        onSale: translate("payment.price.fam.monthly.sale"),
        pay_title: translate("payment.price.fam.monthly.pay_title")
      },
      yearly: {
        subId: SKU.FAM_YEAR,
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
        // isDisabled={!isFreeAccount}
        isLoading={props.isProcessPayment}
        onPress={() => {
          props.purchase(billingCycle.subId)
        }}
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