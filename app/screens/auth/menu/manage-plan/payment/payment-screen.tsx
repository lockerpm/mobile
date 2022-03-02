import React, { useState, useEffect } from "react"
import { Text, View, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../../services/mixins"
import { observer } from "mobx-react-lite"
import LinearGradient from "react-native-linear-gradient"
import { PremiumBenefits } from "./premium-benefits"
import { IS_IOS } from '../../../../../config/constants'
import { PricePlan } from "./price-plan"
import { requestSubscription, useIAP, Purchase, Subscription } from 'react-native-iap';


// @ts-ignore
import LockerPremium from "./LockerPremium.svg"
// @ts-ignore
import DeleteIcon from "./delete.svg"



const subSkus = [
  'com.cystack.lockerapp.per.premium.year',
  'com.cystack.lockerapp.per.premium.mon',
  // 'com.cystack.lockerapp.fam.premium.year',
  // 'com.cystack.lockerapp.fam.premium.mon'
]

export const PaymentScreen = observer(function PaymentScreen() {
  const { translate } = useMixins()
  const navigation = useNavigation();
  const [payIndividual, setPayIndividual] = useState(true)
  const [isEnable, setEnable] = useState(true)

  const {
    connected,
    subscriptions,
    getSubscriptions,
    finishTransaction,
    currentPurchase,
    currentPurchaseError,
  } = useIAP();

  const price = {
    per: {
      monthly: {
        subId: 'com.cystack.lockerapp.per.premium.mon',
      },
      yearly: {
        subId: 'com.cystack.lockerapp.per.premium.year',
      },
    },
    fam: {
      monthly: {
        subId: 'com.cystack.lockerapp.fam.premium.mon',
      },
      yearly: {
        subId: 'com.cystack.lockerapp.fam.premium.year',
      }
    }
  }

  var currentPriceSegment = payIndividual ? price.per : price.fam

  useEffect(() => {
    getSubscriptions(subSkus);
    console.log(subscriptions);

  }, [getSubscriptions]);

  useEffect(() => {
    const checkCurrentPurchase = async (purchase?: Purchase): Promise<void> => {
      if (purchase) {
        const receipt = purchase.transactionReceipt;
        if (receipt)
          console.log(receipt);

        try {
          const ackResult = await finishTransaction(purchase);
          console.log('ackResult', ackResult);
        } catch (ackErr) {
          console.warn('ackErr', ackErr);
        }
      }
    };
    checkCurrentPurchase(currentPurchase);
  }, [currentPurchase, finishTransaction]);

  const purchase = (items: Subscription[]): void => {
    // if (item.type === 'iap') requestPurchase(item.productId);
    var subID = isEnable ? currentPriceSegment.yearly.subId : currentPriceSegment.monthly.subId
    console.log(subID);

    requestSubscription(subID);
  };


  const Segment = () => {
    return (
      <View
        style={[styles.segment, {
          backgroundColor: "#EBEBEB",
        }]}
      >
        <TouchableOpacity
          onPress={() => setPayIndividual(true)}
          style={[styles.segmentItem, { backgroundColor: payIndividual ? "white" : "#EBEBEB", left: 0 }]}
        >
          <Text style={[styles.h6, { marginTop: 4 }]}>{translate("payment.individual")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPayIndividual(false)}
          style={[styles.segmentItem, { backgroundColor: payIndividual ? "#EBEBEB" : "white", right: 0  }]}
        >
          <Text style={[styles.h6, { marginTop: 4 }]}>{translate("payment.family")}</Text>
        </TouchableOpacity>
      </View>
    )
  }
  return (
    // Within your render function
    <LinearGradient colors={["#ffffff", "#268334"]} style={{ flex: 1 }}>
      <View style={{ top: 0, height: "50%", position: "absolute", width: "100%", justifyContent: "space-between" }}>
        <View style={[styles.header, { marginTop: IS_IOS ? 40 : 20}]}>
          <LockerPremium />
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <DeleteIcon />
          </TouchableOpacity>
        </View>
        <View style={{ zIndex: 1 }}>
          <PremiumBenefits />
        </View>
      </View>

      <View style={[styles.payment, { backgroundColor: "white" }]}>
        <Segment />
        <PricePlan onPress={setEnable} isEnable={isEnable} personal={payIndividual} />
      </View>
    </LinearGradient>
  )
})

const styles = StyleSheet.create({
  p1: {
    fontSize: 14,
    fontWeight: "400",
  },
  h6: {
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    width: "100%",
  },
  content: {
    justifyContent: 'center',
    paddingLeft: 15,
    width: "100%",
    color: "white",
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
