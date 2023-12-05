import { openDatabase } from "expo-sqlite";

const db = openDatabase("barCode.db");

// Initialize the database and create the "panier" table if it doesn't exist
const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS Panier (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, itemId INTEGER, quantity INTEGER)",
      [],
      () => {
        console.log('Table "Panier" created successfully.');
      },
      (error) => {
        console.error('Error creating the "Panier" table:', error);
      }
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS Achats (id INTEGER PRIMARY KEY AUTOINCREMENT, purchaseDate TEXT, price REAL)",
      [],
      () => {
        console.log('Table "Achats" created successfully.');
      },
      (error) => {
        console.error('Error creating the "Achats" table:', error);
      }
    );
  });
};

export { db, initDatabase };
