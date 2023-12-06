import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";
import { initDatabase } from "../db";

const db = SQLite.openDatabase("bareCode.db");

const HomePage = ({ navigation }) => {
  useEffect(() => {
    initDatabase();
  }, []);

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BarCode Scanner </Text>

      <TouchableOpacity
        style={[styles.buttonContainer, { backgroundColor: "#3498db" }]}
        onPress={() => navigateToScreen("Scan")}
      >
        <FontAwesome name="barcode" size={24} color="white" />
        <Text style={[styles.buttonText, { color: "white" }]}>Scanner un Item</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.buttonContainer, { backgroundColor: "#2ecc71" }]}
        onPress={() => navigateToScreen("Panier")}
      >
        <FontAwesome name="shopping-cart" size={24} color="white" />
        <Text style={[styles.buttonText, { color: "white" }]}>Panier</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.buttonContainer, { backgroundColor: "#e74c3c" }]}
        onPress={() => navigateToScreen("Historique")}
      >
        <FontAwesome name="history" size={24} color="white" />
        <Text style={[styles.buttonText, { color: "white" }]}>Mes Achats</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    width: "80%",
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 18,
  },
});

export default HomePage;
