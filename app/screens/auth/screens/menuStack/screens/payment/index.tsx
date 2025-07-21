import { useState, useEffect, FC } from "react"
import { View, Alert, Platform, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import { Logo, PressableIcon, Screen } from "app/components/cores"

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
import { MenuScreenProps } from "app/navigators"
import { useToast } from "app/services/utils"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { Logger } from "@/utils/logger"

const subSkus = [SKU.PRE_MON, SKU.PRE_YEAR, SKU.FAM_MON, SKU.FAM_YEAR]

const IS_IOS = Platform.OS === "ios"
const IS_ANDROID = Platform.OS === "android"

export const PaymentScreen: FC<MenuScreenProps<"payment">> = observer(
  ({ navigation, route: { params } }) => {
    const { subscriptions, getSubscriptions, currentPurchase, finishTransaction } = useIAP()
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
          if (subscription && "subscriptionOfferDetails" in subscription) {
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
                currentPurchase.originalTransactionIdentifierIOS
              )
            } else {
              res = await user.purchaseValidation(
                currentPurchase.purchaseToken,
                currentPurchase.productId
              )
            }
            if (res.kind === "ok") {
              if (res.data.success) {
                await user.loadPlan()
                navigation.navigate("welcomePremium")
              } else {
                Alert.alert(translate("manage_plan:verify"), res.data.detail)
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
      if (params?.family)
        return <FamilyPayment isProcessPayment={processPayment} purchase={purchase} />
      if (params?.premium)
        return <PremiumPayment isProcessPayment={processPayment} purchase={purchase} />

      return (
        <View style={styles.flex}>
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
        <Content />
      </Screen>
    )
  }
)

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
