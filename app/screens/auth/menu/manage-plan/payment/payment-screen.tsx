import React, { useState, useEffect } from "react"
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { Text } from "../../../../../components"
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

// @ts-ignore
import LockerPremium from "./LockerPremium.svg"
// @ts-ignore
import DeleteIcon from "./delete.svg"


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
  const [reload, setReload] = useState(false)
  const [purchased, setPurchased] = useState(false)
  
  
  const subSkus = [
    "pm_family_monthly",
    "pm_family_yearly",
    "pm_premium_monthly",
    "pm_premium_yearly"
  ]

  useEffect(() => {
    getSubscriptions(subSkus);
  }, [ connected ,getSubscriptions]);

  // useEffect(() => {
  //   setReload(true)
  // }, [subscriptions]);

  useEffect(() => {
    const checkCurrentPurchase = async (purchase?: SubscriptionPurchase): Promise<void> => {
      if (purchase && !purchased) {
        var verified: boolean = false;
        if (IS_IOS) {
          verified = await user.purchaseValidation(purchase.transactionReceipt)
        } {
          console.log(purchase.purchaseToken, purchase.productId );
          
          verified = await user.purchaseValidation(purchase.purchaseToken, purchase.productId )
        }
        if (verified) {
          try {
            const ackResult = await finishTransaction(purchase);
            console.log('ackResult', ackResult);
          } catch (ackErr) {
            console.warn('ackErr', ackErr);
          }
          navigation.navigate("mainTab")
        } else{
          // conclude the purchase is fraudulent, etc...
          Alert.alert(
            "Purchase Verification",
            "Locker can not verify your purchase",
            [
              { text: "OK", onPress: () => console.log("OK Pressed") }
            ]
          )
        }
      }
    };

    checkCurrentPurchase(currentPurchase);
  }, [currentPurchase, finishTransaction]);

  const purchase = (subID : string) => {
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
          style={[styles.segmentItem, { backgroundColor: payIndividual ? color.text : color.block, left: 0 }]}
        >
          <Text preset="semibold" style={{ padding: 2, color:  color.white }}>{translate("payment.individual")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPayIndividual(false)}
          style={[styles.segmentItem, { backgroundColor: payIndividual ? color.block : color.text, right: 0  }]}
        >
          <Text preset="semibold" style={{ padding: 2, color: color.white }}>{translate("payment.family")}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Render screen
  return (
    <LinearGradient colors={[color.white, color.primary]} style={{ flex: 1 }}>
      <View style={{ top: 0, height: "50%", position: "absolute", width: "100%", justifyContent: "space-between" }}>
        <View style={[styles.header, { marginTop: IS_IOS ? 40 : 20}]}>
          <LockerPremium />
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <DeleteIcon />
          </TouchableOpacity>
        </View>
        <View style={{ zIndex: 1 }}>
          <PremiumBenefits benefitTab={route.params.benefitTab}  />
        </View>
      </View>

      <View style={[styles.payment, { backgroundColor: color.background }]}>
        <Segment />
        <PricePlan onPress={setEnable} isEnable={isEnable} personal={payIndividual} purchase={purchase}/>
      </View>
    </LinearGradient>
  )
})

const styles = StyleSheet.create({
  header: {
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    width: "100%",
  },
  payment: {
    flex: 1,
    bottom: 0,
    width: "100%",
    position: "absolute",
    height: "50%",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: 15,
  },
  segmentItem: {
    position: "absolute",
    margin: 2, 
    padding: 2,
    borderRadius: 6,
    width: "49%",
    alignItems: "center",
  },
  segment: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection:"row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    height: 32,
    borderRadius: 6,
  },
})
