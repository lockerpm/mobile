import React, { useState, useEffect } from "react"
import { View, TouchableOpacity, ViewStyle } from "react-native"
import CheckBox from "@react-native-community/checkbox"
import { Button, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { SKU } from "./price-plan.sku"
import { Subscription } from "react-native-iap"
import { IS_IOS } from "../../../../../config/constants"
import { useStores } from "../../../../../models"

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
  isTrial: boolean
  subscriptions: Subscription[]
  onPress: React.Dispatch<React.SetStateAction<boolean>>
  purchase: (subID: string) => void
  isEnable: boolean
  personal: boolean
  isProcessPayment: boolean
}

export const PricePlan = (props: PricePlanProps) => {
  const { translate, color } = useMixins()

  const planText = {
    per: {
      monthly: {
        subId: SKU.PRE_MON,
        title: translate("payment.price.per.monthly.title"),
        subtitle: translate("payment.price.per.monthly.subtitle"),
        onSale: translate("payment.price.per.monthly.sale"),
        pay_title: translate("payment.price.per.monthly.pay_title"),
        discount: translate("payment.price.per.monthly.discount")

      },
      yearly: {
        subId: SKU.PRE_YEAR,
        title: translate("payment.price.per.yearly.title"),
        subtitle: translate("payment.price.per.yearly.subtitle"),
        onSale: translate("payment.price.per.yearly.sale"),
        pay_title: translate("payment.price.per.yearly.pay_title"),
        discount: translate("payment.price.per.yearly.discount")

      },
    },
    fam: {
      monthly: {
        subId: SKU.FAM_MON,
        title: translate("payment.price.fam.monthly.title"),
        subtitle: translate("payment.price.fam.monthly.subtitle"),
        onSale: translate("payment.price.fam.monthly.sale"),
        pay_title: translate("payment.price.fam.monthly.pay_title"),
        discount: translate("payment.price.fam.monthly.discount")
      },
      yearly: {
        subId: SKU.FAM_YEAR,
        title: translate("payment.price.fam.yearly.title"),
        subtitle: translate("payment.price.fam.yearly.subtitle"),
        onSale: translate("payment.price.fam.yearly.sale"),
        pay_title: translate("payment.price.fam.yearly.pay_title"),
        discount: translate("payment.price.fam.yearly.discount")
      },
    }
  }

  const plan = props.personal ? planText.per : planText.fam
  const billingCycle = props.isEnable ? plan.yearly : plan.monthly


  const [discount, setDiscount] = useState(false)



  useEffect(() => {
    const subs = props.subscriptions.find(subs => subs.productId === billingCycle.subId)
    if (IS_IOS) {
      // if (subs?.discounts) {
      //   setDiscount(true)
      // }
    } else {
      if (subs?.introductoryPrice) {
        setDiscount(true)
      }
    }
  }, [props.subscriptions])


  const CONTAINER: ViewStyle = {
    marginLeft: 20,
    marginRight: 20,
    flex: 1,
  }

  return (
    <View style={CONTAINER}>
      <Text preset="black" style={{
        marginTop: 10,
        marginBottom: 10,
      }}>
        {props.personal ? translate("payment.ads") : translate("payment.ads_family")}
      </Text>

      {props.isTrial && <Text style={{
        marginTop: 10,
        marginBottom: 10,
        alignSelf: "center"
      }}>
        {translate("payment.trial")}
      </Text>}

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
        {IS_IOS && <View style={{ flexDirection: "column", alignItems: "center" }}>
          <Text
            preset="bold"
            style={{ color: color.white }}
          >
            {props.isProcessPayment ? "" : billingCycle.pay_title}
          </Text>
          <Text
            style={{ fontSize: 16, color: color.white, alignSelf: "center" }}
          >
            {props.isProcessPayment ? "" : discount ? billingCycle.discount : translate("payment.cancel_text")}
          </Text>
        </View>}

        {!IS_IOS && discount && <View style={{ flexDirection: "column", alignItems: "center" }}>
          <Text
            style={{ color: color.white, fontWeight: "600", textAlign: "center" }}
          >
            {props.isProcessPayment ? "" : billingCycle.discount}
          </Text>
        </View>}
      </Button>
    </View>
  )
}