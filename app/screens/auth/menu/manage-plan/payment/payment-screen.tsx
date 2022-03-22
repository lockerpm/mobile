import React, { useState, useEffect, useCallback } from "react"
import { View, StyleSheet, TouchableOpacity, Alert, Image, EmitterSubscription, Platform } from "react-native"
import { Text, Layout } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { observer } from "mobx-react-lite"
import { PremiumBenefits } from "./premium-benefits"
import { IS_IOS } from '../../../../../config/constants'
import { PricePlan } from "./price-plan"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { Logger } from "../../../../../utils/logger"

import RNIap, {
  PurchaseError,
  Subscription,
  SubscriptionPurchase,
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';

// control init premium benefit tab
type ScreenProp = RouteProp<PrimaryParamList, 'payment'>;

let purchaseUpdateSubscription: EmitterSubscription;
let purchaseErrorSubscription: EmitterSubscription;

const subSkus = Platform.select({
  default: ["pm_family_monthly",
    "pm_family_yearly",
    "pm_premium_monthly",
    "pm_premium_yearly"],
});



export const PaymentScreen = observer(function PaymentScreen() {
  const { translate, color, isDark } = useMixins()
  const { user } = useStores()
  const navigation = useNavigation();
  const route = useRoute<ScreenProp>();

  // -------------------- STATE ----------------------
  const [subcriptions, setSubcriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState<boolean>(true);
  const [payIndividual, setPayIndividual] = useState(true)
  const [isEnable, setEnable] = useState(true)
  const [isContentOverlayLoading, setIsContentOverlayLoading] = useState(false)


  const getSubscription = useCallback(async (): Promise<void> => {

    try {
      const result = await RNIap.initConnection();
      if (result === false) {
        Alert.alert("couldn't get in-app-purchase information");
        return;
      }
    } catch (err) {
      Logger.error({ 'initConnection': err })
      Alert.alert('Fail to get in-app-purchase information');
    }

    RNIap.clearTransactionIOS()

    purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: SubscriptionPurchase) => {
        setIsContentOverlayLoading(true)
        console.log("--------------------------------------------")
        var verified: boolean = false;
        
        // if (IS_IOS) {
        //   verified = await user.purchaseValidation(purchase.transactionReceipt)
        // } else {
        //   verified = await user.purchaseValidation(purchase.purchaseToken, purchase.productId)
        // }
        // if (!verified) {
        //   // conclude the purchase is fraudulent, etc...
        //   setIsContentOverlayLoading(false)
        //   Alert.alert(
        //     "Purchase Verification",
        //     "Locker can not verify your purchase",
        //     [
        //       { text: "OK", onPress: () =>{}}
        //     ]
        //   )
        // } else {
        try {
          const ackResult = await finishTransaction(purchase);
          Logger.debug({ 'ackResult': ackResult });
          setIsContentOverlayLoading(false)
          navigation.navigate("mainTab")
        } catch (ackErr) {
          Logger.error({ 'ackErr': ackErr });
        }
        // }
      },
    );

    purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        Logger.error({ 'purchaseErrorListener': error });
      },
    );

    const subscriptions = await RNIap.getSubscriptions(subSkus);
    setSubcriptions(subscriptions);
    setLoading(false);
  }, []);

  useEffect(() => {
    getSubscription();

    return (): void => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
    };
  }, []);


  const purchase = (productId: string): void => {

    RNIap.requestSubscription(productId)
    .catch((e) => {
      if (e.code === 'E_USER_CANCELLED') {
        return
      } else {
        Logger.error(JSON.stringify(e))
      }
    });
  
  };


  // -------------------- RENDER ----------------------

  // user choose plan segment
  const Segment = () => {
    return (
      <View
        style={[styles.segment, {
          backgroundColor: color.block,
        }]}
      >
        <TouchableOpacity
          onPress={() => setPayIndividual(true)}
          style={[styles.segmentItem, { backgroundColor: payIndividual ? color.background : color.block, left: 0 }, payIndividual && styles.shadow]}
        >
          <Text preset="bold" style={{ padding: 2, fontSize: 16 }}>{translate("payment.individual")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPayIndividual(false)}
          style={[styles.segmentItem, { backgroundColor: payIndividual ? color.block : color.background, right: 0 }, !payIndividual && styles.shadow]}
        >
          <Text preset="bold" style={{ padding: 2, fontSize: 16 }}>{translate("payment.family")}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Render screen
  return (
    <Layout
      // isContentLoading={loading}
      isContentOverlayLoading={isContentOverlayLoading}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View style={{ top: 0, height: "50%", position: "absolute", width: "100%", justifyContent: "space-between" }}>
        <View style={styles.header}>
          <Image
            source={isDark ? require("./LockerPremiumDark.png") : require("./LockerPremium.png")}
            style={{ height: 32, width: 152 }}
          />
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("./Cross.png")}
              style={{ height: 24, width: 24 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ zIndex: 1, flex: 1 }}>
          <PremiumBenefits benefitTab={route.params.benefitTab} />
        </View>
      </View>

      <View style={[styles.payment, { backgroundColor: color.background }]}>
        <Segment />
        <PricePlan
          onPress={setEnable}
          isEnable={isEnable}
          personal={payIndividual}
          purchase={purchase} />
      </View>
    </Layout>
  )
})

const styles = StyleSheet.create({
  header: {
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 15,
    width: "100%",
  },
  payment: {
    bottom: 0,
    width: "100%",
    position: "absolute",
    height: "54%",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: 20,
  },
  segmentItem: {
    position: "absolute",
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
