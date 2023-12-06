import React, { useEffect, useState } from "react";
import { FlatList, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { db } from "../db";
import { useFocusEffect } from "@react-navigation/native";
import { useDarkMode } from './DarkModeContext'; // Import the useDarkMode hook

const PurchaseItem = ({ item }) => {
  const { purchaseItem, statusButton, purchaseDetails, dateText, text, priceText, price, darkMode, lightText, darkIcon } = styles;
  const { isDarkMode } = useDarkMode();

  return (
    <View style={[ purchaseItem , isDarkMode && styles.darkMode]}>

      <View style={[statusButton, isDarkMode ? darkMode : {}]}>
        <AntDesign name="tags" size={24} color={isDarkMode ? 'white' : 'black'} style={darkIcon} />
      </View>
      <View style={purchaseDetails}>
        <Text style={[dateText, isDarkMode ? lightText : {}]}>{item.formattedDate}</Text>
        <Text style={[text, isDarkMode ? lightText : {}]}>Purchased</Text>
      </View>
      <TouchableOpacity style={[price, isDarkMode && darkMode]}>
        <Text style={priceText}>€{item.price}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function Historique() {
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const { container, darkMode, lightText } = styles;
  const { isDarkMode } = useDarkMode();

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
            },
            (error) => {
              console.error("Problème rencontré lors de récupération des achats:", error);
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
    <View style={[container, isDarkMode && darkMode]}>
      {purchaseHistory.length === 0 ? (
        <Text style={isDarkMode && lightText}>No purchase history available.</Text>
      ) : (
        <FlatList
        style={isDarkMode && lightText}
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
  borderRadius: 10,
  marginBottom: 10,
  borderBottomWidth: 1,
  borderColor: "#000",
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
  darkMode: {
    backgroundColor: "#2c2c2c",
  },
  lightText: {
    color: 'white',
  },
  darkIcon: {
    color: 'white',
  },
});
