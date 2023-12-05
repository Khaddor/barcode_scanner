import React, { useState, useEffect } from "react";
import { Text, View, Image, FlatList } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { db } from "../db";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import CheckoutScreen from "./CheckoutScreen";
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";

const stripePK = Constants.expoConfig.extra.stripePK;
type Item = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

function PanierItem({
  item,
  decreaseQuantity,
  increaseQuantity,
}: {
  item: Item;
  decreaseQuantity: (itemId: number, itemPrice: number) => void;
  increaseQuantity: (itemId: number, itemPrice: number) => void;
}) {
  const { containerStyle, imageStyle, textStyle, counterStyle, priceStyle } =
    styles;

  return (
    <View style={containerStyle}>
      <AntDesign
        name="scan1"
        size={45}
        color="gray"
        style={imageStyle}
      />

      <View style={textStyle}>
        <Text>{item.name}</Text>
        <View style={priceStyle}>
          <Text style={styles.price}>${item.price}</Text>
        </View>
      </View>

      <View style={counterStyle}>
        <Icon.Button
          name="ios-remove"
          size={15}
          color="#fff"
          backgroundColor="rgba(255, 255, 255, 0)"
          style={{
            color: styles.darkText,
            borderRadius: 15,
            backgroundColor: "gray",
            height: 30,
            width: 30,
          }}
          iconStyle={{ marginRight: 0 }}
          onPress={() => {
            decreaseQuantity(item.id, item.price);
          }}
        />

        <Text>{item.quantity}</Text>

        <Icon.Button
          name="ios-add"
          size={15}
          backgroundColor="rgba(255, 255, 255, 0)"
          style={{
            color: styles.darkText,
            borderRadius: 15,
            backgroundColor: "red",
            height: 30,
            width: 30,
          }}
          iconStyle={{ marginRight: 0 }}
          onPress={() => {
            increaseQuantity(item.id, item.price);
          }}
        />
      </View>
    </View>
  );
}

