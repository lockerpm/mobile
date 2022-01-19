import React, { createContext, useState, useEffect, useCallback, useRef, useContext } from 'react';
import {
  Alert,
  EmitterSubscription,
  Platform,
  StyleSheet,
  Linking,
  ActivityIndicator,
  AppState,
  View
} from 'react-native';
import { Layout, Header } from "../../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../../theme"
import { useMixins } from "../../../../../services/mixins"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../../models"
import RNIap, {
  InAppPurchase,
  SubscriptionPurchase,
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
  Subscription,
  PurchaseError,
} from 'react-native-iap';

import Plan from "./plan-item"
import { color } from 'react-native-reanimated';


let purchaseUpdateSubscription: EmitterSubscription;
let purchaseErrorSubscription: EmitterSubscription;


const itemSubs = Platform.select(({
  ios: [
    "com.cystack.locker.family",
    "com.cystack.locker.premium"
  ],
  android: [
    "com.cystack.locker.premium"
  ]
}))

interface Props {
  children: JSX.Element | Array<JSX.Element>;
}

const IAPContext = createContext({
  isSubscription: false,
  subscription: undefined,
  showPurchase: () => { },
});


export const PlanScreen = observer(function PlanScreen() {

  const navigation = useNavigation();
  const { translate, notify, color } = useMixins();


  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [isSubscription, setIsSubscription] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<Subscription[]>([]);


  const _checkReceipt = async () => {
    // const isValidated = await checkReceipt();

    // setIsSubscription(isValidated);
    // setTimeout(() => {
    //   SplashScreen.hide();
    // }, 1000);
  };

  const _requestSubscription = (subscription) => {
    setShowLoading(true);
    if (subscription) {
      RNIap.requestSubscription(subscription.productId);
    }
  };

  const _restorePurchases = () => {
    setShowLoading(true);
    RNIap.getAvailablePurchases()
      .then((purchases) => {
        console.debug('restorePurchases');
        let receipt = purchases[0].transactionReceipt;
        if (Platform.OS === 'android' && purchases[0].purchaseToken) {
          receipt = purchases[0].purchaseToken;
        }
        // AsyncStorage.setItem('receipt', receipt);
        setShowLoading(false);
        setIsSubscription(true);
        Alert.alert(
          'restore successful',
          'you have successfully restored your purchase history',
          [{
            text: 'ok', onPress: () => console.log("OK")
          }],
        );
      })
      .catch((err) => {
        console.debug('restorePurchases');
        console.error(err);
        setShowLoading(false);
        setIsSubscription(false);
        // AsyncStorage.removeItem('receipt');
        Alert.alert('restore failed', 'restore failed reason');
      });
  };

  const _initIAP = useCallback(async (): Promise<void> => {
    RNIap.clearProductsIOS();

    try {
      const result = await RNIap.initConnection();
      if (Platform.OS === 'android') {
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      } else {
        await RNIap.clearTransactionIOS();
      }
      if (result === false) {
        Alert.alert("couldn't get in-app-purchase information");
        return;
      }
    } catch (err) {
      console.debug('initConnection');
      console.error(err.code, err.message);
      Alert.alert('fail to get in-app-purchase information');
    }

    purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: InAppPurchase | SubscriptionPurchase) => {
        console.debug('purchaseUpdatedListener');
        setShowLoading(false);
        // setTimeout(() => {
        //   actionSheetRef.current?.close();
        // }, 400);
        const receipt =
          Platform.OS === 'ios' ? purchase.transactionReceipt : purchase.purchaseToken;

        if (receipt) {
          try {
            finishTransaction(purchase)
              .then(() => {
                // AsyncStorage.setItem('receipt', receipt);
                setIsSubscription(true);
              })
              .catch(() => {
                setIsSubscription(false);
                Alert.alert(
                  'purchase is failed',
                  'the purchase is failed',
                );
              });
          } catch (ackErr) {
            console.warn('ackErr', ackErr);
          }

        }
      }
    );
    purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.debug('purchaseErrorListener');
      console.error(error);
      setShowLoading(false);
      if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert('purchase is failed', 'the purchase is failed');
      }
    });

    const subscriptions = await RNIap.getSubscriptions(itemSubs);

    console.log(subscriptions)
    setSubscription(subscriptions);

  }, []);

  const handleAppStateChange = (nextAppState: string): void => {
    if (nextAppState === 'active') {
      _checkReceipt();
    }
  };

  useEffect(() => {
    _initIAP();
    _checkReceipt();
    AppState.addEventListener('change', handleAppStateChange);

    return (): void => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      if (handleAppStateChange) {
        AppState.removeEventListener('change', handleAppStateChange);
      }
    };
  }, []);


  // const planFeatures = {
  //   "free" : ["Secure passwords and data", "Auto-fill on browsers and mobile devices", "Generate strong passwords and 2-factor authenticator", "Sync data between devices"],
  //   "premium": ["Unlimited storage", "Data Breach Scanner", "Emergency access", "Share passwords"],
  //   "family": ["Unlimited storage", "Data Breach Scanner", "Emergency access", "Share passwords"]
  // }


  return (
    <Layout
      isContentOverlayLoading={showLoading}
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

    </Layout>
  )


})


const style = StyleSheet.create({
  Container: {

  },
  TitleContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  Title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black"
  },
  SubTitle: {
    fontSize: 16,
    color: "black"
  },
  DescriptionContainer: {
    padding: 24,
    width: "100%",
  },
  Description: {
    fontSize: 14,
    color: "black",
  },
  PurchaseButton: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center"
  },
  PurchaseLabel: {
    color: "black",
    fontSize: 16
  },
  Terms: {
    fontSize: 12,
    color: "white"
  },
  Link: {
    color: "green"
  },
  LoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignContent: "center"
  },
  LoadingBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    opacity: 0.8
  }


})


