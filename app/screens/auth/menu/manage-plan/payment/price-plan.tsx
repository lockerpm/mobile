import React from "react"
import { View, TouchableOpacity, Text } from "react-native"
import CheckBox from "@react-native-community/checkbox"

interface PricePlanProps {
  onPress: () => void
  isEnable: boolean
  onSale?: boolean
  title: string
  subtitle: string
}

export const PricePlan = (prop: PricePlanProps) => {
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
          {prop.onSale && (
            <Text style={{ justifyContent: "center", color: "red", marginLeft: 8, marginTop: 5 }}>
              Save 75%
            </Text>
          )}
        </View>
        <Text>{prop.subtitle}</Text>
      </View>
    </TouchableOpacity>
  )
}
