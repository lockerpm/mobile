/* eslint-disable react-native/no-unused-styles */
import React, { useState, useEffect, FC } from 'react'
import { View, Alert } from 'react-native'
import { observer } from 'mobx-react-lite'
import { AppStackScreenProps } from 'app/navigators'
import { useTheme } from 'app/services/context'
import { Logger } from 'app/utils/utils'
import { Icon, Logo, Screen } from 'app/components/cores'

import {
  PurchaseError,
  clearTransactionIOS,
  flushFailedPurchasesCachedAsPendingAndroid,
  requestSubscription,
  useIAP,
  withIAPContext,
} from 'react-native-iap'

import { SKU } from './PricePlan.sku'

import { PremiumBenefits } from './PremiumBenefits'
import { PricePlan } from './PricePlan'
import { FamilyPayment } from './familyPayment/FamilyPayment'
import { PremiumPayment } from './premiumPayment/PremiumPayment'
import { IS_IOS } from 'app/config/constants'
import { useStores } from 'app/models'
import { translate } from 'app/i18n'
import { useHelper } from 'app/services/hook'

const subSkus = [SKU.PRE_MON, SKU.PRE_YEAR, SKU.FAM_MON, SKU.FAM_YEAR]

const PaymentScreenContent: FC<AppStackScreenProps<'payment'>> = observer((props) => {
  const { subscriptions, getSubscriptions, currentPurchase, finishTransaction } = useIAP()
  const { user, uiStore } = useStores()
  const { notifyApiError } = useHelper()
  const { colors, isDark } = useTheme()
  const navigation = props.navigation
  const route = props.route

  // -------------------- STATE ----------------------
  // const [ownedSubscriptions, setOwnedSubscriptions] = useState<string[]>([])

  const [processPayment, setProcessPayment] = useState<boolean>(false)

  // -------------------- METHOD ----------------------

  const getSubscription = async () => {
    try {
      if (!IS_IOS) {
        await flushFailedPurchasesCachedAsPendingAndroid()
      } else {
        if (__DEV__) await clearTransactionIOS()
      }

      await getSubscriptions({ skus: subSkus })
    } catch (error) {
      Logger.error({ message: 'handleGetSubscriptions', error })
      Alert.alert('Fail to get in-app-purchase information', '', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack()
          },
        },
      ])
    }
  }

  const purchase = async (
    productId: string
    // offerToken?: string,
  ) => {
    // if (isPlay && !offerToken) {
    //   console.warn(
    //     `There are no subscription Offers for selected product (Only requiered for Google Play purchases): ${productId}`,
    //   );
    // }
    console.log(productId)
    setProcessPayment(true)
    if (IS_IOS) {
      await clearTransactionIOS()
    }

    try {
      await requestSubscription({
        sku: productId,
        // ...(offerToken && {
        //   subscriptionOffers: [{ sku: productId, offerToken }],
        // }),
      })
    } catch (error) {
      setProcessPayment(false)
      if (error instanceof PurchaseError) {
        Logger.error({ message: `[${error.code}]: ${error.message}`, error })
      } else {
        Logger.error({ message: 'handleBuySubscription', error })
      }
    }
  }

  // -------------------- EFFECT ----------------------
  const checkCurrentPurchase = async () => {
    try {
      if (currentPurchase?.productId) {
        console.log(currentPurchase?.productId, '----')
        await finishTransaction({
          purchase: currentPurchase,
          // isConsumable: true,
        })

        // setOwnedSubscriptions((prev) => [...prev, currentPurchase?.productId])
        if (currentPurchase.transactionReceipt) {
          console.log('--1111--')
          let res
          if (IS_IOS) {
            res = await user.purchaseValidation(
              currentPurchase.transactionReceipt,
              currentPurchase.productId,
              currentPurchase.originalTransactionIdentifierIOS
            )
          } else {
            res = await user.purchaseValidation(
              currentPurchase.purchaseToken,
              currentPurchase.productId
            )
          }
          console.log(res)
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
        }
        console.log('2222')

        setProcessPayment(false)
      }
    } catch (error) {
      setProcessPayment(false)
      if (error instanceof PurchaseError) {
        Logger.error({ message: `[${error.code}]: ${error.message}`, error })
      } else {
        Logger.error({ message: 'handleBuyProduct', error })
      }
    }
  }

  useEffect(() => {
    getSubscription()
  }, [])

  useEffect(() => {
    checkCurrentPurchase()
  }, [currentPurchase, finishTransaction])

  // ------------------ RENDER ----------------------

  const Content = () => {
    if (route.params.family)
      return <FamilyPayment isProcessPayment={processPayment} purchase={purchase} />
    if (route.params.premium)
      return <PremiumPayment isProcessPayment={processPayment} purchase={purchase} />

    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <PremiumBenefits />

        <PricePlan
          subscriptions={subscriptions}
          isProcessPayment={processPayment}
          purchase={purchase}
        />
      </View>
    )
  }

  return (
    <Screen
      preset="auto"
      safeAreaEdges={['top']}
      backgroundColor={
        route.params.family || route.params.premium ? colors.background : colors.block
      }
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
        flex: 1,
      }}
    >
      <Content />
    </Screen>
  )
})

export const PaymentScreen = withIAPContext(PaymentScreenContent)
