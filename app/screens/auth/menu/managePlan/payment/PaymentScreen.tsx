import React, { useState, useEffect, FC } from "react"
import { View, Alert, Platform } from "react-native"
import { observer } from "mobx-react-lite"
import { useTheme } from "app/services/context"
import { Logger } from "app/utils/utils"
import { Icon, Logo, Screen } from "app/components/cores"

import {
  PurchaseError,
  clearTransactionIOS,
  flushFailedPurchasesCachedAsPendingAndroid,
  requestSubscription,
  useIAP,
} from "react-native-iap"

import { SKU } from "./PricePlan.sku"

import { PremiumBenefits } from "./PremiumBenefits"
import { PricePlan } from "./PricePlan"
import { FamilyPayment } from "./familyPayment/FamilyPayment"
import { PremiumPayment } from "./premiumPayment/PremiumPayment"
import { useStores } from "app/models"
import { useHelper } from "app/services/hook"
import { AppStackScreenProps } from "app/navigators/navigators.types"

const subSkus = [SKU.PRE_MON, SKU.PRE_YEAR, SKU.FAM_MON, SKU.FAM_YEAR]

const IS_IOS = Platform.OS === "ios"
const IS_ANDROID = Platform.OS === "android"

export const PaymentScreen: FC<AppStackScreenProps<"payment">> = observer((props) => {
  const { subscriptions, getSubscriptions, currentPurchase, finishTransaction } = useIAP()
  const { user, uiStore } = useStores()
  const { notifyApiError, translate } = useHelper()
  const { colors, isDark } = useTheme()
  const navigation = props.navigation
  const route = props.route

  // -------------------- STATE ----------------------
  // const [ownedSubscriptions, setOwnedSubscriptions] = useState<string[]>([])

  const [processPayment, setProcessPayment] = useState<boolean>(false)

  // -------------------- METHOD ----------------------

  const getSubscription = async () => {
    try {
      if (!IS_IOS) {
        await flushFailedPurchasesCachedAsPendingAndroid()
      } else {
        if (__DEV__) await clearTransactionIOS()
      }

      await getSubscriptions({ skus: subSkus })
    } catch (error) {
      Logger.error({ message: "handleGetSubscriptions", error })
      Alert.alert("Fail to get in-app-purchase information", "", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    }
  }

  const purchase = async (productId: string) => {
    setProcessPayment(true)
    if (IS_IOS) {
      await clearTransactionIOS()
    }

    try {
      if (IS_IOS) {
        await requestSubscription({
          sku: productId,
        })
      }

      if (IS_ANDROID) {
        // Stupid code :V but it works. improve in future
        // On Google Play Billing V5 you might have  multiple offers for a single sku
        const subscription = subscriptions.find((s) => s.productId === productId)
        if ("subscriptionOfferDetails" in subscription) {
          const offerToken =
            subscription?.subscriptionOfferDetails.length > 0 &&
            subscription?.subscriptionOfferDetails[0].offerToken
          if (offerToken) {
            await requestSubscription({
              sku: productId,
              subscriptionOffers: [{ sku: productId, offerToken }],
            })
          }
        }
      }
    } catch (error) {
      if (error instanceof PurchaseError) {
        Logger.error({ message: `[${error.code}]: ${error.message}`, error })
      } else {
        Logger.error({ message: "handleBuySubscription", error })
      }
    }
    setProcessPayment(false)
  }

  // -------------------- EFFECT ----------------------
  const checkCurrentPurchase = async () => {
    try {
      if (currentPurchase?.productId) {
        await finishTransaction({
          purchase: currentPurchase,
          // isConsumable: true,
        })

        // setOwnedSubscriptions((prev) => [...prev, currentPurchase?.productId])
        if (currentPurchase.transactionReceipt) {
          let res
          if (IS_IOS) {
            res = await user.purchaseValidation(
              currentPurchase.transactionReceipt,
              currentPurchase.productId,
              currentPurchase.originalTransactionIdentifierIOS,
            )
          } else {
            res = await user.purchaseValidation(
              currentPurchase.purchaseToken,
              currentPurchase.productId,
            )
          }
          if (res.kind === "ok") {
            if (res.data.success) {
              await user.loadPlan()
              uiStore.setShowWelcomePremium(true)
              navigation.navigate("welcome_premium")
            } else {
              Alert.alert(translate("manage_plan.verify"), res.data.detail)
            }
          } else {
            notifyApiError(res)
          }
        }

        setProcessPayment(false)
      }
    } catch (error) {
      setProcessPayment(false)
      if (error instanceof PurchaseError) {
        Logger.error({ message: `[${error.code}]: ${error.message}`, error })
      } else {
        Logger.error({ message: "handleBuyProduct", error })
      }
    }
  }

  useEffect(() => {
    getSubscription()
  }, [])

  useEffect(() => {
    checkCurrentPurchase()
  }, [currentPurchase, finishTransaction])

  // ------------------ RENDER ----------------------

  const Content = () => {
    if (route.params.family)
      return <FamilyPayment isProcessPayment={processPayment} purchase={purchase} />
    if (route.params.premium)
      return <PremiumPayment isProcessPayment={processPayment} purchase={purchase} />

    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <PremiumBenefits />

        <PricePlan
          subscriptions={subscriptions}
          isProcessPayment={processPayment}
          purchase={purchase}
        />
      </View>
    )
  }

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top"]}
      backgroundColor={
        route.params.family || route.params.premium ? colors.background : colors.block
      }
      header={
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            justifyContent: "space-between",
            alignItems: "center",
            height: 56,
          }}
        >
          <Logo
            preset={isDark ? "locker-premium" : "locker-premium-dark"}
            style={{ height: 32, width: 152 }}
          />
          <Icon icon="x-circle" onPress={() => navigation.goBack()} disabled={processPayment} />
        </View>
      }
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <Content />
    </Screen>
  )
})
