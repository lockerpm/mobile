import React from "react"
import { View, Image } from "react-native"
import { SKU } from "../PricePlan.sku"
import { useTheme } from "app/services/context"
import { Text, Button, Icon } from "app/components/cores"
import { useHelper } from "app/services/hook"

interface Props {
  purchase: (subID: string) => void
  isProcessPayment: boolean
}

const SECURITY = require("assets/images/intro/intro1.png")

export const PremiumPayment = (props: Props) => {
  const { colors } = useTheme()
  const { translate } = useHelper()

  const benefits = [
    {
      text: translate("payment.family.benefits.storage"),
    },
    {
      text: translate("payment.family.benefits.health"),
    },
    {
      text: translate("payment.family.benefits.weak"),
    },
    {
      text: translate("payment.family.benefits.scaner"),
    },
    {
      text: translate("payment.family.benefits.emergency"),
    },
    {
      text: translate("payment.family.benefits.share"),
    },
  ]

  return (
    <View style={{ width: "100%" }}>
      <View
        style={{
          alignItems: "center",
        }}
      >
        <Image
          resizeMode="contain"
          source={SECURITY}
          style={{
            width: 200,
            height: 200,
          }}
        />
        <Text preset="bold" text={translate("payment.premium.header")} />
        <Text
          text={translate("payment.premium.ads")}
          style={{
            textAlign: "center",
            marginTop: 8,
            marginHorizontal: 20,
          }}
        />
      </View>

      <View
        style={{
          borderRadius: 12,
          backgroundColor: colors.block,
          paddingHorizontal: 16,
          marginVertical: 16,
          marginHorizontal: 20,
        }}
      >
        {benefits.map((e, index) => (
          <View
            key={String(index)}
            style={{
              flexDirection: "row",
              marginVertical: 6,
            }}
          >
            <Icon icon="check" size={20} />
            <Text text={e.text} style={{ marginLeft: 12 }} />
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: colors.background, marginHorizontal: 20 }}>
        <Button
          preset="secondary"
          style={{
            marginVertical: 10,
          }}
          loading={props.isProcessPayment}
          onPress={() => {
            props.purchase(SKU.PRE_MON)
          }}
        >
          <Text preset="bold" style={{ color: colors.primary }}>
            {props.isProcessPayment ? "" : translate("payment.premium.month")}
          </Text>
        </Button>
        <Button
          style={{
            marginVertical: 10,
          }}
          loading={props.isProcessPayment}
          onPress={() => {
            props.purchase(SKU.PRE_YEAR)
          }}
        >
          <Text preset="bold" style={{ color: colors.white }}>
            {props.isProcessPayment ? "" : translate("payment.premium.year")}
          </Text>
        </Button>
      </View>
    </View>
  )
}
