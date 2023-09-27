import React, { useState, useEffect, useCallback, FC } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  EmitterSubscription,
  Platform,
} from 'react-native'
import { observer } from 'mobx-react-lite'
import { PremiumBenefits } from './PremiumBenefits'
import { SKU } from './PricePlan.sku'
import { PricePlan } from './PricePlan'
import { FamilyPayment } from './familyPayment/FamilyPayment'

import RNIap, {
  PurchaseError,
  Subscription,
  SubscriptionPurchase,
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap'
import { PremiumPayment } from './premiumPayment/PremiumPayment'
import { AppStackScreenProps } from 'app/navigators'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { Logger } from 'app/utils/utils'
import { translate } from 'app/i18n'
import { Icon, Logo, Screen, Text } from 'app/components/cores'

const IS_IOS = Platform.OS === 'ios'

let purchaseUpdateSubscription: EmitterSubscription
let purchaseErrorSubscription: EmitterSubscription

const subSkus = [SKU.PRE_MON, SKU.PRE_YEAR, SKU.FAM_MON, SKU.FAM_YEAR]

export const PaymentScreen: FC<AppStackScreenProps<'payment'>> = observer((props) => {
  const { colors, isDark } = useTheme()
  const { notifyApiError } = useHelper()
  const navigation = props.navigation
  const route = props.route
  const { user, uiStore } = useStores()

  // -------------------- STATE ----------------------
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
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

  const getSubscription = useCallback(async (): Promise<void> => {
    try {
      await RNIap.initConnection()
      if (!IS_IOS) {
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
      } else {
        if (__DEV__) await RNIap.clearTransactionIOS()
      }

      const subs = await RNIap.getSubscriptions(subSkus)
      setSubscriptions(subs)
    } catch (err) {
      Logger.error({ initConnection: err })
      Alert.alert('Fail to get in-app-purchase information', '', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    }

    purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: SubscriptionPurchase) => {
      if (purchase) {
        const receipt = purchase.transactionReceipt
        if (receipt) {
          try {
            const ackResult = await finishTransaction(purchase)
            Logger.debug({ ackResult: ackResult })
          } catch (ackErr) {
            Logger.error({ ackErr: ackErr })
          }

          let res
          if (IS_IOS) {
            res = await user.purchaseValidation(
              purchase.transactionReceipt,
              purchase.productId,
              purchase.originalTransactionIdentifierIOS
            )
          } else {
            res = await user.purchaseValidation(purchase.purchaseToken, purchase.productId)
          }
          if (res.kind === 'ok') {
            if (res.data.success) {
              await user.loadPlan()
              uiStore.setShowWelcomePremium(true)
              navigation.navigate('welcome_premium')
            } else {
              Alert.alert(translate('manage_plan.verify'), res.data.detail)
            }
          } else {
            notifyApiError(res)
          }
          setProcessPayment(false)
        }
      }
    })

    purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      Logger.error({ purchaseErrorListener: error })
    })
  }, [])

  const purchase = async (productId: string) => {
    setProcessPayment(true)
    if (IS_IOS) {
      RNIap.clearTransactionIOS()
    }

    RNIap.requestSubscription(productId).catch((error) => {
      setProcessPayment(false)
      if (error.code !== 'E_USER_CANCELLED') {
        Logger.debug(JSON.stringify(error))
      }
    })
  }

  // -------------------- EFFECT ----------------------

  useEffect(() => {
    getSubscription()
    return (): void => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove()
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove()
      }
      RNIap.endConnection()
    }
  }, [])

  useEffect(() => {
    getEligibleTrial()
  }, [])

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

  // Render screen
  return (
    <Screen
      contentContainerStyle={{
        backgroundColor:
          route.params.family || route.params.premium ? colors.background : colors.block,
        paddingHorizontal: 0,
      }}
      header={
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Logo
            preset={isDark ? 'locker-premium' : 'locker-premium-dark'}
            style={{ height: 32, width: 152 }}
          />
          <Icon icon="x-circle" onPress={() => navigation.goBack()} disabled={processPayment} />
        </View>
      }
    >
      {route.params.family && (
        <FamilyPayment
          isTrial={isTrial}
          subscriptions={subscriptions}
          onPress={setEnable}
          isProcessPayment={processPayment}
          isEnable={isEnable}
          purchase={purchase}
        />
      )}
      {route.params.premium && (
        <PremiumPayment
          isTrial={isTrial}
          subscriptions={subscriptions}
          onPress={setEnable}
          isProcessPayment={processPayment}
          isEnable={isEnable}
          purchase={purchase}
        />
      )}
      {!route.params.family && !route.params.premium && (
        <View>
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
        </View>
      )}
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
