import React, { useEffect, useState } from "react"
import { View, TouchableOpacity, LayoutAnimation, Dimensions } from "react-native"
import { SKU } from "./PricePlan.sku"
import { Subscription } from "react-native-iap"
import { useTheme } from "app/services/context"
import { Text, Button, Toggle } from "app/components/cores"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"

interface PricePlanItemProps {
  onPress: () => void
  isEnable: boolean
  onSale?: string
  title: string
  subtitle: string
}

const PricePlanItem = (prop: PricePlanItemProps) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity onPress={prop.onPress}>
      <View
        style={{
          backgroundColor: prop.isEnable ? colors.block : colors.background,
          borderColor: prop.isEnable ? colors.primary : colors.border,
          borderWidth: 1,
          borderRadius: 12,
          marginBottom: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Toggle variant="checkbox" value={prop.isEnable} onValueChange={prop.onPress} />
        <View style={{ width: "100%", marginLeft: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              preset={prop.isEnable ? "bold" : "default"}
              style={{ fontSize: 16, marginBottom: 4 }}
            >
              {prop.title}
            </Text>
            <Text
              style={{
                color: colors.error,
                opacity: prop.isEnable ? 1 : 0.5,
                marginLeft: 8,
                fontSize: 14,
              }}
            >
              {prop.onSale}
            </Text>
          </View>
          <Text
            text={prop.subtitle}
            preset={prop.isEnable ? "default" : "label"}
            style={{ fontSize: 14, maxWidth: "80%" }}
          />
        </View>
      </View>
    </TouchableOpacity>
  )
}

interface PricePlanProps {
  subscriptions: Subscription[]
  purchase: (subID: string) => void
  isProcessPayment: boolean
}

export const PricePlan = (props: PricePlanProps) => {
  const { colors } = useTheme()
  const { notifyApiError, translate } = useHelper()

  const [payIndividual, setPayIndividual] = useState(true)
  const [isMonthly, setIsMonthly] = useState(true)
  const [isTrial, setIsTrial] = useState(false)

  const { user } = useStores()

  const getEligibleTrial = async () => {
    const res = await user.getTrialEligible()
    if (res.kind === "ok") {
      setIsTrial(!res.data.personal_trial_applied)
    } else {
      notifyApiError(res)
    }
  }

  useEffect(() => {
    getEligibleTrial()
  }, [])

  const planText = {
    per: {
      monthly: {
        subId: SKU.PRE_MON,
        title: translate("payment.price.per.monthly.title"),
        subtitle: translate("payment.price.per.monthly.subtitle"),
        onSale: translate("payment.price.per.monthly.sale"),
        pay_title: translate("payment.price.per.monthly.pay_title"),
        discount: translate("payment.price.per.monthly.discount"),
      },
      yearly: {
        subId: SKU.PRE_YEAR,
        title: translate("payment.price.per.yearly.title"),
        subtitle: translate("payment.price.per.yearly.subtitle"),
        onSale: translate("payment.price.per.yearly.sale"),
        pay_title: translate("payment.price.per.yearly.pay_title"),
        discount: translate("payment.price.per.yearly.discount"),
      },
    },
    fam: {
      monthly: {
        subId: SKU.FAM_MON,
        title: translate("payment.price.fam.monthly.title"),
        subtitle: translate("payment.price.fam.monthly.subtitle"),
        onSale: translate("payment.price.fam.monthly.sale"),
        pay_title: translate("payment.price.fam.monthly.pay_title"),
        discount: translate("payment.price.fam.monthly.discount"),
      },
      yearly: {
        subId: SKU.FAM_YEAR,
        title: translate("payment.price.fam.yearly.title"),
        subtitle: translate("payment.price.fam.yearly.subtitle"),
        onSale: translate("payment.price.fam.yearly.sale"),
        pay_title: translate("payment.price.fam.yearly.pay_title"),
        discount: translate("payment.price.fam.yearly.discount"),
      },
    },
  }

  const plan = payIndividual ? planText.per : planText.fam
  const billingCycle = !isMonthly ? plan.yearly : plan.monthly
  const ads = payIndividual ? translate("payment.ads") : translate("payment.ads_family")
  const trial = isTrial ? translate("payment.trial") : ""

  return (
    <View
      style={{
        position: "absolute",
        width: Dimensions.get("screen").width,
        bottom: 0,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        backgroundColor: colors.background,
        paddingBottom: "15%",
        paddingTop: 12,
        paddingHorizontal: 20,
      }}
    >
      <Segment payIndividual={payIndividual} setPayIndividual={setPayIndividual} />

      <Text
        text={ads + trial}
        style={{
          marginVertical: 12,
        }}
      />

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

      <Button
        disabled={props.subscriptions.length === 0}
        loading={props.isProcessPayment}
        onPress={() => {
          props.purchase(billingCycle.subId)
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text
            text={props.isProcessPayment ? "" : billingCycle.pay_title}
            preset="bold"
            color={colors.white}
          />

          <Text
            text={props.isProcessPayment ? "" : translate("payment.cancel_text")}
            color={colors.white}
          />
        </View>
      </Button>
    </View>
  )
}

// user selects plan segment
const Segment = ({ payIndividual, setPayIndividual }) => {
  const { colors } = useTheme()
  const { translate } = useHelper()

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }, [payIndividual])
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        height: 40,
        borderRadius: 8,
        padding: 4,
        backgroundColor: colors.block,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          setPayIndividual(true)
        }}
        style={{
          backgroundColor: payIndividual ? colors.background : colors.block,
          flex: 1,
          borderRadius: 8,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text text={translate("payment.individual")} preset="bold" style={{ fontSize: 16 }} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setPayIndividual(false)}
        style={{
          backgroundColor: payIndividual ? colors.block : colors.background,
          flex: 1,
          borderRadius: 8,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text text={translate("payment.family_text")} preset="bold" style={{ fontSize: 16 }} />
      </TouchableOpacity>
    </View>
  )
}
