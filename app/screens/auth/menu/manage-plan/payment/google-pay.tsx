// import React, { useState } from 'react';
// import { GooglePayButton, useGooglePay } from '@stripe/stripe-react-native';
// import PaymentScreen from './payment-screen';
// import { BASE_URL } from '../../../../../config/constants';
// import { Alert, StyleSheet, View } from 'react-native';


// interface Props {
//   planId: number
// }

// export const GooglePayScreen: React.FC<Props> = ({planId}) => {
//   const {
//     initGooglePay,
//     presentGooglePay,
//     loading,
//     // createGooglePayPaymentMethod,
//   } = useGooglePay();
//   const [initialized, setInitialized] = useState(false);

//   const fetchPaymentIntentClientSecret = async () => {

//     const response = await fetch(`http://192.168.1.62:4242/create-payment-intent`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         currency: 'usd',
//         items: [{ id: planId }],
//         force3dSecure: true,
//         // payment_method_types: ['google']
//       }),
//     });
//     const { clientSecret } = await response.json();

//     console.log(clientSecret)
//     return clientSecret;
//   };

//    // 1. Initialize Google Pay
//    const initialize = async () => {
//     const { error } = await initGooglePay({
//       testEnv: true,
//       merchantName: 'Test',
//       countryCode: 'US',
//       billingAddressConfig: {
//         format: 'FULL',
//         isPhoneNumberRequired: true,
//         isRequired: false,
//       },
//       existingPaymentMethodRequired: true,
//       isEmailRequired: true,
//     });

//     if (error) {
//       Alert.alert(error.code, error.message);
//       return;
//     }
//     setInitialized(true);
//   };

//   const pay = async () => {
//     // 2. Fetch payment intent client secret
//     const clientSecret = await fetchPaymentIntentClientSecret();

//     // 3. Open Google Pay sheet and proceed a payment
//     const { error } = await presentGooglePay({
//       clientSecret,
//       forSetupIntent: false,
//     });

//     if (error) {
//       Alert.alert(error.code, error.message);
//       return;
//     }
//     Alert.alert('Success', 'The payment was confirmed successfully.');
//     setInitialized(false);
//   };

//   /*
//     As an alternative you can only create a paymentMethod instead of confirming the payment.
//   */
//   // const createPaymentMethod = async () => {
//   //   const { error, paymentMethod } = await createGooglePayPaymentMethod({
//   //     amount: 12,
//   //     currencyCode: 'USD',
//   //   });

//   //   if (error) {
//   //     Alert.alert(error.code, error.message);
//   //     return;
//   //   } else if (paymentMethod) {
//   //     Alert.alert(
//   //       'Success',
//   //       `The payment method was created successfully. paymentMethodId: ${paymentMethod.id}`
//   //     );
//   //   }
//   //   setInitialized(false);
//   // };

 
//   return (
//     <PaymentScreen onInit={initialize}>
//       <View style={styles.row}>
//         <GooglePayButton
//           disabled={!initialized || loading}
//           style={styles.payButton}
//           type="pay"
//           onPress={pay}
//         />
//       </View>
//     </PaymentScreen>
//   );
// }

// const styles = StyleSheet.create({
//   row: {
//     marginTop: 30,
//     alignItems: "center"
//   },
//   payButton: {
//     width: 152,
//     height: 40,
//   },
//   standardButton: {
//     width: 90,
//     height: 40,
//   },
// });
