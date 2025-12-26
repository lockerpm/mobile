/* eslint-disable react-native/no-inline-styles */
import { View, Image } from "react-native"

import { Text, Button, Icon } from "app/components/cores"

import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

import { SKU } from "../PricePlan.sku"

interface Props {
  purchase: (subID: string) => void
  isProcessPayment: boolean
}
const SECURITY = require("assets/images/intro/intro1.png")

export const FamilyPayment = (props: Props) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

  const benefits = [
    {
      preset: "black",
      text: translate("payment:family.benefits.family"),
    },
    {
      text: translate("payment:family.benefits.storage"),
    },
    {
      text: translate("payment:family.benefits.health"),
    },
    {
      text: translate("payment:family.benefits.weak"),
    },
    {
      text: translate("payment:family.benefits.scaner"),
    },
    {
      text: translate("payment:family.benefits.emergency"),
    },
    {
      text: translate("payment:family.benefits.share"),
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
            borderRadius: 16,
            marginBottom: 8,
          }}
        />
        <Text preset="bold" tx="payment:family.header" />
        <Text
          tx="payment:family.ads"
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
          marginVertical: 16,
          marginHorizontal: 20,
          paddingHorizontal: 16,
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
            <Text
              text={e.text}
              preset={e.preset ? "default" : "label"}
              style={{ marginLeft: 12 }}
            />
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
            props.purchase(SKU.FAM_MON)
          }}
        >
          <Text preset="bold" style={{ color: colors.primary }}>
            {props.isProcessPayment ? "" : translate("payment:family.month")}
          </Text>
        </Button>
        <Button
          style={{
            marginVertical: 10,
          }}
          loading={props.isProcessPayment}
          onPress={() => {
            props.purchase(SKU.FAM_YEAR)
          }}
        >
          <Text preset="bold" style={{ color: colors.white }}>
            {props.isProcessPayment ? "" : translate("payment:family.year")}
          </Text>
        </Button>
      </View>
    </View>
  )
}
