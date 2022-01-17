import React, { useState, useEffect } from "react"
import { View, StyleSheet, Platform, Text } from "react-native"
import { Layout, Header } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../../theme"
import { useMixins } from "../../../../../services/mixins"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../../models"
// import {GooglePayScreen} from "./payment/goole-pay"
// import {ApplePayScreen} from "./payment/apple-pay"
import Plan from "./plan-item"


export const PlanScreen = observer(function PlanScreen() {
  const navigation = useNavigation();
  const { translate, notify, color } = useMixins();
  const { planStore } = useStores();
  const { plans } = planStore

  const [isLoading, setIsLoading] = useState(false);
  const [planIdSelected, setPlanIdSelected] = useState(0);

  const fetchPlans = async () => {
    setIsLoading(true);
    await planStore.getPlans()
    setIsLoading(false);
  }


  useEffect(() => {
    setTimeout(fetchPlans, 1)
  }, [])

  // const {plans} = planStore




  const plan_test = [
    {
      id: 0,
      label: "free",
      description: "Secure passwords and enjoy Locker’s essential features.",
      price: "0 usd",
      priceDescription: "/mo /1 member",
      features: ["Secure passwords and data", "Auto-fill on browsers and mobile devices", "Generate strong passwords and 2-factor authenticator", "Sync data between devices"]
    },
    {
      id: 1,
      label: "premium",
      description: "Enhance experiences with additional utility features.",
      price: "5 usd",
      priceDescription: "/mo /1 member",
      features: ["Unlimited storage", "Data Breach Scanner", "Emergency access", "Share passwords"]
    },
    {
      id: 2,
      label: "family",
      description: "Get the most out of Locker with unlimited storage",
      price: "10 usd",
      priceDescription: "/mo /6 members",
      features: ["Unlimited storage", "Data Breach Scanner", "Emergency access", "Share passwords"]
    }
  ]

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('settings.import')}
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View style={[commonStyles.GRAY_SCREEN_SECTION, {
        backgroundColor: color.background,
        paddingVertical: 20
      }]}>
        <View style={styles.row}>
          {
            plans.map((i) => {
              return <Text> {i.name}</Text>
            })
          }



          <Plan onSelect={setPlanIdSelected} selected={planIdSelected} plan={plan_test[0]} ></Plan>
          <Plan onSelect={setPlanIdSelected} selected={planIdSelected} plan={plan_test[1]} ></Plan>
          <Plan onSelect={setPlanIdSelected} selected={planIdSelected} plan={plan_test[2]} ></Plan>

          {/* {Platform.OS === 'android' && planIdSelected !== 0 &&(
            <GooglePayScreen  planId={planIdSelected} />
          )}

          {Platform.OS === 'ios' && planIdSelected !== 0 &&(
            <ApplePayScreen planId={planIdSelected}/>
          )} */}

        </View>
      </View>
    </Layout>
  )
})

const styles = StyleSheet.create({
  row: {
    marginTop: 30,
  },
  payButton: {
    width: 152,
    height: 40,
  },
  standardButton: {
    width: 90,
    height: 40,
  },
});



