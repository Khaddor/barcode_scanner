import React, { useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
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
      <Text style={styles.title}>BarCode Scanner APP</Text>

       <View style={styles.buttonContainer}>
         <Button title="Scanner un Item" onPress={() => navigateToScreen("Scan")} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Checkout"
          onPress={() => navigateToScreen("Checkout")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", // Align items at the top of the screen
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold", // Add bold style
    color: "blue", // Change text color to blue
    textAlign: "center", // Center-align text
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 10,
    width: "80%",
  },
});

export default HomePage;
