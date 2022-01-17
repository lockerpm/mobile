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


  const planFeatures = {
    "free" : ["Secure passwords and data", "Auto-fill on browsers and mobile devices", "Generate strong passwords and 2-factor authenticator", "Sync data between devices"],
    "premium": ["Unlimited storage", "Data Breach Scanner", "Emergency access", "Share passwords"],
    "family": ["Unlimited storage", "Data Breach Scanner", "Emergency access", "Share passwords"]
  }


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
              return <Plan onSelect={setPlanIdSelected} selected={planIdSelected} plan={i} features={planFeatures[i.name.toLocaleLowerCase()]}  ></Plan>
            })
          }



          
          {/* <Plan onSelect={setPlanIdSelected} selected={planIdSelected} plan={plan_test[1]} ></Plan>
          <Plan onSelect={setPlanIdSelected} selected={planIdSelected} plan={plan_test[2]} ></Plan> */}

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