export default function Panier() {
  const [cartItems, setCartItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);

  const [checkoutTotalJson, setCheckoutTotalJson] = useState<any[]>([
    { id: 1, amount: 100 },
  ]);

  useEffect(() => {
    if (checkoutTotalJson.length > 0) {
      setShowCheckout(true);
    }
  }, [checkoutTotalJson]);

  useEffect(() => {
    setShowCheckout(false);
    const newCheckoutTotalJson = cartItems.map((item) => ({
      id: item.itemId,
      amount: item.quantity * 100,
    }));

    console.log("New Checkout Total JSON:", newCheckoutTotalJson);

    setCheckoutTotalJson(newCheckoutTotalJson);
  }, [cartItems]);

  useFocusEffect(
    React.useCallback(() => {
      db.transaction(
        (tx) => {
          try {
            tx.executeSql("SELECT * FROM Panier", [], (_, { rows }) => {
              const cartData = rows._array;
              setCartItems(cartData);
              console.log("Data Fetched Successfully", cartItems);
              // Calculate and set the initial total
              const initialTotal = cartData.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
              );
              setTotal(initialTotal);
            });
          } catch (error) {
            console.error("Error while executing SQL:", error);
          }
        },
        (error) => {
          console.error("Transaction error:", error);
        }
      );
    }, [])
  );
  const decreaseQuantity = (itemId: number, itemPrice: number) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE Panier SET quantity = quantity - 1 WHERE itemId = ?",
        [itemId],
        (_, result) => {
          // Update the local state with the updated cart items
          const updatedItems = cartItems.map((item) => {
            if (item.itemId === itemId) {
              if (item.quantity - 1 === 0) {
                // If quantity becomes 0, remove the item from the database
                tx.executeSql(
                  "DELETE FROM Panier WHERE itemId = ?",
                  [itemId],
                  () => {
                    console.log("Item removed from the database.");
                  },
                  (error) => {
                    console.error(
                      "Error removing item from the database:",
                      error
                    );
                  }
                );
              }
              return {
                ...item,
                quantity: item.quantity - 1,
              };
            }
            return item;
          });
          setTotal(total - itemPrice); // Update the total price
          setCartItems(updatedItems);
        },
        (error) => {
          console.error("Error decreasing quantity:", error);
        }
      );
    });
  };

  const increaseQuantity = (itemId: number, itemPrice: number) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE Panier SET quantity = quantity + 1 WHERE itemId = ?",
        [itemId],
        (_, result) => {
          // Update the local state with the updated cart items
          const updatedItems = cartItems.map((item) => {
            if (item.itemId === itemId) {
              return {
                ...item,
                quantity: item.quantity + 1,
              };
            }
            return item;
          });
          setCartItems(updatedItems);
          setTotal(total + itemPrice); // Update the total price
        },
        (error) => {
          console.error("Error increasing quantity:", error);
        }
      );
    });
  };

  const clearCart = () => {
    db.transaction(
      (tx) => {
        // Drop the existing panier table
        tx.executeSql(
          "DROP TABLE IF EXISTS Panier",
          [],
          () => {
            console.log("Cart table dropped.");

            // Recreate the panier table with the same structure
            tx.executeSql(
              "CREATE TABLE IF NOT EXISTS Panier (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, itemId INTEGER, quantity INTEGER)",
              [],
              () => {
                console.log("Cart table recreated.");

                setCartItems([]); // Clear the local state
              },
              (error) => {
                console.error("Error recreating cart table:", error);
              }
            );
          },
          (error) => {
            console.error("Error dropping cart table:", error);
          }
        );
      },
      (error) => {
        console.error("Transaction Error", error);
      }
    );
  };

  return (
    <>
      {cartItems.length <= 0 ? (
        <View style={styles.noDataMessageContainer}>
          <AntDesign name="exclamationcircle" size={35} color="gray" />
          <Text style={styles.noDataMessageText}>No Item Added </Text>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.itemContainer}>
            <FlatList
              data={cartItems}
              renderItem={({ item, index }) => (
                <PanierItem
                  item={item}
                  index={index}
                  decreaseQuantity={decreaseQuantity}
                  increaseQuantity={increaseQuantity}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
          <View style={styles.containerFooter}>
            <View style={styles.totalContainer}>
              <View style={styles.goodsStyle}>
                <Icon name="ios-cart" size={20} />
                <Text>Panier</Text>
              </View>

              <View style={styles.totalStyle}>
                <Text>Total -</Text>
                <Text>${total}</Text>
              </View>
            </View>
            <View style={styles.footerButton}>
              <View style={styles.close}>
                <Text onPress={clearCart} style={{ color: "#fff" }}>
                  Vider Panier
                </Text>
              </View>

              <View style={styles.checkoutButtonStyle}>
                {!showCheckout ? (
                  <Text>none</Text>
                ) : (
                  <StripeProvider
                    publishableKey={stripePK}
                    merchantIdentifier="merchant.com.example"
                  >
                    <CheckoutScreen
                      items={checkoutTotalJson}
                      clearCart={clearCart}
                      total={total}
                    />
                  </StripeProvider>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

const styles = {
  container: {
    flex: 0.91,
  },
  itemContainer: {
    flex: 4,
  },
  containerStyle: {
    flexDirection: "row",
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#e2e2e2",
    padding: 10,
    paddingLeft: 15,
    backgroundColor: "#fff",
  },
  noDataMessageText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 50,
    color: "gray",
  },
  noDataMessageContainer: {
    marginTop: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    color: "gray",
  },
  lastItemStyle: {
    flexDirection: "row",
    flex: 1,
    padding: 10,
    paddingLeft: 15,
    backgroundColor: "#fff",
  },
  imageStyle: {
    width: 50,
    height: 50,
    marginRight: 20,
  },
  textStyle: {
    flex: 2,
    justifyContent: "center",
  },
  price: {
    color: "white",
    fontSize: 13,
  },
  priceStyle: {
    backgroundColor: "green",
    width: 40,
    alignItems: "center",
    marginTop: 3,
    borderRadius: 3,
  },
  counterStyle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  containerFooter: {
    backgroundColor: "#DCDCDC",
    flex: 1,
    paddingRight: 15,
    paddingLeft: 15,
    borderTopWidth: 1,
    borderColor: "#e2e2e2",
  },
  footerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
  },
  close: {
    backgroundColor: "#7f8c8d",
    padding: 10,
    paddingRight: 30,
    paddingLeft: 30,
    borderRadius: 3,
  },
  checkoutButtonStyle: {
    backgroundColor: "#f39c12",
    padding: 10,
    paddingRight: 60,
    paddingLeft: 60,
    borderRadius: 3,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
  },
  goodsStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  basketContainerStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#e2e2e2",
    backgroundColor: "#DCDCDC",
  },
  bagsTextStyle: {
    fontSize: 12,
  },
  priceTextStyle: {
    fontSize: 12,
  },
};
