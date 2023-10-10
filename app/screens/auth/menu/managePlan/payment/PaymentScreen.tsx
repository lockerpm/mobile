/* eslint-disable react-native/no-unused-styles */
import React, { useState, useEffect, FC } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { observer } from 'mobx-react-lite'
import { AppStackScreenProps } from 'app/navigators'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { Logger } from 'app/utils/utils'
import { translate } from 'app/i18n'
import { Icon, Logo, Screen, Text } from 'app/components/cores'


import {
  PurchaseError,
  requestSubscription,
  useIAP,
} from 'react-native-iap'
import { SKU } from './PricePlan.sku'

import { PremiumBenefits } from './PremiumBenefits'
import { PricePlan } from './PricePlan'
import { FamilyPayment } from './familyPayment/FamilyPayment'
import { PremiumPayment } from './premiumPayment/PremiumPayment'

const subSkus = [SKU.PRE_MON, SKU.PRE_YEAR, SKU.FAM_MON, SKU.FAM_YEAR]

export const PaymentScreen: FC<AppStackScreenProps<'payment'>> = observer((props) => {
  const {
    subscriptions,
    getSubscriptions,
    currentPurchase,
    finishTransaction,
  } = useIAP();


  const { colors, isDark } = useTheme()
  const { notifyApiError } = useHelper()
  const navigation = props.navigation
  const route = props.route
  const { user, uiStore } = useStores()

  // -------------------- STATE ----------------------
  const [ownedSubscriptions, setOwnedSubscriptions] = useState<string[]>([]);

  const [processPayment, setProcessPayment] = useState<boolean>(false)
  const [payIndividual, setPayIndividual] = useState(true)
  const [isEnable, setEnable] = useState(true)
  const [isTrial, setIsTrial] = useState(false)

  // -------------------- METHOD ----------------------

  const getEligibleTrial = async () => {
    const res = await user.getTrialEligible()
    if (res.kind === 'ok') {
      setIsTrial(!res.data.personal_trial_applied)
    } else {
      notifyApiError(res)
    }
  }
  const getSubscription = async () => {
    try {
      await getSubscriptions({ skus: subSkus });
    } catch (error) {
      Logger.error({ message: 'handleGetSubscriptions', error });
      Alert.alert('Fail to get in-app-purchase information', '', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    }
  };

  // const getSubscription = useCallback(async (): Promise<void> => {
  //   try {
  //     await RNIap.initConnection()
  //     if (!IS_IOS) {
  //       await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
  //     } else {
  //       if (__DEV__) await RNIap.clearTransactionIOS()
  //     }

  //     const subs = await RNIap.getSubscriptions(subSkus)
  //     setSubscriptions(subs)
  //   } catch (err) {
  //     Logger.error({ initConnection: err })
  //     Alert.alert('Fail to get in-app-purchase information', '', [
  //       {
  //         text: 'OK',
  //         onPress: () => {
  //           navigation.goBack()
  //         },
  //       },
  //     ])
  //   }

  //   purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: SubscriptionPurchase) => {
  //     if (purchase) {
  //       const receipt = purchase.transactionReceipt
  //       if (receipt) {
  //         try {
  //           const ackResult = await finishTransaction(purchase)
  //           Logger.debug({ ackResult })
  //         } catch (ackErr) {
  //           Logger.error({ ackErr })
  //         }

  //         let res
  //         if (IS_IOS) {
  //           res = await user.purchaseValidation(
  //             purchase.transactionReceipt,
  //             purchase.productId,
  //             purchase.originalTransactionIdentifierIOS
  //           )
  //         } else {
  //           res = await user.purchaseValidation(purchase.purchaseToken, purchase.productId)
  //         }
  //         if (res.kind === 'ok') {
  //           if (res.data.success) {
  //             await user.loadPlan()
  //             uiStore.setShowWelcomePremium(true)
  //             navigation.navigate('welcome_premium')
  //           } else {
  //             Alert.alert(translate('manage_plan.verify'), res.data.detail)
  //           }
  //         } else {
  //           notifyApiError(res)
  //         }
  //         setProcessPayment(false)
  //       }
  //     }
  //   })

  //   purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
  //     Logger.error({ purchaseErrorListener: error })
  //   })
  // }, [])

  const purchase = async (
    productId: string,
    // offerToken?: string,
  ) => {
    // if (isPlay && !offerToken) {
    //   console.warn(
    //     `There are no subscription Offers for selected product (Only requiered for Google Play purchases): ${productId}`,
    //   );
    // }
    try {
      await requestSubscription({
        sku: productId,
        // ...(offerToken && {
        //   subscriptionOffers: [{ sku: productId, offerToken }],
        // }),
      })
    } catch (error) {
      if (error instanceof PurchaseError) {
        Logger.error({ message: `[${error.code}]: ${error.message}`, error });
      } else {
        Logger.error({ message: 'handleBuySubscription', error });
      }
    }
  };

  // -------------------- EFFECT ----------------------

  useEffect(() => {
    getEligibleTrial()
    getSubscription()
  }, [])

  useEffect(() => {
    const checkCurrentPurchase = async () => {
      try {
        if (currentPurchase?.productId) {
          await finishTransaction({
            purchase: currentPurchase,
            isConsumable: true,
          });

          setOwnedSubscriptions((prev) => [
            ...prev,
            currentPurchase?.productId,
          ]);
        }
      } catch (error) {
        if (error instanceof PurchaseError) {
          Logger.error({ message: `[${error.code}]: ${error.message}`, error });
        } else {
          Logger.error({ message: 'handleBuyProduct', error });
        }
      }
    };

    checkCurrentPurchase();
  }, [currentPurchase, finishTransaction]);

  // ------------------ RENDER ----------------------

  // user selects plan segment
  const Segment = () => {
    return (
      <View
        style={[
          styles.segment,
          {
            backgroundColor: colors.block,
            maxWidth: 500,
            alignSelf: 'center',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setPayIndividual(true)}
          style={[
            styles.segmentItem,
            { backgroundColor: payIndividual ? colors.background : colors.block, left: 0 },
            payIndividual && styles.shadow,
          ]}
        >
          <Text preset="bold" style={{ padding: 2, fontSize: 16 }}>
            {translate('payment.individual')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPayIndividual(false)}
          style={[
            styles.segmentItem,
            { backgroundColor: payIndividual ? colors.block : colors.background, right: 0 },
            !payIndividual && styles.shadow,
          ]}
        >
          <Text preset="bold" style={{ padding: 2, fontSize: 16 }}>
            {translate('payment.family_text')}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const Content = () => {
    if (route.params.family) return (
      <FamilyPayment
        isTrial={isTrial}
        subscriptions={subscriptions}
        onPress={setEnable}
        isProcessPayment={processPayment}
        isEnable={isEnable}
        purchase={purchase}
      />
    )
    if (route.params.premium) return (
      <PremiumPayment
        isTrial={isTrial}
        subscriptions={subscriptions}
        onPress={setEnable}
        isProcessPayment={processPayment}
        isEnable={isEnable}
        purchase={purchase}
      />
    )

    return (<View>
      <View style={{ flex: 1, top: 0, minHeight: 310, width: '100%', zIndex: 1 }}>
        <PremiumBenefits benefitTab={route.params.benefitTab} />
      </View>

      <View style={[styles.payment, { backgroundColor: colors.background }]}>
        <Segment />
        <PricePlan
          isTrial={isTrial}
          subscriptions={subscriptions}
          onPress={setEnable}
          isProcessPayment={processPayment}
          isEnable={isEnable}
          personal={payIndividual}
          purchase={purchase}
        />
      </View>
    </View>)
  }

  return (
    <Screen
      preset='auto'
      safeAreaEdges={['top']}
      backgroundColor={route.params.family || route.params.premium ? colors.background : colors.block}
      header={
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 56,
          }}
        >
          <Logo
            preset={isDark ? 'locker-premium' : 'locker-premium-dark'}
            style={{ height: 32, width: 152 }}
          />
          <Icon icon="x-circle" onPress={() => navigation.goBack()} disabled={processPayment} />
        </View>
      }
      contentContainerStyle={{
        flex: 1
      }}
    >
      <Content />
    </Screen>
  )
})

const styles = StyleSheet.create({
  payment: {
    borderRadius: 15,
    flex: 1,
    marginTop: 20,
    width: '100%',
  },
  segment: {
    alignItems: 'center',
    borderRadius: 6,
    flexDirection: 'row',
    height: 32,
    justifyContent: 'space-between',
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: 6,
    margin: 2,
    padding: 2,
    width: '49%',
  },
  shadow: {
    elevation: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
})
