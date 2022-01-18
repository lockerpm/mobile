import { initStripe } from "@stripe/stripe-react-native";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, Alert } from 'react-native';
// import { fetchPublishableKey } from "../../../../../utils/payment/helpers";



interface Props {
    paymentMethod?: string;
    onInit?(): void;
}

async function fetchPublishableKey(
    paymentMethod?: string
): Promise<string | null> {
    try {
        const response = await fetch(
            `http://192.168.1.62:4242/stripe-key?paymentMethod=${paymentMethod}`
        );

        const { publishableKey } = await response.json();
        console.log(publishableKey)
        return publishableKey;
    } catch (e) {
        console.warn('Unable to fetch publishable key. Is your server running?');
        Alert.alert(
            'Error',
            'Unable to fetch publishable key. Is your server running?'
        );
        return null;
    }
}

const PaymentScreen: React.FC<Props> = ({
    paymentMethod,
    children,
    onInit,
}) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initialize() {
            const publishableKey = await fetchPublishableKey(paymentMethod);
            if (publishableKey) {
                await initStripe({
                    publishableKey,
                    merchantIdentifier: 'merchant.com.cystack.locker',
                    // urlScheme:
                    //   paymentMethod === 'wechat_pay' ? undefined : 'stripe-example',
                    // setUrlSchemeOnAndroid: true,
                });
                setLoading(false);
                onInit?.();
            }
        }
        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return loading ? (
        <ActivityIndicator size="large" style={StyleSheet.absoluteFill} />
    ) : (
        <ScrollView
            accessibilityLabel="payment-screen"
            style={styles.container}
            keyboardShouldPersistTaps="always"
        >
            {children}
            {/* eslint-disable-next-line react-native/no-inline-styles */}
            <Text style={{ opacity: 0 }}>appium fix</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white", // need update to set dark theme
        paddingTop: 20,
        paddingHorizontal: 16,
    },
});

export default PaymentScreen;

