import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import {
  ApplePayButton,
  useApplePay,
  ApplePay,
} from '@stripe/stripe-react-native';
import { PlanSnapshot } from '../../../../../models';
import PaymentScreen from './payment-screen';

interface Props {
  plan: PlanSnapshot
}

export const ApplePayScreen: React.FC<Props> = ({plan}) => {
    
    console.log(plan.name);
    
  const [cart, setCart] = useState<ApplePay.CartSummaryItem[]>([
    { label: 'Premium', amount: '12.75', type: 'final' },
    { label: 'Locker Monthly', amount: '12.75', type: 'final' }, // Last item in array needs to reflect the total.
  ]);

  const { presentApplePay, confirmApplePayPayment, isApplePaySupported } = useApplePay();

  const fetchPaymentIntentClientSecret = async () => {
    const response = await fetch(`http://192.168.1.62:4242/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currency: 'usd',
        items: cart,
        force3dSecure: true,
      }),
    });
    const { clientSecret } = await response.json();

    return clientSecret;
  };

  const pay = async () => {
    const { error, paymentMethod } = await presentApplePay({
      cartItems: cart,
      country: 'US',
      currency: 'USD',
      // shippingMethods,
      requiredShippingAddressFields: [
        'emailAddress',
      ],
      // requiredBillingContactFields: ['phoneNumber', 'name'],
      jcbEnabled: true,
    });

    if (error) {
      Alert.alert(error.code, error.message);
    } else {
      // console.log(JSON.stringify(paymentMethod, null, 2));
      const clientSecret = await fetchPaymentIntentClientSecret();

      const { error: confirmApplePayError } = await confirmApplePayPayment(
        clientSecret
      );

      if (confirmApplePayError) {
        Alert.alert(confirmApplePayError.code, confirmApplePayError.message);
      } else {
        Alert.alert(
          'Success', 
          'The payment was confirmed successfully!',
          [
            { text: "OK", onPress: () => console.log("OK Pressed") }
          ]
        );
      }
    }
  };

  return (
    <PaymentScreen>
      {isApplePaySupported && (
        <ApplePayButton
          onPress={pay}
          type="plain"
          buttonStyle="black"
          borderRadius={4}
          style={styles.payButton}
        />
      )}
    </PaymentScreen>
  );
}

const styles = StyleSheet.create({
  payButton: {
    width: '50%',
    height: 50,
    marginTop: 60,
    alignSelf: 'center',
  },
});
