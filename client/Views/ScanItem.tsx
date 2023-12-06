import { Camera } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { db } from '../db';
import { useDarkMode } from './DarkModeContext'; // Import the useDarkMode hook

export default function Scan({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Scanner un Article');
  const [inputField, setInputField] = useState('');
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  const askCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  useEffect(() => {
    askCameraPermission();
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM Panier',
        [],
        (_, { rows }) => {
          const items = rows._array;
          console.log('Articles dans le panier:', items);
        },
        (error) => {
          console.error(
            "Problème rencontré lors de la récupération des articles du Panier:",
            error
          );
        }
      );
    });
  }, []);

  const handleBarCode = ({ type, data }) => {
    setScanned(true);
    setText(data);
    console.log('Type: ' + type + '\nData: ' + data);
  };

  const checkAndUpdateInput = () => {
    console.log(parseInt(text));
    if (parseInt(text) === 1234567890) {
      addItem(1);
    }
  };

  const checkItem = (itemId) => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT COUNT(*) as count FROM Panier WHERE itemId = ?',
            [itemId],
            (_, { rows }) => {
              const count = rows.item(0).count;
              resolve(count > 0);
            },
            (error) => {
              console.error('Produit Non-existant:', error);
              reject(error);
            }
          );
        },
        (error) => {
          console.error('Transaction error:', error);
        }
      );
    });
  };

  const addItem = async (itemId) => {
    try {
      const response = await fetch(`http://172.20.10.4:8080/items/${itemId}`);

      console.log('API Response Status:', response.status);

      if (response.status === 200) {
        const item = await response.json();
        if (item) {
          const isItemInCart = await checkItem(itemId);

          if (isItemInCart) {
            db.transaction(
              (tx) => {
                tx.executeSql(
                  'UPDATE Panier SET quantity = quantity + 1 WHERE itemId = ?',
                  [itemId],
                  (_, result) => {
                    console.log(
                      'Quantité Modifiée avec Succès ',
                      item.name
                    );
                    Alert.alert(
                      'Article ajouté au panier avec Succès'
                    );
                  },
                  (error) => {
                    console.error(
                      "Problème rencontré lors de la mise à jour du Panier:",
                      error
                    );
                  }
                );
              },
              (error) => {
                console.error('Transaction error:', error);
              }
            );
          } else {
            db.transaction(
              (tx) => {
                tx.executeSql(
                  'INSERT INTO Panier (name, price, itemId, quantity) VALUES (?, ?, ?, ?)',
                  [item.name, item.price, itemId, 1],
                  (_, { insertId }) => {
                    console.log(
                      'Article ajouté au panier avec ID:',
                      insertId
                    );
                    Alert.alert(
                      'Article ajouté au panier avec succès'
                    );
                  },
                  (error) => {
                    console.error(
                      "Problème lors de l'ajout de l'article dans le Panier",
                      error
                    );
                  }
                );
              },
              (error) => {
                console.error('Transaction error:', error);
              }
            );
          }
        } else {
          Alert.alert('Article Non-trouvé: ' + itemId);
        }
      } else {
        Alert.alert('Erreur', 'Article non-Trouvé');
      }
    } catch (error) {
      console.error(
        "Problème lors de l'ajout de l'article dans le Panier:",
        error
      );
      Alert.alert('Erreur', "Problème lors de l'ajout de l'article");
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkMode]}>
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navbarIcon}
          onPress={() => navigateToScreen('Panier')}
        >
          <FontAwesome name="shopping-cart" size={24} color="white" />
          <Text style={styles.navbarText}>Panier</Text>
        </TouchableOpacity>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={() => toggleDarkMode()} // Use toggleDarkMode to update dark mode
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            style={styles.toggleSwitch}
          />
        </View>
      </View>

      {hasPermission === false ? (
        <View style={styles.noCameraAccessContainer}>
          <Text style={styles.noCameraAccessText}>
            Pas d'accès à la caméra
          </Text>
          <TouchableOpacity
            style={styles.cameraPermissionButton}
            onPress={() => askCameraPermission()}
          >
            <Text style={styles.cameraPermissionButtonText}>
              Autoriser la caméra
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.cameraContainer}>
            <Camera
              onBarCodeScanned={scanned ? undefined : handleBarCode}
              style={styles.camera}
            />
          </View>
          <Text style={styles.scanResultText}>{text}</Text>
          {scanned && (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => {
                checkAndUpdateInput();
              }}
            >
              <Text style={styles.addToCartButtonText}>
                Ajouter au Panier
              </Text>
            </TouchableOpacity>
          )}
          <TextInput
            style={styles.articleNumber}
            placeholder="ou tapez le numéro d'article"
            keyboardType="numeric"
            onChangeText={(text) => setInputField(text)}
          />
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => {
              addItem(parseInt(inputField));
            }}
          >
            <Text style={styles.addToCartButtonText}>
              Ajouter au Panier
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E4E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkMode: {
    backgroundColor: '#2c2c2c',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: 10,
    right: 20,
  },
  toggleText: {
    color: 'white',
    marginRight: 10,
    fontSize: 18,
  },
  toggleSwitch: {
    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
  },
  noCameraAccessContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCameraAccessText: {
    margin: 10,
    fontSize: 16,
    color: 'white', // Adjust text color for better visibility
    textAlign: 'center',
  },
  scanResultText: {
    fontSize: 18,
    marginTop: 20,
    color: 'white', // Adjust text color for better visibility
    textAlign: 'center',
  },
  cameraContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  articleNumber: {
    marginVertical: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white', // Adjust border color for better visibility
    fontSize: 16,
    color: 'white', // Adjust text color for better visibility
  },
  addToCartButton: {
    backgroundColor: 'tomato',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  addToCartButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  camera: {
    height: 400,
    width: 400,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2ecc71',
    height: 60,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#999',
  },
  navbarIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navbarText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 18,
  },
  cameraPermissionButton: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  cameraPermissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

