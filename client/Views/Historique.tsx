import React, { useEffect, useState } from "react";
import { FlatList, Text, View,Button, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, AntDesign} from "@expo/vector-icons";
import { db } from "../db";
import { useFocusEffect } from "@react-navigation/native";

const PurchaseItem = ({ item }) => (
  <View style={styles.purchaseItem}>
    <View style={styles.statusButton}>
      <AntDesign name="tags" size={24} />
    </View>
    <View style={styles.purchaseDetails}>
      <Text style={styles.dateText}>{item.formattedDate}</Text>
      <Text style={styles.text}>Purchased</Text>
    </View>
    <TouchableOpacity style={styles.price}>
      <Text style={styles.priceText}>€{item.price}</Text>
    </TouchableOpacity>
  </View>
);

export default function Historique() {
  const [purchaseHistory, setPurchaseHistory] = useState([]);


  useFocusEffect(
    React.useCallback(() => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            "SELECT * FROM Achats ORDER BY purchaseDate DESC",
            [],
            (_, { rows }) => {
              const historyData = rows._array.map((item) => ({
                ...item,
                formattedDate: formatPurchaseDate(item.purchaseDate),
              }));
              setPurchaseHistory(historyData);
              console.log(purchaseHistory)
            },
            (error) => {
              console.error("Problème rencontré lors de récupération des achatss:", error);
            }
          );
        },
        (error) => {
          console.error("Transaction error:", error);
        }
      );
    }, [])
  );

  const formatPurchaseDate = (dateString) => {
    const options = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const date = new Date(dateString);
    return date.toLocaleString("en-US", options).replace(",", " -");
  };

  return (
    <View style={styles.container}>
      {purchaseHistory.length === 0 ? (
        <Text>No purchase history available.</Text>
      ) : (
        <FlatList
          data={purchaseHistory}
          renderItem={({ item }) => <PurchaseItem item={item} />}
          keyExtractor={(item) => item.id.toString()}
        />

      )}
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#FFF",
  },
  purchaseItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#EDE7D9",
    borderRadius: 10,
    marginBottom: 10,
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  purchaseDetails: {
    flex: 1,
    paddingHorizontal: 10,
  },
  dateText: {
    fontSize: 16,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  text: {
    fontSize: 12,
  },
  price: {
    backgroundColor: "green",
    width: 50,
    alignItems: "center",
    borderRadius: 4,
  },
});
