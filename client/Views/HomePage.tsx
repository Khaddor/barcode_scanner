import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useDarkMode } from './DarkModeContext';
import { Appearance } from 'react-native-appearance';
import * as SQLite from "expo-sqlite";
import { initDatabase } from '../db';

const db = SQLite.openDatabase('bareCode.db');

const HomePage = ({ navigation }) => {
  useEffect(() => {
    initDatabase();
  }, []);

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  const { isDarkMode, toggleDarkMode } = useDarkMode(); // Use the useDarkMode hook

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#2c3e50' : 'white' },
      ]}
    >
      <View style={styles.topRightContainer}>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
        />
        <FontAwesome
          name={isDarkMode ? 'moon-o' : 'sun-o'}
          size={24}
          color={isDarkMode ? 'white' : '#2c3e50'}
        />
        <Text
          style={[
            styles.toggleLabel,
            { color: isDarkMode ? 'white' : '#2c3e50' },
          ]}
        >
          Dark Mode
        </Text>
      </View>

      <Text style={[styles.title, { color: isDarkMode ? 'white' : '#2c3e50' }]}>
        BarCode Scanner{' '}
      </Text>

      <TouchableOpacity
        style={[
          styles.buttonContainer,
          { backgroundColor: isDarkMode ? '#3498db' : '#3498db' },
        ]}
        onPress={() => navigateToScreen('Scan')}
      >
        <FontAwesome name="barcode" size={24} color="white" />
        <Text style={[styles.buttonText, { color: 'white' }]}>
          Scanner un Item
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.buttonContainer,
          { backgroundColor: isDarkMode ? '#2ecc71' : '#2ecc71' },
        ]}
        onPress={() => navigateToScreen('Panier')}
      >
        <FontAwesome name="shopping-cart" size={24} color="white" />
        <Text style={[styles.buttonText, { color: 'white' }]}>Panier</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.buttonContainer,
          { backgroundColor: isDarkMode ? '#e74c3c' : '#e74c3c' },
        ]}
        onPress={() => navigateToScreen('Historique')}
      >
        <FontAwesome name="history" size={24} color="white" />
        <Text style={[styles.buttonText, { color: 'white' }]}>
          Mes Achats
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    width: '80%',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 18,
  },
  topRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 0,
    right: 0,
    paddingTop: 20,
    paddingRight: 20,
  },
  toggleLabel: {
    fontSize: 16,
    marginLeft: 5,
  },
});

export default HomePage;
