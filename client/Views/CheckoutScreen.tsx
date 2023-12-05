import { useStripe } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { Alert, Text, Button, SafeAreaView, View, StyleSheet, TouchableOpacity } from "react-native";

export default function CheckoutScreen() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [loading, setLoading] = useState(false);
    const [paymentIntentId, setPaymentIntentId] = useState<string>("");

    const apiUrl = Constants.expoConfig.extra.apiUrl;

    const userId = "cus_OsUciYAvdb9dkM";
    const items = [
        {
            "id": 1,
            "amount": 2
        }
    ];

    const fetchPaymentSheetParams = async () => {
        const response = await fetch(`${apiUrl}/payments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "pending_items": items,
                "customer_id": userId
            })
        });

        const { paymentIntent, ephemeralKey, customer } = await response.json();

        return {
            paymentIntent,
            ephemeralKey,
            customer,
        };
    };

    const initializePaymentSheet = async () => {
        const {
            paymentIntent,
            ephemeralKey,
            customer,
        } = await fetchPaymentSheetParams();

        const { error } = await initPaymentSheet({
            merchantDisplayName: "Example, Inc.",
            customerId: customer,
            customerEphemeralKeySecret: ephemeralKey,
            paymentIntentClientSecret: paymentIntent,
            allowsDelayedPaymentMethods: false,
        });

        if (!error) {
            setPaymentIntentId(paymentIntent);
            setLoading(true);
        }
    };

    const openPaymentSheet = async () => {
        const { error } = await presentPaymentSheet();

        if (error) {
            Alert.alert(`Error code: ${error.code}`, error.message);
        } else {
            const paymentIntent = `pi_${paymentIntentId.split("_")[1]}`;
            const response = await fetch(`${apiUrl}/payments/check/${paymentIntent}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "customer_id": userId
                })
            });

            if (response.status == 200) Alert.alert('Success', 'Your order is confirmed!');
        }
    };

    useEffect(() => {
        initializePaymentSheet();
    }, []);

   return (
          <SafeAreaView style={styles.container}>
              <View style={styles.topContent}>
                  <Text style={styles.paymentText}>Payment</Text>
              </View>
              <View style={styles.bottomContent}>
                  {/* Your content here */}
              </View>
              <TouchableOpacity
                  style={styles.checkoutButton}
                  disabled={!loading}
                  onPress={openPaymentSheet}
              >
                  <Text style={styles.buttonText}>Checkout</Text>
              </TouchableOpacity>
          </SafeAreaView>
      );
  }

  const styles = StyleSheet.create({
      container: {
          flex: 1,
      },
      topContent: {
          flex: 0.2,
          justifyContent: 'center', // Center the text vertically
          alignItems: 'center', // Center the text horizontally
      },
      bottomContent: {
          flex: 1,
          justifyContent: 'center', // Center your content vertically
          alignItems: 'center', // Center your content horizontally
      },
      paymentText: {
          fontSize: 30,
      },
      checkoutButton: {
          backgroundColor: '#3a86ff',
          marginBottom: 10,
          marginLeft:5,
          marginRight:5,
          padding: 10,
          borderRadius: 5,
          alignItems: 'center',
          justifyContent: 'center',
      },
      buttonText: {
          color: 'white',
          fontSize: 18,
      },
  });