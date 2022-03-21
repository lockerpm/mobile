import React, { useState, useEffect } from "react"
import { View, StyleSheet, TouchableOpacity, Alert, Image } from "react-native"
import { Text, Layout } from "../../../../../components"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { observer } from "mobx-react-lite"
import LinearGradient from "react-native-linear-gradient"
import { PremiumBenefits } from "./premium-benefits"
import { IS_IOS } from '../../../../../config/constants'
import { PricePlan } from "./price-plan"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { requestSubscription, useIAP, SubscriptionPurchase, PurchaseError } from 'react-native-iap';



// control init premium benefit tab
type ScreenProp = RouteProp<PrimaryParamList, 'payment'>;

export const PaymentScreen = observer(function PaymentScreen() {
  const {
    connected,
    subscriptions,
    getSubscriptions,
    finishTransaction,
    currentPurchase,
    currentPurchaseError,
  } = useIAP();
  const { translate, color } = useMixins()
  const { user } = useStores()
  const navigation = useNavigation();
  const route = useRoute<ScreenProp>();

  // -------------------- STATE ----------------------
  const [payIndividual, setPayIndividual] = useState(true)
  const [isEnable, setEnable] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [purchased, setPurchased] = useState(false)



  const subSkus = [
    "pm_family_monthly",
    "pm_family_yearly",
    "pm_premium_monthly",
    "pm_premium_yearly"
  ]

  useEffect(() => {
    getSubscriptions(subSkus);
  }, [connected, getSubscriptions]);

  // useEffect(() => {
  //   setReload(true)
  // }, [subscriptions]);

  useEffect(() => {
    const checkCurrentPurchase = async (purchase?: SubscriptionPurchase): Promise<void> => {
      if (purchase && !purchased) {
        var verified: boolean = false;
        // setIsLoading(true)
        if (IS_IOS) {
          console.log("ios");
          console.log(purchase.transactionReceipt);
          verified = await user.purchaseValidation(purchase.transactionReceipt)
        } else {
          console.log("android");
          console.log(purchase.purchaseToken, purchase.productId);
          verified = await user.purchaseValidation(purchase.purchaseToken, purchase.productId)
        }

        console.log("verified ", verified)

        if (!verified) {
          // conclude the purchase is fraudulent, etc...
          // setIsLoading(false)
          Alert.alert(
            "Purchase Verification",
            "Locker can not verify your purchase",
            [
              { text: "OK", onPress: () => console.log("OK Pressed") }
            ]
          )
        }
        try {
          const ackResult = await finishTransaction(purchase);
          console.log('ackResult', ackResult);
          // setIsLoading(false)
          navigation.navigate("mainTab")
        } catch (ackErr) {
          console.warn('ackErr', ackErr);
        }

      }
    };

    checkCurrentPurchase(currentPurchase);
  }, [currentPurchase, finishTransaction]);

  const purchase = (subID: string) => {
    console.log("request subId: ", subID);
    requestSubscription(subID);
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
          style={[styles.segmentItem, { backgroundColor: payIndividual ? color.white : color.block, left: 0 }, payIndividual && styles.shadow]}
        >
          <Text preset="bold" style={{ padding: 2, fontSize:16 }}>{translate("payment.individual")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPayIndividual(false)}
          style={[styles.segmentItem, { backgroundColor: payIndividual ? color.block : color.white, right: 0 }, !payIndividual && styles.shadow]}
        >
          <Text preset="bold" style={{ padding: 2, fontSize:16 }}>{translate("payment.family")}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Render screen
  return (
    <Layout
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View style={{ top: 0, height: "50%", position: "absolute", width: "100%", justifyContent: "space-between" }}>
        <View style={styles.header}>
          <Image source={require("./LockerPremium.png")} style={{ height: 32, width: 152 }} />
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image source={require("./Cross.png")} style={{ height: 24, width: 24 }} />
          </TouchableOpacity>
        </View>
        <View style={{ zIndex: 1, flex: 1 }}>
          <PremiumBenefits benefitTab={route.params.benefitTab} />
        </View>
      </View>

      <View style={[styles.payment, { backgroundColor: color.background }]}>
        <Segment />
        <PricePlan isLoading={isLoading} onPress={setEnable} isEnable={isEnable} personal={payIndividual} purchase={purchase} />
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
