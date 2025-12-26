/* eslint-disable react-native/no-inline-styles */
import { useEffect, useState } from "react"
import {
  View,
  TouchableOpacity,
  LayoutAnimation,
  Dimensions,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from "react-native"
import { ProductSubscription } from "react-native-iap"

import { Text, Checkbox } from "app/components/cores"

import { TxKeyPath, useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

import { SKU } from "./PricePlan.sku"

type PlanTextType = {
  subId: string
  title: TxKeyPath
  subtitle: TxKeyPath
  onSale: TxKeyPath
  pay_title: TxKeyPath
}
const planText = {
  per: {
    monthly: {
      subId: SKU.PRE_MON,
      title: "payment:price.per.monthly.title",
      subtitle: "payment:price.per.monthly.subtitle",
      onSale: "payment:price.per.monthly.sale",
      pay_title: "payment:price.per.monthly.pay_title",
    } as PlanTextType,
    yearly: {
      subId: SKU.PRE_YEAR,
      title: "payment:price.per.yearly.title",
      subtitle: "payment:price.per.yearly.subtitle",
      onSale: "payment:price.per.yearly.sale",
      pay_title: "payment:price.per.yearly.pay_title",
    } as PlanTextType,
  },
  fam: {
    monthly: {
      subId: SKU.FAM_MON,
      title: "payment:price.fam.monthly.title",
      subtitle: "payment:price.fam.monthly.subtitle",
      onSale: "payment:price.fam.monthly.sale",
      pay_title: "payment:price.fam.monthly.pay_title",
    } as PlanTextType,
    yearly: {
      subId: SKU.FAM_YEAR,
      title: "payment:price.fam.yearly.title",
      subtitle: "payment:price.fam.yearly.subtitle",
      onSale: "payment:price.fam.yearly.sale",
      pay_title: "payment:price.fam.yearly.pay_title",
    } as PlanTextType,
  },
}

interface PricePlanItemProps {
  onPress: () => void
  isEnable: boolean
  onSale?: TxKeyPath
  title: TxKeyPath
  subtitle: TxKeyPath
}

const PricePlanItem = (prop: PricePlanItemProps) => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <TouchableOpacity onPress={prop.onPress}>
      <View
        style={[
          {
            backgroundColor: prop.isEnable ? colors.block : colors.background,
            borderColor: prop.isEnable ? colors.primary : colors.border,
          },
          styles.planItem,
        ]}
      >
        <Checkbox value={prop.isEnable} onPress={prop.onPress} />
        <View style={styles.planItemContent}>
          <View style={styles.row}>
            <Text
              preset={prop.isEnable ? "bold" : "default"}
              style={styles.planItemTitle}
              tx={prop.title}
            />
            <Text
              style={{
                opacity: prop.isEnable ? 1 : 0.5,
              }}
              color={colors.error}
              size="sm"
              tx={prop.onSale}
            />
          </View>
          <Text tx={prop.subtitle} preset={prop.isEnable ? "default" : "label"} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  )
}

// user selects plan segment
const Segment = ({
  payIndividual,
  setPayIndividual,
}: {
  payIndividual: boolean
  setPayIndividual: (val: boolean) => void
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }, [payIndividual])

  return (
    <View style={themed($segmentContainer)}>
      <TouchableOpacity
        onPress={() => {
          setPayIndividual(true)
        }}
        style={[
          {
            backgroundColor: payIndividual ? colors.background : colors.block,
          },
          styles.segment,
        ]}
      >
        <Text tx={"payment:individual"} preset="bold" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setPayIndividual(false)}
        style={[
          {
            backgroundColor: payIndividual ? colors.block : colors.background,
          },
          styles.segment,
        ]}
      >
        <Text tx={"payment:family_text"} preset="bold" />
      </TouchableOpacity>
    </View>
  )
}

interface PricePlanProps {
  subscriptions: ProductSubscription[]
  purchase: (subID: string) => void
  isProcessPayment: boolean
}

export const PricePlan = (props: PricePlanProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

  const [payIndividual, setPayIndividual] = useState(true)
  const [isMonthly, setIsMonthly] = useState(true)

  const plan = payIndividual ? planText.per : planText.fam
  const billingCycle = !isMonthly ? plan.yearly : plan.monthly
  const ads = payIndividual ? translate("payment:ads") : translate("payment:ads_family")

  return (
    <View style={themed($container)}>
      <Segment payIndividual={payIndividual} setPayIndividual={setPayIndividual} />

      <Text text={ads} style={styles.mv12} />

      <PricePlanItem
        onPress={() => setIsMonthly(false)}
        isEnable={!isMonthly}
        onSale={plan.yearly.onSale}
        title={plan.yearly.title}
        subtitle={plan.yearly.subtitle}
      />
      <PricePlanItem
        onPress={() => setIsMonthly(true)}
        isEnable={isMonthly}
        onSale={plan.monthly.onSale}
        title={plan.monthly.title}
        subtitle={plan.monthly.subtitle}
      />

      <TouchableOpacity
        disabled={props.subscriptions.length === 0}
        // loading={props.isProcessPayment}
        onPress={() => {
          props.purchase(billingCycle.subId)
        }}
        style={[
          themed($button),
          {
            opacity: props.isProcessPayment || props.subscriptions.length === 0 ? 0.5 : 1,
          },
        ]}
      >
        <View style={styles.center}>
          {!props.isProcessPayment && (
            <>
              <Text tx={billingCycle.pay_title} preset="bold" color={colors.white} />

              <Text tx={"payment:cancel_text"} color={colors.white} />
            </>
          )}
          {props.isProcessPayment && <ActivityIndicator size="small" color={colors.white} />}
        </View>
      </TouchableOpacity>
    </View>
  )
}

const $button: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 12,
  backgroundColor: colors.primary,
  paddingVertical: 8,
  paddingHorizontal: 16,
})

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  width: Dimensions.get("screen").width,
  bottom: 0,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  backgroundColor: colors.background,
  paddingBottom: "15%",
  paddingTop: 12,
  paddingHorizontal: 20,
})

const $segmentContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  height: 40,
  borderRadius: 10,
  padding: 4,
  backgroundColor: colors.block,
})

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
  },
  mv12: {
    marginVertical: 12,
  },
  planItem: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  planItemContent: {
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 12,
  },
  planItemTitle: {
    marginBottom: 4,
    marginRight: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  segment: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
})
