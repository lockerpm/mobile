import React, { createContext, useState, useEffect, useCallback, useRef, useContext } from "react"
import { Text, View, StyleSheet, TouchableHighlight, TouchableOpacity } from "react-native"

import { Button } from "../../../../../components"
import { Layout, Header } from "../../../../../components"
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

export const PaymentScreen = observer(function PaymentScreen() {
    const navigation = useNavigation();
  const [payIndividual, setPayIndividual] = useState(true)
  const [isEnable, setEnable] = React.useState(true)
  const DescribeItem = ({ node, text }) => {
    const Icon = node
    return (
      <View style={{ flexDirection: "row", padding: 7 }}>
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
        style={[styles.segment,{
          backgroundColor: "#EBEBEB",
        }]}
      >
        <TouchableOpacity
          onPress={() => setPayIndividual(true)}
          style={[styles.planItem, { backgroundColor: payIndividual ? "white" : "#EBEBEB" }]}
        >
          <Text style={styles.h6}>Individual</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPayIndividual(false)}
          style={[styles.planItem, { backgroundColor: payIndividual ? "#EBEBEB" : "white" }]}
        >
          <Text style={styles.h6}>Family</Text>
        </TouchableOpacity>
      </View>
    )
  }
  return (
    // Within your render function
    <LinearGradient colors={["#268334", "#000000"]} style={{ flex: 1 }}>
      <View>
        <View style={styles.header}>
          <LockerPremium />
          <TouchableHighlight onPress={() => navigation.goBack()}>
            <DeleteIcon />
          </TouchableHighlight>
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

          <PricePlan
            onPress={() => setEnable(true)}
            isEnable={isEnable}
            onSale={true}
            title="$1.29/ month"
            subtitle="$15.48 billed every 12 months"
          />
          <PricePlan
            onPress={() => setEnable(false)}
            isEnable={!isEnable}
            title="$4.99/ month"
            subtitle="Billed monthly"
          />
        </View>
        <Button style={{ marginLeft: 20, marginRight: 20, flexDirection: "column", marginTop:10 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", fontStyle: "normal", color: "white" }}>
            Upgrade now for $15.48
          </Text>
          <Text style={{ fontSize: 12,  color: "white"}}>Recurring billing. Cancel anytime</Text>
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
  }
})
