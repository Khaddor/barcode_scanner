import { useStripe } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import { Alert, Text, Button, SafeAreaView, View } from "react-native";
import { db } from "../db";

export default function CheckoutScreen({ items, clearCart, total }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");

  const apiUrl = Constants.expoConfig.extra.apiUrl;
  const userId = "cus_OsUciYAvdb9dkM";
  console.log("items :", items);
  const itemss = [
    {
      id: 1,
      amount: 100,
    },
  ];

  const fetchPaymentSheetParams = async () => {
    const response = await fetch(`${apiUrl}/payments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pending_items: items,
        customer_id: userId,
      }),
    });

    const { paymentIntent, ephemeralKey, customer } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    const { paymentIntent, ephemeralKey, customer } =
      await fetchPaymentSheetParams();

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
      const response = await fetch(
        `${apiUrl}/payments/check/${paymentIntent}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer_id: userId,
          }),
        }
      );

      if (response.status == 200) {
        const currentDate = new Date(); // Get the current date and time
        const formattedDate = currentDate.toISOString();
        Alert.alert("Success", "Your order is confirmed!");
        clearCart();
        db.transaction(
          (tx) => {
            tx.executeSql(
              "INSERT INTO Achats (purchaseDate, price) VALUES (?, ?)",
              [formattedDate, total],
              (_, result) => {
                console.log("Data inserted successfully into Achats table.");
              },
              (error) => {
                console.error("Error inserting data into Achats table:", error);
              }
            );
          },
          (error) => {
            console.error("Transaction Error", error);
          }
        );
      }
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <SafeAreaView>
      {!loading ? (
        <Text style={styles.text}>loading</Text>
      ) : (
        <Text
          style={styles.text}
          disabled={!loading}
          onPress={openPaymentSheet}
        >
          Checkout
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = {
  text: {
    color: "white",
  },
};
