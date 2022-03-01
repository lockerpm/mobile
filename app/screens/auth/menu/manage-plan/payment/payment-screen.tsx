import React, { useState, useEffect } from "react"
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native"

import { Button } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../../services/mixins"
import { observer } from "mobx-react-lite"
import LinearGradient from "react-native-linear-gradient"

// @ts-ignore
import LockerPremium from "./locker-premium.svg"
// @ts-ignore
import LockSimpleIcon from "./lock-simple.svg"
// @ts-ignore
import DeleteIcon from "./delete.svg"
// @ts-ignore
import MegaphoneIcon from "./megaphone-simple.svg"
// @ts-ignore
import ShieldIcon from "./shield-check.svg"
// @ts-ignore
import UsersIcon from "./users.svg"

import { PricePlan } from "./price-plan"

import { requestSubscription, useIAP, Purchase, Subscription } from 'react-native-iap';


const subSkus = [
  'com.cystack.lockerapp.per.premium.year',
  'com.cystack.lockerapp.per.premium.mon',
  'com.cystack.lockerapp.fam.premium.year',
  'com.cystack.lockerapp.fam.premium.mon'
]

export const PaymentScreen = observer(function PaymentScreen() {
  const navigation = useNavigation();
  const [payIndividual, setPayIndividual] = useState(true)
  const [isEnable, setEnable] = React.useState(true)

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
      mon: {
        lockerId: "1",
        subId: 'com.cystack.lockerapp.per.premium.mon',
        title: "$4.99/ month",
        subtitle: "Billed monthly",
        sale: "",
        pay_title: "Upgrade now for $4.99"
      },
      year: {
        lockerId: "1",
        subId: 'com.cystack.lockerapp.per.premium.year',
        title: "$1.29/ month",
        subtitle: "$15.48 billed every 12 months",
        sale: "Save 75%",
        pay_title: "Upgrade now for $15.48"
      },
    },
    fam: {
      mon: {
        lockerId: "1",
        subId: 'com.cystack.lockerapp.fam.premium.mon',
        title: "$0.99/ month",
        subtitle: "Per member. $71.88 billed every 12 months",
        sale: "Save 80%",
        pay_title: "Upgrade now for $71.88"
      },
      year: {
        lockerId: "1",
        subId: 'com.cystack.lockerapp.fam.premium.year',
        title: "$1.6/ month",
        subtitle: "Per member. $9.99 billed monthly.",
        sale: "Save 67%",
        pay_title: "Upgrade now for $9.99"
      }
    }
  }

  var currentPriceSegment = payIndividual ? price.per : price.fam

  useEffect(() => {
    getSubscriptions(subSkus);
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
            Alert.alert(
              "purchase success",
              "My Alert Msg",
              [
                {
                  text: "Cancel",
                  onPress: () => console.log("Cancel Pressed"),
                  style: "cancel"
                },
                { text: "OK", onPress: () => console.log("OK Pressed") }
              ]
            );
          } catch (ackErr) {
            Alert.alert(
              "purchase cancel",
              "My Alert Msg",
              [
                {
                  text: "Cancel",
                  onPress: () => console.log("Cancel Pressed"),
                  style: "cancel"
                },
                { text: "OK", onPress: () => console.log("OK Pressed") }
              ]
            );
            console.warn('ackErr', ackErr);
          }
      }
    };
    checkCurrentPurchase(currentPurchase);
  }, [currentPurchase, finishTransaction]);




  const purchase = (items: Subscription[]): void => {
    // if (item.type === 'iap') requestPurchase(item.productId);
    var subID = isEnable? currentPriceSegment.year.subId : currentPriceSegment.mon.subId
    console.log(subID);
    
    requestSubscription(subID);
  };


  const DescribeItem = ({ node, text }) => {
    const Icon = node
    return (
      <View style={{ flexDirection: "row", padding: 5 }}>
        <Icon />
        <Text
          style={[
            styles.p1,
            {
              color: "white",
              marginLeft: 11,
              marginRight: 35,
            },
          ]}
        >
          {text}
        </Text>
      </View>
    )
  }

  const Segment = () => {
    return (
      <View
        style={[styles.segment, {
          backgroundColor: "#EBEBEB",
        }]}
      >
        <TouchableOpacity
          onPress={() => setPayIndividual(true)}
          style={[styles.planItem, { backgroundColor: payIndividual ? "white" : "#EBEBEB" }]}
        >
          <Text style={[styles.h6, { marginTop: 4 }]}>Individual</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPayIndividual(false)}
          style={[styles.planItem, { backgroundColor: payIndividual ? "#EBEBEB" : "white" }]}
        >
          <Text style={[styles.h6, { marginTop: 4 }]}>Family</Text>
        </TouchableOpacity>
      </View>
    )
  }
  return (
    // Within your render function
    <LinearGradient colors={["#268334", "#000000"]} style={{ flex: 1 }}>
      <View style={{flex: 1, height: "20%", position: "absolute", width: "100%"}}>
        <View style={styles.header}>
          <LockerPremium />
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <DeleteIcon />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <Text style={{ color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
            Upgrade to Locker Premium to Unlock All These Features
          </Text>
          <DescribeItem
            node={LockSimpleIcon}
            text="Unlimited Passwords, Secure Notes, Payment Cards, Identities, Crypto Assets"
          />
          <DescribeItem
            node={ShieldIcon}
            text="Dark Web Monitoring protects your accounts from massive data breaches"
          />
          <DescribeItem
            node={MegaphoneIcon}
            text="Emergency Contact let trusted accounts access your vault when needed"
          />
          <DescribeItem
            node={UsersIcon}
            text="Share Passwords and items securely with your friends and family members."
          />
        </View>
      </View>
      <View
        style={[
          styles.payment,
          {
            backgroundColor: "white",
          },
        ]}
      >
        <Segment />
        <View style={{ marginLeft: 20, marginRight: 20 }}>
          <Text style={[styles.p1, { marginTop: 10, marginBottom: 10 }]}>
            Enjoy all Locker Premium features with Yearly Plan to save up to 75%.
          </Text>

          <PricePlan onPress={setEnable} isEnable={isEnable} plan={currentPriceSegment} />

        </View>
        <Button style={styles.payButton} onPress={() => purchase(subscriptions)}>
          <Text style={{ fontSize: 16, fontWeight: "600", fontStyle: "normal", color: "white" }}>
            {isEnable ? currentPriceSegment.year.pay_title : currentPriceSegment.mon.pay_title}
          </Text>
          <Text style={{ fontSize: 12, color: "white" }}>Recurring billing. Cancel anytime</Text>
        </Button>
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
    padding: 15,
    width: "100%",
  },
  content: {
    paddingLeft: 15,
    width: "100%",
    color: "white",
  },
  payment: {
    flex: 1,
    bottom: 0,
    position: "absolute",
    height: "50%",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginTop: 15,
  },
  planItem: {
    height: "86%",
    margin: 2,
    borderRadius: 7,
    width: "49%",
    alignItems: "center",
  },
  segment: {
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
    height: 32,
    borderRadius: 7,
  },
  payButton: {
    marginLeft: 20,
    marginRight: 20,
    flexDirection: "column",
    marginTop: 20,
  }
})
