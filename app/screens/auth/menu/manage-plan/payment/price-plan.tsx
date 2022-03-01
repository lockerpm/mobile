import React from "react"
import { View, TouchableOpacity, Text } from "react-native"
import CheckBox from "@react-native-community/checkbox"


interface PriceItem {
  lockerId: string
  subId: String 
  title: string,
  subtitle: string,
  sale: string,
  pay_title: string
}

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
          <Text style={{ fontSize: 20, fontWeight: "600", fontStyle: "normal" }}>{prop.title}</Text>
          <Text style={{ justifyContent: "center", color: "red", marginLeft: 8, marginTop: 5 }}>
            {prop.onSale}
          </Text>
        </View>
        <Text>{prop.subtitle}</Text>
      </View>
    </TouchableOpacity>
  )
}


interface PricePlanProps {
  onPress: React.Dispatch<React.SetStateAction<boolean>>
  isEnable: boolean
  plan: {
    mon: PriceItem
    year: PriceItem
  }
}

export const PricePlan = (prop: PricePlanProps) => {
  return (
    <View>
      <PricePlanItem
        onPress={() => prop.onPress(true)}
        isEnable={prop.isEnable}
        onSale={prop.plan.year.sale}
        title={prop.plan.year.title}
        subtitle={prop.plan.year.subtitle}
      />
      <PricePlanItem
        onPress={() => prop.onPress(false)}
        isEnable={!prop.isEnable}
        onSale={prop.plan.mon.sale}
        title={prop.plan.mon.title}
        subtitle={prop.plan.mon.subtitle}
      />
    </View>
  )
}