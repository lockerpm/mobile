import React, { useState, useEffect, useCallback } from "react"
import { View, StyleSheet, TouchableOpacity, Alert, Image, EmitterSubscription } from "react-native"
import { Text, Layout, Button } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { observer } from "mobx-react-lite"
import { PremiumBenefits } from "./premium-benefits"
import { IS_IOS } from '../../../../../config/constants'
import { SKU } from "./price-plan.sku"
import { PricePlan } from "./price-plan"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { Logger } from "../../../../../utils/logger"
import { FamilyPayment } from "./family-payment/family-payment"

import RNIap, {
  PurchaseError,
  Subscription,
  SubscriptionPurchase,
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
  presentCodeRedemptionSheetIOS
} from 'react-native-iap';
import { PurchaseValidationResult } from "../../../../../services/api"

// control init premium benefit tab
type ScreenProp = RouteProp<PrimaryParamList, 'payment'>;

let purchaseUpdateSubscription: EmitterSubscription;
let purchaseErrorSubscription: EmitterSubscription;

const subSkus = [
  SKU.PRE_MON,
  SKU.PRE_YEAR,
  SKU.FAM_MON,
  SKU.FAM_YEAR
]

export const PaymentScreen = observer(function PaymentScreen() {
  const { translate, color, isDark, notifyApiError } = useMixins()
  const navigation = useNavigation();
  const route = useRoute<ScreenProp>();
  const { user, uiStore } = useStores()

  // -------------------- STATE ----------------------
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [processPayment, setProcessPayment] = useState<boolean>(false);
  const [payIndividual, setPayIndividual] = useState(true)
  const [isEnable, setEnable] = useState(true)
  const [isTrial, setIsTrial] = useState(false)

  // -------------------- METHOD ----------------------

  const getEligibleTrial = async () => {
    const res = await user.getTrialEligible()
    if (res.kind === "ok") {
      setIsTrial(!res.data.personal_trial_applied)
    } else {
      notifyApiError(res)
    }
  }

  const getSubscription = useCallback(async (): Promise<void> => {
    try {
      await RNIap.initConnection();
      if (!IS_IOS) {
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      }
      else {
        if (__DEV__) await RNIap.clearTransactionIOS();
      }

      const subs = await RNIap.getSubscriptions(subSkus);
      setSubscriptions(subs);
    } catch (err) {
      Logger.error({ 'initConnection': err })
      Alert.alert('Fail to get in-app-purchase information', "",
        [
          { text: "OK", onPress: () => { navigation.goBack() } }
        ]);
    }


    purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: SubscriptionPurchase) => {
        if (purchase) {

          const receipt = purchase.transactionReceipt
          if (receipt) {
            try {
              const ackResult = await finishTransaction(purchase);
              Logger.debug({ 'ackResult': ackResult });
            } catch (ackErr) {
              Logger.error({ 'ackErr': ackErr });
            }

            var res: PurchaseValidationResult;
            if (IS_IOS) {
              res = await user.purchaseValidation(purchase.transactionReceipt, purchase.productId, purchase.originalTransactionIdentifierIOS)
            } else {
              res = await user.purchaseValidation(purchase.purchaseToken, purchase.productId)
            }
            if (res.kind === "ok") {
              if (res.data.success) {
                await user.loadPlan()
                uiStore.setShowWelcomePremium(true)
                navigation.navigate("welcome_premium")
              }
              else {
                Alert.alert(
                  translate("manage_plan.verify"),
                  res.data.detail,
                )
              }
            } else {
              notifyApiError(res)
            }
            setProcessPayment(false)
          }
        }
      }
    );

    purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        Logger.error({ 'purchaseErrorListener': error });
      },
    );
  }, []);

  const purchase = async (productId: string) => {
    setProcessPayment(true)
    if (IS_IOS) {
      RNIap.clearTransactionIOS()
    }

    RNIap.requestSubscription(productId)
      .catch((error) => {
        setProcessPayment(false)
        if (error.code !== 'E_USER_CANCELLED') {
          Logger.debug(JSON.stringify(error))
        }
      });

  };



  // -------------------- EFFECT ----------------------


  useEffect(() => {
    getSubscription();
    return (): void => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      RNIap.endConnection();
    };
  }, []);

  useEffect(() => {
    getEligibleTrial()
  }, [])

  // ------------------ RENDER ----------------------

  // user selects plan segment
  const Segment = () => {
    return (
      <View
        style={[styles.segment, {
          backgroundColor: color.block,
          maxWidth: 500,
          alignSelf: "center"
        }]}
      >
        <Button
        preset="link"
          onPress={() => setPayIndividual(true)}
          style={[styles.segmentItem, { backgroundColor: payIndividual ? color.background : color.block, left: 0 }, payIndividual && styles.shadow]}
        >
          <Text preset="bold" style={{ padding: 2, fontSize: 16 }}>{translate("payment.individual")}</Text>
        </Button>
        <TouchableOpacity
          onPress={() => setPayIndividual(false)}
          style={[styles.segmentItem, { backgroundColor: payIndividual ? color.block : color.background, right: 0 }, !payIndividual && styles.shadow]}
        >
          <Text preset="bold" style={{ padding: 2, fontSize: 16 }}>{translate("payment.family_text")}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Render screen
  return (
    <Layout
      containerStyle={{ backgroundColor: route.params.family ? color.background : color.block, paddingHorizontal: 0 }}
      header={<View style={{
        flexDirection: "row",
        justifyContent: "space-between",
      }}>
        <Image
          source={isDark ? require("./LockerPremiumDark.png") : require("./LockerPremium.png")}
          style={{ height: 32, width: 152 }}
        />
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={processPayment}>
          <Image
            source={require("./Cross.png")}
            style={{ height: 24, width: 24 }}
          />
        </TouchableOpacity>
      </View>}

    >
      {
        route.params.family && (
          <FamilyPayment
            isTrial={isTrial}
            subscriptions={subscriptions}
            onPress={setEnable}
            isProcessPayment={processPayment}
            isEnable={isEnable}
            purchase={purchase} />
        )
      }
      {
        !route.params.family && (
          <View>
            <View style={{ flex: 1, top: 0, minHeight: 310, width: "100%", zIndex: 1 }}>
              <PremiumBenefits benefitTab={route.params.benefitTab} />
            </View>

            <View style={[styles.payment, { backgroundColor: color.background }]}>
              <Segment/>
              <PricePlan
                isTrial={isTrial}
                subscriptions={subscriptions}
                onPress={setEnable}
                isProcessPayment={processPayment}
                isEnable={isEnable}
                personal={payIndividual}
                purchase={purchase}
              />
              {IS_IOS && <Button
                preset="link"
                style={{
                  marginBottom: 20
                }}
                onPress={() => presentCodeRedemptionSheetIOS()}>
                <Text style={{ fontSize: 18, color: "#007AFF" }}>
                  Redeem code
                </Text>
              </Button>}
            </View>
          </View>)}
    </Layout>
  )
})

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 15,
    width: "100%",
  },
  payment: {
    width: "100%",
    flex: 1,
    borderRadius: 15,
    marginTop: 20,
  },
  segmentItem: {
    margin: 2,
    padding: 2,
    borderRadius: 6,
    width: "49%",
    alignItems: "center",

  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  segment: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    height: 32,
    borderRadius: 6,
  },
})
