import React from "react"
import { View, TouchableOpacity } from "react-native"
import CheckBox from "@react-native-community/checkbox"
import { Button, Text } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"


interface PricePlanItemProps {
  onPress: () => void
  isEnable: boolean
  onSale?: string
  title: string
  subtitle: string
}

export const PricePlanItem = (prop: PricePlanItemProps) => {
  return (
    <TouchableOpacity
      onPress={prop.onPress}
      style={{
        backgroundColor: prop.isEnable ? "#E8E8E9" : "white",
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
  purchase: () => void
  isEnable: boolean
  personal: boolean
}

export const PricePlan = (prop: PricePlanProps) => {
  const { translate } = useMixins()
  const priceText = {
    per : {
      monthly: {
        title: translate("payment.price.per.monthly.title"),
        subtitle: translate("payment.price.per.monthly.subtitle"),
        onSale:  translate("payment.price.per.monthly.sale"),
        pay_title: translate("payment.price.per.monthly.pay_title")
      },
      yearly: {
        title: translate("payment.price.per.yearly.title"),
        subtitle:  translate("payment.price.per.yearly.subtitle"),
        onSale: translate("payment.price.per.yearly.sale"),
        pay_title:  translate("payment.price.per.yearly.pay_title")
      },
    },
    fam : {
      monthly: {
        title:  translate("payment.price.fam.monthly.title"),
        subtitle:  translate("payment.price.fam.monthly.subtitle"),
        onSale:  translate("payment.price.fam.monthly.sale"),
        pay_title:  translate("payment.price.fam.monthly.pay_title") 
      },
      yearly: {
        title:  translate("payment.price.fam.yearly.title"),
        subtitle:  translate("payment.price.fam.yearly.subtitle"),
        onSale:  translate("payment.price.fam.yearly.sale"),
        pay_title:  translate("payment.price.fam.yearly.pay_title")
      },
    }
  }

  const price = prop.personal? priceText.per : priceText.fam

  return (
    <View style={{ marginLeft: 20, marginRight: 20 }}>
      <Text preset="black" style={{marginTop: 10, marginBottom: 10 }}>
        {translate("payment.ads")}
      </Text>

      <PricePlanItem
        onPress={() => prop.onPress(true)}
        isEnable={prop.isEnable}
        onSale={price.yearly.onSale}
        title={price.yearly.title}
        subtitle={price.yearly.subtitle}
      />
      <PricePlanItem
        onPress={() => prop.onPress(false)}
        isEnable={!prop.isEnable}
        onSale={price.monthly.onSale}
        title={price.monthly.title}
        subtitle={price.monthly.subtitle}
      />
      <Button style={{
        flexDirection: "column",
        marginTop: 20,
      }} onPress={prop.purchase}>
        <Text style={{ fontSize: 16, fontWeight: "600", fontStyle: "normal", color: "white" }}>
          {prop.isEnable ? price.yearly.pay_title : price.monthly.pay_title}
        </Text>
        <Text style={{ fontSize: 12, color: "white" }}>{translate("payment.cancel_text")}</Text>
      </Button>
    </View>
  )
}