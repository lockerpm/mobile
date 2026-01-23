import { useState, useEffect, FC } from "react"
import { View, Alert, StyleSheet } from "react-native"
import {
  ErrorCode,
  ProductSubscriptionAndroid,
  ProductSubscriptionAndroidOfferDetails,
  useIAP,
} from "react-native-iap"

import { Logo, PressableIcon, Screen } from "app/components/cores"
import { MenuScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"

import { useAppLocale } from "@/i18n"
import { useStores } from "@/models"
import { userApi } from "@/services/api"
import { Logger } from "@/utils/logger"
import { useAppTheme } from "@/utils/useAppTheme"

import { FamilyPayment } from "./familyPayment/FamilyPayment"
import { PremiumBenefits } from "./PremiumBenefits"
import { PremiumPayment } from "./premiumPayment/PremiumPayment"
import { PricePlan } from "./PricePlan"
import { SKU } from "./PricePlan.sku"

const subSkus = [SKU.PRE_MON, SKU.PRE_YEAR, SKU.FAM_MON, SKU.FAM_YEAR]

export const PaymentScreen: FC<MenuScreenProps<"payment">> = ({
  navigation,
  route: { params },
}) => {
  const { user } = useStores()
  const { notifyApiError } = useToast()
  const { translate } = useAppLocale()
  const {
    theme: { colors },
    themeContext,
  } = useAppTheme()
  const isDark = themeContext === "dark"
  // -------------------- STATE ----------------------
  const [processPayment, setProcessPayment] = useState<boolean>(false)
  // -------------------- METHOD ----------------------

  const { connected, subscriptions, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        // setOwnedSubscriptions((prev) => [...prev, currentPurchase?.productId])
        const res = await userApi.purchaseValidationV2(user.apiToken, purchase)
        if (res.kind === "ok") {
          if (res.data.success) {
            navigation.navigate("welcomePremium")
          } else {
            Alert.alert(translate("manage_plan:verify"), res.data.detail?.message || "")
          }
        } else {
          notifyApiError(res)
        }

        await finishTransaction({
          purchase,
          isConsumable: false,
        })
      } catch (error) {
        console.error("Failed to complete purchase:", error)
      }
      setProcessPayment(false)
    },
    onPurchaseError: (error) => {
      if (error.code !== ErrorCode.UserCancelled) {
        console.log("Purchase error:", error.message)
      }
      setProcessPayment(false)
    },
  })
  const getSubscription = async () => {
    try {
      // Fetch your products
      await fetchProducts({ skus: subSkus, type: "subs" })
    } catch (error) {
      Logger.error({ message: "handleGetSubscriptions", error })
      Alert.alert("Failed to get in-app-purchase information", "", [
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
    try {
      // Find the subscription product
      const subscription = subscriptions.find((sub) => sub.id === productId)
      if (!subscription) {
        Logger.error("Subscription not found")
        setProcessPayment(false)
        return
      }
      await requestPurchase({
        request: {
          ios: {
            sku: productId,
            andDangerouslyFinishTransactionAutomatically: false,
          },
          android: {
            skus: [productId],
            // Android requires subscriptionOffers for subscriptions
            subscriptionOffers:
              (subscription as ProductSubscriptionAndroid).subscriptionOfferDetailsAndroid?.map(
                (offer: ProductSubscriptionAndroidOfferDetails) => ({
                  sku: subscription.id,
                  offerToken: offer.offerToken,
                })
              ) || [],
          },
        },
        type: "subs",
      })
    } catch (error) {
      Logger.error({ message: "handleBuySubscription", error })
    }
  }

  // -------------------- EFFECT ----------------------
  useEffect(() => {
    if (connected) {
      getSubscription()
    }
  }, [connected])

  // ------------------ RENDER ----------------------

  return (
    <Screen
      safeAreaEdges={["top"]}
      backgroundColor={params?.family || params?.premium ? colors.background : colors.block}
      header={
        <View style={styles.headerContainer}>
          <Logo preset={!isDark ? "locker-premium" : "locker-premium-dark"} style={styles.logo} />
          <PressableIcon icon="x" onPress={navigation.goBack} disabled={processPayment} />
        </View>
      }
      contentContainerStyle={styles.flex}
    >
      {params?.family && <FamilyPayment isProcessPayment={processPayment} purchase={purchase} />}
      {params?.premium && <PremiumPayment isProcessPayment={processPayment} purchase={purchase} />}
      {!params?.family && !params?.premium && (
        <View style={styles.flex}>
          <PremiumBenefits />

          <PricePlan
            subscriptions={subscriptions}
            isProcessPayment={processPayment}
            purchase={purchase}
          />
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    flexDirection: "row",
    height: 56,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  logo: {
    height: 32,
    width: 152,
  },
})
